const fs = require('fs');
const path = require('path');
const { stdout } = process;

const pathToFile = path.join(__dirname, 'text.txt');

const readableStream = fs.createReadStream(pathToFile, 'utf-8');

readableStream.on('data', (chunk) => stdout.write(chunk));
readableStream.on('error', (error) => console.log('Error!', error.message));
