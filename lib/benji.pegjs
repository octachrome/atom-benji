{
  var indentStack = [];

  function checkIndent(indent, wrapper) {
    if (wrapper) {
      var i = indent.length;
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
        wrapper.indent++;
      }
      else {
        while (indentStack[indentStack.length-1] !== i) {
          wrapper.indent--;
          indentStack.pop();
          if (indentStack.length === 0) {
            error('Unexpected indent.');
          }
        }
      }
    }
    return wrapper;
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

  function mkTree(wrappers) {
    var cur = new Seq();
    var stack = [cur];

    for (var i = 0; i < wrappers.length; i++) {
      var wrapper = wrappers[i];
      var contents = wrapper.contents;
      var next;

      if (wrapper.indent === 0) {
        if (wrapper.option && !(cur instanceof Choice)) {
          next = new Choice();
          stack.push(next);

          if (cur.children.length) {
            next.children.push(cur.children.pop());
          }

          cur.children.push(next);
          cur = next;
        }
        else if (!wrapper.option && (cur instanceof Choice)) {
          stack.pop();
          cur = stack[stack.length-1];
        }
        cur.children.push(contents);
      }
      else if (wrapper.indent === 1) {
        next = new Seq();
        stack.push(next);

        if (cur.children.length) {
          next.children.push(cur.children.pop());
        }

        cur.children.push(next);
        cur = next;

        if (wrapper.option) {
          next = new Choice();
          stack.push(next);
          cur.children.push(next);
          cur = next;
        }
        cur.children.push(contents);
      }
      else if (wrapper.indent < 0) {
        var indent = wrapper.indent;
        while (indent < 0) {
          if (!(cur instanceof Choice)) {
            indent++;
          }
          stack.pop();
          cur = stack[stack.length-1];
        }

        if (wrapper.option && !(cur instanceof Choice)) {
          next = new Choice();
          stack.push(next);

          if (cur.children.length) {
            next.children.push(cur.children.pop());
          }

          cur.children.push(next);
          cur = next;
        }
        else if (!wrapper.option && (cur instanceof Choice)) {
          stack.pop();
          cur = stack[stack.length-1];
        }
        cur.children.push(contents);
      }
      else {
        throw new Error('Illegal indent: ' + wrapper.indent);
      }
    }
    return stack[0];
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

  function Cmd(chars) {
    this.type = 'Cmd';
    this.cmd = chars.join('');
  }

  function Dialog(chars) {
    this.type = 'Dialog';
    this.dialog = chars.join('');
  }

  function Wrapper(contents) {
    this.contents = contents;
    this.indent = 0;

    this.setOption = function () {
      this.option = true;
      return this;
    }
  }

  function Seq() {
    this.type = 'Seq';
    this.children = [];
  }

  function Choice() {
    this.type = 'Choice';
    this.children = [];
  }
}

// An empty script or a set of lines
Start = wrappers:Lines? { console.log(JSON.stringify(simplify(mkTree(wrappers)), null, 2)); }

// One or more line, separated by a line ending character
Lines = wrapper:Line rest:(CR Lines)? { return mkLines(wrapper, rest); }

// A line, which may be blank or contain a script element
Line = indent:_ wrapper:Element? _ { return checkIndent(indent, wrapper); }

Element = Simple / Struct

// Structural elements
Struct = Option

// Simple elements
Simple = dlg:Dialog / cmd:Cmd

// An option that forms part of a choice between several elements
Option = "|" wrapper:Simple { return wrapper.setOption(); }

// A piece of dialog
Dialog = [<>] _ chars:NCR+ { return new Wrapper(new Dialog(chars)); }

// A command
Cmd = ":" chars:[a-zA-Z_]+ NCR* { return new Wrapper(new Cmd(chars)); }

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