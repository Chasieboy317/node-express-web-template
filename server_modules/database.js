const QueryBuilder = require('node-querybuilder');

const dbSettings = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
}

const query = new QueryBuilder(dbSettings, 'mysql');

exports.getPass = async (email) => {
  return await new Promise((resolve, reject) => {
    query.select(['salt', 'pass']).
    where('email', email).
    limit(1).
    get('users', (err, results) => {
      console.log(result);
      if (err) reject({statusCode:600, message: err});
      else resolve(results[0]);
    });
  });
}
