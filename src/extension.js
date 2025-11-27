const vscode = require("vscode");
const { EXTENSION_NAME } = require("./utils/constants");
const NodePackageManager = require("./commands/NodePackageManager");
const SettingsManager = require("./utils/SettingsManager");
const WorkspaceSettings = require("./commands/WorkspaceSettings");
const BetterComments = require("./commands/BetterComments");
const ForceCheckPackages = require("./commands/ForceCheckPackages");
const InitialSetup = require("./utils/InitialSetup");
const Sfdx = require("./commands/Sfdx");
const EnvironmentCheck = require("./utils/EnvironmentCheck");
const EnvironmentHealth = require("./commands/EnvironmentHealth");
const StatusBar = require("./utils/StatusBar");

class Extension {
  constructor(context) {
    this.context = context;
  }

  async activate() {
    console.log(
      `Congratulations, your extension "${EXTENSION_NAME}" is now active!`
    );
    
    // Initialize status bar first for visibility
    StatusBar.initialize(this.context);
    
    this.registerCommands();
    await InitialSetup.setup(this.context);
    await NodePackageManager.managePackages(this.context);
    await SettingsManager.manageSettings(this.context);
    WorkspaceSettings.checkAndUpdateSettings(this.context);
    // Run environment check after initial setup
    await EnvironmentCheck.runStartupCheck(this.context);
    
    // Update status bar after checks
    await StatusBar.updateStatus();
  }

  registerCommands() {
    const commands = [
      {
        command: "dev-pack-salesforce.forceCheckPackages",
        callback: () => ForceCheckPackages.checkPackages(this.context),
      },
      {
        command: "dev-pack-salesforce.updateSettings",
        callback: () => WorkspaceSettings.updateSettings(),
      },
      {
        command: "dev-pack-salesforce.updateBetterCommentsSettings",
        callback: () => BetterComments.updateSettings(),
      },
      {
        command: "dev-pack-salesforce.deleteApexLogs",
        callback: () => Sfdx.deleteApexLogs(),
      },
      {
        command: "dev-pack-salesforce.checkEnvironment",
        callback: () => EnvironmentHealth.checkEnvironment(),
      },
      {
        command: "dev-pack-salesforce.checkJava",
        callback: () => EnvironmentHealth.checkJava(),
      },
      {
        command: "dev-pack-salesforce.checkSalesforceCLI",
        callback: () => EnvironmentHealth.checkSalesforceCLI(),
      },
      {
        command: "dev-pack-salesforce.checkNodeJS",
        callback: () => EnvironmentHealth.checkNodeJS(),
      },
      {
        command: "dev-pack-salesforce.showProjectInfo",
        callback: () => EnvironmentHealth.showProjectInfo(),
      },
      {
        command: "dev-pack-salesforce.openSfdxProject",
        callback: () => Sfdx.openSfdxProject(),
      },
      {
        command: "dev-pack-salesforce.refreshOrg",
        callback: () => Sfdx.refreshOrgMetadata(),
      },
    ];

    commands.forEach(({ command, callback }) => {
      this.context.subscriptions.push(
        vscode.commands.registerCommand(command, callback)
      );
    });
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
