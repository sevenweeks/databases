/***
 * Excerpted from "Seven Databases in Seven Weeks",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material, 
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose. 
 * Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
***/

var
  // The band data file name in tab-seperated form
  tsvFileName = 'group_membership.tsv',
  // track how many file lines we've processed
  processedLines = 0,

  // standard libraries
  csv = require('csv'),
  redis = require('redis'),

  // database clients
  redis_client = redis.createClient(6379);

/**
 * A helper function that splits up the comma-seperated list of roles and
 * converts it to an array. If no valid roles exist, return an empty array.
 * @param string the CSV to split into a role array
 */
function buildRoles( string ) {
  var roles = string.split(',');
  if(roles.length === 1 && roles[0] === '') roles = [];
  return roles;
};

/**
 * Utility function that increments the total number
 * of lines (artists) processed and outputs every 1000.
 */
function trackLineCount() {
  if( ++processedLines % 1000 === 0 )
    console.log('Lines Processed: ' + processedLines);
}

/**
 * Does all heavy lifting. Loops through the CSV file
 * and populate Redis with the given values.
 */
function populateRedis() {
  csv().
  fromPath( tsvFileName, { delimiter: '\t', quote: '' }).
  on('data', function(data, index) {
    var
      artist = data[2],
      band = data[3],
      roles = buildRoles(data[4]);
    if( band === '' || artist === '' ) {
      trackLineCount();
      return true;
    }
    redis_client.sadd('band:' + band, artist);
    roles.forEach(function(role) {
      redis_client.sadd('artist:' + band + ':' + artist, role);
    });
    trackLineCount();
  }).
  on('end', function(total_lines)
  {
    console.log('Total Lines Processed: ' + processedLines);
    redis_client.quit();
  });
};

populateRedis();
