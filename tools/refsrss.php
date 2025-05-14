<?
error_reporting(E_ALL ^ E_WARNING ^ E_NOTICE);

include_once("db.inc");
include_once("RPC/rdf.lib");

//mb_http_output("UTF-8");
header("Content-type: text/xml");
echo '<?xml version="1.0" encoding="ISO-8859-1" ?>';
?>

<rss version="2.0">
  <channel>
    <title>w3future.com referrers</title>
    <link>https://w3future.com/weblog/</link>
    <description>Shows the referrers to any w3future.com url.</description>
    <language>en-us</language>
<?

function decodeHTML($string) {
   $string = strtr($string, array_flip(get_html_translation_table(HTML_ENTITIES)));
//   $string = preg_replace("/&#([0-9]+);/me", "##\\1##", $string);
   return $string;
}

function hashFromProp($col, $prop)
{
  $list = getList($col, "p='".$prop."'");
  $hash = array();

  while (list ($key, $val) = each ($list))
    $hash[$val] = 1;

  return $hash;
}

$knownRefs = hashFromProp("o", "https://w3future.com/rdf#referrer");
$excerptRefs = hashFromProp("s", "https://w3future.com/rdf#firstSeenOn");

$newRefs=array();

$handle = fopen ("../../logs/access_log","r");
$checkList = array();
$maxCount=5;

while ($data = fgetcsv ($handle, 1000, " "))
{
  list($who, $a, $b, $date, $c, $cmd, $code, $d, $ref, $ua) = $data;
  list($method, $url, $rest) = explode(" ", $cmd);
  if ($method == "GET" && !isset($newRefs[$ref]))
  {
    if (substr($url, -5) == '.html') $url = substr($url, 0, -5) . ".xml";
    $newRefs[$ref] = $url;

//    if (!isset($knownRefs[$ref]))
    if (!isset($excerptRefs[$ref]))
    {

      if ($ref == "-") continue;
      $pos=strpos($ref, "?");
      if (is_integer($pos)) continue;
      if (stristr($ref, "w3future.com")) continue;
      if (substr($ref, 0, 7)!='http://') continue;

      rdf_addTriple("https://w3future.com".$url, 'https://w3future.com/rdf#referrer', $ref);
      rdf_addTriple($ref, 'https://w3future.com/rdf#firstSeenOn', date("Y-m-d\TH:i:s", time()));

      $checkList[$ref] = $url;

      if ($maxCount-- == 0) break;

    }
  }
}
fclose($handle);


foreach ($checkList as $href => $target) {

  $lines = file($href, "r");
  if (!$lines) continue;
  rdf_addTriple($href, 'https://w3future.com/rdf#online', 'true');

  $found = false;
  $html = implode('', $lines);
  eregi("<title>([^<]*)</title>", $html, $titles);
  if ($titles[1])
	  rdf_addTriple($href, 'http://purl.org/dc/elements/1.1/title', trim($titles[1]));

  $linew3f = false;
  $linetgt = false;
  $tgt = substr($target, 0, strrchr($target, "."));

  foreach ($lines as $linenr => $l)
  {
    $pos = strpos($l, $tgt);
    if ($pos!==false)
      $linetgt = $linenr;

    $pos = strpos($l, "w3future.com");
    if ($pos!==false)
      $linew3f = $linenr;
  }
  if ($linew3f === false) continue;
  if ($linetgt === false) $linetgt = $linew3f;

  $line = trim($lines[$linetgt]);
  if ($line[0]!="<")
  {
    $prev = $lines[$linetgt-1];
    ereg("[^>]*$", $prev, $prevmatch);
    $line = $prevmatch[0] . $line;
  }
  if ($line[strlen($line)-1]!=">")
  {
    $next = $lines[$linetgt+1];
    ereg("^[^<]*", $next, $nextmatch);
    $line = $line . $nextmatch[0];
  }
  eregi("<a [^w]*(www\.)?w3future.com[^>]*>([^<]*)</a>", $line, $linktext);
  $found = trim(decodeHTML(strip_tags($line)));
  if ($linktext[2])
  {
    rdf_addTriple($href, 'https://w3future.com/rdf#linkText', $linktext[2]);
//echo "linktext: ".$linktext[2]."\n";
    $pos = strpos($found, $linktext[2]);
    if ($pos > 160) $found = '...' . substr($found, $pos-160);
  }
  if (strlen($found) > 350) $found = substr($found, 0, 350) . '...';
  preg_replace("/##([0-9]+)##/me", "&#\\1;", $found);
//echo "excerpt: ".$found."\n\n";
  rdf_addTriple($href, 'https://w3future.com/rdf#excerpt', $found);
}

$newToday = getList("s", "(p='https://w3future.com/rdf#firstSeenOn') and (o LIKE '" . date("Y-m-d", time()) . "%')");

while (list ($val, $href) = each ($newToday)) {
  $desc = getDescription($href);
  $targets = getList("s", "(p='https://w3future.com/rdf#referrer') and (o='".addslashes($href)."')");
  $target = $targets[0];
  $href = htmlspecialchars($href);
  $title = $desc['http://purl.org/dc/elements/1.1/title'];
  if (!$title) $title = $href;
  $title = htmlspecialchars($title);
  $firstSeen = $desc['https://w3future.com/rdf#firstSeenOn'];
  if ($desc['https://w3future.com/rdf#excerpt'])
  {
    $txt = htmlspecialchars($desc['https://w3future.com/rdf#excerpt']);
    echo "\n    <item><title>".$title.' links to '.$target.'</title><link>'.$href.'</link><description>'.$txt.' &lt;a href="'.$target.'">'.$firstSeen.'&lt;/a></description></item>';
  }
}
?>

  </channel>
</rss>