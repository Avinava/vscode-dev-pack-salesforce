const vscode = require("vscode");
const EnvironmentCheck = require("./EnvironmentCheck");

// Salesforce cloud icon using codicon
const SF_ICON = "$(cloud)";

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
    this.statusBarItem.name = "Salesforce Dev Pack";
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

    // Check if status bar is enabled in settings
    const config = vscode.workspace.getConfiguration("devPackSalesforce");
    if (!config.get("showStatusBar", true)) {
      this.statusBarItem.hide();
      return;
    }

    // Quick check if results not provided
    if (!results) {
      const isSFDX = await EnvironmentCheck.isSalesforceDXProject();
      if (!isSFDX) {
        this.statusBarItem.hide();
        return;
      }

      // Do a quick silent check using EnvironmentCheck methods
      results = {
        node: await EnvironmentCheck.checkNodeJS(),
        java: await EnvironmentCheck.checkJava(),
        salesforceCLI: await EnvironmentCheck.checkSalesforceCLI(),
        prettier: await EnvironmentCheck.checkPrettier(),
      };
    }

    const issues = [];
    const warnings = [];

    // Critical issues
    if (!results.node?.installed) issues.push("Node.js");
    if (!results.salesforceCLI?.installed) issues.push("SF CLI");

    // Warnings (non-critical but recommended)
    if (!results.java?.installed) warnings.push("Java");
    if (!results.prettier?.installed) warnings.push("Prettier");
    if (results.prettier?.installed && !results.prettier?.allPlugins) {
      warnings.push("Prettier plugins");
    }

    if (issues.length > 0) {
      // Critical issues - red/error state
      this.statusBarItem.text = `${SF_ICON} ${issues.length} error(s)`;
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.errorBackground"
      );
      this.statusBarItem.color = undefined;
      this.statusBarItem.tooltip = `❌ Missing: ${issues.join(", ")}${warnings.length > 0 ? `\n⚠️ Warnings: ${warnings.join(", ")}` : ""}\n\nClick to fix issues.`;
      this.isHealthy = false;
    } else if (warnings.length > 0) {
      // Warnings only - yellow state
      this.statusBarItem.text = `${SF_ICON} ${warnings.length} warning(s)`;
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.warningBackground"
      );
      this.statusBarItem.color = undefined;
      this.statusBarItem.tooltip = `⚠️ Warnings: ${warnings.join(", ")}\n\nClick to view details.`;
      this.isHealthy = true;
    } else {
      // All good - normal state with Salesforce blue
      this.statusBarItem.text = `${SF_ICON} SF Ready`;
      this.statusBarItem.backgroundColor = undefined;
      this.statusBarItem.color = new vscode.ThemeColor("charts.blue");
      this.statusBarItem.tooltip =
        "✅ Salesforce environment is healthy\n\n• Node.js ✓\n• SF CLI ✓\n• Java ✓\n• Prettier ✓\n\nClick for details.";
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
    this.statusBarItem.text = `${SF_ICON} ${message}`;

    setTimeout(() => {
      if (this.statusBarItem) {
        this.statusBarItem.text = originalText;
      }
    }, timeout);
  }

  /**
   * Force refresh the status bar
   */
  static async refresh() {
    await this.updateStatus(null);
  }
}

module.exports = StatusBar;
