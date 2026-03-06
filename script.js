document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('video-url');
    const fetchBtn = document.getElementById('fetch-btn');
    const errorMessage = document.getElementById('error-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultContainer = document.getElementById('result-container');
    
    const videoThumbnail = document.getElementById('video-thumbnail');
    const videoTitle = document.getElementById('video-title');
    const btnMp4 = document.getElementById('btn-mp4');
    const btnMp3 = document.getElementById('btn-mp3');

    // Handle button click
    fetchBtn.addEventListener('click', processVideo);

    // Handle Enter key press
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processVideo();
        }
    });

    async function processVideo() {
        const url = urlInput.value.trim();
        
        // Hide previous results/errors
        hideElements([errorMessage, resultContainer]);
        
        if (!url) {
            showError("Please enter a YouTube URL.");
            return;
        }

        const videoId = extractVideoID(url);
        if (!videoId) {
            showError("Invalid YouTube URL. Please make sure it's a valid link.");
            return;
        }

        // Show loading state
        loadingIndicator.classList.remove('hidden');

        try {
            // Fetch video metadata using a free public API (noembed)
            const apiUrl = `https://noembed.com/embed?dataType=json&url=${encodeURIComponent(url)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.error) {
                throw new Error("Could not fetch video details.");
            }

            // Populate UI with data
            videoTitle.textContent = data.title;
            // Upgrade to max-res thumbnail if available, otherwise fallback to HQ
            videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            
            // Fallback to standard quality if maxres throws an error (404)
            videoThumbnail.onerror = function() {
                this.src = data.thumbnail_url;
                this.onerror = null; // Prevent infinite loop
            };

            // Set external download links 
            // Note: Uses a popular web conversion interface as static JS cannot transcode video
            btnMp4.href = `https://ssyoutube.com/watch?v=${videoId}`;
            btnMp3.href = `https://loader.to/?link=${url}&f=mp3`;

            // Hide loading, show results
            loadingIndicator.classList.add('hidden');
            resultContainer.classList.remove('hidden');

        } catch (error) {
            loadingIndicator.classList.add('hidden');
            showError("An error occurred while fetching the video. It might be private or restricted.");
        }
    }

    // Utility: Extract YouTube ID via Regex
    function extractVideoID(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function showError(msg) {
        document.getElementById('error-text').textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideElements(elements) {
        elements.forEach(el => el.classList.add('hidden'));
    }
});
