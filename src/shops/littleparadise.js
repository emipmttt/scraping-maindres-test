const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://littleparadise.com.ar/index.php/tienda/");
      } catch (error) {}

      const routes = ["https://littleparadise.com.ar/index.php/tienda/"];

      for (category of routes) {
        if (category != null) {
          console.log("[CATEGORY] - Abriendo " + category);

          await page.goto(category);

          let products = [];

          const clickOnShowMore = async () => {
            await page.waitForTimeout(1000);

            try {
              await autoScroll(page);

              const localProducts = await page.evaluate(() => {
                return new Promise((resolve) => {
                  let products = Array.from(
                    document.querySelectorAll(".product a")
                  );

                  products = products.map((el) => {
                    return el.href;
                  });

                  products = [...new Set(products)];

                  resolve(products);
                });
              });

              products.push(localProducts);

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

          products = products.flat();
          products = [...new Set(products)]

          console.log("Se encontraron " + products.length + " productos");

          for (productUrl of products) {
            try {
              await page.goto(productUrl);
            } catch (error) {
              console.log("Error al abrir el producto");
            }

            var isTrueProduct = false;

            try {
              await page.waitForSelector(".product_title", {
                timeout: 3000,
              });
              isTrueProduct = true;
            } catch {
              console.log("Imagen1 no encontrada");
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};

                  data.image = document.querySelector(
                    ".single-product-img "
                  ).src;
                  data.name = document.querySelector(
                    ".product_title"
                  ).innerText;

                  if (
                    document.querySelector(".product_summary_middle .price del")
                  ) {
                    data.price = document.querySelector(
                      ".product_summary_middle .price ins"
                    ).innerText;
                  } else {
                    data.price = document.querySelector(
                      ".product_summary_middle .price .amount"
                    ).innerText;
                  }

                  if (
                    document.querySelector(".product_summary_middle .price del")
                  ) {
                    data.oldPrice = document.querySelector(
                      ".product_summary_middle .price del"
                    ).innerText;
                  } else {
                    data.oldPrice = document.querySelector(
                      ".product_summary_middle .price .amount"
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
                    title: "littleparadise",
                    url: "https://www.littleparadise.com.ar/",
                  };
                  return data;
                });

                const product = buildProduct(webData, ["bebe"]);
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
