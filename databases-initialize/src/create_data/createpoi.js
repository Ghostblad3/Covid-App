const fs = require("fs").promises;
const mysql = require("mysql2/promise");
const _ = require("lodash");

const day = [
  { d: "Monday", num: 1 },
  { d: "Tuesday", num: 2 },
  { d: "Wednesday", num: 3 },
  { d: "Thursday", num: 4 },
  { d: "Friday", num: 5 },
  { d: "Saturday", num: 6 },
  { d: "Sunday", num: 7 },
];

async function createPoi(LIMIT) {
  const data = await fs.readFile("./Json-files/final.json", "utf8");
  var jsonData = JSON.parse(data.toString());

  var poisData = [];
  var typesData = [];
  var popularTimesData = [];

  var counter = 0;

  jsonData.forEach((item) => {
    counter = counter + 1;

    if (counter <= LIMIT) {
      poisData.push(
        _.values({
          id: item.id,
          name: item.name,
          address: item.address,
          latitude: item["coordinates"].lat,
          longitude: item["coordinates"].lng,
        })
      );

      item.types.forEach((typeItem) => {
        typesData.push(
          _.values({
            poi_id: item.id,
            type: typeItem,
          })
        );
      });

      item.populartimes.forEach((popTimeItem) => {
        var counter = 1;

        popTimeItem.data.forEach((dataItem) => {
          popularTimesData.push(
            _.values({
              poi_id: item.id,
              day: day.find((x) => x.d === popTimeItem.name).num,
              hour: counter,
              popularity: dataItem,
            })
          );

          counter = counter + 1;
        });
      });
    }
  });

  await addDataForPoiInfoDb(poisData, typesData);
  await addDataForContactWithCasesDb(poisData, typesData);
  await addDataForVisitsDb(poisData, typesData);
  await addDataForVisitCasesStatssDb(poisData, typesData);
  await addDataForAddUpdatePoiDb(poisData, typesData);

  console.log("Created poi and type data.");
}

const addDataForPoiInfoDb = async (poisData, typesData) => {
  const connection = await mysql.createConnection({
    host: "mysql-poi-info-db-srv",
    user: "root",
    password: "123",
  });

  await connection.beginTransaction();

  await connection.query("use poi_info_db", []);

  await connection.query(
    "insert into pois (id, name, address, latitude, longitude) values ?",
    [poisData]
  );

  await connection.query("insert into types (poi_id, type) values ?", [
    typesData,
  ]);

  await connection.commit();
  await connection.end();
};

const addDataForAddUpdatePoiDb = async (poisData, typesData) => {
  const connection = await mysql.createConnection({
    host: "mysql-add-update-poi-db-srv",
    user: "root",
    password: "123",
  });

  await connection.beginTransaction();

  await connection.query("use add_update_poi_db", []);

  await connection.query(
    "insert into pois (id, name, address, latitude, longitude) values ?",
    [poisData]
  );

  await connection.query("insert into types (poi_id, type) values ?", [
    typesData,
  ]);

  await connection.commit();
  await connection.end();
};

const addDataForContactWithCasesDb = async (poisData, typesData) => {
  const connection = await mysql.createConnection({
    host: "mysql-cases-db-srv",
    user: "root",
    password: "123",
  });

  await connection.beginTransaction();

  await connection.query("use cases_db", []);

  await connection.query("insert into pois (id, name, address) values ?", [
    poisData.map((item) => [item[0], item[1], item[2]]),
  ]);

  await connection.query("insert into types (poi_id, type) values ?", [
    typesData,
  ]);

  await connection.commit();
  await connection.end();
};

const addDataForVisitsDb = async (poisData, typesData) => {
  const connection = await mysql.createConnection({
    host: "mysql-visits-db-srv",
    user: "root",
    password: "123",
    database: "visits_db",
  });

  await connection.beginTransaction();

  await connection.query("insert into pois (id, name, address) values ?", [
    poisData.map((item) => [item[0], item[1], item[2]]),
  ]);

  await connection.query("insert into types (poi_id, type) values ?", [
    typesData,
  ]);

  await connection.commit();
  await connection.end();
};

const addDataForVisitCasesStatssDb = async (poisData, typesData) => {
  const connection = await mysql.createConnection({
    host: "mysql-visits-cases-stats-db-srv",
    user: "root",
    password: "123",
    database: "visits_cases_stats_db",
  });

  await connection.beginTransaction();

  await connection.query("insert into pois (id, name, address) values ?", [
    poisData.map((item) => [item[0], item[1], item[2]]),
  ]);

  await connection.query("insert into types (poi_id, type) values ?", [
    typesData,
  ]);

  await connection.commit();
  await connection.end();
};

exports.createPoi = createPoi;
