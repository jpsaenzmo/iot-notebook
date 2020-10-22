import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
  NotebookPanel,
} from '@jupyterlab/notebook';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { CommandRegistry } from '@lumino/commands';

import { ICellFooter, Cell } from '@jupyterlab/cells';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { IoTSideBar } from './iot-notebook-sidebar';

import { CellFooterWithButton } from './iot-notebook-cell'

/**
 * Extend the default implementation of an `IContentFactory`.
 */
export class ContentFactoryWithFooterButton extends NotebookPanel.ContentFactory {
  constructor(
    commands: CommandRegistry,
    options?: Cell.ContentFactory.IOptions | undefined
  ) {
    super(options);
    this.commands = commands;
  }
  /**
   * Create a new cell header for the parent widget.
   */
  createCellFooter(): ICellFooter {
    return new CellFooterWithButton(this.commands);
  }

  private readonly commands: CommandRegistry;
}

/**
 * Initialization data for the iot-notebook extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'iot-notebook',
  autoStart: true,
  requires: [ICommandPalette, IMainMenu, ILabShell, IEditorServices],
  optional: [ILauncher],
  provides: NotebookPanel.IContentFactory,
  activate: (app: JupyterFrontEnd, editorServices: IEditorServices) => {       
    console.log('JupyterLab extension iot-notebook is activated!');

    const { shell } = app;
    //const editorFactory = editorServices.factoryService.newInlineEditor;

    const content = new IoTSideBar();
    shell.add(content, 'left', { rank: 1000 });

    //return new ContentFactoryWithFooterButton(commands, { editorFactory });
  }
};

export default extension;