var helicopter, explosion;
var score;
var helicopterSound, crashSound;
var helicopterScore = 0;
var spikes = [];

//CONSTRUCTORS//
//Audio constructor
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.setAttribute("id","sounds");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}
//Game canvas constructor
var helicopterGameBox = {
	canvas : document.createElement("canvas"),
  	start : function() {//Lay out canvas dimensions and drawing properties
	    this.canvas.width = 500;
	    this.canvas.height = 300;
      this.canvas.setAttribute("id","helicopterGame");
	    this.context = this.canvas.getContext("2d");
	    this.currentFrame = 0;
      //Insert below instructions at child node 5
      document.getElementById('game').appendChild(this.canvas);
	    // document.body.insertBefore(this.canvas, document.body.childNodes[5]);
	    //Frame rate is set to 20 milliseconds, or 50 frames per second
	    this.interval = setInterval(updateGameArea, 20);
	    //Respond to spacebar
	    window.addEventListener('keydown', function (e) {
	      helicopterGameBox.key = e.keyCode;
	    })
	    window.addEventListener('keyup', function (e) {
	      helicopterGameBox.key = false;
	    })
	},
	clear : function() {
	    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	stop : function() {
    	clearInterval(this.interval);
    	helicopterScore = helicopterGameBox.currentFrame;
      document.getElementById('score').value = helicopterScore;
      document.getElementById('submitButton').style.display = 'block';
  	}
}

//Load game components and start the game
function startGame() {
    helicopterGameBox.start();
    helicopter = new component(40,30,"resources/img/helicopter1.png",50,120,"image");
    score = new component("20px", "Helvetica", "yellow", 400, 50, "text");
    helicopterSound = new sound("resources/sound/helicopterSound.wav");
    crashSound = new sound("resources/sound/crash.wav");
}


function intervals(n){
	if((helicopterGameBox.currentFrame / n) % 1 == 0){return true;}
	return false;
}

function component(width, height, color, x, y,type) {
	this.type = type;
	if(type == "image"){
		this.image = new Image()
		this.image.src = color;
	}
  this.width = width;
  this.height = height;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.gravity = 0.1;
  this.gravitySpeed = 0;
  this.update = function(){
        c = helicopterGameBox.context;
        if(type == "image"){
        	c.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        else if(this.type == "text"){
        	c.font = this.width + ' ' + this.height;
        	c.fillStyle = color;
        	c.fillText(this.text, this.x, this.y); 
        }
        else{
        	c.fillStyle = color;
        	c.fillRect(this.x, this.y, this.width, this.height);
        }
    }
  this.newPos = function() {
  		this.gravitySpeed += this.gravity;
  		this.y += this.speedY + this.gravitySpeed;
  		this.bottom();
    }
  this.bottom = function(){
  	if(this.y > (helicopterGameBox.canvas.height - this.height)){
  		this.y = helicopterGameBox.canvas.height - this.height;
  	}
  }
  this.collide = function(spike){
  	var crash = true;
  	if(((this.y + this.height) < spike.y)||((this.x + this.width) < spike.x)||((spike.y + spike.height) < this.y)||((spike.x + spike.width) < this.x)){
  		crash = false;
  	}
  	return crash;
  }
}

function fly(n){
	helicopter.gravity = n;
}
function updateGameArea() {
	var i, minHeight, maxHeight, height, pos, minSpace, maxSpace, space;
	for(i = 0; i < spikes.length; i++){
		if (helicopter.collide(spikes[i])){
			crashSound.play();
			helicopterGameBox.stop();
			return;
		}
	}
	helicopterGameBox.clear();
	helicopterGameBox.currentFrame++;
	if(intervals(2)){
		helicopter.image.src = "resources/img/helicopter2.png";
	}
	if(intervals(4)){
		helicopter.image.src = "resources/img/helicopter3.png";
	}
	if(intervals(6)){
		helicopter.image.src = "resources/img/helicopter1.png"
	}
	if(intervals(2)){
		minHeight = 10;
		maxHeight = 30;
		height = Math.floor(Math.random()*(maxHeight-minHeight)+minHeight);
		minSpace = 220;
		maxSpace = 250;
		space = Math.floor(Math.random()*(maxSpace-minSpace)+minSpace);
		spikes.push(new component(10, height, "black", helicopterGameBox.canvas.width, 0));
    	spikes.push(new component(10, space, "black", helicopterGameBox.canvas.width, space));
	}
	if(intervals(50)){
		minHeight = 30;
		maxHeight = 100;
		minSpace = 50;
		maxSpace = 200;
		height = Math.floor(Math.random()*(maxHeight-minHeight)+minHeight);
		pos = Math.floor(Math.random()*(maxSpace-minSpace)+minSpace);
		spikes.push(new component(10,height,"black",helicopterGameBox.canvas.width,pos));
	}
	for(i = 0; i < spikes.length; i++){
		spikes[i].x -= 5;
		spikes[i].update();
	}
    if (helicopterGameBox.key && helicopterGameBox.key == 16){
    	helicopterSound.play();
    	fly(-0.2);
    }
    else{
    	fly(0.1);
    	helicopterSound.stop();
    }
    score.text = helicopterGameBox.currentFrame;
    score.update();
    helicopter.newPos();
    helicopter.update();
}
