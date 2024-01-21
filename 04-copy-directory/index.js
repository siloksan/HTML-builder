const { readdir, copyFile, mkdir, stat, unlink } = require('fs');
const path = require('path');

const pathToFolder = path.join(__dirname, 'files');
const pathToCopyFolder = path.join(__dirname, 'files-copy');

stat(pathToCopyFolder, (err, stats) => {
  if (err) {
    return;
  } else {
    if (stats.isDirectory()) {
      readdir(pathToCopyFolder, { withFileTypes: true }, (err, files) => {
        if (err) {
          console.log(err);
        } else {
          if (files.length === 0) return;
          files.forEach((file) => {
            const pathToFile = path.join(pathToCopyFolder, file.name);
            unlink(pathToFile, (err) => {
              if (err) console.log(err);
            });
          });
        }
      });
    }
  }
});

mkdir(pathToCopyFolder, { recursive: true }, (err) => {
  if (err) console.log(err);
  return;
});

stat(pathToFolder, (err, stats) => {
  if (err) {
    console.log(err);
  } else {
    if (stats.isDirectory()) {
      readdir(pathToFolder, { withFileTypes: true }, (err, files) => {
        if (err) {
          console.log(err);
        } else {
          if (files.length === 0) return;
          files.forEach((file) => {
            const pathToFile = path.join(pathToFolder, file.name);
            const pathToCopyFile = path.join(pathToCopyFolder, file.name);
            copyFile(pathToFile, pathToCopyFile, (err) => {
              if (err) console.log(err);
            });
          });
        }
      });
    }
  }
});
