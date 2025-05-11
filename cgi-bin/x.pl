#!/usr/local/bin/perl
print "Content-type: text/html\n\n";

print "<HTML><BODY BGCOLOR=white>\n";
print "<B>Local configuration:</B><BR><BR>\n";

$date = `date`;
print "Now is: $date<BR>";

$uname = `uname -sr`;
print "The operating system is: <B>$uname</B><BR>\n";
print "The web server is: " . $ENV{SERVER_SOFTWARE} . "<BR>\n";

$pwd = `pwd`;
print "The current directory is <B>$pwd</B><BR>\n";

$login = (getpwuid($<))[0];
print "<BR>The cgi scripts run as user <B>" . $login;
print "</B> (if your cgi needs to write to a file,<BR>";
print "make sure the user $login has permissions to write to the file).<BR>\n";


print "<BR><B>Perl configuration:</B><BR><BR>\n";
print "Your perl scripts need to start with: #!";
find_command('perl');
$perlver = `perl -v`;
if ($perlver =~ m/.*version ([0-9\.\_\-]+).*/) {
    print "The perl version is $1<BR>\n";
}
find_module ('CGI.pm');

print "<BR><B>Some commands:</B><BR><BR>\n";

print "date: ";
find_command ('date');

print "sendmail: ";
find_command ('sendmail');

print "<BR><B>Environment:</B><BR><BR>\n";
for $name (sort keys %ENV) {  print "$name: " . $ENV{$name} . "<BR>\n"; }

print "<BR><BR>\n</BODY>\n</HTML>\n";

sub find_command {
    my $cmd = $_[0];
    my $dir;

    for $dir (
      '/bin',
      '/usr/local/bin',
      '/usr/bin',
      '/usr/gnu/bin',
      '/sbin',
      '/usr/sbin',
      '/usr/local/sbin',
      '/usr/lib'
      ) {
if (-x "$dir/$cmd") { print "$dir/$cmd<BR>\n"; return 0;}
    }
}


sub find_module {
    my $mod = $_[0];
    for $dir (@INC) {
if (-f "$dir/$mod") { print "The module $mod is installed<BR>\n"; }
    }
}