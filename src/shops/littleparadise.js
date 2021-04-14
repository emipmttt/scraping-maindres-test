const buildProduct = require('../utils/buildProduct');
const addProduct = require('../utils/addProduct');
const autoScroll = require('../utils/autoScroll');

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto('https://littleparadise.com.ar/index.php/tienda/');
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(document.querySelectorAll('a.category_item_link'));
        nav = nav.map((category) => {
          return category.href;
        });
        return nav;
      });

      console.log(routes);

      for (category of routes) {
        if (category != null) {
          console.log('[CATEGORY] - Abriendo ' + category);

          await page.goto(category);

          // await autoScroll(page);

          const clickOnShowMore = async () => {
            console.log('Intentando mostrar más productos');
            await page.waitForTimeout(1000);

            try {
              await page.waitForSelector('.next', {
                timeout: 3000,
              });

              await page.click('.next');

              await clickOnShowMore();
            } catch (error) {
              console.log('No se pudo Mostrar Productos');
              console.log(error);
            }
          };

          await clickOnShowMore();

          const products = await page.evaluate(() => {
            return new Promise((resolve) => {
              let products = Array.from(
                document.querySelectorAll('.loop-thumbnail')
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
              console.log('Se abrió url correctamente');
            } catch (error) {
              console.log('Error al abrir el producto');
            }

            var isTrueProduct = false;

            console.log('Intentando encontrar imagen');

            try {
              await page.waitForSelector('.product_title', {
                timeout: 3000,
              });
              isTrueProduct = true;
              console.log('Imagen1 encontrada');
            } catch {
              console.log('Imagen1 no encontrada');
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};

                  data.image = document.querySelector(
                    '.single-product-img '
                  ).src;
                  data.name = document.querySelector(
                    '.product_title'
                  ).innerText;

                  if (
                    document.querySelector('.product_summary_middle .price del')
                  ) {
                    data.price = document.querySelector(
                      '.product_summary_middle .price ins'
                    ).innerText;
                  } else {
                    data.price = document.querySelector(
                      '.product_summary_middle .price .amount'
                    ).innerText;
                  }

                  if (
                    document.querySelector('.product_summary_middle .price del')
                  ) {
                    data.oldPrice = document.querySelector(
                      '.product_summary_middle .price del'
                    ).innerText;
                  } else {
                    data.oldPrice = document.querySelector(
                      '.product_summary_middle .price .amount'
                    ).innerText;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  data.description =
                    data.name +
                    ' ' +
                    document.querySelector(
                      '.woocommerce-product-details__short-description'
                    ).innerText;

                  data.brand = {
                    title: 'littleparadise',
                    url: 'https://www.littleparadise.com.ar/',
                  };
                  return data;
                });

                console.log(webData);

                const product = buildProduct(webData, ['hombre']);
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
