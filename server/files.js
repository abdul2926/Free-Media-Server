const fs = require('fs');
const config = require('./config');

// TODO: put library array in json object

module.exports = library;

const library = indexLibrary();

async function indexLibrary() {
    const libs = config.json.libs;
    const files = await gatherFiles(libs);
    const series = parseData(files);
    saveSeries(series);
    return series;
}

async function gatherFiles(paths) {
    let files = [];
    for (const path of paths) {
        try {
            const files = await fs.promises.readdir(path);
            for (const file of files) {
                const filePath = `${path}/${file}`;
                const stat = await fs.promises.stat(filePath);
                if (stat.isFile()) {
                    files.push(filePath);
                } else {
                    const dir = [filePath];
                    files.concat(await gatherFiles(dir));
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    return files;
}

function parseData(files) {
    let series = [];
    let seriesBuffer = resetBuffer();
    files.forEach(file => {
        const splitPath = file.split('/');
        const seriesName = splitPath[splitPath.length - 2];
        if (seriesBuffer.name == null || seriesBuffer.name == '') {
            seriesBuffer.name = seriesName;
            seriesBuffer.files.push(file);
        } else {
            if (seriesBuffer.name == seriesBuffer) {
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
