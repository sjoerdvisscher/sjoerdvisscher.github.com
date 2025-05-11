<?
include ("xmlparse.inc");
dl ( "xml.so");

function register() {
	global $server;
	global $username;
	global $password;
	global $usernameset;
        global $passwordset;
        global $nameset;
        global $emailset;
        global $addressset;
        global $cityset;
        global $stateset;
        global $zipset;
        global $phoneset;
        global $urlset;
        global $dateset;
        global $misc;
        global $textset;
        global $keyset;
	global $instructions;
	global $name;
	global $key;	
	
	echo $instructions."<BR>\n";
	echo ("<FORM action=\"/jabber/register.php\" method=\"post\">");
	echo "<CENTER>";
	
	if ($usernameset == "1") {
	echo "Username:";
	echo "<INPUT type=\"text\" value=\"$username\" name=\"username\" size=\"32\"><BR>";	
	}

	if ($passwordset == "1") {
        echo "Password:";
        echo "<INPUT type=\"text\" value=\"$password\" name=\"password\" size=\"32\"><BR>";
        }

	if ($nameset == "1") {
        echo "Name:";
        echo "<INPUT type=\"text\" value=\"$name\" name=\"name\" size=\"32\"><BR>";
        }

	if ($emailset == "1") {
        echo "Email:";
        echo "<INPUT type=\"text\" value=\"$email\" name=\"email\" size=\"32\"><BR>";
        }

	if ($addressset == "1") {
        echo "Address:";
        echo "<INPUT type=\"text\" value=\"$adress\" name=\"adress\" size=\"32\"><BR>";
        }

	if ($cityset == "1") {
        echo "City:";
        echo "<INPUT type=\"text\" value=\"$city\" name=\"city\" size=\"32\"><BR>";
        }

	if ($stateset == "1") {
        echo "State:";
        echo "<INPUT type=\"text\" value=\"$state\" name=\"state\" size=\"32\"><BR>";
        }

	if ($zipset == "1") {
        echo "Zip:";
        echo "<INPUT type=\"text\" value=\"$zip\" name=\"zip\" size=\"32\"><BR>";
        }

	if ($phoneset == "1") {
        echo "Phone #:";
        echo "<INPUT type=\"text\" value=\"$phone\" name=\"phone\" size=\"32\"><BR>";
        }

	if ($urlset == "1") {
        echo "Website Addr. :";
        echo "<INPUT type=\"text\" value=\"$url\" name=\"url\" size=\"32\"><BR>";
        }

	if ($dateset == "1") {
        echo "Date:";
        echo "<INPUT type=\"text\" value=\"$date\" name=\"date\" size=\"32\"><BR>";
        }



	echo "<INPUT type=\"hidden\" value=\"$server\" name=\"server\">\n";
	echo "<INPUT type=\"hidden\" value=\"$key\" name=\"key\">\n";
	echo ("<BR><INPUT type=submit value=\"Click To Register\">");
	echo "</CENTER></FORM>";

	}

function headerr() {
        echo "<HTML>";
        echo "<HEAD>";
        echo "<TITLE>Jabber PHP: Chat Form</TITLE>";
        echo "</HEAD>";
        echo "<BODY>";
        
	}

function jabber_connect() {
        global $server;
        global $fpp;
        $fpp = fsockopen($server,5222);
        $fppp = set_socket_blocking($fpp, 0);
	$stream = "<stream:stream to=\"$server\" xmlns=\"jabber:client\" xmlns:stream=\"http://etherx.jabber.org/streams\">";
        fputs ($fpp,$stream,strlen($stream));
	
	}

function get_reg() {
	global $fpp;

	$reg = "<iq type=\"get\"><query xmlns=\"jabber:iq:register\"/></iq>";
	fputs ($fpp,$reg,strlen($reg));
	}

function send_reg() {
	global $fpp;
	global $username;
	global $password;
	global $name;
	global $key;

	$sendreg = "<iq type=\"set\"><query xmlns=\"jabber:iq:register\"><username>$username</username><password>$password</password><name>$name</name><key>$key</key></query></iq>";	
//	echo "<XMP>$sendreg</XMP>"; //
	fputs ($fpp,$sendreg,strlen($sendreg));

	}	

function read() {
	global $fpp;
	global $parserr
	global $errorset;

	while ($a != "2048") {
        $stuff = fgets($fpp,20048);
        $a++;
        $stuffs .= $stuff;
        
	}

        $eps = ereg_replace ("\xff","",$stuffs);
	print ("<!--$eps--><BR>");

	if (ereg("error",$eps)) {	
	print ("Your Username is Either already registered or you entered invalid info on your Registration Form.<BR>");
	$errorset = "1";
	
	}

        xml_parse_setup();
        xml_parse($parserr,$eps);

	fputs($fpp,"</stream:stream>");
        fclose($fpp);
	
	}

	if (strlen($name) > "0") {
	jabber_connect();
	send_reg();
	read();
	
	if ($errorset == "1") {
	register();
	$errorset = "";
	
	} else {
 
	print ("Welcome to Jabber. Your Login Was Successful.");
        echo ("<FORM action=\"/jabber/chat.php\" method=\"post\">");
        echo ("<INPUT type=hidden name=server value=\"$server\">");
        echo ("<INPUT type=hidden name=password value=\"$password\">");
        echo ("<INPUT type=hidden name=username value=\"$username\">");
        echo ("<BR><INPUT type=submit value=\"Click To Begin Chatting\">");
        echo ("</FORM><br>");
	}
	
	} else {

	jabber_connect();
	get_reg();
	read();
	headerr();
	register();
	
	}

?>
</BODY>
</HTML>