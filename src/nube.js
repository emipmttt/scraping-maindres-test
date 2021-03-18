const puppeteer = require("puppeteer");
const shop_tiendanube = require("./shops/tiendanube");
const shop_tuck = require("./shops/tuck.js");
const shop_desiderata = require("./shops/desiderata");
const shop_keybiscayne = require("./shops/keybiscayne");
const shop_garzongarcia = require("./shops/garzongarcia");
const shop_tresasesbasicos = require("./shops/tresasesbasicos");
const shop_namer = require("./shops/namer.js");
const shop_baronhirsch = require("./shops/baronhirsch.js");
const shop_oklan = require("./shops/oklan.js");
const shop_harveywillys = require("./shops/harveywillys.js");
const shop_equus = require("./shops/equus.js");
const shop_muaa = require("./shops/muaa.js");
const shop_pielonline = require("./shops/pielonline.js");
const shop_sweet = require("./shops/sweet.js");
const shop_47street = require("./shops/47street");
const shop_sweetvictorian = require("./shops/sweetvictorian");
const shop_lazarocuero = require("./shops/lazarocuero");
const shop_domaleather = require("./shops/domaleather");

(async (event, context, callback) => {
  let result = "result";
  let browser;

  try {
    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ["--disable-extensions"],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const dateScraping = 1615399414960;

    await shop_tiendanube(
      page,

      "https://www.anastasiamonaco.com.ar/",
      "anastasiamonaco",
      dateScraping,
      {
        tags: ["mujer"],
      }
    );

    await shop_tiendanube(
      page,
      "https://shop.innocenza.com.ar/",
      "innocenza",
      dateScraping
    );

    await shop_tiendanube(
      page,
      "https://www.mikson.com.ar/",
      "mikson",
      dateScraping,
      {
        tags: ["mujer"],
      }
    );
    await shop_tiendanube(
      page,
      "https://jotabags.com/",
      "jotabags",
      dateScraping,
      [{ tags: ["accesorios"] }]
    );
    await shop_tiendanube(
      page,
      "https://myrollingbag.mitiendanube.com/",
      "myrollingbag",
      dateScraping,
      { tags: ["accesorios"] }
    );
    await shop_tiendanube(
      page,
      "https://notnaked.com.ar/",
      "notnaked",
      dateScraping
    );
    await shop_tiendanube(
      page,
      "https://www.disturbia.com.ar/",
      "disturbia",
      dateScraping,
      {
        tags: ["mujer"],
      }
    );

    await shop_tiendanube(
      page,
      "https://www.bacchiba.com/",
      "bacchiba",
      dateScraping.toExponential,
      {
        tags: ["mujer"],
      }
    );

    await shop_tiendanube(
      page,
      "https://www.mankioficial.com/",
      "mankioficial",
      dateScraping
    );
    await shop_tiendanube(
      page,
      "https://www.pumbo.com.ar/",
      "pumbo",
      dateScraping
    );
    await shop_tiendanube(
      page,
      "https://shop.veroforest.com/",
      "veroforest",
      dateScraping
    );

    await shop_tiendanube(
      page,
      "https://www.florabikinis.com/",
      "florabikinis",
      dateScraping
    );
    await shop_tiendanube(
      page,
      "https://www.almacendepijamas.com/",
      "almacendepijamas",
      dateScraping
    );
    await shop_tiendanube(
      page,
      "https://tienda.melinapinedo.com/mx/",
      "melinapinedo",
      dateScraping
    );

    await shop_tiendanube(
      page,
      "https://www.dynamark.com.ar/",
      "dynamark",
      dateScraping
    );
    await shop_tiendanube(
      page,
      "https://www.anagray.com/",
      "anagray",
      dateScraping
    );

    await shop_tiendanube(
      page,
      "https://www.barbarab.com.ar/",
      "barbarab",
      dateScraping
    );

    await shop_tiendanube(
      page,
      "https://battlo2.mitiendanube.com/",
      "battlo2",
      dateScraping,
      {
        tags: ["mujer", "accesorios", "cartera"],
        options: {
          deleteDots: ".",
        },
      }
    );

    await shop_tiendanube(
      page,
      "https://cajubags.com/",
      "cajubags",
      dateScraping,
      {
        tags: ["accesorios"],
      }
    );

    // past

    await shop_tiendanube(
      page,

      "https://www.whydonna.com.ar/",
      "whydonna",
      dateScraping,
      {
        tags: ["mujer"],
      }
    );

    await shop_tiendanube(
      page,
      "https://www.pretzeloficial.com/",
      "pretzeloficial",
      dateScraping,
      {
        tags: ["No gender"],
      }
    );

    await shop_tiendanube(
      page,

      "https://hosefa.com/",
      "hosefa",
      dateScraping,
      {
        tags: ["mujer"],
      }
    );

    await shop_tiendanube(
      page,
      "https://www.gypsyba.com.ar/",
      "gypsyba",
      dateScraping,
      {
        tags: ["mujer"],
      }
    );
    await shop_tiendanube(
      page,
      "https://bullbags.mitiendanube.com/",
      "bullbags",
      dateScraping,
      { tags: ["accesorios"] }
    );
    await shop_tiendanube(
      page,

      "https://mulukstore.mitiendanube.com/",
      "mulukstore",
      dateScraping,
      { tags: ["accesorios"] }
    );

    await shop_tiendanube(
      page,

      "https://www.rangers.com.ar/",
      "rangers",
      dateScraping,
      {
        tags: ["zapatilla"],
      }
    );
  } catch (error) {
    console.log(error);
  }
})();
