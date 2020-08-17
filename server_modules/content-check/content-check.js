const ContentChecker = require('./ContentChecker');
const fs = require('fs');

module.exports = (options = {
  file: '',
  logFile: '',
}) => {
  if (options.file=='') {
    throw new Exception('No file specified');
  }
  let cc = new ContentChecker();
  cc.load(options.file);

  return {
    checkContent: (req, res, next) => {
      if (Object.keys(req.body).length>0) {
        let match = false;
        let keys = Object.keys(req.body);
        for (let i=0; i<keys.length; i++) {
          if (cc.matchesExactString(req.body[keys[i]])) {
            match = req.body[keys[i]];
            break;
          }
        }
        if (match) {
          const log = `[${new Date().toGMTString()}] bad word: ${match} from user ${req.session.email}\r\n`;
          if (options.logFile!=='') fs.appendFile(options.logFile, log, (err) => {
            if (err) console.error(err);
          });
          console.log(`bad word: ${match} from user ${req.session.email}`);;
          res.status(400).send('Bad word found, this incident has been reported');
        }
        else next('route');
      }
      else next('route');
    },
    load: (file) => {cc.load(file)},
    filterList: () => {return cc.filterList;},
    addWord: (word) => {cc.filterList['word']=true;},
    removeWord: (word) => {delete cc.filterList['word'];}
  };
};
