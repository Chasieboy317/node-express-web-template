const fs = require('fs');
module.exports = class ContentChecker {
  constructor() {
    this.filterList = {};
  }

  getFilterList() {
    return this.filterList;
  }

  setFilterList(newFilterList) {
    this.filterList = newFilterList;
  }

  load(file) {
    this.filterList = {};
    const words = fs.readFileSync(file, {encoding: 'utf8', flag: 'r'}).split('\r\n');
    words.forEach(word => {
      this.filterList[word] = true;
    });
  }

  matchesExactString(string) {
    const words = string.split(' ');
    for(let i=0; i<words.length; i++) {
      if (this.filterList[words[i].toLowerCase()]) return true;
    }
    return false;
  }

  matchesString(string) {
    //method should use regex to match
  }
}
