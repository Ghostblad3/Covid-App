var format = require("date-fns/format");
const { connection } = require("./connection");

const addCase = async (data) => {
  const obj = JSON.parse(data);

  const con = connection.getConnection();

  await con.query(
    `insert into cases (id, user_id, case_date) values (?, ?, ?)`,
    [obj.id, obj.user_id, formatDate(new Date(obj.case_date))]
  );

  console.log("Added case.");
};

const formatDate = (input) => {
  return format(input, "yyyy-MM-dd");
};

module.exports = { addCase };
