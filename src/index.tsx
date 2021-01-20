import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
  NotebookPanel,
  INotebookTracker,
} from '@jupyterlab/notebook';

import { IDocumentManager } from '@jupyterlab/docmanager';

import { FileBrowserModel } from '@jupyterlab/filebrowser'

import { IoTDirListing } from './iot-notebook-sidebar'

import { LabIcon } from '@jupyterlab/ui-components';

import { IoTNotebookContentFactory, activateCommands } from './iot-notebook-factory'

import { IoTToolbar } from './iot-notebook-toolbar'

export const iotIcon = new LabIcon({
  name: 'defaultpkg:iot',
  svgstr: iotIconSvgStr
});

export const iotaeIcon = new LabIcon({
  name: 'defaultpkg:iot-ae',
  svgstr: iotIconAESvgStr
});

import iotIconSvgStr from '../style/icons/iot-plain.svg';
import iotIconAESvgStr from '../style/icons/iot-ae.svg';

const toolbar = new IoTToolbar();

/**
 * Initialization data for the iot-notebook:factory extension.
 */
const iotsidebar: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook:iotsidebar',
  requires: [IDocumentManager],
  autoStart: true,
  activate: (app: JupyterFrontEnd, docManager: IDocumentManager) => {

    console.log('JupyterLab extension iot-notebook:iotsidebar is activated!');

    const model = new FileBrowserModel({
      manager: docManager
    });

    const dirlisting = new IoTDirListing(app, model);
    app.shell.add(dirlisting, 'left', { rank: 150 });
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
    return new IoTNotebookContentFactory(commands, toolbar);
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
    app.docRegistry.addWidgetExtension('Notebook', toolbar);
  }
}

/**
 * Export the plugins as default.
 */
const plugins: Array<JupyterFrontEndPlugin<any>> = [
  iotsidebar,
  iotfactory,
  iottoolbar,
  iotcellfooter
];

export default plugins;