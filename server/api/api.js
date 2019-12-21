const express = require('express');
const apiRouter = express.Router();
const authRouter = require('./auth.js');
const userRouter = require('./users.js');
const postRouter = require('./posts');
const stickerRouter = require('./sticker');
const searchRouter = require('./search');
const likeRouter = require('./likes');
const commentRouter = require('./comments');
const notifyRouter = require('./notification');

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/sticker', stickerRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/likes', likeRouter);
apiRouter.use('/comments', commentRouter);
apiRouter.use('/notification', notifyRouter);


module.exports = apiRouter;