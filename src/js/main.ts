const express = require('express');
const path = require('path');
const app = express();

let srcPath = `${__dirname}/../`;
let htmlPath = path.join(srcPath, 'html');

app.use(express.static(srcPath));
//app.use(express.static(htmlPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(htmlPath, 'DAM.html'));
});
app.listen(8080, () => {
    console.log('Express App on port 8080!');
});