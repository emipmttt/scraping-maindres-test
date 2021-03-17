
const buildProduct = require("../utils/buildProduct");
const addProduct = require("../utils/addProduct");
const autoScroll = require("../utils/autoScroll");

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto("https://www.pielonline.com/");
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(
          document.querySelectorAll("#SiteNavLabel-productos ul li a")
        );
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

          var products = [];

          const getProducts = async () => {
            try {
              let localProducts = await page.evaluate(() => {
                return new Promise((resolve) => {
                  let products = Array.from(
                    document.querySelectorAll(".product-card a")
                  );

                  products = products.map((el) => {
                    return el.href;
                  });

                  products = [...new Set(products)];

                  resolve(products);
                });
              });

              products = [...products, ...localProducts];
              console.log("Intentando Mostrar más productos");
              await page.waitForTimeout(1000);
              await page.click(".pagination li:nth-child(3) a");
              console.log("Se encontraron más prodcutos");
              await getProducts();
            } catch (error) {
              console.log("No se pudo mostra más productos");
              console.log(error);
            }
          };

          await getProducts();

          for (productUrl of products) {
            try {
              await page.goto(productUrl);
              console.log("Se abrió url correctamente");
            } catch (error) {
              console.log("Error al abrir el producto");
            }

            var isTrueProduct = false;

            console.log("Intentando encontrar imagen");

            try {
              await page.waitForSelector("img:nth-child(2)", {
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
                  data.image = document.querySelector("img:nth-child(2)").src;

                  data.name = document.querySelector("h1").innerText;

                  if (document.querySelector(".price-item--sale")) {
                    data.price = document.querySelector(
                      ".price-item--sale"
                    ).innerText;
                    data.oldPrice = document.querySelector(
                      ".price-item--regular"
                    ).innerText;
                  } else {
                    data.price = document.querySelector(
                      ".price-item--regular"
                    ).innerText;
                    data.oldPrice = document.querySelector(
                      ".price-item--regular"
                    ).innerText;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  data.description += data.name + " ";
                  data.description += document.querySelector(
                    ".product-single__description h2"
                  )
                    ? document.querySelector(".product-single__description h2")
                        .innerText + " "
                    : "";

                  data.description += document.querySelector(
                    ".product-single__description ul"
                  )
                    ? document.querySelector(".product-single__description ul")
                        .innerText + " "
                    : "";

                  data.brand = {
                    title: "pielonline",
                    url: "https://www.pielonline.com/",
                  };

                  return data;
                });

                const product = buildProduct(webData, ["mujer"], {
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
