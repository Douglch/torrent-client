'use strict';
const net = require('net'); // For TCP, we use the “net” module instead of the “dgram” module.
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');
const message = require('./message');

function download(peer, torrent) {
    const socket = net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
      // socket.write(...) write a message here
      socket.write(message.buildHandshake(torrent));
    });

    const queue = [];

    onWholeMsg(socket, msg => 
      // handle response here
      msgHandler(msg, socket, requested, queue);
    );
}

function msgHandler(msg, socket) {
    if (isHandshake(msg)) {
        socket.write(message.buildInterested());
    } else {
        const m = message.parse(msg);
    
        if (m.id === 0) chokeHandler();
        if (m.id === 1) unchokeHandler();
        if (m.id === 4) haveHandler(m.payload, socket, requested, queue);
        if (m.id === 5) bitfieldHandler(m.payload);
        if (m.id === 7) pieceHandler(m.payload, socket, request, queue);
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

function unchokeHandler() { ... }

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
    // If already requested, shfit out of the queue (Avoids duplicate requests)
    if (requested[queue[0]]) {
        queue.shift();
    } else {
        // socket.write(message.buildRequest(pieceIndex));
    }
}

module.exports = torrent => {
    const requested = [];
    tracker.getPeers(torrent, peers => {
        peers.forEach(peer => download(peer, torrent, requested));
    });
};
