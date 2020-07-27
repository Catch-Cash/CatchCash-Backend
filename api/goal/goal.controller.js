const models = require("../../models");

const setGoal = async (req, res) => {
  try {
    // const user_seq_no = req.decoded.user_seq_no;

    const user_seq_no = "afshdifishqjihdsh";

    const infoToUpdate = {
      user_seq_no,
      category: req.body.category,
      goal_amount: req.body.goal_amount
    };

    await models.Goal.update(infoToUpdate);

    res.json({ messeage: "goal modified" });
  } catch (e) {}
};

const getGoals = async (req, res) => {
  try {
    // const user_seq_no = req.decoded.user_seq_no;

    const user_seq_no = "afshdifishqjihdsh";

    const expense_goal = await models.goal.findOrCreate({
      where: {
        user_seq_no,
        category: "expense"
      },
      attributes: ["goal_amount"],
      defaults: {
        goal_amount: 0
      }
    });
    const income_goal = await models.goal.findOrCreate({
      where: {
        user_seq_no,
        category: "income"
      },
      attributes: ["goal_amount"],
      defaults: {
        goal_amount: 0
      }
    });
    const saving_goal = await models.goal.findOrCreate({
      where: {
        user_seq_no,
        category: "saving"
      },
      attributes: ["goal_amount"],
      defaults: {
        goal_amount: 0
      }
    });

    // await models.Transactions.sum("tran_amt", {
    //   where: {
    //     user_seq_no,
    //     inout_type: "출금",
    //     [Op.not]: [{ label: [2, 9] }]
    //   }
    // }).then(sum => console.log(sum));
    // const income_current = await models.Transactions.sum("tran_amt", {
    //   where: {
    //     user_seq_no,
    //     inout_type: "입금",
    //     label: 2
    //   }
    // });
    // const saving_current = await models.Transactions.sum("tran_amt", {
    //   where: {
    //     user_seq_no,
    //     label: 9
    //   }
    // });

    const getAchievementRate = (current, goal) => {
      return (current / goal) * 100;
    };

    const achievement_info = {
      expense: {
        goal_amount: expense_goal[0].goal_amount
        // current_amount: expense_current,
        // achievement_rate: getAchievementRate(expense_current, expense_goal)
      }
      // income: {
      //   goal_amount: income_goal,
      //   current_amount: income_current,
      //   achievement_rate: getAchievementRate(income_current, income_goal)
      // },
      // saving: {
      //   goal_amount: saving_goal,
      //   current_amount: saving_current,
      //   achievement_rate: getAchievementRate(saving_current, saving_goal)
      // }
    };

    res.json(achievement_info);
  } catch (e) {}
};

module.exports = {
  setGoal,
  getGoals
};
