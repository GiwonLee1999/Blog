const express = require('express');
const router = express.Router();
const Post = require('../models/Post')
const User = require('../models/User')
const bcrypt = require('bcrypt'); // encrpt or decrypt
const jwt = require('jsonwebtoken'); // helps with cookie

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


/** 
 * Check Login
*/
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

/** 
 * Get
 * Admin - Login Page
*/
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Admin Blog NodeJs"
        }

        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

// /** 
//  * Get
//  * Admin - Check Login 
// */
// router.post('/admin', async (req, res) => {
//     try {

//         const { username, password } = req.body;
//         console.log(req.body);

//         res.redirect('/admin', { locals, layout: adminLayout });
//     } catch (error) {
//         console.log(error);
//     }
// });

/** 
 * Get
 * Admin - Check Login 
*/
router.post('/admin', async (req, res) => {
    try {

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            alert('User not Found');
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret)
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

/** 
 * Get
 * Admin - Dashboard
*/
router.get('/dashboard', authMiddleware, async (req, res) => {

    try {
        const data = await Post.find();
        const locals = {
            title: "Dashboard",
            description: "Simple Blog NodeJs"
        }
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        })
    }
    catch (error) {
        console.log(error);
    }

});


/** 
 * Get
 * Admin - Register 
*/
router.post('/register', async (req, res) => {
    try {
        // gets this from register form
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({
                username,
                password: hashedPassword
            });
            res.status(201).json({ message: 'User Created', user })
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use!' });
            }
            res.status(500).json({ message: 'Internal Server Error!' });
        }

    } catch (error) {
        console.log(error);
    }
});


/** 
 * Get
 * Admin - Create Post
*/
router.get('/add-post', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: "Add",
            description: "Simple Blog NodeJs"
        }


        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        })
    }
    catch (error) {
        console.log(error);
    }

});


/** 
 * Post
 * Admin - Create Post
*/
router.post('/add-post', authMiddleware, async (req, res) => {

    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard')
        } catch (error) {
            console.log(error);
        }
    }
    catch (error) {
        console.log(error);
    }

});

/** 
 * get
 * Admin - Edit Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: "Edit",
            description: "Admin Blog NodeJs"
        }
        const data = await Post.findOne({ _id: req.params.id });

        res.render(`admin/edit-post`, {
            data,
            locals,
            layout: adminLayout
        });
    }
    catch (error) {
        console.log(error);
    }

});

/** 
 * Put
 * Admin - Edit Post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {

    try {

        await Post.findByIdAndUpdate(req.params.id, ({
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        }))
        res.redirect(`/edit-post/${req.params.id}`);
    }
    catch (error) {
        console.log(error);
    }

});

/** 
 * Delete
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id })
        res.redirect('/dashboard');
    }
    catch (error) {
        console.log(error);
    }
});


/** 
 * Get
 * Admin - Logout
*/
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    // res.json({
    //     message: "Logout successful."
    // });
    res.redirect('/');
});


module.exports = router;