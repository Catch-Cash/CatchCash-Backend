const request = require("request");
const models = require("../../models");

const requestToOB = options => {
  return new Promise(function(resolve, reject) {
    request(options, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
};

const getCurrentDate = () => {
  const currentTime = new Date();

  const checkFormat = num => {
    if (num < 10) return `0${num}`;
    else return num;
  };

  return {
    year: checkFormat(currentTime.getFullYear()).toString(),
    month: checkFormat(currentTime.getMonth() + 1).toString(),
    date: checkFormat(currentTime.getDate()).toString(),
    hours: checkFormat(currentTime.getHours()).toString(),
    minutes: checkFormat(currentTime.getMinutes()).toString(),
    seconds: checkFormat(currentTime.getSeconds()).toString()
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
  // const user_seq_no = req.decoded.user_seq_no;

  // console.log(user_seq_no);
  try {
    //   const access_token = await models.User.findOne({
    //     where: {
    //       user_seq_no
    //     },
    //     attributes: ["access_token"]
    //   });

    const access_token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxMTAwNzYwNjY3Iiwic2NvcGUiOlsiaW5xdWlyeSIsImxvZ2luIiwidHJhbnNmZXIiXSwiaXNzIjoiaHR0cHM6Ly93d3cub3BlbmJhbmtpbmcub3Iua3IiLCJleHAiOjE2MDM3MTU0MjksImp0aSI6ImMyOWJjYzZlLWFjNDgtNGJmNy04OThlLTVhZTQyOTE3OGIxZSJ9.AOPrL2kcA9o5szwAfeXeyk0JEq6ox_I2NskaXo7Y5b8";
    // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3NlcV9ubyI6IjExMDA3NjEwNDQiLCJpYXQiOjE1OTU5ODM4NDIsImV4cCI6MTU5NjM0Mzg0MiwiaXNzIjoiZ2tydWQiLCJzdWIiOiJ1c2VyX2luZm8ifQ.0BEE2D-dYOSFQdO6diCnunqipWwrRF802ox7rkVNwyg";
    let fintechNumList = await getFintechNumList(access_token);
    let account_list = [];

    await getLastestTransactions(fintechNumList);

    const getAccountInfo = async () => {
      const currentTimeInfo = getCurrentDate();

      for (let i in fintechNumList) {
        const options = {
          headers: {
            Authorization: `Bearer ${access_token}`
          },
          uri:
            "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
          qs: {
            bank_tran_id: "T991634670U" + makeRandomString(),
            fintech_use_num: fintechNumList[i].fintech_use_num,
            inquiry_type: "A",
            inquiry_base: "D",
            from_date: 20200101,
            to_date:
              currentTimeInfo.year +
              currentTimeInfo.month +
              currentTimeInfo.date,
            sort_order: "D",
            tran_dtime:
              currentTimeInfo.year +
              currentTimeInfo.month +
              currentTimeInfo.date +
              currentTimeInfo.hours +
              currentTimeInfo.minutes +
              currentTimeInfo.seconds
          },
          method: "GET"
        };

        const response = await requestToOB(options);

        const info = {
          fintech_use_num: fintechNumList[i].fintech_use_num,
          account_alias: fintechNumList[i].account_alias,
          bank_name: fintechNumList[i].bank_name,
          balance_amt: response.balance_amt,
          transaction_list: response.res_list
            ? response.res_list.slice(0, 3)
            : []
        };

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

    const access_token = await models.User.findOne({
      where: {
        user_seq_no
      },
      attributes: ["access_token"]
    });

    const options = {
      headers: {
        Authorization: access_token
      },
      uri: "https://testapi.openbanking.or.kr/v2.0/account/update_info",
      form: {
        account_alias: req.body.account_alias,
        fintech_use_num: req.body.fintech_use_num
      },
      method: "POST"
    };

    await request(options, function(err, res, body) {});

    res.json({ message: "success" });
  } catch (e) {
    console.log(e);
  }
};

const getTransactions = async (req, res) => {
  try {
    const user_seq_no = req.decoded.user_seq_no;

    const access_token = await models.User.findOne({
      where: {
        user_seq_no
      },
      attributes: ["access_token"]
    });

    const getFintechUseNum = async () => {
      if (req.params.fintech_use_num) {
        return [req.params.fintech_use_num];
      } else {
        const options = {
          headers: {
            Authorization: access_token
          },
          uri: "https://testapi.openbanking.or.kr/v2.0/account/list",
          qs: {
            user_seq_no,
            include_cancel_yn: "N",
            sort_order: "D"
          },
          method: "GET"
        };

        await request(options, function(err, res, body) {
          if (err) console.log(err);
          else return body.res_list.map(i => i.fintech_use_num);
        });
      }
    };

    getLastTransactions(getFintechUseNum());
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
      transaction_id: req.body.transaction_id
    };

    await models.Transaction.update(infoToUpdate);

    res.json({ message: "success cash_list change" });
  } catch (e) {}
};

const getFintechNumList = async access_token => {
  try {
    let fintechNumList = [];

    const options = {
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      uri: "https://testapi.openbanking.or.kr/v2.0/account/list",
      qs: {
        user_seq_no: "1100760667",
        include_cancel_yn: "N",
        sort_order: "D"
      },
      method: "GET"
    };

    const response = await requestToOB(options);

    console.log(response);

    fintechNumList = response.res_list.map(i => ({
      fintech_use_num: i.fintech_use_num,
      account_alias: i.account_alias,
      bank_name: i.bank_name
    }));

    return fintechNumList;
  } catch (e) {
    console.log(e);
  }
};

const getLastestTransactions = async fintechNumList => {
  const currentTimeInfo = getCurrentDate();

  const user_seq_no = 1100760667;
  const access_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxMTAwNzYwNjY3Iiwic2NvcGUiOlsiaW5xdWlyeSIsImxvZ2luIiwidHJhbnNmZXIiXSwiaXNzIjoiaHR0cHM6Ly93d3cub3BlbmJhbmtpbmcub3Iua3IiLCJleHAiOjE2MDM3MTU0MjksImp0aSI6ImMyOWJjYzZlLWFjNDgtNGJmNy04OThlLTVhZTQyOTE3OGIxZSJ9.AOPrL2kcA9o5szwAfeXeyk0JEq6ox_I2NskaXo7Y5b8";

  for (let i in fintechNumList) {
    let lastestDate = await models.Transaction.findOne({
      where: {
        user_seq_no
      },
      order: [["createdAt", "DESC"]],
      attributes: ["tran_date", "tran_time"]
    });

    if (lastestDate === null)
      lastestDate = { tran_date: "20200101", tran_time: "010101" };

    console.log("lastestDate", lastestDate);

    let isNextPageExist = true;

    // while (isNextPageExist) {
    let options = {
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      uri:
        "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
      qs: {
        bank_tran_id: "T991634670U" + makeRandomString(),
        fintech_use_num: fintechNumList[i].fintech_use_num,
        inquiry_type: "A",
        inquiry_base: "T",
        from_date: lastestDate.tran_date,
        from_time: lastestDate.tran_time,
        to_date:
          currentTimeInfo.year + currentTimeInfo.month + currentTimeInfo.date,
        to_time:
          currentTimeInfo.hours +
          currentTimeInfo.minutes +
          currentTimeInfo.seconds,
        sort_order: "A",
        tran_dtime:
          currentTimeInfo.year +
          currentTimeInfo.month +
          currentTimeInfo.date +
          currentTimeInfo.hours +
          currentTimeInfo.minutes +
          currentTimeInfo.seconds,
        before_inquiry_trance_info: "sdfasdasdfdfsdfdsfsd"
      }
    };

    const response = await requestToOB(options);

    isNextPageExist = response.next_page_yn === "Y";

    console.log(response);

    // console.log(isNextPageExist, response.before_inquiry_trance_info);
    // before_inquiry_trance_info = response.before_inquiry_trance_info;
    await response.res_list.forEach(item => {
      models.Transaction.create({
        user_seq_no,
        fintech_use_num: fintechNumList[i].fintech_use_num,
        tran_date: item.tran_date,
        tran_time: item.tran_time,
        inout_type: item.inout_type,
        print_content: item.print_content,
        description: item.description,
        tran_amt: item.tran_amt,
        after_balance_amt: item.after_balance_amt,
        branch_name: item.branch_name,
        label: 0,
        transaction_id: null
      });
    });
    // }
  }
};

module.exports = {
  getAccountList,
  changeAccountName,
  getTransactions,
  modifyTransaction,
  getLastestTransactions
};
