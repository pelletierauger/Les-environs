// When a p5.js sketch first runs, it evaluates all the code files
// that it contains. But you may want to store code for the specific
// purpose of live coding - code that you do not want the sketch to
// evaluate automatically.

// One method to do this is used below:

// You can nest code within an if statement that will always
// be false in order to create blocks that will not be evaluated
// when the sketch first runs. You are then free to 
// evaluate them whenever you want, with command-Enter.
// Below, we can evaluate a new draw() function to change
// the behaviour of the particles.

// An alternative method would be to simply comment out code blocks 
// that you want to prevent from being automatically evaluated.
// But the "always false" if statement method allows you to evaluate 
// your code blocks without changing anything in the code - and it
// also communicates the intent very clearly.

if (false) {

    draw = function() {
        clear();
        var notesToSend = 0;
        // The first thing we changed here is adding some extra
        // velocity to the particles, which depend on an oscillating
        // movement created with the Math.sin() function.
        // You can change the frequency variable for fun results.
        var frequency = frameCount * 0.1;
        var extraVelocity = Math.sin(frequency) * 0.01;
        // And changing velocityScalar is still fun, of course.
        var velocityScalar = 0.01;
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.x += (p.xVel * velocityScalar) + extraVelocity;
            p.y += (p.yVel * velocityScalar) + extraVelocity;
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
            notesToSend += note;
            // The second thing we changed here is creating two arrays of
            // notes, which both create a different chord.
            // The chord that is selected depends on the oscillation
            // that we created above.
            let notes = (Math.sin(frequency) > 0) ? random([2, 5, 10]) : random([0, 3, 7]);
            let size = 3 + (6 * note);
            ellipse(10 + p.x * 580, 10 + p.y * 580, size);
            if (note && notesToSend <  5) {
                var msgToSend = {
                    address: "/bouncy",
                    args: [{
                        type: "f",
                        value: notes
                    }]
                };
                socket.emit('msgToSCD', msgToSend);
            }
        }
    };

    // This block resets the particles array, fills it with more
    // particles, and animates them with a chaotic function.
    particles = [];
    let n = 50;
    for (let x = 0; x < n; x++) {
        for (let y = 0; y <  n; y++) {
            let p = {
                x: x / n,
                xVel: 1,
                y: y / n,
                yVel: 1
            };
            particles.push(p);
        }
    }
    draw = function() {
        clear();
        var notesToSend = 0;
        var frequency = frameCount * 0.1;
        var extraVelocity = Math.sin(frequency) * 0.01;
        var velocityScalar = 0.001;
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            // This is a chaotic function because its input is the previous
            // state of the function, resulting in chaotic feedback and
            // attractors.
            p.x += Math.cos(p.x * p.y * 20) * p.xVel * velocityScalar;
            p.y += Math.sin(p.x * 20) * p.yVel * velocityScalar;
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
            notesToSend += note;
            let notes = (Math.sin(frequency) > 0) ? random([2, 5, 10]) : random([0, 3, 7]);
            let size = 3 + (6 * note);
            ellipse(10 + p.x * 580, 10 + p.y * 580, size);
            if (note && notesToSend <  5) {
                var msgToSend = {
                    address: "/bouncy",
                    args: [{
                        type: "f",
                        value: notes
                    }]
                };
                socket.emit('msgToSCD', msgToSend);
            }
        }
    };

    // The bracket below is the end of the "always false" if statement.
}