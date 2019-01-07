// Some of the code below (the parts that are related to the 
// functionalities of the SuperCollider editor) is taken from the software
// shipped with Prynth, which are "programmable sound synthesizers powered 
// by single-board computers." Prynth is "part of the research of Ivan Franco 
// at the Input Devices and Music Interaction Laboratory 
// (IDMIL) / CIRMMT / McGill University, under the supervision of 
// Marcelo M. Wanderley and funded by the Fundação para a Ciência e Tecnologia (FCT)."
// https://prynth.github.io/
// https://github.com/prynth/
// https://ivanfranco.wordpress.com/
// http://www.idmil.org/
// http://www.cirmmt.org/
// http://www.mcgill.ca/
// http://idmil.org/people/marcelo_m._wanderley
// http://www.fct.pt/
// Prynth is distributed with a Creative Commons licence:
// Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
// https://creativecommons.org/licenses/by-nc-sa/4.0/
// The code below is distributed with the same licence.

// var socket;
let files;
let scdTabs = [];
let jsTabs = [];
let activeScd = null;
let activeJs = null;
let appControl, keysControl;
let superColliderEditor, javaScriptEditor;
let superColliderConsole, javaScriptConsole;
let currentLoadedFiles = {
    scd: null,
    js: null
};
window.onload = init;

let curtain, scdArea, scdConsoleArea, jsArea, jsConsoleArea, jsCmArea, cmArea;

