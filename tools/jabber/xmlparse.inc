<?
// XML Include Parsing functions for Jabberphp //

function xml_parse_setup() {
	global $parserr;
	global $eps;
	$eventstart = "eventstart";
	$eventend = "eventend";
	$cdata = "cdata";
	$parserr = xml_parser_create();
	xml_set_element_handler($parserr,$eventstart,$eventend);
	xml_set_character_data_handler($parserr,$cdata);
	}

function eventstart($parser,$name,$attrs) {
	global $presfrom;
	global $messset;
	global $messfrom;
	global $statusset;
	global $presset;
	global $subset;
        global $bodyset;
	global $jids;
	global $newjids;
	global $newjidsset;
	global $instructionsset;
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

	if ($name == "PRESENCE") {
	$presset = "1";
	$jids = $attrs["FROM"];
	$presfrom[$attrs["FROM"]] = "";
	}

	if ($name == "STATUS") {
	$statusset = 1;
	}

	if ($name == "MESSAGE") {	

	if ($jids == $attrs["FROM"]) {
	
	if ($newjidsset == "1") {
	$newsjids .= "\xff";
	} else {
	$newjidsset = "1";
	$newjids .= "\xff";
        $messfrom[$newjids] = "";
	}
	} else { 
	$jids = $attrs["FROM"];
	$newjids = $jids;
	$messfrom[$newjids] = "";
	}
	
	}
	
	if ($name == "SUBJECT") {
	$subset = "1";
	}

	if ($name == "BODY") {
	$bodyset = "1";
	}	

	if ($name == "INSTRUCTIONS") {
	$instructionsset = "1";
	}

	if ($name == "USERNAME") {
        $usernameset = "1";
        }

	if ($name == "PASSWORD") {
        $passwordset = "1";
        }

	if ($name == "NAME") {
        $nameset = "1";
        }

	if ($name == "EMAIL") {
        $emailset = "1";
        }

	if ($name == "ADDRESS") {
        $addressset = "1";
        }

	if ($name == "CITY") {
        $cityset = "1";
        }

	if ($name == "STATE") {
        $stateset = "1";
        }

	if ($name == "ZIP") {
        $zipset = "1";
        }

	if ($name == "PHONE") {
        $phoneset = "1";
        }

	if ($name == "URL") {
        $urlset = "1";
        }

	if ($name == "DATE") {
        $dateset = "1";
        }

	if ($name == "MISC") {
        $miscset = "1";
        }

	if ($name == "TEXT") {
        $textset = "1";
        }
	
	if ($name == "KEY") {
        $keyset = "1";
        }

	}

function cdata($parser,$data) {
	global $statusset;
	global $presfrom;
	global $subset;
	global $bodyset;
	global $subs;
	global $jids;
	global $newjids;
	global $newjidsset;
	global $messset;	
	global $messfrom;
	global $instructionsset;
	global $instructions;
	global $keyset;
	global $key;	

	if (strlen($data) < "1") {
        $data = "None";
        }


	if ($statusset == 1) {
	$presfrom[$jids] = $data;
	$statusset = "";
	}

	if ($subset == 1) {
	$subs = $data;
	$subset = "";		
	}

	if ($bodyset == 1) {

	if (strlen($subs) < "2") {
	$subs = "None";
	$subset = "";
	}
	
	$messfrom[$newjids] = $subs;	
	$messfrom[$newjids[$subs]] = $data;
	$bodyset = "";
	$newjidsset = "";
	$messset = "1";
 	}

	if ($instructionsset == "1") {
	$instructions = $data;
	$instructionsset = "";
	}
	
	if ($keyset == "1") {
        $key = $data;
        $keyset = "";
        }

	}

function eventend($parser,$attribs) {
	
	}

?>