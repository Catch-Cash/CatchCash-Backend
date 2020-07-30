const request = require("request");
const models = require("../../models");

const requestToOB = (options, bool) => {
  return new Promise(function (resolve, reject) {
    request(options, (err, res, body) => {
      if (err) {
        console.log("err" + err);
        reject(err);
      } else {
        // console.log(res);

        if (bool) resolve(body);
        else resolve(JSON.parse(body));
      }
    });
  });
};

const getCurrentDate = () => {
  const currentTime = new Date();

  const checkFormat = (num) => {
    if (num < 10) return `0${num}`;
    else return num;
  };

  return {
    year: checkFormat(currentTime.getFullYear()).toString(),
    month: checkFormat(currentTime.getMonth() + 1).toString(),
    date: checkFormat(currentTime.getDate()).toString(),
    hours: checkFormat(currentTime.getHours()).toString(),
    minutes: checkFormat(currentTime.getMinutes()).toString(),
    seconds: checkFormat(currentTime.getSeconds()).toString(),
  };
};

const makeRandomString = () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  const string_length = 9;
  let randomstring = "";
  for (let i = 0; i < string_length; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
};

const getAccountList = async (req, res) => {
  const user_seq_no = req.decoded.user_seq_no;

  try {
    const user = await models.User.findOne({
      where: {
        user_seq_no,
      },
    });
    const access_token = user.access_token;

    let fintechNumList = await getFintechNumList(access_token, user_seq_no);
    let account_list = [];

    const getAccountInfo = async () => {
      for (let i in fintechNumList) {
        const transactionList = await models.Transaction.findAll({
          where: {
            user_seq_no,
            fintech_use_num: fintechNumList[i].fintech_use_num,
          },
          order: [
            ["tran_date", "DESC"],
            ["tran_time", "DESC"],
          ],
          attributes: ["label", "tran_amt", "after_balance_amt"],
        });

        const info = {
          fintech_use_num: fintechNumList[i].fintech_use_num,
          account_alias: fintechNumList[i].account_alias,
          bank_name: fintechNumList[i].bank_name,
        };

        if (transactionList[0]) {
          info.balance_amt = transactionList[0].after_balance_amt;
          info.transaction_list = transactionList.slice(0, 3).map((i) => ({
            tran_amt: i.tran_amt,
            label: i.label,
          }));
        } else {
          info.balance_amt = "0";
          info.transaction_list = [];
        }
        account_list.push(info);
      }
    };

    await getAccountInfo();

    res.json({ account_list });
  } catch (e) {
    console.log(e);
    res.json({ status: 400 });
  }
};

const changeAccountName = async (req, res) => {
  try {
    const user_seq_no = req.decoded.user_seq_no;

    const user = await models.User.findOne({
      where: {
        user_seq_no,
      },
    });
    const access_token = user.access_token;

    const options = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      uri: "https://testapi.openbanking.or.kr/v2.0/account/update_info",
      body: {
        account_alias: req.body.account_alias,
        fintech_use_num: req.body.fintech_use_num,
      },
      json: true,
      method: "POST",
    };
    console.log(options.body);

    const response = await requestToOB(options, true);
    console.log(response);

    res.json({ message: "success" });
  } catch (e) {
    console.log(e);
  }
};

const getTransactions = async (req, res) => {
  try {
    const user_seq_no = req.decoded.user_seq_no;

    const user = await models.User.findOne({
      where: {
        user_seq_no,
      },
    });

    const fintechNumList = req.params.fintech_use_num
      ? [req.params.fintech_use_num]
      : await getFintechNumList(user.access_token, user_seq_no);

    let transactions = await models.Transaction.findAll({
      where: {
        fintech_use_num: fintechNumList.map((i) => i.fintech_use_num),
      },
      order: [
        ["tran_date", "DESC"],
        ["tran_time", "DESC"],
      ],
      attributes: [
        "tran_amt",
        "print_content",
        "tran_date",
        "label",
        "description",
        "fintech_use_num",
        "id",
      ],
    });

    const matchAccountAlias = (fintech_use_num) => {
      for (let i in fintechNumList) {
        if (fintech_use_num === fintechNumList[i].fintech_use_num)
          return fintechNumList[i].account_alias;
      }
    };

    transactions = transactions
      .map((i) => ({
        tran_amt: i.tran_amt,
        print_content: i.print_content,
        tran_date: i.tran_date,
        label: i.label,
        description: i.description,
        account_alias: matchAccountAlias(i.fintech_use_num),
        id: i.id,
      }))
      .slice((req.query.page_num - 1) * 10, req.query.page_num * 10);

    res.json({
      transaction_list: transactions,
      next_page_yn: "y",
    });
  } catch (e) {}
};

