import * as React from 'react';

import {
    JupyterFrontEnd,
} from '@jupyterlab/application';

import {
    INotebookTracker,
    NotebookPanel,
    NotebookActions,
    Notebook,
    INotebookModel,
    //CellTypeSwitcher
} from '@jupyterlab/notebook';

import {
    ICellFooter,
    Cell,
    ICellModel,
    CodeCell,
    MarkdownCell,
    ICodeCellModel
} from '@jupyterlab/cells';

import { CommandRegistry } from '@lumino/commands';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { ReactWidget, ISessionContext, Dialog, showDialog, Clipboard } from '@jupyterlab/apputils';

import { each, toArray } from '@lumino/algorithm';

import { Signal } from '@lumino/signaling';

import { ElementExt } from '@lumino/domutils';

import { nullTranslator, ITranslator } from '@jupyterlab/translation';

import { KernelMessage } from '@jupyterlab/services';

import { ArrayExt } from '@lumino/algorithm';

import { JSONObject } from '@lumino/coreutils';

/**
 * The mimetype used for Jupyter cell data.
 */
const JUPYTER_CELL_MIME = 'application/vnd.jupyter.cells';

import * as nbformat from '@jupyterlab/nbformat';

/**
 * The CSS classes added to the cell footer.
 */
const CELL_FOOTER_CLASS = 'jp-CellFooter';
const CELL_FOOTER_DIV_CLASS = 'iotcell-cellFooterContainer';
const CELL_FOOTER_BUTTON_CLASS = 'iotcell-cellFooterBtn';

const IS_PREREQUISITE = 'is_prerequisite'
const IS_LINKED = 'is_linked_previous_cell'

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

        commands.addCommand('run-linked-selected-codecell', {
            label: 'Run Linked Cell',
            execute: args => {
                const current = getCurrent(args);
                if (current) {
                    const { context, content } = current;

                    const activeIndex = content.activeCellIndex;
                    var tempNotebook: Notebook = content;
                    tempNotebook.model.readOnly = false;

                    var mergedValue = '';
                    var originalValue: string = tempNotebook.model.cells.get(activeIndex).value.text;

                    toArray(tempNotebook.model.cells).forEach((cell, index) => {
                        mergedValue += cell.value.text;
                        if (index < activeIndex) {
                            mergedValue += '\n';
                        }
                        else if (index == activeIndex) {
                            cell.value.text = mergedValue;
                        }
                    });
                    run(content, context.sessionContext);
                    content.model.cells.get(activeIndex).value.text = originalValue;
                    content.update();
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
                    content.activeCell.model.metadata.set(IS_PREREQUISITE, args.state);
                    content.update();
                }
            },
            isEnabled
        });

        commands.addCommand('set-as-linked', {
            label: 'Is linked to previous cell',
            execute: args => {
                const current = getCurrent(args);

                if (current) {
                    const { content } = current;
                    content.activeCell.model.metadata.set(IS_LINKED, args.state);

                    content.update();
                }
            },
            isEnabled
        });
    });
    return Promise.resolve();
}

/**
 * Run the selected cell(s).
 *
 * @param notebook - The target notebook widget.
 *
 * @param sessionContext - The optional client session object.
 *
 * #### Notes
 * The last selected cell will be activated, but not scrolled into view.
 * The existing selection will be cleared.
 * An execution error will prevent the remaining code cells from executing.
 * All markdown cells will be rendered.
 */
export function run(
    notebook: Notebook,
    sessionContext?: ISessionContext
): Promise<boolean> {
    if (!notebook.model || !notebook.activeCell) {
        return Promise.resolve(false);
    }

    const state = Private.getState(notebook);
    const promise = Private.runSelected(notebook, sessionContext);

    Private.handleRunState(notebook, state, false);
    return promise;
}

/**
 * Extend default implementation of a cell footer.
 */
class CellFooterWithButton extends ReactWidget implements ICellFooter {

    /**
    * Whether or not the cell is a prerequisite.
    */
    private isPrerequisite: boolean;

    /**
    * Whether or not the cell is linked with the previous cell in the notebook document.
    */
    private isLinked: boolean;

    private readonly commands: CommandRegistry;

    /**
     * Construct a new cell footer.
     */
    constructor(commands: CommandRegistry) {
        super();
        this.addClass(CELL_FOOTER_CLASS);
        this.commands = commands;
        this.isPrerequisite = false;
        this.isLinked = false;
    }

    changeIsPrerequisite(prerequisite: boolean) {
        this.isPrerequisite = prerequisite;
        this.update();
    }

