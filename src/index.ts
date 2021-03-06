import dotenv from 'dotenv';
import { startDiscord } from './Discord';
import { startDirect } from './Direct';

const start = async () => {
  dotenv.config();

  const discordId = process.env.DISCORD_ID as string;
  const discordToken = process.env.DISCORD_TOKEN as string;
  const zipcode = process.env.ZIPCODE as string;

  const client = await startDiscord();

  if (discordId && discordToken && zipcode) {
    try {
      // await startTarget(client, zipcode);
      await startDirect(client);
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log('Missing `.env` variables.');
    console.log('Required variables: DISCORD_TOKEN, ZIPCODE, DISCORD_ID');
  }
};

start()
