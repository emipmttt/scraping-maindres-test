const tags =
  "color salmón , durazno , tostado , verde militar , verde agua , terracota , manga princesa , frisa , campera de jean O DENIM , solero , bolsillos , necessaire , terciopelo , relleno , pantalon de pijama , remera de pijama , ropa de dormir , conjunto pijama corto , conjunto pijama largo , remera manga larga pijama , remera manga corta pijama , transparencias , cinturon incluido , vestidito o vestido , vestido musculosa , breteles , frase , inscripción";

const newTags = tags.split(",").map((tag) => {
  return {
    title: tag.trim(),
    options: [tag.trim(), tag.trim() + "s"],
  };
});

console.log(newTags);
