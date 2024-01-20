import Blog from "../Schema/Blog.js"
import Comment from "../Schema/Comment.js"
import Notification from "../Schema/Notification.js"
import User from "../Schema/User.js"
import ErrorHanlder from "../utils/Errorhandler.js"
import {nanoid} from 'nanoid'
export const createBlog = async(req, res, next) =>{
    try { 
        let authorId = req.user
        let {title, des, banner, tags, content, draft, id} = req.body
        if(!title.length)
            return res.status(403).json({error: `You must provide a title to ${draft === true ? "Publish" : "Save"} a blog`})
        if(!draft){
            if(!content)
                return next(new ErrorHanlder(403, 'You must proivide some content to publish your blog'))
            if(!des.length || des.length > 200)
                return res.status(403).json({error: 'You must provide description under 200 charactors long'})
            if(!banner.length){
                return res.status(403).json({error: 'You must Provide blog banner to publish it'})
            }
            if(!content.blocks.length){
                return next(new ErrorHanlder(403, 'There must be some content to publish blog'))
            }
            if(!tags.length || tags.length > 10){
                return next(new ErrorHanlder(403, 'Provide tags in order to publish the blog, maximum 10'))
            }
        }
        tags = tags.map(tag => tag.toLowerCase())

        let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid()

        if(id){
            Blog.findOneAndUpdate({blog_id}, {title, des, banner, content, tags, draft: draft ? draft: false}).then(blog =>{
                return res.status(200).json({id: blog_id})
            })
            .catch(err =>{
                return res.status(500).json({error: err.message})
            })
        }
        else{
            let blog = new Blog({
                title,des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)
            })
            blog.save().then(blog => {
                let incrementVal = draft ? 0 : 1;
                User.findOneAndUpdate({_id: authorId}, {
                    $inc: {"account_info.total_posts" : incrementVal}, $push : {"blogs": blog._id}
                }).then(user => {
                    return res.status(200).json({id: blog.blog_id})
                }).catch(err =>{
                    return next(new ErrorHanlder(500, "Failed to update total posts number"))
                })
            }).catch(err =>{

                res.status(500).json({error: err.message})
            })
        }
    } catch (error) {
            return next(new ErrorHanlder(500, error.message))
    }
}

