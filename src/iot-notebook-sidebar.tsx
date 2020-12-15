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
        return (
            <IoTNotebooksComponent model={this.model} />
        );
    }

    /**
    * Get the model used by the listing.
    */
    get model(): FileBrowserModel {
        return this._model;
    }

    /**
    * A message handler invoked on an `'after-attach'` message.
    */
    protected onAfterShow(msg: Message): void {
        this.update();
    }

    private _model: FileBrowserModel;
}

function IoTNotebooksComponent(props: {
    model: FileBrowserModel
}) {
    const items = toArray(props.model.items());
    const itemsGroupped: { [id: string]: Contents.IModel[] } = groupItemsByAE(items);
    return (
        <>
            <div className={HEADER_CLASS}>{
                <ToolbarButtonComponent
                    tooltip='Refresh List'
                    icon={refreshIcon}
                    onClick={() =>
                        console.log("Click on the refresh button")
                    }
                />}
            </div>
            {toArray(ARCHITECTURAL_ELEMENTS_LBL).map((element, index) => (
                <Section key={ARCHITECTURAL_ELEMENTS[index]} name={element} items={itemsGroupped[ARCHITECTURAL_ELEMENTS[index]]} />
            ))
            }
        </>
    );
}

function groupItemsByAE(items: Contents.IModel[]): {} {
    const contents = new ContentsManager();
    const elements: { [id: string]: Contents.IModel[] } = {};
    toArray(ARCHITECTURAL_ELEMENTS).map(element => (
        elements[element] = []
    ));
    items.forEach(item => {
        //console.log(item.content);
        if (item.type === 'notebook') {

            const ae = contents.get(item.name);
            elements[ae + ''].push(item);

            //var ae = contents.get(item.name).then((value: Contents.IModel) => {
            //return value.content.metadata.architectural_element;
            // elements[value.content.metadata.architectural_element + ''].push(item)
            //});
            //console.log(ae);
            // elements[ae + ''].push(item);
        }
    }
    );
    return elements;
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