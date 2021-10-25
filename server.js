import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const port = 3000;

const urlMapping = {
  suzies: "http://www.suzies.cz/poledni-menu.html",
  veroni_coffee: "https://www.menicka.cz/4921-veroni-coffee--chocolate.html",
  denni_menu: "https://www.pivnice-ucapa.cz/denni-menu.php",
};

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/scrapper/:tag", async (req, res) => {
  const { data } = await axios.get(urlMapping[req.params.tag]);
  const $ = cheerio.load(data);

  const getSuzieMenuData = () => {
    let suziData = [];
    const weekDays = $(".uk-card-body");

    for (let date of weekDays) {
      const titles = $(date).children("h3");
      const prices = $(date).children(".uk-grid-small").children(".price");
      const items = $(date)
        .children(".uk-grid-small")
        .children(".uk-width-expand");

      for (let i = 0; i < titles.length; i++) {
        const item = {
          date: $(date).children("h2").text(),
          title: $(titles[i]).text(),
          item: $(items[i]).text(),
          price: $(prices[i]).text(),
        };
        suziData.push(item);
      }
    }
    return suziData;
  };

  const getVeroniMenuData = () => {
    let veroniData = [];
    const weekDays = $(".menicka");
    for (let date of weekDays) {
      const dailyItems = [];
      for (let item of $(date)
        .children("ul")
        .children("li")
        .children(".polozka")) {
        dailyItems.push($(item).text());
      }
      const item = {
        date: $(date).children(".nadpis").text(),
        item: dailyItems,
      };
      veroniData.push(item);
    }
    return veroniData;
  };

  const getDenniMenuData = () => {
    let denniData = [];
    const weekDays = $(".listek").children(".row");
    for (let date of weekDays) {
      let dailyItems = [];

      dailyItems.push(
        $(date)
          .children(".col-md-9")
          .children(".row")
          .children(".polevka")
          .text()
      );
      for (let element of $(date).children(".col-md-9").children(".row")) {
        if ($(element).children(".col-md-9").text())
          dailyItems.push($(element).children(".col-md-9").text());
      }

      const item = {
        date: $(date)
          .children(".col-md-3")
          .children(".float-right")
          .children(".date")
          .text(),
        item: dailyItems,
      };
      denniData.push(item);
    }
    return denniData;
  };

  switch (req.params.tag) {
    case "suzies":
      res.send(getSuzieMenuData());
      break;
    case "veroni_coffee":
      res.send(getVeroniMenuData());
      break;
    case "denni_menu":
      res.send(getDenniMenuData());
      break;
    default:
      res.send("Something went wrong");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
