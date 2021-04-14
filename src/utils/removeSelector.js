module.exports = async (page, selector) => {
  await page.evaluate(async (selector) => {
    if (document.querySelector(selector)) {
      document.querySelector(selector).innerHTML = "";
      document.querySelector(selector).className = "";
    }
  }, selector);
};
