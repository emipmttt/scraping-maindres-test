const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      const startDate = new Date();
      var productLenght = 0;
      try {
        await page.goto("https://www.garzongarcia.com.ar/");
        console.log("______GARZONGARCIA______");
      } catch (error) {}

      await page.waitForTimeout(1000);

      const routes = await page.evaluate(async () => {
        var nav = Array.from(
          document.querySelectorAll("header nav a.level-top")
        );
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

        var showScreen = 0;

        const clickOnShowMore = async () => {
          await page.waitForTimeout(1000);

          try {
            await page.waitForSelector(".btn-load-more", {
              timeout: 5000,
            });
            await page.hover(".infinite-loader");
            await page.click(".infinite-loader");
            showScreen++;

            await clickOnShowMore();
          } catch (error) {
            console.log(
              `Se obtuvieron ${showScreen} paginas de esta sección ${category}`
            );
            console.log(error);
          }
        };

        await clickOnShowMore();

        const products = await page.evaluate(() => {
          return new Promise((resolve) => {
            let products = Array.from(
              document.querySelectorAll(".product .product-item-photo a")
            );

            products = products.map((el) => {
              return el.href;
            });

            products = [...new Set(products)];

            resolve(products);
          });
        });

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
            await page.waitForSelector("#imagen0", {
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
            const webData = await page.evaluate(() => {
              var data = {};

              data.image = document.querySelector("#imagen0").src;
              data.name = document.querySelector("h1").innerText;
              if (document.querySelector(".price")) {
                data.price = document.querySelector(".price").innerText;
              }

              if (document.querySelector(".old-price .price"))
                data.oldPrice = document.querySelector(
                  ".old-price .price"
                ).innerText;

              data.originalId = document.location.href;
              data.url = document.location.href;

              if (document.querySelector(".product.description .value")) {
                data.description = document.querySelector(
                  ".product.description .value"
                ).innerText;
              } else {
                data.description = data.name;
              }

              data.brand = {
                title: "garzongarcia",
                url: "https://www.garzongarcia.com.ar/",
              };
              return data;
            });

            const product = buildProduct(webData, ["hombre", "garzongarcia"]);
            await addProduct(product, dateScraping);
            productAdded++;
          }
        }
      }

      try {
        const finishDate = new Date();

        const minutes =
          (finishDate.valueOf() - startDate.valueOf()) / 1000 / 60;

        const brandMessage = `[GARZONGARCIA][${minutes}] -  Se han cargado ${productAdded} de ${productLenght} productos encontrados [${
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
