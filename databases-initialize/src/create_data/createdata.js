const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
const _ = require("lodash");
var haversine = require("haversine-distance");
var add = require("date-fns/add");
var format = require("date-fns/format");
var differenceInSeconds = require("date-fns/differenceInSeconds");
var sub = require("date-fns/sub");
const crypto = require("crypto");
const { User, userSchema } = require("../models/user");
const { UserCase, userCaseSchema } = require("../models/user_case");

async function createdata() {
  var startingPeriod = subDays(
    new Date(`${formatDate(new Date()).split(" ")[0]} 00:00:00`),
    28
  );

  var endPeriod = subDays(
    new Date(`${formatDate(new Date()).split(" ")[0]} 00:00:00`),
    1
  );
  const users = await getUsers();

  const visits = await createVisits(users, startingPeriod, endPeriod);

  const cases = createCases(0.3, users, startingPeriod, endPeriod);

  // 1 -> visits
  // 2 -> cases

  await addVisitsAndCasesInMysqlDb(visits, cases);
  await addVisitsToVisitsMySQLDb(visits);
  await addCasesToCasesMongoDb(cases);
  await addVisitsToPopTimesMySqlDb(visits);
  await addVisitsAndCasesInVisitsCasesStatsMysqlDb(visits, cases);

  console.log("Created data.");
}

async function getUsers() {
  const conn = mongoose.createConnection(
    "mongodb://mongo-users-db-srv:27017/users"
  );
  const User = conn.model("User", userSchema);

  const result = await User.aggregate([
    {
      $match: {
        is_admin: { $eq: 0 },
      },
    },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        username: "$username",
        password: "$password",
        email: "$email",
        is_admin: "$is_admin",
      },
    },
  ]);

  return result;
}

function addDays(date, day) {
  return new Date(
    add(date, {
      days: day,
    })
  );
}

function subDays(date, day) {
  return new Date(
    sub(date, {
      days: day,
    })
  );
}

function addHours(date, hour) {
  return new Date(
    add(date, {
      hours: hour,
    })
  );
}

function addMinutes(date, minute) {
  return new Date(
    add(date, {
      minutes: minute,
    })
  );
}

function formatDate(input) {
  return format(input, "yyyy-MM-dd HH:mm:ss");
}

function getDistanceInKM(pointA, pointB) {
  return haversine(pointA, pointB) / 1000;
}

async function createVisits(users, startingPeriod, endPeriod) {
  const pois = await getAllPois();

  var currDate = addMinutes(startingPeriod, 360);
  var finalDate = addMinutes(endPeriod, 1440);

  var visits = [];

  while (currDate <= finalDate) {
    const specificDateVisits = await createVisitsForSpecificDay(
      users,
      currDate,
      pois
    );

    specificDateVisits.forEach((visit) => visits.push(visit));

    currDate = addDays(currDate, 1);
  }

  return visits;
}

async function createVisitsForSpecificDay(users, date, pois) {
  const maxVisitsForUser = _.random(5, 10);
  var visits = [];

  users.forEach((user) => {
    const visitsForSpecificUser = createVisitsForSpecificDayForSpecificUser(
      user,
      date,
      pois,
      maxVisitsForUser
    );

    visitsForSpecificUser.forEach((visit) => visits.push(visit));
  });

  return visits;
}

function createVisitsForSpecificDayForSpecificUser(user, date, pois) {
  var visits = [];
  var currVisits = 1;
  var currPoiIndex = _.random(0, pois.length - 1);

  visits.push({
    _id: crypto.randomBytes(12).toString("hex"),
    user_id: user.id,
    poi_id: pois[currPoiIndex].id,
    _date: _.split(formatDate(date), " ")[0],
    _timestamp: formatDate(date),
  });

  var currentPoi = pois[currPoiIndex];
  var nextDate = date;
  const finalDate = addHours(nextDate, 18);

  while (nextDate < finalDate) {
    const possibleNextVisitPois = findPossibleNextVisitPois(currentPoi, pois);

    const currRemainInSamePoiMinutes = _.random(10, 120);

    currPoiIndex = _.random(0, possibleNextVisitPois.length - 1);

    const nextPoiToVisit = possibleNextVisitPois[currPoiIndex];

    const distance = getDistanceInKM(
      {
        lat: currentPoi.latitude,
        lng: currentPoi.longitude,
      },
      { lat: nextPoiToVisit.latitude, lng: nextPoiToVisit.longitude }
    );

    const minutesToTravel = _.ceil(distance * 20);

    if (
      differenceInSeconds(
        finalDate,
        new Date(visits[visits.length - 1]._timestamp)
      ) >
      (currRemainInSamePoiMinutes + minutesToTravel) * 60
    ) {
      nextDate = addMinutes(
        new Date(visits[visits.length - 1]._timestamp),
        currRemainInSamePoiMinutes + minutesToTravel
      );

      visits.push({
        _id: crypto.randomBytes(12).toString("hex"),
        user_id: user.id,
        poi_id: nextPoiToVisit.id,
        _date: _.split(formatDate(nextDate), " ")[0],
        _timestamp: formatDate(nextDate),
      });

      currentPoi = nextPoiToVisit;
      currVisits = currVisits + 1;
    } else {
      break;
    }
  }

  return visits;
}

