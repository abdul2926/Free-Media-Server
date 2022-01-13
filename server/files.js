const fs = require('fs');
const config = require('./config');

// TODO: add function to return library without indexing

module.exports.getLibrary = indexLibrary;

const supportedFormats = [
	'mp4',
	'mpeg'
];

async function indexLibrary() {
    const libs = config.json.libs;
    const files = await gatherFiles(libs);
    const series = parseData(files);
	if (series == []) {
		return;
	}

    const seriesObj = {
        series: series
    }
    saveSeries(JSON.parse(JSON.stringify(seriesObj)));
    return JSON.parse(JSON.stringify(seriesObj));
}

async function gatherFiles(paths) {
    let filesArr = [];
    for (const path of paths) {
        try {
            const files = await fs.promises.readdir(path);
            for (const file of files) {
                const filePath = `${path}/${file}`;
                const stat = await fs.promises.stat(filePath);
                if (stat.isFile()) {
					let fileSplit = file.split('.');
					if (Array.isArray(fileSplit)) {
						let fileType = fileSplit[fileSplit.length - 1];
						if (supportedFormats.includes(fileType)) {
							filesArr.push(filePath);
						} else if (fileType == 'jpg' | 'jpeg' | 'png' | 'gif') {
							fs.copyFile(filePath, `./img/${file}`, () => {
								filesArr.push(`./img/${file}`);
							});
							filesArr.push(`./img/${file}`);
						}
					}
                } else {
                    let dir = [filePath];
                    filesArr = filesArr.concat(await gatherFiles(dir));
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    return filesArr;
}

function parseData(files) {
    let series = [];
	
    let seriesBuffer = resetBuffer();
    files.forEach(function (file, i) {
        const splitPath = file.split('/');
        const seriesName = splitPath[splitPath.length - 2];
		
		const fileSplit = file.split('.');
		const fileType = fileSplit[fileSplit.length - 1];
		if (fileType == 'jpg' | 'jpeg' | 'png' | 'gif') {
			seriesBuffer.image = `${file}`;
		} 

        if (seriesBuffer.name == null | seriesBuffer.name == '') {
            seriesBuffer.name = seriesName;
			seriesBuffer.files.push(file);
        } else {
            if (seriesBuffer.name == seriesName) {
				seriesBuffer.files.push(file);
            } else {
				if (seriesName != 'img') {
					series.push(seriesBuffer);
                	seriesBuffer = resetBuffer();
                	seriesBuffer.name = seriesName;
					seriesBuffer.files.push(file);
				}
            }
        }
		if (i == files.length - 1) {
			series.push(seriesBuffer);
		}
    });
    return series;
}

function resetBuffer() {
    return {
        name: '',
        image: '/img/placeholder.jpg',
        files: [

        ]
    }
}

function saveSeries(series) {
	fs.writeFile('./library.json', JSON.stringify(series, null, '\t'), error => {
		if (error) {
			// TODO: Better error handling
			console.log(`Failed to write library data: ${error}`)
		}
	});
}
