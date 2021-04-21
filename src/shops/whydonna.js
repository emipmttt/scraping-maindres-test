const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      const startDate = new Date();
      var productLenght = 0;
      try {
        await page.goto("https://www.whydonna.com.ar/productos");
        console.log("______WHYDONNA______");
      } catch (error) {}

      await page.waitForTimeout(1000);

      const routes = await page.evaluate(async () => {
        var nav = Array.from(document.querySelectorAll(".nav-list-link"));
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
        await autoScroll(page);

        const clickOnShowMore = async () => {
          await autoScroll(page);
          await page.waitForTimeout(1000);

          try {
            await page.waitForSelector(".js-load-more .btn", {
              timeout: 3000,
            });
            await page.click(".js-load-more .btn");
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
              document.querySelectorAll(".item-description .item-link")
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
            await page.waitForSelector(".swiper-slide a img", {
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

              data.image = document.querySelector(".swiper-slide a img").src;
              data.name = document.querySelector(".js-product-name").innerText;
              if (document.querySelector(".js-price-display")) {
                data.price = document.querySelector(
                  ".js-price-display"
                ).innerText;
              }

              if (document.querySelector(".old-price .price"))
                data.oldPrice = document.querySelector(
                  ".old-price .price"
                ).innerText;

              data.originalId = document.location.href;
              data.url = document.location.href;

              if (document.querySelector(".product-description p")) {
                data.description = document.querySelector(
                  ".product-description p"
                ).innerText;
              } else {
                data.description = data.name;
              }

              data.brand = {
                title: "whydonna",
                url: "https://www.whydonna.com.ar/",
              };
              return data;
            });

            const product = buildProduct(webData, ["hombre", "whydonna"]);
            await addProduct(product, dateScraping);
            productAdded++;
          }
        }
      }

      try {
        const finishDate = new Date();

        const minutes =
          (finishDate.valueOf() - startDate.valueOf()) / 1000 / 60;

        const brandMessage = `[WHYDONNA][${minutes}] -  Se han cargado ${productAdded} de ${productLenght} productos encontrados [${
          (productAdded * 100) / productLenght
        } %] `;

        console.log(brandMessage);

        fs.appendFile(
          `log/scraping_resume_${dateScraping}.txt`,
          brandMessage + "\n",
          (err) => {
            if (err) throw err;
          }
        );
      } catch (error) {
        console.log(error);
      }

      return productList;
    }
  } catch (error) {}
};
