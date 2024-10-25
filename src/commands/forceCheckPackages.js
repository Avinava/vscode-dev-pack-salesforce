const vscode = require("vscode");
const nodePackageManager = require("./nodePackageManager");
const { EXTENSION_NAME } = require("../utils/constants");

function forceCheckPackages(context) {
  vscode.window.showInformationMessage(
    `${EXTENSION_NAME}: Checking and installing required packages and plugins...`
  );
  context.globalState.update("dev-pack-salesforce.packages-checked", false);
  context.globalState.update("dev-pack-salesforce.sfdx-scanner-checked", false);
  nodePackageManager(context);
}

module.exports = forceCheckPackages;
