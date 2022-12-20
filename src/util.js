'use strict';

const crypto = require('crypto');

let id = null;

module.exports.genId = () => {
    /*
    ID is generated once. An id is set every time the client loads and should be the same until it’s closed
    */
    if (!id) {
        id = crypto.randomBytes(20);
        Buffer.from('-DT0001-').copy(id, 0);
      }
      return id;
}