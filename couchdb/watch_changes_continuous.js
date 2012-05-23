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
          '?feed=continuous&include_docs=true&since=' + watcher.last_seq
      };
    
    http
      .get(http_options, function(res) {
        
        var
          buffer = "",
          processBuffer = function(){
            
            var pos = buffer.lastIndexOf("\n");
            
            if (pos !== -1) {
              
              buffer
                .substr(0, pos)
                .split("\n")
                .forEach(function(line) {
                  if (line) {
                    var output = JSON.parse(line);
                    watcher.last_seq = output.last_seq || output.seq;
                    if (output.error) {
                      watcher.emit('error', output);
                    } else {
                      watcher.emit('change', output);
                    }
                  }
                });
              
              buffer = buffer.substr(pos + 1);
              
            }
            
          };
          
        res.on('data', function (chunk) {
          buffer += chunk;
          processBuffer();
        });
        res.on('end', function() {
          processBuffer();
          watcher.start();
          
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
    .on('change', function(obj){
      console.log(require('util').inspect(obj, false, 5));
    })
    .on('error', console.error)
    .start();
}

