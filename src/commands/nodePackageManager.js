const vscode = require("vscode");
const { exec } = require("child_process");
const { EXTENSION_NAME, REQUIRED_PACKAGES } = require("../utils/constants");
const SfdxScannerInstaller = require("./sfdxScannerInstaller");

class NodePackageManager {
  static async managePackages(context) {
    try {
      await this.checkNodeInstallation();
      const missingPackages = await this.checkRequiredPackages(context);
      if (missingPackages.length > 0) {
        const userConfirmed = await this.promptForPackageInstallation(
          missingPackages
        );
        if (userConfirmed) {
          await this.installMissingPackages(missingPackages);
        }
      }
      await SfdxScannerInstaller.install(context);
    } catch (error) {
      vscode.window.showErrorMessage(error);
    }
  }

  static checkNodeInstallation() {
    return new Promise((resolve, reject) => {
      exec("node -v", (error, stdout, stderr) => {
        if (error) {
          reject(
            `${EXTENSION_NAME}: Node.js is not installed. Please install Node.js to use this extension.`
          );
        } else {
          resolve();
        }
      });
    });
  }

  static checkRequiredPackages(context) {
    return new Promise((resolve, reject) => {
      const packagesToCheck = REQUIRED_PACKAGES;
      const packagesToInstall = REQUIRED_PACKAGES;

      exec(
        `npm list -g ${packagesToCheck.join(" ")}`,
        (error, stdout, stderr) => {
          if (!error) {
            if (
              !context.globalState.get("dev-pack-salesforce.packages-checked")
            ) {
              vscode.window.showInformationMessage(
                `${EXTENSION_NAME}: Required packages are already installed.`
              );
              context.globalState.update(
                "dev-pack-salesforce.packages-checked",
                true
              );
            }
            resolve([]);
          } else {
            const missingPackages = this.getMissingPackages(
              stdout,
              packagesToInstall
            );
            if (missingPackages.length === 0) {
              if (
                !context.globalState.get("dev-pack-salesforce.packages-checked")
              ) {
                vscode.window.showInformationMessage(
                  `${EXTENSION_NAME}: All required packages are already installed.`
                );
                context.globalState.update(
                  "dev-pack-salesforce.packages-checked",
                  true
                );
              }
              resolve([]);
            } else {
              resolve(missingPackages);
            }
          }
        }
      );
    });
  }

  static getMissingPackages(stdout, packagesToInstall) {
    const missingPackages = packagesToInstall.filter(
      (pkg) => !stdout.includes(pkg)
    );
    const hasPrettierPluginApex = stdout.includes("prettier-plugin-apex");
    const hasIlyamatsuevPrettierPluginApex = stdout.includes(
      "@ilyamatsuev/prettier-plugin-apex"
    );

    if (!hasPrettierPluginApex && !hasIlyamatsuevPrettierPluginApex) {
      missingPackages.push("prettier-plugin-apex");
    }

    return missingPackages;
  }

  static promptForPackageInstallation(missingPackages) {
    return new Promise((resolve) => {
      vscode.window
        .showInformationMessage(
          `${EXTENSION_NAME}: The following node packages will be installed globally: ${missingPackages.join(
            ", "
          )}. Do you want to proceed?`,
          "Yes",
          "No"
        )
        .then((selection) => {
          resolve(selection === "Yes");
        });
    });
  }

  static installMissingPackages(missingPackages) {
    return new Promise((resolve, reject) => {
      const installCommand = `npm install -g ${missingPackages.join(" ")}`;
      exec(installCommand, (error, stdout, stderr) => {
        if (error) {
          reject(
            `${EXTENSION_NAME}: Failed to install npm packages: ${stderr}`
          );
        } else {
          vscode.window.showInformationMessage(
            `${EXTENSION_NAME}: Successfully installed npm packages: ${missingPackages.join(
              ", "
            )}`
          );
          resolve();
        }
      });
    });
  }
}

module.exports = NodePackageManager;
