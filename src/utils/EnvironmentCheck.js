const vscode = require("vscode");
const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");
const fs = require("fs").promises;
const CommonUtils = require("./CommonUtils");
const { EXTENSION_NAME } = require("./constants");

const execAsync = promisify(exec);

class EnvironmentCheck {
  /**
   * Check if Java is installed and get version
   */
  static async checkJava() {
    try {
      const { stdout } = await execAsync("java -version 2>&1");
      const versionMatch = stdout.match(/version "(.+?)"/);
      if (versionMatch) {
        const version = versionMatch[1];
        const majorVersion = parseInt(version.split(".")[0]);
        return {
          installed: true,
          version: version,
          majorVersion: majorVersion,
          valid: majorVersion >= 11, // Salesforce requires Java 11+
          path: await this.getJavaPath(),
        };
      }
      return { installed: false, valid: false };
    } catch (error) {
      // Java might be installed but not in PATH
      return { installed: false, valid: false, error: error.message };
    }
  }

  /**
   * Get Java installation path
   */
  static async getJavaPath() {
    try {
      const isWindows = process.platform === "win32";
      const command = isWindows ? "where java" : "which java";
      const { stdout } = await execAsync(command);
      return stdout.trim().split("\n")[0];
    } catch (error) {
      return null;
    }
  }

  /**
   * Find Java installations on the system
   */
  static async findJavaInstallations() {
    const installations = [];
    const platform = process.platform;

    try {
      if (platform === "darwin") {
        // macOS - check common locations
        const { stdout } = await execAsync(
          "/usr/libexec/java_home -V 2>&1 || true"
        );
        const matches = stdout.matchAll(/^\s+(.+?)\s*$/gm);
        for (const match of matches) {
          if (match[1].includes("Java") || match[1].includes("jdk")) {
            installations.push(match[1].trim());
          }
        }

        // Also try to get the default JAVA_HOME
        try {
          const { stdout: javaHome } = await execAsync(
            "/usr/libexec/java_home"
          );
          if (javaHome.trim()) {
            installations.push(javaHome.trim());
          }
        } catch (e) {
          // Ignore if not found
        }
      } else if (platform === "win32") {
        // Windows - check Program Files
        const programFiles = [
          process.env["ProgramFiles"],
          process.env["ProgramFiles(x86)"],
        ];

        for (const pf of programFiles) {
          if (!pf) continue;
          try {
            const javaDir = path.join(pf, "Java");
            const dirs = await fs.readdir(javaDir);
            for (const dir of dirs) {
              if (
                dir.toLowerCase().includes("jdk") ||
                dir.toLowerCase().includes("jre")
              ) {
                installations.push(path.join(javaDir, dir));
              }
            }
          } catch (e) {
            // Directory doesn't exist
          }
        }
      } else {
        // Linux - check common locations
        const commonPaths = [
          "/usr/lib/jvm",
          "/usr/java",
          "/opt/jdk",
          "/opt/java",
        ];

        for (const javaPath of commonPaths) {
          try {
            const dirs = await fs.readdir(javaPath);
            for (const dir of dirs) {
              installations.push(path.join(javaPath, dir));
            }
          } catch (e) {
            // Directory doesn't exist
          }
        }
      }
    } catch (error) {
      console.error("Error finding Java installations:", error);
    }

    return [...new Set(installations)]; // Remove duplicates
  }

