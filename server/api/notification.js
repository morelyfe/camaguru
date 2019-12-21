const express = require('express');
const notifyRouter = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const connection = require('../config/databaseConfig');

notifyRouter.post('/selectAll', ensureAuthenticated, (req, res, next) => {
    connection.query(`
    SELECT
            m.user_id as user_id,
            m.post_id as post_id,
            m.type as type,
            CASE
                WHEN m.time > DATE_ADD(NOW(), INTERVAL-1 MINUTE ) THEN CONCAT(SECOND (TIMEDIFF(NOW(), m.time)), ' SECONDS AGO')
                WHEN m.time > DATE_ADD(NOW(), INTERVAL-1 HOUR) THEN CONCAT(MINUTE(TIMEDIFF(NOW(), m.time)), ' MINUTES AGO')
                WHEN m.time > DATE_ADD(NOW(), INTERVAL-24 HOUR) THEN CONCAT(HOUR(TIMEDIFF(NOW(), m.time)), ' HOURS AGO')
                ELSE CONCAT(DATEDIFF(NOW(), m.time), ' DAYS AGO') END as time,
            u.username as user_username,
            u.picture as user_picture
        FROM
            (SELECT l.user_id, l.post_id, l.time, 'likes' AS type FROM Likes as l UNION SELECT c.user_id, c.post_id, c.time, 'comments' AS type FROM Comments as c) as m
        LEFT JOIN
            Posts as p
        ON
            m.post_id = p.id
        LEFT JOIN
            Users as u
        ON
            m.user_id = u.id
        WHERE
            p.user_id = ${req.user.id}
            AND
            u.id != ${req.user.id}
        ORDER BY
            m.time DESC;
    `, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    })
})

module.exports = notifyRouter;