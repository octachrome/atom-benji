var fs = require('fs');
var path = require('path');
var loophole = require('loophole');
var pegjs = require('pegjs');

function createParser(filename) {
  var parserSrc = fs.readFileSync(path.join(__dirname, 'benji.pegjs'), 'utf8');
  var parser;
  loophole.allowUnsafeEval(function () {
    parser = pegjs.buildParser(parserSrc);
  });
  parser.simplify = simplify;
  return parser;
}

function simplify(node) {
  if (!node.children) {
    return node;
  }
  else if (node.children.length === 1) {
    return simplify(node.children[0]);
  }
  else {
    node.children = node.children.map(simplify);
    return node;
  }
}

module.exports = {
  createParser: createParser,
  simplify: simplify
};
