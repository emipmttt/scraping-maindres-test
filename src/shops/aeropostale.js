const buildProduct = require('../utils/buildProduct');
const addProduct = require('../utils/addProduct');
const autoScroll = require('../utils/autoScroll');

module.exports = async (page, dateScraping) => {
  try {
    {
      try {
        await page.goto('https://aeropostale.com.ar/');
      } catch (error) {}

      const routes = await page.evaluate(async () => {
        // routes es el array que guarda los enlaces
        // de las categorías
        let nav = Array.from(
          document.querySelectorAll('.menu-item-type-taxonomy a')
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
          console.log('[CATEGORY] - Abriendo ' + category);

          await page.goto(category);

          // await autoScroll(page);

          const clickOnShowMore = async () => {
            // await autoScroll(page);
            console.log('Intentando mostrar más productos');
            await page.waitForTimeout(1000);

            try {
              await page.waitForSelector('a.nav-next', {
                timeout: 3000,
              });

              await page.click('a.nav-next');

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
                document.querySelectorAll('.entry-title a')
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
              console.log('Error al abrir el producto', productUrl);
            }

            var isTrueProduct = false;

            try {
              await page.waitForSelector('.entry-title', {
                timeout: 3000,
              });
              isTrueProduct = true;
            } catch {
              console.log('Imagen no encontrada', productUrl);
              isTrueProduct = false;
            }
            if (isTrueProduct) {
              try {
                const webData = await page.evaluate(() => {
                  var data = {};

                  data.image = document.querySelector('img.zoomImg').src;

                  data.name = document.querySelector('.entry-title').innerText;
                  if (document.querySelector('.price')) {
                    data.price = document.querySelector('.price ins').innerText;
                  } else {
                    data.price = document.querySelector(
                      '.price span bdi'
                    ).innerText;
                  }

                  if (document.querySelector('.price del')) {
                    data.oldPrice = document.querySelector(
                      '.price del'
                    ).innerText;
                  } else {
                    data.oldPrice = document.querySelector(
                      '.price span bdi'
                    ).innerText;
                  }

                  data.originalId = document.location.href;
                  data.url = document.location.href;

                  data.description =
                    data.name +
                    ' ' +
                    document.querySelector('.sku_wrapper').innerText;

                  data.brand = {
                    title: 'aeropostale',
                    url: 'https://aeropostale.com.ar/',
                  };
                  console.log(data);
                  return data;
                });

                const product = buildProduct(webData, ['mujer',"aeropostale"]);
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
