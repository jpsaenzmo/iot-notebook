import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IoTSideBar } from './iot-notebook-sidebar';

/**
 * Initialization data for the iot-notebook extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook',
  autoStart: true,
  requires: [ICommandPalette, IMainMenu, ILabShell],
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension iot-notebook is activated!');

    const { shell } = app;
    const content = new IoTSideBar();
    shell.add(content, 'left', { rank: 1000 });
  }
};

export default extension;