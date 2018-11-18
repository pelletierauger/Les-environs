// var socket;
let files;
let appControl;
let superColliderEditor, javaScriptEditor;
let superColliderConsole, javaScriptConsole;
window.onload = init;

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
        lineWrapping: true,
        theme: "les-environs",
        autoCloseBrackets: true,
        scrollbarStyle: "null",
        styleSelectedText: true,
        extraKeys: {
            Tab: (cm) => cm.execCommand("indentMore"),
            "Shift-Tab": (cm) => cm.execCommand("indentLess"),
        },
    });
    var javaScriptEditorContainer = document.getElementById("javascript-editor");
    javaScriptEditor = CodeMirror.fromTextArea(javaScriptEditorContainer, {
        lineNumbers: false,
        mode: "javascript",
        matchBrackets: true,
        autofocus: true,
        styleActiveLine: true,
        smartIndent: false,
        indentWithTabs: false,
        lineWrapping: true,
        theme: "les-environs",
        autoCloseBrackets: true,
        scrollbarStyle: "null",
        styleSelectedText: true,
        extraKeys: {
            Tab: (cm) => cm.execCommand("indentMore"),
            "Shift-Tab": (cm) => cm.execCommand("indentLess"),
        },
    });
    // socket = io.connect('http://localhost:8080');
    socket.on('pushFiles', function(data) {
        files = data;
    });
    socket.emit('pullFiles', "");

    superColliderConsole = document.getElementById("supercollider-console");
    javaScriptConsole = document.getElementById("javascript-console");


    appcontrol = window.document.getElementById("appcontrol");
    appcontrol.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {

            interpretAppControl(appcontrol.value);
        }
    });
}

function interpretAppControl(value) {
    // console.log(value);
    if (value === "ls") {
        console.log("whoa!");
        let allFiles = "";
        for (let i = 0; i < files[0].length; i++) {
            let comma = ", ";
            allFiles += files[0][i].name + comma;
        }
        for (let i = 0; i < files[1].length; i++) {
            let comma = (i < files[1].length - 1) ? ", " : "";
            allFiles += files[1][i].name + comma;
        }
        logJavaScriptConsole(allFiles);
        return;
    }
    if (value === "cc") {
        while (javaScriptConsole.firstChild) {
            javaScriptConsole.removeChild(javaScriptConsole.firstChild);
        }
        return;
    }
    // value.replace(/(load\s)([\s\S]*?)/, function(a, b, c) {
    //     console.log(c);
    // });
    // var myString = "something format_abc";
    // ([\s\S]*?)
    var myRegexp = /(load\s)([\s\S]*)/;
    var match = myRegexp.exec(value);
    if (match) {
        // console.log("there was a match!");
        console.log("match : " + match[2]); // abc
        let matchedFile = false;
        for (let i = 0; i < files[0].length; i++) {
            if (files[0][i].name == match[2]) {
                superColliderEditor.setValue(files[0][i].content);
                matchedFile = true;
            }
        }
        for (let i = 0; i < files[1].length; i++) {
            if (files[1][i].name == match[2]) {
                javaScriptEditor.setValue(files[1][i].content);
                matchedFile = true;
            }
        }
        if (matchedFile) {
            return;
        }
    }
    logJavaScriptConsole("Invalid statement.");
}

function logJavaScriptConsole(msg) {
    // if (javaScriptConsole.value) {
    //     javaScriptConsole.value += "\n" + msg;
    // } else {
    //     javaScriptConsole.value = msg;
    // }


    // var span = document.getElementById('someID');
    // while (javaScriptConsole.firstChild) {
    // javaScriptConsole.removeChild(javaScriptConsole.firstChild);
    // }
    var span = document.createElement('span')
    span.innerHTML = "<br>" + msg;
    javaScriptConsole.appendChild(span);
    // this.logElement.scrollTop = 0;
    javaScriptConsole.scrollTop = javaScriptConsole.scrollHeight;
}

function logSuperColliderConsole(msg) {

}