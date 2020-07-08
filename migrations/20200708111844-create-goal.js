'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('goals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_seq_no: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      goal_amount: {
        type: Sequelize.INTEGER
      },
      current_amount: {
        type: Sequelize.INTEGER
      },
      achievement_rate: {
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
    await queryInterface.dropTable('goals');
  }
};