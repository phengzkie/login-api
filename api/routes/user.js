const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (user) {
                return res.status(409).json({
                    message: 'Email already exists'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User Signed Up'
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            })
                    }
                })
            }
        })
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Login Failed'
                    })
                }
                if (result) {
                    req.session.user = user;
                    return res.status(200).json({
                        message: 'Login Successful',
                        session: req.sessionID
                    })
                }
                res.status(401).json({
                    message: 'Login Failed'
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

router.get('/dashboard', (req, res, next) => {
    if (!req.session.user) {
        res.status(401).json({
            message: 'Session Failed'
        })
    }
    res.status(200).json({
        message: 'Welcome to user\'s page',
        sessionID: req.sessionID
    })
});

module.exports = router;
 