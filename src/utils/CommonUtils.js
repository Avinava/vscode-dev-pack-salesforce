const vscode = require("vscode");
const { exec } = require("child_process");
const { EXTENSION_NAME } = require("../utils/constants");

class CommonUtils {
  static execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(
            `${EXTENSION_NAME}: Failed to execute command "${command}": ${stderr}`
          );
        } else {
          resolve(stdout);
        }
      });
    });
  }

  static showInformationMessage(message) {
    vscode.window.showInformationMessage(`${EXTENSION_NAME}: ${message}`);
  }

  static async promptForConfirmation(message) {
    const selection = await vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: ${message}`,
      "Yes",
      "No"
    );
    return selection === "Yes";
  }
}

module.exports = CommonUtils;
