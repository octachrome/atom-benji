// "activationCommands": {
//   "atom-workspace": "atom-benji:toggle"
// },

var parser;

module.exports = {
  activate: function () {
    console.log('activate');
    require('atom-package-deps').install('atom-benji');
  },

  deactivate: function () {
    console.log('deactivate');
  },

  toggle: function () {
    console.log('toggle');
  },

  provideLinter: function () {
    console.log('provideLinter');
    return {
      name: 'Benji',
      grammarScopes: ['text.plain.null-grammar'],
      scope: 'file',
      lintOnFly: true,
      lint: function (textEditor) {
        var filePath = textEditor.getPath();
        console.log('lint');
        if (!/\.benji$/.test(filePath)) {
          return [];
        }

        return Promise.resolve().then(function () {
          if (parser) {
            return parser;
          }
          else {
            var PATH = require('path');
            var FS = require('fs');
            var PEG = require('pegjs');
            var LH = require('loophole');
            var packagePath = atom.packages.getActivePackage('atom-benji').path;

            return new Promise(function (resolve, reject) {
              FS.readFile(PATH.join(packagePath, 'lib', 'benji.pegjs'), 'utf8', function (err, grammar) {
                if (err) {
                  reject(err);
                }
                else {
                  LH.allowUnsafeEval(function () {
                    parser = PEG.buildParser(grammar);
                  });
                  resolve();
                }
              });
            });
          }
        }).then(function () {
          var results = [];

          var fileContents = textEditor.getText();
          try {
            parser.parse(fileContents);
          } catch (err) {
            console.log(err);
            if (!err.location) {
              throw err;
            }
            results.push({
              type: 'Error',
              text: err.message,
              filePath: textEditor.getPath(),
              range: [
                [err.location.start.line - 1, err.location.start.column],
                [err.location.end.line - 1, err.location.end.column]
              ]
            });
          }

          return results;
        });
      }
    };
  },

  consumeAutoreload: function (reloader) {
    reloader({
      pkg: "atom-benji",
      files: ["package.json"],
      folders: ["lib/"]
    });
  }
};
