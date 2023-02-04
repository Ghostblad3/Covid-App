const mysql = require("mysql2/promise");

const mysql_cases_db_initialize_tables_Main = async () => {
  const connection = await mysql.createConnection({
    host: "mysql-cases-db-srv",
    user: "root",
    password: "123",
  });

  await connection.beginTransaction();

  await connection.query("drop database if exists cases_db", []);

  await connection.query("create database cases_db", []);

  await connection.query("use cases_db", []);

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

  console.log("Created cases db.");
};

exports.mysql_cases_db_initialize_tables_Main =
  mysql_cases_db_initialize_tables_Main;
