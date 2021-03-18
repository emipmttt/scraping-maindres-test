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

    await shop_garzongarcia(page, dateScraping);
    await shop_tresasesbasicos(page, dateScraping);
    await shop_muaa(page, dateScraping);
    await shop_oklan(page, dateScraping);
    await shop_equus(page, dateScraping);
    await shop_baronhirsch(page, dateScraping);
    await shop_namer(page, dateScraping);
    await shop_keybiscayne(page, dateScraping);
    await shop_desiderata(page, dateScraping);
    await shop_domaleather(page, dateScraping);
    await shop_garzongarcia(page, dateScraping);
    await shop_harveywillys(page, dateScraping);

    // past
    await shop_sweetvictorian(page, dateScraping);
    await shop_tuck(page, dateScraping);
    await shop_madnessclothing(page, dateScraping);
    await shop_pielonline(page, dateScraping);
    await shop_47street(page, dateScraping);
    await shop_lazarocuero(page, dateScraping);
    await shop_sweet(page, dateScraping);
  } catch (error) {
    console.log(error);
  }
})();
