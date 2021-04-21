const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://tiendaroland.com/");
        console.log("___tiendaroland___");
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(
          document.querySelectorAll("#shopkeeper-menu-item-3481 a")
        );
        nav = nav.map((category) => {
          return category.href;
        });

        nav = [...new Set(nav)];

        return nav;
      });

      console.log(routes);

      for (category of routes) {
        if (category != null) {
          console.log("[CATEGORY] - Abriendo " + category);

          await page.goto(category);

          //   await autoScroll(page);

          //   const clickOnShowMore = async () => {
          //     await page.waitForTimeout(1000);

          //     try {
          //       await page.waitForSelector('[data-hook="load-more-button"]', {
          //         timeout: 5000,
          //       });

          //       await page.click('[data-hook="load-more-button"]');

          //       await clickOnShowMore();
          //     } catch (error) {
          //       console.log("No se pudo Mostrar Productos");
          //       console.log(error);
          //     }
          //   };

          //   await clickOnShowMore();

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(
                document.querySelectorAll("#content .columns li a")
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
              await page.waitForSelector(".zoomImg", {
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

                  data.image = document.querySelector(".zoomImg").src;

                  data.name = document.querySelector("h1").innerText;
                  if (document.querySelector(".price")) {
                    data.price = document.querySelector(".price").innerText;
                  }

                  //   if (
                  //     document.querySelector(
                  //       '[data-hook="formatted-secondary-price"]'
                  //     )
                  //   ) {
                  //     data.oldPrice = document.querySelector(
                  //       '[data-hook="formatted-secondary-price"]'
                  //     ).innerText;
                  //   } else {
                  //     data.oldPrice = data.price;
                  //   }

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
                    title: "tiendaroland",
                    url: "https://tiendaroland.com/",
                  };
                  return data;
                });

                const product = buildProduct(webData, ["tiendaroland"]);
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
