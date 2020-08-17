const jwt = require('jsonwebtoken');
const jwtKey = process.env.jwtKey || 'secret jwt key';
const jwtExpireSeconds = process.env.jwtExpireSeconds || 3600;

module.exports = {
  jwtVerify: (req, res, next) => {
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

    next('route');
  },
  jwtRefresh: (req, res, next) => {
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

    res.cookie('token', newToken, {maxAge: jwtExpireSeconds*1000});
    next('route');
  },
  jwtIssue: (req, res, next) => {
    const token = jwt.sign({email: req.cookies['email']}, jwtKey, {
      algorithm: 'HS256',
      expiresIn: jwtExpireSeconds
    });

    res.cookie('token', token, {maxAge: jwtExpireSeconds*1000});

    next();
  }
};
