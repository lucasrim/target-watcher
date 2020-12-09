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

Get your token through there, and place it in a `.env` file, as well as zipcode, and discord id. Your env file should look something like this:

```
DISCORD_TOKEN=yourdiscordtoken
ZIPCODE=yourzipcode
DISCORD_ID=yourdiscordid

```

Then run:

```
$ npm start
```
