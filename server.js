const express = require('express');
const app = express();

app.use(express.static(__dirname + '/build/youtube-api-project'));

const port = 3004;


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});