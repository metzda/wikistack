var router = require('express').Router();
var Promise = require('bluebird');
var models = require('../models'); 
var Page = models.Page;
var User = models.User;

module.exports = router;

router.get('/', function(req, res, next) {
    var allPages = Page.find().exec().then(function(pages) {
        res.render('index', {pages: pages});
    });
});

router.post('/', function(req, res, next) {
    var user = new User({
        name: req.body.name,
        email: req.body.email
    });
    
    User.findOrCreate(user)
        .then(function(user) {
            var page = new Page({
                title: req.body.title,
                content: req.body.content,
                status: req.body.status,
                tags: req.body.tags.split(' '),
                author: user._id
            });
            return Page.findOrCreate(page, user);
        })
        .then(function(savedPage) {
            res.redirect(savedPage.route);
        })
        .catch(function(err) {
            res.render('error', {message: err.message, error: err});
        });
    
});

router.get('/add', function(req, res) {
    res.render('addpage');
});

router.get('/users', function(req, res, next) {
    User.find().exec().then(function(users) {
        res.render('users', {users: users});
    });
});

router.get('/users/:id', function(req, res, next) {
    var userPromise = User.findById(req.params.id).exec();
    var pagesPromise = Page.find({author: req.params.id}).exec()
    
    Promise.join(userPromise, pagesPromise, function(user, pages) {
        res.render('user', {pages: pages, user: user});
        })
        .catch(next);
});

router.get('/search', function(req, res) {
    Page.findByTag(req.query.tag).then(function(foundPages) {
        res.render('tagsearch', {pages: foundPages, tag: req.query.tag});
    });
});

router.get('/:urlTitle', function(req, res, next) {
    var authoredPage = Page.findOne({urlTitle: req.params.urlTitle})
    //console.log(authoredPage);
        .populate('author')
        .exec()
        .then(function(foundPage) {
            console.log(foundPage);
            res.render('wikipage', foundPage);
        })
        .catch(next);
});

router.get('/:urlTitle/similar', function(req, res, next) {
    Page.findOne( {urlTitle: req.params.urlTitle} )
        .then(function(page) {
            return page.findSimilar().exec();
    }).then(function(similarPages) {
        res.render('index', {pages: similarPages});
    }).catch(next);
});

router.get('/:urlTitle/delete', function(req, res, next) {
    Page.findOne( {urlTitle: req.params.urlTitle} )
        .then(function(page) {
            return page.remove();
        })
        .then(function(removedPage) {
            res.redirect('/');
        })
        .catch(next);
});

router.get('/:urlTitle/edit', function(req, res, next) {
    Page.findOne( {urlTitle: req.params.urlTitle} )
        .populate('author')
        .then(function(page) {
            res.render('addpage', page);
        })
        .catch(next);
});