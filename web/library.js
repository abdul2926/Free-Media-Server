function setContent(library) {
    let content = document.getElementById('content');
    let innerHTML = content.innerHTML();
    library.forEach(series => {
        const seriesEntry = `<div class="seriesEntry">
        <img src="${series.image}" alt="image unavailable">
        <span>${series.name}</span>
        </div>`;
        innerHTML += seriesEntry;
    });
    content.innerHTML = innerHTML;
}

function fetchLibrary() {
    let xmlhttp = new XMLHttpRequest();
    let url = `${window.location.hostname}/api/getlib`;

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            cacheLibrary(data);
        }
    }

    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function cacheLibrary(data) {
    let library = JSON.parse(data);
    const date = new Date();
    library.date = date.getTime();
    localStorage['library'] = JSON.stringify(library);
}

function getLibrary() {
    let stored = localStorage['library'];
    if (stored) {
        let library = JSON.parse(stored);
        const date = new Date();
        if (date - library.date > 20) {
            library = fetchLibrary();
            return library;
        }
        return library;
    } else {
        let library = fetchLibrary();
        return library;
    }
}
