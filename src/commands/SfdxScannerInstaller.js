const vscode = require("vscode");
const CommonUtils = require("../utils/CommonUtils");

class SfdxScannerInstaller {
  static async install(context) {
    try {
      const plugins = await CommonUtils.execCommand("sf plugins");
      if (!plugins.includes("@salesforce/sfdx-scanner")) {
        const userConfirmed = await CommonUtils.promptForConfirmation(
          "The @salesforce/sfdx-scanner plugin is not installed. Do you want to install it?"
        );
        if (userConfirmed) {
          await this.installPlugin();
        }
      } else {
        if (
          !context.globalState.get("dev-pack-salesforce.sfdx-scanner-checked")
        ) {
          CommonUtils.showInformationMessage(
            "The @salesforce/sfdx-scanner plugin is already installed. SFDX setup is complete."
          );
          context.globalState.update(
            "dev-pack-salesforce.sfdx-scanner-checked",
            true
          );
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(error);
    }
  }

  static installPlugin() {
    return CommonUtils.execCommand(
      "sf plugins:install @salesforce/sfdx-scanner"
    )
      .then(() => {
        CommonUtils.showInformationMessage(
          "Successfully installed SFDX scanner plugin."
        );
      })
      .catch((error) => {
        vscode.window.showErrorMessage(error);
      });
  }
}

module.exports = SfdxScannerInstaller;
