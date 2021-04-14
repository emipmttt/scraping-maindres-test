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
      // headless: false,
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const dateScraping = 1615399414960;
    await shop_tiendanube(page, "https://klihor.com/", "klihor", dateScraping);

    await shop_tiendanube(
      page,
      "https://www.aguschueizer.com/",
      "mitiendanube",
      dateScraping
    );

    await shop_tiendanube(
      page,
      "https://laslobas.mitiendanube.com/",
      "mitiendanube",
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
      "https://www.calipsian.com/",
      "calipsian",
      dateScraping
    );

    await shop_tiendanube(
      page,
      "https://www.cumbrebuenosaires.com.ar/",
      "cumbrebuenosaires",
      dateScraping
    );

    await shop_tiendanube(
      page,
      "https://www.almacendepijamas.com/",
      "almacendepijamas",
      dateScraping,
      { limit: 500 }
    );

    await shop_tiendanube(
      page,
      "https://www.silenelingerie.com.ar/",
      "silenelingerie",
      dateScraping
      // { tags: ["mujer"] }
    );

    await shop_tiendanube(
      page,
      "https://tienda.melinapinedo.com/mx/",
      "melinapinedo",
      dateScraping,
      { tags: ["mujer"] }
    );

    await shop_tiendanube(
      page,
      "https://www.barbarab.com.ar/",
      "barbarab",
      dateScraping,
      { tags: ["mujer", "accesorios"] }
    );

    await shop_tiendanube(
      page,
      "https://www.pretzeloficial.com/",
      "pretzeloficial",
      dateScraping,
      {
        tags: ["no gender", "unisex"],
        options: {
          deleteDots: ".",
        },
      }
    );

    await shop_tiendanube(
      page,
      "https://www.dynamark.com.ar/",
      "dynamark",
      dateScraping,
      { tags: ["mujer"] }
    );
    await shop_tiendanube(
      page,
      "https://www.anagray.com/",
      "anagray",
      dateScraping,
      { tags: ["Mujer"] }
    );

    await shop_tiendanube(
      page,
      "https://battlo2.mitiendanube.com/",
      "battlo2",
      dateScraping,
      {
        tags: ["mujer", "accesorios"],
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
        tags: ["accesorios", "mujer"],
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
      "https://www.mankioficial.com/",
      "mankioficial",
      dateScraping,
      {
        tags: ["hombre"],
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
      { tags: ["accesorios", "mujer"] }
    );
    await shop_tiendanube(
      page,

      "https://mulukstore.mitiendanube.com/",
      "mulukstore",
      dateScraping,
      { tags: ["accesorios", "mujer"] }
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
    await shop_tiendanube(
      page,

      "https://www.anastasiamonaco.com.ar/",
      "anastasiamonaco",
      dateScraping,
      {
        tags: ["mujer", "Lencería"],
      }
    );
    await shop_tiendanube(
      page,
      "https://shop.innocenza.com.ar/",
      "innocenza",
      dateScraping,
      { tags: ["mujer"] }
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
      { tags: ["mujer", "accesorios"] }
    );
    await shop_tiendanube(
      page,
      "https://myrollingbag.mitiendanube.com/",
      "myrollingbag",
      dateScraping,
      { tags: ["accesorios", "mujer"] }
    );
    await shop_tiendanube(
      page,
      "https://notnaked.com.ar/",
      "notnaked",
      dateScraping,
      {
        tags: ["mujer", "plus size"],
      }
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
      "https://www.pumbo.com.ar/",
      "pumbo",
      dateScraping,
      { tags: ["mujer"] }
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
      "https://shop.veroforest.com/",
      "veroforest",
      dateScraping,
      {
        tags: ["mujer"],
      }
    );

    await shop_tiendanube(
      page,
      "https://www.florabikinis.com/",
      "florabikinis",
      dateScraping,
      { tags: ["mujer", "mallas"] }
    );
  } catch (error) {
    console.log(error);
  }
})();
