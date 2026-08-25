import type { RequestHandler } from "express";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { generateToken } from "../config/generateToken.js";
import { User } from "../model/User.js";

export const loginUser: RequestHandler = TryCatch(async (req, res) => {
    const { email } = req.body;

    const rateLimitKey = `otp:ratelimit:${email}`;

    const rateLimit = await redisClient.get(rateLimitKey);

    if (rateLimit) {
        res.status(429).json({
            message: "Too many requests. Please wait before requesting a new OTP",
        });
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;

    await redisClient.set(otpKey, otp, {
        EX: 300,
    });

    await redisClient.set(rateLimitKey, "true", {
        EX: 60,
    });

    const message = {
        to: email,
        subject: "Your OTP code",
        body: `Your OTP is ${otp}. It is valid for 5 minutes`,
    };

    await publishToQueue("send-otp", message);

    res.status(200).json({
        message: "OTP sent to your mail",
    });
});

export const verifyUser: RequestHandler = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;

    if (!email || !enteredOtp) {
        res.status(400).json({
            message: "Email and OTP required",
        });
        return;
    }

    const otpKey = `otp:${email}`;

    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp || storedOtp !== enteredOtp) {
        res.status(400).json({
            message: "Invalid or expired OTP",
        });
        return;
    }

    let user = await User.findOne({ email });

    if (!user) {
        const name = email.slice(0, 8);

        user = await User.create({
            name,
            email,
        });
    }

    await redisClient.del(otpKey);

    const token = generateToken(user);

    res.status(200).json({
        message: "User verified successfully",
        token,
        user,
    });
});