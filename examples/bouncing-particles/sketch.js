let looping = true;
let keysActive = true;
let socket;

let particles = [];

function setup() {
    // socket.io allows the communication between the Web client
    // and the Node.js server.
    socket = io.connect('http://localhost:8080');
    pixelDensity(1);
    frameRate(30);
    createCanvas(600, 600);
    fill(0);
    noStroke();
    // Right below, we create 100 instances of a simple bouncing particle object
    // and push them to the particles array. 
    // Each particle has x and y properties for their positions, 
    // and xVel and yVel properties for their velocities.
    // Note that we use the native Math.random() JavaScript function
    // to get a floating point number between 0 and 1, and we also use
    // the p5.js random() function with an array as an argument. 
    // When this function gets an array as an argument, 
    // it returns a random element from the array.
    for (let i = 0; i < 100; i++) {
        let p = {
            x: Math.random(),
            xVel: Math.random() * random([-1, 1]),
            y: Math.random(),
            yVel: Math.random() * random([-1, 1])
        };
        particles.push(p);
    }
}

draw = function() {
    clear();
    // We set a number that scales the velocity of the particles.
    // Changing this scalar while the sketch is running is a lot of fun.
    // The bigger this number is, the faster the particles will go.
    var velocityScalar = 0.01;
    // The notesToSend variable will be used to count the amount
    // of particles that bounce within a single draw() loop.
    // We will use this number to limit the amount of
    // notes that can be sent in a single loop.
    var notesToSend = 0;
    // We loop through the particles array
    // in order to the draw the particles.
    for (let i = 0; i < particles.length; i++) {
        // We store the current particle in a variable with a short
        // name just to help with the clarity of the code.
        let p = particles[i];
        // We add the current velocities to the current positions,
        // but we first multiply the velocities by the scalar.
        p.x += p.xVel * velocityScalar;
        p.y += p.yVel * velocityScalar;
        // We test if a particle has reached a wall of
        // the rectangle. If it does, it will reverse the velocities
        // and send a musical note to SuperCollider.
        // If a note must be sent, the note variable will be set to 1;
        let note = 0;
        p.x = constrain(p.x, 0, 1);
        p.y = constrain(p.y, 0, 1);
        if (p.x == 0 || p.x == 1) {
            p.xVel *= -1;
            note = 1;
        }
        if (p.y == 0 || p.y == 1) {
            p.yVel *= -1;
            note = 1;
        }
        // We increment our count of notes.
        notesToSend += note;
        // The size of a particle is bigger if it is currently bouncing.
        let size = 3 + (note * 6);
        ellipse(10 + p.x * 580, 10 + p.y * 580, size);
        // We test if a note must be sent and if we have not reached
        // our maximum amount of notes for a single draw() loop.
        if (note == 1 && notesToSend < 5) {
            // The object below will be sent to Supercollider.
            // It has an address which SuperCollider will
            // recognize and the value property within args will contain
            // a random element from the array [0, 2, 4, 7, 11],
            // thanks to the p5.js random() function.
            var msgToSend = {
                address: "/bouncy",
                args: [{
                    type: "f",
                    value: random([0, 2, 4, 7, 11])
                }]
            };
            // We send the object via Socket.io to the Node.js server,
            // which will then relay it to SuperCollider via UDP.
            socket.emit('msgToSCD', msgToSend);
        }
    }
}

function keyPressed() {
    if (keysActive) {
        if (keyCode === 32) {
            if (looping) {
                noLoop();
                looping = false;
            } else {
                loop();
                looping = true;
            }
        }
        if (key == 'r' || key == 'R') {
            window.location.reload();
        }
    }
}