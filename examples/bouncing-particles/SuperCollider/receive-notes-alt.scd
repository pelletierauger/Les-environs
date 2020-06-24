(
~amountOfSynths = 0;
OSCdef.new(
    \fromnode,
    {
        arg msg, time, addr, port;
        var note = msg[1];
        if (~amountOfSynths < 100, {
            {
                var env1, env2, op1, op2, op3, freq, lfo;
                freq = 220 * 4.midiratio * note.midiratio;
                env1 = EnvGen.kr(Env.new([0, 1, 0], [0.001, 1]), doneAction: 2);
                env2 = EnvGen.kr(Env.new([0, 1, 0], [0.001, 0.05]));
                lfo = SinOsc.kr([1, 3, 6].choose);
                op3 = SinOsc.ar(freq * [0.25, 0.5, 1, 2, 4].choose);
                op2 = SinOsc.ar(freq * [1.001, 1] * [0.5, 1, 2, 4].choose, op3 * 128) * env2;
                op1 = SinOsc.ar(freq * [1, 1.001], op2);
                op1 * env1 * 0.05 * lfo;
            }.play;
            ~amountOfSynths = ~amountOfSynths + 1;
            TempoClock.default.sched(2, {
                ~amountOfSynths = ~amountOfSynths - 1;
                nil;
            });
        });
    },
    'bouncy'
);
)