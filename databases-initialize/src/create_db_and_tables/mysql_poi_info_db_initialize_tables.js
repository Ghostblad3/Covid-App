const mysql = require("mysql2/promise");

const mysql_poi_info_db_initialize_tables_Main = async () => {
  const connection = await mysql.createConnection({
    host: "mysql-poi-info-db-srv",
    user: "root",
    password: "123",
  });

  await connection.beginTransaction();

  await connection.query("drop database if exists poi_info_db", []);

  await connection.query("create database poi_info_db", []);

  await connection.query("use poi_info_db", []);

  await connection.query(
    `create table pois (
      id varchar(27) primary key, 
      name varchar(90) not null, 
      address varchar(65) not null, 
      latitude varchar(40) not null, 
      longitude varchar(40) not null)`,
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

  await connection.commit();
  await connection.end();

  console.log("Created poi info db.");
};

exports.mysql_poi_info_db_initialize_tables_Main =
  mysql_poi_info_db_initialize_tables_Main;
