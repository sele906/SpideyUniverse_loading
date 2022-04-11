var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

//system variables
let gamespeed;
var animation;
var timer = 0;
var musictimer = 0;

var bg = new Image();
bg.src = 'bgimg.png';

var backgroundY = 0;
var bgspeed = 1;

class Background {
  constructor() {
    this.sx = 0;
    
    this.sw = 3900;
    this.sh = 1500;
    this.x = 0,
    this.x2 = 1300;
    this.y = 0;
    this.w = 1300;
    this.h = 500;
    this.draw = function () {
      ctx.drawImage(bg, this.sx, backgroundY, this.sw, this.sh, this.x2 -= bgspeed, this.y, this.w, this.h);
      if (this.x2 <= 0) {
        this.x2 = 1300;
      }
      ctx.drawImage(bg, this.sx, backgroundY, this.sw, this.sh, this.x -= bgspeed, this.y, this.w, this.h);
      if (this.x <= -1300) {
        this.x = 0;
      }
      
    }
  }
}

var background = new Background();
background.draw();

//eventlisteners
let keys = {};
document.addEventListener('keydown', function(evt) {
  keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false;
});

//player variables
var gravity;
let walking = 0;
let frameIndex = 0;
var fps = 10;
var characterY = 0;
var jumpsound = document.getElementById('jumpsound');

//player
var character = new Image();
character.src = "character.png";

class Player {
  constructor (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.dy = 0;
    this.jumpForce = 9;
    this.originalHeight = h;
  }

  Animate() {
    //Jump
    if(keys['Space'] || keys['ArrowUp']) {
      frameIndex = 4;
      this.Jump();
      jumpsound.play();
    } else {
      this.jumpTimer = 0;
      jumpsound.pause();
      jumpsound.currentTime = 0;
    }

    if (keys['ArrowDown']) {
      frameIndex = 5;
      this.h = this.originalHeight / 2;
    } else {
      this.h = this.originalHeight;
    }

    this.y += this.dy;

    //gravity
    if (this.y + this.h< 220) {
      this.dy += gravity;
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = 220 - this.h;
    }

    this.Draw();
  }

  Jump() {
    if (this.grounded && this.jumpTimer == 0) {
      this.jumpTimer = 1;
      this.dy = -this.jumpForce;
    } else if (this.jumpTimer > 0 && this.jumpTimer < 13) {
      this.jumpTimer++;
      this.dy = -this.jumpForce - (this.jumpTimer / 42);
    }
  }

  Draw () {
  ctx.fillStyle = 'transparent';
  ctx.fillRect(this.x, this.y, this.w, this.h);
  ctx.drawImage(
    //ctx.drawImage(image, sx(start position), sy, sWidth(drawing length), sHeight, dx(canvas position), dy, dWidth(canvas length), dHeight);
    character, 100 * frameIndex, characterY, 100, 120, this.x, this.y , 60, 80
  );

  walking++;
  if (walking > fps) {
    frameIndex++;
    walking = 0;
  } 
  if (frameIndex >= 4) {
    frameIndex = 0;
  }
  }
}

var player = new Player(100, 170, 50, 80);

//bullet variables
let obstacles = [];
//image defult
var bulletimage = new Image();
bulletimage.src = "bullet.png";

//bullet
class Obstacle {
  constructor (image, sx, sy, sw, sh, x, y, w, h) {
    this.image = image;
    this.sx = sx;
    this.sy = sy;
    this.sw = sw;
    this.sh = sh;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.dx = -gamespeed;
  }

  Update () {
    this.x += this.dx;
    this.Draw();
    this.dx = -gamespeed;
  }

  Draw () {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.drawImage(this.image, this.sx, this.sy, this.sw, this.sh, this.x, this.y, this.w, this.h);
  }
}

//obstacle defult image
var objectX = 0;

//spawn obstacle
function SpawnObstacle() {
  let size = RandomIntInRange(30, 50);
  let type = RandomIntInRange(0,1);
  let obstacle = new Obstacle(bulletimage, objectX + 1,  0, 60, 30, canvas.width + size, canvas.height - (size + 25), size, size/2);

  if (type == 1) {
    obstacle.y -= player.originalHeight - 30;
  }
  obstacles.push(obstacle);
}
SpawnObstacle();

