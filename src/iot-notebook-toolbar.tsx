import React from 'react';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel,
  INotebookModel,
  Notebook
} from '@jupyterlab/notebook';

import {
  IDisposable, DisposableDelegate
} from '@lumino/disposable';

import {
  ToolbarButton,
  ReactWidget,
  ISessionContext,
  ToolbarButtonComponent,
  InputDialog,
  Dialog
} from '@jupyterlab/apputils';

import {
  HTMLSelect,
  LabIcon
} from '@jupyterlab/ui-components';

import {
  nullTranslator,
  ITranslator,
  TranslationBundle
} from '@jupyterlab/translation';

import { IOutput } from '@jupyterlab/nbformat';

import { Kernel, KernelMessage } from '@jupyterlab/services';

import { ISignal, Signal } from '@lumino/signaling';

export const board = new LabIcon({
  name: 'defaultpkg:board',
  svgstr: boardIconSvgStr
});

export const boardOff = new LabIcon({
  name: 'defaultpkg:board-off',
  svgstr: boardOffIconSvgStr
});

import boardIconSvgStr from '../style/icons/board.svg';
import boardOffIconSvgStr from '../style/icons/board-off.svg';

/**
 * The class name added to toolbar cell type dropdown wrapper.
 */
const IOTTOOLBAR_ARCHITECTURAL_CLASS = 'jp-Notebook-toolbarCellType';

/**
 * The class name added to toolbar cell type dropdown.
 */
const IOTTOOLBAR_ARCHITECTURAL_DROPDOWN_CLASS = 'jp-Notebook-toolbarCellTypeDropdown';

/**
 * The class name added to toolbar kernel name text.
 */
const TOOLBAR_KERNEL_NAME_CLASS = 'jp-Toolbar-kernelName';

const ARCHITECTURAL_ELEMENT_KEY = 'architectural_element';

const ARDUINO_FQBN = 'arduino_fqbn';

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class IoTToolbar implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel): IDisposable {

    let button = new ToolbarButton({
      className: 'myButton',
      label: 'IoT Architectural Element',
    });

    let switchIoT = new IoTArchitecturalSwitch(panel.content);

    let boardConn = new BoardConnector(panel.sessionContext, panel.content);
    boardConn.stateChanged.connect(this._logMessage, this);

    panel.toolbar.insertItem(11, 'lblIoTAE', button);
    panel.toolbar.insertAfter('lblIoTAE', 'switchIoTAE', switchIoT);
    panel.toolbar.insertItem(15, 'lblBoardConn', boardConn);

    return new DisposableDelegate(() => {
      button.dispose();
    });
  }

  private _logMessage(emitter: BoardConnector, board: String): void {
    this._stateChanged.emit(board);
  }

  public get stateChanged(): ISignal<this, String> {
    return this._stateChanged;
  }

  public get kernelChanged(): ISignal<this, String> {
    return this._kernelChanged;
  }

  private _stateChanged = new Signal<this, String>(this);
  private _kernelChanged = new Signal<this, String>(this);
}

export class BoardConnector extends ReactWidget {
  constructor(sessionContext: ISessionContext, widget: Notebook) {
    super();
    this._fqbn = 'Board'
    this.addClass(TOOLBAR_KERNEL_NAME_CLASS);
    this._onStatusChanged(sessionContext);
    sessionContext.statusChanged.connect(this._onStatusChanged, this);
    sessionContext.connectionStatusChanged.connect(
      this._onStatusChanged,
      this
    );
    this._kernelModel = new KernelModel(sessionContext);
    this._notebook = widget;
  }

  private callback = () => {
    this._kernelModel.execute('arduino-cli board list');
    if (this._kernelModel.boardList != null) {

      return InputDialog.getItem({
        title: 'Pick an Arduino Board',
        items: this._kernelModel.boardList
      }).then(value => {
        this._fqbn = value.value.split('\t')[3];
        this._notebook.model.metadata.set(ARDUINO_FQBN, value.value.split('\t')[0]);

        this._stateChanged.emit(value.value.split('\t')[0]);
      });
    }
    else {
      const buttons = [
        Dialog.okButton({ label: 'Ok' })
      ];
      const dialog = new Dialog({
        title: "Couldn't find an Arduino Board",
        buttons
      }
      );
      dialog.launch();
    }
  };

