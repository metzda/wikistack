var mongoose = require('mongoose');
var marked = require('marked');
// Notice the `mongodb` protocol; Mongo is basically a kind of server,
// which handles database requests and sends responses. It's async!
mongoose.connect('mongodb://localhost/wikistack'); // <= db name will be 'wikistack'
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error:'));

var pageSchema = new mongoose.Schema({
    title: {type: String, required: true},
    urlTitle: {type: String, required: true},
    content: {type: String, required: true},
    status: {type: String, enum: ['open', 'closed']},
    tags: [{type: String}],
    date:     {type: Date, default: Date.now},
    author:   {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

pageSchema.virtual('route').get(function () {
  return '/wiki/' + this.urlTitle;
});

pageSchema.virtual('renderedContent').get(function() {
    return marked(this.content)
});

pageSchema.statics.findByTag = function(tag) {
    return this.find({ tags: { $elemMatch: {$eq: tag} } });
};

pageSchema.statics.findOrCreate = function(page, user) {
    return this.model('Page').findOne({title: page.title}).exec()
        .then(function(foundPage) {
            if (foundPage) {
                foundPage.content = page.content;
                foundPage.title = page.title;
                foundPage.status = page.status;
                foundPage.tags = page.tags;
                return foundPage.save();
            } else {
                return page.save();
            }
        });
};

pageSchema.methods.findSimilar = function(cb) {
    return this.model('Page').find({ tags: {$in: this.tags}, urlTitle: {$ne: this.urlTitle} });
};

pageSchema.pre('validate', function(next) {
    if (!this.title) {
        this.urlTitle = Math.random().toString(36).substring(2,7);
    }
    else
        this.urlTitle = this.title.replace(/\s+/g,'_').replace(/\W/g, '');
    
    next();
});

var userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true}
});

userSchema.statics.findOrCreate = function(user) {
    return this.model('User').findOne({email: user.email}).exec()
    .then(function(foundUser) {
        if (foundUser) {
            return foundUser;
        } else {
            var _user = new User({
                name: user.name,
                email: user.email
            });
            return _user.save();
        }
    });
};

var Page = mongoose.model('Page', pageSchema);
var User = mongoose.model('User', userSchema);


module.exports = {
    Page: Page,
    User: User
};