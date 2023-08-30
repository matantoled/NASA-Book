var express = require('express');
var router = express.Router();

const db = require('../models/commentsList');


/**
 * get comments from the server using id
 */
router.get('/getComments', (req, res) => {

    const myId = req.query.id

    let comments = db.getCommentsByImgId(myId)
    res.json(comments)

});

/**
 * get comments from the server using dates
 */
router.get('/polling', (req, res) => {

    const start = req.query.first
    const end = req.query.last

    let commentsPerDays = db.getCommentsFromStartToEnd(start, end)
    res.json(commentsPerDays)

});

/**
 * update the DB of comments
 */
router.post('/postComments', (req, res) => {

    const name = req.body.userNameComment;
    const imgId = req.body.imgDate
    const comment = req.body.comment

    db.addComment(imgId, name, comment);

    let response = {"imgDate": imgId}
    res.json(response);
});

/**
 * delete comment from DB
 */
router.delete('/deleteComm', (req, res) => {

    const myId = req.query.id
    const commentId = req.query.commentId
    const name = req.query.name
    let response = null

    const isDeleted = db.deleteComment(myId, commentId, name)
    if (!isDeleted) {
        response = {status: "false", message: "Error. Can not delete the comment"}
    }
    else {
        response = {status: "true", message: "Comment deleted"}
    }

    res.json(response);

});

module.exports = router;