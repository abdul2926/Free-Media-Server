function loadContent() {
	if (!cached()) {
		cacheLibrary();
	} else {
		setContent();
	}
}

function setContent() {
	let cache = localStorage['library'];
	let library = JSON.parse(cache);

    let content = document.getElementById('homeContent');
    let innerHTML = content.innerHTML;
    library.series.forEach((series, i) => {
        const libItem = `
		<a class="libItem" href="/series/${i}">
		<div>
        <img src="${series.image}" alt="image unavailable">
        <span>${series.name}</span>
        </div>
		</a>`;
        innerHTML += libItem;
    });
    content.innerHTML = innerHTML;
}

function cacheLibrary() {
	let xmlhttp = new XMLHttpRequest();
    let url = `${window.location.hostname}/api/getlib`;

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let library = JSON.parse(this.responseText);
    		const date = new Date();
    		library.date = date.getTime();
    		localStorage['library'] = JSON.stringify(library);
			setContent();
        }
    }

    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function cached() {
	let cache = localStorage['library'];
	if (cache) {
		let library = JSON.parse(cache);
		const date = new Date();
		if (library.date) {
			if (date.getTime() - library.date > 3000) {
				return false;
			}
		}
		return true;
	} else {
		return false;
	}
}
