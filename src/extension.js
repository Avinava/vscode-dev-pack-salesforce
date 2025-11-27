import * as vscode from 'vscode';
import { EXTENSION_NAME, EXTENSION_ID } from './lib/constants.js';
import * as environmentService from './services/environment.js';
import * as statusBarService from './services/status-bar.js';
import * as packageService from './services/packages.js';
import * as settingsService from './services/settings.js';
import * as sfdxService from './services/sfdx.js';
import * as environmentCommands from './features/environment-commands.js';

/**
 * Main extension class
 */
class Extension {
  /**
   * @param {vscode.ExtensionContext} context
   */
  constructor(context) {
    this.context = context;
    this.isSfdxProject = false;
  }

  /**
   * Activate the extension
   */
  async activate() {
    console.log(`Congratulations, your extension "${EXTENSION_NAME}" is now active!`);

    // Check if we're in an SFDX project and set context
    this.isSfdxProject = await environmentService.isSalesforceDXProject();
    await vscode.commands.executeCommand('setContext', 'sfdx:project_opened', this.isSfdxProject);

    // Always register commands (they'll be hidden via when clauses if not in SFDX project)
    this.registerCommands();

    // Run general setup for all workspaces
    await settingsService.runInitialSetup(this.context);

    // Only run SFDX-specific features when in a Salesforce project
    if (this.isSfdxProject) {
      console.log(`${EXTENSION_NAME}: SFDX project detected, activating Salesforce features`);

      // Initialize status bar for SFDX projects
      statusBarService.initialize(this.context);

      // Run Salesforce-specific setup
      await packageService.managePackages(this.context);
      await settingsService.manageSettings(this.context);
      settingsService.checkAndUpdateWorkspaceSettings(this.context);

      // Run environment check after initial setup
      await environmentService.runStartupCheck(this.context);

      // Update status bar after checks
      await statusBarService.updateStatus();

      // Watch for sfdx-project.json changes
      this.watchSfdxProject();
    } else {
      console.log(`${EXTENSION_NAME}: Not an SFDX project, Salesforce features disabled`);
    }

    // Watch for workspace folder changes to detect new SFDX projects
    this.watchWorkspaceChanges();
  }

  /**
   * Watch for changes to sfdx-project.json
   */
  watchSfdxProject() {
    const watcher = vscode.workspace.createFileSystemWatcher('**/sfdx-project.json');

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
      const isSfdx = await environmentService.isSalesforceDXProject();
      if (isSfdx !== this.isSfdxProject) {
        await this.handleSfdxProjectChange(isSfdx);
      }
    });
  }

  /**
   * Handle SFDX project status change
   * @param {boolean} isSfdxProject
   */
  async handleSfdxProjectChange(isSfdxProject) {
    this.isSfdxProject = isSfdxProject;
    await vscode.commands.executeCommand('setContext', 'sfdx:project_opened', this.isSfdxProject);

    if (this.isSfdxProject) {
      // Activate SFDX features
      statusBarService.initialize(this.context);
      await statusBarService.updateStatus();
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: Salesforce DX project detected! Features activated.`
      );
    } else {
      // Hide status bar when leaving SFDX project
      statusBarService.hide();
    }
  }

  /**
   * Register all extension commands
   */
  registerCommands() {
    const commands = [
      {
        command: `${EXTENSION_ID}.forceCheckPackages`,
        callback: () => packageService.forceCheckPackages(this.context),
      },
      {
        command: `${EXTENSION_ID}.updateSettings`,
        callback: () => settingsService.updateWorkspaceSettings(),
      },
      {
        command: `${EXTENSION_ID}.updateBetterCommentsSettings`,
        callback: () => settingsService.updateBetterCommentsSettings(),
      },
      {
        command: `${EXTENSION_ID}.deleteApexLogs`,
        callback: () => sfdxService.deleteApexLogs(),
      },
      {
        command: `${EXTENSION_ID}.checkEnvironment`,
        callback: () => environmentCommands.checkEnvironment(),
      },
      {
        command: `${EXTENSION_ID}.checkJava`,
        callback: () => environmentCommands.checkJava(),
      },
      {
        command: `${EXTENSION_ID}.checkSalesforceCLI`,
        callback: () => environmentCommands.checkSalesforceCLI(),
      },
      {
        command: `${EXTENSION_ID}.checkNodeJS`,
        callback: () => environmentCommands.checkNodeJS(),
      },
      {
        command: `${EXTENSION_ID}.showProjectInfo`,
        callback: () => environmentCommands.showProjectInfo(),
      },
      {
        command: `${EXTENSION_ID}.openSfdxProject`,
        callback: () => sfdxService.openSfdxProject(),
      },
      {
        command: `${EXTENSION_ID}.refreshOrg`,
        callback: () => sfdxService.refreshOrgMetadata(),
      },
    ];

    commands.forEach(({ command, callback }) => {
      this.context.subscriptions.push(vscode.commands.registerCommand(command, callback));
    });
  }

  /**
   * Deactivate the extension
   */
  deactivate() {
    // Cleanup if needed
  }
}

/**
 * Extension activation entry point
 * @param {vscode.ExtensionContext} context
 */
export function activate(context) {
  const extension = new Extension(context);
  extension.activate();
}

/**
 * Extension deactivation entry point
 */
export function deactivate() {
  // Add any cleanup logic here if needed
}
