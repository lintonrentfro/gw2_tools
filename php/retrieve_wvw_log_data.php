<?php

// Purpose
//
// This script is designed to function as a RESTful API on your own server that
// retrieves all WvW log data for a given week and match id as stored using the
// "log_wvw_objectives.php" script.
//
//
// Notes on Usage
//
// Because the weekly reset of WvW matches occurs at a slightly different time
// each week, the breakpoints in the database between weeks must be manually
// identified and updated in the $known_matches array.  The time between match
// resets is approximately 165,608 minutes, but varies by several minutes each
// week.
// Example of AJAX request for week 1 of your recorded weeks and match id 1-2
// during that week:
//
// http://domain.com/this_script.php?weekid=1&matchid=1-2
//
//
// Customization
//
// This script is currently setup to use a pdo object, so require the php file
// that contains your mysql database access settings at the top.
//
//

$siteroot = '';

// define the mysql rows for each known WvW match (by week) and number them in
// an array
$known_matches = array();

// these array entries are here as an example, but you will need to build your
// own based on the row id's of your table and the start dates for the weeks you
// have recorded
//
// $known_matches['1'] = array(
//     "start_date"=>"07-26-3013",
//     "start_row"=>7454,
//     "end_row"=>50088
// );
// $known_matches['2'] = array(
//     "start_date"=>"08-02-3013",
//     "start_row"=>50089,
//     "end_row"=>91491
// );
// $known_matches['3'] = array(
//     "start_date"=>"08-09-3013",
//     "start_row"=>91492,
//     "end_row"=>1000000
// );


if (isset($_GET['weekid']) AND isset($_GET['matchid'])){
    // get the raw data for the week and match requested
    $start_row = $known_matches[$_GET['weekid']]['start_row'];
    $end_row = $known_matches[$_GET['weekid']]['end_row'];
    $match_id = $_GET['matchid'];
    $sql = 'SELECT *
        FROM wvwlog
        WHERE id >= ' . $start_row . ' AND id <= ' . $end_row . ' AND matchid = "' . $match_id . '"';
    $s = $pdo->prepare($sql);
    $s->execute();
    $rawdata = $s->fetchall(PDO::FETCH_ASSOC);

    echo json_encode($rawdata);
    exit();
}
