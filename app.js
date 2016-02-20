var express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  app = express(),
  swig = require('swig'),
  routes = require('./routes');


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
app.use('/', routes);
app.use(express.static('./public'));

var server = app.listen(3000, function() {
  console.log('Listening on port 3000');
});
