const express = require('express');
const sanitizer = require('express-sanitizer');
const validator = require('express-validator');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
const router = express.Router();
const app = module.exports = express();

//jwt params
const jwtKey = 'jwtkey';
const jwtExpireSeconds = 3600;

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

router.get('/login', (req, res) => {
  //serve login page
});

router.post('/login', (req, res) => {
  let {email, password} = req.body;
  req.sanitize(email);
  req.sanitize(password);
  validator.isEmail(email);
  //fetch db stuff
  //check if user exists
  //hash pass
  //compare hashes
  const token = jwt.sign({email}, jwtKey, {
    algorithm: 'HS256',
    expiresIn: jwtExpireSeconds
  });

  res.cookies('token', token, {path: '/auth', maxAge: jwtExpireSeconds*1000});
  res.end();
});

router.post('/register')

const jwtVerify = (req, res) => {
  const token = req.cookies['token'];
  if (!token) return res.status(401).end();

  let payload;
  try {
    payload = jwt.verify(token, jwtKey);
  }
  catch(e) {
    if (e instanceof jwt.JsonWebTokenError) return res.status(401).end();
    else return res.status(400).end();
  }

  res.send('verified');
}

const jwtRefresh = (req, res) => {
  const token = req.cookies['token'];
  if (!token) return res.status(401).end();

  let payload;
  try {
    payload = jwt.verify(token, jwtKey);
  }
  catch(e) {
    if (e instanceof jwt.JsonWebTokenError) return res.status(401).end();
    else return res.status(400).end();
  }

  const now = Math.round(Number(new Date())/1000);
  if (payload.exp-now>30) {
    return res.status(400).end();
  }

  const newToken = jwt.sign({email: payload.email}, jwtKey, {
    algorithm: 'HS256',
    expiresIn: jwtExpireSeconds
  });

  res.cookies('token', newToken, {maxAge: jwtExpireSeconds});
  res.end();
}

router.get('/auth/*', (req, res) => {
  res.send('authorizing get request');
});

router.post('/auth/*', (req, res, next) => {
  console.log('authorizing post request');
  if (true) next('route');
});

router.post('/auth/post_comment', (req, res) => {
  res.send('authorized');
});

app.use('/', router);

app.listen(process.env.PORT, (err) => {
  if (err) console.log(err);
  console.log(`Starting server on ${process.env.PORT} with DEBUG=${process.env.DEBUG}`)
});
