const vscode = require("vscode");
const { EXTENSION_NAME, REQUIRED_PACKAGES } = require("../utils/constants");
const SfdxScannerInstaller = require("./SfdxScannerInstaller");
const CommonUtils = require("../utils/CommonUtils");
const EnvironmentCheck = require("../utils/EnvironmentCheck");

class NodePackageManager {
  static async managePackages(context) {
    try {
      await this.checkNodeInstallation();
      const missingPackages = await this.checkRequiredPackages(context);
      if (missingPackages.length > 0) {
        const userConfirmed = await CommonUtils.promptForConfirmation(
          `The following node packages will be installed globally: ${missingPackages.join(
            ", "
          )}. Do you want to proceed?`
        );
        if (userConfirmed) {
          await this.installMissingPackages(missingPackages);
        } else {
          return; // Exit if user doesn't confirm package installation
        }
      }
      // Only install SF plugins after ensuring @salesforce/cli is installed
      await SfdxScannerInstaller.install(context);
    } catch (error) {
      vscode.window.showErrorMessage(error);
    }
  }

  static async checkNodeInstallation() {
    const nodeCheck = await EnvironmentCheck.checkNodeJS();
    if (!nodeCheck.installed) {
      throw new Error(
        `${EXTENSION_NAME}: Node.js is not installed. Please install Node.js to use this extension.`
      );
    }
  }

  static async checkRequiredPackages(context) {
    try {
      const packagesToCheck = REQUIRED_PACKAGES;
      const stdout = await CommonUtils.execCommand(
        `npm list -g ${packagesToCheck.join(" ")}`
      );

      if (!context.globalState.get("dev-pack-salesforce.packages-checked")) {
        CommonUtils.showInformationMessage(
          "Required packages are already installed."
        );
        context.globalState.update(
          "dev-pack-salesforce.packages-checked",
          true
        );
      }

      return this.getMissingPackages(stdout, packagesToCheck);
    } catch (error) {
      const stdout = error.message || "";
      const missingPackages = this.getMissingPackages(stdout, REQUIRED_PACKAGES);
      if (missingPackages.length === 0) {
        if (!context.globalState.get("dev-pack-salesforce.packages-checked")) {
          CommonUtils.showInformationMessage(
            "All required packages are already installed."
          );
          context.globalState.update(
            "dev-pack-salesforce.packages-checked",
            true
          );
        }
      }
      return missingPackages;
    }
  }

  static getMissingPackages(stdout, packagesToInstall) {
    // Filter out packages that are already installed
    const missingPackages = packagesToInstall.filter(
      (pkg) => !stdout.includes(pkg)
    );
    
    // Special handling for prettier-plugin-apex (check for alternative package)
    const prettierApexIndex = missingPackages.indexOf("prettier-plugin-apex");
    if (prettierApexIndex !== -1) {
      // Check if the alternative ilyamatsuev package is installed
      if (stdout.includes("@ilyamatsuev/prettier-plugin-apex")) {
        missingPackages.splice(prettierApexIndex, 1);
      }
    } else if (
      !stdout.includes("prettier-plugin-apex") && 
      !stdout.includes("@ilyamatsuev/prettier-plugin-apex") &&
      !missingPackages.includes("prettier-plugin-apex")
    ) {
      // Neither version is installed, add to missing
      missingPackages.push("prettier-plugin-apex");
    }

    return missingPackages;
  }

  static async installMissingPackages(missingPackages) {
    try {
      const installCommand = `npm install -g ${missingPackages.join(" ")}`;
      await CommonUtils.execCommand(installCommand);
      CommonUtils.showInformationMessage(
        `Successfully installed npm packages: ${missingPackages.join(", ")}`
      );
    } catch (error) {
      throw new Error(
        `${EXTENSION_NAME}: Failed to install npm packages: ${error.message}`
      );
    }
  }
}

module.exports = NodePackageManager;
