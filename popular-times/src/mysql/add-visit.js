const mysql = require("mysql2/promise");
var format = require("date-fns/format");
const { connection } = require("./connection");

const addVisit = async (data) => {
  const obj = JSON.parse(data);

  const con = connection.getConnection();

  await con.query(
    `insert into visits (id, user_id, poi_id, visit_date, visit_timestamp) values (?, ?, ?, ?, ?)`,
    [
      obj.id,
      obj.user_id,
      obj.poi_id,
      formatDate(new Date(obj.visit_date)),
      formatTimestamp(new Date(obj.visit_timestamp)),
    ]
  );

  console.log("Added visit.");
};

const formatDate = (input) => {
  return format(input, "yyyy-MM-dd");
};

const formatTimestamp = (input) => {
  return format(input, "yyyy-MM-dd HH:mm:ss");
};

module.exports = { addVisit };
