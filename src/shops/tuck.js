const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        console.log("______tuck______");
      } catch (error) {}

      // const routes = await page.evaluate(async () => {
      //   // routes es el array que guarda los enlaces
      //   // de las categorías
      //   let nav = Array.from(document.querySelectorAll(".menu-item-link"));
      //   nav = nav.map((category) => {
      //     return category.href;
      //   });
      //   return nav;
      // });

      // console.log(routes);

      const routes = ["https://tuck.com.ar/categoria/all/"];

      for (category of routes) {
        if (category != null) {
          console.log("[CATEGORY] - Abriendo " + category);

          await page.goto(category);

          var products = [];

          const getProducts = async () => {
            try {
              let localProducts = await page.evaluate(() => {
                return new Promise((resolve) => {
                  let products = Array.from(
                    document.querySelectorAll(".woocommerce-loop-product__link")
                  );

                  products = products.map((el) => {
                    return el.href;
                  });

                  products = [...new Set(products)];

                  resolve(products);
                });
              });

              products = [...products, ...localProducts];
              await page.waitForSelector(".next.page-numbers");
              const nextPage = await page.evaluate(() => {
                document.querySelector(
                  '[data-testid="dialog_iframe"]'
                ).style.display = "none";
                return document.querySelector(".next.page-numbers").href;
              });
              await page.goto(nextPage);
              await getProducts();
            } catch (error) {
              console.log(products.length + " Productos encontrados");
              console.log(error);
            }
          };

          await getProducts();

          for (productUrl of products) {
            try {
              await page.goto(productUrl);
            } catch (error) {
              console.log("Error al abrir el producto - " + productUrl);
              console.log(error);
            }

            var isTrueProduct = false;

            try {
              await page.waitForSelector(".p-item .zoom", {
                timeout: 3000,
              });
              isTrueProduct = true;
              console.log("Imagen1 encontrada");
            } catch {
              console.log("Imagen1 no encontrada");
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};
                  data.image = document.querySelector(".p-item .zoom").href;

                  data.name = document.querySelector(
                    ".product_title"
                  ).innerText;

                  if (
                    document.querySelector(
                      ".price del .woocommerce-Price-amount"
                    )
                  ) {
                    data.price = document.querySelector(
                      ".price ins .woocommerce-Price-amount"
                    ).innerText;
                    data.oldPrice = document.querySelector(
                      ".price del .woocommerce-Price-amount"
                    ).innerText;
                  } else {
                    data.price = document.querySelector(
                      ".price .woocommerce-Price-amount"
                    ).innerText;
                    data.oldPrice = document.querySelector(
                      ".price .woocommerce-Price-amount"
                    ).innerText;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  data.description =
                    data.name +
                    " " +
                    document.querySelector(
                      ".woocommerce-product-details__short-description"
                    ).innerText;

                  data.brand = {
                    title: "tuck",
                    url: "https://tuck.com.ar/",
                  };
                  return data;
                });

                const product = buildProduct(webData, ["mujer", "tuck"], {
                  deleteDots: ",",
                });
                await addProduct(product, dateScraping);
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
      }
    }
  } catch (error) {}
};
