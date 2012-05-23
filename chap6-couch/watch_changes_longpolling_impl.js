/***
 * Excerpted from "Seven Databases in Seven Weeks",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material, 
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose. 
 * Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
***/
    var
      http_options = { // (1)
        host: watcher.host,
        port: watcher.port,
        path:
          '/' + watcher.db + '/_changes' +
          '?feed=longpoll&include_docs=true&since=' + watcher.last_seq
      };

    http.get(http_options, function(res) { // (2)
      var buffer = '';
      res.on('data', function (chunk) {
        buffer += chunk;
      });
      res.on('end', function() {
        var output = JSON.parse(buffer); // (3)
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

