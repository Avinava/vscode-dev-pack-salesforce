/**
 * Extension constants and configuration values
 */

export const EXTENSION_NAME = "Dev Pack for Salesforce";
export const EXTENSION_ID = "dev-pack-salesforce";

/**
 * Editor settings for Apex files
 */
export const APEX_SETTINGS = {
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.detectIndentation": false,
  "editor.tabSize": 2,
};

/**
 * Editor settings for JavaScript files
 */
export const JAVASCRIPT_SETTINGS = {
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.detectIndentation": false,
  "editor.tabSize": 2,
};

/**
 * Better Comments tag configuration
 */
export const BETTER_COMMENTS_TAGS = [
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
    tag: "todo",
    color: "#FF8C00",
    strikethrough: false,
    underline: false,
    backgroundColor: "rgba(255, 255, 0, 0.2)",
    bold: true,
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
    tag: "?",
    color: "#FF8C00",
    strikethrough: false,
    underline: false,
    backgroundColor: "rgba(255, 140, 0, 0.1)",
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
    backgroundColor: "rgba(255, 69, 0, 0.1)",
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
  {
    tag: "#",
    color: "#1E90FF",
    strikethrough: false,
    underline: false,
    backgroundColor: "rgba(30, 144, 255, 0.1)",
    bold: false,
    italic: false,
  },
];

/**
 * Global state keys used by the extension
 */
export const STATE_KEYS = {
  WORKSPACE_INITIALIZED: `${EXTENSION_ID}.workspace-initialized`,
  THEME_SET: `${EXTENSION_ID}.has-theme-set`,
  BETTER_COMMENTS_SET: `${EXTENSION_ID}.has-better-comments-set`,
  PROMPTED_AUTO_UPDATE: `${EXTENSION_ID}.promptedForAutoUpdate`,
};
