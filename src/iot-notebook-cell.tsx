import * as React from 'react';

import {
    JupyterFrontEnd,
} from '@jupyterlab/application';

import {
    INotebookTracker,
    NotebookPanel,
    NotebookActions
} from '@jupyterlab/notebook';

import { ICellFooter } from '@jupyterlab/cells';

import { CommandRegistry } from '@lumino/commands';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { ReactWidget } from '@jupyterlab/apputils';

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
    // tslint:disable-next-line:no-console
    console.log('JupyterLab extension jupyterlab-cellcodebtn is activated!');

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
                    // current.content.mode = 'edit';
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
export class CellFooterWithButton extends ReactWidget implements ICellFooter {
    /**
     * Construct a new cell footer.
     */
    constructor(commands: CommandRegistry) {
        super();
        this.addClass(CELL_FOOTER_CLASS);
        this.commands = commands;
    }

    private readonly commands: CommandRegistry;

    render() {
        return (
            <div className={CELL_FOOTER_DIV_CLASS}>
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

export default CellFooterWithButton;