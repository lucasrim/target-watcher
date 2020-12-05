# Target Watcher

This project watches targets in your area periodically.

I've set it to ten seconds by default for fears of getting blocked, but have not run into that.

## Installation

```
$ npm install
```

## Usage

```
$ npm start -- -z ZIPCODE
```

You simply need to enter your zipcode, and it should check all stores within a 75 mile radius, limited to 20.

When it does find a hit, it should print it out. I should probably make it more clear when it does have a hit, maybe changing the color of the output or something.
