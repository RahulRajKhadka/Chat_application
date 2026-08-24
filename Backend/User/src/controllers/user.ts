import type { RequestHandler } from "express";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";

export const loginUser:RequestHandler= TryCatch(async(req,res)=>{
    const {email}=req.body

    const RateLimitKey=`otp:ratelimit:${email}`
    const rateLimit=await redisClient.get(RateLimitKey)
    if(rateLimit){
        res.status(429).json({
            message:"Too many requests.please wait before requestin new otp",
        })
    }

    const otp=Math.floor(100000 +Math.random()*900000).toString()
    const otpkey=`otp:${email}`;
    await redisClient.set(otpkey,otp,{
        EX:300,
    })

    await redisClient.set(RateLimitKey,"true",{
    EX:60,
    });

    const message={
        to:email,
        subject:"Your otp code",
        body:`Your OTP is ${otp}. It is valid for 5 minutes`
    }

    await publishToQueue("send-otp",message)
    res.status(429).json({
        message:"OTP sent to your mail"
    })
})

