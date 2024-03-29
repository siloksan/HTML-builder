const readline = require('readline');
const fs = require('fs');
const { stdin: input, stdout: output } = require('process');
const path = require('path');

const rl = readline.createInterface({ input, output });
const pathToFile = path.join(__dirname, 'text.txt');
const writeStream = fs.createWriteStream(pathToFile);

function question() {
  output.write(
    'Do you want to add something else, if not, please enter "exit"?\n',
  );
}

question();

rl.on('line', (input) => {
  if (input === 'exit') {
    console.log('Goodbye!');
    rl.close();
  } else {
    writeStream.write(input);
    question();
  }
});

rl.on('SIGINT', () => {
  console.log('Goodbye!');
  rl.close();
});
