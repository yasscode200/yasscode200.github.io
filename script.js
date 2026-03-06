document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('video-url');
    const fetchBtn = document.getElementById('fetch-btn');
    const resultContainer = document.getElementById('result-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');

    // UI Elements for result
    const videoThumbnail = document.getElementById('video-thumbnail');
    const videoTitle = document.getElementById('video-title');
    const btnMp4 = document.getElementById('btn-mp4');
    const btnMp3 = document.getElementById('btn-mp3');

    fetchBtn.addEventListener('click', handleProcess);

    async function handleProcess() {
        const url = urlInput.value.trim();
        const videoId = extractVideoID(url);

        if (!videoId) {
            showError("Please enter a valid YouTube link!");
            return;
        }

        // Reset UI
        errorMessage.classList.add('hidden');
        resultContainer.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        try {
            // Step 1: Get Video Info (Thumbnail & Title)
            const infoRes = await fetch(`https://noembed.com/embed?url=${url}`);
            const infoData = await infoRes.json();
            
            videoTitle.textContent = infoData.title;
            videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

            // Step 2: Setup Direct Download Logic
            // Hna gha n-configuriw les boutons bach ikhdmo direct
            setupDownloadButton(btnMp4, videoId, 'mp4');
            setupDownloadButton(btnMp3, videoId, 'mp3');

            loadingIndicator.classList.add('hidden');
            resultContainer.classList.remove('hidden');
        } catch (err) {
            loadingIndicator.classList.add('hidden');
            showError("Error connecting to server. Try again.");
        }
    }

    function setupDownloadButton(button, id, format) {
        button.onclick = async (e) => {
            e.preventDefault();
            const originalText = button.innerHTML;
            button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Converting...`;
            button.style.pointerEvents = "none";

            try {
                // HNA KHASSK TDIR L-API KEY DYALK (RAPIDAPI)
                // Had l-API kat-converti f blasset SaveFrom
                const options = {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': 'YOUR_API_KEY_HERE', // Dkhul l RapidAPI w khoud key fabour
                        'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
                    }
                };

                const response = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${id}`, options);
                const data = await response.json();

                if (data.status === "ok") {
                    // Force direct download
                    const link = document.createElement('a');
                    link.href = data.link;
                    link.setAttribute('download', ''); 
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    alert("API limit reached or video unavailable.");
                }
            } catch (err) {
                alert("Download failed. Please try again.");
            } finally {
                button.innerHTML = originalText;
                button.style.pointerEvents = "auto";
            }
        };
    }

    function extractVideoID(url) {
        const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(reg);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function showError(msg) {
        document.getElementById('error-text').textContent = msg;
        errorMessage.classList.remove('hidden');
    }
});
