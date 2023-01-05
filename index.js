// run node index.js
'use strict';
const download = require('./src/download');
const torrentParser = require('./src/torrent-parser');

const torrent = torrentParser.open(process.argv[2]); // returns a buffer, not a string

download(torrent, torrent.info.name);
