var PostModel = require('../models/post.model');
//var CommentModel = require('../models/comment.model');
//var LikesModel = require('../models/like.model');

var mongoose = require('mongoose');

const createPost = async function (req, res, next) {
    try {
        let postItem = {
            _id: new mongoose.Types.ObjectId(),
            text: req.body.text,
            picture: req.filePath,
            publicationDate: Date.now(),
            author: req.user._id
        };

        const createdPost = await PostModel.create(postItem);
        res.status(201).json(createdPost);

    } catch (err) {
        return next(err);
    }
};


const getPostlist = async function (req, res, next) {
    try {
        const query = setQueryOption(req);

        const paginationOptions = setPaginationOptions(req);

        const postList = await PostModel.paginate(query, paginationOptions);

        res.status(200).json(postList);

    } catch (err) {
        return next(err);
    }
}

function setQueryOption(req) {
    let queryItem = {};

    if (req.query.query) {
        queryItem = {
            $text: {
                $search: req.query.query
            }
        }
    }

    return queryItem;
}

function setPaginationOptions(req) {
    const itemPerPage = 3;//10
    const pageNum = req.params.page == 0 ? 1 : req.params.page
    const pageNumber = Math.max(0, pageNum || 0);

    return {
        populate: {
            path: 'author'
        },
        sort: {
            publicationDate: -1
        },
        lean: true,
        page: pageNumber,
        limit: itemPerPage
    };
}

function findOnePost(req, res) {
    let conditionQuery = {
        _id: req.params.messageId
    };

    PostModel.findOne(conditionQuery, function (err, postItem) {
        if (err) {
            res.status(400).json({
                error: err.message
            })
        }
        res.status(200).json(postItem);
    });

}
const editPost = async function (req, res) {
    try {
        let conditionQuery = {
            _id: req.params.postId
        };

        let editFields = {
            text: req.body.text,
            picture: req.filePath
        };

        const postItem = await PostModel.findOneAndUpdate(conditionQuery, editFields);

        res.status(201).json(postItem)

    } catch (err) {
        return next(err);
    }
}

/*
const removePost = async function (req, res, next) {
    try {
        const postId = req.params.postId;

        let conditionQuery = {
            _id: postId
        };

        await PostModel.findOneAndDelete(conditionQuery)
        await CommentModel.deleteMany({
            postId: postId
        })

        res.status(200).end();

    } catch (err) {
        return next(err);
    }
}
*/

function canAccess(req, res, next) {
    let postId = req.params.postId;
    PostModel.findById(postId, function (err, postItem) {
        if (err) {
            res.status(400).json({
                error: err.message
            })
        }

        if (
            postItem.author._id.toString() == req.user._id.toString()
        ) {
            next();
        } else {
            res.status(403).json({
                error: "You are not allowed to edit this item"
            })
        }
    });

}

/*
const setLikeOrDislikeForPost = async function (req, res, next) {
    try {
        let likeItem = {
            postId: req.body.postId,
            userId: req.user._id
        };

        const likedPosts = await LikesModel.findOne(likeItem);

        if (!!likedPosts) {
            const deletedLike = await LikesModel.findOneAndDelete(likeItem);
            res.status(201).json(deletedLike);
        } else {
            const createdLike = await LikesModel.create(likeItem);
            res.status(201).json(createdLike);
        }

    } catch (err) {
        return next(err);
    }
}

const getLikedPostsById = async function (postList) {
    const postIdList = postList.map(item => item._id);

    let query = {
        postId: {
            $in: postIdList
        }
    };

    const likesList = await LikesModel.find(query).lean();
    return likesList;
}

function setEditable(postList, req) {
    postList.forEach(post => {
        post.editable = post.author._id.toString() === req.user._id.toString()
    });
}
*/

module.exports = {
    createPost,
    getPostlist,
    findOnePost,
    editPost,
    canAccess
};