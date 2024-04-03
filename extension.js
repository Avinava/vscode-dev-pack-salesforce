const vscode = require('vscode');

function activate(context) {
  console.log('Congratulations, your extension "Dev Pack for Salesforce" is now active!');
  vscode.workspace.getConfiguration().update('workbench.iconTheme', 'vscode-icons', true);
  vscode.workspace.getConfiguration().update('workbench.colorTheme', 'One Dark Pro Darker', true);
}

exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
}