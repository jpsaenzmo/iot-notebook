import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer,
} from '@jupyterlab/application';

import {
  NotebookPanel,
  INotebookTracker
} from '@jupyterlab/notebook';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IoTSideBar } from './iot-notebook-sidebar';

import { IoTNotebookContentFactory, activateCommands } from './iot-notebook-factory'

import { IoTToolbar } from './iot-notebook-toolbar'

import { LabIcon } from '@jupyterlab/ui-components';

import { ITranslator } from '@jupyterlab/translation';

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
 * Initialization data for the iot-notebook:factory extension.
 */
const iotfactory: JupyterFrontEndPlugin<NotebookPanel.IContentFactory> = {
  id: 'iot-notebook:factory',
  provides: NotebookPanel.IContentFactory,
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {

    console.log('JupyterLab extension iot-notebook:factory is activated!');

    const { commands } = app;
    return new IoTNotebookContentFactory(commands);
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

const iottest: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook:test',
  requires: [ITranslator],
  optional: [ILayoutRestorer, ILabShell],
  autoStart: true,
  activate: (app: JupyterFrontEnd, translator: ITranslator,
    restorer: ILayoutRestorer | null, labShell: ILabShell | null
  ) => {
    console.log('JupyterLab extension iot-notebook:test is activated!');
  }
}

/**
 * Export the plugins as default.
 */
const plugins: Array<JupyterFrontEndPlugin<any>> = [
  iotsidebar,
  iotfactory,
  iottoolbar,
  iotcellfooter,
  iottest
];

export default plugins;