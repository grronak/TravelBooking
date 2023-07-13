
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
var con=require('./connectivity');

// Parse request bodies as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'static')));
app.use('/',require('./route'));

app.listen(3000, () => {
  console.log('Server is listening on http://localhost:3000');
});

