import * as vscode from "vscode";
import { EXTENSION_NAME, EXTENSION_ID } from "./lib/constants.js";
import * as settingsService from "./services/settings.js";
import * as sfdxService from "./services/sfdx.js";

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
    console.log(
      `Congratulations, your extension "${EXTENSION_NAME}" is now active!`
    );

    // Check if we're in an SFDX project and set context
    this.isSfdxProject = await sfdxService.isSalesforceDXProject();
    await vscode.commands.executeCommand(
      "setContext",
      "sfdx:project_opened",
      this.isSfdxProject
    );

    // Always register commands (they'll be hidden via when clauses if not in SFDX project)
    this.registerCommands();

    // Run general setup for all workspaces
    await settingsService.runInitialSetup(this.context);

    // Only run SFDX-specific features when in a Salesforce project
    if (this.isSfdxProject) {
      console.log(
        `${EXTENSION_NAME}: SFDX project detected, activating Salesforce features`
      );

      // Run Salesforce-specific setup
      await settingsService.manageSettings(this.context);
      settingsService.checkAndUpdateWorkspaceSettings(this.context);

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
      const isSfdx = await sfdxService.isSalesforceDXProject();
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
    await vscode.commands.executeCommand(
      "setContext",
      "sfdx:project_opened",
      this.isSfdxProject
    );

    if (this.isSfdxProject) {
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: Salesforce DX project detected! Features activated.`
      );
    }
  }

  /**
   * Register all extension commands
   */
  registerCommands() {
    const commands = [
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
        command: `${EXTENSION_ID}.openSfdxProject`,
        callback: () => sfdxService.openSfdxProject(),
      },
      {
        command: `${EXTENSION_ID}.refreshOrg`,
        callback: () => sfdxService.refreshOrgMetadata(),
      },
    ];

    commands.forEach(({ command, callback }) => {
      this.context.subscriptions.push(
        vscode.commands.registerCommand(command, callback)
      );
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
