const vscode = require('vscode');

function activate(context) {
  console.log('Congratulations, your extension "Dev Pack for Salesforce" is now active!');
  // Check if the theme has been set before
  if (!context.globalState.get('dev-pack-salesforce.has-theme-set')) {
    // Set the icon theme to "vscode-icons"
    vscode.workspace.getConfiguration().update('workbench.iconTheme', 'vscode-icons', true);
    // Set the color theme to "One Dark Pro Darker"
    vscode.workspace.getConfiguration().update('workbench.colorTheme', 'One Dark Pro Darker', true);
    // Store that the theme has been set
    context.globalState.update('dev-pack-salesforce.has-theme-set', true);
  }
}

exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
}