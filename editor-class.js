// This code is largely taken from Hydra, a live coding software written by Olivia Jack.
// Hydra is free software licensed under the GNU Affero General Public License v3.0.
// https://github.com/ojack/hydra
// The license can be found here: https://github.com/ojack/hydra/blob/master/LICENSE
// The code below is adapted from this specific file in Hydra: 
// https://github.com/ojack/hydra/blob/master/hydra-server/app/src/editor.js

var isShowing = true;

var EditorClass = function() {
    var self = this;

    // var javaScriptEditorContainer = document.getElementById("javascript-editor");
    // javaScriptEditor = CodeMirror.fromTextArea(javaScriptEditorContainer, {
    //     lineNumbers: false,
    //     mode: "javascript",
    //     matchBrackets: true,
    //     autofocus: true,
    //     styleActiveLine: true,
    //     smartIndent: false,
    //     indentWithTabs: false,
    //     lineWrapping: true,
    //     theme: "les-environs",
    //     autoCloseBrackets: true,
    //     scrollbarStyle: "null",
    //     styleSelectedText: true,
    //     extraKeys: {
    //         Tab: (cm) => cm.execCommand("indentMore"),
    //         "Shift-Tab": (cm) => cm.execCommand("indentLess"),
    //     },
    // });

    CodeMirror.defineMode("jsglsl", function(config) {
        return CodeMirror.multiplexingMode(
            CodeMirror.getMode(config, "javascript"), {
                open: "// beginGLSL",
                close: "// endGLSL",
                mode: CodeMirror.getMode(config, "x-shader/x-fragment"),
                delimStyle: "delimit"
            }
            // .. more multiplexed styles can follow here
        );
    });

    this.cm = CodeMirror.fromTextArea(document.getElementById("javascript-editor"), {
        // theme: 'tomorrow-night-eighties',
        theme: 'les-environs',
        value: 'hello',
        mode: { name: 'jsglsl', globalVars: true },
        matchBrackets: true,
        autofocus: true,
        smartIndent: true,
        indentWithTabs: false,
        indentUnit: 4,
        lineWrapping: true,
        autoCloseBrackets: true,
        scrollbarStyle: "null",
        styleSelectedText: true,
        hintOptions: { globalScope: {} },
        extraKeys: {
            'Shift-Ctrl-Enter': function(instance) {
                self.evalAll((code, error) => {
                    console.log('evaluated', code, error)
                    if (!error) {
                        self.saveSketch(code)
                    }
                })
            },

            'Shift-Ctrl-H': function(instance) {
                var l = document.getElementsByClassName('CodeMirror-scroll')[0]
                if (isShowing) {
                    l.style.opacity = 0
                    self.logElement.style.opacity = 0
                    isShowing = false
                } else {
                    l.style.opacity = 1
                    self.logElement.style.opacity = 1
                    isShowing = true
                }
            },
            'Shift-Enter': function(instance) {
                var c = instance.getCursor()
                var s = instance.getLine(c.line)
                self.eval(s)
            },
            'Shift-Ctrl-S': function(instance) {
                screencap()
            },
            'Cmd-Enter': (instance) => {
                var text = self.selectCurrentBlock(instance)
                // console.log('text', text);
                self.eval(text.text);
            },
            Tab: (cm) => cm.execCommand("indentMore"),
            "Shift-Tab": (cm) => cm.execCommand("indentLess"),
            'Cmd-Alt-0': (cm) => cm.execCommand("indentMore"),
            'Cmd-Alt-9': (cm) => cm.execCommand("indentLess"),
            // 'Cmd-Alt-/': "toggleComment"
            'Cmd-Alt-/': (cm) => cm.toggleComment({ indent: true })
        }
    })

    this.cm.markText({ line: 0, ch: 0 }, { line: 6, ch: 42 }, { className: 'styled-background' })
    this.cm.refresh()
    // this.logElement = document.createElement('div');
    this.logElement = document.getElementById('javascript-console');
    // this.logElement.className = "console cm-s-tomorrow-night-eighties"
    // document.body.appendChild(this.logElement)
    // this.log("hi");

    this.cm.on("scroll", function() {
        // console.log(javaScriptEditor.cm.getScrollInfo().top);
        files.js[activeJs].scrollHeight = javaScriptEditor.cm.getScrollInfo().top;
    });

    this.cm.on("inputRead", function() {
        if (files.js[activeJs]) {
            files.js[activeJs].data = javaScriptEditor.cm.getValue();
            checkIfJsSaved();
        }
    });
    this.cm.on("keyHandled", function() {
        if (files.js[activeJs]) {
            files.js[activeJs].data = javaScriptEditor.cm.getValue();
            checkIfJsSaved();
        }
    });
    this.cm.on("clear", function() {
        if (files.js[activeJs]) {
            files.js[activeJs].data = javaScriptEditor.cm.getValue();
            checkIfJsSaved();
        }
    });



    // TO DO: add show code param
    let searchParams = new URLSearchParams(window.location.search)
    let showCode = searchParams.get('show-code')

    if (showCode == "false") {
        console.log("not showing code")
        var l = document.getElementsByClassName('CodeMirror-scroll')[0]
        l.style.display = 'none'
        self.logElement.style.display = 'none'
        isShowing = false
    }
    //}
}

