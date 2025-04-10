// Usa window.videoUrl diretamente para evitar redeclaração
var videoUrl = window.videoUrl ?? new URLSearchParams(window.location.search).get('video');

alert(videoUrl);

if (videoUrl) {
    initPlayer(videoUrl);
}

//3. Identificar o tipo de URL e iniciar o player
function initPlayer(url) {
    try {
        if(url.includes("youtube.com") || url.includes("youtu.be")) {
            initVideo(url, "youtube");
        } else if(url.includes("vimeo.com")) {
            initVideo(url, "vimeo");
        } else if (url.endsWith('.m3u8')) {
            initVideoHls(url);
        } else if (url.endsWith('.mpd')) {
            initVideoDash(url);
        } else if (url.endsWith('.mp4')) {
            initVideoHtml(url);
        }
    } catch (error) {
        console.error("[PROXY] Erro ao iniciar vídeo", error);
    }
}

//inicia o player com hls.js (.m3u8)
function initVideoHls(url) {
    const container = document.querySelector('video');
    const player = new Plyr(container, { autoplay: true });
    
    if (!Hls.isSupported()) {
        container.src = url;
    } else {
        const hls = new Hls({
            maxBufferLength: 60,
            liveSyncDuration: 30,
            maxBufferSize: 60 * 1000 * 1000
        });
        hls.loadSource(url);
        hls.attachMedia(container);
        window.hls = hls;
        
        player.on('languagechange', () => {
            setTimeout(() => hls.subtitleTrack = player.currentTrack, 50);
        });
    }

    player.fullscreen.enter();
    window.player = player;
}

//inicia o player com dash.js (.mpd)
function initVideoDash(url) {
    const container = document.querySelector('video');
    const dash = dashjs.MediaPlayer().create();
    dash.initialize(container, url, true);

    const player = new Plyr(container, { captions: { active: true, update: true }, autoplay: true });

    player.fullscreen.enter();
    window.player = player;
    window.dash = dash;
}

//inicia o player com os provedores Vimeo ou YouTube
function initVideo(url, provider) {
    const container = document.querySelector("#player-provider");
    container.setAttribute("data-plyr-provider", provider);
    container.setAttribute("data-plyr-embed-id", url);

    const player = new Plyr(container, { autoplay: true });

    player.fullscreen.enter();
    window.player = player;
}

//inicia o player para vídeos MP4
function initVideoHtml(url) {
    const container = document.querySelector('video');
    container.setAttribute("controls", "");
    container.setAttribute("autoplay", "");
    container.src = url;

    const player = new Plyr(container);
    player.fullscreen.enter();
    window.player = player;
}

// Identifica o clique no controle
document.addEventListener('keydown', (event) => {
    keyPressed(event.key);
});

// Aciona a ação de acordo com a tecla do controle
function keyPressed(key){
    if (!window.player) return;

    switch (key) {
        case "ArrowRight":
            window.player.forward();
            break;
        case "ArrowLeft":
            window.player.rewind();
            break;
        case "Enter":
            window.player.togglePlay();
            break;
        default:
            break;
    }
}
