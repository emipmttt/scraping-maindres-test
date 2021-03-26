const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, URLShop, brandName, dateScraping, options) => {
  try {
    var productList = [];

    page.setDefaultNavigationTimeout(0);

    console.log("______" + brandName + "______");

    await page.goto(URLShop + "productos/?mpage=1000");

    try {
      var showScreen = 0;

      const clickOnShowMore = async () => {
        await page.waitForTimeout(1000);

        try {
          await autoScroll(page);
          await page.waitForSelector(".js-load-more-btn", {
            timeout: 5000,
          });
          await page.hover(".js-load-more-btn");
          await page.click(".js-load-more-btn");
          showScreen++;

          await clickOnShowMore();
        } catch (error) {
          console.log(`Se obtuvieron ${showScreen} paginas de esta sección`);
          console.log(error);
        }
      };

      await clickOnShowMore();
    } catch (error) {}

    const products = await page.evaluate(() => {
      return new Promise((resolve) => {
        let products;
        if (
          Array.from(document.querySelectorAll(".js-item-product a")).length
        ) {
          products = Array.from(
            document.querySelectorAll(".js-item-product a")
          );
        } else if (
          Array.from(document.querySelectorAll(".item-product a")).length
        ) {
          products = Array.from(document.querySelectorAll(".item-product a"));
        }

        products = products.map((el) => {
          return el.href;
        });

        products = [...new Set(products)];

        resolve(products);
      });
    });

    console.log("Se encontraron " + products.length);

    for (productUrl of products) {
      try {
        await page.goto(productUrl);
      } catch (error) {
        console.log("Error al abrir el producto");
      }

      var isTrueProduct = false;

      try {
        await page.waitForSelector(".swiper-slide img", {
          timeout: 3000,
        });
        isTrueProduct = true;
      } catch {
        console.log("Imagen no encontrada");
        isTrueProduct = false;
      }
      await page.waitForTimeout(500);

      if (isTrueProduct) {
        try {
          const webData = await page.evaluate(() => {
            var data = {};

            if (
              document
                .querySelector(".swiper-slide img")
                .src.includes("/empty-placeholder")
            ) {
              //
              data.image = document
                .querySelector(".js-product-slide-img")
                .srcset.split(" ")[0];
              // document
              //   .querySelector("img:nth-child(2)")
              //   .src.replace(/-50-0.jpg/g, "-640-0.jpg");
            } else {
              data.image = document.querySelector(".swiper-slide img").src;
            }

            if (document.querySelector(".js-product-name")) {
              data.name = document.querySelector(".js-product-name").innerText;
            } else if (document.querySelector("#product-name")) {
              data.name = document.querySelector("#product-name").innerText;
            } else if (document.querySelector(".product-name")) {
              data.name = document.querySelector(".product-name").innerText;
            } else if (document.querySelector("h1")) {
              data.name = document.querySelector("h1").innerText;
            }

            if (document.querySelector("#price_display")) {
              data.price = document.querySelector("#price_display").innerText;
            }

            if (document.querySelector("#compare_price_display"))
              data.oldPrice = document.querySelector(
                "#compare_price_display"
              ).innerText;

            data.originalId = document.location.href;
            data.url = document.location.href;

            if (document.querySelector(".product-description")) {
              data.description =
                data.name +
                " " +
                document.querySelector(".product-description").innerText;

              if (document.querySelector(".form-select")) {
                data.description +=
                  " " + document.querySelector(".form-select").innerText;
              }
            } else {
              data.description = data.name;
            }

            return data;
          });

          webData.brand = {
            title: brandName,
            url: URLShop,
          };

          const product = buildProduct(
            webData,
            options && options.tags ? options.tags : [],
            options && options.options ? options.options : {}
          );
          await addProduct(product, dateScraping);
        } catch (error) {
          console.log("No se pudo capturar la información del producto");
          console.log(error);
        }
      }
    }

    return productList;
  } catch (error) {
    console.log(error);
  }
};
