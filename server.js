const express = require('express');
const sanitizer = require('express-sanitizer');
const validator = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const router = express.Router();
const app = module.exports = express();

app.use(cookieParser());

app.use(session({
  secret: 'this is the secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 10000
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(sanitizer());

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

router.get('/login', (req, res) => {
  //serve login page
});

router.post('/login', (req, res) => {
  req.sanitize(req.body.email);
  req.sanitize(req.body.password);
  validator.isEmail(req.body.email);
  //login function in auth should take care of the rest
});

ro

app.use('/', router);

app.listen(3000, (err) => {
  if (err) console.log(err);
  console.log('listening on port 3000');
});
