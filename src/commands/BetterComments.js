const vscode = require("vscode");
const { BETTER_COMMENTS_TAG } = require("../utils/constants");
const CommonUtils = require("../utils/CommonUtils");

class BetterComments {
  static updateSettings() {
    const config = vscode.workspace.getConfiguration();
    config.update(
      "better-comments.tags",
      BETTER_COMMENTS_TAG,
      vscode.ConfigurationTarget.Global
    );
    CommonUtils.showInformationMessage(
      "Updated Better Comments settings globally."
    );
  }
}

module.exports = BetterComments;