  /**
  * Handle a status on a kernel.
  */
  private _onStatusChanged(sessionContext: ISessionContext) {
    this._kernel = sessionContext.kernelDisplayName;
    this._stateChanged.emit('kernel' + this._kernel);
    this.update();
  }

  render() {
    if (this._kernel === 'Arduino') {
      return (
        <>
          <ToolbarButtonComponent
            onClick={this.callback}
            tooltip={'Connect to an Arduino board'}
            label={this._fqbn}
          />
          <boardOff.react stylesheet={'toolbarButton'} alignSelf={'normal'} height={'24px'} />
        </>)
    }
    else {
      return <></>;
    }
  }

  public get stateChanged(): ISignal<this, String> {
    return this._stateChanged;
  }

  private _kernel: string;
  private _fqbn: string;

  private _kernelModel: KernelModel;
  private _notebook: Notebook;

  private _stateChanged = new Signal<this, String>(this);
}

export class IoTArchitecturalSwitch extends ReactWidget {

  constructor(widget: Notebook,
    translator?: ITranslator
  ) {
    super();
    this._trans = (translator || nullTranslator).load('jupyterlab');
    this.addClass(IOTTOOLBAR_ARCHITECTURAL_CLASS);
    this._notebook = widget;
    widget.stateChanged.connect(this.update, this);
  }

  /**
   * Handle `change` events for the HTMLSelect component.
   */
  handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (event.target.value !== '-') {
      this._notebook.model.metadata.set(ARCHITECTURAL_ELEMENT_KEY, event.target.value);
      this.update();
      this._notebook.activate();
    }
  };

  render() {
    let value = '-';
    if (this._notebook.model.metadata.get(ARCHITECTURAL_ELEMENT_KEY) != null) {
      value = this._notebook.model.metadata.get(ARCHITECTURAL_ELEMENT_KEY).toString();
    }
    return (
      <HTMLSelect
        className={IOTTOOLBAR_ARCHITECTURAL_DROPDOWN_CLASS}
        onChange={this.handleChange}
        value={value}
        aria-label={this._trans.__('IoT Architectural Element')}
      >
        <option value="-">-</option>
        <option value="app-and-cloud">{this._trans.__('Application & Cloud Services')}</option>
        <option value="device">{this._trans.__('Devices')}</option>
        <option value="gateway">{this._trans.__('Gateway')}</option>
      </HTMLSelect>
    );
  }

  private _trans: TranslationBundle;
  private _notebook: Notebook;
}

export class KernelModel {
  constructor(session: ISessionContext) {
    this._sessionContext = session;
  }

  get future(): Kernel.IFuture<
    KernelMessage.IExecuteRequestMsg,
    KernelMessage.IExecuteReplyMsg
  > | null {
    return this._future;
  }

  set future(
    value: Kernel.IFuture<
      KernelMessage.IExecuteRequestMsg,
      KernelMessage.IExecuteReplyMsg
    > | null
  ) {
    this._future = value;
    if (!value) {
      return;
    }
    value.onIOPub = this._onIOPub;
  }

  get output(): IOutput | null {
    return this._output;
  }

  get stateChanged(): ISignal<KernelModel, void> {
    return this._stateChanged;
  }

  get boardList(): string[] {
    return this._boardList;
  }

  execute(code: string): void {
    if (!this._sessionContext || !this._sessionContext.session?.kernel) {
      return;
    }
    this.future = this._sessionContext.session?.kernel?.requestExecute({
      code
    });
  }

  private _onIOPub = (msg: KernelMessage.IIOPubMessage): void => {
    const msgType = msg.header.msg_type;
    switch (msgType) {
      case 'stream':
        this._output = msg.content as IOutput;
        var result = this._output.text.toString().split('Name ')[1];
        if (result != '') {
          this._boardList = result.split('\n').filter(obj => obj !== '');

        }
      case 'execute_result':
      case 'display_data':
      case 'update_display_data':
        this._output = msg.content as IOutput;
        this._stateChanged.emit();
        break;
      default:
        break;
    }
    return;
  };

  private _future: Kernel.IFuture<
    KernelMessage.IExecuteRequestMsg,
    KernelMessage.IExecuteReplyMsg
  > | null = null;
  private _output: IOutput | null = null;
  private _sessionContext: ISessionContext;
  private _stateChanged = new Signal<KernelModel, void>(this);
  private _boardList: string[];
}