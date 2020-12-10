import axios from 'axios';
import { format } from 'date-fns';
import { Client } from 'discord.js';
import open from 'open';
import { messageDiscordUser } from './Discord';

const diskUrl =
  'https://direct.playstation.com/en-us/consoles/console/playstation5-console.3005816';

const digitalUrl =
  'https://direct.playstation.com/en-us/consoles/console/playstation5-console.3005817';

const checkPlaystationDirectRedirect = (client: Client) => {
  axios.get(diskUrl).then((response) => {
    const inQueueIt = response.data.indexOf('queue-it_log');
    if (inQueueIt > 0) {
      messageDiscordUser(
        client,
        `Playstation Direct Queue is Starting!
            \nTime: ${format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss")}
            \nDisk: ${diskUrl}
            \nDigital: ${digitalUrl}`,
      );
      open(diskUrl);
    } else {
      setTimeout(() => {
        console.log('No redirect detected. Trying again...');
        checkPlaystationDirectRedirect(client);
      }, 5000);
    }
  });
};

export const startDirect = async (client: Client) => {
  await messageDiscordUser(
    client,
    `Watching PS5 Direct
    \nCurrent Time: ${format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss")}`,
  );
  checkPlaystationDirectRedirect(client);
};