function init() {
    var superColliderEditorContainer = document.getElementById("supercollider-editor");
    superColliderEditor = CodeMirror.fromTextArea(superColliderEditorContainer, {
        lineNumbers: false,
        mode: "sc",
        matchBrackets: true,
        autofocus: true,
        styleActiveLine: true,
        smartIndent: false,
        indentWithTabs: false,
        indentUnit: 4,
        lineWrapping: true,
        theme: "les-environs",
        autoCloseBrackets: true,
        scrollbarStyle: "null",
        styleSelectedText: true
    });

    var curWord = "";

    superColliderEditor.on("cursorActivity", function(editor) {

        var A1 = editor.getCursor().line;
        var A2 = editor.getCursor().ch;

        var B1 = editor.findWordAt({ line: A1, ch: A2 }).anchor.ch;
        var B2 = editor.findWordAt({ line: A1, ch: A2 }).head.ch;

        curWord = editor.getRange({ line: A1, ch: B1 }, { line: A1, ch: B2 });

        var openBracket = "(";
        var closeBracket = ")";
        var curLine = editor.getCursor().line;
        var lineNow = curLine;
        var curLineContent;
        var checkOpen = 1;
        var bracketCount = 0;

        curLineContent = String(editor.getLine(curLine));
        checkClose = curLineContent.localeCompare(closeBracket);
        if (checkClose === 0) {
            bracketCount += 1;
            while (lineNow > 0) {
                lineNow = lineNow - 1;
                curLineContent = String(editor.getLine(lineNow));
                checkOpen = curLineContent.localeCompare(openBracket);
                checkClose = curLineContent.localeCompare(closeBracket);
                if (checkOpen === 0) {
                    bracketCount -= 1;
                } else if (checkClose === 0) {
                    bracketCount += 1;
                }
                if (bracketCount === 0) break;
            }

            for (var i = lineNow; i < curLine; i++) {
                editor.addLineClass(i, 'background', 'CodeMirror-activeline-background');
            }
        } else {
            for (var i = 0; i < lineNow; i++) {
                editor.removeLineClass(i, 'background', 'CodeMirror-activeline-background');
            }
        }
    });

    superColliderEditor.on("scroll", function() {
        files.scd[activeScd].scrollHeight = superColliderEditor.getScrollInfo().top;
    });

    superColliderEditor.on("inputRead", function() {
        if (files.scd[activeScd]) {
            files.scd[activeScd].data = superColliderEditor.getValue();
        }
    });
    superColliderEditor.on("keyHandled", function() {
        if (files.scd[activeScd]) {
            files.scd[activeScd].data = superColliderEditor.getValue();
        }
    });
    superColliderEditor.on("clear", function() {
        if (files.scd[activeScd]) {
            files.scd[activeScd].data = superColliderEditor.getValue();
        }
    });

    superColliderEditor.setOption("extraKeys", {
        'Cmd-Enter': function() { runsel(); },
        'Cmd-.': function() { interpret('CmdPeriod.run;'); },
        'Cmd-Alt-/': "toggleComment",
        'Shift-Enter': function() { runLine(); },
        Tab: (cm) => cm.execCommand("indentMore"),
        "Shift-Tab": (cm) => cm.execCommand("indentLess"),
        'Cmd-Alt-0': (cm) => cm.execCommand("indentMore"),
        'Cmd-Alt-9': (cm) => cm.execCommand("indentLess")
    });

    function interpret(data) {
        socket.emit('interpretSuperCollider', data);
        // for (let i = 0; i < files.scd.length; i++) {
        //     if (files.scd[i].active) {
        //         files.scd[i].data = superColliderEditor.getValue();
        //     }
        // }
    }

    function runLine() {
        var curLine = superColliderEditor.getCursor().line;
        let line = String(superColliderEditor.getLine(curLine));
        socket.emit('interpretSuperCollider', line);
    }

    function runsel() {
        var selection = superColliderEditor.getSelection();
        let nonEmptySelection = selection.match(/.*?/g);
        if (selection !== '' && nonEmptySelection[0]) {
            interpret(selection);
        } else {
            var openBracket = "(";
            var closeBracket = ")";
            var curLine = superColliderEditor.getCursor().line;
            var lineNow = curLine;
            var lineRem = lineNow;
            var codeBracket = "";
            var curLineContent;
            var checkOpen = 1;
            var checkClose = 1;
            var countBrackets = 0;
            var countBracketsClose = 0;
            var bracketFound = 0;

            while (lineNow > 0) {
                lineNow = lineNow - 1;
                curLineContent = String(superColliderEditor.getLine(lineNow));

                checkClose = curLineContent.localeCompare(closeBracket);
                if (checkClose === 0) {
                    countBracketsClose += 1;
                }

                checkOpen = curLineContent.localeCompare(openBracket);
                if (checkOpen === 0) {
                    bracketFound = 1;
                    if (countBracketsClose === 0) {
                        countBrackets += 1;
                        lineRem = lineNow + 1;
                    } else {
                        countBracketsClose -= 1;
                    }
                }
            }

            lineNow = lineRem;
            if (bracketFound !== 0 && countBrackets > 0) {
                while (countBrackets !== 0) {
                    checkClose = String(superColliderEditor.getLine(lineNow)).localeCompare(closeBracket)
                    if (checkClose === 0 && lineNow >= curLine) {
                        countBrackets -= 1;
                    }
                    checkOpen = String(superColliderEditor.getLine(lineNow)).localeCompare(openBracket)
                    if (checkOpen === 0 && lineNow >= curLine) {
                        countBrackets += 1;
                    }
                    if (countBrackets === 0) break;

                    codeBracket += `\n` + String(superColliderEditor.getLine(lineNow));
                    lineNow += 1;
                }
                interpret(codeBracket);
            } else {
                interpret(superColliderEditor.getLine(superColliderEditor.getCursor().line));
            }
        }
    };

    javaScriptEditor = new EditorClass();
    window.P5 = P5;

    // socket = io.connect('http://localhost:8080');
    socket.on('pushFiles', function(data) {
        files = data;
        createTabs(files);
    });
    socket.emit('pullFiles', "");
    socket.on('pushMessage', function(data) {
        logJavaScriptConsole(data);
    });

    socket.on('toscdconsole', function(data) {
        logSuperColliderConsole(data);
    });

    superColliderConsole = document.getElementById("supercollider-console");
    javaScriptConsole = document.getElementById("javascript-console");

    appControl = window.document.getElementById("appcontrol");
    appControl.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {

            interpretAppControl(appcontrol.value);
        }
    });

    // window.setTimeout(function() {

    //     superColliderEditor.getInputField().blur();
    //     javaScriptEditor.cm.getInputField().blur();
    //     appControl.focus();
    // }, 10);

    keysActive = false;
    keysControl = document.getElementById("keys-active");
    keysControl.addEventListener("mouseenter", function(event) {
        keysActive = true;
        superColliderEditor.setOption("readOnly", keysActive);
        javaScriptEditor.cm.setOption("readOnly", keysActive);
        // console.log("Enter the zone!");
    }, false);
    keysControl.addEventListener("mouseleave", function(event) {
        keysActive = false;
        superColliderEditor.setOption("readOnly", keysActive);
        javaScriptEditor.cm.setOption("readOnly", keysActive);
        // console.log("Leave the zone!");
    }, false);

    curtain = document.getElementById("curtain");
    scdArea = document.querySelector('.supercollider-area>div');
    scdConsoleArea = document.querySelector('.supercollider-area>.console');
    jsArea = document.querySelector('.javascript-area>div');
    jsConsoleArea = document.querySelector('.javascript-area>.console');
    cmArea = document.querySelector('.CodeMirror');
    jsCmArea = document.querySelector('.javascript-area>.CodeMirror');
}

