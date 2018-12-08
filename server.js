var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');
var sc = require('supercolliderjs');
var osc = require("osc");
var config = require("./config.js");
var htmlSources = {
    head: fs.readFileSync("html/head.html", { encoding: "utf8" }),
    body: fs.readFileSync("html/body.html", { encoding: "utf8" }),
};

let sketchFolder, sketchName, sketchIndex;

if (!process.argv[2]) {
    console.log("A sketch name must be provided.");
    return;
} else {
    sketchName = process.argv[2];
    sketchFolder = config.pathToSketches + sketchName;
    if (fs.existsSync(sketchFolder)) {
        console.log(`The sketch '${sketchName}' exists.`);
        // console.log(sketchFolder);
        sketchIndex = fs.readFileSync(sketchFolder + "/index.html", { encoding: "utf8" });
    } else {
        console.log(`The sketch '${sketchName}' does not exist.`);
        return;
    }
}

let environsIndex = sketchIndex;
environsIndex = environsIndex.replace(/<\/head>/g, `${htmlSources.head}
</head>`);
environsIndex = environsIndex.replace(/<\/body>/g, `${htmlSources.body}
</body>`);

// console.log(environsIndex);
// return;

// I now need to scrape all the files that might be used during live coding.

let files;

function gatherFiles() {
    let files = {
        scd: [],
        js: []
    };
    if (fs.existsSync(sketchFolder + "/SuperCollider")) {
        files.scd = fs.readdirSync(sketchFolder + "/SuperCollider");
        for (let i = 0; i < files.scd.length; i++) {
            files.scd[i] = {
                name: files.scd[i],
                path: sketchFolder + "/SuperCollider/" + files.scd[i],
                active: false,
                scrollHeight: 0
            };
        }
    }
    sketchIndex.replace(/(src=")(.*?)(")/g, function(a, b, c) {
        if (!c.match(/libraries/g) &&
            !c.match(/frame-export/g) &&
            !c.match(/http/g)
        ) {
            files.js.unshift({
                name: c,
                path: sketchFolder + "/" + c,
                active: false,
                scrollHeight: 0
            });
        }
    });


    for (let i = 0; i < files.scd.length; i++) {
        files.scd[i].data = fs.readFileSync(files.scd[i].path, { encoding: "utf8" });
    }
    for (let i = 0; i < files.js.length; i++) {
        files.js[i].data = fs.readFileSync(files.js[i].path, { encoding: "utf8" });
    }
    return files;
}


var udpPort = new osc.UDPPort({
    // This is the port we're listening on.
    localAddress: "127.0.0.1",
    localPort: 57121,

    // This is where sclang is listening for OSC messages.
    remoteAddress: "127.0.0.1",
    remotePort: 57120,
    metadata: true
});
udpPort.open();

var sclang;

function handleRequest(req, res) {
    // console.log(req.url);
    // What did we request?

    // var filePath = path.join('../', req.url);
    // if (req.url === '/') {
    //     console.log("catched ya!");
    // }

    // var pathname = (req.url === '/') ? req.url : path.join('../', req.url);

    var pathname = req.url;

    // console.log(pathname);


    var pathnametest = pathname;
    // console.log(req.url);
    var query = url.parse(req.url, true).query;

    var r = /\?/g;
    if (pathname.match(r)) {
        var re = /\?(.*)/gi;
        pathnametest = pathnametest.replace(re, ``);
        // console.log(pathnametest);
    }
    pathname = pathnametest;

    // console.log(query);
    // If blank let's ask for index.html

    // If the path is empty, we return the injected sketch.
    if (pathname == '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(environsIndex);
        return;
        // pathname = '/index.html';
    }

    // If the path non-empty, we check whether it relates to Les environs

    var testEnvirons = /les-environs\//g;
    if (pathname.match(testEnvirons)) {
        let injecting = pathname;
        injecting = injecting.replace(/les-environs\//g, "");
        pathname = config.pathToSketches + "Les-environs" + injecting;
    } else if (!pathname.match(/http/g)) {
        pathname = config.pathToSketches + sketchName + pathname;
    }

    // console.log("The pathname is : " + pathname);



    // Ok what's our file extension
    var ext = path.extname(pathname);
    // Map extension to file type
    var typeExt = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };

    //What is it?  Default to plain text
    var contentType = typeExt[ext] || 'text/plain';
    // Now read and write back the file with the appropriate content type
    // fs.readFile(__dirname + pathname, function(err, data) {
    fs.readFile(pathname, function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + pathname);
        }
        // Dynamically setting content type
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
    // res.end(JSON.stringify(query));
}

