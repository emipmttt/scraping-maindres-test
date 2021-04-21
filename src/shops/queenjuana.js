const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://www.queenjuana.com/");
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(document.querySelectorAll(".menu li a"));
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
          await page.waitForTimeout(2000);
          await autoScroll(page, 300, 200);
          const getProductsURL = async () => {
            return await page.evaluate(() => {
              return new Promise((resolve) => {
                let products = Array.from(
                  document.querySelectorAll("a.product-link")
                );

                products = products.map((el) => {
                  return el.href;
                });

                products = [...new Set(products)];

                resolve(products);
              });
            });
          };

          let products = [];
          let pages = 0;

          const clickOnShowMore = async () => {
            await page.waitForTimeout(1000);
            try {
              await page.waitForSelector(".next", {
                timeout: 3000,
              });
              await page.waitForSelector(".next.pgEmpty", {
                timeout: 3000,
              });
              const localProducts = await getProductsURL();
              await page.click(".next");
              pages++;
              if (products.length == localProducts.length) return;
              else products = [...products, ...localProducts];
              await clickOnShowMore();
            } catch (error) {
              console.log("No se pudo Mostrar Productos");
              console.log(error);
            }
          };

          await clickOnShowMore();

          console.log(
            "Se encontraron " +
              pages +
              " Páginas y " +
              products.length +
              " productos en esta categoría"
          );

          for (productUrl of products) {
            try {
              await page.goto(productUrl);
            } catch (error) {
              console.log("Error al abrir el producto " + productUrl);
            }

            var isTrueProduct = false;

            try {
              await page.waitForSelector(".prodname", {
                timeout: 3000,
              });
              isTrueProduct = true;
            } catch {
              console.log("Imagen1 no encontrada " + productUrl);
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};

                  data.image = document.querySelector(
                    "#image .image-zoom"
                  ).href;
                  data.name = document.querySelector(".prodname").innerText;

                  if (document.querySelector(".bestPrice")) {
                    data.price = document.querySelector(".bestPrice").innerText;
                  }

                  if (document.querySelector(".listPrice")) {
                    data.oldPrice = document.querySelector(
                      ".listPrice"
                    ).innerText;
                  } else {
                    data.oldPrice = document.querySelector(
                      ".bestPrice"
                    ).innerText;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  data.description =
                    data.name +
                    " " +
                    document.querySelector(".productDescription").innerText;

                  data.brand = {
                    title: "queenjuana",
                    url: "https://www.queenjuana.com/",
                  };
                  return data;
                });

                const product = buildProduct(webData, ["queenjuana"]);
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
