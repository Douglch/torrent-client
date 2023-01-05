'use strict';
const net = require('net'); // For TCP, we use the “net” module instead of the “dgram” module.
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');
const message = require('./message');
const Pieces = require("./Pieces");
const Queue = require('./Queue');

function download(peer, torrent, pieces) {
    const socket = net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
      // socket.write(...) write a message here
      socket.write(message.buildHandshake(torrent));
    });

    const queue = new Queue(torrent);

    onWholeMsg(socket, msg => 
      // handle response here
      msgHandler(msg, socket, pieces, queue, torrent, file)
    );
}

function msgHandler(msg, socket, pieces, queue) {
    if (isHandshake(msg)) {
        socket.write(message.buildInterested());
    } else {
        const m = message.parse(msg);
    
        if (m.id === 0) chokeHandler();
        if (m.id === 1) unchokeHandler(socket, pieces, queue);
        if (m.id === 4) haveHandler(m.payload);
        if (m.id === 5) bitfieldHandler(m.payload);
        if (m.id === 7) pieceHandler(m.payload);
    }
} 

function isHandshake(msg) {
    return msg.length === msg.readUInt8(0) + 49 &&
           msg.toString('utf8', 1) === 'BitTorrent protocol';
}
  

function onWholeMsg(socket, callback) {
    let savedBuf = Buffer.alloc(0);
    let handshake = true;
  
    // socket.on gets called multiple times
    socket.on('data', recvBuf => {
      // msgLen calculates the length of a whole message
      const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
      // savedBuf saves the pieces of incomplete messages between rounds of receiving data from the socket.
      // concats the new data with savedBuf and as long as savedBuf is long enough to contain at least one whole message.
      savedBuf = Buffer.concat([savedBuf, recvBuf]);  
  
      while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
        callback(savedBuf.slice(0, msgLen()));
        savedBuf = savedBuf.slice(msgLen());
        handshake = false;
      }
    });
  }
function chokeHandler() {
  socket.end();
}

function unchokeHandler(socket, pieces, queue) {
    queue.choked = false;
    requestPiece(socket, pieces, queue);
}

function haveHandler(socket, pieces, queue, payload) {
    // wait for the piece response to come back before requesting the next piece.
    const pieceIndex = payload.readUInt32BE(0);
    const queueEmpty = queue.length === 0;
    queue.queue(pieceIndex);
    if (queueEmpty) requestPiece(socket, pieces, queue);
}

function bitfieldHandler(payload) {
  // If the peer has the index-0 piece, then the first bit will be a 1. If not it will be 0
  const queueEmpty = queue.length === 0;
  payload.forEach((byte, i) => {
    for (let j = 0; j < 8; j++) {
      /*
      repeatedly dividing by 2 and taking the remainder will convert a base-10 number to a binary number, 
      giving you the digits of the binary number from least to most signifiant bit (right to left).
      */
      if (byte % 2) queue.queue(i * 8 + 7 - j);
      byte = Math.floor(byte / 2);
    }
  });
  if (queueEmpty) requestPiece(socket, pieces, queue);
}

function pieceHandler(socket, pieces, queue, torrent, file, pieceResp) {
  console.log(pieceResp);
  pieces.addReceived(pieceResp);

  const offset = pieceResp.index * torrent.info['piece length'] + pieceResp.begin;
  fs.write(file, pieceResp.block, 0, pieceResp.block.length, offset, () => {});

  if (pieces.isDone()) {
    console.log('DONE!');
    socket.end();
    try { fs.closeSync(file); } catch(e) {}
  } else {
    requestPiece(socket,pieces, queue);
  }
}

function requestPiece(socket, pieces, queue) {
    if (queue.choked) return null;

    while (queue.length()) {
      // If already requested, shift out of the queue (Avoids duplicate requests)
      const pieceBlock = queue.deque();
      if (pieces.needed(pieceBlock)) {
        socket.write(message.buildRequest(pieceBlock));
        pieces.addRequested(pieceBlock);
        break;
      }
    }
}

// module.exports = torrent => {
//     const requested = [];
//     tracker.getPeers(torrent, peers => {
//         // Total number of pieces = buffer length / 20-byte SHA-1 hash
//         const Pieces = new Pieces(torrent.info.length / 20);
//         peers.forEach(peer => download(peer, torrent, pieces));
//     });
// };

module.exports = (torrent, peers) => {
  // write the bytes to file
  tracker.getPeers(torrent, peers => {
    // need to pass torrent now
    const pieces = new Pieces(torrent);
    const file = fs.openSync(path, 'w'); // w for writing to a file
    peers.forEach(peer => download(peer, torrent, pieces, file));
  });
};
