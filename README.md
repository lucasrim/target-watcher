# Target Watcher

This project watches targets in your area periodically.

I've set it to ten seconds by default for fears of getting blocked, but have not run into that.

## Installation

```
$ npm install
```

## Usage

### Discord Integration

There is optional discord functionality, it should message you when it finds one.

You'll have to add the bot to a channel you run, you'll also need a discord token which I made through [here](https://discord.com/developers/applications), and roll your own bot, I don't intend on making it some service or anything.

Get your token through there, and place it in a `.env` file. Then run:

```
$ npm start -- -z ZIPCODE -u DISCORD_ID
```

### No Discord Integration

```
$ npm start -- -z ZIPCODE
```

Running that will get it started, and it should notify you when it detects a store nearby with stock by printing logs. Nothing too fancy, but should save you from constantly pressing F5.
