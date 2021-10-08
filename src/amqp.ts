import amqplib from 'amqplib';
import { UserController } from './controllers/user.controller';
import { UserDataAccess } from './dataaccess/user.dataaccess';

const amqpURL = process.env.AMQP_URL;

async function produce() {
  const connection = await amqplib.connect(amqpURL, "heartbeat=60");
  const channel = await connection.createChannel();
  const exchange = 'activities_to_followers';
  channel.assertExchange(exchange, 'direct', { durable: true });

  return {
    connection,
    channel,
    exchange,
  };
}

const mqPromise = produce();

async function reactivateConsumers() {
  const users = await UserDataAccess.listAll();
  users.forEach((user) => {
    UserController.createUserQueue(user.username);
  })
}

reactivateConsumers();

export default mqPromise;