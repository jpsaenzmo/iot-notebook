import React from 'react';

import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { FileBrowserModel } from '@jupyterlab/filebrowser';

import { Message } from '@lumino/messaging';

import { toArray } from '@lumino/algorithm';

import { Contents } from '@jupyterlab/services';

import { refreshIcon } from '@jupyterlab/ui-components';

import { iotIcon } from './index';

import { ContentsManager } from '@jupyterlab/services';

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

    constructor(model: FileBrowserModel) {
        super();
        this.id = 'iotsidebar';
        this.title.icon = iotIcon;
        this.title.caption = 'IoT Architecture';
        this.title.closable = true;
        this.addClass(WIDGET_CLASS);

        this._model = model;
    }

    render() {
        return (<IoTNotebooksComponent model={this._model} />);
    }

    /**
    * Get the model used by the listing.
    */
    get model(): FileBrowserModel {
        return this._model;
    }

    /**
    * A message handler invoked on an `'after-show'` message.
    */
    protected onAfterShow(msg: Message): void {

    }

    private _model: FileBrowserModel;
}

interface IIoTNotebookProps {
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
                    <ToolbarButtonComponent
                        tooltip='Refresh List'
                        icon={refreshIcon}
                        onClick={() =>
                            console.log("Click on the refresh button")
                        }
                    />
                }
                </div>
                {toArray(ARCHITECTURAL_ELEMENTS_LBL).map((element, index) => (
                    <Section key={ARCHITECTURAL_ELEMENTS[index]} name={element} items={this.elements[ARCHITECTURAL_ELEMENTS[index]]} />
                ))
                }
            </>);
    }
}

function Section(props: {
    name: String;
    items: Contents.IModel[]
}) {
    return (
        <div className={SECTION_CLASS}>
            <>
                <header className={SECTION_HEADER_CLASS}>
                    <h2>{props.name}</h2>
                </header>
                <div className={CONTAINER_CLASS}>
                    <List items={props.items} />
                </div>
            </>
        </div>
    );
}

function List(props: {
    items: Contents.IModel[]
}) {
    return (<ListView items={props.items} />);
}

function ListView(props: {
    items: Contents.IModel[]
}) {
    return (
        <ul className={LIST_CLASS}>
            {props.items.map((item, i) => (
                <Item
                    key={i}
                    item={item}
                />
            ))}
        </ul>
    );
}

function Item(props: {
    item: Contents.IModel
}) {
    return (
        <li className={ITEM_CLASS}>
            <span
                className={ITEM_LABEL_CLASS}
                title={props.item.name}
                onClick={() => console.log('Click over an item')}
            >
                {props.item.name}
            </span>
        </li>
    );
}