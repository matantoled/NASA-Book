/**
 * DB for save the all comments
 * @type {{deleteComment: ((function(*, *, *): (boolean))|*), getCommentsFromStartToEnd: (function(*, *): *[]), addComment: addComment, getCommentsByImgId: ((function(*): (*))|*)}}
 */
module.exports = (function() {
    // private data
    let comments = new Map()
    let commentsCounter = 0     // counter to get id to each comment

    // private methods
    // add the comment
    function addComment(imgId, userNameComment, comment) {
        if (comments.has(imgId)) {
            comments.get(imgId).listOfComments.push({id: commentsCounter, user: userNameComment, text: comment}) // adds a new item to an existing comment list
            comments.get(imgId).lastUpdate = Date.now()
        }
        else {
            comments.set(imgId, {lastUpdate: Date.now(), listOfComments: [{id: commentsCounter, user: userNameComment, text: comment}]})  // create new item
        }
        commentsCounter++
    }

    // delete comment
    function deleteComment(imgId, commentId, name) {
        const arr = comments.get(imgId).listOfComments
        const index = arr.findIndex(obj => obj.id.toString() === commentId.toString() && obj.user.toString() === name.toString());
        if (index !== -1) {
            arr.splice(index, 1);
            comments.get(imgId).lastUpdate = Date.now()
            return true     // comment removed
        }
        return false
    }

    // return the comment using ids
    function getCommentsByImgId(imgId) {

        if (comments.has(imgId) && (comments.get(imgId).listOfComments.length > 0)) {
            return comments.get(imgId)
        }
        else {
            return {lastUpdate: 0, listOfComments: []}
        }
    }

    // return the comment using dates
    function getCommentsFromStartToEnd(startD, endD) {

        let commentsPerDay = []
        const end = new Date(Date.parse(endD));
        end.setDate(end.getDate() - 1);
        endD = end.toISOString().slice(0,10);
        while (startD.toString() !== endD.toString()) {

            if (comments.has(startD)) {
                commentsPerDay.push({id: startD, list: comments.get(startD)})
            }

            const convertToDate = new Date(Date.parse(startD));
            convertToDate.setDate(convertToDate.getDate() - 1);
            startD = convertToDate.toISOString().slice(0,10);
        }
        return commentsPerDay
    }

    // public API
    return {
        addComment: addComment,
        deleteComment: deleteComment,
        getCommentsByImgId: getCommentsByImgId,
        getCommentsFromStartToEnd: getCommentsFromStartToEnd
    };
})();