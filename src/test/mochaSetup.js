const Module = require('module');
const originalRequire = Module.prototype.require;

class Position {
  constructor(line, character) {
    this.line = line;
    this.character = character;
  }
  compareTo(other) {
    if (this.line !== other.line) return this.line - other.line;
    return this.character - other.character;
  }
  isEqual(other) {
    return this.line === other.line && this.character === other.character;
  }
}

class Range {
  constructor(startOrStartLine, endOrStartChar, endLine, endChar) {
    if (startOrStartLine instanceof Position && endOrStartChar instanceof Position) {
      this.start = startOrStartLine;
      this.end = endOrStartChar;
    } else if (typeof startOrStartLine === 'number') {
      this.start = new Position(startOrStartLine, endOrStartChar);
      this.end = new Position(endLine, endChar);
    }
  }
  contains(positionOrRange) {
    if (positionOrRange instanceof Position) {
      if (positionOrRange.line < this.start.line || positionOrRange.line > this.end.line) return false;
      if (positionOrRange.line === this.start.line && positionOrRange.character < this.start.character) return false;
      if (positionOrRange.line === this.end.line && positionOrRange.character > this.end.character) return false;
      return true;
    }
    return false;
  }
}

class Uri {
  constructor(scheme, authority, path, query, fragment) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
    this.fsPath = path;
  }
  static file(path) {
    return new Uri('file', '', path, '', '');
  }
  toString() {
    return `file://${this.path}`;
  }
}

class TextEdit {
  constructor(range, newText) {
    this.range = range;
    this.newText = newText;
  }
  static delete(range) {
    return new TextEdit(range, '');
  }
  static replace(range, newText) {
    return new TextEdit(range, newText);
  }
}

class WorkspaceEdit {
  constructor() {
    this.edits = [];
  }
  replace(uri, range, newText) {
    this.edits.push({ uri, range, newText });
  }
  delete(uri, range) {
    this.edits.push({ uri, range, newText: '' });
  }
}

class CodeAction {
  constructor(title, kind) {
    this.title = title;
    this.kind = kind;
  }
}

const vscodeMock = {
  Position,
  Range,
  Uri,
  TextEdit,
  WorkspaceEdit,
  CodeAction,
  CodeActionKind: {
    QuickFix: 'quickfix'
  },
  ProgressLocation: {
    Notification: 15
  },
  window: {
    createOutputChannel: () => ({
      appendLine: () => {},
      show: () => {},
      dispose: () => {}
    }),
    showInformationMessage: async () => {},
    showWarningMessage: async () => {},
    showErrorMessage: async () => {}
  },
  workspace: {
    getConfiguration: () => ({
      get: (key, defaultValue) => defaultValue
    })
  }
};

Module.prototype.require = function (request) {
  if (request === 'vscode') {
    return vscodeMock;
  }
  return originalRequire.apply(this, arguments);
};
