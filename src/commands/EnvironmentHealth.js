const vscode = require("vscode");
const EnvironmentCheck = require("../utils/EnvironmentCheck");
const CommonUtils = require("../utils/CommonUtils");

class EnvironmentHealth {
  /**
   * Run full environment health check
   */
  static async checkEnvironment() {
    await EnvironmentCheck.runHealthCheck(false);
  }

  /**
   * Check and fix Java configuration
   */
  static async checkJava() {
    const javaCheck = await EnvironmentCheck.checkJava();
    
    if (!javaCheck.installed) {
      await EnvironmentCheck.promptJavaPathUpdate();
    } else if (!javaCheck.valid) {
      const upgrade = await vscode.window.showWarningMessage(
        `Java ${javaCheck.version} is installed. Salesforce requires Java 11+.`,
        "Find Java Installations",
        "Download Java",
        "Dismiss"
      );

      if (upgrade === "Find Java Installations") {
        await EnvironmentCheck.promptJavaPathUpdate();
      } else if (upgrade === "Download Java") {
        vscode.env.openExternal(
          vscode.Uri.parse("https://developer.salesforce.com/docs/platform/sfvscode-extensions/guide/java-setup.html")
        );
      }
    } else {
      CommonUtils.showInformationMessage(
        `Java ${javaCheck.version} is properly configured ✅\nPath: ${javaCheck.path || "N/A"}`
      );
    }
  }

  /**
   * Check and update Salesforce CLI
   */
  static async checkSalesforceCLI() {
    const cliCheck = await EnvironmentCheck.checkSalesforceCLI();
    await EnvironmentCheck.promptSalesforceCLIUpdate(cliCheck);
  }

  /**
   * Check Node.js installation
   */
  static async checkNodeJS() {
    const nodeCheck = await EnvironmentCheck.checkNodeJS();
    
    if (!nodeCheck.installed) {
      await EnvironmentCheck.promptNodeJSUpdate(nodeCheck);
    } else if (!nodeCheck.valid) {
      await EnvironmentCheck.promptNodeJSUpdate(nodeCheck);
    } else {
      CommonUtils.showInformationMessage(
        `Node.js v${nodeCheck.version} is properly configured ✅`
      );
    }
  }

  /**
   * Show Salesforce project information
   */
  static async showProjectInfo() {
    const isSFDXProject = await EnvironmentCheck.isSalesforceDXProject();
    
    if (!isSFDXProject) {
      vscode.window.showInformationMessage(
        "This is not a Salesforce DX project. No sfdx-project.json found."
      );
      return;
    }

    const projectInfo = await EnvironmentCheck.getSalesforceProjectInfo();
    
    if (!projectInfo) {
      vscode.window.showErrorMessage(
        "Unable to read sfdx-project.json file."
      );
      return;
    }

    const packageDirs = projectInfo.packageDirectories
      .map((dir) => `  • ${dir.path} ${dir.default ? "(default)" : ""}`)
      .join("\n");

    const message = `📦 Salesforce DX Project\n\nName: ${projectInfo.name}\nAPI Version: ${projectInfo.sourceApiVersion}\nNamespace: ${projectInfo.namespace || "(none)"}\n\nPackage Directories:\n${packageDirs}`;

    const action = await vscode.window.showInformationMessage(
      message,
      "Open sfdx-project.json",
      "OK"
    );

    if (action === "Open sfdx-project.json") {
      const doc = await vscode.workspace.openTextDocument(projectInfo.path);
      await vscode.window.showTextDocument(doc);
    }
  }
}

module.exports = EnvironmentHealth;
