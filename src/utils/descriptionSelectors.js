module.exports = (descriptionElements) => {
  let description = "";

  console.log(descriptionElements);

  for (const selector of descriptionElements) {
    const element = document.querySelector(selector);
    if (element) {
      description += element.innerText + " ";
    }
  }

  console.log(description);

  return description;
};
