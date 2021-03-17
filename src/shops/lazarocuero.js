
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
        await page.goto("https://www.lazarocuero.com.ar/");
        console.log("______LAZAROCUERO______");
      } catch (error) {}

      await page.waitForTimeout(1000);

      const routes = await page.evaluate(async () => {
        var nav = Array.from(document.querySelectorAll(".level0 a"));
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
                  document.querySelectorAll(".product-image")
                );

                products = products.map((el) => {
                  return el.href;
                });

                products = [...new Set(products)];

                resolve(products);
              });
            });

            products = [...products, ...localProducts];
            console.log("Intentando Mostrar más productos");
            await page.waitForTimeout(1000);
            await page.click(".toolbar-bottom .next");
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
            await page.waitForSelector(".product-image-gallery #img_main", {
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

              data.image = document.querySelector(
                ".product-image-gallery #img_main"
              ).src;
              data.name = document.querySelector("h1").innerText;
              if (document.querySelector(".special-price")) {
                data.price = document.querySelector(".price").innerText;
              } else if (document.querySelector("regular-price")) {
                data.price = document.querySelector(".price").innerText;
              }

              if (document.querySelector(".old-price .price"))
                data.oldPrice = document.querySelector(
                  ".old-price .price"
                ).innerText;

              data.originalId = document.location.href;
              data.url = document.location.href;

              if (document.querySelector(".panel-body ul")) {
                data.description = document.querySelector(
                  ".panel-body ul"
                ).innerText;
              } else {
                data.description = data.name;
              }

              data.brand = {
                title: "lazarocuero",
                url: "https://www.lazarocuero.com.ar/",
              };
              return data;
            });

            const product = buildProduct(webData, ["accesorios"], {
              deleteDots: ".",
            });
            await addProduct(product, dateScraping);
            productAdded++;
          }
        }
      }

      try {
        const finishDate = new Date();

        const minutes =
          (finishDate.valueOf() - startDate.valueOf()) / 1000 / 60;

        const brandMessage = `[LAZAROCUERO][${minutes}] -  Se han cargado ${productAdded} de ${productLenght} productos encontrados [${
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
