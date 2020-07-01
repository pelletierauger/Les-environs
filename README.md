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

When you first open the app, both editors and both consoles are empty. To start live coding, you can click on any of the tabs that are next to the terminal. The code of the selected file (in darker grey) will be shown in its editor—either SuperCollider or JavaScript.

Once you change the contents of any of the tabs, it will display a small black dot to the left of its filename, to indicate that it contains unsaved changes. In the image above, you can see that the `sketch.js` tab contains unsaved changes. To save your changes, you’ll need to use the terminal (see the section on the terminal).

There is also an invisible area at the bottom right of the screen that will disable keyboard input to the editors when the mouse cursor is within it. This is useful for very frequent tasks that might require keyboard input—for example, while the mouse is in this corner, pressing the spacebar will toggle the looping of the p5.js sketch.


## Evaluating code

There are two different ways of evaluating code in both editors: you can evaluate a single line, or a block of code. To evaluate a single line, put the text cursor anywhere on the line, and press “Shift Enter”. To evaluate a block of code, put the cursor anywhere within the block, and press “Command Enter”.

Importantly, a block of code is not defined in the same way in the SuperCollider editor and the JavaScript editor. This relates to how both languages are constructed. A block of SuperCollider code must be wrapped between an opening `(` and a closing `)`.

```supercollider
// This is a block of SuperCollider code.
(
{
    var env = EnvGen.kr(Env.new([0, 1, 0], [0.01, 2]), doneAction: 2);
    var sig = SinOsc.ar(440!2);
    sig * env * 0.1;
}.play;
)

// This is another block of SuperCollider code. 
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

In the JavaScript editor, a block is simply a set of adjacent lines that are not separated by any empty lines.

```javascript
// This is a block of JavaScript code.
draw = function() {
    for (let i = 0; i < 100; i++) {
        let x = cos(i) * i;
        let y = sin(i) * i;
        ellipse(x, y, 1);
    }
};

// This is another block of JavaScript code. 
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

The terminal has a set of commands that you can use to perform various tasks while you work on your projects. Type any of the following commands and then press “Enter” to input it.

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
* `(<any JavaScript code>` You can also evaluate JavaScript code in the terminal, by preceding it with an opening `(`.
* `'<any JavaScript code>` You can also evaluate JavaScript code and then send its return value to the JavaScript console. This is useful for finding out what is the current value of a global variable. For example, `'frameCount` will tell you the current value of the global p5.js variable `frameCount`.
* `loop` Toggles the looping of the p5.js sketch.

The terminal also keeps a history of the commands that you input. To navigate this history, press the “up arrow” and the “down arrow”. Once you find a command that you want to input again, press “Enter”. It will input the command and send you back at the most recent location in the input history.

## Support for GLSL

The way GLSL is currently supported is done through the JavaScript editor. There are two special strings that you can put in your JavaScript code to create regions where GLSL is properly highlighted. Here’s a example where GLSL code is wrapped in a template string. The commented lines, `//begin GLSL` and `//end GLSL` make the editor properly highlight the GLSL syntax in the enclosed region. They have no effect on the code itself.

```glsl
vertexShaderCode = `
    // beginGLSL
    attribute vec2 coordinates;
    varying vec2 myposition;
    varying vec2 center;
    void main(void) {
        gl_Position = vec4(coordinates, 0.0, 1.0);
        center = vec2(gl_Position.x, gl_Position.y);
        myposition = vec2(gl_Position.x, gl_Position.y);
    }
    // endGLSL
`;
updateShaderProgram();
```

You can see that adding a function call at the end of this block of code can allow you to live code GLSL shaders. This block sets the content of the vertex shader, and then calls a function that would update the shader program and also probably display whatever geometry uses this program.