'use strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;

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
          const announceReq = buildAnnounceReq(connResp.connectionId);
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
    // ...
  }
  
  function buildConnReq() {
    // ...
  }
  
  function parseConnResp(resp) {
    // ...
  }
  
  function buildAnnounceReq(connId) {
    // ...
  }
  
  function parseAnnounceResp(resp) {
    // ...
  }