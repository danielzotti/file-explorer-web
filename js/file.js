export async function getFile(filePickerOptions) {
  try {
    const [fileHandle] = await window.showOpenFilePicker(filePickerOptions);

    if(!fileHandle) {
      console.log('[getFile] User cancelled or failed to open file');
      return;
    }
    return fileHandle.getFile();
  } catch(ex) {
    console.log('[getFile: catch]  User cancelled or failed to open file', ex);
  }
}

export async function getFiles(filePickerOptions) {
  try {
    const fileHandles = await window.showOpenFilePicker({ ...filePickerOptions, multiple: true });

    if(!fileHandles?.length) {
      console.log('[getFile] User cancelled or failed to open file');
      return;
    }
    return fileHandles.map(fileHandle => fileHandle.getFile());
  } catch(ex) {
    console.log('[getFile: catch]  User cancelled or failed to open file', ex);
  }
}

export async function getDirectoryTree(signal) {
  const directoryPickerOptions = {
    mode: 'read', // default
    // mode: 'readwrite',
  };

  try {
    const directoryHandle = await window.showDirectoryPicker(directoryPickerOptions);

    if(!directoryHandle) {
      console.log('User cancelled or failed to open file');
      return;
    }

    async function* getFilesRecursively(entry, level = 0, path = '') {

      if(signal.aborted) {
        throw new Error('aborted');
      }

      if(entry.kind === 'file') {

        const file = await entry.getFile();

        if(file !== null) {
          yield { name: file.name, size: file.size, isFolder: false, level, path: `${ path }/${ file.name }` };
        }
      } else if(entry.kind === 'directory') {
        path += `/${ entry.name }`;

        yield { name: entry.name, isFolder: true, level, path };

        level++;
        for await (const handle of entry.values()) {
          yield* getFilesRecursively(handle, level, path);
        }
      }
    }

    return getFilesRecursively(directoryHandle);

  } catch(ex) {
    if(ex.message === 'aborted') {
      console.log('Task aborted');
      return [];
    }
    console.log('[Catch] User cancelled or failed to open file');
    return [];
  }
}
