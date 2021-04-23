const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://www.mariarivolta.com/");
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(
          document.querySelectorAll(
            "#menu-menu-principal .menu-item .woodmart-nav-link"
          )
        );
        nav = nav.map((category) => {
          return category.href;
        });

        nav = [...new Set(nav)];

        return nav;
      });

      console.log(routes);

      for (category of routes) {
        if (category != null) {
          console.log("[CATEGORY] - Abriendo " + category);

          await page.goto(category);
          // await autoScroll(page);

          const clickOnShowMore = async () => {
            await page.waitForTimeout(1000);

            try {
              await page.waitForSelector(".product-grid-item.product", {
                timeout: 3000,
              });

              await page.waitForSelector(".next", {
                timeout: 3000,
              });

              await page.click(".next");

              await clickOnShowMore();
            } catch (error) {
              console.log("No se pudo Mostrar Productos");
              console.log(error);
            }
          };

          await clickOnShowMore();

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(
                document.querySelectorAll(".product-title a")
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
            } catch (error) {
              console.log("Error al abrir el producto", productUrl);
            }

            var isTrueProduct = false;

            try {
              await page.waitForSelector(".product_title", {
                timeout: 3000,
              });
              isTrueProduct = true;
            } catch {
              console.log("Imagen no encontrada", productUrl);
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};

                  data.image = document.querySelector(".zoomImg").src;

                  data.name = document.querySelector(
                    ".product_title"
                  ).innerText;

                  if (document.querySelector("p.price ins")) {
                    data.price = document.querySelector(
                      "p.price ins"
                    ).innerText;
                  } else {
                    data.price = document.querySelector("p.price").innerText;
                  }

                  if (document.querySelector("p.price del")) {
                    data.oldPrice = document.querySelector(
                      "p.price del"
                    ).innerText;
                  } else {
                    data.oldPrice = document.querySelector("p.price").innerText;
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
                    title: "mariarivolta",
                    url: "https://www.mariarivolta.com/",
                  };
                  console.log(data);
                  return data;
                });

                const product = buildProduct(webData, [
                  "mujer",
                  "mariarivolta",
                ]);
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
