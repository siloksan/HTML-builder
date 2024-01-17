const { readdir } = require('fs/promises');
const {
  createReadStream,
  createWriteStream,
  mkdir,
  copyFile,
  stat,
  unlink,
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

// ------Create a folder structure for the build-------

(async () => {
  try {
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
  } catch (error) {
    console.log('Folders are not created!', error);
  }
})();

//===============Delete all files in build============

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
            if (err) console.log('File is not deleted!', err);
          });
        }
      });
    }
  } catch (error) {
    console.log('Files into folder are not deleted! ', pathToFolder, error);
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

//=============Create the markup==============================

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

//==============Collect all the styles===============

(async () => {
  try {
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
  } catch (error) {
    console.log('Styles have not been collected!', error);
  }
})();

//===========Copy all the assets=================================

(async () => {
  try {
    const folders = await readdir(pathToAssets, { withFileTypes: true });
    for (const folder of folders) {
      const pathToFolder = path.join(pathToAssets, folder.name);
      const assets = await readdir(pathToFolder, { withFileTypes: true });
      for (const asset of assets) {
        const pathToAsset = path.join(pathToFolder, asset.name);
        const pathToCopyAsset = path.join(
          pathToBuildAssets,
          folder.name,
          asset.name,
        );
        copyFile(pathToAsset, pathToCopyAsset, (err) => {
          if (err) console.log(`The ${asset.name} could not be copied: `, err);
        });
      }
    }
  } catch (err) {
    console.error('The files could not be copied: ', err);
  }
})();