const modifyTransaction = async (req, res) => {
  try {
    const user_seq_no = req.decoded.user_seq_no;

    const infoToUpdate = {
      user_seq_no,
      print_content: req.body.print_content,
      label: req.body.label,
      description: req.body.description,
      transaction_id: req.body.transaction_id,
    };

    await models.Transaction.update(infoToUpdate);

    res.json({ message: "success cash_list change" });
  } catch (e) {}
};

const getFintechNumList = async (access_token, user_seq_no) => {
  try {
    let fintechNumList = [];

    const options = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      uri: "https://testapi.openbanking.or.kr/v2.0/account/list",
      qs: {
        user_seq_no,
        include_cancel_yn: "N",
        sort_order: "D",
      },
      method: "GET",
    };

    const response = await requestToOB(options);

    console.log(response);

    fintechNumList = response.res_list.map((i) => ({
      fintech_use_num: i.fintech_use_num,
      account_alias: i.account_alias,
      bank_name: i.bank_name,
    }));

    return fintechNumList;
  } catch (e) {
    console.log(e);
  }
};

const test = async () => {
  let id = 1;

  let amt1 = 500000;

  const data1 = [
    {
      tran_date: 20200105,
      tran_time: 010101,
      inout_type: "입금",
      print_content: "ㅁㄴㅇㄹ",
      description: "ㅁㄴㅇ",
      tran_amt: 1800000,
      branch_name: "ㄱ",
      label: 0,
    },
    {
      tran_date: 20200105,
      tran_time: 010501,
      inout_type: "입금",
      print_content: "ㄴㅇㄹㄴㄹ",
      description: "ㄴㅇㅇㄹ",
      tran_amt: 10000,
      branch_name: "ㄱ",
      label: 0,
    },
    {
      tran_date: 20200105,
      tran_time: 030101,
      inout_type: "출금",
      print_content: "ㅁㅎㅇㄴ",
      description: "ㅇㄹㄴ",
      tran_amt: 100000,
      branch_name: "ㄱ",
      label: 0,
    },
    {
      tran_date: 20200106,
      tran_time: 010101,
      inout_type: "출금",
      print_content: "ㅁㄴㅇㄹ",
      description: "ㅁㄴㅇ",
      tran_amt: 5000,
      branch_name: "ㄱ",
      label: 0,
    },
    {
      tran_date: 20200106,
      tran_time: 020101,
      inout_type: "출금",
      print_content: "ㅁㄴㅇㄹ",
      description: "ㅁㄴㅇ",
      tran_amt: 5000,
      branch_name: "ㄱ",
      label: 0,
    },
    {
      tran_date: 20200107,
      tran_time: 030101,
      inout_type: "출금",
      print_content: "ㅁㄴㅇㄹ",
      description: "ㅁㄴㅇ",
      tran_amt: 20000,
      branch_name: "ㄱ",
      label: 0,
    },
    {
      tran_date: 20200107,
      tran_time: 040101,
      inout_type: "입금",
      print_content: "ㅁㄴㅇㄹ",
      description: "ㅁㄴㅇ",
      tran_amt: 20000,
      branch_name: "ㄱ",
      label: 0,
    },
    {
      tran_date: 20200107,
      tran_time: 050101,
      inout_type: "출금",
      print_content: "ㅁㄴㅇㄹ",
      description: "ㅁㄴㅇ",
      tran_amt: 5000,
      branch_name: "ㄱ",
      label: 0,
    },
    {
      tran_date: 20200107,
      tran_time: 060101,
      inout_type: "출금",
      print_content: "ㅁㄴㅇㄹ",
      description: "ㅁㄴㅇ",
      tran_amt: 10000,
      branch_name: "ㄱ",
      label: 0,
    },
  ];

  data1.map((i) => {
    i.user_seq_no = "1100760786";
    i.fintech_use_num = "199163467057884420994485";
    i.inout_type === "출금" ? amt1 - i.tran_amt : amt1 + i.tran_amt;
    i.after_balance_amt = amt1;
  });

  await data1.forEach((item) => {
    models.Transaction.create(item);
  });
  res.json({ message: "success" });
};

const getAccountList_test = async (req, res) => {
  const user = await models.User.findOne({
    where: { user_seq_no: req.decoded.user_seq_no },
  });

  const currentDate = getCurrentDate();

  const option = {
    uri:
      "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
    qs: {
      bank_tran_id: "T991634670U" + makeRandomString(),
      fintech_use_num: "199163467057884420995156",
      inquiry_type: "A",
      inquiry_base: "D",
      from_data: "20200101",
      to_date: "20200730",
      sort_order: "D",
      tran_dtime:
        currentDate.year +
        currentDate.month +
        currentDate.date +
        currentDate.hours +
        currentDate.minutes +
        currentDate.seconds,
    },
  };
  request.get(option, (err, response, body) => {
    console.log(body);
    res.json(body);
  });
};

module.exports = {
  getAccountList,
  changeAccountName,
  getTransactions,
  modifyTransaction,
  test,
  getAccountList_test,
};
