const vscode = require("vscode");
const NodePackageManager = require("./nodePackageManager");
const { EXTENSION_NAME } = require("../utils/constants");

class ForceCheckPackages {
  static async checkPackages(context) {
    vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: Checking and installing required packages and plugins...`
    );
    context.globalState.update("dev-pack-salesforce.packages-checked", false);
    context.globalState.update(
      "dev-pack-salesforce.sfdx-scanner-checked",
      false
    );
    await NodePackageManager.managePackages(context);
  }
}

module.exports = ForceCheckPackages;
