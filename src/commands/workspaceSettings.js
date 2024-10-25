const vscode = require("vscode");
const {
  EXTENSION_NAME,
  APEX_SETTINGS,
  JAVASCRIPT_SETTINGS,
} = require("../utils/constants");
const updateBetterCommentsSettings = require("./betterComments");

function updateSettings() {
  const config = vscode.workspace.getConfiguration();

  config.update("[apex]", APEX_SETTINGS, vscode.ConfigurationTarget.Workspace);
  config.update(
    "[javascript]",
    JAVASCRIPT_SETTINGS,
    vscode.ConfigurationTarget.Workspace
  );

  updateBetterCommentsSettings();

  vscode.window.showInformationMessage(
    `${EXTENSION_NAME}: Updated settings for Apex and JavaScript`
  );
}

module.exports = updateSettings;
