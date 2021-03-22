const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      var productList = [];

      try {
        await page.goto("https://www.keybiscayne.com.ar/");
      } catch (error) {}

      await page.click("#menu-link");
      await page.click("#menu-link");

      await page.waitForTimeout(1000);

      const routes = await page.evaluate(async () => {
        var nav = Array.from(document.querySelectorAll("ul.menu>li>a"));
        nav = nav.map((category) => {
          return category.href;
        });

        nav = nav.filter(
          (category) => category != "https://www.keybiscayne.com.ar/#"
        );
        return nav;
      });

      for (category of routes) {
        console.log("[CATEGORY] - Abriendo " + category);

        await page.goto(category);

        await autoScroll(page, 600, 100);

        const products = await page.evaluate((category) => {
          return new Promise((resolve) => {
            let products = Array.from(
              document.querySelectorAll(
                ".product-list ul .product-image a.gtm-selector-LINK"
              )
            );

            products = products.map((el) => {
              return el.href;
            });

            products = products.filter((el) => {
              return !el.includes(category);
            });

            products = [...new Set(products)];

            resolve(products);
          });
        }, category);

        for (productUrl of products) {
          try {
            await page.goto(productUrl);
          } catch (error) {
            console.log("Error al abrir el producto ", productUrl);
          }

          var isTrueProduct = false;

          try {
            await page.waitForSelector(".owl-stage", {
              timeout: 5000,
            });
            isTrueProduct = true;
          } catch {
            console.log("Imagen no encontrada ", productUrl);
            isTrueProduct = false;
          }
          if (isTrueProduct) {
            try {
              const webData = await page.evaluate(() => {
                var data = {};

                if (
                  document.querySelector("#image-main") &&
                  document.querySelector("#image-main").src
                ) {
                  data.image = document.querySelector("#image-main").src;
                } else {
                  data.image = document
                    .querySelector(".owl-stage")
                    .children[1].querySelector("img").src;
                }

                data.name = document.querySelector("h1").innerText;
                if (document.querySelector(".bestPrice")) {
                  data.price = document.querySelector(".bestPrice").innerText;
                }

                if (document.querySelector(".listPrice"))
                  data.oldPrice = document.querySelector(
                    ".listPrice"
                  ).innerText;

                data.originalId = skuJson.productId;
                data.url = document.location.href;

                if (document.querySelector(".productDescriptionShort")) {
                  data.description = document.querySelector(
                    ".productDescriptionShort"
                  ).innerText;
                } else {
                  data.description = data.name;
                }

                data.brand = {
                  title: "keybiscayne",
                  url: "https://www.keybiscayne.com.ar/",
                };
                return data;
              });
              const product = buildProduct(webData, ["hombre"]);
              await addProduct(product, dateScraping);
            } catch (error) {
              console.log("error al obtener los datos ", productUrl);
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
