import Blog from "../Schema/Blog.js"
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
                // console.log(blogs);
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