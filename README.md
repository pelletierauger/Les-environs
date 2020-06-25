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

Les environs’s interface is very minimalistic but it has a lot of features that can make live coding more enjoyable.

![Interface elements and description](https://dl.dropboxusercontent.com/s/5bgjbepxw0rp5ah/interface.png)

