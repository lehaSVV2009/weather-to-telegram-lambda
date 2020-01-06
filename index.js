require("dotenv").config();

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.handler = async event => {
  console.log(event);

  try {
    const TMP_FILE_PATH = "/tmp/weather.png";

    const wttrResponse = await axios.get(
      `https://wttr.in/${process.env.CITY || "Minsk"}.png?1&m`,
      {
        responseType: "stream"
      }
    );
    wttrResponse.data.pipe(fs.createWriteStream(TMP_FILE_PATH));

    const formData = new FormData();
    formData.append("chat_id", process.env.TELEGRAM_CHAT_ID);
    formData.append("disable_notification", true);
    formData.append("photo", fs.createReadStream(TMP_FILE_PATH));
    const formHeaders = formData.getHeaders();
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
      formData,
      {
        headers: { ...formHeaders }
      }
    );

    console.log("Success");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" })
    };
  } catch (e) {
    console.log("Error", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: e.message })
    };
  }
};