// Create a server with the handleRequest callback
var server = http.createServer(handleRequest);
// Listen on port 8080
server.listen(8080);
console.log('Server started on port 8080');

var io = require('socket.io').listen(server);

var clients = {};

io.sockets.on('connection', function(socket) {
    console.log("Client " + socket.id + " is connected.");
    files = gatherFiles();

    socket.on('pullFiles', function() {
        io.sockets.emit('pushFiles', files);
        console.log("Pushing files.");
    });

    // socket.on('pullMessage', function() {
    //     io.sockets.emit('pushMessage', files);
    //     // console.log("Pushing files.");
    // });

    socket.on('mouse', function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'mouse' " + data.x + " " + data.y);
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
    });

    socket.on('bounce', function(data) {
        console.log(data);
    });

    socket.on('image', function(data) {
        // console.log(dataUrl);

        // var imageBuffer = new Buffer(dataUrl, 'base64'); //console = <Buffer 75 ab 5a 8a ...
        // fs.writeFile("test.jpg", imageBuffer, function(err) { //... });

        var imageBuffer = decodeBase64Image(data.dataUrl);
        // console.log(imageBuffer);

        fs.writeFile(data.name + ".png", imageBuffer.data, function(err) {
            if (err) {
                return console.error(err);
            } else {
                console.log(data.name + ".png written successfully.");
            }
        });
    });

    socket.on('interpretSuperCollider', function(msg) {
        if (sclang !== null) {
            sclang.interpret(msg, null, true, true, false)
                .then(function(result) {
                    io.sockets.emit('toscdconsole', result);
                    // console.log(result);
                })
                .catch(function(error) {
                    var errorStringArray = JSON.stringify(error.error, null, ' ');
                    io.sockets.emit('toscdconsole', errorStringArray + '\n\n\n');
                    console.log("Is this happening?");
                });
        };
    });

    socket.on('note', function(data) {
        var msg = {
            address: "/hello/from/oscjs",
            args: [{
                type: "f",
                value: data
            }]
        };
        // console.log("Sending message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
        udpPort.send(msg);
    });

    // socket.on('savePoints', function(data) {
    //     console.log(data);
    //     data = JSON.stringify(data);
    //     var fileName = filenameFormatter(Date());
    //     fileName = fileName.slice(0, fileName.length - 13);
    //     fs.writeFile("./JSONs/" + fileName + '.json', data, function(err) {
    //         if (err) {
    //             return console.error(err);
    //         } else {
    //             console.log("./JSONs/" + fileName + '.json written successfully.');
    //         }
    //     });
    // });
    socket.on('saveFile', function(file) {
        // console.log(data);
        // data = JSON.stringify(data);
        // var fileName = filenameFormatter(Date());
        // fileName = fileName.slice(0, fileName.length - 13);
        fs.writeFile(file.path, file.data, function(err) {
            if (err) {
                return console.error(err);
            } else {
                console.log(file.path + ' written successfully.');
                io.sockets.emit('pushMessage', file.path + ' written successfully.');
            }
        });
    });
});


function startSclang() {
    sc.lang.boot({ stdin: false, echo: false, debug: false }).then(function(lang) {
        sclang = lang;
        sclang.on('stdout', function(text) {
            io.sockets.emit('toscdconsole', text);
        });
        sclang.on('state', function(text) {
            io.sockets.emit('toscdconsole', JSON.stringify(text));
        });
        sclang.on('stderror', function(text) {
            io.sockets.emit('toscdconsole', JSON.stringify(text));
        });
        sclang.on('error', function(text) {
            io.sockets.emit('toscdconsole', JSON.stringify(text.error.errorString));
        });
    });
    // sc.server.boot();
}
startSclang();




function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}