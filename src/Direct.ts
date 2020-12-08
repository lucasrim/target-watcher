import { Client } from 'discord.js';
import puppeteer from 'puppeteer';
import { messageDiscordUser } from './Discord';

const puppeteerOptions: puppeteer.LaunchOptions = {};
const timeout = async () =>
  new Promise((resolve) => {
    setTimeout(() => resolve, 10 * 1000);
  });

const checkDirect = async (
  client: Client,
  browser: puppeteer.Browser,
  page: puppeteer.Page,
): Promise<void> => {
  console.log('Starting Sony Direct');
  messageDiscordUser(client, 'Starting watch for Direct Queue');
  await page.goto(
    'https://direct.playstation.com/en-us/consoles/console/playstation5-console.3005816',
  );

  const soldOutSelector = await page.$('.out-stock-wrpr');

  if (!soldOutSelector) {
    messageDiscordUser(
      client,
      `Playstation Direct Queue is Starting!
      \nDisk: https://direct.playstation.com/en-us/consoles/console/playstation5-console.3005816
      \nDigital: Disk: https://direct.playstation.com/en-us/consoles/console/playstation5-console.3005817`,
    );

    browser.close();
  } else {
    await timeout();
    await page.reload();
    checkDirect(client, browser, page);
  }
};

export const startDirect = async (client: Client) => {
  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  checkDirect(client, browser, page);
};
