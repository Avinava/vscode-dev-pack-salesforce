const vscode = require('vscode');
const { exec } = require('child_process');

const EXTENSION_NAME = 'Dev Pack for Salesforce';

function activate(context) {
  console.log(`Congratulations, your extension "${EXTENSION_NAME}" is now active!`);

  // Check if the theme has been set before
  if (!context.globalState.get('dev-pack-salesforce.has-theme-set')) {
    // Set the icon theme to "vscode-icons"
    vscode.workspace.getConfiguration().update('workbench.iconTheme', 'vscode-icons', true);
    // Set the color theme to "One Dark Pro Darker"
    vscode.workspace.getConfiguration().update('workbench.colorTheme', 'One Dark Pro Darker', true);
    // Store that the theme has been set
    context.globalState.update('dev-pack-salesforce.has-theme-set', true);
  }

  // Check if Node.js is installed and install npm packages
  checkAndInstallNodePackages(context);

  // Register the command to force check packages
  let disposable = vscode.commands.registerCommand('dev-pack-salesforce.forceCheckPackages', () => {
    vscode.window.showInformationMessage(`${EXTENSION_NAME}: Checking and installing required packages and plugins...`);
    context.globalState.update('dev-pack-salesforce.packages-checked', false);
    context.globalState.update('dev-pack-salesforce.sfdx-scanner-checked', false);
    checkAndInstallNodePackages(context);
  });

  context.subscriptions.push(disposable);

  // Register the command to update settings.json
  let updateSettingsDisposable = vscode.commands.registerCommand('dev-pack-salesforce.updateSettings', () => {
    updateSettings();
  });

  context.subscriptions.push(updateSettingsDisposable);

  // Check for sfdx-project.json and update settings if enabled
  checkForSfdxProjectAndAutoUpdateSettings(context);

  // Check if autoUpdateSettings is true and if it's a new workspace folder
  const config = vscode.workspace.getConfiguration('devPackSalesforce');
  const autoUpdateSettings = config.get('autoUpdateSettings');
  const isNewWorkspace = !context.globalState.get('dev-pack-salesforce.workspace-initialized');

  if (autoUpdateSettings && isNewWorkspace) {
    updateSettings();
    context.globalState.update('dev-pack-salesforce.workspace-initialized', true);
  }
}

function checkForSfdxProjectAndAutoUpdateSettings(context) {
  const config = vscode.workspace.getConfiguration('devPackSalesforce');
  const autoUpdateSettings = config.get('autoUpdateSettings');

  if (autoUpdateSettings) {
    vscode.workspace.findFiles('sfdx-project.json', '**/node_modules/**', 1).then(files => {
      if (files.length > 0) {
        updateSettings();
      }
    });
  }

  // Prompt user on first install
  if (!context.globalState.get('dev-pack-salesforce.promptedForAutoUpdate')) {
    vscode.window.showInformationMessage(
      `${EXTENSION_NAME}: Do you want to enable auto-formatting for new projects?`,
      'Yes', 'No'
    ).then(selection => {
      if (selection === 'Yes') {
        config.update('autoUpdateSettings', true, vscode.ConfigurationTarget.Global);
      }
      context.globalState.update('dev-pack-salesforce.promptedForAutoUpdate', true);
    });
  }
}

