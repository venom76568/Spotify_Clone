let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith("mp3")) {
      songs.push(
        element.href.split(`/${currFolder}/`)[1].replaceAll("%20", " ")
      );
    }
  }
  return songs;
}

const playMusicfirst = (track, pause = false) => {
  //   let audio = new Audio("/songs/" + track);
  //   audio.play();
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songtime").innerHTML = "00.00 / 00.00";
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = " ";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                  <img class="invert"  src="img/music.svg" alt="" />
                  <div class="info">
                    <div class="songName">${
                      song.replaceAll("%20", " ").split(".mp3")[0]
                    }</div>
                    <div class="songArtist">Harsh</div>
                  </div>
                  <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/songplay.svg" alt="" />
                  </div>
                </li> `;
  }

  var audio = new Audio(songs[0]);
  //   audio.play();

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(
        e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3"
      );
    });
  });
};

const playMusic = (track) => {
  //   let audio = new Audio("/songs/" + track);
  //   audio.play();
  currentSong.src = `/${currFolder}/` + track;

  currentSong.play();

  play.src = "img/pause.svg";
  document.querySelector(".songtime").innerHTML = "00.00 / 00.00";
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = " ";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                  <img class="invert"  src="img/music.svg" alt="" />
                  <div class="info">
                    <div class="songName">${
                      song.replaceAll("%20", " ").split(".mp3")[0]
                    }</div>
                    <div class="songArtist">Harsh</div>
                  </div>
                  <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/songplay.svg" alt="" />
                  </div>
                </li> `;
  }

  var audio = new Audio(songs[0]);
  //   audio.play();

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(
        e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3"
      );
    });
  });
};

async function displayAlbums() {
  console.log("displaying albums");
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 2; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[1];
      // Get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div>
                <img class="hoverplay" src="img/play.svg" alt="" />
              </div>
              <img
                class="cardImage"
                src="/songs/${folder}/cover.jpg"
                alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  songs = await getSongs("songs/ncs");
  playMusicfirst(songs[0], true);
  currentSong.volume = 0.3;
  document.querySelector(".volume").getElementsByTagName("input")[0].value = 30;
  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/songplay.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ")
    );
    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });

  prev.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ")
    );
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log(e, e.target, e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      console.log(songs);
      playMusic(songs[0]);
    });
  });

  Array.from(document.getElementsByClassName("card")).forEach(() => {
    addEventListener("click", () => {
      document.querySelector(".hoverplay").style.opacity = "0";
    });
  });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
