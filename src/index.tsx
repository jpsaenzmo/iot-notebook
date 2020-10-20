import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { LabIcon } from '@jupyterlab/ui-components';

import iotIconSvgStr from '../style/icons/iot.svg';

import { ReactWidget } from '@jupyterlab/apputils';

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
  requires: [ICommandPalette, IMainMenu, ILabShell, ILayoutRestorer],
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette,
    mainMenu: IMainMenu, launcher: ILauncher, labShell: ILabShell, restorer: ILayoutRestorer) => {
    console.log('JupyterLab extension iot-notebook is activated!');

    const { shell } = app;

    const content = new LeftWidget();
    shell.add(content, 'left');
  }
};

export default extension;

class LeftWidget extends ReactWidget {
  constructor() {
    super();
    this.addClass('jp-example-view');
    this.id = 'simple-widget-example';
    this.title.caption = 'IoT Architecture';
    this.title.icon = iotIcon;
    this.title.closable = true;
  }

  render() {
    return <div style={{
      overflow: "auto",
      background: "#FFFFFF",
      color: "#000000",
      fontFamily: "Helvetica",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}><h3>IoT Notebook</h3></div>
  }
}

/*
class HelloMessage extends React.Component {
  render() {
    return (
      <div>
        Ciao Perro
      </div>
    );
  }
}
*/