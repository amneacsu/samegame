<?php

include 'config.php';
mysql_connect($sql['hostname'], $sql['username'], $sql['password']);
mysql_Select_db($sql['database']);

if (isset($_POST['op'])) $op = $_POST['op'];
else die();


if ($op == 'set') {
	foreach (array('playername', 'ruleset', 'score', 'colors', 'moves') as $h) {
		if (isset($_POST[$h])) $$h = $_POST[$h];
		else die();
	}

	$playername = strip_tags($playername);

	if ($score < 10000) {
		$query = "INSERT INTO score_samegame (playername, ruleset, score, address, referer, colors, moves, timestamp) VALUES ('$playername', '$ruleset', $score, '" . $_SERVER['REMOTE_ADDR'] . "', '" . $referer = $_SERVER['HTTP_REFERER'] . "', $colors, $moves, " . time() . ")";
		mysql_query($query);
	}
} else if ($op == 'get') {
	header('Content-type: application/json');

	foreach (array('page', 'ruleset') as $h) {
		if (isset($_POST[$h])) $$h = $_POST[$h];
		else die();
	}

	$query = "SELECT playername,score FROM score_samegame WHERE ruleset = '$ruleset' ORDER BY score DESC LIMIT " . ($page * 10) . ", 10";
	$select = mysql_query($query);
	$output = '';
	for ($i = 0; $i < mysql_num_rows($select); $i++) {
		$row = mysql_fetch_assoc($select);
		$output .= json_encode($row) . ',';
	}

	echo '[' . substr($output, 0, -1) . ']';
}