EditorClass.prototype.saveSketch = function(code) {
    console.log('no function for save sketch has been implemented')
}

// EditorClass.prototype.saveExample = function(code) {
//   console.log('no function for save example has been implemented')
// }

EditorClass.prototype.evalAll = function(callback) {
    this.eval(this.cm.getValue(), function(code, error) {
        if (callback) callback(code, error)
    })
}

EditorClass.prototype.eval = function(arg, callback) {
    var self = this
    var jsString = arg
    var isError = false
    try {
        eval(jsString);
        // for (let i = 0; i < files.js.length; i++) {
        //     if (files.js[i].active) {
        //         files.js[i].data = this.cm.getValue();
        //     }
        // }
        // self.log(jsString);
        logJavaScriptConsole(jsString);
        jsLog.unshift(jsString);
        if (autoRedraw && !looping) {
            drawCount--;
            redraw();
        }
    } catch (e) {
        isError = true
        //  console.log("logging", e.message)
        // self.log(e.message, "log-error")
        logJavaScriptConsole(e.message, "log-error");
        //console.log('ERROR', JSON.stringify(e))
    }
    //  console.log('callback is', callback)
    if (callback) callback(jsString, isError)

}

EditorClass.prototype.log = function(msg, className = "") {
    // // this.logElement.innerHTML = ` >> <span class=${className}> ${msg} </span> `
    // if (this.logElement.value) {
    //     this.logElement.value += "\n" + msg;
    // } else {
    //     this.logElement.value = msg;
    // }
    // // this.logElement.scrollTop = 0;
    // this.logElement.scrollTop = this.logElement.scrollHeight;
    logJavaScriptConsole(msg);
}

EditorClass.prototype.selectCurrentBlock = function(editor) { // thanks to graham wakefield + gibber
    var pos = editor.getCursor()
    var startline = pos.line
    var endline = pos.line
    while (startline > 0 && editor.getLine(startline) !== '') {
        startline--
    }
    while (endline < editor.lineCount() && editor.getLine(endline) !== '') {
        endline++
    }
    var pos1 = {
        line: startline,
        ch: 0
    }
    var pos2 = {
        line: endline,
        ch: 0
    }
    var str = editor.getRange(pos1, pos2)
    return {
        start: pos1,
        end: pos2,
        text: str
    }
}

//----------------------------------------------------------------------------------------------//

class P5 extends p5 {
    constructor({
        width = window.innerWidth,
        height = window.innerHeight,
        mode = 'P2D'
    } = {}) {
        //console.log('createing canvas', width, height, window.innerWidth, window.innerHeight)
        super((p) => {
            p.setup = () => { p.createCanvas(width, height, p[mode]) }
            //    p.setup = () => { p.createCanvas() }
            p.draw = () => {}
        }, 'hydra-ui')
        this.width = width
        this.height = height
        this.mode = mode
        this.canvas.style.position = "absolute"
        this.canvas.style.top = "0px"
        this.canvas.style.left = "0px"
        this.canvas.style.zIndex = -1
        // console.log('p5', this)
        //  return this.p5
    }

    show() {
        this.canvas.style.zIndex = -1
    }

    hide() {
        this.canvas.style.zIndex = -10
    }

    // p5 clear function not covering canvas
    clear() {
        this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}

// function init() {

//     var editor = new EditorClass();
// }

// window.onload = init;