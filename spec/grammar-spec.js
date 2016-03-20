var fs = require('fs');
var path = require('path');
var loophole = require('loophole');
var pegjs = require('pegjs');

function parse(filename) {
  var parserSrc = fs.readFileSync(path.join(__dirname, '..', 'lib', 'benji.pegjs'), 'utf8');
  var parser;
  loophole.allowUnsafeEval(function () {
    parser = pegjs.buildParser(parserSrc);
  });
  var fileSrc = fs.readFileSync(path.join(__dirname, filename), 'utf8');
  return parser.parse(fileSrc);
}

describe('Parser', function () {
  it('should parse equivalent scripts to the same tree', function () {
    var tree1 = parse('test1.benji');
    var tree2 = parse('test2.benji');
    expect(tree1).toEqual(tree2);
  });
});
