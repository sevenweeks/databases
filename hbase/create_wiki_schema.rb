#---
# Excerpted from "Seven Databases in Seven Weeks",
# published by The Pragmatic Bookshelf.
# Copyrights apply to this code. It may not be used to create training material, 
# courses, books, articles, and the like. Contact us if you are in doubt.
# We make no guarantees that this code is fit for any purpose. 
# Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
#---

create 'wiki', {
  NAME => 'text',
  BLOOMFILTER => 'ROW',
  COMPRESSION => 'GZ',
  VERSIONS => org.apache.hadoop.hbase.HConstants::ALL_VERSIONS
},{
  NAME => 'revision',
  VERSIONS => org.apache.hadoop.hbase.HConstants::ALL_VERSIONS
}

create 'links', {
  NAME => 'to',
  BLOOMFILTER => 'ROWCOL',
  VERSIONS => 1
},{
  NAME => 'from',
  BLOOMFILTER => 'ROWCOL',
  VERSIONS => 1
}

exit
