import React from 'react';

import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { FileBrowserModel } from '@jupyterlab/filebrowser';

import { toArray } from '@lumino/algorithm';

import { Contents } from '@jupyterlab/services';

import { iotIcon } from './index';

import { ContentsManager } from '@jupyterlab/services';

import { JupyterFrontEnd } from '@jupyterlab/application';

/**
 * The class name added to a running widget.
 */
const WIDGET_CLASS = 'jp-iotsidebar';

/**
 * The class name added to a running widget header.
 */
const HEADER_CLASS = 'jp-iotsidebar-header';

/**
 * The class name added to the IoT architectural elements section.
 */
const SECTION_CLASS = 'jp-iotsidebar-section';

/**
 * The class name added to the IoT architectural elements section header.
 */
const SECTION_HEADER_CLASS = 'jp-iotsidebar-sectionHeader';

/**
 * The class name added to a section container.
 */
const CONTAINER_CLASS = 'jp-iotsidebar-sectionContainer';

/**
 * The class name added to the IoT architectural elements section list.
 */
const LIST_CLASS = 'jp-iotsidebar-sectionList';

/**
 * The class name added to the running sessions items.
 */
const ITEM_CLASS = 'jp-iotsidebar-item';

/**
 * The class name added to a running session item label.
 */
const ITEM_LABEL_CLASS = 'jp-iotsidebar-itemLabel';

/**
 * The Architectural Elements name to display on the labels.
 */
const ARCHITECTURAL_ELEMENTS_LBL = ['Application & Cloud Services', 'Devices', 'Gateway', 'Undefined'];

/**
 * The Architectural Elements indexes.
 */
const ARCHITECTURAL_ELEMENTS = ['app-and-cloud', 'device', 'gateway', 'undefined'];

export class IoTDirListing extends ReactWidget {

    constructor(app: JupyterFrontEnd, model: FileBrowserModel) {
        super();
        this.id = 'iotsidebar';
        this.title.icon = iotIcon;
        this.title.caption = 'IoT Architecture';
        this.title.closable = true;
        this.addClass(WIDGET_CLASS);

        this._app = app;
        this._model = model;
    }

    render() {
        return (<IoTNotebooksComponent app={this._app} model={this._model} />);
    }

    /**
    * Get the model used by the listing.
    */
    get model(): FileBrowserModel {
        return this._model;
    }

    private _app: JupyterFrontEnd;
    private _model: FileBrowserModel;
}

interface IIoTNotebookProps {
    app: JupyterFrontEnd;
    model: FileBrowserModel;
}

interface IIoTNotebookState {
    lista: { [id: string]: Contents.IModel[] };
}

class IoTNotebooksComponent extends React.Component<IIoTNotebookProps, IIoTNotebookState> {

    contents = new ContentsManager();

    elements: { [id: string]: Contents.IModel[] } = {};

    constructor(props: any) {
        super(props);
        this.state = { lista: {} };

        this.elements = {};
        toArray(ARCHITECTURAL_ELEMENTS).map(element => (
            this.elements[element] = []
        ));

        const { services } = props.model.manager;
        services.contents.fileChanged.connect(this._onFileChanged, this);
    }

    private initElements(): void {
        this.elements = {};
        toArray(ARCHITECTURAL_ELEMENTS).map(element => (
            this.elements[element] = []
        ));
    }

    /**
    * Handle a change on the contents manager.
    */
    private _onFileChanged(
        sender: Contents.IManager,
        change: Contents.IChangedArgs
    ): void {
        this.initElements();
        toArray(this.props.model.items()).forEach(item => {
            if (item.type === 'notebook') {
                this.contents.get(item.name).then((value: Contents.IModel) => {
                    this.elements[value.content.metadata.architectural_element].push(item);
                    this.setState({ lista: this.elements });
                });
            }
        });
    }

    componentDidMount() {
        toArray(this.props.model.items()).forEach(item => {
            if (item.type === 'notebook') {
                this.contents.get(item.name).then((value: Contents.IModel) => {
                    this.elements[value.content.metadata.architectural_element].push(item);
                    this.setState({ lista: this.elements });
                });
            }
        });
    }

    render() {
        return (
            <>
                <div className={HEADER_CLASS}>{
                    <ToolbarButtonComponent/>
                }
                </div>
                {toArray(ARCHITECTURAL_ELEMENTS_LBL).map((element, index) => (
                    <Section key={ARCHITECTURAL_ELEMENTS[index]} name={element} items={this.elements[ARCHITECTURAL_ELEMENTS[index]]} app={this.props.app} />
                ))
                }
            </>);
    }
}

function Section(props: {
    name: String;
    items: Contents.IModel[];
    app: JupyterFrontEnd
}) {
    return (
        <div className={SECTION_CLASS}>
            <>
                <header className={SECTION_HEADER_CLASS}>
                    <h2>{props.name}</h2>
                </header>
                <div className={CONTAINER_CLASS}>
                    <List items={props.items} app={props.app} />
                </div>
            </>
        </div>
    );
}

function List(props: {
    items: Contents.IModel[];
    app: JupyterFrontEnd
}) {
    return (<ListView items={props.items} app={props.app} />);
}

function ListView(props: {
    items: Contents.IModel[];
    app: JupyterFrontEnd
}) {
    return (
        <ul className={LIST_CLASS}>
            {props.items.map((item, i) => (
                <Item
                    key={i}
                    item={item}
                    app={props.app}
                />
            ))}
        </ul>
    );
}

function Item(props: {
    item: Contents.IModel;
    app: JupyterFrontEnd
}) {
    const path = props.item.path;
    return (
        <li className={ITEM_CLASS}>
            <span
                className={ITEM_LABEL_CLASS}
                title={props.item.name}
                onClick={
                    () => void props.app.commands.execute('docmanager:open', { path })
                }
            >
                {props.item.name}
            </span>
        </li>
    );
}