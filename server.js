const express = require('express');
const sanitizer = require('express-sanitizer');
const validator = require('express-validator');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid');
const router = express.Router();
const app = module.exports = express();

const {jwtVerify, jwtRefresh, jwtIssue} = require('./server_modules/jwt')

app.use(cookieParser());

const sessionStore = process.env.DEBUG!=='true' ? new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
}) : new session.MemoryStore();

app.use(session({
  genid: (req) => {
    return uuidv4();
  },
  secret: 'this is the secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 10000,
    sameSite: 'strict',
    /*secure: true, only when https is enabled*/
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

router.post('/register')

router.get('/auth/*', jwtVerify);

router.post('/auth/*', jwtVerify);

app.use('/', router);

app.use('/', (req, res) => {
  res.status(404).send('Page not found');
})

app.use('/', (err, req, res) => {
  console.log(err);
  res.status(500).send('Something broke');
})

app.listen(process.env.PORT, (err) => {
  if (err) console.log(err);
  console.log(`Starting server on ${process.env.PORT} with DEBUG=${process.env.DEBUG}`)
});
