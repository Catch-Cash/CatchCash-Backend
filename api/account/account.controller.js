const request = require("request");
const models = require("../../models");

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
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3NlcV9ubyI6IjExMDA3NjA2NjciLCJpYXQiOjE1OTU4MTY0MjgsImV4cCI6MTU5NjE3NjQyOCwiaXNzIjoiZ2tydWQiLCJzdWIiOiJ1c2VyX2luZm8ifQ.p-QRX9xIY89zUZILe6d-JySJUu5AdA_0yqii2hqh4Sc";

    let fintechNumList = await getFintechNumList(access_token);
    console.log(fintechNumList);
    let account_list = [];

    const getAccountInfo = async () => {
      const currentTime = new Date();

      for (let i of fintechNumList.fintech_use_num) {
        const options = {
          headers: {
            Authorization: `Bearer ${access_token}`
          },
          uri:
            "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
          qs: {
            bank_tran_id: F123456789U4BC34239Z,
            fintech_use_num: i,
            inquiry_type: "A",
            inquiry_base: "D",
            from_date: 20200101,
            to_date: Number(
              `${currentTime.getFullYear()}${currentTime.getMonth() +
                1}${currentTime.getDay()}`
            ),
            sort_order: "D",
            tran_dtime: Number(
              `${currentTime.getFullYear()}${currentTime.getMonth() +
                1}${currentTime.getDay()}${currentTime.getHours()}${currentTime.getMinutes()}${currentTime.getSeconds()}`
            )
          },
          method: "GET"
        };

        await request(options, async (err, res, body) => {
          const response = JSON.parse(body);
          console.log(response);

          const info = {
            fintech_use_num: i.fintech_use_num,
            account_alias: i.account_alias,
            bank_name: i.bank_name,
            balance_amt: body.balance_amt,
            transaction_list: body.res_list.slice(0, 3)
          };

          info.transaction_list.map(i => ({}));

          account_list.push(info);
        });
      }
    };

    res.json({ message: 200 });
  } catch (e) {
    // console.log(e.message);
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
  let fintechNumList;

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

  await request(options, (err, res, body) => {
    const openResponse = JSON.parse(body);

    console.log(body);

    if (openResponse.rsp_code === "O0002") {
    } else {
      fintechNumList = openResponse.res_list.map(i => ({
        fintech_use_num: i.fintech_use_num,
        account_alias: i.account_alias,
        bank_name: i.bank_name
      }));
    }
  });

  return fintechNumList;
};

const getLastestTransactions = async fintechNumList => {
  const currentDate = new Date();

  for (let i of fintechNumList) {
    const lastestDate = await models.Transaction.findOne({
      where: {
        user_seq_no
      },
      order: [["createdAt", "DESC"]],
      attributes: ["tran_date", "tran_time"]
    });

    if (lastestDate === null) lastestDate = 20200101;

    let isNextPageExist = true;
    let before_inquiry_trance_info = "";
    let options = {
      headers: {
        Authorization: access_token
      },
      uri:
        "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
      qs: {
        bank_tran_id: "1212343456U987654321",
        fintech_use_num: fintechNumList[i],
        inquiry_type: "A",
        inquiry_base: "T",
        from_date: lastestDate.tran_date,
        from_time: lastestDate.tran_time,
        to_date: Number(
          `${currentDate.getFullYear()}${currentDate.getMonth() +
            1}${currentDate.getDay()}`
        ),
        to_time: Number(
          `${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}`
        ),
        sort_order: "A",
        tran_dtime: Number(
          `${currentDate.getFullYear()}${currentDate.getMonth() +
            1}${currentDate.getDay()}${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}`
        )
      }
    };

    await request(options, (err, res, body) => {
      if (err) console.log(err);
      else {
        console.log(body);
        isNextPageExist = body.next_page_yn === "Y";
        before_inquiry_trance_info = body.before_inquiry_trance_info;
        body.res_list.forEach(i => {
          models.Transaction.create(i);
        });
      }
    });

    while (isNextPageExist) {
      await request(options, async (err, res, body) => {
        if (err) console.log(err);
        else {
          console.log(body);
          isNextPageExist = body.next_page_yn === "Y";
          before_inquiry_trance_info = body.before_inquiry_trance_info;
          await body.res_list.forEach(i => {
            models.Transaction.create(i);
          });
        }
      });
    }
  }
};

module.exports = {
  getAccountList,
  changeAccountName,
  getTransactions,
  modifyTransaction,
  getLastestTransactions
};
