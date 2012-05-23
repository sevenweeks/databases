#---
# Excerpted from "Seven Databases in Seven Weeks",
# published by The Pragmatic Bookshelf.
# Copyrights apply to this code. It may not be used to create training material, 
# courses, books, articles, and the like. Contact us if you are in doubt.
# We make no guarantees that this code is fit for any purpose. 
# Visit http://www.pragmaticprogrammer.com/titles/rwdata for more book information.
#---

require 'rubygems' # (1)
require 'libxml'
require 'couchrest'

include LibXML

class JamendoCallbacks # (2)
  include XML::SaxParser::Callbacks
  def initialize() # (3)
    @db = CouchRest.database!("http://localhost:5984/music") 
    @count = 0
    @max = 100 # maximum number to insert
    @stack = []
    @artist = nil
    @album = nil
    @track = nil
    @tag = nil
    @buffer = nil
  end
  def on_start_element(element, attributes) # (4)
    case element
    when 'artist'
      @artist = { :albums => [] }
      @stack.push @artist
    when 'album'
      @album = { :tracks => [] }
      @artist[:albums].push @album
      @stack.push @album
    when 'track' 
      @track = { :tags => [] }
      @album[:tracks].push @track
      @stack.push @track
    when 'tag'
      @tag = {}
      @track[:tags].push @tag
      @stack.push @tag
    when 'Artists', 'Albums', 'Tracks', 'Tags'
      # ignore
    else
      @buffer = []
    end
  end
  
  def on_characters(chars) # (5)
    @buffer << chars unless @buffer.nil?
  end
  
  def on_end_element(element) # (6)
    case element
    when 'artist'
      @stack.pop
      @artist['_id'] = @artist['id'] # reuse Jamendo's artist id for doc _id
      @artist[:random] = rand
      @db.save_doc(@artist, false, true)
      @count += 1
      if !@max.nil? && @count >= @max
        on_end_document
      end
      if @count % 500 == 0
        puts "  #{@count} records inserted"
      end
    when 'album', 'track', 'tag'
      top = @stack.pop
      top[:random] = rand
    when 'Artists', 'Albums', 'Tracks', 'Tags'
      # ignore
    else
      if @stack[-1] && @buffer
        @stack[-1][element] = @buffer.join.force_encoding('utf-8')
        @buffer = nil
      end
    end
  end 
  def on_end_document()
    puts "TOTAL: #{@count} records inserted"
    exit(1)
  end
end

parser = XML::SaxParser.io(ARGF) # (7)
parser.callbacks = JamendoCallbacks.new
parser.parse

