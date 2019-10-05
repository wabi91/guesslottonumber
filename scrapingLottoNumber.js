const term = require('terminal-kit').terminal;
const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { map, toNumber } = require('lodash');

const timeout = 10000;

const getSearchUrl = (round) => (`https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=%EB%A1%9C%EB%98%90+${round}%ED%9A%8C+%EB%8B%B9%EC%B2%A8%EB%B2%88%ED%98%B8`);

const lottoNumberElPath = '.lotto_wrap .num_box span.num';
const dateElPath = '.lotto_wrap > div.lotto_tit > h3 > a > span';

// const lottoNumber = [1,45]; 880
const startRoundArg = process.argv.slice(2)[0] || 1;
const endRoundArg = process.argv.slice(3)[0];

term.bold.cyan('Start to scraping lotto numbers...\n');
term.green('Hit CTRL-C to stop scraping.\n\n');

const saveDir = './scraping';

try {
  (async () => {
    if (!fs.existsSync(saveDir)){
      fs.mkdirSync(saveDir);
    }
    const data = {};
    const browser = await puppeteer.launch({  });
    const page = await browser.newPage();
    const firstRound = toNumber(startRoundArg);
  
    const getData = async (round) => {
      await page.goto(getSearchUrl(round), {waitUntil: 'networkidle2'});
      const html = await page.$eval('body', e => e.outerHTML);
      const $ = cheerio.load(html, {decodeEntities: false});
      const numbersEl = $(lottoNumberElPath);
      const dateEl = $(dateElPath);
      if (
        numbersEl.length === 0
        || dateEl.length === 0
        || (endRoundArg && endRoundArg < round)
    ) {
        return;
      }
      term.bold.cyan(`Start to scrap ${round}st lotto numbers\n`);
      if (numbersEl.length < 7) {
        data[round] = {
          lottoNumbers: [],
          bonusNumber: null,
          error: '올바르지 않은 로또번호 개수',
        };
      } else {
        const lottoNumbers = map(numbersEl, (el) => toNumber($(el).text()));
        const bonusNumber = lottoNumbers.splice(6, 1);
        data[round] = {
          lottoNumbers,
          bonusNumber: bonusNumber ? bonusNumber[0] : null,
          error: '',
        };
      }
      term.bold.cyan(`finished scarping ${round}st lotto numbers\n`);
      term.red('------------------------\n');
      await getData(round + 1);
    };
    await getData(firstRound);
    fs.writeFileSync(
      `${saveDir}/lottoData.json`,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    await browser.close();
  })();
} catch(err) {
  process.exit();
}