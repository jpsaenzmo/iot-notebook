import * as React from 'react';

import {
    JupyterFrontEnd,
} from '@jupyterlab/application';

import {
    INotebookTracker,
    NotebookPanel,
    NotebookActions,
    Notebook
} from '@jupyterlab/notebook';

import { ICellFooter, Cell } from '@jupyterlab/cells';

import { CommandRegistry } from '@lumino/commands';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { ReactWidget } from '@jupyterlab/apputils';

import { each, toArray } from '@lumino/algorithm';

/**
 * The CSS classes added to the cell footer.
 */
const CELL_FOOTER_CLASS = 'jp-CellFooter';
const CELL_FOOTER_DIV_CLASS = 'iotcell-cellFooterContainer';
const CELL_FOOTER_BUTTON_CLASS = 'iotcell-cellFooterBtn';

export function activateCommands(
    app: JupyterFrontEnd,
    tracker: INotebookTracker
): Promise<void> {

    Promise.all([app.restored]).then(([params]) => {
        const { commands, shell } = app;

        function getCurrent(args: ReadonlyPartialJSONObject): NotebookPanel | null {
            const widget = tracker.currentWidget;
            const activate = args.activate !== false;

            if (activate && widget) {
                shell.activateById(widget.id);
            }

            return widget;
        }

        function isEnabled(): boolean {
            return (
                tracker.currentWidget !== null &&
                tracker.currentWidget === app.shell.currentWidget
            );
        }

        commands.addCommand('run-selected-codecell', {
            label: 'Run Cell',
            execute: args => {
                const current = getCurrent(args);

                if (current) {
                    const { context, content } = current;
                    NotebookActions.run(content, context.sessionContext);
                }
            },
            isEnabled
        });

        commands.addCommand('set-as-prerequisite', {
            label: 'Is prerequisite',
            execute: args => {
                const current = getCurrent(args);

                if (current) {
                    const { content } = current;
                    content.activeCell.model.metadata.set('is_prerequisite', args.state);

                    content.update();
                }
            },
            isEnabled
        });
    });
    return Promise.resolve();
}

/**
 * Extend default implementation of a cell footer.
 */
class CellFooterWithButton extends ReactWidget implements ICellFooter {

    private isPrerequisite: boolean;

    /**
     * Construct a new cell footer.
     */
    constructor(commands: CommandRegistry) {
        super();
        this.addClass(CELL_FOOTER_CLASS);
        this.commands = commands;
        this.isPrerequisite = false;
    }

    changeIsPrerequisite(prerequisite: boolean) {
        this.isPrerequisite = prerequisite;
        this.update();
    }

    private readonly commands: CommandRegistry;

    render() {
        return (
            <div className={CELL_FOOTER_DIV_CLASS}>
                <input type="checkbox" id="cb:prerequisite" name="prerequisite" checked={this.isPrerequisite}
                    onChange={event => {
                        this.changeIsPrerequisite(!this.isPrerequisite);
                        this.commands.execute('set-as-prerequisite', { state: this.isPrerequisite });
                    }}
                />
                <label htmlFor="cb:prerequisite">Is prerequisite</label><span />
                <input type="checkbox" id="cb:linked" name="linked" value="isLinked" />
                <label htmlFor="cb:linked">Execute together with the previous cell</label><br />
                <button
                    className={CELL_FOOTER_BUTTON_CLASS}
                    onClick={event => {
                        this.commands.execute('run-selected-codecell');
                    }}
                >
                    run
          </button>
            </div>
        );
    }
}

/**
 * Extend the default implementation of an `IContentFactory`.
 */
export class IoTNotebookContentFactory extends NotebookPanel.ContentFactory {
    constructor(
        commands: CommandRegistry,
        options?: Cell.ContentFactory.IOptions | undefined
    ) {
        super(options);
        this.commands = commands;
    }

    /**
     * Create a new notebook for the parent widget.
     */
    createNotebook(options: Notebook.IOptions): Notebook {
        return new IoTNotebook(options);
    }

    /**
     * Create a new cell footer for the parent widget.
     */
    createCellFooter(): ICellFooter {
        return new CellFooterWithButton(this.commands);
    }

    private readonly commands: CommandRegistry;
}

/**
 * Extend the default implementation of a `Notebook`.
 */
class IoTNotebook extends Notebook {


    constructor(options?: Notebook.IOptions) {
        super(options);
    }

    onActivateRequest() {
        each(this.widgets, widget => {
            const widgetModel = widget.model;
            if (widgetModel.type === 'code' && widgetModel.metadata.get('is_prerequisite') != null) {
                const isPrerequisite = widgetModel.metadata.get('is_prerequisite') == true ? true : false;
                const childrens = toArray(widget.children());
                const footer = childrens[3] as CellFooterWithButton;
                footer.changeIsPrerequisite(isPrerequisite);
            }
        });
    }
}