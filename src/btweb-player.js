document.addEventListener('DOMContentLoaded', function() {
    const socket = new WebSocket("wss://myradio.bibliotehnika.com/api/live/nowplaying/websocket");

    socket.onopen = function(e) {
        socket.send(JSON.stringify({
            "subs": {
                "station:techno_chronicle": {
                    "recover": true
                },
                "station:prava": {
                    "recover": true
                }
            }
        }));
    };

    function updateWebSocketInfo(data) {
        const stationElement = document.querySelector('#ws-station span');
        const nowPlayingElement = document.querySelector('#ws-now-playing span');
        const listenersElement = document.querySelector('#ws-listeners span');
        const liveElement = document.querySelector('#ws-live span');
        const onlineElement = document.querySelector('#ws-online span');

        if (stationElement) stationElement.textContent = data.station?.name || 'N/A';
        if (nowPlayingElement) nowPlayingElement.textContent = data.now_playing?.song?.title || 'N/A';
        if (listenersElement) listenersElement.textContent = data.listeners?.current || 'N/A';
        if (liveElement) liveElement.textContent = data.live ? 'Yes' : 'No';
        if (onlineElement) onlineElement.textContent = data.is_online ? 'Yes' : 'No';
    }

    function handleSseData(ssePayload, useTime = true) {
        const jsonData = ssePayload.data;

        if (useTime && 'current_time' in jsonData) {
            currentTime = jsonData.current_time;
        }

        nowplaying = jsonData.np;

        // Update UI for techno station
        const technoElement = document.getElementById('now-playing-techno');
        if (technoElement && jsonData.np.station && jsonData.np.station.shortcode === 'techno_chronicle') {
            
            const nowPlayingData = jsonData.np.now_playing || {};
            const stationName = jsonData.np.station?.name || 'N/A';
            const songTitle = nowPlayingData.song?.title || 'N/A';
            const artistName = nowPlayingData.song?.artist || 'N/A';
            const albumArt = nowPlayingData.song?.art || '';
            const listeners = jsonData.np.listeners.current || 'N/A';
            const is_online = jsonData.np.is_online ? 'Yes' : 'No';
            const bitrate = jsonData.np.mounts?.bitrate || 'N/A';
            

            technoElement.innerHTML = `
                ${albumArt ? `<img src="${albumArt}" alt="Album Art" width="100" height="100">` : ''}
                <div class="marquee">
                    <p class="song-title"><span>Song:</span> ${songTitle}</p>
                </div>
                <p><span>Artist:</span> ${artistName}</p>
                <p><span>Bitrate:</span> ${bitrate} kbps</p>
                <p><span>Listeners:</span> ${listeners}</p>
                <p><span>Online:</span> ${is_online}</p>
                <p><span>Station:</span> ${stationName}</p>
            `;
        }

        // Update UI for prava station
        const pravaElement = document.getElementById('now-playing-prava');
        if (pravaElement && jsonData.np.station && jsonData.np.station.shortcode === 'prava') {
            const nowPlayingData = jsonData.np.now_playing || {};
            const songTitle = nowPlayingData.song?.title || 'N/A';
            const artistName = nowPlayingData.song?.artist || 'N/A';
            const albumArt = nowPlayingData.song?.art || '';
            const listeners = jsonData.np.listeners.current || 'N/A';
            const is_online = jsonData.np.is_online ? 'Yes' : 'No';

            pravaElement.innerHTML = `
                ${albumArt ? `<img src="${albumArt}" alt="Album Art" width="100" height="100">` : ''}
                <div class="marquee">
                    <p class="song-title"><span>Song:</span> ${songTitle}</p>
                </div>
                <p><span>Artist:</span> ${artistName}</p>
                <p><span>Listeners:</span> ${listeners}</p>
                <p><span>Online:</span> ${is_online}</p>
            `;
        }

        // Update the websocket-info section
        updateWebSocketInfo(jsonData.np);
    }

    socket.onmessage = function(e) {
        const jsonData = JSON.parse(e.data);

        if ('connect' in jsonData) {
            const connectData = jsonData.connect;

            if ('data' in connectData) {
                connectData.data.forEach(
                    (initialRow) => handleSseData(initialRow)
                );
            } else {
                if ('time' in connectData) {
                    currentTime = Math.floor(connectData.time / 1000);
                }

                for (const subName in connectData.subs) {
                    const sub = connectData.subs[subName];
                    if ('publications' in sub && sub.publications.length > 0) {
                        sub.publications.forEach((initialRow) => handleSseData(initialRow, false));
                    }
                }
            }
        } else if ('pub' in jsonData) {
            handleSseData(jsonData.pub);
        }
    };

    socket.onerror = function(e) {
        console.error('WebSocket Error:', e);
    };
});
