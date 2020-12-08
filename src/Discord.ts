import { Client } from 'discord.js';

export const messageDiscordUser = async (
  client: Client,
  message: string,
): Promise<void> => {
  const discordId = process.env.DISCORD_ID as string;

  return client.users
    .fetch(discordId)
    .then((user) => {
      user.send(message);
    })
    .catch((err) => console.log(err));
};

export const startDiscord = async (): Promise<Client> => {
  const discordToken = process.env.DISCORD_TOKEN as string;

  const client = new Client();
  await client.login(discordToken);
  return new Promise((resolve) => resolve(client));
};
