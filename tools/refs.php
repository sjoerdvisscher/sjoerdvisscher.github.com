<?header("Content-type: text/xml");?>
<section xmlns="http://www.w3.org/2002/06/xhtml2">
<?
$url = substr($url, 19);
if (substr($url, strlen($url)-9) == 'index.xml') $url = substr($url, 0, strlen($url)-9);

$dict=array();

$handle = fopen ("../../logs/access_log","r");
while ($data = fgetcsv ($handle, 1000, " ")) {
  list($who, $a, $b, $date, $c, $cmd, $code, $d, $ref, $ua) = $data;
  list($method, $logurl, $rest) = explode(" ", $cmd);
  if ($method == "GET")
    if ($logurl == $url)
      $dict[$ref] = 1;
}
fclose($handle);


$l = array();
while (list ($key, $val) = each ($dict)) {
  if ($key == "-") continue;
  $pos=strpos($key, "?");
  if (is_integer($pos)) continue;
  $pos=strpos($key, "w3future.com");
  if (is_integer($pos)) continue;
  if (substr($key, 0, 7)!='http://') continue;
  array_push($l, $key);
}

if (sizeof($l)>0) {
  sort ($l);

  echo "<nl><label>Referrers</label>";
  while (list ($val, $href) = each ($l)) {
    $pos=strpos($l[$val+1], $href);
    if (is_integer($pos) and $pos==0) continue;
    $href = htmlspecialchars($href);
    echo "<li href='$href'>$href</li>\n";
  }
  echo "</nl>";

}
?>
</section>