const express = require('express');
const searchRouter = express.Router();

const connection = require('../config/databaseConfig');

searchRouter.post('/select', (req, res, next) => {
    const { id } = req.body; //user_id
    connection.query(`
    SELECT
            id as id,
            picture as picture,
            username as username,
            bio as bio,
            isPrivate as isPrivate,
            (SELECT COUNT(*) FROM Posts WHERE user_id = ${id}) as num_posts,
            (SELECT COUNT(*) FROM Likes as r LEFT JOIN Posts as p ON r.post_id = p.id WHERE p.user_id = ${id}) as num_likes,
            (SELECT COUNT(*) FROM Comments as c LEFT JOIN Posts as p ON c.post_id = p.id WHERE p.user_id = ${id}) as num_comments
        FROM
            Users
        WHERE
            id = ${id}
    `, (err, row) => {
        if (err) {return next(err);}
        else {
            connection.query(`
            SELECT
                p.id as id,
                p.user_id as user_id,
                p.picture as picture,
                p.content as content,
                p.location as location,
                p.together as together,
                p.time as time
            FROM
                Posts as p
            LEFT JOIN
                Users as u
            ON
                p.user_id = u.id
            WHERE
                u.id = ${id}
            ORDER BY p.id DESC
            `, (err, result) => {
                if (err) return next(err);
                row[0].posts = result;
                res.json(row[0]);
            })

        }
        
    })
})

        // SELECT
        //     *
        // FROM
        //     post as p
        // LEFT JOIN
        //     user as u
        // ON
        //     p.user_id = u.id
        // WHERE
        //     u.id = #{id}
        // ORDER BY p.id DESC

searchRouter.post('/selectAllUserByKeyword', (req, res, next) => {
    const { keyword } = req.body;
    connection.query(`
    SELECT
            id, email, username, bio, picture
        FROM
            Users
        WHERE
            username LIKE '%${keyword}%'
    `, (err, rows) => {
        if (err) return next(err);
        res.json(rows);        
    })
})

searchRouter.post('/selectAllPostByKeyword', (req, res, next) => {
    const { keyword } = req.body;
    connection.query(`
    SELECT
            p.id,
            p.picture,
            p.content,
            p.location,
            p.together,
            CASE
                WHEN p.time > DATE_ADD(NOW(), INTERVAL-1 HOUR) THEN CONCAT(MINUTE(TIMEDIFF(NOW(), p.time)), ' MINUTES AGO')
                WHEN p.time > DATE_ADD(NOW(), INTERVAL-24 HOUR) THEN CONCAT(HOUR(TIMEDIFF(NOW(), p.time)), ' HOURS AGO')
                ELSE CONCAT(DATEDIFF(NOW(), p.time), ' DAYS AGO') END as post_time,
            u.id as user_id,
            u.username as user_username,
            u.picture as user_picture,
            (SELECT COUNT(*) FROM Likes WHERE post_id = p.id) as num_likes,
            (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) as num_comments
        FROM
            Posts as p
        LEFT JOIN
            Users as u
        ON
            p.user_id = u.id
        WHERE
            u.isPrivate = 0
            AND
            (
                u.username LIKE '%${keyword}%'
                OR
                p.content LIKE '%${keyword}%'
                OR
                p.location LIKE '%${keyword}%'
                OR
                p.together LIKE '%${keyword}%'
            )
        ORDER BY p.id DESC
    `, (err, rows) => {
        if (err) {
            return next(err);
        }
        res.json(rows);
    })
})

module.exports = searchRouter;