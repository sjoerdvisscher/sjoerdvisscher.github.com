<?
class resultSet {
	var $result;
	var $fieldtype;

	function resultSet($query) {
		$result = mysql_query($query) or die("invalid query");
		$this->result=$result;
		if ($result) $this->getColumns($result);
	}

	function getColumns($result) {
		for ($i=0;$i<mysql_num_fields($result);$i++)
			$this->fieldtype[mysql_field_name($result,$i)]=mysql_field_type($result,$i);
	}

	function val($col) {
		return $this->row[$col];
	}

	function findItem() {
		$this->row=mysql_fetch_array($this->result);
		if ($this->row) {
			return true;
		} else return false;
	}
}

function rdf_addTriple($s,$p,$o) {
	mysql_query("INSERT INTO rdf SET s='".addslashes($s)."', p='".addslashes($p)."', o='".addslashes($o)."'");
}

mysql_connect ("localhost","w3future","VPpniePs");
mysql_select_db ("w3future_com");

?>