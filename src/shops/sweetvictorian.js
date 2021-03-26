const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");

module.exports = async (page, dateScraping) => {
  try {
    {
      const startDate = new Date();
      var productLenght = 0;
      try {
        await page.goto("https://www.sweetvictorian.com.ar/");
        console.log("______SWEETVICTORIAN______");
      } catch (error) {}

      await page.waitForTimeout(1000);

      const routes = await page.evaluate(async () => {
        var nav = Array.from(document.querySelectorAll(".list-styled-link"));
        nav = nav.map((category) => {
          return category.href;
        });
        return nav;
      });

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
                  document.querySelectorAll(".text-body")
                );

                products = products.map((el) => {
                  return el.href;
                });

                products = [...new Set(products)];

                resolve(products);
              });
            });

            products = [...products, ...localProducts];
            // console.log('Intentando Mostrar más productos');
            await page.waitForTimeout(1000);
            await page.click(".page-link .fa-caret-right");
            showScreen++;
            // console.log('Se encontraron más prodcutos');
            await getProducts();
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
            await page.waitForSelector(".flickity-slider .is-selected img", {
              timeout: 3000,
            });
            isTrueProduct = true;
          } catch {
            console.log(
              "Error: No se encontró imagen para este producto - " + productUrl
            );
            isTrueProduct = false;
          }
          if (isTrueProduct) {
            try {
              const webData = await page.evaluate(() => {
                var data = {};

                data.image = document.querySelector(
                  ".flickity-slider .is-selected img"
                ).src;
                data.name = document.querySelector("h3").innerText;
                if (document.querySelector(".mb-7 span")) {
                  data.price = document.querySelector(".mb-7 span").innerText;
                }
                if (document.querySelector(".old-price .price")) {
                  data.oldPrice = document.querySelector(
                    ".old-price .price"
                  ).innerText;
                } else {
                  data.oldPrice = data.price;
                }

                data.originalId = document.location.href;
                data.url = document.location.href;

                if (document.querySelector(".col-12 .col-lg-auto .row")) {
                  data.description = document.querySelector(
                    ".col-12 .col-lg-auto .row"
                  ).innerText;
                } else {
                  data.description = data.name;
                }

                data.brand = {
                  title: "sweetvictorian",
                  url: "https://www.sweetvictorian.com.ar/",
                };
                return data;
              });

              const product = buildProduct(webData, ["mujer"], {
                excludeTags: ["hombre"],
              });
              await addProduct(product, dateScraping);
              productAdded++;
            } catch (error) {
              console.error(error);
              console.log(
                "Error: No se pudieron obtener datos del producto -" +
                  productUrl
              );
            }
          }
        }
      }

      try {
        const finishDate = new Date();

        const minutes =
          (finishDate.valueOf() - startDate.valueOf()) / 1000 / 60;

        const brandMessage = `[SWEETVICTORIAN][${minutes}] -  Se han cargado ${productAdded} de ${productLenght} productos encontrados [${
          (productAdded * 100) / productLenght
        } %] `;

        console.log(brandMessage);
      } catch (error) {
        console.log(error);
      }

      return productList;
    }
  } catch (error) {}
};
