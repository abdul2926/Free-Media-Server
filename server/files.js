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
						} else if (fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png' || fileType == 'gif') {
                            filesArr.push(filePath)
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
        const isImage = fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png' || fileType == 'gif';
		if (isImage) {
			seriesBuffer.image = `${file}`
		} 

        if (seriesBuffer.name == null || seriesBuffer.name == '') {
            seriesBuffer.name = seriesName;
            if (!isImage) {
                seriesBuffer.files.push(file);
            }
        } else {
            if (seriesBuffer.name == seriesName) {
				seriesBuffer.files.push(file);
                seriesBuffer.files = seriesBuffer.files.sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
            } else {
                if (series.name != 'img') {
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
    series.forEach(function (serie, i) {
        serie.files.forEach(file => {
            if (file.includes('/img/')) {
                series.pop(i);
            }
        });
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
