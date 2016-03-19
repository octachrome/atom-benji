{
  var indentStack = [];

  function checkIndent(indent, el) {
    if (el) {
      var i = indent.length;
      if (i === 0) {
        indentStack = [0];
      }
      else if (indentStack.length === 0) {
        // First line cannot be indented.
        error('Unexpected indent.');
      }
      else if (i > indentStack[indentStack.length-1]) {
        indentStack.push(i);
      }
      else {
        while (indentStack[indentStack.length-1] !== i) {
          indentStack.pop();
          if (indentStack.length === 0) {
            error('Unexpected indent.');
          }
        }
      }
    }
  }
}

Start = Lines?

Lines = Line (CR Lines)?

Line = (indent:_ el:Element? _) {return checkIndent(indent, el);}

Element = (Atom / Struct) {return true;}

Struct = Or

Atom = Dialog / Cmd

Or = "|" Atom

Dialog = [<>] _ NCR+
Cmd = ":" [a-zA-Z_]+ NCR*

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
