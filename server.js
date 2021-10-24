import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const app = express();
const port = 3000;

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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

/* www.suzies.cz */
app.get("/scrapper/suzies", async (req, res) => {
  const url = "http://www.suzies.cz/poledni-menu.html";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const weekDays = $(".uk-card-body");
  let menuData = [];

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
      menuData.push(item);
    }
  }

  res.send(menuData);
});

/* veroni-coffee */
app.get("/scrapper/veroni-coffee", async (req, res) => {
  const url = "https://www.menicka.cz/4921-veroni-coffee--chocolate.html";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  let menuData = [];

  const weekDays = $(".menicka");
  for (let date of weekDays) {
    const item = {
      date: $(date).children(".nadpis").text(),
      item: $(date).children("ul").children("li").text(),
    };
    menuData.push(item);
  }

  res.send(menuData);
});

/* denni-menu.php */
app.get("/scrapper/denni-menu", async (req, res) => {
  const url = "https://www.pivnice-ucapa.cz/denni-menu.php";

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  let menuData = [];

  const weekDays = $(".listek").children(".row");
  for (let date of weekDays) {
    let dailyItems = [];

    dailyItems.push(
      $(date).children(".col-md-9").children(".row").children(".polevka").text()
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
    menuData.push(item);
  }

  res.send(menuData);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
