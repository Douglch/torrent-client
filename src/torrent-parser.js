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

// A piece can be too big for a message. Hence a piece can be divided to blocks, typically of (16384) bytes
module.exports.BLOCK_LEN = Math.pow(2, 14);

module.exports.pieceLen = (torrent, pieceIndex) => {
    const totalLength = bignum.fromBuffer(this.size(torrent)).toNumber();
    const pieceLength = torrent.info['piece length'];

    // Remainder if any
    const lastPieceLength = totalLength % pieceLength;
    const lastPieceIndex = Math.floor(totalLength / pieceLength);

    return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength;
};

module.exports.blocksPerPiece = (torrent, pieceIndex) => {
    const pieceLength = this.pieceLen(torrent, pieceIndex) ;
    return Math.ceil(pieceLength / this.BLOCK_LEN);
};

module.exports.blockLen = (torrent, pieceIndex, blockIndex) => {
    const pieceLength = this.pieceLen(torrent, pieceIndex);

    const lastPieceLength = pieceLength % this.BLOCK_LEN;
    const lastPieceIndex = Math.floor(pieceLength / this.BLOCK_LEN);

    return blockIndex === lastPieceIndex ? lastPieceLength : this.BLOCK_LEN;
}