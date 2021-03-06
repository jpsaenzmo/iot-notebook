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

import {
    ICellFooter,
    Cell,
    CodeCell,
    MarkdownCell,
    ICodeCellModel
} from '@jupyterlab/cells';

import { CommandRegistry } from '@lumino/commands';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import {
    ReactWidget,
    ISessionContext,
    Dialog,
    showDialog
} from '@jupyterlab/apputils';

import { each, toArray, ArrayExt } from '@lumino/algorithm';

import { Signal } from '@lumino/signaling';

import { ElementExt } from '@lumino/domutils';

import { nullTranslator, ITranslator } from '@jupyterlab/translation';

import { KernelMessage } from '@jupyterlab/services';

import { IoTToolbar } from './iot-notebook-toolbar';

/**
 * The CSS classes added to the cell footer.
 */
const CELL_FOOTER_CLASS = 'jp-CellFooter';
const CELL_FOOTER_DIV_CLASS = 'iotcell-cellFooterContainer';
const CELL_FOOTER_BUTTON_CLASS = 'iotcell-cellFooterBtn';

const IS_PREREQUISITE = 'is_prerequisite'
const IS_LINKED = 'is_linked_previous_cell'
const IS_LIBRARY = 'is_library_installation'

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

                    const activeIndex = content.activeCellIndex;
                    var tempNotebook: Notebook = content;
                    tempNotebook.model.readOnly = false;

                    var mergedValue = tempNotebook.model.cells.get(activeIndex).value.text;
                    var originalValue: string = tempNotebook.model.cells.get(activeIndex).value.text;

                    var previous = false;

                    for (var _i = activeIndex - 1; _i >= 0; _i--) {
                        if (tempNotebook.model.cells.get(_i).type == 'code') {
                            if (tempNotebook.model.cells.get(_i).metadata.get('is_prerequisite')) {
                                mergedValue = tempNotebook.model.cells.get(_i).value.text + '\n' + mergedValue;
                                if (tempNotebook.model.cells.get(_i).metadata.get('is_linked_previous_cell')) {
                                    previous = true;
                                }
                            }
                            else if (previous) {
                                mergedValue = tempNotebook.model.cells.get(_i).value.text + '\n' + mergedValue;
                                if (tempNotebook.model.cells.get(_i).metadata.get('is_linked_previous_cell') != true) {
                                    previous = false;
                                }
                            }
                        }
                    }
                    if (args.port != 'undefined' && args.port != null) {
                        tempNotebook.model.cells.get(activeIndex).value.text = 'port%' + args.port + '\n' + 'board%' + args.board + '\n' + mergedValue;
                    }
                    else if (args.board != 'undefined') {
                        tempNotebook.model.cells.get(activeIndex).value.text = 'board%' + args.board + '\n' + mergedValue;
                    }
                    else {
                        tempNotebook.model.cells.get(activeIndex).value.text = mergedValue;
                    }

                    NotebookActions.run(content, context.sessionContext);
                    content.model.cells.get(activeIndex).value.text = originalValue;
                    content.update();
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

                    var stop = false;
                    for (var _i = activeIndex; _i >= 0; _i--) {
                        if (tempNotebook.model.cells.get(_i).type == 'code') {
                            if (!stop) {
                                mergedValue = tempNotebook.model.cells.get(_i).value.text + '\n' + mergedValue;
                                if (tempNotebook.model.cells.get(_i).metadata.get('is_linked_previous_cell') != true) {
                                    stop = true;
                                };
                            }
                            else if (tempNotebook.model.cells.get(_i).metadata.get('is_prerequisite')) {
                                mergedValue = tempNotebook.model.cells.get(_i).value.text + '\n' + mergedValue;
                                stop = false;
                            }
                        }
                    }
                    if (args.port != 'undefined' && args.port != null) {
                        tempNotebook.model.cells.get(activeIndex).value.text = 'port%' + args.port + '\n' + 'board%' + args.board + '\n' + mergedValue;
                    }
                    else if (args.board != 'undefined') {
                        tempNotebook.model.cells.get(activeIndex).value.text = 'board%' + args.board + '\n' + mergedValue;
                    }
                    else {
                        tempNotebook.model.cells.get(activeIndex).value.text = mergedValue;
                    }

                    NotebookActions.run(content, context.sessionContext);
                    content.model.cells.get(activeIndex).value.text = originalValue;
                    content.update();
                }
            },
            isEnabled
        });

        commands.addCommand('run-library-installation', {
            label: 'Run Library Installation',
            execute: args => {
                const current = getCurrent(args);

                if (current) {
                    const { context, content } = current;
                    NotebookActions.run(content, context.sessionContext);
                    content.update();
                }

            }, isEnabled
        });

        commands.addCommand('set-as-prerequisite', {
            label: 'Is prerequisite',
            execute: args => {
                const current = getCurrent(args);
                if (current) {
                    const { content } = current;
                    content.activeCell.model.metadata.set(IS_PREREQUISITE, args.state);
                    if (args.state == true) {
                        content.activeCell.model.metadata.set(IS_LIBRARY, false);
                    }
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
                    if (args.state == true) {
                        content.activeCell.model.metadata.set(IS_LIBRARY, false);
                    }
                    content.update();
                }
            },
            isEnabled
        });

        commands.addCommand('set-as-library', {
            label: 'Is a library installation',
            execute: args => {
                const current = getCurrent(args);

                if (current) {
                    const { content } = current;
                    content.activeCell.model.metadata.set(IS_LIBRARY, args.state);
                    if (args.state == true) {
                        content.activeCell.model.metadata.set(IS_PREREQUISITE, false);
                        content.activeCell.model.metadata.set(IS_LINKED, false);
                    }
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

    /**
    * Whether or not the Arduino board is connected.
    */
    private isBoardConnected: boolean;

    /**
    * Whether or not the code in the cell corresponds to the Arduino setup method.
    */
    private isSetup: boolean;

    /**
    * Whether or not the code in the cell corresponds to the Arduino setup method.
    */
    private isLoop: boolean;

    /**
    * Whether or not the code in the cell corresponds to the Arduino setup method.
    */
    private isLibrary: boolean;

    private fqbn: String;

    private port: String;

    private kernel: String;

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
        this.isLibrary = false;
        this.isBoardConnected = false;
        this.isSetup = false;
        this.isLoop = false;
        this.kernel = '';
        this.fqbn;
        this.port;
    }

    _notifyBoardConnection(emitter: IoTToolbar, board: String): void {
        if (board.startsWith('kernel') && this.kernel != board) {
            this.kernel = board.split('kernel')[1];
            this.update();
        }
        else if (!board.startsWith('kernel')) {
            this.isBoardConnected = true;
            this.fqbn = board.split(" ")[0];
            this.port = board.split(" ")[1];

            this.update();
        }
    }

    _notifyKernelChange(emitter: IoTToolbar, kernel: String): void {
        this.kernel = kernel;
    }

    changeIsPrerequisite(prerequisite: boolean) {
        this.isPrerequisite = prerequisite;
        if (prerequisite == true) {
            this.isLibrary = false;
        }
        this.update();
    }

    changeIsLinked(linked: boolean) {
        this.isLinked = linked;
        if (linked == true) {
            this.isLibrary = false;
        }
        this.update();
    }

    changeIsLibrary(library: boolean) {
        this.isLibrary = library;
        if (library == true) {
            this.isPrerequisite = false;
            this.isLinked = false;
        }
        this.update();
    }

    render() {
        return (
            <div className={CELL_FOOTER_DIV_CLASS}>
                <input hidden={true} type="radio" id={"rd:setup" + this.id} name={this.id} checked={this.isSetup}
                    onChange={event => {
                        this.changeIsPrerequisite(!this.isSetup);
                        this.commands.execute('set-as-prerequisite', { state: this.isSetup });
                    }}
                />
                <label hidden={true} htmlFor={"rd:setup" + this.id}>Setup</label><span />
                <input hidden={true} type="radio" id={"rd:loop" + this.id} name={this.id} checked={this.isLoop}
                    onChange={event => {
                        this.changeIsLinked(!this.isLoop);
                        this.commands.execute('set-as-linked', { state: this.isLoop });
                    }} />
                <label hidden={true} htmlFor={"rd:loop" + this.id}>Loop</label>

                <input hidden={this.kernel != 'Arduino'} type="checkbox" id={"cb:library" + this.id} name={this.id} checked={this.isLibrary}
                    onChange={event => {
                        this.changeIsLibrary(!this.isLibrary);
                        this.commands.execute('set-as-library', { state: this.isLibrary });
                    }}
                />
                <label hidden={this.kernel != 'Arduino'} htmlFor={"cb:library" + this.id}>Install library</label><span />

                <input hidden={false} type="checkbox" id={"cb:prerequisite" + this.id} name={this.id} checked={this.isPrerequisite}
                    onChange={event => {
                        this.changeIsPrerequisite(!this.isPrerequisite);
                        this.commands.execute('set-as-prerequisite', { state: this.isPrerequisite });
                    }}
                />
                <label hidden={false} htmlFor={"cb:prerequisite" + this.id}>Is prerequisite</label><span />
                <input hidden={false} type="checkbox" id={"cb:linked" + this.id} name={this.id} checked={this.isLinked}
                    onChange={event => {
                        this.changeIsLinked(!this.isLinked);
                        this.commands.execute('set-as-linked', { state: this.isLinked });
                    }} />
                <label hidden={false} htmlFor={"cb:linked" + this.id}>Execute together with the previous cell</label><br />
                <button
                    className={CELL_FOOTER_BUTTON_CLASS}
                    disabled={this.kernel == 'Arduino' && this.isBoardConnected == false}
                    hidden={this.isPrerequisite == true || this.kernel != 'Arduino' || this.isLibrary == true}
                    onClick={event => {
                        if (!this.isLinked) {
                            this.commands.execute('run-selected-codecell', { board: this.fqbn + '' });
                        }
                        else {
                            this.commands.execute('run-linked-selected-codecell', { board: this.fqbn + '' });
                        }
                    }}
                >
                    verify
                </button>
                <span />
                <button
                    className={CELL_FOOTER_BUTTON_CLASS}
                    disabled={this.kernel == 'Arduino' && this.isBoardConnected == false}
                    hidden={this.isPrerequisite == true}
                    onClick={event => {
                        if (this.isLibrary == true) {
                            this.commands.execute('run-library-installation');
                        }
                        else {
                            if (!this.isLinked) {
                                this.commands.execute('run-selected-codecell', { board: this.fqbn + '', port: this.port + '' });
                            }
                            else {
                                this.commands.execute('run-linked-selected-codecell', { board: this.fqbn + '', port: this.port + '' });
                            }
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
        commands: CommandRegistry, toolbar: IoTToolbar,
        options?: Cell.ContentFactory.IOptions | undefined
    ) {
        super(options);
        this.commands = commands;
        this._toolbar = toolbar;
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
        const footer = new CellFooterWithButton(this.commands);
        this._toolbar.stateChanged.connect(footer._notifyBoardConnection, footer);
        return footer;
    }

    private _toolbar: IoTToolbar;
}

/**
 * Extend the default implementation of a `Notebook`.
 */
class IoTNotebook extends Notebook {

    onActivateRequest() {
        var iden = 0;
        each(this.widgets, widget => {
            const widgetModel = widget.model;
            if (widgetModel.type === 'code' && (widgetModel.metadata.get(IS_PREREQUISITE) != null || widgetModel.metadata.get(IS_LINKED) != null || widgetModel.metadata.get(IS_LIBRARY) != null)) {
                const isPrerequisite = widgetModel.metadata.get(IS_PREREQUISITE) != null && widgetModel.metadata.get(IS_PREREQUISITE) == true ? true : false;
                const isLinked = widgetModel.metadata.get(IS_LINKED) != null && widgetModel.metadata.get(IS_LINKED) == true ? true : false;
                const isLibrary = widgetModel.metadata.get(IS_LIBRARY) != null && widgetModel.metadata.get(IS_LIBRARY) == true ? true : false;
                const childrens = toArray(widget.children());
                const footer = childrens[3] as CellFooterWithButton;
                footer.changeIsPrerequisite(isPrerequisite);
                footer.changeIsLinked(isLinked);
                footer.changeIsLibrary(isLibrary);
            }
            if (widgetModel.type === 'code') {
                const childrens = toArray(widget.children());
                const footer = childrens[3] as CellFooterWithButton;
                footer.id = iden + '';
            }
            iden++;
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
}