function RandomIntInRange(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

//score variables
let score;
let scoreText;
let highscore
let highscoreText;

//score
class Text {
  constructor (t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw() {
    ctx.fillStyle = this.c;
    ctx.font = this.s + "px Space Mono";
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
  }
}

//audio stop
var allAudios = document.querySelectorAll('audio');
function stopAllAudio(){
	allAudios.forEach(function(audio){
		audio.pause();
	});
}

//start
function Start () {
  requestAnimationFrame(Update);
  gamespeed = 3;
  gravity = 1;
  score = 0;
  highscore = 0;

  //score text
  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }
  scoreText = new Text("Score: " + score, 25, 25, "left", "#fff", "15");
  hightscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#fff", "15");

  //game music
  var bgmusic = document.getElementById("bgmusic");
  bgmusic.volume = 0.4;
  bgmusic.play();
  if (typeof bgmusic.loop == 'boolean')
  {
    bgmusic.loop = true;
  } else {
    bgmusic.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
  }

}

//obstacle variables
let initialSpawnTimer = 200;
let spwanTimer = initialSpawnTimer;

//update
function Update () {
  animation = requestAnimationFrame(Update);
  ctx.clearRect(0,0, canvas.width, canvas.height);
  timer++;
  background.draw();
  player.Animate();

  //spawn obstacles
  spwanTimer--;
  if(spwanTimer <= 0) {
    SpawnObstacle();
    spwanTimer = initialSpawnTimer - gamespeed * 8;

    if (spwanTimer < 60) {
      spwanTimer = 60;
    }
  }

  //spawn enemines
  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];

    if (o.x + o.width < 0) {
      obstacles.splice(i, 1);
    }

    if (
      player.x <= o.x + o.w &&
      player.x + player.w >= o.x &&
      player.y <= o.y + o.h &&
      player.y + player.h >= o.y
      ) {
        //music stop
        stopAllAudio();
        window.localStorage.setItem('highscore', highscore);
        score = 0;
        spwanTimer = initialSpawnTimer;
        gamespeed = 3;
        cancelAnimationFrame(animation);
    }

    o.Update();
  }

  //score
  score = timer;
  scoreText.t = "Score: " + score;
  scoreText.Draw();

  if (score > highscore) {
    highscore = score;
    hightscoreText.t = "Highscore: " + highscore;
  }

  hightscoreText.Draw();
  gamespeed += 0.001;
  bgspeed += 0.0002;

  if (score >= 5000) {
    ErrorSpidey();
  }

  if (score >= 9600) {
    location.href = "https://seunga906.github.io/SpideyUniverse.com/"
  }
}

function ErrorSpidey() {
  //change object
  objectX = 60;
  //change character
  characterY = 120;
  fps = 5;
  bgspeed = 2.5;
  //change background
  backgroundY = 750;

  //change text
  document.getElementById("title").innerHTML = "페2@$지 @#$%^&이 지연되&# 있!(&$다.";
  document.getElementById("explanation1").innerHTML = "Spi%$#Univ($@7^&$.com 서버가 일시@#$@!!로 사용(*##) 없거나 너무 많은 $%^&^&^% 몰리@# *&()#!@일 수 있&^니다.";
  document.getElementById("explanation2").innerHTML = "이용^%#@ 불편을 드려 *&^%히 죄*^%$$#@@니다.";
  document.getElementById("content1").innerHTML = "기^%%$#는 동$@# 게#$#@# 플레이 하시겠#@니까?";

  //change text color
  document.getElementById("title").style.color = "#fff";
  document.getElementById("explanation1").style.color = "#fff";
  document.getElementById("explanation2").style.color = "#fff";
  document.getElementById("content1").style.color = "#fff";

  //change background
  document.body.style.background = 'black';
}

//button
function play() {
  document.getElementById("gamescreen").style.visibility = "visible";
  document.getElementById("content3").style.visibility = "visible";
  document.getElementById("content2").style.display = "none";
  window.localStorage.setItem('highscore', 0);
  Start();
}

function clearHighscore() {
  window.localStorage.setItem('highscore', 0);
}