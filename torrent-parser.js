'use strict';
const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');
const bignum = require('bignum');

module.exports.open = (filepath) => {
    return bencode.decode(fs.readFileSync(filepath));
};

module.exports.size = torrent => {
    // check for number of files. If multiple files, return sum of each file length from an array of objects, else simply return file length.
    const size = torrent.info.files ?
    torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
    torrent.info.length;
    /* 
    Bignum - File size may be bigger than a 32-bit integer.
    The option {size: 8} tells the function you want to write the number to a buffer of size 8 bytes.
    This is also the buffer size required by the announce request (left).
    */
    return bignum.toBuffer(size, {size: 8});
};
  
module.exports.infoHash = torrent => {
    const info = bencode.encode(torrent.info);
    // bittorrent uses SHA1
    return crypto.createHash('sha1').update(info).digest();
};