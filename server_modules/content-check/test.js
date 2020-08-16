const ContentChecker = require('./content-checker');
let cc = new ContentChecker();
cc.load('./naughty-words.txt');
console.log(cc.filterList);

class Test {
  constructor(testString, contentChecker, expectedResult) {
    this.testString = testString;
    this.contentChecker = contentChecker;
    this.expectedResult = expectedResult;
  }

  run() {
    let result;
    if (this.contentChecker.matchesExactString(this.testString)) result='MATCH';
    else result = 'NO MATCH';
    return result===this.expectedResult ? 'PASSED' : 'FAILED';
  }
}

let t1 = new Test('I am a nigger', cc, 'MATCH');
let t2 = new Test('I am no Nigger', cc, 'MATCH');
let t3 = new Test('You are a k@ff3r', cc, 'MATCH');
let t4 = new Test('clean content Here', cc, 'NO MATCH');

console.log(t1.run());
console.log(t2.run());
console.log(t3.run());
console.log(t4.run());
