const vscode = require("vscode");
const { exec } = require("child_process");
const { EXTENSION_NAME } = require("../utils/constants");

// Output channel for logging
let outputChannel = null;

class CommonUtils {
  /**
   * Get or create output channel for extension logs
   */
  static getOutputChannel() {
    if (!outputChannel) {
      outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
    }
    return outputChannel;
  }

  /**
   * Log a message to the output channel
   */
  static log(message, level = "INFO") {
    const channel = this.getOutputChannel();
    const timestamp = new Date().toISOString();
    channel.appendLine(`[${timestamp}] [${level}] ${message}`);
  }

  /**
   * Log and show output channel
   */
  static logAndShow(message, level = "INFO") {
    this.log(message, level);
    this.getOutputChannel().show(true);
  }

  static execCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const execOptions = {
        cwd: workspaceFolder,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
        ...options,
      };

      this.log(`Executing: ${command}`);

      exec(command, execOptions, (error, stdout, stderr) => {
        if (error) {
          this.log(`Command failed: ${stderr}`, "ERROR");
          reject(
            `${EXTENSION_NAME}: Failed to execute command "${command}": ${stderr}`
          );
        } else {
          this.log(`Command succeeded`);
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Execute command with timeout
   */
  static execCommandWithTimeout(command, timeoutMs = 30000, options = {}) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Command timed out after ${timeoutMs}ms: ${command}`));
      }, timeoutMs);

      this.execCommand(command, options)
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  static showInformationMessage(message, ...actions) {
    return vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: ${message}`,
      ...actions
    );
  }

  static showWarningMessage(message, ...actions) {
    return vscode.window.showWarningMessage(
      `${EXTENSION_NAME}: ${message}`,
      ...actions
    );
  }

  static showErrorMessage(message, ...actions) {
    this.log(message, "ERROR");
    return vscode.window.showErrorMessage(
      `${EXTENSION_NAME}: ${message}`,
      ...actions
    );
  }

  static async promptForConfirmation(message) {
    const selection = await vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: ${message}`,
      "Yes",
      "No"
    );
    return selection === "Yes";
  }

  /**
   * Show quick pick with common styling
   */
  static async showQuickPick(items, options = {}) {
    return vscode.window.showQuickPick(items, {
      ignoreFocusOut: true,
      ...options,
    });
  }

  /**
   * Debounce function for event handlers
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

module.exports = CommonUtils;
