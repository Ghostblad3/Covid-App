const first = require("./build_databases.js");
const second = require("./insert_data.js");

async function main() {
  const interval = setInterval(async () => {
    try {
      await first.main();
      await second.main();
      clearInterval(interval);
      process.exit();
    } catch (e) {
      console.log(e);
    }
  }, 40000);
}

main();
