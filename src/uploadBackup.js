const products = require("./backup.js");
const mongo = require("./lib/mongo.js");

for (const product of products) {
  delete product._id;
  mongo.create("products", product);
}
return;
