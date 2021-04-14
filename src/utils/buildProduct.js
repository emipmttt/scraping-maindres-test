const tags = require("./tags/tags");
const removeDiacritic = require("./removeDiacritic");
const buildProduct = (product, pre_tags, options) => {
  /**
   * image
   * name
   * price
   * old price
   * originalid
   * tags
   * url
   */

  var productBuilded = product;

  productBuilded.name = product.name.toUpperCase();

  if (options && options.deleteDots == ".") {
    productBuilded.price = product.price.replace(/\$/g, "").replace(/\./g, "");
    productBuilded.price = productBuilded.price.replace(/ARS/g, "");
    if (productBuilded.oldPrice) {
      productBuilded.oldPrice = product.oldPrice
        .replace(/\$/g, "")
        .replace(/\./g, "");
      productBuilded.oldPrice = productBuilded.oldPrice.replace(/ARS/g, "");
    } else {
      productBuilded.oldPrice = product.price;
    }
  } else {
    productBuilded.price = product.price.replace(/\$/g, "").replace(/\,/g, "");
    productBuilded.price = productBuilded.price.replace(/ARS/g, "");
    if (productBuilded.oldPrice) {
      productBuilded.oldPrice = product.oldPrice
        .replace(/\$/g, "")
        .replace(/\,/g, "");
      productBuilded.oldPrice = productBuilded.oldPrice.replace(/ARS/g, "");
    } else {
      productBuilded.oldPrice = product.price;
    }
  }

  if (pre_tags) {
    productBuilded.tags = [...pre_tags];
  } else {
    productBuilded.tags = [];
  }

  for (item of tags) {
    for (const tag of item.options) {
      if (
        ` ${removeDiacritic(product.name + " " + product.description)
          .toLowerCase()
          .replace(/\./g, "")} `.includes(` ${removeDiacritic(tag)} `)
      ) {
        if (
          (options &&
            options.excludeTags &&
            options.excludeTags.includes(item.title)) ||
          (product.excludeTags && product.excludeTags.includes(item.title))
        ) {
          const toRemoveTagIndex = productBuilded.tags.findIndex((tagItem) => {
            return tagItem == item.title;
          });

          productBuilded.tags.splice(toRemoveTagIndex, 1);
        } else {
          productBuilded.tags.push(item.title);
        }
        break;
      }
    }
  }

  return productBuilded;
};

module.exports = buildProduct;
