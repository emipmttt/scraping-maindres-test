const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");
const removeSelector = require("../utils/removeSelector");

module.exports = async (page, URLShop, brandName, dateScraping, options) => {
  try {
    var productList = [];

    page.setDefaultNavigationTimeout(0);

    console.log("______" + brandName + "______");

    await page.goto(URLShop + "productos/?mpage=1000");

    await page.evaluate(() => {
      localStorage.setItem("site_lang", "AR");
    });
    await page.goto(URLShop + "productos/?mpage=1000");

    await removeSelector(page, "#fb-root");
    await removeSelector(page, ".p-layer");
    const getProducts = async () => {
      return await page.evaluate(() => {
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
          } else if (
            Array.from(document.querySelectorAll(".item-container a")).length
          ) {
            products = Array.from(
              document.querySelectorAll(".item-container a")
            );
          }

          let urlProducts = [];

          for (const el of products) {
            urlProducts.push(el.href);
          }

          urlProducts = [...new Set(urlProducts)];

          resolve(urlProducts);
        });
      });
    };
    try {
      var showScreen = 0;
      var findedProducts = 0;

      const clickOnShowMore = async () => {
        await page.waitForTimeout(1000);

        try {
          await autoScroll(page);
          await page.waitForSelector(".js-load-more-btn", {
            timeout: 5000,
          });

          if (options && options.limit) {
            const localProducts = await getProducts();
            console.log(localProducts.length + " productos al momento");
            if (localProducts.length > options.limit) {
              return;
            } else {
              if (findedProducts == localProducts.length) {
                console.log("No hay más productos");
                return;
              }
            }
            findedProducts = localProducts.length;
          }

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

    const products = await getProducts();

    console.log("Se encontraron " + products.length);

    for (productUrl of products) {
      try {
        await page.goto(productUrl);
      } catch (error) {
        console.log("Error al abrir el producto");
      }

      var isTrueProduct = false;

      await page.waitForTimeout(500);

      try {
        await removeSelector(page, "#fb-root");
        await removeSelector(page, ".p-layer");
        const webData = await page.evaluate(() => {
          var data = {};

          if (
            document.querySelector(".swiper-slide img") &&
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
          } else if (document.querySelector(".js-product-active-image img")) {
            data.image = document.querySelector(
              ".js-product-active-image img"
            ).src;
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
          } else if (document.querySelector(".product-price")) {
            data.price = document.querySelector(".product-price").innerText;
          }

          if (document.querySelector("#compare_price_display")) {
            data.oldPrice = document.querySelector(
              "#compare_price_display"
            ).innerText;
          } else if (document.querySelector("product-price-compare")) {
            data.oldPrice = document.querySelector(
              "product-price-compare"
            ).innerText;
          } else {
            data.oldPrice = data.price;
          }

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
          options && options.tags ? [...options.tags, brandName] : [brandName],
          options && options.options ? options.options : {}
        );
        await addProduct(product, dateScraping);
      } catch (error) {
        console.log("No se pudo capturar la información del producto");
        console.log(error);
      }
    }

    return productList;
  } catch (error) {
    console.log(error);
  }
};
