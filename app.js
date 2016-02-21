var express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  app = express(),
  swig = require('swig'),
  //routes = require('./routes'),
  wikiRouter = require('./routes/wiki');

require('./filters')(swig);

app.set('views', './views');
app.set('view engine', 'html');
app.engine('html', swig.renderFile);
swig.setDefaults({
  cache: false
});

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.get('/', function(req, res) {
    res.redirect('/wiki');
});
//app.use('/', routes);
app.use('/wiki', wikiRouter);

app.use(express.static('./public'));

var server = app.listen(3000, function() {
  console.log('Listening on port 3000');
});
