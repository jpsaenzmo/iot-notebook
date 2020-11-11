import {
  ILayoutRestorer,
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  NotebookPanel,
  INotebookTracker
} from '@jupyterlab/notebook';

//import { ICommandPalette } from '@jupyterlab/apputils';

//import { ILauncher } from '@jupyterlab/launcher';

//import { IMainMenu } from '@jupyterlab/mainmenu';

//import { ITranslator } from '@jupyterlab/translation';

import {
  IRunningSessionManagers,
  RunningSessionManagers,
  IoTSideBar,
} from './iot-notebook-sidebar'

import { IoTNotebookContentFactory, activateCommands } from './iot-notebook-factory'

import { IoTToolbar } from './iot-notebook-toolbar'

import { LabIcon } from '@jupyterlab/ui-components';

import { addOpenTabsSessionManager } from './opentabs';

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
const iotsidebar: JupyterFrontEndPlugin<IRunningSessionManagers> = {
  activate,
  id: 'iot-notebook:sidebar',
  provides: IRunningSessionManagers,
  //requires: [ITranslator],
  optional: [ILayoutRestorer, ILabShell],
  // requires: [ICommandPalette, IMainMenu, ILabShell],
  // optional: [ILauncher],
  autoStart: true
  /*
  activate: (app: JupyterFrontEnd,
    translator: ITranslator,
    restorer: ILayoutRestorer | null,
    labShell: ILabShell | null) => {
    console.log('JupyterLab extension iot-notebook:sidebar is activated!');
    const runningSessionManagers = new RunningSessionManagers();
    const content = new IoTSideBar(runningSessionManagers);

    // Let the application restorer track the running panel for restoration of
    // application state (e.g. setting the running panel as the current side bar
    // widget).
    if (restorer) {
      restorer.add(content, 'running-sessions');
    }
    if (labShell) {
      addOpenTabsSessionManager(runningSessionManagers, labShell, translator);
    }
    // addKernelRunningSessionManager(runningSessionManagers, app);
    // Rank has been chosen somewhat arbitrarily to give priority to the running
    // sessions widget in the sidebar.
    app.shell.add(content, 'left', { rank: 150 });




    //const { shell } = app;
    //shell.add(content, 'left', { rank: 1000 });

    return runningSessionManagers;
  }
  */
};



/**
 * Activate the running plugin.
 */
function activate(
  app: JupyterFrontEnd,
  //translator: ITranslator,
  restorer: ILayoutRestorer | null,
  labShell: ILabShell | null
): IRunningSessionManagers {
  //const trans = translator.load('jupyterlab');
  const runningSessionManagers = new RunningSessionManagers();
  const running = new IoTSideBar(runningSessionManagers);
  running.id = 'jp-running-sessions';
  running.title.caption = 'Running Terminals and Kernels';
  //running.title.icon = runningIcon;

  // Let the application restorer track the running panel for restoration of
  // application state (e.g. setting the running panel as the current side bar
  // widget).
  if (restorer) {
    restorer.add(running, 'running-sessions');
  }
  if (labShell) {
    addOpenTabsSessionManager(runningSessionManagers, labShell);
  }
  //addKernelRunningSessionManager(runningSessionManagers, translator, app);
  // Rank has been chosen somewhat arbitrarily to give priority to the running
  // sessions widget in the sidebar.
  app.shell.add(running, 'left', { rank: 200 });

  return runningSessionManagers;
}



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