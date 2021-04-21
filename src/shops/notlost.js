const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      var productList = [];

      const startDate = new Date();
      var productLenght = 0;
      try {
        console.log("______NOT LOST______");
      } catch (error) {}

      await page.waitForTimeout(1000);

      const routes = ["http://notlost.store/productos/"];

      console.log("Categorías encontradas: ");
      console.log("\n" + routes.join("\n"));

      for (category of routes) {
        console.log("[Categoría] - Abriendo " + category);

        await page.goto(category);

        var products = [];
        var showScreen = 0;

        const getProducts = async () => {
          try {
            let localProducts = await page.evaluate(() => {
              return new Promise((resolve) => {
                let products = Array.from(
                  document.querySelectorAll(".products li a")
                );

                products = products.map((el) => {
                  return el.href;
                });

                products = [...new Set(products)];

                resolve(products);
              });
            });

            products = [...products, ...localProducts];
            // console.log("Intentando Mostrar más productos");
            // await page.waitForTimeout(1000);
            // await page.click(".toolbar-bottom .next");
            // showScreen++;
            // console.log('Se encontraron más prodcutos');
            // await getProducts();
          } catch (error) {
            console.log(
              `Se obtuvieron ${showScreen} paginas de esta sección ${category}`
            );
            console.log(error);
          }
        };

        await getProducts();

        console.log(
          `Se encontraron ${products.length} productos de esta categoría`
        );

        productLenght += products.length;

        var productAdded = 0;

        for (productUrl of products) {
          try {
            await page.goto(productUrl);
          } catch (error) {
            console.log("Error al abrir el producto");
          }

          var isTrueProduct = false;

          try {
            await page.waitForSelector(".wp-post-image", {
              timeout: 3000,
            });
            isTrueProduct = true;
          } catch {
            console.log(
              "No se encontró imagen para este producto - " + productUrl
            );
            isTrueProduct = false;
          }
          if (isTrueProduct) {
            try {
              const webData = await page.evaluate(() => {
                var data = {};

                data.image = document.querySelector(".wp-post-image").src;
                data.name = document.querySelector("h1").innerText;
                if (document.querySelector(".price")) {
                  data.price = document.querySelector(".price").innerText;
                }

                data.oldPrice = data.price;

                data.originalId = document.location.href;
                data.url = document.location.href;

                if (
                  document.querySelector(
                    "woocommerce-product-details__short-description"
                  )
                ) {
                  data.description = document.querySelector(
                    "woocommerce-product-details__short-description"
                  ).innerText;
                } else {
                  data.description = data.name;
                }

                data.brand = {
                  title: "notlost",
                  url: "https://notlost.store/",
                };

                return data;
              });

              const product = buildProduct(
                webData,
                ["unisex", "no gender", "notlost"],
                {
                  deleteDots: ",",
                }
              );
              await addProduct(product, dateScraping);
              productAdded++;
            } catch (error) {
              console.log("No se pudieron cargar los datos" + productUrl);
              console.log(error);
            }
          }
        }
      }

      const finishDate = new Date();

      const minutes = (finishDate.valueOf() - startDate.valueOf()) / 1000 / 60;

      const brandMessage = `[NOTLOST][${minutes}] -  Se han cargado ${productAdded} de ${productLenght} productos encontrados [${
        (productAdded * 100) / productLenght
      } %] `;

      console.log(brandMessage);

      return productList;
    }
  } catch (error) {}
};
