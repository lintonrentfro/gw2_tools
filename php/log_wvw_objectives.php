<?php

// Purpose
//
// This script is designed to be run routinely (e.g., as a cronjob) to request
// the status of all WvW map objectives using the Guild Wars 2 API and store
// that data in a structured (mysql in this case) database.  The time, matchid,
// and server number corresponding to each map objective is stored on each row.
//
//
// Notes on Usage
//
// Because objectives cannot be retaken by another server until 5 minutes have
// passed, it's recommended to schedule the frequency of running this script in
// intervals between 4 and 5 minutes.
// As of the date of this document, there are 17 WvW matches, each consisting
// of 4 maps with a total of 61 map objectives across all 4 maps for each match.
// Matches reset each Friday at approximately 9:20pm EST (the time is never
// exact).  Immediately after match reset, this script will store a value of
// "0" for any objective that is not claimed by a server.
//
//
// Customization
//
// This script is currently setup to use a pdo object, so require the php file
// that contains your mysql database access settings at the top.
//
//
// SQL to Create Table
//
// CREATE TABLE IF NOT EXISTS `wvwlog` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `matchid` varchar(20) NOT NULL,
//   `timestamp` varchar(20) NOT NULL,
//   `obj1` int(4) DEFAULT NULL,
//   `obj2` int(4) DEFAULT NULL,
//   `obj3` int(4) DEFAULT NULL,
//   `obj4` int(4) DEFAULT NULL,
//   `obj5` int(4) DEFAULT NULL,
//   `obj6` int(4) DEFAULT NULL,
//   `obj7` int(4) DEFAULT NULL,
//   `obj8` int(4) DEFAULT NULL,
//   `obj9` int(4) DEFAULT NULL,
//   `obj10` int(4) DEFAULT NULL,
//   `obj11` int(4) DEFAULT NULL,
//   `obj12` int(4) DEFAULT NULL,
//   `obj13` int(4) DEFAULT NULL,
//   `obj14` int(4) DEFAULT NULL,
//   `obj15` int(4) DEFAULT NULL,
//   `obj16` int(4) DEFAULT NULL,
//   `obj17` int(4) DEFAULT NULL,
//   `obj18` int(4) DEFAULT NULL,
//   `obj19` int(4) DEFAULT NULL,
//   `obj20` int(4) DEFAULT NULL,
//   `obj21` int(4) DEFAULT NULL,
//   `obj22` int(4) DEFAULT NULL,
//   `obj23` int(4) DEFAULT NULL,
//   `obj24` int(4) DEFAULT NULL,
//   `obj25` int(4) DEFAULT NULL,
//   `obj26` int(4) DEFAULT NULL,
//   `obj27` int(4) DEFAULT NULL,
//   `obj28` int(4) DEFAULT NULL,
//   `obj29` int(4) DEFAULT NULL,
//   `obj30` int(4) DEFAULT NULL,
//   `obj31` int(4) DEFAULT NULL,
//   `obj32` int(4) DEFAULT NULL,
//   `obj33` int(4) DEFAULT NULL,
//   `obj34` int(4) DEFAULT NULL,
//   `obj35` int(4) DEFAULT NULL,
//   `obj36` int(4) DEFAULT NULL,
//   `obj37` int(4) DEFAULT NULL,
//   `obj38` int(4) DEFAULT NULL,
//   `obj39` int(4) DEFAULT NULL,
//   `obj40` int(4) DEFAULT NULL,
//   `obj41` int(4) DEFAULT NULL,
//   `obj42` int(4) DEFAULT NULL,
//   `obj43` int(4) DEFAULT NULL,
//   `obj44` int(4) DEFAULT NULL,
//   `obj45` int(4) DEFAULT NULL,
//   `obj46` int(4) DEFAULT NULL,
//   `obj47` int(4) DEFAULT NULL,
//   `obj48` int(4) DEFAULT NULL,
//   `obj49` int(4) DEFAULT NULL,
//   `obj50` int(4) DEFAULT NULL,
//   `obj51` int(4) DEFAULT NULL,
//   `obj52` int(4) DEFAULT NULL,
//   `obj53` int(4) DEFAULT NULL,
//   `obj54` int(4) DEFAULT NULL,
//   `obj55` int(4) DEFAULT NULL,
//   `obj56` int(4) DEFAULT NULL,
//   `obj57` int(4) DEFAULT NULL,
//   `obj58` int(4) DEFAULT NULL,
//   `obj59` int(4) DEFAULT NULL,
//   `obj60` int(4) DEFAULT NULL,
//   `obj61` int(4) DEFAULT NULL,
//   PRIMARY KEY (`id`)
// ) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;


