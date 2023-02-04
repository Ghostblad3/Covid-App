const fs = require("fs").promises;
const _ = require("lodash");

async function main() {
  const files = await fs.readdir("./Json_files/");

  var data = [];

  await Promise.all(
    files.map(async function (file) {
      const str = await fs.readFile("./Json_files/" + file, "utf8");

      var json = await JSON.parse(str.toString());

      json.forEach(function (currentItem) {
        delete currentItem["rating"];
        delete currentItem["rating_n"];
        delete currentItem["current_popularity"];
        delete currentItem["time_spent"];
      });

      data.push(json);
    }, data)
  );

  var finalJson = [];

  data.forEach((item) => {
    item.forEach((subItem) => {
      subItem.types = subItem.types.map((subsubitem) =>
        subsubitem.replace(/\s*_/g, " ")
      );

      finalJson.push(subItem);
    });
  });

  finalJson = _.uniqBy(finalJson, function (e) {
    return e.id;
  });

  finalJson = _.uniqBy(finalJson, function (e) {
    return e.name + e.address;
  });

  await fs.writeFile("./Json_files/final.json", JSON.stringify(finalJson));
}

main();
