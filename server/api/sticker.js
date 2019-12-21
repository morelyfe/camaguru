const express = require('express');
const stickerRouter = express.Router();

const fs = require('fs');

stickerRouter.post('/selectAll', (req, res) => {
    const folder = './public/sticker/'
    const stickers = [];
    fs.readdirSync(folder).forEach(file => {
        stickers.push(file);
    })
    res.send(stickers);


    //res.sendFile(filepath);
    //'/uploads/' + uid + '/' + file
})


module.exports = stickerRouter;