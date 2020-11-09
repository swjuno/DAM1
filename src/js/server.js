"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
//import * as cookieParser from 'cookie-parser';
var path = require('path');
var app = express();
var srcPath = __dirname + "/../";
var htmlPath = path.join(srcPath, 'html');
//app.use(cookieParser());
app.use('/', require('./route'));
app.use(express.static(srcPath));
//app.use(express.static(htmlPath));
app.get('/', function (req, res) {
    res.sendFile(path.join(htmlPath, 'DAM.html'));
});
app.listen(8080, function () {
    console.log('Express App on port 8080!');
});
