#---
# Excerpted from "Seven Databases in Seven Weeks",
# published by The Pragmatic Bookshelf.
# Copyrights apply to this code. It may not be used to create training material, 
# courses, books, articles, and the like. Contact us if you are in doubt.
# We make no guarantees that this code is fit for any purpose. 
# Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
#---
import 'org.apache.hadoop.hbase.client.Put'
import 'org.apache.hadoop.hbase.client.ConnectionFactory'
import 'org.apache.hadoop.hbase.TableName'

def jbytes( *args )
  args.map { |arg| arg.to_s.to_java_bytes }
end

connection = ConnectionFactory.createConnection()

table = connection.getTable( TableName.valueOf( "wiki" ) )

p = Put.new( *jbytes( "Home" ) )

p.addColumn( *jbytes( "text", "", "Hello world" ) )
p.addColumn( *jbytes( "revision", "author", "jimbo" ) )
p.addColumn( *jbytes( "revision", "comment", "my first edit" ) )

table.put( p )
