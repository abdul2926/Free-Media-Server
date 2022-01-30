function loadConfig() {
	let xmlhttp = new XMLHttpRequest();
	let url = `${window.location.hostname}/api/getconfig`;

	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			setData(JSON.parse(this.responseText));
		}
	}

	xmlhttp.open('GET', url, true);
	xmlhttp.send();
}

function setData(data) {
	let portInput = document.getElementById('port');
	portInput.value = data.port;

	let libInput = document.getElementById('libraries');
	libInput.value = data.libraries.join(';');

	let lockCheck = document.getElementById('lock');
	lockCheck.checked = data.lock;
}
