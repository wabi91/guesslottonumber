const term = require('terminal-kit').terminal;
const fs = require('fs');
const brain = require('brain.js');
const { forEach, filter } = require('lodash');

const net = new brain.NeuralNetwork();

const loadDir = './scraping';

const lottoNumbers = [1, 45];
try {
  (async () => {
    if (!fs.existsSync(loadDir)){
      term.bold.red('Error: not exist directory\n');
      process.exit();
    }
    let data = fs.readFileSync(`${loadDir}/lottoData-test.json`, 'utf8');
    data = JSON.parse(data);
    // console.log(data);

    const trainData = [];
    forEach(data, (val) => {
      // TODO: 보너스 arg 추가

      const winningNumbers = val.lottoNumbers;
      for(let num = lottoNumbers[0]; num <= lottoNumbers[1]; num += 1) {
        trainData.push({
          input: [ num ],
          output: [winningNumbers.indexOf(num) !== -1 ? 1 : 0],
        });
      }

      
      // const winningNumbers = val.lottoNumbers;
      // for(let num = lottoNumbers[0]; num <= lottoNumbers[1]; num += 1) {
      //   trainData.push({
      //     input: {
      //       winningNumbers,
      //       number: num,
      //     },
      //     output: [winningNumbers.indexOf(num) !== -1 ? 1 : 0],
      //   });
      // }
    });
    net.train(trainData);
    console.log(trainData);


    const outputData = {};
    for(let num = lottoNumbers[0]; num <= lottoNumbers[1]; num += 1) {
      const output = net.run([1]);
      outputData[num] = `${output[0] * 100} %`;
    }
    console.log(outputData);


    // console.log(net.run({
    //   winningNumbers: [1,2,3,4,5,6],
    //   number: [1],
    // }));
  })();
} catch(err) {
  process.exit();
}
