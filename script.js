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

    // Handle button click & Enter key
    fetchBtn.addEventListener('click', processVideo);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processVideo();
    });

    let currentVideoUrl = "";

    async function processVideo() {
        currentVideoUrl = urlInput.value.trim();
        hideElements([errorMessage, resultContainer]);
        
        if (!currentVideoUrl) {
            showError("Please enter a YouTube URL.");
            return;
        }

        const videoId = extractVideoID(currentVideoUrl);
        if (!videoId) {
            showError("Invalid YouTube URL. Please try again.");
            return;
        }

        loadingIndicator.classList.remove('hidden');

        try {
            // Fetch metadata to show the UI
            const noembedUrl = `https://noembed.com/embed?dataType=json&url=${encodeURIComponent(currentVideoUrl)}`;
            const response = await fetch(noembedUrl);
            const data = await response.json();

            if (data.error) throw new Error();

            videoTitle.textContent = data.title;
            videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            videoThumbnail.onerror = function() {
                this.src = data.thumbnail_url;
                this.onerror = null; 
            };

            // Remove previous event listeners to avoid multiple downloads
            const newBtnMp4 = btnMp4.cloneNode(true);
            const newBtnMp3 = btnMp3.cloneNode(true);
            btnMp4.parentNode.replaceChild(newBtnMp4, btnMp4);
            btnMp3.parentNode.replaceChild(newBtnMp3, btnMp3);

            // Add click events to trigger the download directly on the page
            newBtnMp4.addEventListener('click', (e) => handleDirectDownload(e, 'mp4', videoId));
            newBtnMp3.addEventListener('click', (e) => handleDirectDownload(e, 'mp3', videoId));

            loadingIndicator.classList.add('hidden');
            resultContainer.classList.remove('hidden');

        } catch (error) {
            loadingIndicator.classList.add('hidden');
            showError("Could not fetch video. It might be private.");
        }
    }

    async function handleDirectDownload(e, format, videoId) {
        e.preventDefault(); // Prevent opening a new tab
        const button = e.currentTarget;
        const originalText = button.innerHTML;
        
        // Change button text to show loading state
        button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;
        button.style.pointerEvents = "none"; // Disable clicking again

        try {
            // --- API INTEGRATION GOES HERE ---
            // Because public APIs die quickly, you will need to replace this URL 
            // and headers with a free API from RapidAPI (e.g., "YouTube Downloader API")
            
            /* // EXAMPLE OF HOW IT LOOKS WITH RAPIDAPI:
            const apiUrl = `https://youtube-downloader-api-url.p.rapidapi.com/download?id=${videoId}&format=${format}`;
            const apiResponse = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'YOUR_RAPID_API_KEY_HERE',
                    'X-RapidAPI-Host': 'youtube-downloader-api-url.p.rapidapi.com'
                }
            });
            const result = await apiResponse.json();
            const directDownloadLink = result.downloadUrl; // Depends on API structure
            */

            // For now, simulating the API response delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // FAKE LINK FOR DEMONSTRATION (Replace with real API response)
            // If you use a real API, the link will force a download dialog box.
            const directDownloadLink = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"; 

            // Force download on the same page
            triggerDownload(directDownloadLink);

        } catch (error) {
            alert("Error generating download link. Please try again.");
        } finally {
            // Restore button state
            button.innerHTML = originalText;
            button.style.pointerEvents = "auto";
        }
    }

    function triggerDownload(url) {
        // Creates a hidden anchor tag to force download without leaving the site
        const a = document.createElement('a');
        a.href = url;
        // The 'download' attribute tells the browser to save it rather than open it
        a.setAttribute('download', ''); 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

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