function checkAndInstallNodePackages(context) {
  exec('node -v', (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage(`${EXTENSION_NAME}: Node.js is not installed. Please install Node.js to use this extension.`);
      return;
    }

    // Node.js is installed, check for required packages
    const packagesToCheck = ['@salesforce/cli', 'prettier', '@prettier/plugin-xml', 'prettier-plugin-apex', '@ilyamatsuev/prettier-plugin-apex'];
    const packagesToInstall = ['@salesforce/cli', 'prettier', '@prettier/plugin-xml'];

    exec(`npm list -g ${packagesToCheck.join(' ')}`, (error, stdout, stderr) => {
      if (!error) {
        if (!context.globalState.get('dev-pack-salesforce.packages-checked')) {
          vscode.window.showInformationMessage(`${EXTENSION_NAME}: Required packages are already installed.`);
          context.globalState.update('dev-pack-salesforce.packages-checked', true);
        }
        checkAndInstallSfdxScanner(context);
        return;
      }

      // Check which packages are not installed
      const missingPackages = packagesToInstall.filter(pkg => !stdout.includes(pkg));

      // Check for prettier-plugin-apex and @ilyamatsuev/prettier-plugin-apex
      const hasPrettierPluginApex = stdout.includes('prettier-plugin-apex');
      const hasIlyamatsuevPrettierPluginApex = stdout.includes('@ilyamatsuev/prettier-plugin-apex');

      if (!hasPrettierPluginApex && !hasIlyamatsuevPrettierPluginApex) {
        missingPackages.push('prettier-plugin-apex');
      }

      if (missingPackages.length === 0) {
        if (!context.globalState.get('dev-pack-salesforce.packages-checked')) {
          vscode.window.showInformationMessage(`${EXTENSION_NAME}: All required packages are already installed.`);
          context.globalState.update('dev-pack-salesforce.packages-checked', true);
        }
        checkAndInstallSfdxScanner(context);
        return;
      }

      // Prompt user for confirmation
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: The following node packages will be installed globally: ${missingPackages.join(', ')}. Do you want to proceed?`,
        'Yes', 'No'
      ).then(selection => {
        if (selection === 'Yes') {
          const installCommand = `npm install -g ${missingPackages.join(' ')}`;
          exec(installCommand, (error, stdout, stderr) => {
            if (error) {
              vscode.window.showErrorMessage(`${EXTENSION_NAME}: Failed to install npm packages: ${stderr}`);
              return;
            }
            vscode.window.showInformationMessage(`${EXTENSION_NAME}: Successfully installed npm packages: ${missingPackages.join(', ')}`);
            checkAndInstallSfdxScanner(context);
          });
        }
      });
    });
  });
}

function checkAndInstallSfdxScanner(context) {
  exec('sf plugins', (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage(`${EXTENSION_NAME}: Failed to check Salesforce CLI plugins: ${stderr}`);
      return;
    }

    if (!stdout.includes('@salesforce/sfdx-scanner')) {
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME}: The @salesforce/sfdx-scanner plugin is not installed. Do you want to install it?`,
        'Yes', 'No'
      ).then(selection => {
        if (selection === 'Yes') {
          exec('sf plugins:install @salesforce/sfdx-scanner', (error, stdout, stderr) => {
            if (error) {
              vscode.window.showErrorMessage(`${EXTENSION_NAME}: Failed to install SFDX scanner plugin: ${stderr}`);
              return;
            }
            vscode.window.showInformationMessage(`${EXTENSION_NAME}: Successfully installed SFDX scanner plugin.`);
          });
        }
      });
    } else {
      if (!context.globalState.get('dev-pack-salesforce.sfdx-scanner-checked')) {
        vscode.window.showInformationMessage(`${EXTENSION_NAME}: The @salesforce/sfdx-scanner plugin is already installed. SFDX setup is complete.`);
        context.globalState.update('dev-pack-salesforce.sfdx-scanner-checked', true);
      }
    }
  });
}

function updateSettings() {
  const config = vscode.workspace.getConfiguration();
  const apexSettings = {
    "editor.formatOnSave": true,
    "editor.formatOnPaste": true,
    "editor.detectIndentation": false,
    "editor.tabSize": 2
  };
  const javascriptSettings = {
    "editor.formatOnSave": true,
    "editor.formatOnPaste": true,
    "editor.detectIndentation": false,
    "editor.tabSize": 2,
  };

  config.update('[apex]', apexSettings, vscode.ConfigurationTarget.Workspace);
  config.update('[javascript]', javascriptSettings, vscode.ConfigurationTarget.Workspace);

  vscode.window.showInformationMessage(`${EXTENSION_NAME}: Updated prettier settings for Apex and JavaScript.`);
}

exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
}