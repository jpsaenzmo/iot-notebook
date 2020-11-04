import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
  NotebookPanel,
  INotebookTracker,
  //INotebookTools,
  //INotebookTools,
} from '@jupyterlab/notebook';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

//import { IEditorServices } from '@jupyterlab/codeeditor';

import { IoTSideBar } from './iot-notebook-sidebar';

import { ContentFactoryWithFooterButton, activateCommands } from './iot-notebook-cell' //

import { IoTToolbar } from './iot-notebook-toolbar'

import { LabIcon } from '@jupyterlab/ui-components';

export const iotIcon = new LabIcon({
  name: 'defaultpkg:iot',
  svgstr: iotIconSvgStr
});

export const iotaeIcon = new LabIcon({
  name: 'defaultpkg:iot-ae',
  svgstr: iotIconAESvgStr
});

import iotIconSvgStr from '../style/icons/iot.svg';
import iotIconAESvgStr from '../style/icons/iot-ae.svg';

/**
 * Initialization data for the iot-notebook:sidebar extension.
 */
const iotsidebar: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook:sidebar',
  requires: [ICommandPalette, IMainMenu, ILabShell],
  optional: [ILauncher],
  autoStart: true,
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
  // requires: [IEditorServices, INotebookTools],
  provides: NotebookPanel.IContentFactory,
  autoStart: true,
  //, editorServices: IEditorServices
  activate: (app: JupyterFrontEnd) => {

    console.log('JupyterLab extension iot-notebook:cell is activated!');

    const { commands } = app;
    // const editorFactory = editorServices.factoryService.newInlineEditor;
    // { editorFactory }
    return new ContentFactoryWithFooterButton(commands);
  }
};

/**
 * The footer button extension for the IoT Code Cell.
*/
const iotcellfooter: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook:cellfooter',
  requires: [INotebookTracker],
  autoStart: true,
  activate: activateCommands
};
 

/**
 * Initialization data for the iot-notebook:toolbar extension.
 */
const iottoolbar: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook:toolbar',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension iot-notebook:toolbar is activated!');
    app.docRegistry.addWidgetExtension('Notebook', new IoTToolbar());
  }
}

/**
 * Export the plugins as default.
 */
const plugins: Array<JupyterFrontEndPlugin<any>> = [
  iotsidebar,
  iotcell,
  iottoolbar,
  iotcellfooter
];

export default plugins;