$matches = array(
    0 => "1-1",
    1 => "1-2",
    2 => "1-3",
    3 => "1-4",
    4 => "1-5",
    5 => "1-6",
    6 => "1-7",
    7 => "1-8",
    8 => "2-1",
    9 => "2-2",
    10 => "2-3",
    11 => "2-4",
    12 => "2-5",
    13 => "2-6",
    14 => "2-7",
    15 => "2-8",
    16 => "2-9"
);

function matchlist() {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.guildwars2.com/v1/wvw/matches.json");
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    $curlRes = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($curlRes, true);
    return $data;
};

// usage:matchData("1-2") returns array of match data
// scores go in order: red, blue, green
// maps go in order: red bg, green bg, blue bg, eb
// bg maps have 13 objectives each
// eb has 22 objectives
// there are 61 total objectives
function matchData($match) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.guildwars2.com/v1/wvw/match_details.json?match_id=" . $match);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    $curlRes = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($curlRes, true);
    return $data;
}

function record($matchdata, $matchlist, $matchid) {

    $siteroot = '/home/aedosenc/';
    include $siteroot . 'apps/gw2/includes_php/db.wvwlog.inc.php';

    $mapdata = array();

    foreach ($matchlist['wvw_matches'] as $key=>$value){
        if (array_search($matchid, $value)) {
            foreach ($value as $key=>$value){
                if ($key == "red_world_id") {
                    $red = $value;
                }
                if ($key == "blue_world_id") {
                    $blue = $value;
                }
                if ($key == "green_world_id") {
                    $green = $value;
                }
            }
        }
    }

    for ($i=0; $i<13; $i++) {
        foreach ($matchdata["maps"]['0']['objectives'][$i] as $key=>$value) {
            if ($key == 'id') {
                $objectiveid = $value;
            };
            if ($key == 'owner') {
                $objectiveowner = $value;
            };
        };
        $mapdata[$objectiveid] = $objectiveowner;
    };
    for ($i=0; $i<13; $i++) {
        foreach ($matchdata["maps"]['1']['objectives'][$i] as $key=>$value) {
            if ($key == 'id') {
                $objectiveid = $value;
            };
            if ($key == 'owner') {
                $objectiveowner = $value;
            };
        };
        $mapdata[$objectiveid] = $objectiveowner;
    };
    for ($i=0; $i<13; $i++) {
        foreach ($matchdata["maps"]['2']['objectives'][$i] as $key=>$value) {
            if ($key == 'id') {
                $objectiveid = $value;
            };
            if ($key == 'owner') {
                $objectiveowner = $value;
            };
        };
        $mapdata[$objectiveid] = $objectiveowner;
    };
    for ($i=0; $i<22; $i++) {
        foreach ($matchdata["maps"]['3']['objectives'][$i] as $key=>$value) {
            if ($key == 'id') {
                $objectiveid = $value;
            };
            if ($key == 'owner') {
                $objectiveowner = $value;
            };
        };
        $mapdata[$objectiveid] = $objectiveowner;
    };

    ksort($mapdata);

    foreach ($mapdata as $key=>$value) {
         if ($value == "Red") {
             $mapdata[$key] = $red;
         };
         if ($value == "Blue") {
             $mapdata[$key] = $blue;
         };
         if ($value == "Green") {
             $mapdata[$key] = $green;
         };
    }

    $time = date("Y-m-d H:i:s");
    $matchid = $matchdata['match_id'];
    $sql = 'INSERT INTO wvwlog SET
        matchid = :matchid,
        timestamp = :timestamp,
        obj1 = :obj1,
        obj2 = :obj2,
        obj3 = :obj3,
        obj4 = :obj4,
        obj5 = :obj5,
        obj6 = :obj6,
        obj7 = :obj7,
        obj8 = :obj8,
        obj9 = :obj9,
        obj10 = :obj10,
        obj11 = :obj11,
        obj12 = :obj12,
        obj13 = :obj13,
        obj14 = :obj14,
        obj15 = :obj15,
        obj16 = :obj16,
        obj17 = :obj17,
        obj18 = :obj18,
        obj19 = :obj19,
        obj20 = :obj20,
        obj21 = :obj21,
        obj22 = :obj22,
        obj23 = :obj23,
        obj24 = :obj24,
        obj25 = :obj25,
        obj26 = :obj26,
        obj27 = :obj27,
        obj28 = :obj28,
        obj29 = :obj29,
        obj30 = :obj30,
        obj31 = :obj31,
        obj32 = :obj32,
        obj33 = :obj33,
        obj34 = :obj34,
        obj35 = :obj35,
        obj36 = :obj36,
        obj37 = :obj37,
        obj38 = :obj38,
        obj39 = :obj39,
        obj40 = :obj40,
        obj41 = :obj41,
        obj42 = :obj42,
        obj43 = :obj43,
        obj44 = :obj44,
        obj45 = :obj45,
        obj46 = :obj46,
        obj47 = :obj47,
        obj48 = :obj48,
        obj49 = :obj49,
        obj50 = :obj50,
        obj51 = :obj51,
        obj52 = :obj52,
        obj53 = :obj53,
        obj54 = :obj54,
        obj55 = :obj55,
        obj56 = :obj56,
        obj57 = :obj57,
        obj58 = :obj58,
        obj59 = :obj59,
        obj60 = :obj60,
        obj61 = :obj61';
    $s = $pdo->prepare($sql);
    $s->bindValue(':matchid', $matchid);
    $s->bindValue(':timestamp', $time);
    $s->bindValue(':obj1', $mapdata['1']);
    $s->bindValue(':obj2', $mapdata['2']);
    $s->bindValue(':obj3', $mapdata['3']);
    $s->bindValue(':obj4', $mapdata['4']);
    $s->bindValue(':obj5', $mapdata['5']);
    $s->bindValue(':obj6', $mapdata['6']);
    $s->bindValue(':obj7', $mapdata['7']);
    $s->bindValue(':obj8', $mapdata['8']);
    $s->bindValue(':obj9', $mapdata['9']);
    $s->bindValue(':obj10', $mapdata['10']);
    $s->bindValue(':obj11', $mapdata['11']);
    $s->bindValue(':obj12', $mapdata['12']);
    $s->bindValue(':obj13', $mapdata['13']);
    $s->bindValue(':obj14', $mapdata['14']);
    $s->bindValue(':obj15', $mapdata['15']);
    $s->bindValue(':obj16', $mapdata['16']);
    $s->bindValue(':obj17', $mapdata['17']);
    $s->bindValue(':obj18', $mapdata['18']);
    $s->bindValue(':obj19', $mapdata['19']);
    $s->bindValue(':obj20', $mapdata['20']);
    $s->bindValue(':obj21', $mapdata['21']);
    $s->bindValue(':obj22', $mapdata['22']);
    $s->bindValue(':obj23', $mapdata['23']);
    $s->bindValue(':obj24', $mapdata['24']);
    $s->bindValue(':obj25', $mapdata['25']);
    $s->bindValue(':obj26', $mapdata['26']);
    $s->bindValue(':obj27', $mapdata['27']);
    $s->bindValue(':obj28', $mapdata['28']);
    $s->bindValue(':obj29', $mapdata['29']);
    $s->bindValue(':obj30', $mapdata['30']);
    $s->bindValue(':obj31', $mapdata['31']);
    $s->bindValue(':obj32', $mapdata['32']);
    $s->bindValue(':obj33', $mapdata['33']);
    $s->bindValue(':obj34', $mapdata['34']);
    $s->bindValue(':obj35', $mapdata['35']);
    $s->bindValue(':obj36', $mapdata['36']);
    $s->bindValue(':obj37', $mapdata['37']);
    $s->bindValue(':obj38', $mapdata['38']);
    $s->bindValue(':obj39', $mapdata['39']);
    $s->bindValue(':obj40', $mapdata['40']);
    $s->bindValue(':obj41', $mapdata['41']);
    $s->bindValue(':obj42', $mapdata['42']);
    $s->bindValue(':obj43', $mapdata['43']);
    $s->bindValue(':obj44', $mapdata['44']);
    $s->bindValue(':obj45', $mapdata['45']);
    $s->bindValue(':obj46', $mapdata['46']);
    $s->bindValue(':obj47', $mapdata['47']);
    $s->bindValue(':obj48', $mapdata['48']);
    $s->bindValue(':obj49', $mapdata['49']);
    $s->bindValue(':obj50', $mapdata['50']);
    $s->bindValue(':obj51', $mapdata['51']);
    $s->bindValue(':obj52', $mapdata['52']);
    $s->bindValue(':obj53', $mapdata['53']);
    $s->bindValue(':obj54', $mapdata['54']);
    $s->bindValue(':obj55', $mapdata['55']);
    $s->bindValue(':obj56', $mapdata['56']);
    $s->bindValue(':obj57', $mapdata['57']);
    $s->bindValue(':obj58', $mapdata['58']);
    $s->bindValue(':obj59', $mapdata['59']);
    $s->bindValue(':obj60', $mapdata['60']);
    $s->bindValue(':obj61', $mapdata['61']);
    $s->execute();
}

$matchlist = matchlist();

foreach ($matches as $key=>$value) {
    $matchdata = matchData($value);
    record($matchdata, $matchlist, $value);
}

exit();