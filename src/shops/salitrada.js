const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        console.log("___salitrada___");
      } catch (error) {}

      const routes = ["https://www.salitrada.com/shop/"];

      console.log(routes);

      for (category of routes) {
        if (category != null) {
          console.log("[CATEGORY] - Abriendo " + category);

          await page.goto(category);

          await autoScroll(page);

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(
                document.querySelectorAll(".product-element-top>a")
              );

              products = products.map((el) => {
                return el.href;
              });

              products = [...new Set(products)];

              resolve(products);
            });
          });

          console.log("Productos encontrados: " + products.length);

          for (productUrl of products) {
            try {
              await page.goto(productUrl);
            } catch (error) {
              console.log("Error al abrir el producto", productUrl);
            }

            var isTrueProduct = false;

            try {
              await page.waitForSelector(".wp-post-image", {
                timeout: 3000,
              });
              isTrueProduct = true;
            } catch {
              console.log("Imagen no encontrada", productUrl);
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};

                  data.image = document.querySelector(".wp-post-image").src;

                  data.name = document.querySelector("h1").innerText;
                  if (
                    document.querySelector(".woocommerce-Price-currencySymbol")
                  ) {
                    data.price = document.querySelector(
                      ".woocommerce-Price-currencySymbol"
                    ).innerText;
                    data.oldPrice = document.querySelector(
                      ".woocommerce-Price-currencySymbol"
                    ).innerText;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  if (
                    document.querySelector(
                      ".woocommerce-product-details__short-description"
                    )
                  ) {
                    data.description =
                      data.name +
                      " " +
                      document.querySelector(
                        ".woocommerce-product-details__short-description"
                      ).innerText;
                  } else {
                    data.description = data.name;
                  }

                  data.brand = {
                    title: "salitrada",
                    url: "https://www.salitrada.com/",
                  };
                  return data;
                });

                const product = buildProduct(webData, ["salitrada","mujer"]);
                await addProduct(product, dateScraping);
              } catch (error) {
                console.log("____");
                console.log(error);
                console.log("____");
              }
            }
          }
        }
      }
    }
  } catch (error) {}
};
