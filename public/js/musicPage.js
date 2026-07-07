import MusicPlayer from './MusicPlayer.js';

let musicPageParams = { currentAlbumID: 'CuCao', currentTrackID: ""};
const musicPagequery = new URLSearchParams(musicPageParams).toString();

window['music'] = function init(params)
{
    // 获得网页数据

    console.log('params:', params);

    
    const albumID = params.get('currentAlbumID') || "CuCao";
    const trackID = params.get('currentTrackID') || "";
    musicPageParams.currentAlbumID = albumID;
    musicPageParams.currentTrackID  = trackID;

    const query = new URLSearchParams(musicPageParams).toString();
    window.location.hash = `music?${query}`;

    // 初始化界面
    MusicPlayer.init();
    loadAlbumColumn();
    loadTracksColumn(musicPageParams.currentAlbumID);

    document.getElementById("track-interface").style.display = "contents";
    document.getElementById("describes-interface").style.display = "none";
    document.getElementById("describes-button").addEventListener('click', () => {
        if (document.getElementById("track-interface").style.display == "none")
        {
            document.getElementById("track-interface").style.display = "contents";
            document.getElementById("describes-interface").style.display = "none";

            document.querySelector("#describes-button span").textContent = "|专辑详细|";
        } else
        {
            document.getElementById("track-interface").style.display = "none";
            document.getElementById("describes-interface").style.display = "contents";

            document.querySelector("#describes-button span").textContent = "|返回|";
        }
    });
}
/* ---------------加载音轨界面---------------  */
async function loadTracksColumn(album)
{
    musicPageParams.currentTrackID = album;

    const jsonObj = await loadJsonFromUrl(`./src/album/${album}/data.json`);

    /* 设置专辑数据 */
    const albumCover = document.getElementById("album-cover")
    albumCover.src = `./src/album/${album}/cover.png`;

    const albumName = document.getElementById("album-name")
    albumName.textContent = jsonObj["name"];

    const albumArtist = document.getElementById("album-artist")
    albumArtist.textContent = jsonObj["artist"];

    const albumDate = document.getElementById("album-date")
    albumDate.textContent = jsonObj["date"];

    /* 添加专辑介绍 */
    document.getElementById("describes-interface").innerHTML = jsonObj["describes"];

    /* 添加发布平台 */
    const albumReleasePlatform = document.getElementById('album-release-platform');
    albumReleasePlatform.innerHTML = `
        <span>发布平台</span>
    `;
    for (var i=0; i<jsonObj["release-platform"].length; i++)
    {
        const urlObj = new URL(jsonObj["release-platform"][i]);
        const hostname = urlObj.hostname; // "sub.example.com"

        console.log(hostname);
        const trackHtmlString = `
            <a href=${urlObj} target="_blank"><img src="https://favicon.im/${hostname}?larger=true" alt="${hostname} favicon (large)" loading="lazy"  width="50" height="50"/></a>
        `;
        albumReleasePlatform.insertAdjacentHTML('beforeend', trackHtmlString);
    }

    /* 添加轨道 */
    const container = document.getElementById('tracks');
    container.innerHTML = `
        <span>播放列表</span>
    `;
    let playList = new Array;
    for (var i=0; i<jsonObj["tracks"].length; i++)
    {
        const tracksData = jsonObj["tracks"][i];
        const trackHtmlString = `
            <dt>
                <a data-index=${i} data-audioname='${tracksData["track-name"]}' style='width: 95%'>
                    <span id="track-name">
                        <span>${i + 1}.</span>
                        ${tracksData["track-name"]}
                        <span id="track-artist">${tracksData["track-artist"]}</span>
                    </span>
                    <span id="track-duration">${tracksData["track-duration"]}</span>
                </a>
            </dt>
        `;
        container.insertAdjacentHTML('beforeend', trackHtmlString);

        MusicPlayer.playList[i] = `./src/album/${album}/${tracksData["audio"]}`;
    }
    MusicPlayer.playList = playList;
    
    /* 按键判断  */
    const tracksA = document.querySelectorAll("#tracks a");

    tracksA.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            MusicPlayer.loadAudioFromPlayList(link.dataset.index, link.dataset.audioname);
        });
    });
}

/* ---------------加载界面界面--------------- */
async function loadAlbumColumn()
{
    const jsonObj = await loadJsonFromUrl(`./src/album/albumList.json`);

    const container = document.getElementById('albums');
    container.innerHTML = `
            <dt><span>单曲</span></dt>
    `;
    for (var i=0; i<jsonObj["Albums"].length; i++)
    {
        const albumData = await loadJsonFromUrl(`./src/album/${jsonObj["Albums"][i]["ID"]}/data.json`);

        const albumHtmlString = `
            <dt><a data-album=${jsonObj["Albums"][i]["ID"]}>
                <span class="album-date" id="albumColumn-album-date">${albumData["date"]}</span>
                <img src="src/album/${jsonObj["Albums"][i]["ID"]}/cover.png" alt="cover" id="albumColumn-album-cover" width="150" height="150">
                <span class="album-name" id="albumColumn-album-name">${albumData["name"]}</span>
                <span class="album-artist" id="albumColumn-album-artist">${albumData["artist"]}</span>
            </a></dt>
        `;
        container.insertAdjacentHTML('beforeend', albumHtmlString);
    }

    /* 按键判断  */
    const albumsA = document.querySelectorAll("#albums a");

    albumsA.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            loadTracksColumn(link.dataset.album);
        });
    });
}

async function loadJsonFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('请求失败');
    const data = await response.json();
    return data;
}