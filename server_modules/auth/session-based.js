const bc = require('bcrypt');
const md5 = require('md5');
const errors = require('../exceptions');
const db = require('../database');

exports.checkAuth = (req, res, next) => {
  if ((req.cookies["token"]==req.session.token) && req.cookies.["connect.sid"]) next();
  else throw errors.error_401;
}

exports.checkAuthorization = (req, res, next, role) => {
  if (role==req.session.required) next();
  else throw errors.error_403;
}

exports.handleLogin = async (req, res, next) => {
  if (req.session.user||req.session.token) res.redirect(302, '/auth/dashboard');
  else {
    const email = req.sanitize(req.body.email);
    const pass = req.sanitize(req.body.password);

    const ps = await db.getPass(email);
    bc.hash(pass, ps.salt, (err, hash) => {
      if (err) throw {status: 500, message: err}
      if (hash==ps.pass) {
        const token = md5(`${new Date().getTime()}${ps.salt}${email}`);
        req.session.user = email;
        req.session.token = token;
        res.cookie('token', token, {
          path: '/auth',
          maxAge: 1000*60*60,
          httpOnly: true,
          sameSite: true,
          secure: process.env.USE_HTTPS==='true'
        });
        next();
      }
    });
  }
}

exports.handleLogout = async(req, res, next) => {
  if (!req.session.user||!req.session.token) res.redirect(302, '/auth/login');
  else {
    req.session = {};
    res.clearCookie('token');
    res.redirect('/');
  }
}
