import {
  ILayoutRestorer,
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

//import { ITranslator } from '@jupyterlab/translation';

import {
  //nullTranslator,
  ITranslator,
  // TranslationBundle
} from '@jupyterlab/translation';

import {
  NotebookPanel,
  INotebookTracker
} from '@jupyterlab/notebook';

import {
  RunningSessionManagers,
  IoTSideBar,
} from './iot-notebook-sidebar'


import { IoTNotebookContentFactory, activateCommands } from './iot-notebook-factory'

import { IoTToolbar } from './iot-notebook-toolbar'

import { LabIcon } from '@jupyterlab/ui-components';

import { addOpenTabsSessionManager } from './opentabs';

import { IDocumentManager } from '@jupyterlab/docmanager';

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
const iotsidebar: JupyterFrontEndPlugin<RunningSessionManagers> = {
  //activate,
  id: 'iot-notebook:sidebar',
  autoStart: true,
  //provides: IRunningSessionManagers,
  requires: [IDocumentManager],
  optional: [ILayoutRestorer, ILabShell, IDocumentManager, ITranslator],
  activate: (app: JupyterFrontEnd,
    translator: ITranslator,
    restorer: ILayoutRestorer | null,
    labShell: ILabShell | null,
    docManager: IDocumentManager) => {
    console.log('JupyterLab extension iot-notebook:sidebar is activatedaña!');
    
    //const trans = translator.load('jupyterlab');
    //const trans = translator.load;
    /*
    if(trans != null){
      console.log("trans no es null");
    }
    */
    
    const runningSessionManagers = new RunningSessionManagers();
    const running = new IoTSideBar(runningSessionManagers, translator);
    //running.title.caption = trans.__('Running Terminals and Kernels');
    running.id = 'jp-running-sessions';
    running.title.caption = 'Running Terminals and Kernels';
    //running.title.icon = runningIcon;
    
    
    
    docManager.activateRequested.connect(async (_, path) => {
      const item = await docManager.services.contents.get(path, {
        content: false,
      });
      const fileType = app.docRegistry.getFileTypeForModel(item);
      const contentType = fileType.contentType;
      // Add the containing directory, too
      if (contentType !== 'directory') {
        const parent =
          path.lastIndexOf('/') > 0 ? path.slice(0, path.lastIndexOf('/')) : '';
        console.log(parent);
      }
    });
    

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