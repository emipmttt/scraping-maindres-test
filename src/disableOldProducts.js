const mongo = require("./lib/mongo");
const dateScraping = 1618992651742;
(async () => {
  try {
    console.log("Enabling new products");
    await mongo.updateMany(
      "products",
      { lastUpdate: dateScraping },
      { $set: { active: true } }
    );
    console.log("Done");

    console.log("Disabling old products");

    await mongo.updateMany(
      "products",
      { lastUpdate: { $lt: dateScraping } },
      { $set: { active: false } }
    );
    console.log("done");
    return;
  } catch (error) {
    console.log(error);
  }
})();
