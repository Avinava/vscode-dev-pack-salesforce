const vscode = require("vscode");
const EnvironmentCheck = require("./EnvironmentCheck");

class StatusBar {
  static statusBarItem = null;
  static isHealthy = true;

  /**
   * Initialize the status bar item
   */
  static initialize(context) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = "dev-pack-salesforce.checkEnvironment";
    this.statusBarItem.tooltip = "Click to check Salesforce environment health";
    context.subscriptions.push(this.statusBarItem);
    
    // Initial update
    this.updateStatus();
    
    return this.statusBarItem;
  }

  /**
   * Update status bar based on environment health
   */
  static async updateStatus(results = null) {
    if (!this.statusBarItem) return;

    // Quick check if results not provided
    if (!results) {
      const isSFDX = await EnvironmentCheck.isSalesforceDXProject();
      if (!isSFDX) {
        this.statusBarItem.hide();
        return;
      }
      
      // Do a quick silent check
      results = {
        node: await EnvironmentCheck.checkNodeJS(),
        java: await EnvironmentCheck.checkJava(),
        salesforceCLI: await EnvironmentCheck.checkSalesforceCLI(),
      };
    }

    const issues = [];
    
    if (!results.node?.installed) issues.push("Node.js");
    if (!results.java?.installed) issues.push("Java");
    if (!results.salesforceCLI?.installed) issues.push("SF CLI");

    if (issues.length > 0) {
      this.statusBarItem.text = `$(warning) SF: ${issues.length} issue(s)`;
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.warningBackground"
      );
      this.statusBarItem.tooltip = `Missing: ${issues.join(", ")}. Click to fix.`;
      this.isHealthy = false;
    } else {
      this.statusBarItem.text = "$(check) SF Ready";
      this.statusBarItem.backgroundColor = undefined;
      this.statusBarItem.tooltip = "Salesforce environment is healthy. Click for details.";
      this.isHealthy = true;
    }

    this.statusBarItem.show();
  }

  /**
   * Show a temporary message in status bar
   */
  static showMessage(message, timeout = 3000) {
    if (!this.statusBarItem) return;
    
    const originalText = this.statusBarItem.text;
    this.statusBarItem.text = message;
    
    setTimeout(() => {
      if (this.statusBarItem) {
        this.statusBarItem.text = originalText;
      }
    }, timeout);
  }
}

module.exports = StatusBar;
