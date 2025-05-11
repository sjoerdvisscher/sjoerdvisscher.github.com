<?
include ("xmlparse.inc");
dl ( "xml.so");

function message() {
	global $message;
	global $server;
        global $password;
        global $username;
        global $subject;
        global $body;
	global $presencer;
	global $toset;
	global $checker;
	global $formm;
	global $presreq;

	if ($checker == "a") {
	} else {
	$too = "";
	}
		
	echo ("<CENTER>");
	echo ("Request Subscription From:<BR></BR>\n");
	echo ("<INPUT type=\"text\" size=\"44\" name=\"presencer\"><BR></BR>\n");
	echo ("<INPUT type=submit value=\"Send Request\"><BR></BR>\n");
	echo ("<HR width=\"100%\">\n");
	echo ("<INPUT type=submit value=\"Check for New Messages\"><BR>");
	echo ("<HR width=\"100%\">\n");
	echo ("To:  \n");
	echo ("<INPUT type=\"text\" size=\"64\" name=\"toset\" value=\"$toset\"><BR></BR>\n");
	echo ("Subject:  \n");
	echo ("<INPUT type=\"text\" size=\"55\" name=\"subject\"><BR></BR>\n");
	echo ("Message<BR></BR>\n");
	echo ("<textarea name=\"message\" cols=\"45\" rows=\"10\"></textarea><BR></BR>\n");
	echo ("<INPUT type=\"hidden\" value=\"$server\" name=\"server\">");
	echo ("<INPUT type=\"hidden\" value=\"$password\" name=\"password\">");
	echo ("<INPUT type=\"hidden\" value=\"$username\" name=\"username\">");
	echo ("<INPUT type=submit value=\"Send Message\"> <INPUT type=Reset>");
        echo ("</CENTER>");
	echo "</FORM>";
	}

function headerr() {
        echo "<HTML>";
        echo "<HEAD>";
        echo "<TITLE>Jabber PHP: Chat Form</TITLE>";
        echo "</HEAD>";
        echo "<BODY>";
        }
 	
function read() {
	global $fpp;
	global $server;
	global $username;
        global $presfrom;
	global $parserr;
	global $eps;
	global $presset;
	global $messset;
	global $setter;
	global $formm;
	global $messfrom;

	while ($a != "2048") {
        $stuff = fgets($fpp,20048);
	$a++;
        $stuffs .= $stuff;	
        }
	$eps = ereg_replace ("\xff","",$stuffs);
//	$eps .= "<message to=\"candoo@jabber.org\" from=\"foobar@jackoff.com\"><subject>hi there</subject><body>you here</body></message>";//

	$temppp = ereg_replace ("\&quot\;","ffrdvmd",$eps);
        $tempppp = ereg_replace ("\&lt\;","vcfdovp",$temppp);
        $epsed = ereg_replace ("\&gt\;","rdfgoed",$tempppp);

	print ("<!--$epsed--><BR>");	

	xml_parse_setup();	
	xml_parse($parserr,$epsed);

	if ($messset == "1") {	
	$setter = "1";
	printmess($messfrom); 	
	} 

	if ($presset == "1") {
	printpres();
	} else {
	echo ("<FORM action=\"/jabber/chat.php\" method=\"post\">");
	$formm = "</FORM>";
	}

	fputs($fpp, "<x xmlns=\"jabber:x:offline\"><presence/><messages to=\"$username@$server\"/></x>");
        fputs($fpp,"</stream:stream>");
        fclose($fpp);
        }

function printpres() {
	global $presfrom;
	echo ("<FORM action=\"/jabber/chat.php\" method=\"post\">");
	echo "<CENTER>Who is Online</CENTER><BR></BR>\n";
	echo "<CENTER><SELECT name=\"tos\" size=\"10\">\n";
	
	while ( list($jidd,$status) = each($presfrom) ) {

	if (strlen($jidd) > "0") {

	if (ereg("registered",$jidd)) {
	list( $jiddd,$nulll ) = explode( "?", $jidd );
	
	if (strlen($status) < "1") {
        $status = "No Status";
        }
	
	print ("<OPTION disabled>$jiddd Status: $status</OPTION>");
	} else {
	
	if (strlen($status) < "1") {
        $status = "No Status";
        
	}

	print ("<OPTION>$jidd Status: $status</OPTION>");
	
	}		
	
	}
	
	}
	
	$presset = "";
	echo "</SELECT></CENTER>";
	
	}        

