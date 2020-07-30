"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction.init(
    {
      user_seq_no: DataTypes.STRING,
      fintech_use_num: DataTypes.STRING,
      tran_date: DataTypes.INTEGER,
      tran_time: DataTypes.INTEGER,
      inout_type: DataTypes.STRING,
      print_content: DataTypes.STRING,
      description: DataTypes.STRING,
      tran_amt: DataTypes.INTEGER,
      after_balance_amt: DataTypes.STRING,
      branch_name: DataTypes.STRING,
      label: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Transaction"
    }
  );
  return Transaction;
};
