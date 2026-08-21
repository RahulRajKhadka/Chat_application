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

    console.log("RabbitMQ consumer connected");
  } catch (error) {
    console.log("Failed to start rabbitmq consumer", error);
  }
};