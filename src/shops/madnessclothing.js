const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      var productList = [];

      try {
        await page.goto("https://madnessclothing.com.ar/");
      } catch (error) {}

      await page.waitForTimeout(1000);

      await page.waitForSelector("body > div.mgglmodal > div > button");
      await page.click("body > div.mgglmodal > div > button");

      const routes = await page.evaluate(async () => {
        var nav = Array.from(
          document.querySelectorAll(
            ".Header__MainNav ul li.HorizontalList__Item>a"
          )
        );
        nav = nav.map((category) => {
          return category.href;
        });
        return nav;
      });

      console.log(routes);

      for (category of routes) {
        console.log("[CATEGORY] - Abriendo " + category);

        await page.goto(category);

        await autoScroll(page);

        const products = await page.evaluate(() => {
          return new Promise((resolve) => {
            let products = Array.from(
              document.querySelectorAll(
                ".Grid__Cell .ProductItem a.ProductItem__ImageWrapper"
              )
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

          console.log("Intentando abrir #imagen1");

          try {
            await page.waitForSelector(".Product__SlideItem img", {
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

              data.image = document.querySelector(
                ".Product__SlideItem img"
              ).src;
              data.name = document.querySelector("h1").innerText;
              if (document.querySelector(".Price")) {
                data.price = document.querySelector(".Price").innerText;
              }

              if (document.querySelector(".Price--compareAt"))
                data.oldPrice = document.querySelector(
                  ".Price--compareAt"
                ).innerText;

              data.originalId = document.location.href;
              data.url = document.location.href;

              if (document.querySelector(".ProductMeta__Description p")) {
                data.description = document.querySelector(
                  ".ProductMeta__Description p"
                ).innerText;
              } else {
                data.description = data.name;
              }

              data.brand = {
                title: "madnessclothing",
                url: "https://madnessclothing.com.ar/",
              };
              return data;
            });

            const product = buildProduct(webData, ["mujer", "madnessclothing"]);
            await addProduct(product, dateScraping);
          }
        }
      }
      return productList;
    }
  } catch (error) {}
};
