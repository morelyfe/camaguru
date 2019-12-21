const express = require('express');
const postRouter = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const fs = require('fs');
const uuid = require('uuid/v1');

const sharp = require('sharp');
const jimp = require('jimp');
// const mime = require('mime');

const connection = require('../config/databaseConfig');

postRouter.post('/select', (req, res, next) => {
    const { id, user_id } = req.body;
    connection.query(`
     SELECT
            p.id,
            p.picture,
            p.content,
            p.location,
            p.together,
            p.time,
            CASE
                WHEN MINUTE(TIMEDIFF(NOW(), p.time)) = 0 THEN 'RIGHT NOW'
                WHEN p.time > DATE_ADD(NOW(), INTERVAL-1 HOUR) THEN CONCAT(MINUTE(TIMEDIFF(NOW(), p.time)), ' MINUTES AGO')
                WHEN p.time > DATE_ADD(NOW(), INTERVAL-24 HOUR) THEN CONCAT(HOUR(TIMEDIFF(NOW(), p.time)), ' HOURS AGO')
                ELSE CONCAT(DATEDIFF(NOW(), p.time), ' DAYS AGO') END as post_time,
            u.id as user_id,
            u.username as user_username,
            u.picture as user_picture,
            (SELECT COUNT(*) FROM Likes WHERE post_id = p.id) as num_likes,
            (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) as num_comments,
            (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = ?) as user_islike
        FROM
            Posts as p
        LEFT JOIN
            Users as u
        ON
            p.user_id = u.id
        WHERE
            p.id = ?
    `, [user_id, id], (err, row) => {
        if (err) return next(err);
        connection.query(`
        SELECT
            l.user_id as user_id,
            l.post_id as post_id,
            l.time as time,
            u.username as user_username,
            u.picture as user_picture
        FROM
            Likes as l
        LEFT JOIN
            Users as u
        ON
            l.user_id = u.id
        WHERE
            l.post_id = ${row[0].id}
        ORDER BY
            l.time DESC
        `, (err, result) => {
            if (err) return next(err);
            row[0].likes = result;
            
            connection.query(`
            SELECT
                c.id as id,
                c.user_id as user_id,
                c.post_id as post_id,
                c.content as content,
                c.time as time,
                CASE
                    WHEN MINUTE(TIMEDIFF(NOW(), c.time)) = 0 THEN 'RIGHT NOW'
                    WHEN c.time > DATE_ADD(NOW(), INTERVAL-1 HOUR) THEN CONCAT(MINUTE(TIMEDIFF(NOW(), c.time)), ' MINUTES AGO')
                    WHEN c.time > DATE_ADD(NOW(), INTERVAL-24 HOUR) THEN CONCAT(HOUR(TIMEDIFF(NOW(), c.time)), ' HOURS AGO')
                    ELSE CONCAT(DATEDIFF(NOW(), c.time), ' DAYS AGO') END as time,
                u.username as user_username,
                u.picture as user_picture
            FROM
                Comments as c
            LEFT JOIN
                Users as u
            ON
                c.user_id = u.id
            WHERE
                c.post_id = ${row[0].id}
            ORDER BY
                c.id
            `, (err, result) => {
                if (err) return next(err);
                row[0].comments = result;
                res.json(row[0]);
            })
        })
        //delete does not works!
    })
})


postRouter.post('/selectAll', (req, res) => {
    let { user_id, call } = req.body;
    if(call == undefined) {
        call = 0;
    }
    connection.query(`
    SELECT
            p.id,
            p.picture,
            p.content,
            p.location,
            p.together,
            CASE
                WHEN MINUTE(TIMEDIFF(NOW(), p.time)) = 0 THEN 'RIGHT NOW'
                WHEN p.time > DATE_ADD(NOW(), INTERVAL-1 HOUR) THEN CONCAT(MINUTE(TIMEDIFF(NOW(), p.time)), ' MINUTES AGO')
                WHEN p.time > DATE_ADD(NOW(), INTERVAL-24 HOUR) THEN CONCAT(HOUR(TIMEDIFF(NOW(), p.time)), ' HOURS AGO')
                ELSE CONCAT(DATEDIFF(NOW(), p.time), ' DAYS AGO') END as post_time,
            u.id as user_id,
            u.username as user_username,
            u.picture as user_picture,
            (SELECT COUNT(*) FROM Likes WHERE post_id = p.id) as num_likes,
            (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) as num_comments,
            (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = ?) as user_islike 
        FROM Posts p
        LEFT JOIN Users u ON p.user_id = u.id
        WHERE
            (
                u.id = ?
                OR
                u.isPrivate = 0
            )
            AND
            p.id < IF(? = 0, (SELECT MAX(id) + 1 FROM Posts), ?)
        ORDER BY p.id DESC
        LIMIT 0, 5
    `, [user_id, user_id, call, call], (err, rows) => {
        if (err) throw err;
        res.json(rows);
    })
})

