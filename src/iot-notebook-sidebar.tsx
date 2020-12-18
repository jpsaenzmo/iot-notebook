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

var elements: { [id: string]: Contents.IModel[] } = {};

//var numElements = 0;

export class IoTDirListing extends ReactWidget {

    constructor(model: FileBrowserModel) {
        super();
        this.id = 'iotsidebar';
        this.title.icon = iotIcon;
        this.title.caption = 'IoT Architecture';
        this.title.closable = true;
        this.addClass(WIDGET_CLASS);

        this._model = model;


        //numElements = 0;

    }

    render() {
        return (
            <Welcome model={this._model} />
        );
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
        this.update;
    }

    private _model: FileBrowserModel;
}


interface IWelcomeProps {
    model: FileBrowserModel;
}

interface IWelcomeState {
    lista: { [id: string]: Contents.IModel[] };
}


class Welcome extends React.Component<IWelcomeProps, IWelcomeState> {

    contents = new ContentsManager();

    constructor(props: any) {
        super(props);
        // No llames this.setState() aquí!
        this.state = { lista: {} };

        elements = {};
        toArray(ARCHITECTURAL_ELEMENTS).map(element => (
            elements[element] = []
        ));
    }

    componentDidMount() {




        //const items = toArray(this.props.model.items());

        

        toArray(this.props.model.items()).forEach(item => {
            if (item.type === 'notebook') {



                const ae = test(this.contents, item.name);

                //contents.get(item.name);

                console.log("ae" + ae);



                this.contents.get(item.name).then((value: Contents.IModel) => {
                    // populateList(value.content.metadata.architectural_element, value, numNotebooks);
                    elements[value.content.metadata.architectural_element].push(item);
                    if (value != null) {
                        console.log("Trata de hacer render");
                    }
                    this.setState({ lista: elements });
                    //numElements++;

                });

            }
        }
        );
    }

    render() {
        console.log("Entra al rendenkjkljlr");
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
                <div id='ae-section'>
                    {toArray(ARCHITECTURAL_ELEMENTS_LBL).map((element, index) => (
                        <Section key={ARCHITECTURAL_ELEMENTS[index]} name={element} items={this.state.lista[ARCHITECTURAL_ELEMENTS[index]]} />
                    ))
                    }
                </div>
            </>);
    }
}



/*
function IoTNotebooksComponent(props: {
    model: FileBrowserModel
}) {



    //var numNotebooks = 0;

    //items.forEach(item => { if (item.type === 'notebook') { numNotebooks++; } });

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
            <div id='ae-section'>
                {toArray(ARCHITECTURAL_ELEMENTS_LBL).map((element, index) => (
                    <Section key={ARCHITECTURAL_ELEMENTS[index]} name={element} items={elements[ARCHITECTURAL_ELEMENTS[index]]} />
                ))
                }
            </div>
        </>
    );
}
*/
async function test(contents: ContentsManager, item: string) {
    const ae = await contents.get(item);
    return ae.content.metadata.architectural_element;
}

/*
function groupItemsByAE(items: Contents.IModel[]) {

}

function populateList(ae: string, item: Contents.IModel, lenItems: number) {
    numElements++;
    if (item != null) {
        elements[ae].push(item);
    }
    if (lenItems - numElements == 0) {
        window.location.reload;
    }
}
*/
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