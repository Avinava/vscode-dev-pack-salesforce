const vscode = require("vscode");
const BetterComments = require("./commands/betterComments");
const ForceCheckPackages = require("./commands/forceCheckPackages");

class InitialSetup {
  static async setup(context) {
    try {
      await this.setInitialTheme(context);
      await this.setBetterComments(context);
      await ForceCheckPackages.checkPackages(context);
    } catch (error) {
      vscode.window.showErrorMessage(error);
    }
  }

  static async setInitialTheme(context) {
    if (!context.globalState.get("dev-pack-salesforce.has-theme-set")) {
      await vscode.workspace
        .getConfiguration()
        .update("workbench.iconTheme", "vscode-icons", true);
      await vscode.workspace
        .getConfiguration()
        .update("workbench.colorTheme", "One Dark Pro Darker", true);
      context.globalState.update("dev-pack-salesforce.has-theme-set", true);
    }
  }

  static async setBetterComments(context) {
    if (
      !context.globalState.get("dev-pack-salesforce.has-better-comments-set")
    ) {
      BetterComments.updateSettings();
      await context.globalState.update(
        "dev-pack-salesforce.has-better-comments-set",
        true
      );
    }
  }
}

module.exports = InitialSetup;
