/***
 * Excerpted from "Seven Databases in Seven Weeks",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material, 
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose. 
 * Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
***/
var http = require('http');

exports.createClient = function(options) {
  
  options = options || {};
  
  var
    running = 0,
    backlog = [],
    host = options.host || 'localhost',
    port = options.port || 7474,
    limit = options.limit || 10;
    
  function dequeue() {
    if (backlog.length && running < limit) {
      req.apply(null, backlog.shift());
    }
  }
  
  function req(method, path, data, callback) {
    running += 1;
    return http
      .request({
        host: host,
        port: port,
        path: '/db/data/' + (path.join ? path.join('/') : path),
        headers: {'Content-Type':'application/json'},
        method: method
      }, function(res){
        var buffer = '';
        res.on('data', function(chunk){
          buffer += chunk;
        });
        res.on('end', function(){
          var output;
          if (callback && buffer != '') {
            try {
              output = JSON.parse(buffer);
            } catch (err) {
              console.error(err);
            }
            callback(output, res);
          }
          running -= 1;
          dequeue();
        });
      })
      .on('error', function(){
        running -= 1;
        backlog.push([method, path, data, callback]);
        dequeue();
      })
      .end(data ? JSON.stringify(data) : undefined);
  };
  
  return {
    get: function(path, callback) {
      backlog.push(['GET', path, null, callback]);
      dequeue();
    },
    post: function(path, data, callback) {
      backlog.push(['POST', path, data, callback]);
      dequeue();
    }
  };
  
}