    changeIsLinked(linked: boolean) {
        this.isLinked = linked;
        this.update();
    }

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
                <input type="checkbox" id="cb:linked" name="linked" checked={this.isLinked}
                    onChange={event => {
                        this.changeIsLinked(!this.isLinked);
                        this.commands.execute('set-as-linked', { state: this.isLinked });
                    }} />
                <label htmlFor="cb:linked">Execute together with the previous cell</label><br />
                <button
                    className={CELL_FOOTER_BUTTON_CLASS}
                    onClick={event => {
                        if (!this.isLinked) {
                            this.commands.execute('run-selected-codecell');
                        }
                        else {
                            this.commands.execute('run-linked-selected-codecell');
                        }
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

    private readonly commands: CommandRegistry;

    constructor(
        commands: CommandRegistry,
        options?: Cell.ContentFactory.IOptions | undefined
    ) {
        super(options);
        this.commands = commands;
    }

    /**
     * Create a new custom IoT Notebook for the parent widget.
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
}

/**
 * Extend the default implementation of a `Notebook`.
 */
class IoTNotebook extends Notebook {

    onBeforeAttach() {
        this.model.metadata.set('arduino_board', "");
    }

    onActivateRequest() {
        each(this.widgets, widget => {
            const widgetModel = widget.model;
            if (widgetModel.type === 'code' && (widgetModel.metadata.get(IS_PREREQUISITE) != null || widgetModel.metadata.get(IS_LINKED) != null)) {
                const isPrerequisite = widgetModel.metadata.get(IS_PREREQUISITE) != null && widgetModel.metadata.get(IS_PREREQUISITE) == true ? true : false;
                const isLinked = widgetModel.metadata.get(IS_LINKED) != null && widgetModel.metadata.get(IS_LINKED) == true ? true : false;
                const childrens = toArray(widget.children());
                const footer = childrens[3] as CellFooterWithButton;
                footer.changeIsPrerequisite(isPrerequisite);
                footer.changeIsLinked(isLinked);
            }
        });
    }
}

/**
 * A namespace for private data.
 */
namespace Private {
    /**
     * A signal that emits whenever a cell is run.
     */
    export const executed = new Signal<any, { notebook: Notebook; cell: Cell }>(
        {}
    );

    /**
     * The interface for a widget state.
     */
    export interface IState {
        /**
         * Whether the widget had focus.
         */
        wasFocused: boolean;

        /**
         * The active cell before the action.
         */
        activeCell: Cell | null;
    }

    /**
     * Get the state of a widget before running an action.
     */
    export function getState(notebook: Notebook): IState {
        return {
            wasFocused: notebook.node.contains(document.activeElement),
            activeCell: notebook.activeCell
        };
    }

    /**
     * Handle the state of a widget after running an action.
     */
    export function handleState(
        notebook: Notebook,
        state: IState,
        scrollIfNeeded = false
    ): void {
        const { activeCell, node } = notebook;

        if (state.wasFocused || notebook.mode === 'edit') {
            notebook.activate();
        }

        if (scrollIfNeeded && activeCell) {
            ElementExt.scrollIntoViewIfNeeded(node, activeCell.node);
        }
    }

    /**
     * Handle the state of a widget after running a run action.
     */
    export function handleRunState(
        notebook: Notebook,
        state: IState,
        scroll = false
    ): void {
        if (state.wasFocused || notebook.mode === 'edit') {
            notebook.activate();
        }
        if (scroll && state.activeCell) {
            // Scroll to the top of the previous active cell output.
            const rect = state.activeCell.inputArea.node.getBoundingClientRect();

            notebook.scrollToPosition(rect.bottom, 45);
        }
    }

    /**
     * Clone a cell model.
     */
    export function cloneCell(
        model: INotebookModel,
        cell: ICellModel
    ): ICellModel {
        switch (cell.type) {
            case 'code':
                // TODO why isn't modeldb or id passed here?
                return model.contentFactory.createCodeCell({ cell: cell.toJSON() });
            case 'markdown':
                // TODO why isn't modeldb or id passed here?
                return model.contentFactory.createMarkdownCell({ cell: cell.toJSON() });
            default:
                // TODO why isn't modeldb or id passed here?
                return model.contentFactory.createRawCell({ cell: cell.toJSON() });
        }
    }

    /**
     * Run the selected cells.
     */
    export function runSelected(
        notebook: Notebook,
        sessionContext?: ISessionContext
    ): Promise<boolean> {
        notebook.mode = 'command';

        let lastIndex = notebook.activeCellIndex;
        const selected = notebook.widgets.filter((child, index) => {
            const active = notebook.isSelectedOrActive(child);

            if (active) {
                lastIndex = index;
            }

            return active;
        });

        notebook.activeCellIndex = lastIndex;
        notebook.deselectAll();

        return Promise.all(
            selected.map(child => runCell(notebook, child, sessionContext))
        )
            .then(results => {
                if (notebook.isDisposed) {
                    return false;
                }
                // Post an update request.
                notebook.update();

                return results.every(result => result);
            })
            .catch(reason => {
                if (reason.message === 'KernelReplyNotOK') {
                    selected.map(cell => {
                        // Remove '*' prompt from cells that didn't execute
                        if (
                            cell.model.type === 'code' &&
                            (cell as CodeCell).model.executionCount == null
                        ) {
                            cell.setPrompt('');
                        }
                    });
                } else {
                    throw reason;
                }

                notebook.update();

                return false;
            });
    }

    /**
     * Run a cell.
     */
    function runCell(
        notebook: Notebook,
        cell: Cell,
        sessionContext?: ISessionContext,
        translator?: ITranslator
    ): Promise<boolean> {
        translator = translator || nullTranslator;
        const trans = translator.load('jupyterlab');

        switch (cell.model.type) {
            case 'markdown':
                (cell as MarkdownCell).rendered = true;
                cell.inputHidden = false;
                executed.emit({ notebook, cell });
                break;
            case 'code':
                if (sessionContext) {
                    if (sessionContext.isTerminating) {
                        void showDialog({
                            title: trans.__('Kernel Terminating'),
                            body: trans.__(
                                'The kernel for %1 appears to be terminating. You can not run any cell for now.',
                                sessionContext.session?.path
                            ),
                            buttons: [Dialog.okButton({ label: trans.__('Ok') })]
                        });
                        break;
                    }
                    const deletedCells = notebook.model?.deletedCells ?? [];
                    return CodeCell.execute(cell as CodeCell, sessionContext, {
                        deletedCells,
                        recordTiming: notebook.notebookConfig.recordTiming
                    })
                        .then(reply => {
                            deletedCells.splice(0, deletedCells.length);
                            if (cell.isDisposed) {
                                return false;
                            }

                            if (!reply) {
                                return true;
                            }

                            if (reply.content.status === 'ok') {
                                const content = reply.content;

                                if (content.payload && content.payload.length) {
                                    handlePayload(content, notebook, cell);
                                }

                                return true;
                            } else {
                                throw new Error('KernelReplyNotOK');
                            }
                        })
                        .catch(reason => {
                            if (cell.isDisposed || reason.message.startsWith('Canceled')) {
                                return false;
                            }
                            throw reason;
                        })
                        .then(ran => {
                            if (ran) {
                                executed.emit({ notebook, cell });
                            }

                            return ran;
                        });
                }
                (cell.model as ICodeCellModel).clearExecution();
                break;
            default:
                break;
        }

        return Promise.resolve(true);
    }

    /**
     * Handle payloads from an execute reply.
     *
     * #### Notes
     * Payloads are deprecated and there are no official interfaces for them in
     * the kernel type definitions.
     * See [Payloads (DEPRECATED)](https://jupyter-client.readthedocs.io/en/latest/messaging.html#payloads-deprecated).
     */
    function handlePayload(
        content: KernelMessage.IExecuteReply,
        notebook: Notebook,
        cell: Cell
    ) {
        const setNextInput = content.payload?.filter(i => {
            return (i as any).source === 'set_next_input';
        })[0];

        if (!setNextInput) {
            return;
        }

        const text = setNextInput.text as string;
        const replace = setNextInput.replace;

        if (replace) {
            cell.model.value.text = text;
            return;
        }

        // Create a new code cell and add as the next cell.
        const newCell = notebook.model!.contentFactory.createCodeCell({});
        const cells = notebook.model!.cells;
        const index = ArrayExt.firstIndexOf(toArray(cells), cell.model);

        newCell.value.text = text;
        if (index === -1) {
            cells.push(newCell);
        } else {
            cells.insert(index + 1, newCell);
        }
    }

    /**
     * Copy or cut the selected cell data to the application clipboard.
     *
     * @param notebook - The target notebook widget.
     *
     * @param cut - Whether to copy or cut.
     */
    export function copyOrCut(notebook: Notebook, cut: boolean): void {
        if (!notebook.model || !notebook.activeCell) {
            return;
        }

        const state = getState(notebook);
        const clipboard = Clipboard.getInstance();

        notebook.mode = 'command';
        clipboard.clear();

        const data = notebook.widgets
            .filter(cell => notebook.isSelectedOrActive(cell))
            .map(cell => cell.model.toJSON())
            .map(cellJSON => {
                if ((cellJSON.metadata as JSONObject).deletable !== undefined) {
                    delete (cellJSON.metadata as JSONObject).deletable;
                }
                return cellJSON;
            });

        clipboard.setData(JUPYTER_CELL_MIME, data);
        if (cut) {
            deleteCells(notebook);
        } else {
            notebook.deselectAll();
        }
        handleState(notebook, state);
    }

    /**
     * Change the selected cell type(s).
     *
     * @param notebook - The target notebook widget.
     *
     * @param value - The target cell type.
     *
     * #### Notes
     * It should preserve the widget mode.
     * This action can be undone.
     * The existing selection will be cleared.
     * Any cells converted to markdown will be unrendered.
     */
    export function changeCellType(
        notebook: Notebook,
        value: nbformat.CellType
    ): void {
        const model = notebook.model!;
        const cells = model.cells;

        cells.beginCompoundOperation();
        notebook.widgets.forEach((child, index) => {
            if (!notebook.isSelectedOrActive(child)) {
                return;
            }
            if (child.model.type !== value) {
                const cell = child.model.toJSON();
                let newCell: ICellModel;

                switch (value) {
                    case 'code':
                        newCell = model.contentFactory.createCodeCell({ cell });
                        break;
                    case 'markdown':
                        newCell = model.contentFactory.createMarkdownCell({ cell });
                        if (child.model.type === 'code') {
                            newCell.trusted = false;
                        }
                        break;
                    default:
                        newCell = model.contentFactory.createRawCell({ cell });
                        if (child.model.type === 'code') {
                            newCell.trusted = false;
                        }
                }
                cells.set(index, newCell);
            }
            if (value === 'markdown') {
                // Fetch the new widget and unrender it.
                child = notebook.widgets[index];
                (child as MarkdownCell).rendered = false;
            }
        });
        cells.endCompoundOperation();
        notebook.deselectAll();
    }

    /**
     * Delete the selected cells.
     *
     * @param notebook - The target notebook widget.
     *
     * #### Notes
     * The cell after the last selected cell will be activated.
     * If the last cell is deleted, then the previous one will be activated.
     * It will add a code cell if all cells are deleted.
     * This action can be undone.
     */
    export function deleteCells(notebook: Notebook): void {
        const model = notebook.model!;
        const cells = model.cells;
        const toDelete: number[] = [];

        notebook.mode = 'command';

        // Find the cells to delete.
        notebook.widgets.forEach((child, index) => {
            const deletable = child.model.metadata.get('deletable') !== false;

            if (notebook.isSelectedOrActive(child) && deletable) {
                toDelete.push(index);
                model.deletedCells.push(child.model.id);
            }
        });

        // If cells are not deletable, we may not have anything to delete.
        if (toDelete.length > 0) {
            // Delete the cells as one undo event.
            cells.beginCompoundOperation();
            // Delete cells in reverse order to maintain the correct indices.
            toDelete.reverse().forEach(index => {
                cells.remove(index);
            });
            // Add a new cell if the notebook is empty. This is done
            // within the compound operation to make the deletion of
            // a notebook's last cell undoable.
            if (!cells.length) {
                cells.push(
                    model.contentFactory.createCell(
                        notebook.notebookConfig.defaultCell,
                        {}
                    )
                );
            }
            cells.endCompoundOperation();

            // Select the *first* interior cell not deleted or the cell
            // *after* the last selected cell.
            // Note: The activeCellIndex is clamped to the available cells,
            // so if the last cell is deleted the previous cell will be activated.
            // The *first* index is the index of the last cell in the initial
            // toDelete list due to the `reverse` operation above.
            notebook.activeCellIndex = toDelete[0] - toDelete.length + 1;
        }

        // Deselect any remaining, undeletable cells. Do this even if we don't
        // delete anything so that users are aware *something* happened.
        notebook.deselectAll();
    }

    /**
     * Set the markdown header level of a cell.
     */
    export function setMarkdownHeader(cell: ICellModel, level: number) {
        // Remove existing header or leading white space.
        let source = cell.value.text;
        const regex = /^(#+\s*)|^(\s*)/;
        const newHeader = Array(level + 1).join('#') + ' ';
        const matches = regex.exec(source);

        if (matches) {
            source = source.slice(matches[0].length);
        }
        cell.value.text = newHeader + source;
    }
}