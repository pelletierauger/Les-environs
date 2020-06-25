# Les-environs

Les environs (French for *The Surroundings*) is a live coding environment for p5.js, GLSL, and SuperCollider.

## Installation

This is a Node.js app, so you’ll need Node.js already installed, as well as SuperCollider. Once you have those, follow these steps:

* Download the repository or clone it by typing `git clone https://github.com/pelletierauger/Les-environs.git` into the terminal.
* In the terminal, `cd` to where the repository is located on your hard drive.
* Run `npm install` to install the dependencies.

## Starting a sketch

Les environs works by opening a p5.js sketch and making it editable via live coding. A sketch needs to be prepared in some specific ways to work in Les environs. You can find an example of a working sketch in the `examples` folder. The example is a good template, and you can make copies of it when you start new projects.

To set up the directories where Les environs will look for sketches, open the file `config.js` and put the desired folders into the `pathsToSketches` array. Les environs will look for sketches in that list of folders, in order, and will stop looking once it finds a match.

To open a sketch, `cd` into the app repository and type `node server <sketchname>` For example, because the root folder of the app (`./`) is included in the `pathsToSketches` array by default, you can type `node server examples/bouncing-particles` to load the bouncing particles example that ships with the app.

Once you’ve done that, the app now runs on a local server at port 8080. You can access it in any browser by visiting this URL: `http://localhost:8080/`.

Visit this URL and you’ll see the p5.js sketch running in the app.

## The interface

![Interface elements and description](https://dl.dropboxusercontent.com/s/376jrfqcgt089x1/interface-2.png)

When you first open the app, both editors and both consoles will be empty. To start live coding, you can click on any of the tabs that are next to the terminal. The code of the selected file (in darker grey) will be shown in its editor—either SuperCollider or JavaScript.


## Evaluating code

There are two different ways of evaluating code in both editors: you can evaluate a single line, or a block of code. To evalute of single line, simply put the text cursor anywhere on the line, and press “Shift Enter”. To evalute a block of code, put the cursor anywhere within the block, and press “Command Enter”.

Importantly, a block of code is not defined in the same way in the SuperCollider editor and the JavaScript editor. This relates to how both languages are constructed. A block of SuperCollider code must be wrapped between an opening `(` and a closing `)`.

```supercollider
// This is a SuperCollider block of code.
(
{
    var env = EnvGen.kr(Env.new([0, 1, 0], [0.01, 2]), doneAction: 2);
    var sig = SinOsc.ar(440!2);
    sig * env * 0.1;
}.play;
)

// This is another SuperCollider block of code. 
// It can contain empty lines and will still evaluate correctly.
(
{
    var env = EnvGen.kr(Env.new([0, 1, 0], [0.01, 2]), doneAction: 2);

    var op2 = SinOsc.ar(440 * 2);

    var op1 = SinOsc.ar(440!2, op2);

    op1 * env * 0.1;

}.play;
)
```

In the JavaScript editor, a block is simply a set of adjacent lines that are not separated by any blank lines.

```javascript
// This is a JavaScript block of code.
draw = function() {
    for (let i = 0; i < 100; i++) {
        let x = cos(i) * i;
        let y = sin(i) * i;
        ellipse(x, y, 1);
    }
};

// This is another JavaScript block of code. 
// This one would result in an error because of the empty line.
draw = function() {
    for (let x = 0; x < 100; x++) {
        for (let y = 0; y < 100; y++) {
            ellipse(x, y, 1);
        }
    }

};
```

The commented lines are not considered empty, so they can’t be used to separate blocks of code.

## The terminal

The terminal is specific to this app—it has its own set of commands that you can use to perform various tasks while you work on your projects.

The commands:

* `save <filename>` Saves a file to disk.
* `saveall` Saves all the files to disk.
* `revert <filename>` Reverts the changes in one file. This resets the contents of a tab to the contents of the corresponding file that is currently saved to disk.
* `new <filename>` Creates a new tab containing an empty document. The file extension (either .scd or .js) must be given. This new file will not be saved to disk until you use the `save` command on it.
* `hide` or `h` Toggles the visibility of both code editors.
* `cc` Clears the contents of both consoles.
* `curtain` Toggles the visibility of a “curtain” that hides the p5.js sketch below the editors. This is useful for “distraction free” editing—when you don’t need to see the sketch for a while.
* `js` Puts you in “JavaScript mode”, hiding the SuperCollider editor and the SuperCollider console, and giving the JavaScript editor more vertical space.
*  `scd` Puts you in “SuperCollider mode”, hiding the JavaScript editor and the JavaScript console, and giving the SuperCollider editor more vertical space.
* `both` Displays both editors and gives them their original dimensions.
* `scd<>js` Toggles between the “JavaScript mode” and the “SuperCollider mode”.
* `width <any number>` Gives both editors the width given as the argument.
* `( <any JavaScript code>` You can also evaluate JavaScript code in the terminal, by preceding it with an opening `(` and a space ` `.
* `' <any JavaScript code>` You can also evalute JavaScript code and then send its return value to the JavaScript console. This is useful for finding out what is the current value of a global variable. For example, `' frameCount` will tell you the current value of the global p5.js variable `frameCount`.