const models = require("./models");

models.sequelize
  .asnyc()
  .then(() => console.log("success"))
  .catch(err => console.log(err));
