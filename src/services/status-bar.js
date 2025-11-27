import * as vscode from 'vscode';
import * as environmentService from './environment.js';

// Salesforce cloud icon using codicon
const SF_ICON = '$(cloud)';

/**
 * Status bar service
 * Manages the Salesforce environment status bar item
 */

let statusBarItem = null;
let isHealthy = true;

/**
 * Initialize the status bar item
 * @param {vscode.ExtensionContext} context
 * @returns {vscode.StatusBarItem}
 */
export function initialize(context) {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'dev-pack-salesforce.checkEnvironment';
  statusBarItem.tooltip = 'Click to check Salesforce environment health';
  statusBarItem.name = 'Salesforce Dev Pack';
  context.subscriptions.push(statusBarItem);

  // Initial update
  updateStatus();

  return statusBarItem;
}

/**
 * Get the status bar item
 * @returns {vscode.StatusBarItem | null}
 */
export function getStatusBarItem() {
  return statusBarItem;
}

/**
 * Check if environment is healthy
 * @returns {boolean}
 */
export function getIsHealthy() {
  return isHealthy;
}

/**
 * Update status bar based on environment health
 * @param {Object | null} results - Optional pre-computed results
 */
export async function updateStatus(results = null) {
  if (!statusBarItem) return;

  // Check if status bar is enabled in settings
  const config = vscode.workspace.getConfiguration('devPackSalesforce');
  if (!config.get('showStatusBar', true)) {
    statusBarItem.hide();
    return;
  }

  // Quick check if results not provided
  if (!results) {
    const isSFDX = await environmentService.isSalesforceDXProject();
    if (!isSFDX) {
      statusBarItem.hide();
      return;
    }

    results = {
      node: await environmentService.checkNodeJS(),
      java: await environmentService.checkJava(),
      salesforceCLI: await environmentService.checkSalesforceCLI(),
      prettier: await environmentService.checkPrettier(),
    };
  }

  const issues = [];
  const warnings = [];

  // Critical issues
  if (!results.node?.installed) issues.push('Node.js');
  if (!results.salesforceCLI?.installed) issues.push('SF CLI');

  // Warnings (non-critical but recommended)
  if (!results.java?.installed) warnings.push('Java');
  if (!results.prettier?.installed) warnings.push('Prettier');
  if (results.prettier?.installed && !results.prettier?.allPlugins) {
    warnings.push('Prettier plugins');
  }

  if (issues.length > 0) {
    // Critical issues - red/error state
    statusBarItem.text = `${SF_ICON} ${issues.length} error(s)`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    statusBarItem.color = undefined;
    statusBarItem.tooltip = `❌ Missing: ${issues.join(', ')}${warnings.length > 0 ? `\n⚠️ Warnings: ${warnings.join(', ')}` : ''}\n\nClick to fix issues.`;
    isHealthy = false;
  } else if (warnings.length > 0) {
    // Warnings only - yellow state
    statusBarItem.text = `${SF_ICON} ${warnings.length} warning(s)`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    statusBarItem.color = undefined;
    statusBarItem.tooltip = `⚠️ Warnings: ${warnings.join(', ')}\n\nClick to view details.`;
    isHealthy = true;
  } else {
    // All good - normal state with Salesforce blue
    statusBarItem.text = `${SF_ICON} SF Ready`;
    statusBarItem.backgroundColor = undefined;
    statusBarItem.color = new vscode.ThemeColor('charts.blue');
    statusBarItem.tooltip =
      '✅ Salesforce environment is healthy\n\n• Node.js ✓\n• SF CLI ✓\n• Java ✓\n• Prettier ✓\n\nClick for details.';
    isHealthy = true;
  }

  statusBarItem.show();
}

/**
 * Show a temporary message in status bar
 * @param {string} message
 * @param {number} timeout - Timeout in ms
 */
export function showMessage(message, timeout = 3000) {
  if (!statusBarItem) return;

  const originalText = statusBarItem.text;
  statusBarItem.text = `${SF_ICON} ${message}`;

  setTimeout(() => {
    if (statusBarItem) {
      statusBarItem.text = originalText;
    }
  }, timeout);
}

/**
 * Force refresh the status bar
 */
export async function refresh() {
  await updateStatus(null);
}

/**
 * Hide the status bar
 */
export function hide() {
  if (statusBarItem) {
    statusBarItem.hide();
  }
}
