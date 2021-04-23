const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://www.donne.com.ar/");
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(
          document.querySelectorAll(".nav-item .w-100 a.list-styled-link")
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
              await page.waitForSelector("a.page-link-arrow .fa-caret-right", {
                timeout: 3000,
              });

              await page.click("a.page-link-arrow .fa-caret-right");

              await clickOnShowMore();
            } catch (error) {
              console.log("No se pudo mostrar más productos");
              console.log(error);
            }
          };

          await clickOnShowMore();

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(
                document.querySelectorAll(".product-price a.text-dark")
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
              await page.waitForSelector("h2.text-uppercase", {
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

                  data.image = document.querySelector(".item .img-fluid").src;

                  data.name = document.querySelector(
                    "h2.text-uppercase"
                  ).innerText;
                  if (document.querySelector(".price")) {
                    data.price = document.querySelector(
                      ".price span"
                    ).innerText;
                  }

                  if (document.querySelector(".price del")) {
                    data.oldPrice = document.querySelector(
                      ".price del"
                    ).innerText;
                  }
                  //else {
                  //  data.oldPrice = document.querySelector(".price").innerText;
                  //}

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  data.description = document.querySelector(
                    "body > section.product-details.pt-10 > div.container.container-sections > div > div.col-lg-5.pl-lg-4.pt-4.mt-2.order-2.order-lg-2"
                  ).innerText;

                  data.brand = {
                    title: "donne",
                    url: "https://www.donne.com.ar/",
                  };
                  console.log(data);
                  return data;
                });

                const product = buildProduct(
                  webData,
                  ["mujer", "calzado", "donne"],
                  {
                    deleteDots: ".",
                  }
                );
                await addProduct(product, dateScraping);
              } catch (error) {
                console.error(error);
                console.log("Error en " + productUrl);
              }
            }
          }
        }
      }
    }
  } catch (error) {}
};
