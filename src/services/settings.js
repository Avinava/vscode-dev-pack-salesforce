import * as vscode from 'vscode';
import {
  APEX_SETTINGS,
  JAVASCRIPT_SETTINGS,
  BETTER_COMMENTS_TAGS,
  STATE_KEYS,
  EXTENSION_NAME,
} from '../lib/constants.js';
import * as ui from '../lib/ui.js';

/**
 * Settings management service
 * Handles workspace and global settings configuration
 */

// ============================================================================
// Better Comments Settings
// ============================================================================

/**
 * Update Better Comments extension settings globally
 */
export function updateBetterCommentsSettings() {
  const config = vscode.workspace.getConfiguration();
  config.update('better-comments.tags', BETTER_COMMENTS_TAGS, vscode.ConfigurationTarget.Global);
  ui.showInfo('Updated Better Comments settings globally.');
}

// ============================================================================
// Workspace Settings (Prettier/Formatting)
// ============================================================================

/**
 * Check and update workspace settings if auto-update is enabled
 * @param {vscode.ExtensionContext} context
 */
export function checkAndUpdateWorkspaceSettings(context) {
  const config = vscode.workspace.getConfiguration('devPackSalesforce');
  const autoUpdateSettings = config.get('autoUpdateSettings');
  const isNewWorkspace = !context.globalState.get(STATE_KEYS.WORKSPACE_INITIALIZED);

  if (autoUpdateSettings && isNewWorkspace) {
    updateWorkspaceSettings();
    context.globalState.update(STATE_KEYS.WORKSPACE_INITIALIZED, true);
  }
}

/**
 * Update workspace settings for Apex and JavaScript
 */
export function updateWorkspaceSettings() {
  const config = vscode.workspace.getConfiguration();

  config.update('[apex]', APEX_SETTINGS, vscode.ConfigurationTarget.Workspace);
  config.update('[javascript]', JAVASCRIPT_SETTINGS, vscode.ConfigurationTarget.Workspace);

  updateBetterCommentsSettings();

  ui.showInfo('Updated settings for Apex and JavaScript');
}

// ============================================================================
// Settings Manager (Auto-update prompts)
// ============================================================================

/**
 * Manage settings and prompt for auto-update preference
 * @param {vscode.ExtensionContext} context
 */
export async function manageSettings(context) {
  try {
    const config = vscode.workspace.getConfiguration('devPackSalesforce');
    const autoUpdateSettings = config.get('autoUpdateSettings');

    if (autoUpdateSettings) {
      const files = await findSfdxProjectFiles();
      if (files.length > 0) {
        updateWorkspaceSettings();
      }
    }

    if (!context.globalState.get(STATE_KEYS.PROMPTED_AUTO_UPDATE)) {
      const userConfirmed = await promptForAutoUpdate();
      if (userConfirmed) {
        await config.update('autoUpdateSettings', true, vscode.ConfigurationTarget.Global);
      }
      await context.globalState.update(STATE_KEYS.PROMPTED_AUTO_UPDATE, true);
    }
  } catch (error) {
    vscode.window.showErrorMessage(String(error));
  }
}

/**
 * Find sfdx-project.json files in workspace
 * @returns {Promise<vscode.Uri[]>}
 */
function findSfdxProjectFiles() {
  return vscode.workspace.findFiles('sfdx-project.json', '**/node_modules/**', 1);
}

/**
 * Prompt user for auto-update preference
 * @returns {Promise<boolean>}
 */
function promptForAutoUpdate() {
  return new Promise((resolve) => {
    vscode.window
      .showInformationMessage(
        `${EXTENSION_NAME}: Do you want to enable auto-formatting for new projects?`,
        'Yes',
        'No'
      )
      .then((selection) => {
        resolve(selection === 'Yes');
      });
  });
}

// ============================================================================
// Initial Setup
// ============================================================================

/**
 * Run initial setup tasks for new installations
 * @param {vscode.ExtensionContext} context
 */
export async function runInitialSetup(context) {
  try {
    await setInitialTheme(context);
    await setInitialBetterComments(context);
  } catch (error) {
    vscode.window.showErrorMessage(String(error));
  }
}

/**
 * Set initial theme for new installations
 * @param {vscode.ExtensionContext} context
 */
async function setInitialTheme(context) {
  if (!context.globalState.get(STATE_KEYS.THEME_SET)) {
    await vscode.workspace
      .getConfiguration()
      .update('workbench.iconTheme', 'vscode-icons', true);
    await vscode.workspace
      .getConfiguration()
      .update('workbench.colorTheme', 'One Dark Pro Darker', true);
    context.globalState.update(STATE_KEYS.THEME_SET, true);
  }
}

/**
 * Set initial Better Comments settings for new installations
 * @param {vscode.ExtensionContext} context
 */
async function setInitialBetterComments(context) {
  if (!context.globalState.get(STATE_KEYS.BETTER_COMMENTS_SET)) {
    updateBetterCommentsSettings();
    await context.globalState.update(STATE_KEYS.BETTER_COMMENTS_SET, true);
  }
}
