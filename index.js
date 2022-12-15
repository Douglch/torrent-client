// run node index.js
'use strict';
const fs = require('fs');
const bencode = require('bencode');
const torrent = bencode.decode(fs.readFileSync('puppy.torrent')); // returns a buffer, not a string
console.log(torrent.announce.toString('utf8'));