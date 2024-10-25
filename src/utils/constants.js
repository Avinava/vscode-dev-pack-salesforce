const EXTENSION_NAME = "Dev Pack for Salesforce";
const APEX_SETTINGS = {
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.detectIndentation": false,
  "editor.tabSize": 2,
};

const JAVASCRIPT_SETTINGS = {
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.detectIndentation": false,
  "editor.tabSize": 2,
};

const BETTER_COMMENTS_TAG = [
  {
    tag: "!",
    color: "#FF2D00",
    strikethrough: false,
    underline: false,
    backgroundColor: "transparent",
    bold: false,
    italic: false,
  },
  {
    tag: "?",
    color: "#3498DB",
    strikethrough: false,
    underline: false,
    backgroundColor: "transparent",
    bold: false,
    italic: false,
  },
  {
    tag: "//",
    color: "#474747",
    strikethrough: true,
    underline: false,
    backgroundColor: "transparent",
    bold: false,
    italic: false,
  },
  {
    tag: "todo",
    color: "#FF8C00",
    strikethrough: false,
    underline: false,
    backgroundColor: "transparent",
    bold: false,
    italic: false,
  },
  {
    tag: "*",
    color: "#98C379",
    strikethrough: false,
    underline: false,
    backgroundColor: "transparent",
    bold: false,
    italic: false,
  },
  {
    tag: "note",
    color: "#FFD700",
    strikethrough: false,
    underline: false,
    backgroundColor: "transparent",
    bold: false,
    italic: false,
  },
  {
    tag: ">",
    color: "#FFD700",
    strikethrough: false,
    underline: false,
    backgroundColor: "transparent",
    bold: false,
    italic: false,
  },
  {
    tag: "fixme",
    color: "#FF4500",
    strikethrough: false,
    underline: false,
    backgroundColor: "transparent",
    bold: true,
    italic: false,
  },
  {
    tag: "deprecated",
    color: "#FF6347",
    strikethrough: true,
    underline: false,
    backgroundColor: "transparent",
    bold: false,
    italic: false,
  },
  {
    tag: "important",
    color: "#FF0000",
    strikethrough: false,
    underline: true,
    backgroundColor: "transparent",
    bold: true,
    italic: false,
  },
];

const REQUIRED_PACKAGES = [
  "@salesforce/cli",
  "prettier",
  "@prettier/plugin-xml",
  "prettier-plugin-apex",
];

module.exports = {
  EXTENSION_NAME,
  BETTER_COMMENTS_TAG,
  APEX_SETTINGS,
  JAVASCRIPT_SETTINGS,
  REQUIRED_PACKAGES,
};
