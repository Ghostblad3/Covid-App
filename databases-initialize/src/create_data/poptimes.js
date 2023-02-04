const mysql = require("mysql2/promise");
const _ = require("lodash");
var add = require("date-fns/add");
var differenceInHours = require("date-fns/differenceInHours");
var sub = require("date-fns/sub");

async function createPopTimes() {
  const connection = await mysql.createConnection({
    host: "mysql-pop-times-visits-db-srv",
    user: "root",
    database: "pop_times_db",
    password: "123",
    multipleStatements: true,
  });

  const { lastMonday, lastSunday } = getLastWeek();

  const result = await getVisitsAsync(lastMonday, lastSunday);

  result.forEach((item) => {
    item.timestamp = new Date(item.timestamp);
  });

  const unique = _.uniqBy(result, function (e) {
    return e.poi_id;
  }).map((item) => item.poi_id);

  var currStart = lastMonday;
  var currStop = addHours(currStart, 1);
  var stop = lastSunday;

  var visitsPerHour = [];
  var day = 1;
  var hour = 1;

  while (currStart < stop) {
    calculateVisitsPerHour(
      unique,
      day,
      hour,
      result,
      currStart,
      currStop,
      visitsPerHour
    );

    if (hour < 24) {
      hour = hour + 1;
    } else {
      hour = 1;
      day = day + 1;
    }

    currStart = addHours(currStart, 1);
    currStop = addHours(currStop, 1);
  }

  unique.forEach((id) => {
    var peak = 0;

    visitsPerHour.forEach((visits) => {
      if (visits[0] === id && visits[3] > peak) {
        peak = visits[3];
      }
    });

    visitsPerHour.forEach((visits) => {
      if (visits[0] === id) {
        visits[3] = _.ceil((visits[3] / peak) * 100);
      }
    });
  });

  await connection.beginTransaction();

  await connection.query("delete from popular_times", []);

  await connection.query(
    "insert into popular_times (poi_id, day, hour, popularity) values ?",
    [visitsPerHour]
  );

  await connection.commit();
  await connection.end();

  console.log("Created popular times.");
}

function getLastWeek() {
  const currDate = new Date();

  let currDateAtMidnight = new Date(
    currDate.getFullYear(),
    currDate.getMonth(),
    currDate.getDate()
  );

  let lastMonday;
  let lastSunday;

  switch (currDateAtMidnight.getDay()) {
    case 0:
      lastSunday = subDays(currDateAtMidnight, 7);
      lastMonday = subDays(lastSunday, 6);
      break;
    case 1:
      lastSunday = subDays(currDateAtMidnight, 1);
      lastMonday = subDays(lastSunday, 6);
      break;
    case 2:
      lastSunday = subDays(currDateAtMidnight, 2);
      lastMonday = subDays(lastSunday, 6);
      break;
    case 3:
      lastSunday = subDays(currDateAtMidnight, 3);
      lastMonday = subDays(lastSunday, 6);
      break;
    case 4:
      lastSunday = subDays(currDateAtMidnight, 4);
      lastMonday = subDays(lastSunday, 6);
      break;
    case 5:
      lastSunday = subDays(currDateAtMidnight, 5);
      lastMonday = subDays(lastSunday, 6);
      break;
    case 6:
      lastSunday = subDays(currDateAtMidnight, 6);
      lastMonday = subDays(lastSunday, 6);
      break;
  }

  lastSunday = addHours(lastSunday, 24);

  return { lastMonday, lastSunday };
}

function calculateVisitsPerHour(
  unique,
  day,
  hour,
  result,
  currStart,
  currStop,
  popTimes
) {
  unique.forEach((item) => {
    counter = 0;

    result.forEach((resultItem) => {
      if (
        resultItem.poi_id === item &&
        resultItem.timestamp >= currStart &&
        resultItem.timestamp < currStop
      ) {
        counter = counter + 1;
      }
    });

    popTimes.push([item, day, hour, counter]);
  });
}

async function getVisitsAsync(lastMonday, lastSunday) {
  const connection = await mysql.createConnection({
    host: "mysql-cases-db-srv",
    user: "root",
    database: "cases_db",
    password: "123",
  });

  const [result] = await connection.query(
    `select poi_id, visit_timestamp as timestamp 
    from visits 
    where visit_timestamp >= ? and visit_timestamp <= ?`,
    [lastMonday, lastSunday]
  );

  await connection.end();

  return result;
}

function addHours(date, hour) {
  return new Date(
    add(date, {
      hours: hour,
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

exports.createPopTimes = createPopTimes;
