const express = require('express');
const commentRouter = express.Router();

const connection = require('../config/databaseConfig');

commentRouter.post('/insert', (req, res, next) => {
    const { user_id, post_id, content } = req.body;

    connection.query(`
    INSERT INTO Comments
            (user_id, post_id, content)
        VALUES
            (?, ?, ?)
    `, [user_id, post_id, content], (err) => {
        if (err) return next(err);
        console.log("comment inserted.");
        res.send({success: true});
    })
})

commentRouter.post('/delete', (req, res, next) => {
    const { id } = req.body;

    connection.query(`
    DELETE FROM
        Comments
    WHERE
        id = ${id}
    `, (err) => {
        if (err) return next(err);
        console.log("comment deleted.");
        res.send({success: true});
    })
})
module.exports = commentRouter;