const models = require("../../models");
const Op = require("sequelize").Op;

const getInfo = async (category, user_seq_no) => {
  const goal = await models.Goal.findOne({
    where: {
      user_seq_no,
      category
    }
  });

  let current;

  switch (category) {
    case "expense":
      current = await models.Transaction.sum("tran_amt", {
        where: {
          user_seq_no,
          inout_type: "출금",
          [Op.not]: [{ label: [2, 9] }]
        }
      });

      if (isNaN(current)) current = 0;
      break;
    case "income":
      current = await models.Transaction.sum("tran_amt", {
        where: {
          user_seq_no,
          inout_type: "입금",
          label: 9
        }
      });

      if (isNaN(current)) current = 0;
      break;
    case "saving":
      current = await models.Transaction.sum("tran_amt", {
        where: {
          user_seq_no,
          label: 2
        }
      });
      if (isNaN(current)) current = 0;
      break;

    default:
      break;
  }

  const getAchievementRate = (current, goal) => {
    if (goal.goal_amount == 0) return 0;

    console.log(current, goal.goal_amount);

    return Math.ceil((current / goal.goal_amount) * 100);
  };

  return {
    goal: goal.goal_amount,
    current,
    rate: getAchievementRate(current, goal)
  };
};

const setGoal = async (req, res) => {
  try {
    const user_seq_no = req.decoded.user_seq_no;

    const infoToUpdate = {
      goal_amount: req.body.goal_amount
    };

    await models.Goal.update(infoToUpdate, {
      where: { user_seq_no, category: req.body.category }
    }).catch(e => console.log(e));
    const data = await getInfo(req.body.category, user_seq_no);

    console.log(data);

    res.json({
      goal_amount: data.goal,
      current_amount: data.current,
      achievement_rate: data.rate
    });
  } catch (e) {}
};

const getGoals = async (req, res) => {
  try {
    const user_seq_no = req.decoded.user_seq_no;

    const expense_goal = await models.Goal.findOrCreate({
      where: {
        user_seq_no,
        category: "expense"
      },
      defaults: {
        goal_amount: 0
      }
    });

    const income_goal = await models.Goal.findOrCreate({
      where: {
        user_seq_no,
        category: "income"
      },
      attributes: ["goal_amount"],
      defaults: {
        goal_amount: 0
      }
    });
    const saving_goal = await models.Goal.findOrCreate({
      where: {
        user_seq_no,
        category: "saving"
      },
      attributes: ["goal_amount"],
      defaults: {
        goal_amount: 0
      }
    });

    let expense_current = await models.Transaction.sum("tran_amt", {
      where: {
        user_seq_no,
        inout_type: "출금",
        [Op.not]: [{ label: [2, 9] }]
      }
    });

    if (isNaN(expense_current)) expense_current = 0;

    let income_current = await models.Transaction.sum("tran_amt", {
      where: {
        user_seq_no,
        inout_type: "입금",
        label: 9
      }
    });

    if (isNaN(income_current)) income_current = 0;

    let saving_current = await models.Transaction.sum("tran_amt", {
      where: {
        user_seq_no,
        label: 2
      }
    });

    if (isNaN(saving_current)) saving_current = 0;

    const getAchievementRate = (current, goal) => {
      if (goal.goal_amount == 0) return 0;

      return Math.ceil((current / goal.goal_amount) * 100);
    };

    const achievement_info = {
      expense: {
        goal_amount: expense_goal[0].goal_amount,
        current_amount: expense_current,
        achievement_rate: getAchievementRate(expense_current, expense_goal[0])
      },
      income: {
        goal_amount: income_goal[0].goal_amount,
        current_amount: income_current,
        achievement_rate: getAchievementRate(income_current, income_goal[0])
      },
      saving: {
        goal_amount: saving_goal[0].goal_amount,
        current_amount: saving_current,
        achievement_rate: getAchievementRate(saving_current, saving_goal[0])
      }
    };

    res.json(achievement_info);
  } catch (e) {
    console.log(e);

    res.json(e);
  }
};

module.exports = {
  setGoal,
  getGoals
};
