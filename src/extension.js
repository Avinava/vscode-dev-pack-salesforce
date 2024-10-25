const vscode = require("vscode");
const { EXTENSION_NAME } = require("./utils/constants");
const NodePackageManager = require("./commands/NodePackageManager");
const SettingsManager = require("./utils/SettingsManager");
const WorkspaceSettings = require("./commands/WorkspaceSettings");
const BetterComments = require("./commands/BetterComments");
const ForceCheckPackages = require("./commands/ForceCheckPackages");
const InitialSetup = require("./utils/InitialSetup");
const Sfdx = require("./commands/Sfdx");

class Extension {
  constructor(context) {
    this.context = context;
  }

  async activate() {
    console.log(
      `Congratulations, your extension "${EXTENSION_NAME}" is now active!`
    );

    await InitialSetup.setup(this.context);
    await NodePackageManager.managePackages(this.context);
    this.registerCommands();
    await SettingsManager.manageSettings(this.context);
    WorkspaceSettings.checkAndUpdateSettings(this.context);
  }

  registerCommands() {
    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        "dev-pack-salesforce.forceCheckPackages",
        () => {
          ForceCheckPackages.checkPackages(this.context);
        }
      )
    );

    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        "dev-pack-salesforce.updateSettings",
        () => {
          WorkspaceSettings.updateSettings();
        }
      )
    );

    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        "dev-pack-salesforce.updateBetterCommentsSettings",
        () => {
          BetterComments.updateSettings();
        }
      )
    );

    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        "dev-pack-salesforce.deleteApexLogs",
        () => {
          Sfdx.deleteApexLogs();
        }
      )
    );
  }

  deactivate() {}
}

function activate(context) {
  const extension = new Extension(context);
  extension.activate();
}

function deactivate() {
  // Add any cleanup logic here if needed
}

module.exports = {
  activate,
  deactivate,
};
