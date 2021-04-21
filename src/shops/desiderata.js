const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    var productList = [];

    try {
      await page.goto("https://www.desiderata.com.ar/");
    } catch (error) {}

    const routes = [
      "https://www.desiderata.com.ar/sale?PS=27&O=OrderByReleaseDateDESC",
      "https://www.desiderata.com.ar/verano?PS=27&O=OrderByReleaseDateDESC",
    ];

    for (category of routes) {
      console.log("[CATEGORY] - Abriendo " + category);

      await page.goto(category);
      const clickOnShowMore = async () => {
        console.log("Intentando mostrar más productos");
        await page.waitForTimeout(1000);

        await autoScroll(page);

        try {
          await page.waitForSelector(".continue-loading", {
            timeout: 3000,
          });

          await page.hover(".continue-loading");
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
          let products = Array.from(
            document.querySelectorAll("#vitrina ul li a")
          );

          products = products.map((el) => {
            return el.href;
          });

          products = [...new Set(products)];

          resolve(products);
        });
      });

      console.log("Cargando " + products.length);

      for (productUrl of products) {
        try {
          await page.goto(productUrl);
          console.log("Se abrió url correctamente");
        } catch (error) {
          console.log("Error al abrir el producto");
        }

        var isTrueProduct = false;

        console.log("Intentando abrir .zoom-content img");

        try {
          await page.waitForSelector(".zoom-content img", {
            timeout: 3000,
          });
          isTrueProduct = true;
          console.log("Imagen1 encontrada");
        } catch {
          console.log("Imagen1 no encontrada");
          isTrueProduct = false;
        }
        if (isTrueProduct) {
          const webData = await page.evaluate(() => {
            var data = {};

            data.image = document.querySelector(".zoom-content img").src;
            data.name = document.querySelector(".productName").innerText;
            if (document.querySelector(".skuBestPrice")) {
              data.price = document.querySelector(".skuBestPrice").innerText;
            }

            if (document.querySelector(".skuListPrice"))
              data.oldPrice = document.querySelector(".skuListPrice").innerText;

            data.originalId = document.querySelector(".skuReference").innerText;
            data.url = document.location.href;

            if (document.querySelector(".productDescription")) {
              data.description = document.querySelector(
                ".productDescription"
              ).innerText;
            } else {
              data.description = document.querySelector(
                ".productName"
              ).innerText;
            }

            data.brand = {
              title: "desiderata",
              url: "https://www.desiderata.com.ar/",
            };
            return data;
          });

          const product = buildProduct(webData, ["mujer", "desiderata"]);
          console.log(product);
          await addProduct(product, dateScraping);
        }
      }
    }
    return productList;
  } catch (error) {}
};
