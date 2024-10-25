const vscode = require("vscode");
const CommonUtils = require("../utils/CommonUtils");

class Sfdx {
  static async deleteApexLogs() {
    try {
      // Step 1: Query ApexLog IDs and save to out.csv
      await CommonUtils.execCommand(
        `sf data query -q "SELECT Id FROM ApexLog" -r "csv" > out.csv`
      );

      // Step 2: Delete ApexLogs using the out.csv file
      await CommonUtils.execCommand(
        `sf data delete bulk --sobject ApexLog --file out.csv --wait 1000`
      );

      CommonUtils.showInformationMessage("Successfully deleted all Apex logs.");
    } catch (error) {
      vscode.window.showErrorMessage(
        `${EXTENSION_NAME}: Failed to delete Apex logs: ${error.message}`
      );
    }
  }
}

module.exports = Sfdx;
