const mysql = require("mysql2/promise");

const mysql_visits_cases_stats_db_initialize_tables_Main = async () => {
  const connection = await mysql.createConnection({
    host: "mysql-visits-cases-stats-db-srv",
    user: "root",
    password: "123",
  });

  await connection.beginTransaction();

  await connection.query("drop database if exists visits_cases_stats_db", []);

  await connection.query("create database visits_cases_stats_db", []);

  await connection.query("use visits_cases_stats_db", []);

  await connection.query(
    `create table pois (
      id varchar(27) primary key, 
      name varchar(90) not null, 
      address varchar(65) not null)`,
    []
  );

  await connection.query(
    `create table types (
      poi_id varchar(27) not null, 
      type varchar(23) not null, 
      primary key (poi_id, type), 
      foreign key (poi_id) references pois (id))`,
    []
  );

  await connection.query(
    `create table cases (
      id varchar(36) primary key, 
      user_id varchar(36) not null, 
      case_date date not null)`,
    []
  );

  await connection.query(
    `create table visits (
      id varchar(36) primary key, 
      user_id varchar(36) not null, 
      poi_id varchar(27) not null, 
      visit_date date not null, 
      visit_timestamp datetime not null, 
      foreign key (poi_id) references pois (id))`,
    []
  );

  await connection.commit();
  await connection.end();

  console.log("Created visits-cases-stats db.");
};

exports.mysql_visits_cases_stats_db_initialize_tables_Main =
  mysql_visits_cases_stats_db_initialize_tables_Main;
