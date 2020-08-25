const express = require('express');
const sanitizer = require('express-sanitizer');
const session = require('express-session');
const fileupload = require('express-fileupload');
const MySQLStore = require('express-mysql-session')(session);

const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const {v4: uuidv4} = require('uuid');
const app = module.exports = express();

const routes = require('./server_modules/routes.js');
const {jwtVerify} = require('./server_modules/jwt');

app.post('/upload', fileupload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, "tmp"),
  responseOnLimit: "OMG its so big",
  debug: process.env.DEBUG === 'true'
}));
app.use(cookieParser());
app.use(helmet());

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
  secret: process.env.SESSION_SECRET||'session secret',
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

app.use('/assets', jwtVerify, express.static(path.join(__dirname, 'assets')));

//app.user('/uploads', jwtVerify, express.static(path.join(__dirname, 'uploads')));

app.use('/', express.static(`${path.join(__dirname, 'public')}`));


app.use('/', routes);

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
