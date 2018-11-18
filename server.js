var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');
console.log(__dirname);
// var osc = require("osc");

// var udpPort = new osc.UDPPort({
//     // This is the port we're listening on.
//     localAddress: "127.0.0.1",
//     localPort: 57121,

//     // This is where sclang is listening for OSC messages.
//     remoteAddress: "127.0.0.1",
//     remotePort: 57120,
//     metadata: true
// });

// // Open the socket.
// udpPort.open();

function handleRequest(req, res) {
    // console.log(req.url);
    // What did we request?

    // var filePath = path.join('../', req.url);
    // if (req.url === '/') {
    //     console.log("catched ya!");
    // }

    // var pathname = (req.url === '/') ? req.url : path.join('../', req.url);

    var pathname = req.url;

    console.log(pathname);


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
    if (pathname == '/') {
        pathname = '/index.html';
    }
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
    fs.readFile(__dirname + pathname, function(err, data) {
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

    socket.on('pullJSONs', function() {
        io.sockets.emit('pushJSONs', JSONs);
    });

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

    socket.on('note', function(data) {
        var msg = {
            address: "/hello/from/oscjs",
            args: [{
                type: "f",
                value: data
            }]
        };
        // console.log("Sending message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
        // udpPort.send(msg);
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
});

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