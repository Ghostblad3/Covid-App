const mysqlFirst = require("./create_db_and_tables/mysql_cases_db_initialize_tables.js");
const mysqlSecond = require("./create_db_and_tables/mysql_poi_info_db_initialize_tables.js");
const mysqlThird = require("./create_db_and_tables/mysql_pop_times_visits_db.js");
const mysqlForth = require("./create_db_and_tables/mysql_visits_db_initialize_tables.js");
const mysqlFifth = require("./create_db_and_tables/mysql_visits_cases_stats_db_initialize_tables.js");
const mysqlSixth = require("./create_db_and_tables/mysql_add_update_poi_db_initialize_tabls.js");

async function main() {
  await mysqlFirst.mysql_cases_db_initialize_tables_Main();
  await mysqlSecond.mysql_poi_info_db_initialize_tables_Main();
  await mysqlThird.mysql_pop_times_visits_db_Main();
  await mysqlForth.mysql_visits_db_initialize_tables_Main();
  await mysqlFifth.mysql_visits_cases_stats_db_initialize_tables_Main();
  await mysqlSixth.mysql_add_update_poi_db_initialize_tables_Main();
}

exports.main = main;
