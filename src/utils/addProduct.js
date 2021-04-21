const mongo = require("../lib/mongo");
module.exports = async (product, dateScraping) => {
  var find = await mongo.getByOriginalId(product.originalId);

  if (find) {
    let productId = find._id;
    delete find._id;
    let newProduct = { ...find, ...product };
    newProduct.tags = find.tags.concat(product.tags);
    newProduct.tags = [...new Set(newProduct.tags)];
    newProduct.lastUpdate = dateScraping;
    newProduct.image = product.image;
    await mongo.update("products", productId, newProduct);
    console.log(newProduct.name + " - " + newProduct.price + ` (actualizado) `);
    console.log(newProduct.tags.join());
  } else {
    product.lastUpdate = dateScraping;
    await mongo.create("products", product);
    console.log(product.name + " - " + product.price + ` (nuevo) `);
    console.log(product.tags.join());
  }
};
