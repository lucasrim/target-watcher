import yargs from 'yargs';
import Discord from 'discord.js';
import { fetchTargetTimeout } from './Target';

const args = yargs.options({
  zipcode: { type: 'string', demandOption: true, alias: 'z' },
}).argv;

fetchTargetTimeout(10000, 'disk', args['zipcode']);
fetchTargetTimeout(10000, 'digital', args['zipcode']);
