const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");

module.exports = async (page, dateScraping) => {
  try {
    var productList = [];

    try {
      await page.goto("https://www.47street.com.ar/");
    } catch (error) {}

    // const routes = await page.evaluate(async () => {
    //     var nav = Array.from(document.querySelector('nav ul').children)
    //     nav = nav.map((category) => {
    //         return category.querySelector("li a").href
    //     })
    //     return nav
    // });

    const routes = [
      "https://www.47street.com.ar/coleccion/ver-todo-aw2021.html",
      "https://www.47street.com.ar/back-to-school-2021.html",
      "https://www.47street.com.ar/final-sale.html",
    ];

    for (category of routes) {
      console.log("[CATEGORY] - Abriendo " + category);

      await page.goto(category);
      const clickOnShowMore = async (scroll) => {
        await page.waitForTimeout(1000);

        try {
          await page.waitForSelector(".btn-load-more", {
            timeout: 3000,
          });

          if (scroll) {
            await page.hover(".infinite-loader");
          } else {
            await page.click(".btn-load-more");
          }

          await clickOnShowMore();
        } catch (error) {
          if (!scroll) {
            await clickOnShowMore(true);
          }
          console.log("No se pudo Mostrar Productos");
          console.log(error);
        }
      };

      await clickOnShowMore();
      const products = await page.evaluate((category) => {
        return new Promise((resolve) => {
          let products = Array.from(
            document.querySelectorAll("li.item.product a")
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
          console.log("Error al abrir el producto " + productUrl);
        }

        var isTrueProduct = false;

        try {
          await page.waitForSelector("#imagen1", {
            timeout: 3000,
          });
          isTrueProduct = true;
        } catch {
          console.log("Imagen no encontrada " + productUrl);
          isTrueProduct = false;
        }
        if (isTrueProduct) {
          const webData = await page.evaluate(() => {
            var data = {};

            data.image = document.querySelector("#imagen1").src;
            data.name = document.querySelector(".page-title").innerText;
            if (document.querySelector(".special-price .price")) {
              data.price = document.querySelector(
                ".special-price .price"
              ).innerText;
            } else if (document.querySelector(".price-final_price")) {
              data.price = document.querySelector(
                ".price-final_price"
              ).innerText;
            }

            if (document.querySelector(".special-price .price"))
              data.oldPrice = document.querySelector(
                ".special-price .price"
              ).innerText;

            data.originalId = document.querySelector(
              "#maincontent .product.attribute.sku > div"
            ).innerText;
            data.url = document.location.href;

            if (document.querySelector("#info-description")) {
              data.description = document.querySelector(
                "#info-description"
              ).innerText;
            } else {
              data.description = document.querySelector(
                ".page-title"
              ).innerText;
            }

            data.brand = {
              title: "47street",
              url: "https://www.47street.com.ar/",
            };
            return data;
          });

          const product = buildProduct(webData, ["mujer"]);
          await addProduct(product, dateScraping);
        }
      }
    }
    return productList;
  } catch (error) {}
};
