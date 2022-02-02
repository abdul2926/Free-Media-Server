function loadEpisode() {
	let xmlhttp = new XMLHttpRequest();
	let path = window.location.pathname.split('/');
	let id = path[path.length - 1];
	let url = `/api${window.location.pathname}`;

	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			setEpisode(JSON.parse(this.responseText));
		}
	}

	xmlhttp.open('GET', url, true);
	xmlhttp.send();
}

function setEpisode(data) {
	let video = document.getElementById('player');
	let id = document.location.pathname.split('/');
	id = id[id.length - 1];
	let filetype = data.files[id].split('.');
	filetype = filetype[filetype.length - 1];

	video.src += `/video/${window.location.pathname.replace('/series/', '')}`;
}