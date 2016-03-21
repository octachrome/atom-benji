var fs = require('fs');
var path = require('path');
var parseTools = require('../lib/parse-tools');

function parse(filename) {
  var fileSrc = fs.readFileSync(path.join(__dirname, filename), 'utf8');
  var root = parseTools.createParser().parse(fileSrc);
  return parseTools.simplify(root);
}

describe('Parser', function () {
  it('should parse a reasonable script to the correct tree', function () {
    var tree = parse('test1.benji');
    expect(JSON.stringify(tree, null, 2)).toEqual(expectedJson());
  });

  it('should parse a script with leading choice terms to the correct tree', function () {
    var tree = parse('test2.benji');
    expect(JSON.stringify(tree, null, 2)).toEqual(expectedJson());
  });
});

function expectedJson() {
  return JSON.stringify({
    "type": "Seq",
    "children": [
      {
        "type": "Choice",
        "children": [
          {
            "type": "Dialog",
            "dialog": "Hi mum."
          },
          {
            "type": "Dialog",
            "dialog": "Hello mum"
          },
          {
            "type": "Dialog",
            "dialog": "Hi mummy."
          },
          {
            "type": "Dialog",
            "dialog": "Hello mother."
          }
        ]
      },
      {
        "type": "Choice",
        "children": [
          {
            "type": "Dialog",
            "dialog": "Benji? Oh hello dear!"
          },
          {
            "type": "Dialog",
            "dialog": "Hello Benji!"
          },
          {
            "type": "Dialog",
            "dialog": "Hello sweetheart."
          },
          {
            "type": "Seq",
            "children": [
              {
                "type": "Dialog",
                "dialog": "Hello Kevin."
              },
              {
                "type": "Dialog",
                "dialog": "It's Benji."
              },
              {
                "type": "Dialog",
                "dialog": "Oh, hello Benji dear!"
              }
            ]
          }
        ]
      },
      {
        "type": "Choice",
        "children": [
          {
            "type": "Dialog",
            "dialog": "How are you doing?"
          },
          {
            "type": "Dialog",
            "dialog": "How are things?"
          },
          {
            "type": "Dialog",
            "dialog": "How are you feeling?"
          }
        ]
      },
      {
        "type": "Choice",
        "children": [
          {
            "type": "Dialog",
            "dialog": "Oh, okay dear. Can't complain!"
          },
          {
            "type": "Seq",
            "children": [
              {
                "type": "Dialog",
                "dialog": "Well, the goblins have been causing trouble in the garden again!"
              },
              {
                "type": "Choice",
                "children": [
                  {
                    "type": "Seq",
                    "children": [
                      {
                        "type": "Dialog",
                        "dialog": "Oh no! I should bring Torpedo along to scare them off."
                      },
                      {
                        "type": "Choice",
                        "children": [
                          {
                            "type": "Dialog",
                            "dialog": "Good idea sweetheart!"
                          },
                          {
                            "type": "Dialog",
                            "dialog": "Yes!"
                          },
                          {
                            "type": "Seq",
                            "children": [
                              {
                                "type": "Dialog",
                                "dialog": "Are goblins scared of cats?"
                              },
                              {
                                "type": "Dialog",
                                "dialog": "I have no idea."
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "Dialog",
                    "dialog": "Oh! Those tykes!"
                  },
                  {
                    "type": "Dialog",
                    "dialog": "You should try to catch one! It may have useful information."
                  }
                ]
              }
            ]
          },
          {
            "type": "Dialog",
            "dialog": "Ooh, I'm feeling a bit confused today"
          },
          {
            "type": "Seq",
            "children": [
              {
                "type": "Dialog",
                "dialog": "A little bit sleepy, my dear."
              },
              {
                "type": "Dialog",
                "dialog": "Ok, I won't keep you up too long then!"
              }
            ]
          },
          {
            "type": "Seq",
            "children": [
              {
                "type": "Dialog",
                "dialog": "Okay, but I think Gladys might be trying to poison me!"
              },
              {
                "type": "Choice",
                "children": [
                  {
                    "type": "Dialog",
                    "dialog": "Oh, she doesn't seem the type, mum!"
                  },
                  {
                    "type": "Dialog",
                    "dialog": "You must stay vigilant!"
                  }
                ]
              }
            ]
          },
          {
            "type": "Seq",
            "children": [
              {
                "type": "Dialog",
                "dialog": "I have a funny feeling we're being watched..."
              },
              {
                "type": "Cmd",
                "cmd": "maybe",
                "args": [
                  "10"
                ],
                "child": {
                  "type": "Seq",
                  "children": [
                    {
                      "type": "Cmd",
                      "cmd": "repeat_for",
                      "args": [
                        false,
                        "3",
                        "sec"
                      ],
                      "child": {
                        "type": "Cmd",
                        "cmd": "play",
                        "args": [
                          "none"
                        ]
                      }
                    },
                    {
                      "type": "Choice",
                      "children": [
                        {
                          "type": "Dialog",
                          "dialog": "Oh mum! There's no-one watching us!"
                        },
                        {
                          "type": "Dialog",
                          "dialog": "You know… You may be right?"
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          {
            "type": "Seq",
            "children": [
              {
                "type": "Dialog",
                "dialog": "My head hurts!"
              },
              {
                "type": "Dialog",
                "dialog": "Oh! Let me get you some medicine."
              }
            ]
          },
          {
            "type": "Seq",
            "children": [
              {
                "type": "Dialog",
                "dialog": "I'm feeling vaguely disappointed."
              },
              {
                "type": "Dialog",
                "dialog": "Oh dear. I'm sorry to hear that."
              }
            ]
          }
        ]
      }
    ]
  }, null, 2);
}
