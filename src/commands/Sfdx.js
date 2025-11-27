const vscode = require("vscode");
const CommonUtils = require("../utils/CommonUtils");
const { EXTENSION_NAME } = require("../utils/constants");
const path = require("path");
const fs = require("fs").promises;

const apexLogFileName = "apexlog-out.csv";

class Sfdx {
  static async deleteApexLogs() {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Deleting Apex Logs",
        cancellable: false,
      },
      async (progress) => {
        try {
          progress.report({ message: "Querying ApexLog IDs..." });
          // Step 1: Query ApexLog IDs and save to apexlog-out.csv
          await CommonUtils.execCommand(
            `sf data query -q "SELECT Id FROM ApexLog" -r "csv" > ${apexLogFileName}`
          );

          progress.report({ message: "Deleting ApexLogs..." });
          // Step 2: Delete ApexLogs using the apexlog-out.csv file
          await CommonUtils.execCommand(
            `sf data delete bulk --sobject ApexLog --file ${apexLogFileName} --wait 1000`
          );

          CommonUtils.showInformationMessage(
            "Successfully deleted all Apex logs."
          );

          // Step 3: Delete the apexlog-out.csv file using vscode API
          const file = vscode.Uri.file(apexLogFileName);
          await vscode.workspace.fs.delete(file);
        } catch (error) {
          vscode.window.showErrorMessage(
            `${EXTENSION_NAME}: Failed to delete Apex logs: ${error.message}`
          );
        }
      }
    );
  }

  /**
   * Open sfdx-project.json in editor
   */
  static async openSfdxProject() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder open.");
      return;
    }

    for (const folder of workspaceFolders) {
      const sfdxProjectPath = path.join(folder.uri.fsPath, "sfdx-project.json");
      try {
        await fs.access(sfdxProjectPath);
        const doc = await vscode.workspace.openTextDocument(sfdxProjectPath);
        await vscode.window.showTextDocument(doc);
        return;
      } catch (error) {
        // Continue searching
      }
    }

    vscode.window.showWarningMessage(
      "No sfdx-project.json found in workspace."
    );
  }

  /**
   * Refresh metadata from org with quick pick options
   */
  static async refreshOrgMetadata() {
    const options = [
      {
        label: "$(refresh) Refresh All Metadata",
        description: "Pull all metadata from the org",
        command: "sf project retrieve start",
      },
      {
        label: "$(file-code) Refresh Apex Classes",
        description: "Pull only Apex classes",
        command: "sf project retrieve start -m ApexClass",
      },
      {
        label: "$(zap) Refresh Triggers",
        description: "Pull only Apex triggers",
        command: "sf project retrieve start -m ApexTrigger",
      },
      {
        label: "$(layout) Refresh LWC",
        description: "Pull Lightning Web Components",
        command: "sf project retrieve start -m LightningComponentBundle",
      },
      {
        label: "$(symbol-field) Refresh Custom Objects",
        description: "Pull custom objects and fields",
        command: "sf project retrieve start -m CustomObject",
      },
      {
        label: "$(list-flat) Refresh Flows",
        description: "Pull all Flows",
        command: "sf project retrieve start -m Flow",
      },
    ];

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Select what to refresh from org",
      ignoreFocusOut: true,
    });

    if (!selected) return;

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Refreshing Metadata",
        cancellable: false,
      },
      async (progress) => {
        try {
          progress.report({ message: "Retrieving from org..." });
          const terminal = vscode.window.createTerminal("SF Retrieve");
          terminal.show();
          terminal.sendText(selected.command);
        } catch (error) {
          vscode.window.showErrorMessage(
            `${EXTENSION_NAME}: Failed to refresh: ${error.message}`
          );
        }
      }
    );
  }

  /**
   * Quick deploy to org
   */
  static async quickDeploy() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("No active file to deploy.");
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const fileName = path.basename(filePath);

    const confirm = await vscode.window.showWarningMessage(
      `Deploy ${fileName} to org?`,
      "Deploy",
      "Cancel"
    );

    if (confirm !== "Deploy") return;

    const terminal = vscode.window.createTerminal("SF Deploy");
    terminal.show();
    terminal.sendText(`sf project deploy start --source-dir "${filePath}"`);
  }
}

module.exports = Sfdx;
