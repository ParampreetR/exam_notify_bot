const { Telegraf } = require("telegraf");
const Fastify = require("fastify");
const fastify = Fastify();
const axios = require("axios");
const https = require("https");
const fs = require("fs");

let refresh_rate = 5;
let stop = false;
const bot = new Telegraf("5282444761:AAFTF8INW4HRh0LEkM9BECE8hORvbMIqo8E", {
  handlerTimeout: 9_000_000,
});
bot.start((ctx) => ctx.reply("Welcome"));
bot.command("hi", (ctx) => ctx.reply("Hlo"));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

bot.command("inform", async (ctx) => {
  let input = ctx.message.text.split(" ");
  console.log(input);
  if (input.length >= 2) {
    if (!isNaN(input[1])) {
      let exam_code = input[1];
      let url = `https://paper.puexam.in/${exam_code}.pdf`;

      stop = false;
      while (true) {
        if (stop) {
          break;
        }
        try {
          let resp = await axios.get(url);
          if (!resp.data == undefined || !resp.data == "") {
            ctx.reply("Paper available.");

            const file = fs.createWriteStream(`./papers/${exam_code}.pdf`);
            const request = https.get(url, function (response) {
              ctx.reply("I'm Downloading");
              response.pipe(file).addListener("finish", () => {
                ctx.reply("Downloaded... Uploading in this chat");
                ctx
                  .replyWithDocument({
                    source: `./papers/${exam_code}.pdf`,
                    filename: `${exam_code}.pdf`,
                  })
                  .catch(function (error) {
                    console.log("Resource down");
                  });
              });
            });

            //});
          }
        } catch (err) {
          console.log("Resource down");
        }
        await sleep(refresh_rate * 1000);
      }
    } else return;
  } else {
    ctx.reply("Syntax: /inform <paper code>");
  }
  //  console.log(ctx.message);
});

fastify.get("/", (req, res) => {
  res.send("Hello");
});

fastify.listen(process.env.PORT, "0.0.0.0", (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  bot.launch();
  console.log(`Server live at ${address}`);
});
