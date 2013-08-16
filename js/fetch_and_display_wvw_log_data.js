// This script will fetch WvW data via AJAX/RESTful API, create buttons, create
// event listeners, and insert a user controllable replay of that WvW map data
// into the DOM.
//
// This page currently uses Zurb Foundation to style javascript generated buttons.
// Your template should have the following div IDs to receive this content:
// "week_buttons"       This page uses php to to insert these buttons from the php file controlling the API.
//						Example:
//							foreach ($known_matches as $key => $value):
//								echo "<button id=\"week_" . $key . 
//									"\" class=\"button tiny secondary week_button\">" . 
//									$known_matches[$key]['start_date'] . "</button>";
//							endforeach;
// "match_buttons"      Will contain 1 button for each possible user selectable match id.
// "control_buttons"    Start, stop, resume, go back, skip forward, skip to end.
// "time_area"          Contains a timestamp.
// "status"             Contains a "working" message while loading data.
// "map_area_red"
// "map_area_blue"
// "map_area_green"
// "map_area_eb"
//
// The maps are constructed using equally spaced list items from Zurb Foundation.
// If you would like to use a different method of displaying the data, note that
// the objective numbers are contained as arguments passed to the labelColor
// function.  This system looks up which server owns a given objective and returns
// a different value for each.  You can modify this basic system to work with
// nearly any front end templating framework.

