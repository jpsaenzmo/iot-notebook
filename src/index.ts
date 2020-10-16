import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the iot-notebook extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension iot-notebook is activated!');
  }
};

export default extension;
