let fs = require("fs");
let htmlContent = fs.readFileSync("structure.html", { encoding: "utf8" });

let sketch = process.argv[2];
let sketchJSON = fs.readFileSync("../" + sketch + "/les-environs.json", { encoding: "utf8" });
sketchJSON = JSON.parse(sketchJSON);

// console.log(sketchJSON);

let headURLs = "";
for (let i = 0; i < sketchJSON["javascript-files"].length; i++) {
    let filePath = sketchJSON["javascript-files"][i];
    let file = fs.readFileSync("../" + sketch + "/" + filePath, { encoding: "utf8" });
    let fileURL = "./temp/" + filePath;
    fs.writeFile(fileURL, file, function(err) {
        if (err) {
            return console.error(err);
        } else {
            // console.log(fileURL + ' written successfully.');
        }
    });
    // console.log(filePath);

    headURLs += `<script src="${fileURL}" type="text/javascript"></script>\n`;
}

for (let i = 0; i < sketchJSON["css-files"].length; i++) {
    let filePath = sketchJSON["css-files"][i];
    let file = fs.readFileSync("../" + sketch + "/" + filePath, { encoding: "utf8" });
    let fileURL = "./temp/" + filePath;
    fs.writeFile(fileURL, file, function(err) {
        if (err) {
            return console.error(err);
        } else {
            // console.log(fileURL + ' written successfully.');
        }
    });
    headURLs += `<link rel="stylesheet" type="text/css" href="${fileURL}">\n`;
}

htmlContent = htmlContent.replace(/<script src="editor-class.js"/g, function(match) {
    return headURLs + match;
});
// console.log(htmlContent);
htmlContent = htmlContent.replace(/<title><\/title>/g, function(match) {
    return `<title>${sketch}</title>`;
});



fs.writeFile('index.html', htmlContent, function(err) {
    if (err) {
        return console.error(err);
    } else {
        console.log('index.html written successfully.');
    }
});