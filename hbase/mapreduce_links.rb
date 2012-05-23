#---
# Excerpted from "Seven Databases in Seven Weeks",
# published by The Pragmatic Bookshelf.
# Copyrights apply to this code. It may not be used to create training material, 
# courses, books, articles, and the like. Contact us if you are in doubt.
# We make no guarantees that this code is fit for any purpose. 
# Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
#---

# NOTE: This code doesn't work because of classpath problems.  Specifically,
# the hadoop nodes that are to run the job need to be able to load the 
# LinkMapper and LinkReducer classes, and to do that the classes need to be
# loaded into a JAR and passed along.  After several attempts, I've been
# unsuccessful at making this work by any means, even coding pieces in Java.
# 
# So I'm leaving this code here in case it turns out to be useful later.

import 'org.apache.hadoop.hbase.client.Put'
import 'org.apache.hadoop.hbase.client.Result'
import 'org.apache.hadoop.hbase.client.Scan'
import 'org.apache.hadoop.hbase.filter.FirstKeyOnlyFilter'
import 'org.apache.hadoop.hbase.io.ImmutableBytesWritable'
import 'org.apache.hadoop.hbase.mapreduce.TableMapReduceUtil'
import 'org.apache.hadoop.hbase.mapreduce.TableMapper'
import 'org.apache.hadoop.hbase.mapreduce.TableReducer'
import 'org.apache.hadoop.hbase.util.Bytes'
import 'org.apache.hadoop.io.IntWritable'
import 'org.apache.hadoop.mapreduce.Job'

def jbytes( *args )
  return args.map { |arg| arg.to_s.to_java_bytes }
end

job = Job.new( @hbase.configuration, 'wiki_links' )

scan = Scan.new
scan.addColumn( *jbytes('text', '') )
scan.setFilter( FirstKeyOnlyFilter.new )

class LinkMapper < TableMapper
  
  def map( row, values, context )
    puts row
  end
  
end

TableMapReduceUtil.initTableMapperJob(
  'wiki',
  scan,
  LinkMapper,
  ImmutableBytesWritable,
  IntWritable,
  job
)

class LinkReducer < TableReducer
  
  def reduce( key, values, context )
    puts key
  end
  
end

TableMapReduceUtil.initTableReducerJob(
  'wiki',
  LinkReducer, 
  job
)

job.setJarByClass( LinkMapper )

puts job, scan, "submitting job ..."

job.waitForCompletion(true)

puts "done!"

exit

