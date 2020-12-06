import yargs from 'yargs';
import dotenv from 'dotenv';
import { Client, User } from 'discord.js';
import { fetchTargetTimeout, Location } from './Target';

const args = yargs.options({
  zipcode: { type: 'string', demandOption: true, alias: 'z' },
  discordId: { type: 'string', demandOption: false, alias: 'u' },
}).argv;

const { zipcode, discordId } = args;

dotenv.config();
const hitMessage = (locations: Location[]): string =>
  `There has been a successful find near you at these locations:
  ${locations.map((location) => location.store_name).join('\n')}
  \nGood Luck!`;

async function startDiscordMode() {
  let discordUser: User;
  const DiscordClient = new Client();
  const onTargetHit = (locations: Location[]): void => {
    discordUser.send(hitMessage(locations));
  };

  DiscordClient.login(process.env.DISCORD_TOKEN);
  DiscordClient.on('ready', () => {
    if (discordId) {
      DiscordClient.users
        .fetch(discordId)
        .then((user) => {
          discordUser = user;
          user.send(
            `Hello! I will be checking on targets in the ${zipcode} area for you!`,
          );
        })
        .then(() => {
          fetchTargetTimeout(10000, 'disk', zipcode, onTargetHit);
          fetchTargetTimeout(10000, 'digital', zipcode, onTargetHit);
        });
    }
  });
}

if (discordId) {
  startDiscordMode();
} else {
  fetchTargetTimeout(10000, 'disk', zipcode, hitMessage);
  fetchTargetTimeout(10000, 'digital', zipcode, hitMessage);
}
