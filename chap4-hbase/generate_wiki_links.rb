#---
# Excerpted from "Seven Databases in Seven Weeks",
# published by The Pragmatic Bookshelf.
# Copyrights apply to this code. It may not be used to create training material, 
# courses, books, articles, and the like. Contact us if you are in doubt.
# We make no guarantees that this code is fit for any purpose. 
# Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
#---

import 'org.apache.hadoop.hbase.client.ConnectionFactory'
import 'org.apache.hadoop.hbase.TableName'
import 'org.apache.hadoop.hbase.client.Put'
import 'org.apache.hadoop.hbase.client.Scan'
import 'org.apache.hadoop.hbase.client.Durability'
import 'org.apache.hadoop.hbase.util.Bytes'

def jbytes( *args )
  return args.map { |arg| arg.to_s.to_java_bytes }
end

connection = ConnectionFactory.createConnection()

wiki_table = connection.getTable( TableName.valueOf( "wiki" ) )
links_table = connection.getBufferedMutator( TableName.valueOf( "links" ) )

scanner = wiki_table.getScanner( Scan.new ) # (1)

linkpattern = /\[\[([^\[\]\|\:\#][^\[\]\|:]*)(?:\|([^\[\]\|]+))?\]\]/
count = 0

while (result = scanner.next())

  title = Bytes.toString( result.getRow() ) # (2)
  text = Bytes.toString( result.getValue( *jbytes( 'text', '' ) ) )
  if text
    
    put_to = nil
    text.scan(linkpattern) do |target, label| # (3)
      unless put_to
        put_to = Put.new( *jbytes( title ) )
        put_to.setDurability(Durability::SKIP_WAL)
      end
      
      target.strip!
      target.capitalize!
      
      if target.length == 0
        next
      end
      
      label = '' unless label
      label.strip!
      
      put_to.addColumn( *jbytes( "to", target, label ) )
      put_from = Put.new( *jbytes( target ) )
      put_from.addColumn( *jbytes( "from", title, label ) )
      put_to.setDurability(Durability::SKIP_WAL)
      links_table.mutate( put_from ) # (4)
    end
    links_table.mutate( put_to ) if put_to and not put_to.isEmpty # (5)
    links_table.flush()
    
  end
  count += 1
  puts "#{count} pages processed (#{title})" if count % 500 == 0

end
links_table.flush()
exit

