const vscode = require("vscode");
const { EXTENSION_NAME, BETTER_COMMENTS_TAG } = require("../utils/constants");

class BetterComments {
  static updateSettings() {
    const config = vscode.workspace.getConfiguration();
    config.update(
      "better-comments.tags",
      BETTER_COMMENTS_TAG,
      vscode.ConfigurationTarget.Global
    );
    vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: Updated Better Comments settings globally.`
    );
  }
}

module.exports = BetterComments;
