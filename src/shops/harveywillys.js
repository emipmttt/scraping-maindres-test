
const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://harveywillys.com/es/");
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(document.querySelectorAll("#menu-principal li a"));
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

          await autoScroll(page);

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(
                document.querySelectorAll(".isotope-container .tmb a.pushed")
              );

              products = products.map((el) => {
                return el.href;
              });

              products = [...new Set(products)];

              resolve(products);
            });
          });

          for (productUrl of products) {
            try {
              await page.goto(productUrl);
              console.log("Se abrió url correctamente");
            } catch (error) {
              console.log("Error al abrir el producto");
            }

            var isTrueProduct = false;

            console.log("Intentando encontrar imagen");

            try {
              await page.waitForSelector(".slick-list img", {
                timeout: 3000,
              });
              isTrueProduct = true;
              console.log("Imagen1 encontrada");
            } catch {
              console.log("Imagen1 no encontrada");
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              console.log(isTrueProduct);
              const webData = await page.evaluate(() => {
                var data = {};

                data.image = document.querySelector(".slick-list img").src;

                data.name = document.querySelector("h1").innerText;
                if (document.querySelector(".woocommerce-Price-amount")) {
                  data.price = document.querySelector(
                    ".woocommerce-Price-amount"
                  ).innerText;
                }

                if (document.querySelector(".price .amount"))
                  data.oldPrice = document.querySelector(
                    ".price .amount"
                  ).innerText;

                data.originalId = document.location.href;
                data.url = document.location.href;

                data.description =
                  data.name +
                  " " +
                  document.querySelector(
                    ".woocommerce-product-details__short-description p"
                  ).innerText;

                data.brand = {
                  title: "harveywillys",
                  url: "https://harveywillys.com",
                };

                console.log(data);
                return data;
              });

              console.log(webData);

              const product = buildProduct(webData, []);
              await addProduct(product, dateScraping);
            }
          }
        }
      }
    }
  } catch (error) {}
};
