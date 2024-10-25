const vscode = require("vscode");
const WorkspaceSettings = require("../commands/WorkspaceSettings");
const { EXTENSION_NAME } = require("./constants");

class SettingsManager {
  static async manageSettings(context) {
    try {
      const config = vscode.workspace.getConfiguration("devPackSalesforce");
      const autoUpdateSettings = config.get("autoUpdateSettings");

      if (autoUpdateSettings) {
        const files = await this.findSfdxProjectFiles();
        if (files.length > 0) {
          await WorkspaceSettings.updateSettings();
        }
      }

      if (
        !context.globalState.get("dev-pack-salesforce.promptedForAutoUpdate")
      ) {
        const userConfirmed = await this.promptForAutoUpdate();
        if (userConfirmed) {
          await config.update(
            "autoUpdateSettings",
            true,
            vscode.ConfigurationTarget.Global
          );
        }
        await context.globalState.update(
          "dev-pack-salesforce.promptedForAutoUpdate",
          true
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(error);
    }
  }

  static findSfdxProjectFiles() {
    return vscode.workspace.findFiles(
      "sfdx-project.json",
      "**/node_modules/**",
      1
    );
  }

  static promptForAutoUpdate() {
    return new Promise((resolve) => {
      vscode.window
        .showInformationMessage(
          `${EXTENSION_NAME}: Do you want to enable auto-formatting for new projects?`,
          "Yes",
          "No"
        )
        .then((selection) => {
          resolve(selection === "Yes");
        });
    });
  }
}

module.exports = SettingsManager;
