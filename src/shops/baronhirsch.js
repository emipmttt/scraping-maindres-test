
const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const descriptionSelectors = require("../utils/descriptionSelectors");

module.exports = async (page, dateScraping) => {
  try {
    var productList = [];

    ////+

    await page.goto("https://www.baronhirsch.com.ar/productos.html");
    const getThisPage = async () => {
      var currentPage = await page.evaluate(() => {
        return location.href;
      });

      console.log("check currente page", currentPage);
      await page.waitForTimeout(3000);

      const products = await page.evaluate(() => {
        return new Promise((resolve) => {
          let products = Array.from(
            document.querySelectorAll(".product-list li .d1>a")
          );

          products = products.map((el) => {
            return el.href;
          });

          products = [...new Set(products)];

          resolve(products);
        });
      });

      console.log(products.length);

      for (productUrl of products) {
        try {
          await page.goto(productUrl);
          console.log("Se abrió url correctamente");
        } catch (error) {
          console.log("Error al abrir el producto");
        }

        var isTrueProduct = false;

        console.log("Intentando abrir #product-image");

        try {
          await page.waitForSelector("#product-image img", {
            timeout: 3000,
          });
          isTrueProduct = true;
          console.log("product-slider-container encontrada");
        } catch {
          console.log("product-slider-container no encontrada");
          isTrueProduct = false;
        }
        if (isTrueProduct) {
          const webData = await page.evaluate(() => {
            var data = {};

            data.image =
              "https://www.baronhirsch.com.ar/" +
              document.querySelector("#product-image img").srcset;

            data.name = document.querySelector(".title").innerText;

            data.price = document.querySelector(".price").innerText;

            if (document.querySelector(".price-old .old"))
              data.oldPrice = document.querySelector(
                ".price-old .old"
              ).innerText;

            data.originalId = document
              .querySelector(".codigo")
              .innerText.split(": ")[1];

            data.url = location.href;

            data.description = document.querySelector(".title").innerText;

            data.brand = {
              title: "baronhirsch",
              url: "https://www.baronhirsch.com.ar/",
            };

            return data;
          });

          const product = buildProduct(webData, ["hombre"]);

          await addProduct(product, dateScraping);
        }
      }

      console.log("Intentando mostrar más productos");

      try {
        console.log(currentPage);
        await page.goto(currentPage);
        await page.waitForSelector("#pag a:nth-child(4)", {
          timeout: 3000,
        });

        await page.click("#pag a:nth-child(4)");

        await getThisPage();
      } catch (error) {
        console.log("No se pudo Mostrar Productos");
        console.log(error);
      }
    };

    await getThisPage();

    return productList;
  } catch (error) {
    console.log(error);
  }
};
