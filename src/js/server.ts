import * as express from "express"
const path = require('path');
const app = express();

let srcPath = `${__dirname}/../`;

app.use(express.static(srcPath));
//app.use(express.static(htmlPath));

app.get('/', (req : express.Request , res : express.Response) => {
    res.sendFile(path.join(srcPath, 'main.html'));
});
app.listen(80, () => {
    console.log('Express App on port 80!');
});