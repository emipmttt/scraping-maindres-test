const tags = require("./tags");

test("[test] - Etiquetas con formato correcto", () => {
  tags.forEach((tag) => {
    expect(tag.title).toBeTruthy();
    expect(tag.title).not.toContain(/ /g);
    expect(tag.options).toBeTruthy();

    expect(tag.options.length).toBeGreaterThanOrEqual(1);
    expect(tag.options).toContain(tag.title);
    tag.options.forEach((option) => {
      expect(option).toBeTruthy();
      expect(option).not.toContain(/ /g);
    });
  });
});
