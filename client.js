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
let sketchFolder;
let files, savedFiles;
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
let displayMode = "both";
let hidden = false;
let curtainDisplay = false;

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
            checkIfScdSaved();
        }
    });
    superColliderEditor.on("keyHandled", function() {
        if (files.scd[activeScd]) {
            files.scd[activeScd].data = superColliderEditor.getValue();
            checkIfScdSaved()
        }
    });
    superColliderEditor.on("clear", function() {
        if (files.scd[activeScd]) {
            files.scd[activeScd].data = superColliderEditor.getValue();
            checkIfScdSaved();
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
        socket.emit('interpretSuperCollider', data, files.scd[activeScd].path);
    }

    function runLine() {
        var curLine = superColliderEditor.getCursor().line;
        let line = String(superColliderEditor.getLine(curLine));
        interpret(line);
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
        savedFiles = { scd: [], js: [] };
        for (let i = 0; i < data.scd.length; i++) {
            let d = data.scd[i];
            savedFiles.scd.push({
                name: d.name,
                path: d.path,
                active: d.active,
                scrollHeight: d.scrollHeight,
                data: d.data
            });
        }
        for (let i = 0; i < data.js.length; i++) {
            let d = data.js[i];
            savedFiles.js.push({
                name: d.name,
                path: d.path,
                active: d.active,
                scrollHeight: d.scrollHeight,
                data: d.data
            });
        }
        createTabs(files);
    });
    socket.emit('pullFiles', "");

    socket.on('pushSketchFolder', function(data) {
        sketchFolder = data;
    });
    socket.emit('pullSketchFolder', "");

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
    if (value === "hide") {
        if (!hidden) {
            scdArea.style.display = "none";
            scdConsoleArea.style.display = "none";
            jsArea.style.display = "none";
            jsConsoleArea.style.display = "none";
            hidden = true;
        } else {
            if (displayMode === "both") {
                scdArea.style.display = "block";
                scdConsoleArea.style.display = "block";
                jsArea.style.display = "block";
                jsConsoleArea.style.display = "block";
            } else if (displayMode == "scd") {
                scdArea.style.display = "block";
                scdConsoleArea.style.display = "block";
            } else if (displayMode == "js") {
                jsArea.style.display = "block";
                jsConsoleArea.style.display = "block";
            }
            hidden = false;
            return;
        }
    }
    if (value === "curtain") {
        if (curtainDisplay) {
            curtain.setAttribute("style", "display:none;");
            scdArea.style.padding = "";
            jsArea.style.padding = "";
            curtainDisplay = false;
        } else {
            curtain.setAttribute("style", "display:block;");
            scdArea.style.padding = "0em 1.5em";
            jsArea.style.padding = "0em 1.5em";
            curtainDisplay = true;
        }
        return;
    }
    if (value === "curtain off" || value === "curtain up") {
        curtain.setAttribute("style", "display:none;");
        curtainDisplay = false;
        return;
    }
    if (value === "curtain on" || value === "curtain down") {
        curtain.setAttribute("style", "display:block;");
        curtainDisplay = true;
        return;
    }
    if (value === "only scd" ||  value === "scd only" || value === "scd") {
        scdConsoleArea.setAttribute("style", "display:block;");
        scdArea.style.display = "block";
        jsArea.style.display = "none";
        jsConsoleArea.setAttribute("style", "display:none;");
        cmArea.style.height = "685px";
        displayMode = "scd";
        superColliderEditor.refresh();
        return;
    }
    if (value === "only js" ||  value === "js only" || value === "js") {
        jsConsoleArea.setAttribute("style", "display:block;");
        scdArea.style.display = "none";
        scdConsoleArea.setAttribute("style", "display:none;");
        jsCmArea.style.height = "685px";
        jsArea.style.display = "block";
        displayMode = "js";
        javaScriptEditor.cm.refresh();
        return;
    }
    if (value === "both") {
        scdArea.style.height = "315px";
        jsArea.style.height = "315px";
        scdArea.style.display = "block";
        jsArea.style.display = "block";
        scdConsoleArea.setAttribute("style", "display:block;");
        jsConsoleArea.setAttribute("style", "display:block;");
        displayMode = "both";
        superColliderEditor.refresh();
        javaScriptEditor.cm.refresh();
        return;
    }
    if (value === "scd<>js") {
        if (displayMode === "both" || displayMode === "js") {
            scdConsoleArea.setAttribute("style", "display:block;");
            jsArea.style.display = "none";
            scdArea.style.display = "block";
            jsConsoleArea.setAttribute("style", "display:none;");
            cmArea.style.height = "685px";
            displayMode = "scd";
            superColliderEditor.refresh();
            return;
        } else if (displayMode === "scd") {
            jsConsoleArea.setAttribute("style", "display:block;");
            jsArea.style.display = "block";
            scdArea.style.display = "none";
            scdConsoleArea.setAttribute("style", "display:none;");
            jsCmArea.style.height = "685px";
            displayMode = "js";
            javaScriptEditor.cm.refresh();
            return;
        }
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

    var widthTest = /(^width\s|^l\s)([\s\S]*)/;
    var widthMatch = widthTest.exec(value);
    if (widthMatch) {
        let numberTest = /^\d+$/;
        if (numberTest.exec(widthMatch[2])) {
            cmArea.style.width = widthMatch[2] + "px";
            jsCmArea.style.width = widthMatch[2] + "px";
            logJavaScriptConsole("Setting the editors' width to " + widthMatch[2] + "px.");
            return;
        } else if (widthMatch[2] == "default") {
            cmArea.style.width = "700px";
            jsCmArea.style.width = "700px";
            logJavaScriptConsole("Setting the editors' width to the default value, 700px.");
            return;
        }
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
                savedFiles.scd[activeScd].data = files.scd[activeScd].data;
                checkIfScdSaved();
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
                    savedFiles.js[activeJs].data = files.js[activeJs].data;
                    checkIfJsSaved();
                }
            }
        }
        if (matchedFile) {
            return;
        }
    }
    var newTest = /(^new\s|^s\s)([\s\S]*)/;
    var newMatch = newTest.exec(value);
    if (newMatch) {
        if (newMatch[2].substr(newMatch[2].length - 4) == ".scd") {
            for (let i = 0; i < files.scd.length; i++) {
                if (files.scd[i].name == newMatch[2]) {
                    logJavaScriptConsole("The file " + newMatch[2] + " already exists.");
                    return;
                }
            }
            files.scd.push({
                name: newMatch[2],
                path: sketchFolder + "/SuperCollider/" + newMatch[2],
                active: false,
                changed: false,
                scrollHeight: 0,
                data: ""
            });
            savedFiles.scd.push({
                name: newMatch[2],
                path: sketchFolder + "/SuperCollider/" + newMatch[2],
                active: false,
                scrollHeight: 0,
                data: ""
            });
            let t = new Tab(files.scd[files.scd.length - 1], "scd");
        } else if (newMatch[2].substr(newMatch[2].length - 3) == ".js") {
            for (let i = 0; i < files.js.length; i++) {
                if (files.js[i].name == newMatch[2]) {
                    logJavaScriptConsole("The file " + newMatch[2] + " already exists.");
                    return;
                }
            }
            files.js.push({
                name: newMatch[2],
                path: sketchFolder + "/" + newMatch[2],
                active: false,
                changed: false,
                scrollHeight: 0,
                data: ""
            });
            savedFiles.js.push({
                name: newMatch[2],
                path: sketchFolder + "/" + newMatch[2],
                active: false,
                scrollHeight: 0,
                data: ""
            });
            let t = new Tab(files.js[files.js.length - 1], "js");
        } else {
            logJavaScriptConsole("Filenames must end with .scd or .js.");
        }
        return;
    }
    logJavaScriptConsole("Invalid command.");
}