  /**
   * Prompt user to update Java PATH
   */
  static async promptJavaPathUpdate() {
    const javaCheck = await this.checkJava();

    if (javaCheck.installed && javaCheck.valid) {
      return true; // Java is already configured correctly
    }

    const installations = await this.findJavaInstallations();

    if (installations.length === 0) {
      const install = await vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: Java 11+ is not installed. Salesforce Apex Language Server requires Java 11 or higher.`,
        "Install Java",
        "Remind Me Later"
      );

      if (install === "Install Java") {
        vscode.env.openExternal(
          vscode.Uri.parse(
            "https://www.oracle.com/java/technologies/downloads/"
          )
        );
      }
      return false;
    }

    // Found Java installations, offer to update PATH
    const options = installations.map((install) => ({
      label: path.basename(install),
      detail: install,
    }));

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Select Java installation to add to your PATH",
      ignoreFocusOut: true,
    });

    if (selected) {
      await this.showPathUpdateInstructions(selected.detail);
    }

    return false;
  }

  /**
   * Show instructions to update PATH for Java
   */
  static async showPathUpdateInstructions(javaPath) {
    const platform = process.platform;
    const binPath = path.join(javaPath, "bin");

    let instructions = "";

    if (platform === "darwin" || platform === "linux") {
      const shell = process.env.SHELL || "/bin/bash";
      const configFile = shell.includes("zsh")
        ? "~/.zshrc"
        : shell.includes("fish")
          ? "~/.config/fish/config.fish"
          : shell.includes("nu")
            ? "~/.config/nushell/env.nu"
            : "~/.bashrc";

      if (shell.includes("nu")) {
        instructions = `Add this to your ${configFile}:\n\n$env.JAVA_HOME = "${javaPath}"\n$env.PATH = ($env.PATH | prepend "${binPath}")\n\nThen restart your terminal or run: source ${configFile}`;
      } else {
        instructions = `Add this to your ${configFile}:\n\nexport JAVA_HOME="${javaPath}"\nexport PATH="$JAVA_HOME/bin:$PATH"\n\nThen restart your terminal or run: source ${configFile}`;
      }
    } else {
      instructions = `Add to your System Environment Variables:\n\nJAVA_HOME=${javaPath}\n\nAnd add to PATH:\n%JAVA_HOME%\\bin\n\nThen restart VS Code.`;
    }

    const action = await vscode.window.showInformationMessage(
      `To use Java with Salesforce extensions, update your PATH:`,
      "Copy Instructions",
      "Open Guide"
    );

    if (action === "Copy Instructions") {
      await vscode.env.clipboard.writeText(instructions);
      CommonUtils.showInformationMessage("Instructions copied to clipboard!");
    } else if (action === "Open Guide") {
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://developer.salesforce.com/tools/vscode/en/vscode-desktop/java-setup"
        )
      );
    }
  }

  /**
   * Check Salesforce CLI installation and version
   */
  static async checkSalesforceCLI() {
    try {
      const { stdout } = await execAsync("sf --version");
      const versionMatch = stdout.match(/@salesforce\/cli\/(\d+\.\d+\.\d+)/);

      if (versionMatch) {
        const version = versionMatch[1];
        return {
          installed: true,
          version: version,
          output: stdout.trim(),
        };
      }

      return { installed: true, version: "unknown", output: stdout.trim() };
    } catch (error) {
      return { installed: false, error: error.message };
    }
  }

  /**
   * Prompt to install or update Salesforce CLI
   */
  static async promptSalesforceCLIUpdate(cliCheck) {
    if (!cliCheck.installed) {
      const install = await vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: Salesforce CLI (sf) is not installed.`,
        "Install via npm",
        "Download Installer",
        "Remind Me Later"
      );

      if (install === "Install via npm") {
        const terminal = vscode.window.createTerminal("SF CLI Installation");
        terminal.show();
        terminal.sendText("npm install -g @salesforce/cli");
      } else if (install === "Download Installer") {
        vscode.env.openExternal(
          vscode.Uri.parse(
            "https://developer.salesforce.com/tools/salesforcecli"
          )
        );
      }
      return false;
    }

