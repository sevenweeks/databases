/***
 * Excerpted from "Seven Databases in Seven Weeks",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material, 
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose. 
 * Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
***/

var
  
  // bring in the http library
  http = require('http'),
  
  // define the connection options for requesting changes
  options = {
    host: 'localhost',
    port: 5984,
    path: '/music/_changes?include_docs=true&since=0',
    method: 'GET'
  };

http
  .get(options, function(res) {
    // set up a buffer to hold data as it comes in
    var buffer = "";
    res.on('data', function (chunk) {
      // as data is received, add it to the buffer
      buffer += chunk;
    });
    res.on('end', function() {
      // when the response is finished, process the buffer
      var output = JSON.parse(buffer);
      console.log(output);
    })
  })
  .on('error', function(e) {
    // if anything goes wrong, tell us about it!
    console.log('problem with request: ' + e.message);
  });


