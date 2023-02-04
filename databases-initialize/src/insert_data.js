const createdata = require("./create_data/createdata.js");
const createusers = require("./create_data/createusers.js");
const createpoi = require("./create_data/createpoi.js");
const poptimes = require("./create_data/poptimes.js");

async function main() {
  await createusers.createClients(30);
  await createpoi.createPoi(150);
  await createdata.createdata();
  await poptimes.createPopTimes();
}

exports.main = main;
