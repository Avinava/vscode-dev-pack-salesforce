# Dev Pack for Salesforce

<img src="./assets/dev-tools-icon.jpg" height="150px"/>

Dev Pack for Salesforce is a collection of useful VS Code extensions for Salesforce development. The pack includes extensions for Apex, Lightning Web Components (LWC), SOQL queries, and general development features.

## Included Extensions

- [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-expanded)
  - [Salesforce CLI Integration](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-core) - This extension (salesforcedx-vscode-core) interacts with Salesforce CLI to provide core functionality.
  - [Salesforce Apex](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-apex) - This extension (salesforcedx-vscode-apex) uses the Apex Language Server to provide features such as syntax highlighting and code completion.
  - [Apex Interactive Debugger](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-apex-debugger) - This extension (salesforcedx-vscode-apex-debugger) enables VS Code to use the real-time Apex Debugger with your scratch orgs or to use ISV Customer Debugger for your subscribers’ orgs.
  - [Apex Replay Debugger](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-apex-replay-debugger) - This extension (salesforcedx-vscode-apex-replay-debugger) enables VS Code to replay Apex execution from Apex debug logs.
  - [Salesforce Lightning Web Components](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-lwc) - This extension supports Lightning web component bundles. It uses the HTML language server from VS Code.
  - [Aura Components](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-lightning) - This extension (salesforcedx-vscode-lightning) supports Aura component bundles. It uses the HTML language server from VS Code.
  - [Visualforce](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-visualforce) - This extension (salesforcedx-vscode-visualforce) supports Visualforce pages and components. It uses the Visualforce Language Server and the HTML language server from VS Code.
  - [SOQL](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-soql) - This extension (salesforcedx-vscode-soql) enables you to interactively build a SOQL query via a form-based visual editor, view the query as you build, and save the output to a .csv or .json file.
  - [Salesforce Lightning Design System (SLDS) Validator](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-slds) - This extension (salesforcedx-vscode-slds) simplifies working with the Salesforce Lightning Design System (SLDS). It provides code completion, syntax highlighting, and validation with recommended tokens and utility classes.
  - [Agentforce for Developers](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-einstein-gpt) - This extension (salesforcedx-einstein-gpt) uses generative AI to make Salesforce development in Visual Studio Code richer with features such as natural language to code generation, inline autocompletion for Apex and LWC code, and test case generation for Apex classes.
  - [Salesforce Code Analyzer](https://marketplace.visualstudio.com/items?itemName=salesforce.sfdx-code-analyzer-vscode) - This extension (sfdx-code-analyzer-vscode) scans your code using multiple rule engines to produce lists of violations that you can use to improve your code.
  - [Apex Log Analyzer](https://marketplace.visualstudio.com/items?itemName=financialforce.lana) - This extension helps you analyze Apex logs.
- [One Dark Pro Theme](https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme) - A popular dark theme for Visual Studio Code.
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - An opinionated code formatter that enforces a consistent style.
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Integrates ESLint JavaScript into VS Code.
- [VSCode Icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons) - Adds icons to the Visual Studio Code editor.
- [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) - Improves your comment annotations with different colors.
- [Indent Rainbow](https://marketplace.visualstudio.com/items?itemName=oderwat.indent-rainbow) - Makes indentation levels more readable with color coding.
- [Markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) - Provides Markdown linting and style checking.
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) - A basic spell checker that works well with code.
- [Lightning Flow Scanner](https://marketplace.visualstudio.com/items?itemName=ForceConfigControl.lightningflowscanner) - Scans and validates Salesforce Lightning Flows.
- [Log File Highlighter](https://marketplace.visualstudio.com/items?itemName=emilast.LogFileHighlighter) - Highlights log files to make them easier to read.

## Installation

1. Launch Visual Studio Code
2. Go to View → Extensions
3. Search for `Dev Pack for Salesforce`
4. Click on Install
5. Reload Visual Studio Code to complete the installation.

## Automatic Theme and Icon Setup

On the first installation, Dev Pack for Salesforce automatically sets the following themes and icons:

- Icon theme: `vscode-icons`
- Color theme: `One Dark Pro Darker`

<img src="./assets/vscode-icons.png" height="250px"/>

This setup is only done the first time the extension is installed. Feel free to change after the initial setup.

## Automatic Package Detection and Installation

The Dev Pack for Salesforce simplifies and automates the setup of your developer environment. Upon installation, the pack automatically detects and installs required npm packages, as long as Node.js is installed in your system. The required npm packages include:


- `@salesforce/cli`
- `prettier`
- `@prettier/plugin-xml`
- `prettier-plugin-apex`

### Manual Trigger

You can manually trigger the package installation process by running the following command:

```json
{
  "command": "dev-pack-salesforce.forceCheckPackages",
  "title": "Dev Pack for Salesforce: Install required node modules"
}
```

To run this command:

- Open the Command Palette (View → Command Palette or Cmd+Shift+P).
- Type Dev Pack for Salesforce: Install required node modules and select it.

## Update Prettier Settings

This command updates the Prettier settings for Apex and JavaScript files in your workspace which enables formatting using prettier and features like format on save.
You can manually update the Prettier settings by running the following command:

```json
{
  "command": "dev-pack-salesforce.updateSettings",
  "title": "Dev Pack for Salesforce: Update prettier formatting settings"
}
```

To run this command:

- Open the Command Palette (View → Command Palette or Cmd+Shift+P).
- Type Dev Pack for Salesforce: Update prettier formatting settings and select it.

## Update Better Comments Settings

This introduces some comment highlighting tags which helps improve readability.
Try some of these:

```apex
// ? this is a question
// > this is a highlighted note
// ! this is an alert
// // strike through the code
// todo: this is a todo
// fixme: this is a fixme
// note: this is a note
// deprecated: this is a deprecated
// important: this is an important
// # this is information
// * this is a important note

```

<img src="./assets/better-comments.png"/>


You can manually update the Better Comments settings by running the following command:

```json
{
  "command": "dev-pack-salesforce.updateBetterCommentsSettings",
  "title": "Dev Pack for Salesforce: Update better comments settings"
}
```

To run this command:

- Open the Command Palette (View → Command Palette or Cmd+Shift+P).
- Type Dev Pack for Salesforce: Update better comments settings and select it.


## Usage

After installing Dev Pack for Salesforce, you will have access to all the included extensions. Simply open a Salesforce project and start developing!

## License

This extension pack is licensed under the MIT License. See the LICENSE file for more information.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please open an issue or a pull request on GitHub.
