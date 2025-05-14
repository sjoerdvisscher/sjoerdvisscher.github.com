 <skip />
<?
/*
error_reporting(E_ALL ^ E_WARNING ^ E_NOTICE);

include_once("db.inc");
include_once("RPC/rdf.lib");

mb_http_output("UTF-8");
header("Content-type: text/xml");
echo '<?xml version="1.0" encoding="UTF-8" ?>';

$nslist = array(
  "https://w3future.com/rdf#" => "w3f",
  "http://purl.org/dc/elements/1.1/" => "dc",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#" => "rdf"
);

$names=array();

function getName($p)
{
  global $nslist;
  global $names;

  if (isset($names[$p])) return $names[$p];

  reset($nslist);
  $name = $p;
  while (list ($ns, $prefix) = each ($nslist))
    $name = str_replace($ns, $prefix.":", $name);

  return $names[$p] = $name;
}

function makeDescription($about)
{
  global $level;

  echo "\n\n  <rdf:Description rdf:about='" . htmlspecialchars($about) . "'>";

  $desc = getRows("p,o", "s='".addslashes($about)."'", 's,p,o DESC');
  while (list ($key, $row) = each ($desc))
  {
    $p = getName($row['p']);
    $o = $row['o'];

    if (substr($o, 0, 7) == 'http://' && $level < 1)
    {
      echo "\n    <$p>";
      $level++;
      makeDescription($o);
      $level--;
      echo "\n    </$p>";
    }
    else
    {
      $s = htmlspecialchars($o);
      for ($i=0;$i<32;$i++)
      {
        $s = str_replace(chr($i), "?", $s);
      }
      echo "\n    <$p>".$s."</$p>";
    }
  }

  echo "\n  </rdf:Description>\n";
}

echo "<rdf:RDF\n";
while (list ($ns, $prefix) = each ($nslist))
  echo "  xmlns:$prefix='$ns'\n";
echo ">";

$level=0;
makeDescription($about);

echo "</rdf:RDF>";
*/
?>
