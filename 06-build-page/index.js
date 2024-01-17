const { readdir, unlink } = require('fs/promises');
const { createReadStream, createWriteStream, stat, mkdir } = require('fs');
const path = require('path');

const pathToIndexHtml = path.join(__dirname, 'template.html');
const pathToComponents = path.join(__dirname, 'components');
const build = path.join(__dirname, 'project-dist');
const buildHtml = path.join(build, 'index.html');

stat(build, (err, stats) => {
  if (err) {
    return;
  } else {
    if (stats.isDirectory()) {
      readdir(build, { withFileTypes: true }, (err, files) => {
        if (err) {
          console.log(err);
        } else {
          if (files.length === 0) return;
          files.forEach((file) => {
            const pathToFile = path.join(build, file.name);
            unlink(pathToFile, (err) => {
              if (err) console.log(err);
            });
          });
        }
      });
    }
  }
});

mkdir(build, { recursive: true }, (err) => {
  if (err) console.log(err);
  return;
});

// ----------------------------------------------

const COMPONENTS = {};

(async () => {
  try {
    const files = await readdir(pathToComponents, { withFileTypes: true });
    for (const file of files) {
      const pathToFile = path.join(pathToComponents, file.name);
      COMPONENTS[file.name] = '';
      const readStream = createReadStream(pathToFile, 'utf-8');
      for await (const chunk of readStream) {
        COMPONENTS[file.name] += chunk;
      }
    }
    const readableStream = createReadStream(pathToIndexHtml, 'utf-8');
    let newMarkup = '';
    const regExp = new RegExp(/{{(\w+)}}/gm);
    for await (const chunk of readableStream) {
      newMarkup += chunk.replace(regExp, (match) => {
        const component = match.replace(/{|}/gm, '');
        return COMPONENTS[`${component}.html`];
      });
    }
    const writeStream = createWriteStream(buildHtml);
    writeStream.write(newMarkup);
  } catch (err) {
    console.error(err);
  }
})();

// ----------------------------------------------

// console.log('comp: ', COMPONENTS);
// (async () => {
//   try {
//     console.log('arr: ', arr);
//   } catch (err) {
//     console.error(err);
//   }
// })();

// async function readFilesIntoDirectory(pathToFolder, extension, object) {
//   try {
//     return await readdir(pathToFolder, { withFileTypes: true });
//   } catch (error) {
//     console.log(error);
//   }
// }

// function saveContentInObj(pathToFolder, component, object) {
//     const pathToFile = path.join(pathToFolder, component);
//     const readableStream = createReadStream(pathToFile, 'utf-8');
//     return new Promise((resolve, reject) => {
//         let content = '';
//     readableStream.on('data', (chunk) => {
//       content += chunk;
//     });
//     readableStream.on('end', () => {
//       object[component] = content;
//       resolve();
//     });
//     readableStream.on('error', (err) => {
//       reject(err);
//     });
//   });
// }

// function readFilesIntoDirectory(pathToFolder, extension, object) {
//   return new Promise((resolve, reject) => {
//     readdir(pathToFolder, { withFileTypes: true }, (err, files) => {
//       if (err) {
//         reject(err);
//       } else {
//         const promises = files.map((file) => {
//           if (file.isFile() && path.extname(file.name) === extension) {
//             return saveContentInObj(pathToFolder, file.name, object);
//           }
//         });
//         Promise.all(promises)
//           .then(() => {
//             resolve();
//           })
//           .catch((err) => {
//             reject(err);
//           });
//       }
//     });
//   });
// }

// readFilesIntoDirectory(pathToComponents, '.html', COMPONENTS);

// console.log('COMPONENTS: ', COMPONENTS);
// function getFileContent(pathToFolder, component) {
//   const pathToFile = path.join(pathToFolder, component);
//   let content = '';
//   readFile(pathToFile, 'utf-8', (err, data) => {
//     if (err) {
//       console.log(err);
//     } else {
//       content = data;
//     }
//   });
//   return content;
// }
