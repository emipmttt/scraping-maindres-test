
const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");

module.exports = async (page, dateScraping) => {
  try {
    try {
      await page.goto("https://www.namer.com.ar/");
    } catch (error) {}

    const routes = await page.evaluate(async () => {
      var nav = Array.from(
        document.querySelectorAll(".home-categories ul li a")
      );
      nav = nav.map((category) => {
        return category.href;
      });
      return nav;
    });

    for (category of routes) {
      console.log("[CATEGORY] - Abriendo " + category);

      await page.goto(category);

      const clickOnShowMore = async (scroll) => {
        console.log("Intentando mostrar más productos");
        await page.waitForTimeout(1000);

        try {
          await page.waitForSelector(".js-load-more-btn", {
            timeout: 3000,
          });

          await page.click(".js-load-more-btn");

          await clickOnShowMore();
        } catch (error) {
          console.log("No se pudo Mostrar Productos");
          console.log(error);
        }
      };

      await clickOnShowMore();

      const products = await page.evaluate((category) => {
        return new Promise((resolve) => {
          let products = Array.from(
            document.querySelectorAll(".js-item-product a")
          );

          products = products.map((el) => {
            return el.href;
          });

          products = [...new Set(products)];

          resolve(products);
        });
      }, category);

      console.log(products.length, "Productos encontrados");

      for (productUrl of products) {
        try {
          await page.goto(productUrl);
          console.log("Se abrió url correctamente");
        } catch (error) {
          console.log("Error al abrir el producto");
        }

        var isTrueProduct = false;

        console.log("Intentando abrir product-slider-container");

        try {
          await page.waitForSelector(".product-slider-container img", {
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

            data.image = document.querySelector(
              ".product-slider-container img"
            ).src;
            data.name = document.querySelector(".product-name").innerText;

            data.price = document.querySelector(".product-price").innerText;

            if (document.querySelector(".price-compare"))
              data.oldPrice = document.querySelector(
                ".price-compare"
              ).innerText;

            data.originalId = location.href;
            data.url = location.href;

            const descriptionElements = [
              ".product-name",
              ".variant-label",
              ".description",
              ".breadcrumb.list-inline li:nth-child(2)",
            ];

            data.description = "";

            for (const selector of descriptionElements) {
              console.log(selector);

              const element = document.querySelector(selector);

              if (element) {
                data.description += element.innerText + " ";
              }
            }

            data.brand = {
              title: "namer",
              url: "https://www.namer.com.ar/",
            };
            return data;
          });

          console.log(webData);

          const product = buildProduct(webData, ["bebé", "kids"]);
          await addProduct(product, dateScraping);
        }
      }
    }
    return productList;
  } catch (error) {}
};
