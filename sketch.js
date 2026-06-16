let hitX;
let hitY;
let c;
let hitCols = [];
let index;

// video 
let cam; 
let vid; 

// tonejs 
let synthPoly;
let poly;
let osc; 

let audioStarted = false;
let notes = [];
let reverb;

let cooldown = []; // this makes the notes stop and not play again until cooldown is over 

let clouds = []; // are they clouds? pick up and scan 

let wasSky = []; // storing an array of whether a pixel was blue 

function setup() {
  createCanvas(540, 702);
  frameRate(30);

  let constraints = {
    video: {
      facingMode: "environment" // Forces the back camera
    },
    audio: false // Optional: turns off mic if you don't need it
  };

  // 2. Pass the constraints object into your capture function
  cam = createCapture(constraints);
  cam.elt.setAttribute('playsinline', '');
  cam.hide();
  cam.size(windowWidth, windowHeight);
  
  // tonejs 
  poly = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "square5",
      partials: [1.273, 0, 0.424, 0, 0.255]
    },
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
  }).toDestination();

  // Connect to Reverb
  reverb = new Tone.Reverb(2).toDestination();
  poly.connect(reverb);

  notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99];

//   notes = {
//   "C4": 261.63,
//   "D4": 293.66,
//   "E4": 329.63,
//   "F4": 349.23,
//   "G4": 392.00,
//   "A4": 440.00,
//   "B4": 493.88,
//   "C5": 523.25,
//   "D5": 587.33,
//   "E5": 659.25,
//   "F5": 698.46,
//   "G5": 783.99
// }

for (let i = 0; i < 12; i++) {
    cooldown[i] = 0;
    wasSky[i] = false;
  }
}

function draw() {
  background(220);
  let clouds = []

  // CHANGE HERE --- 
  image(cam, 0, 0, width, height); // load video 

  hitCols = []; // empty the array every frame 

  cam.loadPixels();
  let stepSize = 10;

  clouds = []
  for (let y = 0; y < height; y+= stepSize) {
    for (let x = 0; x < width; x+= stepSize) {
      let index = (x + y * cam.width) * 4;
      let r = cam.pixels[index];     // Red
      let g = cam.pixels[index + 1]; // Green
      let b = cam.pixels[index + 2]; // Blue
      let a = cam.pixels[index + 3]; // Alpha
      let brightness = (r + g + b) / 3
      let isCloud = brightness > 150;


      // this is crazy... 
      // if (isCloud) {
      //   clouds.push({ x: x, y: y });

      //   stroke(255);
      //   noFill();
      //   ellipse(x, y, 20,20)
      // }
    }
  }
  

  // let metronome 
  rect(10 * sin(frameCount * 0.15) + 50, 20,10);
  for (let i = 0; i < 12; i++) {

    if (cooldown[i] > 0) {
      cooldown[i]--;
    }

    let x = width / 12;
    let y = (height / 12) * i + height / 24;
    
    let sampleX = map (x,0,width,0,cam.width);
    let sampleY = map(y, 0, height, 0, cam.height);

    // color find 
    let c = cam.get(sampleX, sampleY);

    let isSky = c[0] > 0 && c[0] <= 100 && c[1] > 90 && c[1] <= 130 && c[2] > 160 && c[2] <=190;

    // let isBlue =
    //   c[0] < 120 && c[1] < 120 && c[2] >= 120;
    // let isCloud = !isSky;

    let brightness = (c[0] + c[1] + c[2]) / 3
    let isCloud = brightness > 120;
    
    hitCols.push(c);

    // draw a line of circles and fill with c 
    fill(c);
    noStroke();
    ellipse(x, y, 20, 20);

    if (isCloud && wasSky[i] && cooldown[i] === 0) {
      playSound(i);
      cooldown[i] = 30

      strokeWeight(5)
      noFill();
      stroke("red");
      ellipse(x,y, 30,30);
    }
    wasSky[i] = isCloud;
  }

  // page details 
  // fill(0);
  // noStroke();
  // text(Tone.context.state, 20,height-20) 
}

function mousePressed() {
  Tone.start();
  cam.play();
}

function playSound(num) {
  // let noteNames = Object.keys(notes);
  let noteToPlay = notes[num];
  poly.triggerAttackRelease(noteToPlay, "4n");

}