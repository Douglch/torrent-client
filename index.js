// run node index.js
'use strict';
const fs = require('fs');
const bencode = require('bencode');
const tracker = require('./tracker');

const torrent = bencode.decode(fs.readFileSync('puppy.torrent')); // returns a buffer, not a string

tracker.getPeers(torrent, peers => {
  console.log('list of peers: ', peers);
});
