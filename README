# BitTorrent client in Node.js +Network Basics

# BitTorrent Trackers

- A special type of server that assists in the communication between peers
- How it works:
    - In P2P file sharing, an end-user PC requests for a certain type of file, portions of requested file in the peers’ machine are sent to the client.
    - The trackers help to track where the file resides in the peers’ machines, peers that has the files, and coordinate efficient transmission and assembly of copied file. After the initial P2P file download is started, P2P connection can continue without the tracker.

![Photo from ResearchGate by Yacine Challal](BitTorrent%20client%20in%20Node%20js%20+Network%20Basics%204a83701d839743a9b8a490d7d267a8e7/Untitled.png)

Photo from ResearchGate by Yacine Challal

## Tracker implementation

1. Send a connect request
2. Get the connect response and extract the connection id (from all peers)
3. Use the connection id to send an announce request - this is where we tell the tracker which files we’re interested in
4. Get the announce response and extract the peers list

## **What is a buffer?**

In node.js a buffer is a container for raw bytes. A byte just means eight bits, and a bit is just a 0 or a 1. A byte might look like 10101010.

### **What does a buffer look like?**

Here’s an example of what a buffer might look like if you console.log it in the terminal.

`<Buffer 02 04 06 08 0a 0c 0e 10>`

(Each of these digits follow hexadecimal numbering system)

### Encoding

From buffer (bytes) to strings:

```jsx
const Buffer= require('buffer').Buffer;

const buf= Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72,
 0x6c, 0x64]);

console.log(buf);
// outputs <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
console.log(buf.toString('utf16le'));
// outputs '敨汬⁯潷汲'
console.log(buf.toString('utf8'));
// outputs 'hello world'
```

Different encodings will translate to different strings. Here you can see the output of reading the buffer above as a string using the ‘utf16le’ and ‘utf8’ encodings.

From strings to buffer (bytes) to strings:

```jsx
const Buffer= require('buffer').Buffer;

console.log(Buffer.from('hello world', 'utf8'));
// outputs <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
```

### Endianness

By far the most common *ordering* of multiple bytes in one number is the **little-endian**, which is used on all Intel processors.

**Little-endian** means storing bytes in order of least-to-most-significant (where the least significant byte takes the first or lowest address), comparable to a common European way of writing dates (e.g., 31 December 2050).

Naturally, **big-endian** is the opposite order, comparable to an ISO date (2050-12-31)

Examples with the number `0x12345678` (i.e. 305 419 896 in decimal):

- *little-endian*: `0x78 0x56 0x34 0x12` (right - left)
- *big-endian*: `0x12 0x34 0x56 0x78` (left - right)

### Using buffers

**Buffer to Strings**

If you want to read or write a string to a buffer, then you can use the `toString`or`from`
methods respectively.

```jsx
const Buffer= require('buffer').Buffer;

const buf= Buffer.from('hello world', 'utf8');

console.log(buf.toString('utf8'));
// outputs 'hello world'
```

**Buffer to Numbers**

