"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require('path');
var app = express();
var srcPath = __dirname + "/../";
app.use(express.static(srcPath));
//app.use(express.static(htmlPath));
app.get('/', function (req, res) {
    res.sendFile(path.join(srcPath, 'main.html'));
});
app.listen(80, function () {
    console.log('Express App on port 80!');
});
