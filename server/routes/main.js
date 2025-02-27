const express = require('express');
const router = express.Router();
const Post = require('../models/Post')
// Routes

/** 
 * Get
 * Home
 * with pagination
*/
router.get('', async (req, res) => {

    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog NodeJs"
        }

        let perPage = 7;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    }
});

// Without pagination
// router.get('', async (req, res) => {
//     // res.send("Hello World");
//     const locals = {
//         title: "NodeJs Blog",
//         description: "Simple Blog NodeJs"
//     }
//     try{
//         const data = await Post.find();
//         res.render('index',{locals, data});
//     }catch(error){
//         console.log(error);
//     }
// });

/** 
 * Get
 * Post: id
*/
router.get('/post/:id', async (req, res) => {


    try {
        // Grab Id
        let slug = req.params.id;

        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            description: "Simple Blog NodeJs"
        }

        res.render('post', { locals, data, currentRoute: `/post/${slug}` });
    } catch (error) {
        console.log(error);
    }
});


/*
* Post /
* Post - searchTerm
*/
router.post('/search', async (req, res) => {

    try {

        const locals = {
            title: 'Search',
            description: "Simple Blog NodeJs"
        }

        // This grabs body of search name in partials/sesarch.ejs 
        let searchTerm = req.body.searchTerm;

        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or: [
                {
                    title: { $regex: new RegExp(searchNoSpecialChar, 'i') }
                    // body: { $regex: new RegExp(searchNoSpecialChar, 'i') }
                }
            ]
        });

        res.render("search_result", {
            data,
            locals,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    }
});

/* 
 * Get
 * About 
*/
router.get('/about', (req, res) => {
    
    res.render('about', {
        currentRoute: '/about'
    });
});

/* 
 * Get
 * Contact
*/
router.get('/contact', (req, res) => {
    
    res.render('contact', {
        currentRoute: '/contact'
    });
});

// function insertPostData() {
//     Post.insertMany([
//         {
//             title: "Building a Blog",
//             body: "This is the Body text",
//         },
//         {
//             title: "Demo1",
//             body: "This is the Body text",
//         },
//         {
//             title: "Demo1",
//             body: "This is the Body text",
//         },
//         {
//             title: "Demo1",
//             body: "This is the Body text",
//         }, 
//         {
//             title: "Demo1",
//             body: "This is the Body text",
//         }, 
//         {
//             title: "Demo1",
//             body: "This is the Body text",
//         }, 
//         {
//             title: "Demo1",
//             body: "This is the Body text",
//         },
//     ])
// }
// insertPostData();

module.exports = router;