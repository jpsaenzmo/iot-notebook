import * as React from 'react';

import {
    JupyterFrontEnd,
} from '@jupyterlab/application';

import {
    INotebookTracker,
    NotebookPanel,
    NotebookActions,
    //NotebookTracker,
    //Notebook
} from '@jupyterlab/notebook';

import { ICellFooter, Cell } from '@jupyterlab/cells';

import { CommandRegistry } from '@lumino/commands';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { ReactWidget } from '@jupyterlab/apputils';

// import { Notebook } from '@jupyterlab/notebook';

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
        console.log('Entra a activate commands')
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

        function turnOnTags(tracker: INotebookTracker,toggle: boolean){
            var cells = tracker.currentWidget.model.cells;
            for (var i=0;i<cells.length;i++){
                let tags=cells[i].metadata.get("tags") as string[]
                if (tags != null){
                    for (var j=0;j<tags.length;j++){
                        if (tags[j].startsWith("dom-") == true){
                            let newtag = tags[j].substring(4,tags[j].length)
                            // find the cell with this ID
                            let cell = tracker.currentWidget.content.widgets.find(widget => widget.model.id === cells[i].id);
                            toggle ? cell.addClass(newtag) : cell.removeClass(newtag)
                        }
                    }
                }
            }   
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
                //console.log('Entra al command ', args.state);
                const current = getCurrent(args);
                
                if (current) {
                    const { content } = current;
                    content.activeCell.model.metadata.set('is_prerequisite', args.state);

                    content.update();
                }
            },
            isEnabled
        });

        commands.addCommand('recibir-senal', {
            label: 'Is prerequisite',
            execute: args => {
               
                console.log('Entra al recibir senal ');

                turnOnTags
                /*
                const current = getCurrent(args);

                if (current) {
                    const { content } = current;

                    if (current.model == null) {
                        console.log('Model es null');

                    }
                    if (current.model != null) {

                        const hola = content.widgets.find(widget => widget.model === content.activeCell.model);

                        console.log('nodo de hola.node: ', hola.node);


                        current.model.metadata.get('is_prerequisite');
                        console.log('Hola perro: ', current.model.metadata.get('is_prerequisite'));
                    }
                    //current.update();
                    //console.log('Current nodehjkkjhkj: ', content.);
                }
                */
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

    // private _notebook: Notebook;

    /**
     * Construct a new cell footer.
     */
    constructor(commands: CommandRegistry) {
        super();
        this.addClass(CELL_FOOTER_CLASS);
        this.commands = commands;
        this.isPrerequisite = false;
    }

    private readonly commands: CommandRegistry;

    render() {
        console.log('Entra al render');

        if (this.commands.isEnabled('recibir-senal')) {
            console.log('recibir senal is enabled');
            this.commands.execute('recibir-senal', { state: this.isPrerequisite });
        }
        /*
        if (this._notebook.activeCell.model.metadata.get('is_prerequisite') == true) {
            this.isPrerequisite = true
        }
        */
        return (
            <div className={CELL_FOOTER_DIV_CLASS}>
                <input type="checkbox" id="cb:prerequisite" name="prerequisite" defaultChecked={this.isPrerequisite}
                    onChange={event => {
                        this.commands.execute('set-as-prerequisite', { state: this.id });
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
export class ContentFactoryWithFooterButton extends NotebookPanel.ContentFactory {
    constructor(
        commands: CommandRegistry,
        options?: Cell.ContentFactory.IOptions | undefined,
    ) {
        super(options);
        this.commands = commands;
    }

    /**
     * Create a new cell footer for the parent widget.
     */
    createCellFooter(): ICellFooter {
        return new CellFooterWithButton(this.commands);
    }

    private readonly commands: CommandRegistry;
}