function interpretAppControl(value) {
    if (value === "curtain off") {
        curtain.setAttribute("style", "display:none;");
        return;
    }
    if (value === "curtain on") {
        curtain.setAttribute("style", "display:block;");
        return;
    }
    if (value === "only scd") {
        scdConsoleArea.setAttribute("style", "display:block;");
        jsArea.setAttribute("style", "display:none;");
        jsConsoleArea.setAttribute("style", "display:none;");
        cmArea.setAttribute("style", "height:685px;");
        return;
    }
    if (value === "only js") {
        jsConsoleArea.setAttribute("style", "display:block;");
        scdArea.setAttribute("style", "display:none;");
        scdConsoleArea.setAttribute("style", "display:none;");
        jsCmArea.setAttribute("style", "height:685px;");
        return;
    }
    if (value === "both") {
        cmArea.setAttribute("style", "height:315px;");
        scdArea.setAttribute("style", "display:block;");
        jsArea.setAttribute("style", "display:block;");
        scdConsoleArea.setAttribute("style", "display:block;");
        jsConsoleArea.setAttribute("style", "display:block;");
        return;
    }
    if (value === "ls") {
        let allFiles = "";
        for (let i = 0; i < files.scd.length; i++) {
            let comma = ", ";
            allFiles += files.scd[i].name + comma;
        }
        for (let i = 0; i < files.js.length; i++) {
            let comma = (i < files.js.length - 1) ? ", " : "";
            allFiles += files.js[i].name + comma;
        }
        logJavaScriptConsole(allFiles);
        return;
    }
    if (value === "cc") {
        while (javaScriptConsole.firstChild) {
            javaScriptConsole.removeChild(javaScriptConsole.firstChild);
        }
        while (superColliderConsole.firstChild) {
            superColliderConsole.removeChild(superColliderConsole.firstChild);
        }
        return;
    }
    var loadTest = /(^load\s|^l\s)([\s\S]*)/;
    var loadMatch = loadTest.exec(value);
    if (loadMatch) {
        console.log("match : " + loadMatch[2]); // abc
        let matchedFile = false;
        for (let i = 0; i < files.scd.length; i++) {
            if (files.scd[i].name == loadMatch[2]) {
                superColliderEditor.setValue(files.scd[i].data);
                currentLoadedFiles.scd = files.scd[i].name;
                for (let j = 0; j < files.scd.length; j++) {
                    files.scd[j].active = false;
                }
                files.scd[i].active = true;
                activeScd = i;
                matchedFile = true;
            }
        }
        if (!matchedFile) {
            for (let i = 0; i < files.js.length; i++) {
                if (files.js[i].name == loadMatch[2]) {
                    javaScriptEditor.cm.setValue(files.js[i].data);
                    currentLoadedFiles.js = files.js[i].name;
                    for (let j = 0; j < files.js.length; j++) {
                        files.js[j].active = false;
                    }
                    files.js[i].active = true;
                    activeJs = i;
                    matchedFile = true;
                }
            }
        }
        if (matchedFile) {
            return;
        }
    }
    var saveTest = /(^save\s|^s\s)([\s\S]*)/;
    var saveMatch = saveTest.exec(value);
    if (saveMatch) {
        if (saveMatch[2] !== currentLoadedFiles.js && saveMatch[2] !== currentLoadedFiles.scd) {
            logJavaScriptConsole("Error: trying to save the wrong file.");
            return;
        }
        // console.log("match : " + saveMatch[2]); // abc
        let matchedFile = false;
        for (let i = 0; i < files.scd.length; i++) {
            if (files.scd[i].name == saveMatch[2]) {
                files.scd[i].data = superColliderEditor.getValue();
                socket.emit('saveFile', files.scd[i]);
                // superColliderEditor.setValue(files.scd[i].data);
                // currentLoadedFiles.scd = files.scd[i].name;
                matchedFile = true;
            }
        }
        if (!matchedFile) {
            for (let i = 0; i < files.js.length; i++) {
                if (files.js[i].name == saveMatch[2]) {
                    files.js[i].data = javaScriptEditor.cm.getValue();
                    socket.emit('saveFile', files.js[i]);
                    // javaScriptEditor.cm.setValue(files.js[i].data);
                    // currentLoadedFiles.js = files.js[i].name;
                    matchedFile = true;
                }
            }
        }
        if (matchedFile) {
            return;
        }
    }
    logJavaScriptConsole("Invalid command.");
}

