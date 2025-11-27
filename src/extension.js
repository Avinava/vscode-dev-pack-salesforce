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
    this.isSfdxProject = false;
  }

  async activate() {
    console.log(
      `Congratulations, your extension "${EXTENSION_NAME}" is now active!`
    );

    // Check if we're in an SFDX project and set context
    this.isSfdxProject = await EnvironmentCheck.isSalesforceDXProject();
    await vscode.commands.executeCommand(
      "setContext",
      "sfdx:project_opened",
      this.isSfdxProject
    );

    // Always register commands (they'll be hidden via when clauses if not in SFDX project)
    this.registerCommands();

    // Run general setup for all workspaces
    await InitialSetup.setup(this.context);

    // Only run SFDX-specific features when in a Salesforce project
    if (this.isSfdxProject) {
      console.log(
        `${EXTENSION_NAME}: SFDX project detected, activating Salesforce features`
      );

      // Initialize status bar for SFDX projects
      StatusBar.initialize(this.context);

      // Run Salesforce-specific setup
      await NodePackageManager.managePackages(this.context);
      await SettingsManager.manageSettings(this.context);
      WorkspaceSettings.checkAndUpdateSettings(this.context);

      // Run environment check after initial setup
      await EnvironmentCheck.runStartupCheck(this.context);

      // Update status bar after checks
      await StatusBar.updateStatus();

      // Watch for sfdx-project.json changes
      this.watchSfdxProject();
    } else {
      console.log(
        `${EXTENSION_NAME}: Not an SFDX project, Salesforce features disabled`
      );
    }

    // Watch for workspace folder changes to detect new SFDX projects
    this.watchWorkspaceChanges();
  }

  /**
   * Watch for changes to sfdx-project.json
   */
  watchSfdxProject() {
    const watcher = vscode.workspace.createFileSystemWatcher(
      "**/sfdx-project.json"
    );

    watcher.onDidCreate(async () => {
      console.log(`${EXTENSION_NAME}: sfdx-project.json created`);
      await this.handleSfdxProjectChange(true);
    });

    watcher.onDidDelete(async () => {
      console.log(`${EXTENSION_NAME}: sfdx-project.json deleted`);
      await this.handleSfdxProjectChange(false);
    });

    this.context.subscriptions.push(watcher);
  }

  /**
   * Watch for workspace folder changes
   */
  watchWorkspaceChanges() {
    vscode.workspace.onDidChangeWorkspaceFolders(async () => {
      const isSfdx = await EnvironmentCheck.isSalesforceDXProject();
      if (isSfdx !== this.isSfdxProject) {
        await this.handleSfdxProjectChange(isSfdx);
      }
    });
  }

  /**
   * Handle SFDX project status change
   */
  async handleSfdxProjectChange(isSfdxProject) {
    this.isSfdxProject = isSfdxProject;
    await vscode.commands.executeCommand(
      "setContext",
      "sfdx:project_opened",
      this.isSfdxProject
    );

    if (this.isSfdxProject) {
      // Activate SFDX features
      StatusBar.initialize(this.context);
      await StatusBar.updateStatus();
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: Salesforce DX project detected! Features activated.`
      );
    } else {
      // Hide status bar when leaving SFDX project
      if (StatusBar.statusBarItem) {
        StatusBar.statusBarItem.hide();
      }
    }
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
