const fetchButton = document.getElementById("fetchButton");
const urlInput = document.getElementById("urlInput");
const loadingDiv = document.getElementById("loading");
const alertDiv = document.getElementById("alert");
const resultDiv = document.getElementById("result");
const playlistDiv = document.getElementById("playlist");

fetchButton.addEventListener("click", async () => {
	try {
		const query = urlInput.value.trim();
		if (!query) {
			return Swal.fire({
				icon: "error",
				title: "Oops...",
				text: "Enter Url or Music Title",
			});
		}

		loadingDiv.classList.remove("hidden");
		const isURL = query.startsWith("http");
		const url = isURL
			? `https://api.yoshida.my.id/api/downloader/spotify?url=${encodeURIComponent(query)}`
			: `https://api.yoshida.my.id/api/internet/spotify?query=${encodeURIComponent(query)}`;
		const response = await fetch(url);
		const data = await response.json();
		loadingDiv.classList.add("hidden");

		if (Array.isArray(data)) {
			displayPlaylist(data);
		} else if (data.status && data.result) {
			displayTrack(data.result);
		} else {
			showAlert("error", "No results found.");
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		showAlert("error", "Error fetching data.");
	}
});

function displayPlaylist(tracks) {
	playlistDiv.innerHTML = tracks
		.map(
			(track) => `
      <div class="flex items-center py-2 border-b border-gray-700">
        <img src="${track.result.image}" alt="${track.result.name}" class="w-12 h-12 rounded-md mr-4">
        <div>
          <p class="font-semibold">${track.result.name}</p>
          <p class="text-sm">${track.result.artists}</p>
        </div>
        <button class="ml-auto bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg" onclick="showTrackDetail('${track.result.name}', '${track.result.artist}', '${track.result.duration_ms}', '${track.result.image}', '${track.result.link}')">
          Detail
        </button>
      </div>
    `,
		)
		.join("");
	playlistDiv.classList.remove("hidden");
	resultDiv.classList.add("hidden");
}

function displayTrack(track) {
	resultDiv.classList.remove("hidden");
	playlistDiv.classList.add("hidden");

	const { title, artis, durasi, image, download } = track;

	document.getElementById("title").textContent = title;
	document.getElementById("artis").textContent = `Artist: ${artis}`;
	document.getElementById("durasi").textContent =
		`Duration: ${secondsToMinutes(durasi)} minutes`;
	document.getElementById("image").src = image;

	const downloadLink = document.getElementById("downloadLink");
	downloadLink.href = download;
	downloadLink.setAttribute("download", title);

	// Fetch preview audio
	const previewAudio = document.getElementById("preview");
	previewAudio.src = download;
	previewAudio.load();
	previewAudio.play();

	showAlert("success", "Download success!");
}

function showTrackDetail(title, artist, duration, thumbnail, url) {
	Swal.fire({
		title: title,
		html: `
      <img src="${thumbnail}" alt="${title}" class="mb-4">
      <p class="font-semibold">Artist:</p>
      <p>${artist}</p>
      <p class="font-semibold">Duration:</p>
      <p>${duration}</p>
    `,
		showCancelButton: true,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Download",
		cancelButtonText: "Close",
	}).then((result) => {
		if (result.isConfirmed) {
			downloadTrack(url, title);
		}
	});
}

function downloadTrack(url, title) {
	showAlert("info", "Downloading Music");
	const downloadLink = document.createElement("a");
	downloadLink.href = download;
	downloadLink.setAttribute("download", title);
	downloadLink.click();
}

function showAlert(icon, text) {
	Swal.fire({
		icon: icon,
		text: text,
		position: "top-end",
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		toast: true,
		showClass: {
			popup: "animate__animated animate__fadeInRight",
		},
		hideClass: {
			popup: "animate__animated animate__fadeOutRight",
		},
	});
}

function secondsToMinutes(duration) {
	const minutes = Math.floor(duration / 60);
	const seconds = duration % 60;
	return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}