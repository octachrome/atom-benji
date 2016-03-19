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
      return chg + ':' + el;
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
}

Start = lines:Lines? { console.log(lines); }

Lines = line:Line rest:(CR Lines)? { return mkLines(line, rest); }

Line = indent:_ el:Element? _ { return checkIndent(indent, el); }

Element = Atom / Struct

Struct = Or

Atom = Dialog / Cmd

Or = "|" atom:Atom { return "Or[" + atom + "]"; }

Dialog = [<>] _ NCR+ { return "Dlg"; }
Cmd = ":" [a-zA-Z_]+ NCR* { return "Cmd"; }

_ = [ \t]*
CR = "\n" / "\r\n"
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
