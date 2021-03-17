
const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const fs = require("fs");
// const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      const startDate = new Date();
      try {
        await page.goto("https://www.oklan.com.ar");
        console.log("______________________OKLAN____________________");
      } catch (error) {}

      // const routes = await page.evaluate(async () => {
      //   // routes es el array que guarda los enlaces
      //   // de las categorías
      //   let nav = Array.from(document.querySelectorAll("#headmenu li a"));
      //   nav = nav.map((category) => {
      //     return category.href;
      //   });
      //   return nav;
      // });

      const routes = ["https://www.oklan.com.ar/productos/"];

      const routesLength = routes.length;
      if (routesLength) {
        console.log(`Se encontraron ${routesLength} categorías`);
        console.log("Enlaces");
        console.log(routes);
      } else {
        console.log("No se encontraron categorías");
      }

      var newProductsLength = 0;

      for (category of routes) {
        if (category != null) {
          console.log("[Categoría]: " + category);
          console.log("Oklan muestra más productos a través de un botón");

          await page.goto(category);

          const clickOnShowMore = async () => {
            console.log("Intentando mostrar más productos a través del botón");
            await page.waitForTimeout(1000);

            try {
              await page.waitForSelector("#loadMoreBtn", {
                timeout: 3000,
              });

              await page.click("#loadMoreBtn");
              console.log("Botón encontrado, cargando más productos...");
              await clickOnShowMore();
            } catch (error) {
              console.log("No se pudo Mostrar Productos...");
              console.log(error);
            }
          };

          await clickOnShowMore();

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(
                document.querySelectorAll(".product-item a")
              );

              products = products.map((el) => {
                return el.href;
              });

              products = [...new Set(products)];

              resolve(products);
            });
          });

          console.log(
            `En esta categoría se encontraron ${products.length} productos`
          );

          for (productUrl of products) {
            try {
              await page.goto(productUrl);
              console.log("Obteniendo producto: " + productUrl);
            } catch (error) {
              console.log("Error al abrir el producto");
            }

            var isTrueProduct = false;

            console.log("Intentando encontrar imagen del producto");

            try {
              await page.waitForSelector(".imagecolContent img", {
                timeout: 3000,
              });
              isTrueProduct = true;
              console.log("Imagen del producto encontrada");
            } catch {
              console.log(
                "Producto sin imagen, saltando al siguiente producto"
              );
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};

                  data.image = document.querySelector(
                    ".imagecolContent img"
                  ).src;
                  data.name = document.querySelector("h1").innerText;
                  if (document.querySelector("#price_display.price-compare")) {
                    data.price = document.querySelector(
                      "#price_display.price-compare"
                    ).innerText;
                    data.oldPrice = document.querySelector(".price").innerText;
                  } else {
                    data.price = document.querySelector(".price").innerText;
                    data.oldPrice = document.querySelector(".price").innerText;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  data.description =
                    data.name +
                    " " +
                    document.querySelector("#description p").innerText;

                  data.brand = {
                    title: "oklan",
                    url: "https://www.oklan.com.ar/",
                  };
                  return data;
                });

                const product = buildProduct(webData, ["mujer"]);

                console.log("Producto obtenido correctamente");
                newProductsLength++;
                await addProduct(product, dateScraping);
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
      }
      const finishDate = new Date();

      const brandMessage = `[OKLAN] [${
        (finishDate.valueOf() - startDate.valueOf()) / 1000 / 60
      }] - ${newProductsLength} productos En total`;
      console.log(brandMessage);
      fs.appendFile(
        `log/scraping_resume_${dateScraping}.txt`,
        brandMessage + "\n",
        (err) => {
          if (err) throw err;
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};
