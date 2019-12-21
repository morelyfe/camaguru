const express = require('express');
const likeRouter = express.Router();

const connection = require('../config/databaseConfig');



likeRouter.post('/insert', (req, res, next) => {
    const { user_id, post_id } = req.body;

    connection.query(` 
    SELECT
        *
    FROM
        Likes
    WHERE
        user_id = ${user_id}
    AND
        post_id = ${post_id}
    `, (err, row) => {
        if (err) return next(err);
        if (row.length === 0) {
            connection.query(`
            INSERT INTO Likes
                    (user_id, post_id)
                VALUES
                    (?, ?)
            `, [user_id, post_id], (err) => {
                if (err) return next(err);
                console.log("Likes inserted.");
                res.send({success: true});
            })
        } else {
            connection.query(`
            DELETE FROM
                Likes
            WHERE
                user_id = ${user_id}
            AND
                post_id = ${post_id}
            `, (err) => {
                if (err) return next(err);
                console.log("Likes deleted.");
                res.send({success: true});
            })
        }
    })
})


module.exports = likeRouter;