function printmess($messfrom) {
	global $setter;	
	global $too;
	global $server;
	global $username;
	global $password;

	if ($setter == "1") {
	$counter = 0;
	
	while (list($jids,$subject) = each($messfrom) ) {
	
	if (ereg_replace ("\xff","",$jids)) {
	$epsss = ereg_replace ("\xff","",$jids);
	} else {
	$epsss = $jids;
	} 
	
	if (strlen($epsss) < "2") {
        } else {
	echo "<a href=\"#$counter\">[$epsss] $subject</a><BR>\n";
	$counter++;
	}

	}

	echo ("<HR width=\"100%\">\n");
	
	} else {
 	$counter = "0";
	echo ("<HR width=\"100%\">");

	while (list($jids,$subject,$body) = each($messfrom) ) {
	

	if (ereg_replace ("\xff","",$jids)) {
	$epsss = ereg_replace ("\xff","",$jids);
        } else { 
        $epsss = $jids;
        } 		
	
	if (strlen($epsss) < "3") {
	} else { 
	
	echo ("<FORM action=\"/jabber/chat.php\" method=\"post\">");
	echo ("<INPUT type=\"hidden\" value=\"a\" name=\"checker\">");
	echo ("<INPUT type=\"hidden\" value=\"$epsss\" name=\"too\">");
	echo ("<INPUT type=\"hidden\" value=\"$server\" name=\"server\">");
        echo ("<INPUT type=\"hidden\" value=\"$password\" name=\"password\">");
        echo ("<INPUT type=\"hidden\" value=\"$username\" name=\"username\">");
	echo "From: <a name=\"$counter\">$epsss </a><INPUT type=submit value=\"Reply\"><BR>\n";
	echo "Subject: $subject<BR>\n";
	echo "</FORM>";
	$counter++;

	echo "<CENTER>Message:</CENTER><BR>\n";

	$tempp = $messfrom[$jids[$subject]];
	$temppp = ereg_replace ("ffrdvmd","\"",$tempp);
        $tempppp = ereg_replace ("vcfdovp","<",$temppp);
        $htmltag = ereg_replace ("rdfgoed",">",$tempppp);

	echo $htmltag."<BR>\n";
	echo ("<HR width=\"100%\">\n");
	}

	}
	
	}		

	}

function jabber_connect() {
	global $server;
	global $fpp;
	$fpp = fsockopen($server,5222);
	$fppp = set_socket_blocking($fpp, 0);
	}

function auth() {
	global $server;
        global $password;
        global $username;
	global $fpp;
	global $presencer;

	$stream = "<stream:stream to=\"$server\" xmlns=\"jabber:client\" xmlns:stream=\"http://etherx.jabber.org/streams\">";
	$auth = "<iq type=\"set\" id=\"$username@$server/phpclient\"><query xmlns=\"jabber:iq:auth\"><username>$username</username><password>$password</password><resource>phpclient</resource></query></iq>";
	$presencee = "<presence><status>Online</status></presence>/n";
	fputs ($fpp,$stream,strlen($stream));
        fputs ($fpp,$auth,strlen($auth));
	fputs ($fpp,$presencee);

	if ($presencer > "" ) {
	$presences = "<presence to=\"$presencer\" from=\"$username@$server\" type=\"subscribe\"/>\n";
	fputs ($fpp,$presences);
	$presencer = "";
	}
	
	}

function send_message() {
	global $message;
	global $server;
        global $password;
        global $username;
	global $fpp;
	global $to;
        global $subject;
        global $body;
	
	sleep(10);

	if (strlen($subject) > "0") {
//	$messagge = ereg_replace ("\\","",$message);	//
	$messagee = "<message to=\"$to\"><subject>$subject</subject><body>$message</body></message>";
	fputs ($fpp,$messagee,strlen($messagee));
	
	}
	
	}
		
	echo ("Server: $server<BR></BR>\n<HR width=\"100%\" align=\"center\">\n");

	headerr();
	jabber_connect();
        auth();
	read();
	
	if (strlen($too) > "0") {
        $toset = $too;
        message();
        } else {

	if (strlen($toset) > "0") {
        if (strlen($message) > "0") {
	$to = $toset;
        jabber_connect();
        auth();
        send_message();
	$toset = "";
        message();	
	}
	} else {	 

	if (strlen($tos) > "0") {
        list( $toss,$nulll ) = explode( " ", $tos );
	$to = $toss;
        jabber_connect();
        auth();
        send_message();
        message();
        } else {
	message();		
	
	}
	
	}
	
	}	
	
	if ($setter == "1") {
	$setter = "";
        printmess($messfrom);
	}
?>
</BODY>
</HTML>
