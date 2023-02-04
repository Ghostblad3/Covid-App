const { connection } = require("./connection");

const addPopularTimes = async (data) => {
  const obj = JSON.parse(data);
  const con = connection.getConnection();

  await con.query(
    `insert into popular_times (poi_id, day, hour, popularity) values ?`,
    [obj]
  );

  console.log("Added popular-times.");
};

module.exports = { addPopularTimes };
