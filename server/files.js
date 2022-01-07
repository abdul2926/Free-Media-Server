const fs = require('fs');
const config = require('./config');

// TODO: add function to return library without indexing

const library = indexLibrary();
module.exports = library;

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
                    filesArr.push(filePath);
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
    files.forEach(file => {
        const splitPath = file.split('/');
        const seriesName = splitPath[splitPath.length - 2];
        if (seriesBuffer.name == null || seriesBuffer.name == '') {
			console.log('First item');
            seriesBuffer.name = seriesName;
            seriesBuffer.files.push(file);
        } else {
            if (seriesBuffer.name == seriesName) {
                seriesBuffer.files.push(file);
            } else {
                series.push(seriesBuffer);
                seriesBuffer = resetBuffer();
                seriesBuffer.name = seriesName;
                seriesBuffer.files.push(file);
            }
        }
    });
    return series;
}

function resetBuffer() {
    return {
        name: '',
        image: '',
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
