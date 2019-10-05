const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { map, toNumber } = require('lodash');

const timeout = 10000;

const baseSearchUrl = 'https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=%EB%A1%9C%EB%98%90+2%ED%9A%8C+%EB%8B%B9%EC%B2%A8%EB%B2%88%ED%98%B8';

// const lottoNumber = [1,45];

(async () => {
  const browser = await puppeteer.launch({  });
  const page = await browser.newPage();
  await page.goto(baseSearchUrl, {waitUntil: 'networkidle2'});
  const html = await page.$eval( 'body', e => e.outerHTML );
  const $ = cheerio.load(html, {decodeEntities: false});
  const numbersEl = $('.lotto_wrap .num_box span.num');
  if (numbersEl.length === 0) {
    console.log('없는 회차');
  } else if (numbersEl.length < 7) {
    console.log('올바르지 않은 로또번호 개수');
  } else {
    const lottoArray = map(numbersEl, (el) => {
      const number = toNumber($(el).text());
      return number;
    });
    fs.writeFileSync('./scraping/lottoNumber.txt', lottoArray, 'utf8');
    console.log(lottoArray);
  }
  await browser.close();
})();