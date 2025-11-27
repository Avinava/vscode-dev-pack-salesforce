import * as vscode from 'vscode';
import { REQUIRED_SF_PLUGINS, STATE_KEYS } from '../lib/constants.js';
import * as shell from '../lib/shell.js';
import * as ui from '../lib/ui.js';

/**
 * Salesforce CLI plugin management service
 */

/**
 * Install required SF CLI plugins
 * @param {vscode.ExtensionContext} context
 */
export async function install(context) {
  try {
    await verifySfCliInstalled();

    const plugins = await shell.execCommand('sf plugins');
    const pluginsToInstall = [];

    for (const plugin of REQUIRED_SF_PLUGINS) {
      if (!plugins.includes(plugin)) {
        pluginsToInstall.push(plugin);
      }
    }

    if (pluginsToInstall.length > 0) {
      const userConfirmed = await ui.confirm(
        `The following SF plugins will be installed: ${pluginsToInstall.join(', ')}. Do you want to proceed?`
      );
      
      if (userConfirmed) {
        await installPlugins(pluginsToInstall);
      }
    } else {
      if (!context.globalState.get(STATE_KEYS.SF_PLUGINS_CHECKED)) {
        ui.showInfo('All required SF plugins are already installed. SF setup is complete.');
        context.globalState.update(STATE_KEYS.SF_PLUGINS_CHECKED, true);
      }
    }
  } catch (error) {
    vscode.window.showErrorMessage(String(error));
  }
}

/**
 * Verify that SF CLI is installed
 * @throws {Error} If SF CLI is not available
 */
async function verifySfCliInstalled() {
  try {
    await shell.execCommand('sf --version');
  } catch {
    throw new Error(
      'Salesforce CLI (sf) is not available. Please ensure @salesforce/cli is installed first.'
    );
  }
}

/**
 * Install SF CLI plugins
 * @param {string[]} pluginsToInstall
 */
async function installPlugins(pluginsToInstall) {
  try {
    for (const plugin of pluginsToInstall) {
      await shell.execCommand(`sf plugins install ${plugin}`);
    }
    ui.showInfo(`Successfully installed SF plugins: ${pluginsToInstall.join(', ')}`);
  } catch (error) {
    throw new Error(`Failed to install SF plugins: ${error.message}`);
  }
}
