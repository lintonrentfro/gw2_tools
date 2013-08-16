This is a collection of json objects, php code snippets, and javascript that I
used to create the tools at http://aedosen.com/gw2.

js

fetch_and_display_wvw_log_data.js (retrieves a given week and match ID's data and displays it over time)
	
php

log_wvw_objectives.php (designed to run as a cron job recording all WvW map data to a mysql db)
retrieve_wvw_log_data.php (RESTful API that returns all map data for a given week and match ID)