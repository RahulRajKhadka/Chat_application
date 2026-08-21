import amql from "amqplib";

let channel: amql.Channel;

export const connectRabbitMQ = async () => {
  try {
    const host = process.env.Rabbitmq_Host;
    const username = process.env.Rabbitmq_Username;
    const password = process.env.Rabbitmq_Password;

    if (!host || !username || !password) {
      throw new Error("Missing required RabbitMQ environment variables");
    }

    const connection = await amql.connect({
      protocol: "amqp",
      hostname: host,
      port: 5672,
      username,
      password,
    });

    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");

    return channel;
  } catch (error) {
    console.log("failed to connect to rabbitmq", error);
    throw error;
  }
};

export const getChannel = (): amql.Channel => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized. Call connectRabbitMQ first.");
  }
  return channel;
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("Channel not initialized. Call connectRabbitMQ first.");
    return;
  }

  try {
    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log(`Message sent to queue "${queueName}"`);
  } catch (error) {
    console.log(`failed to publish to queue "${queueName}"`, error);
  }
};