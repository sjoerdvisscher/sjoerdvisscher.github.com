#!/usr/local/bin/perl

use KCatch;
use XML::LibXSLT;
use XML::LibXML;

  my $parser = XML::LibXML->new();
  my $xslt = XML::LibXSLT->new();
  
  my $source = $parser->parse_file('../' . $ENV{'QUERY_STRING'} . '.xml');

  $_ = $source->findvalue('processing-instruction("xml-stylesheet")');
  if ( /href='(http\:\/\/w3future\.com[^']*)'/ )
  {
    my $style_doc = $parser->parse_file($1);
  
    my $stylesheet = $xslt->parse_stylesheet($style_doc);
  
    my $results = $stylesheet->transform($source);
    
    if ($results->documentElement->localname eq 'html')
    {
      print "Content-type: text/html\n\n";
    }
    else
    {
      print "Content-type: application/xml\n\n";
    }
   
    print $stylesheet->output_string($results);
  }
  else
  {
    print "Content-type: application/xml\n\n";
    
    print $source->toString();
  }

