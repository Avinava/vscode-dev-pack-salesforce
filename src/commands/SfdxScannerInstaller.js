const vscode = require("vscode");
const CommonUtils = require("../utils/CommonUtils");

class SfdxScannerInstaller {
  static async install(context) {
    try {
      // Check if sf command is available
      await this.verifySfCliInstalled();

      const plugins = await CommonUtils.execCommand("sf plugins");
      const pluginsToInstall = [];

      if (!plugins.includes("@salesforce/sfdx-scanner")) {
        pluginsToInstall.push("@salesforce/sfdx-scanner");
      }

      if (!plugins.includes("code-analyzer")) {
        pluginsToInstall.push("code-analyzer");
      }

      if (pluginsToInstall.length > 0) {
        const userConfirmed = await CommonUtils.promptForConfirmation(
          `The following SF plugins will be installed: ${pluginsToInstall.join(
            ", "
          )}. Do you want to proceed?`
        );
        if (userConfirmed) {
          await this.installPlugins(pluginsToInstall);
        }
      } else {
        if (
          !context.globalState.get("dev-pack-salesforce.sf-plugins-checked")
        ) {
          CommonUtils.showInformationMessage(
            "All required SF plugins are already installed. SF setup is complete."
          );
          context.globalState.update(
            "dev-pack-salesforce.sf-plugins-checked",
            true
          );
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(error);
    }
  }

  static async verifySfCliInstalled() {
    try {
      await CommonUtils.execCommand("sf --version");
    } catch (error) {
      throw new Error(
        "Salesforce CLI (sf) is not available. Please ensure @salesforce/cli is installed first."
      );
    }
  }

  static async installPlugins(pluginsToInstall) {
    try {
      for (const plugin of pluginsToInstall) {
        await CommonUtils.execCommand(`sf plugins install ${plugin}`);
      }
      CommonUtils.showInformationMessage(
        `Successfully installed SF plugins: ${pluginsToInstall.join(", ")}`
      );
    } catch (error) {
      throw new Error(`Failed to install SF plugins: ${error.message}`);
    }
  }
}

module.exports = SfdxScannerInstaller;