window.onload = function() {
	
	// These variable are accessed throughout the script.	
    var replay = {};
    replay.week = "none";
    replay.match = "none";
    replay.server_red = "";
    replay.server_blue = "";
    replay.server_green = "";
    replay.server_red_name = "";
    replay.server_blue_name = "";
    replay.server_green_name = "";
    current_frame = 0;
    max_frames = 0;

    // This JSON file is needed in order to look up server names based on their ArenaNet server IDs.
    $.getJSON("/gw2/json/gw2_worlds.json", function(json) {
        replay.serverlist = json;
    });
    
    // Simple list of all WvW match IDs.
    var matchIDs = new Array();
    matchIDs[0] = ["1-1"];
    matchIDs[1] = ["1-2"];
    matchIDs[2] = ["1-3"];
    matchIDs[3] = ["1-4"];
    matchIDs[4] = ["1-5"];
    matchIDs[5] = ["1-6"];
    matchIDs[6] = ["1-7"];
    matchIDs[7] = ["1-8"];
    matchIDs[8] = ["2-1"];
    matchIDs[9] = ["2-2"];
    matchIDs[10] = ["2-3"];
    matchIDs[11] = ["2-4"];
    matchIDs[12] = ["2-5"];
    matchIDs[13] = ["2-6"];
    matchIDs[14] = ["2-7"];
    matchIDs[15] = ["2-8"];
    matchIDs[16] = ["2-9"];
    replay.matchIDs = matchIDs;

    // This array needs to be updated if additional weeks are added to the array
    // in the php script controlling the RESTful API.
    var weeks = new Array();
    weeks[0] = ["1"];
    weeks[1] = ["2"];
    weeks[2] = ["3"];
    replay.weeks = weeks;

    // Though the colors the servers used when this match originally happened are not
    // directed recorded, the colors can be looked up by checking which server owned
    // each of these objectives.
    function assignColors(callback){
        replay.server_green = replay.rawmapdata[0]['obj56'];
        replay.server_blue = replay.rawmapdata[0]['obj29'];
        replay.server_red = replay.rawmapdata[0]['obj39'];
        callback();
    }

    function assignNames(callback){
        $.each(replay.serverlist, function(index, value){
            if(replay.serverlist[index]['world_id'] == replay.server_green){
                replay.server_green_name = replay.serverlist[index]['name_en']
            }
            if(replay.serverlist[index]['world_id'] == replay.server_red){
                replay.server_red_name = replay.serverlist[index]['name_en']
            }
            if(replay.serverlist[index]['world_id'] == replay.server_blue){
                replay.server_blue_name = replay.serverlist[index]['name_en']
            }
        })
        callback();
    }

    // This function sets the background color of the area representing an objective on a map
    // by returning the name of a CSS class applied to that area of the map.
    function labelColor(objective_number) {
        obj_owner = replay.rawmapdata[current_frame]['obj' + objective_number];
        switch (obj_owner) {
            case 0:
                return "small_None";
                break;
            case replay.server_green:
                return "small_Green";
                break;
            case replay.server_blue:
                return "small_Blue";
                break;
            case replay.server_red:
                return "small_Red";
                break;
        }
    };

    function showTime() {
        var timeString = "<h4>Time: " + replay.rawmapdata[current_frame]['timestamp'] + " EST</h4>";
        $(".time_area").empty();
        $(timeString).appendTo(".time_area");
    }

    function showRed() {
        var redMapString = "<h5>Red (" + replay.server_red_name + ")</h5>";
        redMapString += "<div class=\"small-12 columns\">";
        redMapString += "<ul class=\"small-block-grid-5\">";
        redMapString += "<li></li>";
        redMapString += "<li></li>";
        redMapString += "<li id=\"n_camp\"><span class=\"gw2label_" + labelColor(39) + "\">camp</span></li>";
        redMapString += "<li></li>";
        redMapString += "<li></li>";
        redMapString += "</ul>";
        redMapString += "<ul class=\"small-block-grid-5\">";
        redMapString += "<li id=\"nw_camp\"><span class=\"gw2label_" + labelColor(52) + "\">camp</span></li>";
        redMapString += "<li id=\"nw_tower\"><span class=\"gw2label_" + labelColor(38) + "\">tower</span></li>";
        redMapString += "<li></li>";
        redMapString += "<li id=\"ne_tower\"><span class=\"gw2label_" + labelColor(40) + "\">tower</span></li>";
        redMapString += "<li id=\"ne_camp\"><span class=\"gw2label_" + labelColor(51) + "\">camp</span></li>";
        redMapString += "</ul>";
        redMapString += "<ul class=\"small-block-grid-5\">";
        redMapString += "<li></li>";
        redMapString += "<li></li>";
        redMapString += "<li id=\"garrison\"><span class=\"gw2label_" + labelColor(37) + "\">garrison</span></li>";
        redMapString += "<li></li>";
        redMapString += "<li></li>";
        redMapString += "</ul>";
        redMapString += "<ul class=\"small-block-grid-5\">";
        redMapString += "<li id=\"bay\"><span class=\"gw2label_" + labelColor(33) + "\">bay</span></li>";
        redMapString += "<li></li>";
        redMapString += "<li></li>";
        redMapString += "<li></li>";
        redMapString += "<li id=\"hills\"><span class=\"gw2label_" + labelColor(32) + "\">hills</span></li>";
        redMapString += "</ul>";
        redMapString += "<p></p>";
        redMapString += "<ul class=\"small-block-grid-5\">";
        redMapString += "<li id=\"sw_camp\"><span class=\"gw2label_" + labelColor(53) + "\">camp</span></li>";
        redMapString += "<li id=\"sw_tower\"><span class=\"gw2label_" + labelColor(35) + "\">tower</span></li>";
        redMapString += "<li></li>";
        redMapString += "<li id=\"se_tower\"><span class=\"gw2label_" + labelColor(36) + "\">tower</span></li>";
        redMapString += "<li id=\"se_camp\"><span class=\"gw2label_" + labelColor(50) + "\">camp</span></li>";
        redMapString += "</ul>";
        redMapString += "<ul class=\"small-block-grid-5\">";
        redMapString += "<li></li>";
        redMapString += "<li></li>";
        redMapString += "<li id=\"s_camp\"><span class=\"gw2label_" + labelColor(34) + "\">camp</span></li>";
        redMapString += "<li></li>";
        redMapString += "<li></li>";
        redMapString += "</ul>";
        redMapString += "</div>";
        $("#map_area_red").empty();
        $(redMapString).appendTo("#map_area_red");
    };

    function showGreen() {
        var greenMapString = "<h5>Green (" + replay.server_green_name + ")</h5>";
        greenMapString += "<div class=\"small-12 columns\">";
        greenMapString += "<ul class=\"small-block-grid-5\">";
        greenMapString += "<li></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li id=\"n_camp\"><span class=\"gw2label_" + labelColor(56) + "\">camp</span></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li></li>";
        greenMapString += "</ul>";
        greenMapString += "<ul class=\"small-block-grid-5\">";
        greenMapString += "<li id=\"nw_camp\"><span class=\"gw2label_" + labelColor(48) + "\">camp</span></li>";
        greenMapString += "<li id=\"nw_tower\"><span class=\"gw2label_" + labelColor(47) + "\">tower</span></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li id=\"ne_tower\"><span class=\"gw2label_" + labelColor(57) + "\">tower</span></li>";
        greenMapString += "<li id=\"ne_camp\"><span class=\"gw2label_" + labelColor(54) + "\">camp</span></li>";
        greenMapString += "</ul>";
        greenMapString += "<ul class=\"small-block-grid-5\">";
        greenMapString += "<li></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li id=\"garrison\"><span class=\"gw2label_" + labelColor(46) + "\">garrison</span></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li></li>";
        greenMapString += "</ul>";
        greenMapString += "<ul class=\"small-block-grid-5\">";
        greenMapString += "<li id=\"bay\"><span class=\"gw2label_" + labelColor(44) + "\">bay</span></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li id=\"hills\"><span class=\"gw2label_" + labelColor(41) + "\">hills</span></li>";
        greenMapString += "</ul>";
        greenMapString += "<p></p>";
        greenMapString += "<ul class=\"small-block-grid-5\">";
        greenMapString += "<li id=\"sw_camp\"><span class=\"gw2label_" + labelColor(49) + "\">camp</span></li>";
        greenMapString += "<li id=\"sw_tower\"><span class=\"gw2label_" + labelColor(45) + "\">tower</span></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li id=\"se_tower\"><span class=\"gw2label_" + labelColor(42) + "\">tower</span></li>";
        greenMapString += "<li id=\"se_camp\"><span class=\"gw2label_" + labelColor(55) + "\">camp</span></li>";
        greenMapString += "</ul>";
        greenMapString += "<ul class=\"small-block-grid-5\">";
        greenMapString += "<li></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li id=\"s_camp\"><span class=\"gw2label_" + labelColor(43) + "\">camp</span></li>";
        greenMapString += "<li></li>";
        greenMapString += "<li></li>";
        greenMapString += "</ul>";
        greenMapString += "</div>";
        $("#map_area_green").empty();
        $(greenMapString).appendTo("#map_area_green");
    };

    function showBlue() {
        var blueMapString = "<h5>Blue (" + replay.server_blue_name + ")</h5>";
        blueMapString += "<div class=\"small-12 columns\">";
        blueMapString += "<ul class=\"small-block-grid-5\">";
        blueMapString += "<li></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li id=\"n_camp\"><span class=\"gw2label_" + labelColor(29) + "\">camp</span></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li></li>";
        blueMapString += "</ul>";
        blueMapString += "<ul class=\"small-block-grid-5\">";
        blueMapString += "<li id=\"nw_camp\"><span class=\"gw2label_" + labelColor(58) + "\">camp</span></li>";
        blueMapString += "<li id=\"nw_tower\"><span class=\"gw2label_" + labelColor(30) + "\">tower</span></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li id=\"ne_tower\"><span class=\"gw2label_" + labelColor(28) + "\">tower</span></li>";
        blueMapString += "<li id=\"ne_camp\"><span class=\"gw2label_" + labelColor(60) + "\">camp</span></li>";
        blueMapString += "</ul>";
        blueMapString += "<ul class=\"small-block-grid-5\">";
        blueMapString += "<li></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li id=\"garrison\"><span class=\"gw2label_" + labelColor(23) + "\">garrison</span></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li></li>";
        blueMapString += "</ul>";
        blueMapString += "<ul class=\"small-block-grid-5\">";
        blueMapString += "<li id=\"bay\"><span class=\"gw2label_" + labelColor(27) + "\">bay</span></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li id=\"hills\"><span class=\"gw2label_" + labelColor(31) + "\">hills</span></li>";
        blueMapString += "</ul>";
        blueMapString += "<p></p>";
        blueMapString += "<ul class=\"small-block-grid-5\">";
        blueMapString += "<li id=\"sw_camp\"><span class=\"gw2label_" + labelColor(59) + "\">camp</span></li>";
        blueMapString += "<li id=\"sw_tower\"><span class=\"gw2label_" + labelColor(25) + "\">tower</span></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li id=\"se_tower\"><span class=\"gw2label_" + labelColor(26) + "\">tower</span></li>";
        blueMapString += "<li id=\"se_camp\"><span class=\"gw2label_" + labelColor(61) + "\">camp</span></li>";
        blueMapString += "</ul>";
        blueMapString += "<ul class=\"small-block-grid-5\">";
        blueMapString += "<li></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li id=\"s_camp\"><span class=\"gw2label_" + labelColor(24) + "\">camp</span></li>";
        blueMapString += "<li></li>";
        blueMapString += "<li></li>";
        blueMapString += "</ul>";
        blueMapString += "</div>";
        currentlyViewedMap = 2;
        $("#map_area_blue").empty();
        $(blueMapString).appendTo("#map_area_blue");
    };

    function showEB() {
        var ebMapString = "<h5>EB</h5>";
        ebMapString += "<div class=\"small-12 columns\">";
        ebMapString += "<ul class=\"small-block-grid-9\">";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(17) + "\">Mendon's</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(20) + "\">Veloka</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "</ul>";
        ebMapString += "<ul class=\"small-block-grid-9\">";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(6) + "\">Speldan</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(1) + "\">Overlook</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "</ul>";
        ebMapString += "<ul class=\"small-block-grid-9\">";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(5) + "\">Pangloss</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "</ul>";
        ebMapString += "<ul class=\"small-block-grid-9\">";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(18) + "\">Anzalias</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(19) + "\">Ogre</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "</ul>";
        ebMapString += "<ul class=\"small-block-grid-9\">";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(10) + "\">Rogue's</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "</ul>";
        ebMapString += "<ul class=\"small-block-grid-9\">";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(12) + "\">Wildcreek</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(9) + "\">Stonemist</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(21) + "\">Durios</span></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(8) + "\">Umber</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "</ul>";
        ebMapString += "<ul class=\"small-block-grid-9\">";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(11) + "\">Aldon's</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(22) + "\">Bravost</span></li>";
        ebMapString += "</ul>";
        ebMapString += "<ul class=\"small-block-grid-9\">";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(3) + "\">Lowlands</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(14) + "\">Klovan</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(16) + "\">Quentin</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(2) + "\">Valley</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "</ul>";
        ebMapString += "<ul class=\"small-block-grid-9\">";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(13) + "\">Jerrifer's</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(4) + "\">Golanta</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(7) + "\">Danelon</span></li>";
        ebMapString += "<li><span class=\"gw2label_" + labelColor(15) + "\">Langor</span></li>";
        ebMapString += "<li></li>";
        ebMapString += "</ul>";
        ebMapString += "</div>";
        $("#map_area_eb").empty();
        $(ebMapString).appendTo("#map_area_eb");
    };

    function makeButtons(callback){
        // the buttons for known weeks are generated by php

        // makes a button for each possible match ID
        match_buttons = "";
        $.each(replay.matchIDs, function(index, value){
            match_buttons += "<button id=\"match_" + index + "\" class=\"button tiny secondary match_button\">" + value + "</button>";
        });
        $(match_buttons).appendTo("#match_buttons");

        // make a start button
        start_button = "<button id=\"start_button\" class=\"button tiny secondary control_button\">start</button>";
        $(start_button).appendTo("#control_buttons");

        // make a stop button
        stop_button = "<button id=\"stop_button\" class=\"button tiny secondary control_button\">stop</button>";
        $(stop_button).appendTo("#control_buttons");

        // make a resume button
        resume_button = "<button id=\"resume_button\" class=\"button tiny secondary control_button\">resume</button>";
        $(resume_button).appendTo("#control_buttons");

        // make an rewind one step button
        rewind_by_one_button = "<button id=\"rewind_by_one_button\" class=\"button tiny secondary control_button\">back</button>";
        $(rewind_by_one_button).appendTo("#control_buttons");

        // make an advance one step button
        advance_by_one_button = "<button id=\"advance_by_one_button\" class=\"button tiny secondary control_button\">forward</button>";
        $(advance_by_one_button).appendTo("#control_buttons");

        // make a 'skip to most recent' button
        skip_to_end_button = "<button id=\"skip_to_end_button\" class=\"button tiny secondary control_button\">skip to end</button>";
        $(skip_to_end_button).appendTo("#control_buttons");

        callback();
    }
    
    function makeListeners(callback){

        // makes a listener for each week button that was generated via php in the html below
        // "replay.number_of_weeks" is hard coded at the top of this script
        $.each(replay.weeks, function(index, value){
            document.getElementById("week_" + value[0]).addEventListener("click", function(event) {
                replay.week = value[0];
                $(".week_button").addClass("secondary");
                $(".week_button").removeClass("primary");
                $("#week_" + value[0]).removeClass("secondary");
                $("#week_" + value[0]).addClass("primary");
                if(typeof replay.rawmapdata != 'undefined'){
                    clearInterval(replayinterval);
                    $(".control_button").addClass("secondary");
                    $(".control_button").removeClass("primary");
                    $("#start_button").removeClass("secondary");
                    $("#start_button").addClass("primary");
                    startNewReplay();
                }
            });
        });

        // makes a listener for each match button generated by makeButtons() above
        $.each(replay.matchIDs, function(index, value){
            document.getElementById("match_" + index).addEventListener("click", function(event) {
                replay.match = value[0];
                $(".match_button").addClass("secondary");
                $(".match_button").removeClass("primary");
                $("#match_" + index).removeClass("secondary");
                $("#match_" + index).addClass("primary");
                if(typeof replay.rawmapdata != 'undefined'){
                    clearInterval(replayinterval);
                    $(".control_button").addClass("secondary");
                    $(".control_button").removeClass("primary");
                    $("#start_button").removeClass("secondary");
                    $("#start_button").addClass("primary");
                    startNewReplay();
                }
            });
        });

        // listener for the start button
        document.getElementById("start_button").addEventListener("click", function(event) {
            if(replay.week != "none" || replay.match != "none"){
                $(".control_button").addClass("secondary");
                $(".control_button").removeClass("primary");
                $("#start_button").removeClass("secondary");
                $("#start_button").addClass("primary");
                startNewReplay();
            }
        });

        // listener for the stop button
        document.getElementById("stop_button").addEventListener("click", function(event) {
            $(".control_button").addClass("secondary");
            $(".control_button").removeClass("primary");
            $("#stop_button").removeClass("secondary");
            $("#stop_button").addClass("primary");
            clearInterval(replayinterval);
        });

        // listener for the resume button
        document.getElementById("resume_button").addEventListener("click", function(event) {
            $(".control_button").addClass("secondary");
            $(".control_button").removeClass("primary");
            $("#start_button").removeClass("secondary");
            $("#start_button").addClass("primary");
            replayinterval = setInterval(showReplay,1000);
        });

        // listener for 'advance by one' button
        document.getElementById("advance_by_one_button").addEventListener("click", function(event) {
            $(".control_button").addClass("secondary");
            $(".control_button").removeClass("primary");
            if(current_frame < max_frames -1){
                current_frame++;
                showTime();
                showRed();
                showBlue();
                showGreen();
                showEB();
            }
        });

        // listener for 'rewind by one' button
        document.getElementById("rewind_by_one_button").addEventListener("click", function(event) {
            $(".control_button").addClass("secondary");
            $(".control_button").removeClass("primary");
            if(current_frame > 0){
                current_frame--;
                showTime();
                showRed();
                showBlue();
                showGreen();
                showEB();
            }
        });

        // listener for 'skip to end' button
        document.getElementById("skip_to_end_button").addEventListener("click", function(event) {
            $(".control_button").addClass("secondary");
            $(".control_button").removeClass("primary");
            $("#skip_to_end_button").removeClass("secondary");
            $("#skip_to_end_button").addClass("primary");
            clearInterval(replayinterval);
            if(current_frame < max_frames){
                current_frame = max_frames - 1;
                showTime();
                showRed();
                showBlue();
                showGreen();
                showEB();
            }
        });

        callback();
    }

    function fetchMatchData(callback){
        $("#status").html("<b>working</b>");
        $.ajax({
            url: "http://aedosen.com/gw2/replay/index.php?weekid=" + replay.week + "&matchid=" + replay.match,
            // data: {},
            type: "GET",
            dataType : "json",
            success: function( json ) {
                replay.rawmapdata = json;
                max_frames = json.length;
                current_frame = 0;
            },
            error: function( xhr, status ) {
                console.log( "error fetching raw map data" );
            },
            complete: function( xhr, status ) {
                $("#status").html("");
                callback();
            }
        });
    }

    function pageStartup(){
        makeButtons(function() {
            makeListeners(function() {
            })
        })
    }

    function showReplay(){
        if(current_frame > max_frames){
            clearInterval(replayinterval);
        } else {
            showTime();
            showRed();
            showBlue();
            showGreen();
            showEB();
        }
        current_frame++;
    }

    function startNewReplay() {
        $("#map_area_eb").empty();
        $("#map_area_red").empty();
        $("#map_area_blue").empty();
        $("#map_area_green").empty();
        $("#time_area").empty();
        fetchMatchData(function() {
            assignColors(function() {
                assignNames(function() {
                    replayinterval = setInterval(showReplay,1000);
                })
            })
        })
    }

    pageStartup();

}