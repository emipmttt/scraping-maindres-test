const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://www.airborn.com.ar");
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(document.querySelectorAll("#menu a"));
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

          await autoScroll(page);

          const clickOnShowMore = async () => {
            await page.waitForTimeout(1000);

            try {
              await page.waitForSelector("#loadMoreBtn", {
                timeout: 3000,
              });

              await page.click("#loadMoreBtn");

              await clickOnShowMore();
            } catch (error) {
              console.log("No se pudo Mostrar Productos");
              console.log(error);
            }
          };

          await clickOnShowMore();

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(document.querySelectorAll(".title a"));

              products = products.map((el) => {
                return el.href;
              });

              products = [...new Set(products)];

              resolve(products);
            });
          });

          for (productUrl of products) {
            try {
              await page.goto(productUrl);
            } catch (error) {
              console.log("Error al abrir el producto", productUrl);
            }

            var isTrueProduct = false;

            try {
              await page.waitForSelector(".jTscroller .cloud-zoom-gallery", {
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

                  data.image = document.querySelector(
                    ".jTscroller .cloud-zoom-gallery"
                  ).href;

                  data.name = document.querySelector(".title h1").innerText;
                  if (document.querySelector("#price_display")) {
                    data.price = document.querySelector(
                      "#price_display"
                    ).innerText;
                  }

                  if (document.querySelector("#compare_price_display")) {
                    data.oldPrice = document.querySelector(
                      "#compare_price_display"
                    ).innerText;
                  } else {
                    data.oldPrice = data.price;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  // data.description =
                  //   data.name +
                  //   " " +
                  //   document.querySelector("#detalles p").innerText;

                  data.brand = {
                    title: "airborn",
                    url: "https://www.airborn.com.ar/",
                  };
                  return data;
                });

                const product = buildProduct(webData, ["hombre", "airborn"]);
                await addProduct(product, dateScraping);
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
      }
    }
  } catch (error) {}
};
