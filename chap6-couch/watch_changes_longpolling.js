/***
 * Excerpted from "Seven Databases in Seven Weeks",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material, 
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose. 
 * Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
***/

var
  http = require('http'),
  events = require('events');

/**
 * create a CouchDB watcher based on connection criteria;
 * follows node.js EventEmitter pattern, emits 'change' events.
 */
exports.createWatcher = function(options) {
  
  var watcher = new events.EventEmitter();
  
  watcher.host = options.host || 'localhost';
  watcher.port = options.port || 5984;
  watcher.last_seq = options.last_seq || 0;
  watcher.db = options.db || '_users';
  
  watcher.start = function() {
    
    var
      http_options = {
        host: watcher.host,
        port: watcher.port,
        path:
          '/' + watcher.db + '/_changes' +
          '?feed=longpoll&include_docs=true&since=' + watcher.last_seq
      };
    
    http.get(http_options, function(res) {
      var buffer = '';
      res.on('data', function (chunk) {
        buffer += chunk;
      });
      res.on('end', function() {
        var output = JSON.parse(buffer);
        if (output.results) {
          watcher.last_seq = output.last_seq;
          output.results.forEach(function(change){
            watcher.emit('change', change);
          });
          watcher.start();
        } else {
          watcher.emit('error', output);
        }
      })
    })
    .on('error', function(err) {
      watcher.emit('error', err);
    });
    
  };
  
  return watcher;
  
};

// start watching couch for changes if running as main script
if (!module.parent) {
  exports.createWatcher({
    db: process.argv[2],
    last_seq: process.argv[3]
  })
    .on('change', console.log)
    .on('error', console.error)
    .start();
}

