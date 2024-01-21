const { createReadStream, createWriteStream, readdir } = require('fs');
const path = require('path');

const pathToCssFolder = path.join(__dirname, 'styles');
const bundle = path.join(__dirname, 'project-dist', 'bundle.css');
const writeStream = createWriteStream(bundle);

readdir(pathToCssFolder, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.log(err);
  } else {
    files.forEach((file) => {
      const extension = path.extname(file.name);
      if (extension !== '.css') return;
      const style = path.join(pathToCssFolder, file.name);
      const readableStream = createReadStream(style, 'utf-8');
      readableStream.on('data', (chunk) => {
        writeStream.write(chunk);
      });
    });
  }
});
