const express = require('express');
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user');
const auth = require('../middleware/auth')

const router = new express.Router();

// sign up
router.post('/users', async (req, res) => {
    console.log(req.body);

    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

//login
router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
        console.log(error);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowUpdates = ["name", "email", "age", "password"]
    const isValidOperation = updates.every((updates) => allowUpdates.includes(updates))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Update" })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save();

        res.send(req.user)
    } catch (error) {
        res.status(500).send(error);
        console.log(error)
    }
})

const updaload = new multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('error'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, updaload.single('upload'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;

    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar', async (req, res) => {

    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw Error("Avatar Not found")
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();

    }
    res.send();
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(user)
    } catch (error) {
        res.status(500).send(error);
    }
})



module.exports = router;