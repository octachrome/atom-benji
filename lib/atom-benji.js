// "activationCommands": {
//   "atom-workspace": "atom-benji:toggle"
// },

var PORT = 8311;
var loophole = require('loophole');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var shell = require('shell');

var CompositeDisposable = require('atom').CompositeDisposable;
var benjiServer;
loophole.allowUnsafeEval(function () {
  benjiServer = require('bengine');
});

var parser;

function doPreview(animPath, scriptPath) {
  benjiServer.startServer(animPath, scriptPath).then(function (url) {
    if (process.platform === 'win32') {
      shell.openExternal(url);
    }
    else if (process.platform === 'linux') {
      exec('xdg-open "' + url + '"');
    }
    else if (process.platform === 'darwin') {
      exec('open "' + url + '"');
    }
  });
}

module.exports = {
  activate: function () {
    console.log('activate');
    require('atom-package-deps').install('atom-benji');

    var self = this;
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor', 'atom-benji:preview', function (event) {
      self.preview(event, this);
    }));
  },

  deactivate: function () {
    console.log('deactivate');
    this.subscriptions.dispose();
    benjiServer.stopServer();
  },

  preview: function (event, editor) {
    var scriptPath = editor.getModel().getPath();
    var animPath = scriptPath;
    while (path.resolve(animPath, '..') !== animPath) {
      animPath = path.resolve(animPath, '..');
      if (fs.existsSync(path.join(animPath, 'anim'))) {
        doPreview(path.join(animPath, 'anim'), scriptPath);
        return;
      }
    }
    alert('Could not find anim folder.');
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

        if (!parser) {
          var parseTools = require('./parse-tools');
          parser = parseTools.createParser();
        }

        var results = [];

        var fileContents = textEditor.getText();
        try {
          var root = parser.parse(fileContents);
          // console.log(JSON.stringify(parser.simplify(root), null, 2));
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
