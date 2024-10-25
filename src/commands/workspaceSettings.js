const vscode = require("vscode");
const { APEX_SETTINGS, JAVASCRIPT_SETTINGS } = require("../utils/constants");
const BetterCommentsUpdater = require("./BetterComments");
const CommonUtils = require("../utils/CommonUtils");

class WorkspaceSettings {
  static checkAndUpdateSettings(context) {
    const config = vscode.workspace.getConfiguration("devPackSalesforce");
    const autoUpdateSettings = config.get("autoUpdateSettings");
    const isNewWorkspace = !context.globalState.get(
      "dev-pack-salesforce.workspace-initialized"
    );

    if (autoUpdateSettings && isNewWorkspace) {
      this.updateSettings();
      context.globalState.update(
        "dev-pack-salesforce.workspace-initialized",
        true
      );
    }
  }

  static updateSettings() {
    const config = vscode.workspace.getConfiguration();

    config.update(
      "[apex]",
      APEX_SETTINGS,
      vscode.ConfigurationTarget.Workspace
    );
    config.update(
      "[javascript]",
      JAVASCRIPT_SETTINGS,
      vscode.ConfigurationTarget.Workspace
    );

    BetterCommentsUpdater.updateSettings();

    CommonUtils.showInformationMessage(
      "Updated settings for Apex and JavaScript"
    );
  }
}

module.exports = WorkspaceSettings;
