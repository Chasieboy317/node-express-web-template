const express = require('express');
const validator = require('express-validator');
const router = express.Router();
const path = require('path');
const root = require('../root');

const {jwtVerify, jwtRefresh, jwtIssue} = require('./jwt');
const {checkContent, load, filterList, addWord, removeWord} = require('./content-check/content-check')({
  file: path.join(__dirname, '/content-check/naughty-words.txt'),
  logFile: 'content-check-logs.txt'
});
//const contentChecker = require('./content-check/content-check');
/*const {checkContent, load, filterList, addWord, removeWord} = contentChecker({
  file: 'content-check/naughty-words.txt',
  logFile: '../logs/content-check-events'
});*/

router.post('/', checkContent);

router.get('/', (req, res) => {
  if (!req.session.count) req.session.count=1;
  else ++req.session.count;
  res.send(JSON.stringify({
    connect_sid: req.cookies["connect.sid"],
    session_id: req.sessionID,
    count: req.session.count,
    secret: req.session.secret,
    jwt: req.cookies["jwt"]
  }));
});

router.post('/login', (req, res, next) => {
  let {email, password} = req.body;
  req.sanitize(email);
  req.sanitize(password);
  validator.isEmail(email);
  //fetch db stuff
  //check if user exists
  //hash pass
  //compare hashes
  res.cookie('email', 'emailhere@email.com', {path: '/', maxAge: 1000*60*60});
  next();
},
jwtIssue,
(req, res, next) => {
  res.send(`logged in ${req.cookies['token']}`);
});

router.post('/register');

router.post('/upload', (req, res) => {
  //add method for handling extensions
  if (!req.files || Object.keys(req.files).length===0) {
    //in the future throw an error here and have the error middleware handle it
    return res.status(400).send('No files were uploaded');
  }

  let _file = req.files._file;

  _file.mv(`${path.join(root, 'uploads', _file.name)}`, (err) => {
    if (err) return res.status(500).send(err);
    res.send('SUCCESS');
  })
});


router.get('/auth/*', jwtVerify);

router.post('/auth/*', jwtVerify);

router.get('/image', (req, res) => {
  res.send(`<img src="/assets/img.jpg">`);
})

module.exports = router;