    // Check for updates
    const update = await vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: Salesforce CLI v${cliCheck.version} is installed. Check for updates?`,
      "Update Now",
      "Check Version",
      "Later"
    );

    if (update === "Update Now") {
      const terminal = vscode.window.createTerminal("SF CLI Update");
      terminal.show();
      terminal.sendText("npm update -g @salesforce/cli");
      return true;
    } else if (update === "Check Version") {
      const terminal = vscode.window.createTerminal("SF CLI Version");
      terminal.show();
      terminal.sendText("sf version --verbose");
      return true;
    }

    return true;
  }

  /**
   * Check Node.js version
   */
  static async checkNodeJS() {
    try {
      const { stdout } = await execAsync("node --version");
      const version = stdout.trim().replace("v", "");
      const majorVersion = parseInt(version.split(".")[0]);

      return {
        installed: true,
        version: version,
        majorVersion: majorVersion,
        valid: majorVersion >= 18, // Salesforce recommends Node 18+
      };
    } catch (error) {
      return { installed: false, valid: false, error: error.message };
    }
  }

  /**
   * Check Prettier and plugins installation
   */
  static async checkPrettier() {
    try {
      const { stdout } = await execAsync(
        "npm list -g prettier prettier-plugin-apex @prettier/plugin-xml 2>&1"
      );
      return this.parsePrettierOutput(stdout);
    } catch (error) {
      // npm list returns non-zero if packages missing, parse output anyway
      const output = error.stdout || error.message || "";
      return this.parsePrettierOutput(output);
    }
  }

  /**
   * Parse Prettier npm list output
   */
  static parsePrettierOutput(output) {
    const hasPrettier = output.includes("prettier@");
    const hasApexPlugin =
      output.includes("prettier-plugin-apex") ||
      output.includes("@ilyamatsuev/prettier-plugin-apex");
    const hasXmlPlugin = output.includes("@prettier/plugin-xml");

    // Extract version if available
    const versionMatch = output.match(/prettier@(\d+\.\d+\.\d+)/);
    const version = versionMatch ? versionMatch[1] : null;

    const missingPlugins = [];
    if (!hasApexPlugin) missingPlugins.push("prettier-plugin-apex");
    if (!hasXmlPlugin) missingPlugins.push("@prettier/plugin-xml");

    return {
      installed: hasPrettier,
      version,
      hasApexPlugin,
      hasXmlPlugin,
      allPlugins: hasPrettier && hasApexPlugin && hasXmlPlugin,
      missingPlugins,
    };
  }

  /**
   * Prompt to install Prettier and plugins
   */
  static async promptPrettierInstall(prettierCheck) {
    if (prettierCheck.allPlugins) {
      return true; // Everything is installed
    }

    const missing = [];
    if (!prettierCheck.installed) missing.push("prettier");
    missing.push(...prettierCheck.missingPlugins);

    const install = await vscode.window.showWarningMessage(
      `${EXTENSION_NAME}: Missing Prettier packages: ${missing.join(", ")}`,
      "Install Now",
      "Later"
    );

    if (install === "Install Now") {
      const terminal = vscode.window.createTerminal("Prettier Installation");
      terminal.show();
      terminal.sendText(`npm install -g ${missing.join(" ")}`);
      return true;
    }

    return false;
  }

  /**
   * Prompt for Node.js installation or update
   */
  static async promptNodeJSUpdate(nodeCheck) {
    if (!nodeCheck.installed) {
      const install = await vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: Node.js is not installed.`,
        "Download Node.js",
        "Remind Me Later"
      );

      if (install === "Download Node.js") {
        vscode.env.openExternal(vscode.Uri.parse("https://nodejs.org/"));
      }
      return false;
    }

    if (!nodeCheck.valid) {
      const upgrade = await vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: Node.js v${nodeCheck.version} is installed. Salesforce recommends Node.js v18 or higher.`,
        "Download Latest",
        "Continue Anyway"
      );

      if (upgrade === "Download Latest") {
        vscode.env.openExternal(vscode.Uri.parse("https://nodejs.org/"));
        return false;
      }
    }

    return true;
  }

  /**
   * Check if current workspace is a Salesforce DX project
   */
  static async isSalesforceDXProject() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return false;
    }

    for (const folder of workspaceFolders) {
      const sfdxProjectPath = path.join(folder.uri.fsPath, "sfdx-project.json");
      try {
        await fs.access(sfdxProjectPath);
        return true;
      } catch (error) {
        // File doesn't exist, continue checking
      }
    }

    return false;
  }

  /**
   * Get Salesforce project information
   */
  static async getSalesforceProjectInfo() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return null;
    }

    for (const folder of workspaceFolders) {
      const sfdxProjectPath = path.join(folder.uri.fsPath, "sfdx-project.json");
      try {
        const content = await fs.readFile(sfdxProjectPath, "utf8");
        const projectData = JSON.parse(content);
        return {
          path: sfdxProjectPath,
          name: projectData.name || "Unnamed Project",
          namespace: projectData.namespace || "",
          sourceApiVersion: projectData.sourceApiVersion || "unknown",
          packageDirectories: projectData.packageDirectories || [],
        };
      } catch (error) {
        // File doesn't exist or is invalid, continue checking
      }
    }

    return null;
  }

  /**
   * Run comprehensive environment health check
   */
  static async runHealthCheck(silent = false) {
    const results = {
      java: null,
      node: null,
      salesforceCLI: null,
      prettier: null,
      isSFDXProject: false,
      projectInfo: null,
    };

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Checking development environment...",
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: "Checking Node.js..." });
        results.node = await this.checkNodeJS();

        progress.report({ message: "Checking Java..." });
        results.java = await this.checkJava();

        progress.report({ message: "Checking Salesforce CLI..." });
        results.salesforceCLI = await this.checkSalesforceCLI();

        progress.report({ message: "Checking Prettier..." });
        results.prettier = await this.checkPrettier();

        progress.report({ message: "Checking project type..." });
        results.isSFDXProject = await this.isSalesforceDXProject();

        if (results.isSFDXProject) {
          results.projectInfo = await this.getSalesforceProjectInfo();
        }
      }
    );

    if (!silent) {
      await this.displayHealthCheckResults(results);
    }

    return results;
  }

  /**
   * Display health check results
   */
  static async displayHealthCheckResults(results) {
    const issues = [];
    const warnings = [];
    const info = [];

    // Node.js check
    if (!results.node.installed) {
      issues.push("❌ Node.js is not installed");
    } else if (!results.node.valid) {
      warnings.push(`⚠️  Node.js v${results.node.version} (recommend v18+)`);
    } else {
      info.push(`✅ Node.js v${results.node.version}`);
    }

    // Java check
    if (!results.java.installed) {
      warnings.push("⚠️  Java is not in PATH (needed for Apex features)");
    } else if (!results.java.valid) {
      warnings.push(`⚠️  Java ${results.java.version} (recommend 11+)`);
    } else {
      info.push(`✅ Java ${results.java.version}`);
    }

    // Salesforce CLI check
    if (!results.salesforceCLI.installed) {
      issues.push("❌ Salesforce CLI is not installed");
    } else {
      info.push(`✅ Salesforce CLI v${results.salesforceCLI.version}`);
    }

    // Prettier check
    if (!results.prettier.installed) {
      warnings.push("⚠️  Prettier is not installed (needed for formatting)");
    } else if (!results.prettier.allPlugins) {
      warnings.push(
        `⚠️  Prettier missing plugins: ${results.prettier.missingPlugins.join(", ")}`
      );
    } else {
      info.push(
        `✅ Prettier v${results.prettier.version} with Apex & XML plugins`
      );
    }

    // Project info
    if (results.isSFDXProject && results.projectInfo) {
      info.push(`\n📦 SFDX Project: ${results.projectInfo.name}`);
      info.push(`   API Version: ${results.projectInfo.sourceApiVersion}`);
    } else {
      info.push("\nℹ️  Not in a Salesforce DX project");
    }

    const message = [...issues, ...warnings, ...info].join("\n");

    if (issues.length > 0) {
      const action = await vscode.window.showErrorMessage(
        `Environment Check:\n${message}`,
        "Fix Issues",
        "Dismiss"
      );

      if (action === "Fix Issues") {
        await this.fixEnvironmentIssues(results);
      }
    } else if (warnings.length > 0) {
      vscode.window.showWarningMessage(`Environment Check:\n${message}`, "OK");
    } else {
      CommonUtils.showInformationMessage(`Environment Check:\n${message}`);
    }
  }

  /**
   * Guide user to fix environment issues
   */
  static async fixEnvironmentIssues(results) {
    if (!results.node.installed || !results.node.valid) {
      await this.promptNodeJSUpdate(results.node);
    }

    if (!results.java.installed || !results.java.valid) {
      await this.promptJavaPathUpdate();
    }

    if (!results.salesforceCLI.installed) {
      await this.promptSalesforceCLIUpdate(results.salesforceCLI);
    }

    if (!results.prettier.installed || !results.prettier.allPlugins) {
      await this.promptPrettierInstall(results.prettier);
    }
  }

  /**
   * Run environment check on startup (non-intrusive)
   */
  static async runStartupCheck(context) {
    const hasRunCheck = context.globalState.get(
      "dev-pack-salesforce.env-check-completed"
    );

    // Only run detailed check once, or if user hasn't seen it
    if (hasRunCheck) {
      // Quick silent check for critical issues only
      const results = await this.runHealthCheck(true);

      // Only alert on critical issues
      if (!results.salesforceCLI.installed || !results.node.installed) {
        const action = await vscode.window.showWarningMessage(
          `${EXTENSION_NAME}: Missing critical dependencies. Run environment check?`,
          "Check Now",
          "Dismiss"
        );

        if (action === "Check Now") {
          await this.runHealthCheck(false);
        }
      }
    } else {
      // First time - run full check
      await this.runHealthCheck(false);
      context.globalState.update(
        "dev-pack-salesforce.env-check-completed",
        true
      );
    }
  }
}

module.exports = EnvironmentCheck;
