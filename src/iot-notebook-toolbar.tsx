import React from 'react';

import {
    DocumentRegistry
} from '@jupyterlab/docregistry';

import {
    NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
    IDisposable, DisposableDelegate
} from '@lumino/disposable';

import {
    ToolbarButton,
    ReactWidget,
    ISessionContext,
    ToolbarButtonComponent
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

import { Notebook } from '@jupyterlab/notebook';

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

const ARCHITECTURAL_ELEMENT_KEY = 'architectural_element';

/**
 * The class name added to toolbar kernel name text.
 */
const TOOLBAR_KERNEL_NAME_CLASS = 'jp-Toolbar-kernelName';

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
        let boardConn = new BoardConnector(panel.sessionContext);

        panel.toolbar.insertItem(11, 'lblIoTAE', button);
        panel.toolbar.insertAfter('lblIoTAE', 'switchIoTAE', switchIoT);
        panel.toolbar.insertItem(15, 'lblBoardConn', boardConn);

        return new DisposableDelegate(() => {
            button.dispose();
        });
    }
}

export class BoardConnector extends ReactWidget {
    constructor(sessionContext: ISessionContext) {
        super();
        this._board = "Board"
        this.addClass(TOOLBAR_KERNEL_NAME_CLASS);
        this._onStatusChanged(sessionContext);
        sessionContext.statusChanged.connect(this._onStatusChanged, this);
    }

    private callback = () => {

    };

    /**
    * Handle a status on a kernel.
    */
    private _onStatusChanged(sessionContext: ISessionContext) {
        this._kernel = sessionContext.kernelDisplayName;
        this.update();
    }

    render() {
        if (this._kernel === 'Arduino') {
            return (
                <>
                    <ToolbarButtonComponent
                        onClick={this.callback}
                        tooltip={'Connect to an Arduino board'}
                        label={this._board}
                    />
                    <boardOff.react stylesheet={'toolbarButton'} alignSelf={'normal'} height={'24px'} />
                </>)
        }
        else {
            return <></>;
        }
    }

    private _kernel: string;
    private _board: string;
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