function logJavaScriptConsole(msg) {
    if (displayMode === "scd") {
        logSuperColliderConsole(msg);
    } else {
        var span = document.createElement('span')
        span.innerHTML = "<br>" + msg;
        javaScriptConsole.appendChild(span);
        javaScriptConsole.scrollTop = javaScriptConsole.scrollHeight;
    }
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
    this.div.innerHTML = "&nbsp;" + this.name + "&nbsp;";
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

function checkIfScdSaved() {
    if (savedFiles.scd[activeScd].data !== files.scd[activeScd].data && !files.scd[activeScd].changed) {
        scdTabs[activeScd].div.innerHTML = "•" + scdTabs[activeScd].name + "&nbsp;";
        files.scd[activeScd].changed = true;
    } else if (savedFiles.scd[activeScd].data == files.scd[activeScd].data && files.scd[activeScd].changed) {
        scdTabs[activeScd].div.innerHTML = "&nbsp;" + scdTabs[activeScd].name + "&nbsp;";
        files.scd[activeScd].changed = false;
    }
}

function checkIfJsSaved() {
    if (savedFiles.js[activeJs].data !== files.js[activeJs].data && !files.js[activeJs].changed) {
        jsTabs[activeJs].div.innerHTML = "•" + jsTabs[activeJs].name + "&nbsp;";
        files.js[activeJs].changed = true;
    } else if (savedFiles.js[activeJs].data == files.js[activeJs].data && files.js[activeJs].changed) {
        jsTabs[activeJs].div.innerHTML = "&nbsp;" + jsTabs[activeJs].name + "&nbsp;";
        files.js[activeJs].changed = false;
    }
}

function log(msg) {
    logJavaScriptConsole(msg);
}