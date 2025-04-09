// Verifica se o parâmetro veio pela URL ou foi definido manualmente
const videoUrl = window.videoUrl || new URLSearchParams(window.location.search).get('video');
alert(videoUrl);

if (videoUrl) {
    initPlayer(videoUrl);
    //document.querySelector(".players-container").classList.add("active");
} else {
    //esconde o player do vídeo quando não encontra uma URL
    //document.querySelector(".players-container").classList.remove("active");
}

//3. Identificar o tipo de URL e iniciar o player
function initPlayer(url) {
    try {
        if(url.includes("youtube.com") || url.includes("youtu.be")) {
            initVideo(url, "youtube");
            return;
        } else if(url.includes("vimeo.com")) {
            initVideo(url, "vimeo");
            return;
        } else if (url.endsWith('.m3u8')) {
            initVideoHls(url);
            return;
        } else if (url.endsWith('.mpd')) {
            initVideoDash(url);
            return;
        } else if (url.endsWith('.mp4')) {
            return "html";
        }
    } catch (error) {
        console.error("Erro ao iniciar vídeo", error);
        return;
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
            maxBufferLength: 60, //limita o buffer a 60 segundos para evitar sobrecarga de memória.
            liveSyncDuration: 30, //ajusta o sincronismo em streams ao vivo.
            maxBufferSize: 60 * 1000 * 1000 //limita o tamanho do buffer em bytes.
        });
		hls.loadSource(url);
		hls.attachMedia(container);
		window.hls = hls;
		
		// Handle changing captions
		player.on('languagechange', () => {
			setTimeout(() => hls.subtitleTrack = player.currentTrack, 50);
		});
	}

    player.fullscreen.enter(); //inicia em tela cheia
	window.player = player;
}

//inicia o player com dash.js (.mpd)
function initVideoDash(url) {
    const dash = dashjs.MediaPlayer().create();
    const container = document.querySelector('video');
	dash.initialize(container, url, true);

    const player = new Plyr(container, {captions: {active: true, update: true}, autoplay: true});

    player.fullscreen.enter(); //inicia em tela cheia
	window.player = player;
	window.dash = dash;
}

//inicia o player com os provedores vímeo ou youtube
function initVideo(url, provider) {
    const container = document.querySelector("#player-provider");
    container.setAttribute("data-plyr-provider", provider);
    container.setAttribute("data-plyr-embed-id", url);

    const player = new Plyr(container, { autoplay: true });

    player.fullscreen.enter(); //inicia em tela cheia
    window.player = player;
}

//indentifica o clique no controle
document.addEventListener('keydown', (event) => {
    keyPressed(event.key);
});

//aciona a ação de acordo com a tecla do controle
function keyPressed(key){
    switch (key) {
        case "ArrowRight": //avançar vídeo
            window.player.forward(); 
            break;

        case "ArrowLeft": //rebobinar vídeo
            window.player.rewind(); 
            break;

        case "Enter": //pausar/play vídeo
            window.player.togglePlay(); 
            break;

        default:
            break;
    }
}
