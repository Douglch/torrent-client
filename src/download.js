'use strict';
const net = require('net'); // For TCP, we use the “net” module instead of the “dgram” module.
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');
const message = require('./message');
const Pieces = require("./Pieces");

function download(peer, torrent, pieces) {
    const socket = net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
      // socket.write(...) write a message here
      socket.write(message.buildHandshake(torrent));
    });

    const queue = {choked: true, queue: []};

    onWholeMsg(socket, msg => 
      // handle response here
      msgHandler(msg, socket, requested, queue);
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
function chokeHandler() { ... }

function unchokeHandler(socket, pieces, queue) {
    queue.choked = false;
    requestPiece(socket, pieces, queue);
}

function haveHandler(payload, socket, requested) {


    // requested list will get passed through and how it will be used to determine whether or not a piece should be requested.
    const pieceIndex = payload.readInt32BE(0);
    queue.push(pieceIndex);
    if (queue.length === 1) {
        requestPiece(socket, requested, queue);
    }
}

function bitfieldHandler(payload) { ... }

function pieceHandler(payload) {
  queue.shift();
  requestPiece(socket, requested, queue);
}

function requestPiece(socket, requested, queue) {
    if (queue.choked) return null;

    while (queue.queue.length) {    
      // If already requested, shift out of the queue (Avoids duplicate requests)
      const pieceIndex = queue.shift();
      if (pieces.needed(pieceIndex)) {
        // need to fix this
        socket.write(message.buildRequest(pieceIndex));
        pieces.addRequested(pieceIndex);
        break;
      }
    }
}

module.exports = torrent => {
    const requested = [];
    tracker.getPeers(torrent, peers => {
        // Total number of pieces = buffer length / 20-byte SHA-1 hash
        const Pieces = new Pieces(torrent.info.length / 20);
        peers.forEach(peer => download(peer, torrent, pieces));
    });
};
