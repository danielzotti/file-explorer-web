import { getFile, getFiles, getDirectoryTree } from './file.js';
import { printItem } from './ui.js';

//region READ FILE INFO
const selectFileButton = document.querySelector('#btn-select-file');
const fileInfoSection = document.querySelector('#file-info');

// Single file selection
async function showFileInfo() {
  const fileData = await getFile();
  console.log({ fileData });
  if(!fileData) {
    return;
  }
  fileInfoSection.innerHTML = printItem(fileData.name, fileData.size);
}

// Multiple files selection
async function showFilesInfo() {
  const fileDataList = await getFiles();
  console.log({ fileDataList });
  if(!fileDataList?.length) {
    return;
  }
  fileInfoSection.innerHTML = '';
  for await (const fileData of fileDataList) {
    fileInfoSection.innerHTML += printItem(fileData.name, fileData.size);
  }
}

selectFileButton.addEventListener('click', showFileInfo);
// endregion

//region READ DIRECTORY RECURSIVELY
const selectFolderButton = document.querySelector('#btn-select-folder');
const selectFolderStopButton = document.querySelector('#btn-select-folder-stop');
const directoryInfoSection = document.querySelector('#directory-info');
let directoryController = new AbortController();

async function showDirectory() {

  directoryController = new AbortController();
  const signal = directoryController.signal;

  directoryInfoSection.innerHTML = '';

  signal.addEventListener('abort', () => {
    selectFolderStopButton.style.display = 'none';
  });

  for await (const entry of await getDirectoryTree(signal)) {
    selectFolderStopButton.style.display = 'inline-block';
    const { name, size, isFolder, level, path } = entry;
    directoryInfoSection.innerHTML += printItem(name, size, isFolder, level, path);
  }
}

function stopShowDirectory() {
  directoryController.abort();
}

selectFolderButton.addEventListener('click', showDirectory);
selectFolderStopButton.addEventListener('click', stopShowDirectory);
selectFolderStopButton.style.display = 'none';


// endregion

//region PREVIEW IMAGE FILE
const selectImageButton = document.querySelector('#btn-select-image');
const fileImageSection = document.querySelector('#file-image');

async function showFileImage() {
  const image = fileImageSection.querySelector('img');
  const filePickerOptions = {
    types: [
      {
        description: 'Image',
        accept: {
          'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.svg', '.gif'],
        }
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false
  };

  const fileData = await getFile(filePickerOptions);

  if(!fileData) {
    image.src = '';
    fileImageSection.style.display = 'none';
    return;
  }
  const arrayBuffer = await fileData.arrayBuffer();
  image.src = URL.createObjectURL(new Blob([arrayBuffer]));
  fileImageSection.style.display = 'block';
}

selectImageButton.addEventListener('click', showFileImage);
// endregion

//region PREVIEW VIDEO FILE
const selectVideoButton = document.querySelector('#btn-select-video');
const fileVideoSection = document.querySelector('#file-video');

async function showFileVideo() {
  const video = fileVideoSection.querySelector('video');
  const filePickerOptions = {
    types: [
      {
        description: 'Video',
        accept: {
          'video/*': ['.mp4', '.webm', '.mov', '.ogg', '.mkv'],
        }
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false
  };

  const fileData = await getFile(filePickerOptions);

  if(!fileData) {
    fileVideoSection.style.display = 'none';
    video.src = '';
    return;
  }
  const arrayBuffer = await fileData.arrayBuffer();
  video.src = URL.createObjectURL(new Blob([arrayBuffer]));
  fileVideoSection.style.display = 'block';

}

selectVideoButton.addEventListener('click', showFileVideo);
// endregion

//region READ & WRITE TEXT FILE
let textFileHandle;
const fileWriteSection = document.querySelector('#file-content');
const fileNameSection = document.querySelector('#file-content-name');
const selectFileWriteButton = document.querySelector('#btn-select-file-write');
const saveFileButton = document.querySelector('#btn-save-file');
const saveAsFileButton = document.querySelector('#btn-save-as-file');
const clearFileButton = document.querySelector('#btn-clear-file');
const deleteFileButton = document.querySelector('#btn-delete-file');

function clearFileContent() {
  fileWriteSection.value = '';
  fileNameSection.innerHTML = '';
}

async function setFileName(fileHandle) {
  const fileData = await fileHandle.getFile();
  const { name, size } = fileData;
  fileNameSection.innerHTML = printItem(name, size);
}

async function showTextFileContent() {
  const filePickerOptions = {
    types: [
      {
        description: 'Text',
        accept: {
          'text/*': ['.html', '.js', '.ts', '.css', '.txt', '.md'],
          'application/json': ['.json']
        }
      },
    ],
    excludeAcceptAllOption: false,
    multiple: false
  };

  try {
    [textFileHandle] = await window.showOpenFilePicker(filePickerOptions);

    if(!textFileHandle) {
      console.log('User cancelled or failed to open file');
      return;
    }
    const fileData = await textFileHandle.getFile();

    const fileContent = await fileData.text();
    fileWriteSection.value = fileContent;

    await setFileName(textFileHandle);

  } catch(ex) {
    console.log('[Catch] User cancelled or failed to open file');
  }

}

async function saveTextFileContent() {
  if(!textFileHandle) {
    console.log('No file handle');
    return;
  }
  let stream = await textFileHandle.createWritable();
  await stream.write(fileWriteSection.value);
  await stream.close();
}

async function saveAsTextFileContent() {
  textFileHandle = await window.showSaveFilePicker();
  if(!textFileHandle) {
    console.log('No file handle');
    return;
  }
  let stream = await textFileHandle.createWritable();
  await stream.write(fileWriteSection.value);
  await stream.close();
  await setFileName(textFileHandle);
}

async function deleteFile() {

  if(!textFileHandle) {
    console.log('No file handle');
    return;
  }
  try {
    await textFileHandle.remove();
    clearFileContent();
  } catch(ex) {
    console.log('Problem deleting file');
  }
}

selectFileWriteButton.addEventListener('click', showTextFileContent);
saveFileButton.addEventListener('click', saveTextFileContent);
saveAsFileButton.addEventListener('click', saveAsTextFileContent);
clearFileButton.addEventListener('click', clearFileContent);
deleteFileButton.addEventListener('click', deleteFile);
// endregion
