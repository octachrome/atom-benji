{
  var indentStack = [];

  function checkIndent(indent, el) {
    if (el) {
      var i = indent.length;
      var chg = 0;
      if (indentStack.length === 0) {
        if (i !== 0) {
          // First line cannot be indented.
          error('Unexpected indent.');
        }
        else {
          indentStack = [0];
        }
      }
      else if (i > indentStack[indentStack.length-1]) {
        indentStack.push(i);
        chg++;
      }
      else {
        while (indentStack[indentStack.length-1] !== i) {
          chg--;
          indentStack.pop();
          if (indentStack.length === 0) {
            error('Unexpected indent.');
          }
        }
      }
      return [chg, el];
    }
    else {
      return null;
    }
  }

  function mkLines(line, rest) {
    // line may be null, if this is a blank line
    // rest[0] is CR, rest[1] is the other lines
    var lines = rest && rest[1] || [];
    if (line) {
      return [line].concat(lines);
    }
    else {
      return lines;
    }
  }

  function mkChoice(simple) {
    return {
      type: 'Choice',
      children: simple
    };
  }

  function mkCmd(chars) {
    return {
      type: 'Cmd',
      cmd: chars.join('')
    };
  }

  function mkDialog(chars) {
    return {
      type: 'Dialog',
      dialog: chars.join('')
    };
  }
}

// An empty script or a set of lines
Start = lines:Lines? { console.log(JSON.stringify(lines, null, 2)); }

// One or more line, separated by a line ending character
Lines = line:Line rest:(CR Lines)? { return mkLines(line, rest); }

// A line, which may be blank or contain a script element
Line = indent:_ el:Element? _ { return checkIndent(indent, el); }

Element = Simple / Struct

// Structural elements
Struct = Choice

// Simple elements
Simple = Dialog / Cmd

// A choice between several elements
Choice = "|" simple:Simple { return mkChoice(simple); }

// A piece of dialog
Dialog = [<>] _ chars:NCR+ { return mkDialog(chars); }

// A command
Cmd = ":" chars:[a-zA-Z_]+ NCR* { return mkCmd(chars); }

// Whitespace, but not line endings
_ = [ \t]*
// Line endings
CR = "\n" / "\r\n"
// Everything except line endings
NCR = [^\r\n]


/*
> Hi mum.
|> Hello mum
|> Hi mummy.
|> Hello mother.
< Benji? Oh hello dear!
|< Hello Benji!
|< Hello sweetheart.
|< Hello Kevin.
    > It's Benji.
    < Oh, hello Benji dear!

Seq
 Choice
  Dialog: Hi mum
  Dialog: Hi mum
 Choice
  Dialog: Benji? Oh hello
  Seq
   Dialog: Hello Kevin.
*/
