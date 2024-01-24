const { readdir, stat } = require('fs');
const path = require('path');

const pathToFolder = path.join(__dirname, 'secret-folder');

readdir(pathToFolder, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.log(err);
  } else {
    files.forEach((file) => {
      if (file.isFile()) {
        const pathToFile = path.join(pathToFolder, file.name);
        stat(pathToFile, (err, stats) => {
          if (err) {
            console.log(err);
          } else {
            const withoutExtansion = file.name[0] === '.';
            const name = withoutExtansion ? file.name.slice(1) : file.name.split('.')[0];
            const extension = withoutExtansion ? ' ' : path.extname(file.name).slice(1);
            const size = stats.size;
            const fileInfo = `${name} - ${extension} - ${size} bytes`;
            console.log(fileInfo);
          }
        });
      }
    });
  }
});
