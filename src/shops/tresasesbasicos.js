const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        console.log("_______tresasesbasicos______");
        await page.goto("https://www.tresasesbasicos.com.ar/shop/");
      } catch (error) {
        console.log(error);
      }

      const routes = await page.evaluate(async () => {
        var nav = Array.from(document.querySelectorAll(".page-numbers"));
        nav = [location, ...nav];
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

          // await autoScroll(page);

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(
                document.querySelectorAll(
                  ".product .product-title-price-wrap > a"
                )
              );

              products = products.map((el) => {
                return el.href;
              });

              // products = [...new Set(products)];

              resolve(products);
            });
          });
          console.log(
            "En esta página se econtraron " + products.length + " productos"
          );
          for (productUrl of products) {
            try {
              await page.goto(productUrl);
              console.log("Se abrió url correctamente");
            } catch (error) {
              console.log("Error al abrir el producto");
            }

            var isTrueProduct = false;

            console.log("Intentando abrir #imagen1");

            try {
              await page.waitForSelector(
                ".woocommerce-product-gallery__image img",
                {
                  timeout: 3000,
                }
              );
              isTrueProduct = true;
              console.log("Imagen1 encontrada");
            } catch {
              console.log("Imagen1 no encontrada");
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              const webData = await page.evaluate(() => {
                var data = {};

                data.image = document.querySelector(
                  ".woocommerce-product-gallery__image img"
                ).src;
                data.name = document.querySelector(
                  "h1.product_title"
                ).innerText;
                if (document.querySelector(".price .amount")) {
                  data.price = document.querySelector(
                    ".price .amount"
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
                  document.querySelector(".product_meta").innerText;

                data.brand = {
                  title: "tresasesbasicos",
                  url: "https://www.tresasesbasicos.com.ar",
                };
                return data;
              });

              const product = buildProduct(
                webData,
                ["basico", "tresasesbasicos"],
                {
                  deleteDots: ".",
                }
              );
              await addProduct(product, dateScraping);
            } else {
            }
          }
        }
      }
      return productList;
    }
  } catch (error) {
    console.log(error);
  }
};
