const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://www.equus.com.ar/categorias");
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(
          document.querySelectorAll(".search-single-navigator .categorias a")
        );
        nav = nav.map((category) => {
          return category.href;
        });
        return nav;
      });

      console.log(routes);

      for (category of routes) {
        if (category != null) {
          console.log("[CATEGORY] - Abriendo " + category);

          await page.goto(category);

          await autoScroll(page);

          const clickOnShowMore = async () => {
            await autoScroll(page);
            console.log("Intentando mostrar más productos");
            await page.waitForTimeout(1000);

            try {
              await page.waitForSelector(".continue-loading", {
                timeout: 3000,
              });

              await page.click(".continue-loading");

              await clickOnShowMore();
            } catch (error) {
              console.log("No se pudo Mostrar Productos");
              console.log(error);
            }
          };

          await clickOnShowMore();

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(document.querySelectorAll(".flags a"));

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
              console.log("Se abrió url correctamente");
            } catch (error) {
              console.log("Error al abrir el producto");
            }

            var isTrueProduct = false;

            console.log("Intentando encontrar imagen");

            try {
              await page.waitForSelector(".product-image #show .zoomImg", {
                timeout: 3000,
              });
              isTrueProduct = true;
              console.log("Imagen1 encontrada");
            } catch {
              console.log("Imagen1 no encontrada");
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};

                  data.image = document.querySelector(
                    ".product-image #show .zoomImg"
                  ).src;
                  data.name = document.querySelector(".productName").innerText;
                  if (document.querySelector(".skuBestPrice")) {
                    data.price = document.querySelector(
                      ".skuBestPrice"
                    ).innerText;
                  }

                  if (document.querySelector(".skuBestPrice")) {
                    data.oldPrice = document.querySelector(
                      ".skuBestPrice"
                    ).innerText;
                  } else {
                    data.oldPrice = document.querySelector(
                      ".skuBestPrice"
                    ).innerText;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  data.description =
                    data.name +
                    " " +
                    document.querySelector(".productDescription").innerText;

                  data.brand = {
                    title: "equus",
                    url: "https://www.equus.com.ar/",
                  };
                  return data;
                });

                console.log(webData);

                const product = buildProduct(webData, ["hombre", "equus"]);
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
