var enemies = [];
var weeds;
var frameCount = 0;
var frameRate = 30; //Default: 30
var drawFrame;
var canvas;
var bd;
var mouseX, mouseY;
var toys = ["boots", "hat", "vehicle"];
var toyPadding;
var imgSize;
var score = 0;

window.onload = function() {
	$.getJSON("weeds.json", function(obj) {
		weeds = obj;
		console.log("Loaded weeds.json");
		weeds.keys = Object.keys(weeds);
		for (let i in weeds.keys) {
			$("#imageHolder").append("<img id=\"" + weeds.keys[i] + "\" src=\"" + weeds[weeds.keys[i]].source + "\">");
		}
		for (let i in toys) {
			$("#imageHolder").append("<img id=\"" + toys[i] + "\" src=\"assets/" + toys[i] + ".png\">");
		}
	}).fail(function(){
		console.log("Failed to load weeds.json");
	});
	
	var s = location.href.match(/score=(\d+)/);
	if (s) {
		$("#score").html("You washed away " + s[1] +" weeds!");
	}
};

class point {
    constructor(x_, y_) {
        this.x = x_;
        this.y = y_;
    }
}

class weed {
    constructor() {
        this.vars();
    }
    wash(user) {
		if (user) { //If the user washed it
			//Change Header
			$("#hArticle").attr("href", weeds[this.type].article);
			$("#hPicture").attr("src", weeds[this.type].picture).attr("alt", weeds[this.type].name);
			$("#hTitle").html(weeds[this.type].name).attr("class", "t");
			$("#hFact").html(weeds[this.type].facts[Math.floor(Math.random() * weeds[this.type].facts.length)]);
			$("#hScore").html(score);
			
			//Add new enemies
			if (Math.random() < 0.25) {
				enemies[enemies.length] = new weed(weeds.keys[Math.floor(Math.random() * weeds.keys.length)]);
			}
		}
		
		
		this.vars();
    }
	vars() {
		this.type = weeds.keys[Math.floor(Math.random() * weeds.keys.length)];
		this.x = 0;
		this.y = Math.floor(Math.random() * canvas.height);
		this.targetId = Math.floor(Math.random() * toys.length);
		this.target = toys[this.targetId];
	}
}

function beginPlay() {
    console.log("Game Started...");
    $("#playBanner").hide();
    
    canvas = document.getElementById("board");
    resetDimensions();
    window.addEventListener("resize", resetDimensions);
    window.addEventListener("orientationchange", resetDimensions);
    bd = canvas.getContext("2d");
	$("#board").mousedown(function(event) {
		mouseX = event.pageX;
		mouseY = event.pageY - $("header").outerHeight(true);
	});
	
    for (var i = 0; i < 3; i++) { //Add first three enemies
        enemies[i] = new weed();
    }
    
    drawFrame = setInterval(draw, 1000/frameRate); //Start Game at 30fps
}

function resetDimensions() {
    canvas.width = $("header").width();
    canvas.height = $(window).height() - $("header").outerHeight(true);
	toyPadding = canvas.height/(toys.length + 1);
	imgSize = (canvas.height + canvas.width) / 15;
}

function draw() {
    frameCount++;
	bd.clearRect(0, 0, canvas.width, canvas.height);
	
	for (let i in toys) {
		bd.drawImage(document.getElementById(toys[i]), canvas.width-imgSize, toyPadding * i + toyPadding -  (imgSize/2) , imgSize, imgSize); 
	}
	
	for(let i in enemies) {
		enemies[i].x += canvas.width/500;
		enemies[i].y += (toyPadding * enemies[i].targetId + toyPadding - enemies[i].y -  (imgSize/2) )/(canvas.width-enemies[i].x-imgSize)*(canvas.width/500); 
		
		var e = enemies[i];
		if (!(e.x < mouseX && e.x + imgSize > mouseX && e.y < mouseY && e.y + imgSize > mouseY)) {
			bd.drawImage(document.getElementById(e.type), e.x, e.y, imgSize, imgSize);
		} else {
			score++;
			enemies[i].wash(true);
		}
		
		if (toys[e.targetId] != e.target) {
			for (var v = i; v < enemies.length; v++) {
				enemies[v].wash(false);
			}
		}
		
		if(e.x > canvas.width - imgSize) {
			toys.splice(enemies[i].targetId, 1);
			enemies[i].wash(false);
			if (toys.length == 0) {
				endGame();
			}
		}
	}
	
	mouseX = -1;
	mouseY = -1;
}

function endGame() {
	console.log("Game Over");
	clearInterval(drawFrame);
	var url = location.href = location.href.replace(/score=(\d+)/, "score=" + score);
	if (url.indexOf("score") == -1) {
		location.href = location.href + "?score=" + score;
	} else {
		location.href = url;
	}
}