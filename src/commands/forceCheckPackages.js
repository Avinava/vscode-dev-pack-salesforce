const vscode = require("vscode");
const NodePackageManager = require("./NodePackageManager");
const CommonUtils = require("../utils/CommonUtils");

class ForceCheckPackages {
  static async checkPackages(context) {
    CommonUtils.showInformationMessage(
      "Checking and installing required packages and plugins..."
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
