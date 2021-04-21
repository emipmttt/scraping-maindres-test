const mongo = require("./lib/mongo");
const dateScraping = 1618992651742;
mongo.updateMany("products", { $lt: dateScraping }, { active: false });
