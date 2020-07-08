'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class goal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  goal.init({
    user_seq_no: DataTypes.STRING,
    category: DataTypes.STRING,
    goal_amount: DataTypes.INTEGER,
    current_amount: DataTypes.INTEGER,
    achievement_rate: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'goal',
  });
  return goal;
};