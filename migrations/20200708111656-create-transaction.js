'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_seq_no: {
        type: Sequelize.STRING
      },
      fintech_use_num: {
        type: Sequelize.STRING
      },
      tran_date: {
        type: Sequelize.STRING
      },
      tran_time: {
        type: Sequelize.STRING
      },
      inout_type: {
        type: Sequelize.STRING
      },
      print_content: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      tran_amt: {
        type: Sequelize.INTEGER
      },
      after_balance_amt: {
        type: Sequelize.STRING
      },
      branch_name: {
        type: Sequelize.STRING
      },
      label: {
        type: Sequelize.INTEGER
      },
      transaction_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transactions');
  }
};