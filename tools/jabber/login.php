<?php
	function login ($username,$password,$server){
	headerr();
	echo ("Welcome to our Jabber Client. Fill out the following form and happy chatting.  Fill out the form even if you are not registered with the server your attempting to contact.<BR></BR>");
	echo ("<BR></BR><CENTER>");
	echo ("<FORM action=\"/jabber/login.php\" method=\"post\">");
	echo ("Enter Jabber ServerName:<BR>");
	echo ("<INPUT type=text size=\"40\" name=\"server\" value=\"$server\"><br><br>");
	echo ("Enter Username:<br>");
	echo ("<INPUT type=text size=\"32\" name=\"username\" value=\"$username\"><br><br>");
	echo ("Enter Password:<BR>");
	echo ("<INPUT type=password size=\"20\" name=\"password\" value=\"$password\"><br><br>");
	echo ("<INPUT type=submit value=Login> <INPUT type=Reset>");
	echo ("</CENTER>");
	echo ("</FORM>");
	}
	
	function headerr() {
	echo "<HTML>";
	echo "<HEAD>";
	echo "<TITLE>Jabber PHP: Login Form</TITLE>";
	echo "</HEAD>";
	echo "<BODY>";
	}
	
	if ($username > ""){
	$fpp = fsockopen($server,5222);
	$fppp = set_socket_blocking($fpp, 0);
	$stream = "<stream:stream to=\"$server\" xmlns=\"jabber:client\" xmlns:stream=\"http://etherx.jabber.org/streams\">\n\n";
	$auth = "<iq type=\"set\" id=\"$username@$server/phpclient\"><query xmlns=\"jabber:iq:auth\"><username>$username</username><password>$password</password><resource>phpclient</resource></query></iq>\n\n";
	fputs($fpp,$stream,strlen($stream));
	fputs($fpp,$auth,strlen($auth));

	while ($a != "3048") {
	$stuff = fgetc($fpp);	
	$stuffs .= $stuff;
	$a++;
        }
	fclose($fpp);

	if ($stuffs == "") {
	header();
	print ("Error: Server is down or unreachable. Please try again later.");
	}	
	
	if (ereg("error",$stuffs)) {
	headerr();
	print ("You have either Entered an Invalid username or Password or you are not registered with this server<BR></BR><BR></BR>");
	echo ("<FORM action=\"/jabber/register.php\" method=\"post\">");
        echo ("<INPUT type=hidden name=server value=\"$server\">");
        echo ("<INPUT type=hidden name=password value=\"$password\">");
        echo ("<INPUT type=hidden name=username value=\"$username\">");
        echo ("<BR><INPUT type=submit value=\"Click To Register\">");
        echo ("</FORM><br><BR>");

	login($username,$password,$server);
	} else {	
	headerr();
	print ("Welcome to Jabber. Your Login Was Successful.");
	echo ("<FORM action=\"/jabber/chat.php\" method=\"post\">");
	echo ("<INPUT type=hidden name=server value=\"$server\">");
	echo ("<INPUT type=hidden name=password value=\"$password\">");
	echo ("<INPUT type=hidden name=username value=\"$username\">");
	echo ("<BR><INPUT type=submit value=\"Click To Begin Chatting\">");
	echo ("</FORM><br><BR>");
	}
	exit();
	}
	
	login($username,$password,$server);
?>
</BODY>
</HTML>	 