import {
  ILayoutRestorer,
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
  NotebookPanel,
  INotebookTracker
} from '@jupyterlab/notebook';

import { IFileBrowserFactory, FilterFileBrowserModel, FileBrowser } from '@jupyterlab/filebrowser'

/*
import {
  IRunningSessionManagers,
  RunningSessionManagers,
  IoTSideBar,
} from './iot-notebook-sidebar'
*/

import { LabIcon } from '@jupyterlab/ui-components';

import { IoTNotebookContentFactory, activateCommands } from './iot-notebook-factory'

import { IoTToolbar } from './iot-notebook-toolbar'

// import { addOpenTabsSessionManager } from './opentabs';

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
 * Initialization data for the iot-notebook:factory extension.
 */
const iotsidebar: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook:iotsidebar',
  // provides: IRunningSessionManagers,
  optional: [ILayoutRestorer, ILabShell],
  autoStart: true,
  activate
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

function activate() {

  const createFileBrowser = (
    id: string,
    options: IFileBrowserFactory.IOptions = {}
  ) => {
    const model = new FilterFileBrowserModel({
      //translator: translator,
      auto: options.auto ?? true,
      manager: docManager,
      driveName: options.driveName || '',
      refreshInterval: options.refreshInterval,
      state:
        options.state === null ? undefined : options.state || state || undefined
    });
    const restore = options.restore;
    const widget = new FileBrowser({ id, model, restore });

    // Track the newly created file browser.
    void tracker.add(widget);

    return widget;
  };

  // Manually restore and load the default file browser.
  const defaultBrowser = createFileBrowser('filebrowser', {
    auto: false,
    restore: false
  });

  return defaultBrowser;
}

/**
 * Activate the running plugin.
 
function activate(
  app: JupyterFrontEnd,
  restorer: ILayoutRestorer | null,
  labShell: ILabShell | null
): IRunningSessionManagers {
 
  console.log('JupyterLab extension iot-notebook:iotsidebar is activated!');
 
  const runningSessionManagers = new RunningSessionManagers();
  const running = new IoTSideBar(runningSessionManagers);
  running.id = 'jp-running-sessions';
  running.title.caption = 'Running Terminals and Kernels';
 
  // Let the application restorer track the running panel for restoration of
  // application state (e.g. setting the running panel as the current side bar
  // widget).
  if (restorer) {
    restorer.add(running, 'running-sessions');
  }
  if (labShell) {
    addOpenTabsSessionManager(runningSessionManagers, labShell);
  }
 
  app.shell.add(running, 'left', { rank: 150 });
 
  return runningSessionManagers;
}
 */

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

