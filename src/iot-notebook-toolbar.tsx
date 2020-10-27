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
    ReactWidget
} from '@jupyterlab/apputils';

import {
    HTMLSelect
} from '@jupyterlab/ui-components';

import {
    nullTranslator,
    ITranslator,
    TranslationBundle
} from '@jupyterlab/translation';

import { Notebook } from '@jupyterlab/notebook';

/**
 * The class name added to toolbar cell type dropdown wrapper.
 */
const IOTTOOLBAR_ARCHITECTURAL_CLASS = 'jp-Notebook-toolbarCellType';

/**
 * The class name added to toolbar cell type dropdown.
 */
const IOTTOOLBAR_ARCHITECTURAL_DROPDOWN_CLASS = 'jp-Notebook-toolbarCellTypeDropdown';

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class IoTToolbar implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

    /**
     * Create a new extension object.
     */
    createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {

        let button = new ToolbarButton({
            className: 'myButton',
            label: 'IoT Architectural Element',
        });

        let switchIoT = new IoTArchitecturalSwitch(panel.content, context);

        panel.toolbar.insertItem(11, 'lblIoTAE', button);
        panel.toolbar.insertAfter('lblIoTAE', 'switchIoTAE', switchIoT);

        return new DisposableDelegate(() => {
            button.dispose();
        });
    }
}

export class IoTArchitecturalSwitch extends ReactWidget {

    constructor(widget: Notebook, context: DocumentRegistry.IContext<INotebookModel>, translator?: ITranslator) {
        super();
        this._trans = (translator || nullTranslator).load('jupyterlab');
        this.addClass(IOTTOOLBAR_ARCHITECTURAL_CLASS);
        this._notebook = widget;
        this.context = context;
    }

    /**
     * Handle `change` events for the HTMLSelect component.
     */
    handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        if (event.target.value !== '-') {
            this.context.model.metadata.set('architectural-element', event.target.value);
            this._notebook.activate();
        }
    };

    /**
     * Handle `keydown` events for the HTMLSelect component.
     */
    handleKeyDown = (event: React.KeyboardEvent): void => {
        if (event.keyCode === 13) {
            this._notebook.activate();
        }
    };

    render() {
        let value = '-';

        return (
            <HTMLSelect
                className={IOTTOOLBAR_ARCHITECTURAL_DROPDOWN_CLASS}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
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
    public context: DocumentRegistry.IContext<INotebookModel> = null;
}