function logJavaScriptConsole(msg) {
    var span = document.createElement('span')
    span.innerHTML = "<br>" + msg;
    javaScriptConsole.appendChild(span);
    javaScriptConsole.scrollTop = javaScriptConsole.scrollHeight;
}

function logSuperColliderConsole(msg) {
    if (msg.length > 0 && typeof msg === 'string' && msg !== null) {
        let r = msg.match(/^\s*$/);
        if (r === null) {
            var span = document.createElement('span')
            span.innerHTML = "<br>" + msg;
            superColliderConsole.appendChild(span);
            superColliderConsole.scrollTop = superColliderConsole.scrollHeight;
        }
    }
}

function createTabs(f) {
    for (let i = 0; i <  f.scd.length; i++) {
        let tab = new Tab(f.scd[i], "scd");
    }
    for (let i = 0; i <  f.js.length; i++) {
        let tab = new Tab(f.js[i], "js");
    }
}

let Tab = function(file, type) {
    this.name = file.name;
    this.active = file.active;
    this.type = type;
    this.div = document.createElement('div');
    this.div.className = "file";
    this.div.id = "inactive-tab";
    this.div.innerText = this.name;
    let that = this;
    if (this.type == "scd") {
        scdTabs.push(this);
        this.div.onclick = function() {
            for (let i = 0; i < files.scd.length; i++) {
                if (files.scd[i].name == that.name) {
                    superColliderEditor.setValue(files.scd[i].data);
                    superColliderEditor.scrollTo(0, files.scd[i].scrollHeight);
                    currentLoadedFiles.scd = files.scd[i].name;
                    for (let j = 0; j < files.scd.length; j++) {
                        files.scd[j].active = false;
                    }
                    files.scd[i].active = true;
                    activeScd = i;
                    for (let k = 0; k <  scdTabs.length; k++) {
                        if (scdTabs[k].name == that.name) {
                            scdTabs[k].div.id = "active-tab";
                        } else {
                            scdTabs[k].div.id = "inactive-tab";
                        }
                    }
                    matchedFile = true;
                }
            }
        };
    } else if (this.type == "js") {
        jsTabs.push(this);
        this.div.onclick = function() {
            for (let i = 0; i < files.js.length; i++) {
                if (files.js[i].name == that.name) {
                    javaScriptEditor.cm.setValue(files.js[i].data);
                    javaScriptEditor.cm.scrollTo(0, files.js[i].scrollHeight);
                    currentLoadedFiles.js = files.js[i].name;
                    for (let j = 0; j < files.js.length; j++) {
                        files.js[j].active = false;
                    }
                    files.js[i].active = true;
                    activeJs = i;
                    for (let k = 0; k <  jsTabs.length; k++) {
                        if (jsTabs[k].name == that.name) {
                            jsTabs[k].div.id = "active-tab";
                        } else {
                            jsTabs[k].div.id = "inactive-tab";
                        }
                    }
                    matchedFile = true;
                }
            }
        };
    }
    let innerDivName = (this.type == "scd") ? "scd-files" : "js-files";
    let innerDiv = document.getElementById(innerDivName);
    innerDiv.appendChild(this.div);
};