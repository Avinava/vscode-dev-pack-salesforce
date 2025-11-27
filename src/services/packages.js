import * as vscode from 'vscode';
import { EXTENSION_NAME, REQUIRED_PACKAGES, STATE_KEYS } from '../lib/constants.js';
import * as shell from '../lib/shell.js';
import * as ui from '../lib/ui.js';
import * as environmentService from './environment.js';
import * as pluginService from './sf-plugins.js';

/**
 * Package management service
 * Handles checking and installing required npm packages
 */

/**
 * Manage required packages - check and install if needed
 * @param {vscode.ExtensionContext} context
 */
export async function managePackages(context) {
  try {
    await checkNodeInstallation();
    const missingPackages = await checkRequiredPackages(context);
    
    if (missingPackages.length > 0) {
      const userConfirmed = await ui.confirm(
        `The following node packages will be installed globally: ${missingPackages.join(', ')}. Do you want to proceed?`
      );
      
      if (userConfirmed) {
        await installMissingPackages(missingPackages);
      } else {
        return;
      }
    }
    
    // Only install SF plugins after ensuring @salesforce/cli is installed
    await pluginService.install(context);
  } catch (error) {
    vscode.window.showErrorMessage(String(error));
  }
}

/**
 * Check if Node.js is installed
 * @throws {Error} If Node.js is not installed
 */
async function checkNodeInstallation() {
  const nodeCheck = await environmentService.checkNodeJS();
  if (!nodeCheck.installed) {
    throw new Error(
      `${EXTENSION_NAME}: Node.js is not installed. Please install Node.js to use this extension.`
    );
  }
}

/**
 * Check for required packages and return missing ones
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<string[]>}
 */
async function checkRequiredPackages(context) {
  try {
    const packagesToCheck = REQUIRED_PACKAGES;
    const stdout = await shell.execCommand(`npm list -g ${packagesToCheck.join(' ')}`);

    if (!context.globalState.get(STATE_KEYS.PACKAGES_CHECKED)) {
      ui.showInfo('Required packages are already installed.');
      context.globalState.update(STATE_KEYS.PACKAGES_CHECKED, true);
    }

    return getMissingPackages(stdout, packagesToCheck);
  } catch (error) {
    const stdout = error.message || '';
    const missingPackages = getMissingPackages(stdout, REQUIRED_PACKAGES);
    
    if (missingPackages.length === 0) {
      if (!context.globalState.get(STATE_KEYS.PACKAGES_CHECKED)) {
        ui.showInfo('All required packages are already installed.');
        context.globalState.update(STATE_KEYS.PACKAGES_CHECKED, true);
      }
    }
    
    return missingPackages;
  }
}

/**
 * Parse npm list output to find missing packages
 * @param {string} stdout
 * @param {string[]} packagesToInstall
 * @returns {string[]}
 */
function getMissingPackages(stdout, packagesToInstall) {
  const missingPackages = packagesToInstall.filter((pkg) => !stdout.includes(pkg));

  // Special handling for prettier-plugin-apex (check for alternative package)
  const prettierApexIndex = missingPackages.indexOf('prettier-plugin-apex');
  if (prettierApexIndex !== -1) {
    if (stdout.includes('@ilyamatsuev/prettier-plugin-apex')) {
      missingPackages.splice(prettierApexIndex, 1);
    }
  } else if (
    !stdout.includes('prettier-plugin-apex') &&
    !stdout.includes('@ilyamatsuev/prettier-plugin-apex') &&
    !missingPackages.includes('prettier-plugin-apex')
  ) {
    missingPackages.push('prettier-plugin-apex');
  }

  return missingPackages;
}

/**
 * Install missing npm packages globally
 * @param {string[]} missingPackages
 */
async function installMissingPackages(missingPackages) {
  try {
    const installCommand = `npm install -g ${missingPackages.join(' ')}`;
    await shell.execCommand(installCommand);
    ui.showInfo(`Successfully installed npm packages: ${missingPackages.join(', ')}`);
  } catch (error) {
    throw new Error(`${EXTENSION_NAME}: Failed to install npm packages: ${error.message}`);
  }
}

/**
 * Force check and install packages (ignores cached state)
 * @param {vscode.ExtensionContext} context
 */
export async function forceCheckPackages(context) {
  ui.showInfo('Checking and installing required packages and plugins...');
  context.globalState.update(STATE_KEYS.PACKAGES_CHECKED, false);
  context.globalState.update(STATE_KEYS.SF_PLUGINS_CHECKED, false);
  await managePackages(context);
}
