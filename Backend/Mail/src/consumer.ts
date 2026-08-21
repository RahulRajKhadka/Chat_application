import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let channel: amqp.Channel;

export const startSendOtpConsumer = async () => {
  try {
    const host = process.env.Rabbitmq_Host;
    const username = process.env.Rabbitmq_Username;
    const password = process.env.Rabbitmq_Password;

    if (!host || !username || !password) {
      throw new Error("Missing required RabbitMQ environment variables");
    }

    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: host,
      port: 5672,
      username,
      password,
    });

    channel = await connection.createChannel();

    const queueName = "send-otp";

    await channel.assertQueue(queueName, { durable: true });
    console.log("Mail service consumer started , listening for otp emails");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
              user: process.env.USER,
              pass: process.env.PASSWORD,
            },
          });

          await transporter.sendMail({
            from: "Chat_App",
            to,
            subject,
            text: body,
          });

          console.log(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.log("Failed to send the otp ", error);
        }
      }
    });

    console.log("RabbitMQ consumer connected");
  } catch (error) {
    console.log("Failed to start rabbitmq consumer", error);
  }
};
