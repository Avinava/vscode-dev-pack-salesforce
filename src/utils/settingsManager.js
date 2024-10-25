const vscode = require("vscode");
const updateSettings = require("../commands/workspaceSettings");
const { EXTENSION_NAME } = require("./constants");

async function settingsManager(context) {
  try {
    const config = vscode.workspace.getConfiguration("devPackSalesforce");
    const autoUpdateSettings = config.get("autoUpdateSettings");

    if (autoUpdateSettings) {
      const files = await findSfdxProjectFiles();
      if (files.length > 0) {
        await updateSettings();
      }
    }

    if (!context.globalState.get("dev-pack-salesforce.promptedForAutoUpdate")) {
      const userConfirmed = await promptForAutoUpdate();
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

function findSfdxProjectFiles() {
  return vscode.workspace.findFiles(
    "sfdx-project.json",
    "**/node_modules/**",
    1
  );
}

function promptForAutoUpdate() {
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

module.exports = settingsManager;
