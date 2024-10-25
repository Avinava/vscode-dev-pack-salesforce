const vscode = require("vscode");
const { exec } = require("child_process");
const { EXTENSION_NAME } = require("../utils/constants");

async function sfdxScannerInstaller(context) {
  try {
    const plugins = await execCommand("sf plugins");
    if (!plugins.includes("@salesforce/sfdx-scanner")) {
      const userConfirmed = await promptForSfdxScannerInstallation();
      if (userConfirmed) {
        await installSfdxScanner();
      }
    } else {
      if (
        !context.globalState.get("dev-pack-salesforce.sfdx-scanner-checked")
      ) {
        vscode.window.showInformationMessage(
          `${EXTENSION_NAME}: The @salesforce/sfdx-scanner plugin is already installed. SFDX setup is complete.`
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

function execCommand(command) {
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

function promptForSfdxScannerInstallation() {
  return new Promise((resolve) => {
    vscode.window
      .showInformationMessage(
        `${EXTENSION_NAME}: The @salesforce/sfdx-scanner plugin is not installed. Do you want to install it?`,
        "Yes",
        "No"
      )
      .then((selection) => {
        resolve(selection === "Yes");
      });
  });
}

function installSfdxScanner() {
  return new Promise((resolve, reject) => {
    exec(
      "sf plugins:install @salesforce/sfdx-scanner",
      (error, stdout, stderr) => {
        if (error) {
          reject(
            `${EXTENSION_NAME}: Failed to install SFDX scanner plugin: ${stderr}`
          );
        } else {
          vscode.window.showInformationMessage(
            `${EXTENSION_NAME}: Successfully installed SFDX scanner plugin.`
          );
          resolve();
        }
      }
    );
  });
}

module.exports = sfdxScannerInstaller;
