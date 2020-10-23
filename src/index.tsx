import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
  NotebookPanel,
  INotebookTracker
} from '@jupyterlab/notebook';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { IoTSideBar } from './iot-notebook-sidebar';

import { ContentFactoryWithFooterButton, activateCommands } from './iot-notebook-cell'

/**
 * Initialization data for the iot-notebook:sidebar extension.
 */
const iotsidebar: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook:sidebar',
  autoStart: true,
  requires: [ICommandPalette, IMainMenu, ILabShell],
  optional: [ILauncher],
  provides: NotebookPanel.IContentFactory,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension iot-notebook:sidebar is activated!');

    const { shell } = app;
    const content = new IoTSideBar();
    shell.add(content, 'left', { rank: 1000 });
  }
};

/**
 * Initialization data for the iot-notebook:cell extension.
 */
const iotcell: JupyterFrontEndPlugin<NotebookPanel.IContentFactory> = {
  id: 'iot-notebook:cell',
  provides: NotebookPanel.IContentFactory,
  requires: [IEditorServices],
  autoStart: true,
  activate: (app: JupyterFrontEnd, editorServices: IEditorServices) => {
    // tslint:disable-next-line:no-console
    console.log('JupyterLab extension iot-notebook:cell is activated!');

    const { commands } = app;
    const editorFactory = editorServices.factoryService.newInlineEditor;
    return new ContentFactoryWithFooterButton(commands, { editorFactory });
  }
};

/**
 * The fooet button extension for the code cell.
 */
const iotcellfooter: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook:cellfooter',
  autoStart: true,
  activate: activateCommands,
  requires: [INotebookTracker]
};

/**
 * Export the plugins as default.
 */
const plugins: Array<JupyterFrontEndPlugin<any>> = [
  iotsidebar,
  iotcell,
  iotcellfooter
];

export default plugins;