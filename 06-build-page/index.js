const { readdir } = require('fs/promises');
const {
  createReadStream,
  createWriteStream,
  mkdir,
  copyFile,
  stat,
  unlink,
  rmdir,
  access,
  constants,
} = require('fs');
const path = require('path');

const pathToIndexHtml = path.join(__dirname, 'template.html');
const pathToComponents = path.join(__dirname, 'components');
const pathToStyles = path.join(__dirname, 'styles');
const pathToBuild = path.join(__dirname, 'project-dist');
const pathToBuildAssets = path.join(pathToBuild, 'assets');
const pathToAssets = path.join(__dirname, 'assets');
const buildHtml = path.join(pathToBuild, 'index.html');
const buildCss = path.join(pathToBuild, 'style.css');

// ------Создаём структуру папок билда-------
(async () => {
  mkdir(pathToBuild, { recursive: true }, (err) => {
    if (err) console.log(err);
    return;
  });
  mkdir(pathToBuildAssets, { recursive: true }, (err) => {
    if (err) console.log(err);
    return;
  });
  const assets = await readdir(pathToAssets, { withFileTypes: true });
  for (const asset of assets) {
    const pathToAsset = path.join(pathToBuildAssets, asset.name);
    mkdir(pathToAsset, { recursive: true }, (err) => {
      if (err) console.log(err);
      return;
    });
  }
})();

// ---------------Удаляем все файлы в билде-----------

async function deleteFilesIntoDirectory(pathToFolder) {
  try {
    const subjects = await readdir(pathToFolder, { withFileTypes: true });
    if (subjects.length === 0) return;
    for (const subject of subjects) {
      const pathToSubject = path.join(pathToFolder, subject.name);
      stat(pathToSubject, (err, stats) => {
        if (err) return;
        else if (!stats.isDirectory()) {
          unlink(pathToSubject, (err) => {
            if (err) console.log('удаление не удалось', err);
          });
        }
      });
    }
  } catch (error) {
    console.log('Folder is not deleted: ', pathToFolder, error);
  }
}

(async () => {
  deleteFilesIntoDirectory(pathToBuild);
  const folders = await readdir(pathToBuildAssets, { withFileTypes: true });
  for (const folder of folders) {
    const pathToFolder = path.join(pathToBuildAssets, folder.name);
    deleteFilesIntoDirectory(pathToFolder);
  }
})();

//=============Создаём разметку==============================

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
    console.error('The markup could not be created:', err);
  }
})();
// ----------Собираем стили------------------
(async () => {
  const styles = await readdir(pathToStyles, { withFileTypes: true });
  let content = '';
  for (const style of styles) {
    const extension = path.extname(style.name);
    if (extension !== '.css') return;
    const pathToStyle = path.join(pathToStyles, style.name);
    const readableStream = createReadStream(pathToStyle, 'utf-8');
    for await (const chunk of readableStream) {
      content += chunk;
    }
  }
  const writeStream = createWriteStream(buildCss);
  writeStream.write(content);
})();
// -----------------------------------------
// function folderExist(directoryPath) {
//   return access(directoryPath, constants.F_OK, (err) => {
//     if (err) {
//       return;
//     } else {
//       return true;
//     }
//   });
// }
// ---------------------------------------------
// folderExist(pathToAssets);
// console.log('folderExist(pathToAssets): ', folderExist(pathToAssets));

// stat(pathToBuild, (err, stats) => {
//   if (err) {
//     return;
//   } else {
//     if (stats.isDirectory()) {
//       readdir(pathToBuild, { withFileTypes: true }, (err, files) => {
//         if (err) {
//           console.log(err);
//         } else {
//           if (files.length === 0) return;
//           files.forEach((file) => {
//             const pathToFile = path.join(pathToBuild, file.name);
//             unlink(pathToFile, (err) => {
//               if (err) console.log(err);
//             });
//           });
//         }
//       });
//     }
//   }
// });

// async function deleteFilesIntoDirectory(pathToFolder) {
//   const subjects = await readdir(pathToFolder, { withFileTypes: true });
//   if (subjects.length === 0) {
//     rmdir(pathToFolder, (err) => {
//       if (err) throw err;
//       console.log('Папка успешно удалена');
//     });
//     return;
//   } else {
//     for (const subject of subjects) {
//       const pathToSubject = path.join(pathToFolder, subject.name);
//       stat(pathToSubject, (err, stats) => {
//         if (err) return;
//         else if (stats.isDirectory()) {
//           deleteFilesIntoDirectory(pathToSubject);
//         } else {
//           unlink(pathToSubject, (err) => {
//             if (err) console.log('удаление не удалось', err);
//           });
//         }
//       });
//     }
//   }
// }

// =============================================================
// const ASSETS = {};

// async function getStructureFolder(pathToFolder) {
//   stat(pathToFolder, (err, stats) => {
//     if (err) return;
//     if (stats.isDirectory()) {
//       const files = await readdir
//     }
//   });
// }

// (async () => {
//   try {
//     const folders = await readdir(pathToAssets, { withFileTypes: true });
//     for (const folder of folders) {
//       const pathToFile = path.join(pathToAssets, file.name);
//       const pathToCopyFile = path.join(pathToBuild, file.name);
//       copyFile(pathToFile, pathToCopyFile, (err) => {
//         if (err) console.log(`The ${file} could not be copied: `, err);
//       });
//     }
//   } catch (err) {
//     console.error('The files could not be copied: ', err);
//   }
// })();

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