function findPossibleNextVisitPois(currPoi, pois) {
  const possibleNextVisitPois = pois.filter(
    (poi) =>
      getDistanceInKM(
        { lat: currPoi.latitude, lng: currPoi.longitude },
        { lat: poi.latitude, lng: poi.longitude }
      ) <= 5 && currPoi.id !== poi.id
  );

  return possibleNextVisitPois;
}

function createCases(ratio, users, startingPeriod, endPeriod) {
  var cases = [];
  var currentDay = startingPeriod;

  const infectedPeople = _.ceil(users.length * ratio);

  while (currentDay <= endPeriod) {
    var randomIds = getRandomIds(
      infectedPeople,
      users.length - 1,
      users.map((user) => user.id)
    );

    randomIds.forEach((id) => {
      cases.push({
        _id: crypto.randomBytes(12).toString("hex"),
        user_id: id,
        case_date: formatDate(currentDay).split(" ")[0],
      });
    });

    currentDay = addDays(currentDay, 14);
  }

  return cases;
}

function getRandomIds(number, numberOfIds, ids) {
  var randomIds = [];
  for (var i = 1; i <= number; i++) {
    var id = ids[_.random(0, numberOfIds - 1)];

    while (randomIds.find((x) => x === id)) {
      id = ids[_.random(0, numberOfIds - 1)];
    }

    randomIds.push(id);
  }
  return randomIds;
}

async function getAllPois() {
  const connection = await mysql.createConnection({
    host: "mysql-poi-info-db-srv",
    user: "root",
    password: "123",
    database: "poi_info_db",
  });

  await connection.beginTransaction();

  const [pois] = await connection.query(
    `select * 
    from pois`,
    []
  );

  await connection.commit();
  await connection.end();

  pois.forEach((poi) => {
    poi.latitude = parseFloat(poi.latitude);
    poi.longitude = parseFloat(poi.longitude);
  });

  pois.forEach((poi) => {
    poi.latitude = parseFloat(poi.latitude);
    poi.longitude = parseFloat(poi.longitude);
  });

  return pois;
}

async function addVisitsAndCasesInMysqlDb(visits, cases) {
  const connection = await mysql.createConnection({
    host: "mysql-cases-db-srv",
    user: "root",
    password: "123",
    database: "cases_db",
  });

  await connection.beginTransaction();

  await connection.query(
    "insert into visits (id, user_id, poi_id, visit_date, visit_timestamp) values ?",
    [visits.map((visit) => _.values(visit))]
  );

  await connection.query(
    "insert into cases (id, user_id, case_date) values ?",
    [cases.map((itemCase) => _.values(itemCase))]
  );

  await connection.commit();
  await connection.end();

  console.log("Added visits to cases mysql db.");
}

async function addVisitsAndCasesInVisitsCasesStatsMysqlDb(visits, cases) {
  const connection = await mysql.createConnection({
    host: "mysql-visits-cases-stats-db-srv",
    user: "root",
    password: "123",
    database: "visits_cases_stats_db",
  });

  await connection.beginTransaction();

  await connection.query(
    "insert into visits (id, user_id, poi_id, visit_date, visit_timestamp) values ?",
    [visits.map((visit) => _.values(visit))]
  );

  await connection.query(
    "insert into cases (id, user_id, case_date) values ?",
    [cases.map((itemCase) => _.values(itemCase))]
  );

  await connection.commit();
  await connection.end();

  console.log("Added visits to visits-cases-stats mysql db.");
}

async function addVisitsToVisitsMySQLDb(visits) {
  const connection = await mysql.createConnection({
    host: "mysql-visits-db-srv",
    user: "root",
    password: "123",
    database: "visits_db",
  });

  await connection.beginTransaction();

  await connection.query(
    "insert into visits (id, user_id, poi_id, visit_date, visit_timestamp) values ?",
    [visits.map((visit) => _.values(visit))]
  );

  await connection.commit();
  await connection.end();

  console.log("Added visits to visits mysql db.");
}

async function addCasesToCasesMongoDb(cases) {
  const conn = mongoose.createConnection(
    "mongodb://mongo-user-cases-db-srv:27017/cases"
  );
  const UserCase = conn.model("UserCase", userCaseSchema);

  var bulk = [];

  cases.forEach((item) => {
    bulk.push({ insertOne: { document: item } });
  });

  await UserCase.bulkWrite(bulk);

  console.log("Added cases in users cases mongodb.");
}

async function addVisitsToPopTimesMySqlDb(visits) {
  const connection = await mysql.createConnection({
    host: "mysql-pop-times-visits-db-srv",
    user: "root",
    password: "123",
    database: "pop_times_db",
  });

  await connection.beginTransaction();

  await connection.query(
    "insert into visits (id, user_id, poi_id, visit_date, visit_timestamp) values ?",
    [visits.map((visit) => _.values(visit))]
  );

  await connection.commit();
  await connection.end();

  console.log("Added visits to popular times mysql db.");
}

exports.createdata = createdata;
