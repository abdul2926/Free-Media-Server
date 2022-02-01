const fs = require('fs');
const config = require('./config');

module.exports = getLibrary();

const supportedVideoFormats = [ 'mp4', 'webm' ];
const supportedImageFormats = [ 'jpg', 'jpeg', 'png', 'gif' ];

async function getLibrary() {
    let files = await gatherFiles(config.library);
    let data = parseFiles(files);
    updateLibrary(data);
    return data;
}

async function gatherFiles(paths) {
    let filesArr = [];
    for (let i = 0; i < paths.length; i++) {
        let files = await fs.promises.readdir(paths[i]);
        for (let j = 0; j < files.length; j++) {
            let filePath = `${paths[i]}/${files[j]}`;
            let stat = await fs.promises.stat(filePath);
            if (stat.isFile()) {
                if (Array.isArray(files[j].split('.'))) {
                    let fileType = files[j].split('.').pop();
                    if (supportedImageFormats.includes(fileType) 
                    || supportedVideoFormats.includes(fileType)) {
                        filesArr.push(filePath);
                    }   
                }
            } else {
                filesArr = filesArr.concat(await gatherFiles([filePath]));
            }    
        }
    }

    return filesArr;
}

function parseFiles(files) {
    let data = [];
    if (typeof files === 'string') {
        files = [files];
    }

    let buffer = cleanBuffer();
    for (let i = 0; i < files.length; i++) {
        let split = files[i].split('/');
        let name = split[split.length - 2];
        let fileType = files[i].split('.').pop();
        let image = supportedImageFormats.includes(fileType);      

        if (buffer.name == '') {
            buffer.name = name;
            buffer = pushFile(image, buffer, files[i]);
        } else {
            if (buffer.name == name) {
                buffer = pushFile(image, buffer, files[i]);
            } else {
                buffer.files = sort(buffer.files);
                data.push(buffer);
                buffer = cleanBuffer();
                buffer.name = name;
                buffer = pushFile(image, buffer, files[i]);
            }
        }

        if (i == files.length - 1) {
            data.push(buffer);
        }
    }

    return data;
}

function cleanBuffer() {
    return {
        name: '',
        image: '',
        files: []
    };
}

function pushFile(image, buffer, file) {
    if (image) {
        buffer.image = file;
    } else {
        buffer.files.push(file);
    }
    
    return buffer;
}

function sort(data) {
    return data.sort((a, b) => a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: 'base'
        }
    ));
}

function updateLibrary(library) {
    fs.writeFile(
        './data/library.json',
        JSON.stringify(library, null, '  '),
        error => {
            if (error) {
                console.error(`Failed to save library: ${error}`);
            }
    });
}
