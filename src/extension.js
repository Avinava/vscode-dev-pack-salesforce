const vscode = require("vscode");
const { EXTENSION_NAME } = require("./utils/constants");
const NodePackageManager = require("./commands/nodePackageManager");
const SettingsManager = require("./utils/settingsManager");
const WorkspaceSettings = require("./commands/workspaceSettings");
const BetterComments = require("./commands/betterComments");
const ForceCheckPackages = require("./commands/forceCheckPackages");

async function activate(context) {
  console.log(
    `Congratulations, your extension "${EXTENSION_NAME}" is now active!`
  );

  await setInitialTheme(context);
  await NodePackageManager.managePackages(context);
  registerCommands(context);
  await SettingsManager.manageSettings(context);
  await checkAndUpdateSettings(context);
}

async function setInitialTheme(context) {
  if (!context.globalState.get("dev-pack-salesforce.has-theme-set")) {
    await vscode.workspace
      .getConfiguration()
      .update("workbench.iconTheme", "vscode-icons", true);
    await vscode.workspace
      .getConfiguration()
      .update("workbench.colorTheme", "One Dark Pro Darker", true);
    context.globalState.update("dev-pack-salesforce.has-theme-set", true);
  }

  if (!context.globalState.get("dev-pack-salesforce.has-better-comments-set")) {
    BetterComments.updateSettings();
    context.globalState.update(
      "dev-pack-salesforce.has-better-comments-set",
      true
    );
  }
}

function registerCommands(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "dev-pack-salesforce.forceCheckPackages",
      () => {
        ForceCheckPackages.checkPackages(context);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "dev-pack-salesforce.updateSettings",
      () => {
        WorkspaceSettings.updateSettings();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "dev-pack-salesforce.updateBetterCommentsSettings",
      () => {
        BetterComments.updateSettings();
      }
    )
  );
}

async function checkAndUpdateSettings(context) {
  const config = vscode.workspace.getConfiguration("devPackSalesforce");
  const autoUpdateSettings = config.get("autoUpdateSettings");
  const isNewWorkspace = !context.globalState.get(
    "dev-pack-salesforce.workspace-initialized"
  );

  if (autoUpdateSettings && isNewWorkspace) {
    WorkspaceSettings.updateSettings();
    context.globalState.update(
      "dev-pack-salesforce.workspace-initialized",
      true
    );
  }
}

exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
