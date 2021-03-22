module.exports = async (page, distance = 300, speed = 500) => {
  await page.evaluate(
    async ({ distance, speed }) => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, speed);
      });
    },
    { distance, speed }
  );
};