export const latestBlog = (req, res, next) =>{
    try {
        let {page} = req.body
        let maxLimit = 5
        Blog.find({draft: false})
        .populate("author", "personal_info.profile_img personal_info.fullname personal_info.username -_id")
        .sort({"publishedAt": -1})
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit).then(blogs => {
            return res.status(200).json({blogs})
        }).catch(err =>{
            next(new ErrorHanlder(500, err.message))
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}
export const trendingBlog = (req, res, next) =>{
    try {
        let maxLimit = 5
        Blog.find({draft: false}).populate("author", "personal_info.profile_img personal_info.fullname personal_info.username -_id").sort({"activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1}).select("blog_id title publishedAt -_id").limit(maxLimit).then(blogs => {
            return res.status(200).json({blogs})
        }).catch(err =>{
            next(new ErrorHanlder(500, err.message))
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export const searchBlog = (req, res, next) => {
    try {
        let { tag, page, query, author, limit, eliminate_blog } = req.body;
        let findQuery;

        if (tag && eliminate_blog) {
            findQuery = {
                draft: false,
                $or: [
                    { tags: tag, blog_id: { $ne: eliminate_blog } },
                    { title: new RegExp(tag, 'i'), blog_id: { $ne: eliminate_blog } },
                ],
            };
        } else if (tag) {
            findQuery = { tags: tag, draft: false };
        } else if (query) {
            findQuery = {
                draft: false,
                $or: [
                    { title: new RegExp(query, 'i') },
                    { tags: query },
                ],
            };
        } else if (author) {
            findQuery = { author, draft: false };
        }

        let maxLimit = limit ? limit : 2;

        Blog.find(findQuery)
            .populate(
                'author',
                'personal_info.profile_img personal_info.fullname personal_info.username -_id'
            )
            .sort({ publishedAt: -1 })
            .select('blog_id title des banner activity tags publishedAt -_id')
            .skip((page - 1) * maxLimit)
            .limit(maxLimit)
            .then((blogs) => {
                return res.status(200).json({ blogs });
            })
            .catch((err) => {
                next(new ErrorHanlder(500, err.message));
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const AllLatestBlogCount = (req, res) =>{
    try {
        Blog.countDocuments({draft: false})
        .then(count =>{
            return res.status(200).json({totalDocs: count})
        })
        .catch(err =>{
            return res.status(500).json({error: err.message})
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export const searchBlogsCount = (req, res) =>{
    try {
        let {tag, query, author } = req.body
        let findQuery ;
        if(tag){
            findQuery ={ tags: tag, draft: false}
        }
        else if(query){
            findQuery = {
                draft: false,
                $or:[
                    {title: new RegExp(query, 'i')},
                    {tags: query}
                ]
                
            }
        }
        else if(author){
            findQuery = {author, draft: false}
        }
        // let findQuery = { tags: tag, draft: false}
        // console.log(tag)

        Blog.countDocuments(findQuery)
        .then(count =>{
            // console.log(count)
            return res.status(200).json({totalDocs: count})
        })
        .catch(err =>{
            return res.status(500).json({error: err.message})
        })
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

export const getBlog = (req, res) =>{
    try {
        let {blog_id, draft, mode} = req.body;
        let incrementVal = mode !== 'edit' ? 1 : 0;
        Blog.findOneAndUpdate({blog_id}, {$inc: {"activity.total_reads": incrementVal}})
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
        .select("title des content banner activity publishedAt blog_id tags")
        .then(blog =>{
            User.findOneAndUpdate({"personal_info.username": blog.author.personal_info.username}, {$inc: {"account_info.total_reads": incrementVal}})
            .catch(err => {
                return res.status(500).json({error: err.message})
            })
            if(blog.draft && !draft){
                return res.status(500).json({error: "You can not access draft blog"})
            }
            return res.status(200).json({blog});
        })
        .catch(err =>{
            return res.status(500).json({error: err.message})
        })
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

export const likeBlog = (req, res) =>{
    let user_id = req.user;
    let {_id, isLikedByUser} = req.body
    let incrementVal = !isLikedByUser ? 1 : -1;
    Blog.findOneAndUpdate({_id}, {$inc: {"activity.total_likes": incrementVal}})
    .then(blog => {
        if(!isLikedByUser){
            let like = new Notification({
                type: 'like',
                blog: _id,
                notification_for: blog.author,
                user: user_id,
            })

            like.save().then(notification =>{
                return res.status(200).json({liked_by_user: true})
            })
        }
        else{
            Notification.findOneAndDelete({user: user_id,blog: _id, type: "like" })
            .then(data => {
                return res.status(200).json({liked_by_user: false})
            })
            .catch(err =>{
                return res.status(500).json({error: err.message})
            })
        }
    })
}

export const isLikedByUser = (req, res) =>{
    let user_id = req.user;
    let {_id} = req.body;
    Notification.exists({user: user_id, type: 'like', blog: _id})
    .then(result => {
        return res.status(200).json({result})
    })
    .catch(err => {
        return res.status(500).json({error: err.message})
    })
}

export const AddComment = async(req, res) =>{
    try {
        let user_id = req.user;
        let {_id, comment, blog_author, replying_to, notification_id} = req.body;
        
        if(!comment.length){
            return res.status(403).json({error: "Write something to leave a comment"})
        }
        // console.log("hello")
        // creating a comment document
        let commentObj = {
            blog_id: _id,
            blog_author,
            comment,
            commented_by: user_id
        }

        if(replying_to){
            commentObj.parent = replying_to;
            commentObj.isReply = true
        }

        new Comment(commentObj).save().then(async commentFile => {
            let {comment, commentedAt, children} = commentFile;

            Blog.findOneAndUpdate({_id}, {$push: {'comments': commentFile._id}, $inc : {'activity.total_comments': 1, 'activity.total_parent_comments': replying_to ?  0 : 1}})
            .then(blog => {
                console.log('New Comment Created');
            })
            let notificationObj = {
                type: replying_to ? 'reply' : 'comment',
                blog: _id,
                notification_for: blog_author,
                user: user_id,
                comment: commentFile._id
            }

            if(replying_to){
                notificationObj.replied_on_comment = replying_to

                await Comment.findOneAndUpdate({_id: replying_to}, {$push: {children: commentFile._id}})
                .then(replyingToCommentDoc =>{notificationObj.notification_for = replyingToCommentDoc.commented_by})

                if(notification_id){
                    Notification.findOneAndUpdate({_id: notification_id}, {reply: commentFile._id})
                    .then(notification => {
                        // console.log('Notification updated')
                    })
                }
            }

            new Notification(notificationObj).save()
            .then(notification =>{
                console.log("NOtification created")
            })

            return res.status(200).json({
                comment, commentedAt, _id: commentFile._id, user_id, children
            })
        })
    } catch (error) {
        return res.status(500).jons({error: error.message})
    }
}

export const getBlogComments = (req, res) =>{
    let {blog_id, skip} = req.body;
    let maxLimit = 5;

    Comment.find({blog_id, isReply: false})
    .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
    .skip(skip)
    .limit(maxLimit)
    .sort({
        'commentedAt': -1
    })
    .then(comment => {
        return res.status(200).json(comment)
    })
    .catch(err => {
        return res.status(500).json({error: err.message})
    })
}

export const getReplies = (req, res) =>{
    let {_id, skip} = req.body;

    let maxLimit = 5;

    Comment.findOne({_id})
    .populate({
        path: 'children',
        options: {
            limit: maxLimit,
            skip: skip,
            sort: {'commentedAt': -1}
        },
        populate:{
            path: 'commented_by',
            select: 'personal_info.profile_img personal_info.fullname personal_info.username'
        },
        select: "-blog_id -updatedAt"
    })
    .select("children")
    .then(doc => {
        return res.status(200).json({replies: doc.children})
    })
    .catch(err => {
        return res.status(500).json({error: err.message})
    })
}

const deleteCommentFun = (_id) =>{
    Comment.findOneAndDelete({_id})
    .then(comment =>{
        if(comment.parent){
            Comment.findOneAndUpdate({_id: comment.parent}, {$pull: {children: _id}})
            .then(data => console.log('Commented Delete from comment'))
            .catch(err => console.log(err.message))
        }

        Notification.findOneAndDelete({comment: _id})
        .then(notification => console.log('comment notification deleted'))

        Notification.findOneAndUpdate({reply: _id}, {$unset: {reply: 1}})
        .then(notification => console.log('reply deleted'))

        Blog.findOneAndUpdate({_id: comment.blog_id}, {$pull: {comments: _id}, $inc: {"activity.total_comments": -1}, "activity.total_parent_comments": comment.parent ? 0 : -1})
        .then(blog => {
            if(comment.children.length){
                comment.children.map(replies => {
                    deleteCommentFun(replies)
                })
            }
        })
    })
    .catch(err => {
        console.log(err.message)
    })
}

export const deleteComment = (req, res) =>{
    let user_id = req.user;
    let {_id} = req.body;

    Comment.findOne({_id})
    .then(comment =>{
        if(user_id == comment.commented_by || user_id == comment.blog_author){
            deleteCommentFun(_id)

            return res.status(200).json({status: "done"})
        }
        else{
            return res.status(403).json({error: 'You cannot delete this comment'})
        }
    })
}

export const userWrittenUser = (req, res) => {
    let user_id= req.user;
    let {page, draft, query, deletedDocCount} = req.body;

    let maxLimit = 5;
    let skipDocs = (page-1) * maxLimit

    if(deletedDocCount){
        skipDocs -= deletedDocCount
    }

    Blog.find({author: user_id, draft, title : new RegExp(query, 'i')})
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({publishedAt: -1})
    .select('title banner publishedAt blog_id activity des draft -_id')
    .then(blogs => {
        return res.status(200).json({blogs})
    })
    .catch(err => {
        return res.status(500).json({error: err.message})
    })
}

export const userWrittenUserCount = (req, res) => {
    let user_id = req.user;
    let {draft, query} = req.body;

    Blog.countDocuments({author: user_id, draft, title: new RegExp(query, 'i')})
    .then(count => {
        return res.status(200).json({totalDocs: count})
    })
    .catch(err => {
        console.log(err.message)
        return res.status(500).json({error: err.message})
    })
}

export const deleteBlog = (req, res) => {
    let user_id = req.user;
    let {blog_id} = req.body;

    Blog.findOneAndDelete({blog_id})
    .then((blog) => {
        Notification.deleteMany({blog: blog._id})
        .then(() => {
            console.log('notification deleted')
        })
        Comment.deleteMany({blog_id: blog._id}).then(data => console.log('comment deleted'))

        User.findOneAndUpdate({_id: user_id}, {$pull: {blog: blog_id}, $inc: {"account_info.total_posts": -1}})
        .then(user => {
            console.log('Blog deleted')
        })

        return res.status(200).json({status: 'done'})
    })
    .catch(err => {
        return res.status(500).json({error: err.message})
    })
}