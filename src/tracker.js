'use strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;
const crypto = require('crypto'); // For creating a random number for the buffer
const torrentParser = require('./torrent-parser');

module.exports.getPeers = (torrent, callback) => {
    /* dgram.createSocket
    ‘udp4’ - use the normal 4-byte IPv4 address format (e.g. 127.0.0.1).
    ‘udp6’ - the newer IPv6 address format (e.g. FE80:CD00:0000:0CDE:1257:0000:211E:729C) 
    but this format is still rarely used.
    */
    const socket = dgram.createSocket('udp4');
    const url = torrent.announce.toString('utf8');

    udpSend(socket, buildConnReq(), url);

    /*  
    Here we tell the socket how to handle incoming messages. 
    Whenever a message comes back through the socket it will be passed to the callback function.
    In order to send a message through a socket, it must be in the form of a buffer, not a string or number.
    E.g const myMsg = Buffer.from('hello?', 'utf8');
    */
   
    socket.on('message', response => {
        if (respType(response) === 'connect') {
          // 2. receive and parse connect response 
          const connResp = parseConnResp(response);
          // 3. send announce request
          const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
          udpSend(socket, announceReq, url);
        } else if (respType(response) === 'announce') {
          // 4. parse announce response
          const announceResp = parseAnnounceResp(response);
          // 5. pass peers to callback
          callback(announceResp.peers);
        }
      });
}

function udpSend(socket, message, rawUrl, callback= ()=>{}) {
    const url = urlParse(rawUrl);
    /* socket.send
    2nd and 3rd argument specifies the start and end offset of the message buffer
    last argument is a callback function for when the message has finished sending.
    */
    socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(resp) {
    const action = resp.readUInt32BE(0);
    if (action === 0) return 'connect';
    if (action === 1) return 'announce';
  }
  
  function buildConnReq() {
    const buf = Buffer.alloc(16);
    /* connection id
    The reason we have to write in 4 byte chunks, is that there is no method to write a 64 bit integer.
    Actually node.js doesn’t support precise 64-bit integers
    */
    buf.writeUInt32BE(0x417, 0); 
    buf.writeUInt32BE(0x27101980, 4);
    /* action
    This value should always be 0 for the connection request.
    */
    buf.writeUInt32BE(0, 8); 
    /* transaction id
    Generate a random 4-byte buffer
    */
    crypto.randomBytes(4).copy(buf, 12);   
  }
  
  function parseConnResp(resp) {
    return {
      action: resp.readUInt32BE(0),
      transactionId: resp.readUInt32BE(4),
      connectionId: resp.slice(8)
    }
  }
  

  function buildAnnounceReq(connId, torrent, port=6881) {
    // Official spec says that the ports for bittorrent should be between 6881 and 6889.
    const buf = Buffer.allocUnsafe(98);   
    
    // Just follow the announce request format and copy into the buffer :)
    // connection id
    connId.copy(buf, 0);
    // action
    buf.writeUInt32BE(1, 8);
    // transaction id
    crypto.randomBytes(4).copy(buf, 12);
    // info hash
    torrentParser.infoHash(torrent).copy(buf, 16);
    // peerId
    util.genId().copy(buf, 36);
    // downloaded (copying buffer into buffer)
    Buffer.alloc(8).copy(buf, 56);
    // left
    torrentParser.size(torrent).copy(buf, 64);
    // uploaded 
    Buffer.alloc(8).copy(buf, 72);
    // event
    buf.writeUInt32BE(0, 80);
    // ip address
    buf.writeUInt32BE(0, 80);
    // key
    crypto.randomBytes(4).copy(buf, 88);
    // num want (signed)
    buf.writeInt32BE(-1, 92);
    // port
    buf.writeUInt16BE(port, 96);

    return buf;
  }
  
  function parseAnnounceResp(resp) {
    // for grouping n ip and port objects
    function group(iterable, groupSize) {
        let groups = [];
        for (let i = 0; i < iterable.length; i += groupSize) {
          groups.push(iterable.slice(i, i + groupSize));
        }
        return groups;
    }
    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        leechers: resp.readUInt32BE(8),
        seeders: resp.readUInt32BE(12),
        peers: group(resp.slice(20), 6).map(address => {
          return {
            ip: address.slice(0, 4).join('.'),
            port: address.readUInt16BE(4)
          }
        })
      }
  }