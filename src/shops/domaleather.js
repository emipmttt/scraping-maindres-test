
const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://domaleather.com.ar/");
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(
          document.querySelectorAll(".primary-menu-inner .x-menu-link")
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
            await page.waitForTimeout(1000);

            try {
              await page.waitForSelector(".btn-load-more", {
                timeout: 3000,
              });

              await page.click(".infinite-loader");

              await clickOnShowMore();
            } catch (error) {
              console.log("No se pudo Mostrar Productos");
              console.log(error);
            }
          };

          await clickOnShowMore();

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(
                document.querySelectorAll(".product-name .gsf-link")
              );

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
              console.log("Error al abrir el producto");
            }

            var isTrueProduct = false;

            console.log("Intentando encontrar imagen");

            try {
              await page.waitForSelector(
                ".single-product-image .size-shop_single",
                {
                  timeout: 3000,
                }
              );
              isTrueProduct = true;
            } catch {
              console.log("Imagen1 no encontrada");
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};

                  data.image = document.querySelector(
                    ".single-product-image .size-shop_single"
                  ).src;
                  data.name = document.querySelector(
                    ".product_title"
                  ).innerText;
                  if (document.querySelector(".price span")) {
                    data.price = document.querySelector(
                      ".price span"
                    ).innerText;
                  } else if (document.querySelector(".price ins span")) {
                    data.price = document.querySelector(
                      ".price ins span"
                    ).innerText;
                  }

                  if (document.querySelector(".price del span")) {
                    data.oldPrice = document.querySelector(
                      ".price del span"
                    ).innerText;
                  } else {
                    data.oldPrice = document.querySelector(
                      ".price span"
                    ).innerText;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  data.description =
                    data.name +
                    " " +
                    document.querySelector(
                      ".woocommerce-product-details__short-description"
                    ).innerText;

                  data.brand = {
                    title: "domaleather",
                    url: "https://domaleather.com.ar/",
                  };
                  return data;
                });

                const product = buildProduct(webData, ["mujer"]);
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
