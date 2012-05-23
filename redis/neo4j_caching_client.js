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
  events = require('events'),
  esc = require('querystring').escape,
  redis = require('redis'),
  neo4j = require('../neo4j/neo4j_driver.js');

exports.createClient = function(options) {
  options = options || {};
  
  var
    neo4jClient = neo4j.createClient(options),
    redisClient = redis.createClient(),
    pending = new events.EventEmitter();
  
  pending.setMaxListeners(0); // unlimited
  
  neo4jClient.expiry = options.expiry || 300; // default 5 min

  // Run a gremlin script against the server.
  neo4jClient.runGremlin = function(script, callback) {
    var path = ['ext/GremlinPlugin/graphdb/execute_script'];
    neo4jClient.post(path, { script : script }, callback);
  };

  // lookup a key/value node by index.
  neo4jClient.lookupNode = function(index, key, value, callback) {
    var path = ['index/node', esc(index), esc(key), esc(value)];
    neo4jClient.get(path, callback);
  };
  
  // create a key/value node and index it.
  neo4jClient.createNode = function(index, key, value, callback) {
    var input = {};
    input[key] = value;
    neo4jClient.post('node', input, function(obj){
      var data = { uri: obj.self, key: key, value: value };
      neo4jClient.post(['index/node', esc(index)], data, callback);
    });
  }
  
  // lookup a node or create/index and cache it
  neo4jClient.lookupOrCreateNode = function(index, key, value, callback) {
    
    var
      cacheKey = 'lookup:' + index + ':' + key + ':' + value,
      ex = neo4jClient.expiry;
    
    // only one pending lookup for a given index/key/value allowed at a time
    if (!pending.listeners(cacheKey).length) {
      
      // check redis first
      redisClient.get(cacheKey, function(err, text){
        if (!err && text) {
          // found in redis cache, use it and refresh
          pending.emit(cacheKey, JSON.parse(text));
          redisClient.expire(cacheKey, ex);
        } else {
          // missed redis cache, lookup in neo4j index
          neo4jClient.lookupNode(index, key, value, function(list, res){
            if (list && list.length) {
              // found in index, use it and cache
              pending.emit(cacheKey, list[0]);
              redisClient.setex(cacheKey, ex, JSON.stringify(list[0]));
            } else {
              // missed index, create it and cache it
              neo4jClient.createNode(index, key, value, function(obj){
                pending.emit(cacheKey, obj);
                redisClient.setex(cacheKey, ex, JSON.stringify(obj));
              });
            }
          });
        }
      });
      
    }
    
    pending.once(cacheKey, callback);
    
  }
  
  // create a relationship between two nodes
  neo4jClient.createRelationship = function(fromNode, toNode, type, callback) {
    var fromPath = (fromNode || '').replace(/^.*?\/db\/data\//, '');
    neo4jClient.post(
      [fromPath, 'relationships'], { to: toNode, type: type }, callback
    );
  }
  
  return neo4jClient;
  
}

