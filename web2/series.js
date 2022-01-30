function loadSeries() {
	let xmlhttp = new XMLHttpRequest();
	let path = window.location.pathname.split('/');
	let id = path[path.length - 1];
	let url = `/api/series/${id}`;

	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			setData(JSON.parse(this.responseText));
		}
	}

	xmlhttp.open('GET', url, true);
	xmlhttp.send();
}

function setData(data) {
	let container = document.getElementById('seriesContent');
	let content = container.innerHTML;
	let seriesId = document.location.pathname.split('/');
	seriesId = seriesId[seriesId.length - 1];	

	data.files.forEach((item, i) => {
		let name = item.split('/');
		name = name[name.length - 1];
		content += `
		<a href="/series/${seriesId}/${i}">
		<div class="episodeItem">
		${name}
		</div>
		</a>
		`;
	});
	container.innerHTML = content;

	let title = document.getElementById('title');
	title.innerHTML = data.name;
}
