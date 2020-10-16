import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { Widget } from '@lumino/widgets';

import { LabIcon } from '@jupyterlab/ui-components';

import iotIconSvgStr from '../style/icons/iot.svg';

import * as React from 'react';

export const iotIcon = new LabIcon({
  name: 'defaultpkg:iot',
  svgstr: iotIconSvgStr
});

/**
 * Initialization data for the iot-notebook extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook',
  autoStart: true,
  requires: [ICommandPalette, IMainMenu, ILabShell],
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette,
    mainMenu: IMainMenu, launcher: ILauncher, labShell: ILabShell) => {
    console.log('JupyterLab extension iot-notebook is activated!');

    const { shell } = app;

    const leftWidget = new LeftWidget();
    shell.add(leftWidget, 'left');
  }
};

export default extension;

class LeftWidget extends Widget {
  constructor() {
    super();
    this.addClass('jp-example-view');
    this.id = 'simple-widget-example';
    this.title.caption = 'IoT Architecture';
    this.title.icon = iotIcon;
    this.title.closable = true;
  }

  render() {
    return <HelloMessage />
  }
}

class HelloMessage extends React.Component {

  render() {
    return (
      <div>
        Ciao Perro
      </div>
    );
  }
}