const uploadImage = async (req, res, next) => {
    let matches = req.body.picture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    //should do something with reduce size of image and merge.
    let imageBuffer = Buffer.from(matches[2], 'base64');
    let fileName = uuid() + '.jpeg';
    
    try {
        fs.writeFileSync("./public/images/" + fileName, imageBuffer, 'utf8');
        //merge
        req.imageName = fileName;
        next();
        
        // return res.send({ success: true });
    } catch (e) {
        console.log(e);
        return new Error('Invalid input!');
    }    
}

const resizeImage2 = async (req, res, next) => {
    req.imagePath = `./public/images/${req.imageName}`;
    sharp(req.imagePath).resize(960, 960).toBuffer((err, buf) => {
        if (err) {
            return new Error('Error from resize');
        }
        const image = buf.toString('base64');
        fs.writeFile(req.imagePath, image, {encoding: 'base64'}, (err) => {
            if (err) {
                return new Error('Error from writing resized image');
            }
            next();
        })
    })
}

// filter 0 = Original, 1 = black * white, 2 Sephia
const resizeImage = async (req, res, next) => {
    req.imagePath = `./public/images/${req.imageName}`;
    const filter = req.body.filter;
    if (filter !== 0) {
        await jimp.read(req.imagePath, (err, test) => {
            if (err) throw err;
            if (filter == 1) {
                test
                .resize(jimp.AUTO, 960) // resize
                .quality(60) // set JPEG quality
                .greyscale() // set greyscale
                .write(req.imagePath); // save
                console.log("Color changed");
                next();
            } else if (filter == 2) {
                test
                .resize(jimp.AUTO, 960) // resize
                .quality(60) // set JPEG quality
                .sepia() // set sepia
                .write(req.imagePath); // save
                console.log("Color changed");
                next();
            }
        });
    }
    else {
        console.log("original");
        next();
    }
}

const margeImage = async (req, res, next) => {
    const stickers = req.body.stickers;
    let images = [req.imagePath];
    for(let i = 0; i < stickers.length; i++) {
        images.push('./public/sticker/' + stickers[i].name);
    }
    let jimps = [];
    for (let i = 0; i < images.length; i++) {
        jimps.push(jimp.read(images[i]));
    }
    Promise.all(jimps).then((data) => {
        return Promise.all(jimps);
    }).then((data) => {
        for (let i = 0; i < stickers.length; i++) {
            data[0].composite(data[i + 1], stickers[i].x * 960, stickers[i].y * 960);
        }
        data[0].write(req.imagePath);
        next();
    })
}
 
postRouter.post('/insert', ensureAuthenticated, uploadImage, resizeImage, resizeImage2, margeImage, async (req, res, next) => {
    const { user_id, content, location, together } = req.body;

    connection.query(`
    INSERT INTO Posts (user_id, picture, content, location, together) 
    VALUES (${user_id}, '${req.imageName}', '${content}', '${location}', '${together}')
    `, (err) => {
        if(err) {
            console.log(err);
            return res.send({success: false})
        } else {
            return res.send({success: true });
        }
    })
});

postRouter.post('/delete', (req, res, next) => {
    const { id } = req.body;

    connection.query(`
        DELETE FROM
            Posts
        WHERE
            id = ${id}
    `, (err) => {
        if (err) return next(err);
        console.log("Post deleted.");
        res.send({success: true});
    })
})

module.exports = postRouter;
