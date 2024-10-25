const vscode = require("vscode");
const CommonUtils = require("../utils/CommonUtils");
const { EXTENSION_NAME } = require("../utils/constants");

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
}

module.exports = Sfdx;
