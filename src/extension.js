const vscode = require("vscode");
const { EXTENSION_NAME } = require("./utils/constants");
const nodePackageManager = require("./commands/nodePackageManager");
const settingsManager = require("./utils/settingsManager");
const workspaceSettings = require("./commands/workspaceSettings");
const updateBetterCommentsSettings = require("./commands/betterComments");
const forceCheckPackages = require("./commands/forceCheckPackages");

async function activate(context) {
  console.log(
    `Congratulations, your extension "${EXTENSION_NAME}" is now active!`
  );

  await setInitialTheme(context);
  await nodePackageManager(context);
  registerCommands(context);
  await settingsManager(context);
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
    updateBetterCommentsSettings();
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
        forceCheckPackages(context);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "dev-pack-salesforce.updateSettings",
      () => {
        workspaceSettings();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "dev-pack-salesforce.updateBetterCommentsSettings",
      () => {
        updateBetterCommentsSettings();
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
    workspaceSettings();
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
