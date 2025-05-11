#!/usr/local/bin/perl

use KCatch;
use XML::LibXSLT;
use XML::LibXML;

sub url_decode { 
  # default argument is $_ 
  local $_ = @_ ? shift : $_; 
  defined or return; 

  # change + signs to spaces 
  tr/+/ /; 

  # change hex escapes to the proper characters 
  s/%([a-fA-F0-9]{2})/pack "H2", $1/eg; 

  return $_; 
}

my $str = $ENV{QUERY_STRING}; 
my %kv; 

# for each k=v pair 
for (split /[&;]/, $str) { 
  # third arg of '2' because $_ might be 'a=b=c' 
  my ($k,$v) = split /=/, $_, 2; 

  # don't allow for blank key 
  next if $k eq ""; 

  # XXX: this only allows one value per key! 
  $kv{url_decode($k)} = url_decode($v); 
}

my $parser = XML::LibXML->new();
my $xslt = XML::LibXSLT->new();

my $xr = $parser->parse_file($kv{"xr"});
my $xr2xsl = $parser->parse_file("xr.xsl");

my $stylesheet = $xslt->parse_stylesheet($xr2xsl);
my $xml2rdf = $stylesheet->transform($xr);

print "Content-type: application/xml\n\n";

if ($kv{"xml"})
{
  my $url = $kv{"xml"};
  my $xml = $parser->parse_file($url);

  $stylesheet = $xslt->parse_stylesheet($xml2rdf);
  my $rdf = $stylesheet->transform($xml, XML::LibXSLT::xpath_to_string(
    documentURI => $url
  ));
   
  print $stylesheet->output_string($rdf);
}
else
{
  print $stylesheet->output_string($xml2rdf);
}
