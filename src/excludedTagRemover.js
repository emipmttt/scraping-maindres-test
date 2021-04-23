const mongo = require("./lib/mongo");
const axios = require("axios");
const removeTags = async () => {
  const backendURL = "http://localhost:3000";
  const products = (await axios.post(backendURL + "/products/get")).data.data;
  let updatedProducts = 0;
  for (const product of products) {
    if (product.excludeTags && product.excludeTags.length) {
      let tags = [];

      for (const tag of product.tags) {
        if (!product.excludeTags.includes(tag)) {
          tags.push(tag);
        }
      }

      const newProductId = product._id;
      delete product._id;

      await mongo.update("products", newProductId, {
        tags: tags, //await getNewTags(),
        // multipleTagsRemoved: Date.now(),
      });
      updatedProducts++;
    }
  }
  console.log("Terminado - " + updatedProducts + " actualizados");
};

removeTags();
