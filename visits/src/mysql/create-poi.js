const { connection } = require("./connection");

const createPoi = async (data) => {
  const obj = JSON.parse(data);
  const { poiData, poiTypesData } = obj;
  const poi = poiData.map((item) => [item[0], item[1], item[2]]);

  const con = connection.getConnection();

  await con.beginTransaction();

  await con.query(`insert into pois (id, name, address) values ?`, [poi]);

  await con.query(`insert into types (poi_id, type) values ?`, [poiTypesData]);

  await con.commit();

  console.log("Created new poi.");
};

module.exports = { createPoi };