If you want to read a number out of the buffer, there is a set of built in methods that specify what [bitlength, encoding, and endianness](https://nodejs.org/api/buffer.html) you’re dealing with. The method names follow the following convention:

- ‘read’ or ‘write’ to indicate the type of operation.
- Followed by either ‘Float’, ‘Double’, ‘Int’, or ‘UInt’ (unsigned int).
- Followed by the bitlength. This isn’t used by floats or doubles since they have an assumed bitlength of 32 and 64 respectively.
- Followed by ‘BE’ or ‘LE’, big-endian and little-endian respectively. This isn’t used by 8 bit integers because endianness is a byte-level property. You can’t order a single byte.

```jsx
const Buffer = require('buffer').Buffer;

// create an empty buffer with length of 4 bytes.
const buf = Buffer.alloc(4);

// write the unsigned 32-bit, big-endian number 123 into the buffer starting// at index 0 of the buffer.
buf.writeUInt32BE(123, 0);

// read the number starting at index 0
console.log(buf.readUInt32BE(0));
// outputs: 123
```

**Buffer Copy function**

```jsx
const Buffer= require('buffer').Buffer;

// create an empty buffer with length of 11 bytes.
const buf= Buffer.alloc(11);

// create two buffers, one that contains 'hello ', the other 'world'.
const word1= Buffer.from('hello ', 'utf8');
const word2= Buffer.from('world', 'utf8');

// copy the word buffers into `buf` at index 0 and 6 respectively.
word1.copy(buf, 0);
word2.copy(buf, 6);

console.log(buf.toString('utf8'));
// outputs 'hello world'
```

### Hashing

Bittorrent uses Secure Hash Algorithm 1 (SHA1), which helps to uniquely identify a torrent. A hashing function returns a fixed length buffer (20-bytes long). An example torrent would output `<Buffer 11 7e 3a 66 65 e8 ff 1b 15 7e 5e c3 78 23 57 8a db 8a 71 2b>`
.

# Sockets

A **network socket** is a software structure within a [network node](https://en.wikipedia.org/wiki/Node_(networking)) of a [computer network](https://en.wikipedia.org/wiki/Computer_network)
that serves as an **endpoint** for sending and receiving data across the network. The structure and properties of a socket are defined by an (API) for the networking architecture. Sockets are created only during the lifetime of a [process](https://en.wikipedia.org/wiki/Process_(computing)) of an application running in the node.

# HTTP, UDP, TCP and Data packets

**Data packets** are bits of information broken into smaller pieces from a whole transmitted through the internet. Once they reach an endpoint, they’ll be reassembled into a whole data. 
Packets are also called “block”, “datagram” or a “frame” depending on the protocol used.

**Hypertext Transfer Protocol (HTTP)** is built on top of **Transmission Control Protocol (TCP)**, slower than **User Datagram Protocol (UDP)** in performance.

UDP is used for trackers as they send small messages (less than 512 bytes), with the caveat that
messages may not be reach its destination, requiring re-requests and resends.

TCP guarantees that data is transferred and files are intact, hence used in transferring of files between peers given their large sizes and requirement to be intact.

## Bittorrent’s UDP Tracker protocol

Link: [http://www.bittorrent.org/beps/bep_0015.html](http://www.bittorrent.org/beps/bep_0015.html)

HTTP protocol contains the following parameters:
info_hash, key, peer_id, port, downloaded, left, uploaded and compact.

All values are also sent in network byte order (big endian),

****************Overhead****************

HTTP vs UDP

- Ethernet: 14 bytes
- IP: 20 bytes
- TCP: 20 bytes
- UDP: 8 bytes

| Protocol | Packets | Non-user | User | Total |
| --- | --- | --- | --- | --- |
| HTTP | 10 | 540 | 247 + 119 + 6 * N = 366 + 6 * N | 906 + 6 * N |
| UDP | 4 | 168 | 16 + 16 + 98 + 20 + 6 * N = 150 + 6 * N | 318 + 6 * N |
| HTTP - UDP | 6 | 372 | 216 | 588 |
| HTTP / UDP | 2.5 | 3.2 | 1.5 | 2.0 |

The UDP tracker protocol uses <50% of the bandwidth the HTTP tracker protocol uses. UDP is stateless, limits to the number of open TCP connections a router or server can handle, do not apply.

## TCP Overview

**3-way Handshake Process**

 Unlike UDP, a connection must first be established.

![Photo from Geeksforgeeks site](BitTorrent%20client%20in%20Node%20js%20+Network%20Basics%204a83701d839743a9b8a490d7d267a8e7/Untitled%201.png)

Photo from Geeksforgeeks site

1. Step 1: Synchronise Sequence Number (SYN) to server
- Client attempts to connect with the server by sending a message to it, setting SYN flag to 1.
- The message also contains a 32-bit number (sequence number).
- Acknowledgement (ACK) flag is set to 0.
**Max number of data segments = Max window size / max segment size**
1. Step 2: SYN-ACK to client
- ACK flag set to 1.
- ACK will indicate the response of the segment it received, based on the SYN.
e.g If sequence number = 500, acknowledgement number = 5001
- Same step 1 process happens from server to client if server wants to connect, though sequence number will be different
1. Step 3: ACK to server
- After receiving SYN from the server, ACK will be sent from client to server, connection will be established and data will begin transmitting.

**Closing a 3-way handshake connection**

- FIN_WAIT_1: Client sends a FIN to server and waits for it to be ACK as well as the server’s FIN.
- CLOSE_WAIT: Server sends an ACK to client and waits for the application process on its end to signal that it’s ready to close. After app closes, it will send the FIN.
- FIN_WAIT_2: Client receives the ACK, and waits for the FIN. After receiving FIN, it will send back an ACK to server.
- LAST_ACK: Server watis for ACK from client before sending a FIN
- TIME_WAIT: The client waits for a period of time equal to double the maximum segment life (MSL) time, to ensure the ACK it sent was received.

![Photo from [http://www.tcpipguide.com/free/t_TCPConnectionTermination-2.htm](http://www.tcpipguide.com/free/t_TCPConnectionTermination-2.htm)](BitTorrent%20client%20in%20Node%20js%20+Network%20Basics%204a83701d839743a9b8a490d7d267a8e7/Untitled%202.png)

Photo from [http://www.tcpipguide.com/free/t_TCPConnectionTermination-2.htm](http://www.tcpipguide.com/free/t_TCPConnectionTermination-2.htm)

# Torrent Pieces

******************************************Piece length property******************************************

This property in a torrent file info tells us how long a piece is in bytes.

E.g
1 piece = 1000 bytes
File size = 12001 bytes
Torrent will contain minimally 13 pieces (Last piece is 1 byte

These pieces are also indexed starting from 0, to identify the piece that we’re sending or receiving. For instance, if a piece at index 1 is requested, we want the second 1000 bytes.
