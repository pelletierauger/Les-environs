// We first need to boot the server.
s.boot;

// We can then evaluate the block below to start receiving messages
// from the bouncing particles.
// This block can be changed and re-evaluated at will.
(
OSCdef.new(
    \fromnode,
    // The following function will be executed every time 
    // a message is received at the address 'bouncy'.
    {
        arg msg, time, addr, port;
        // The message we receive is contained in the msg property.
        var note = msg[1];
        // We create a simple Synth with the play method.
        // The Synth node will be removed when the EnvGen reaches the end
        // of its envelope (because of doneAction: 2). This is a simple
        // frequency modulation (FM) synth with 3 operators (op1, op2, op3).
        {
            var env, op1, op2, op3, freq;
            freq = 220 * note.midiratio;
            env = EnvGen.kr(Env.new([0, 1, 0], [0.001, 2]), doneAction: 2);
            op3 = SinOsc.ar(freq);
            op2 = SinOsc.ar(freq * [1.001, 1], op3 * 2);
            op1 = SinOsc.ar(freq * [1, 1.001], op2 * [1, 2, 4].choose);
            op1 * env * 0.05;
        }.play;
    },
    // This is the address at which this instance of OSCdef listens.
    'bouncy'
);
)

// You can evalute the block below to try a different synth.
// It also modulates the incoming notes to a different key.
(
OSCdef.new(
    \fromnode,
    {
        arg msg, time, addr, port;
        var note = msg[1];
        {
            var env1, env2, op1, op2, op3, freq, lfo;
            freq = 220 * 4.midiratio * note.midiratio;
            env1 = EnvGen.kr(Env.new([0, 1, 0], [0.001, 2]), doneAction: 2);
            env2 = EnvGen.kr(Env.new([0, 1, 0], [0.001, 0.05]));
            lfo = SinOsc.kr([1, 3, 6].choose);
            op3 = SinOsc.ar(freq * [0.25, 0.5, 1, 2, 4].choose);
            op2 = SinOsc.ar(freq * [1.001, 1] * [0.5, 1, 2, 4].choose, op3 * 128) * env2;
            op1 = SinOsc.ar(freq * [1, 1.001], op2);
            op1 * env1 * 0.05 * lfo;
        }.play;
    },
    'bouncy'
);
)