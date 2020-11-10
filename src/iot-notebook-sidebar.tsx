import { ReactWidget } from '@jupyterlab/apputils'; //UseSignal

import * as React from 'react';

import { nullTranslator, ITranslator } from '@jupyterlab/translation';

import { iotIcon } from './index'

/**
 * The class name added to a running widget.
 */
const WIDGET_CLASS = 'jp-iotsidebar';

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
 * A notebook widget extension that adds a button to the sidebar.
 */
export class IoTSideBar extends ReactWidget {
    constructor() {
        super();
        this.id = 'iotsidebar';
        this.title.icon = iotIcon;
        this.title.caption = 'IoT Architecture';
        this.title.closable = true;
        this.addClass(WIDGET_CLASS);
    }

    render() {
        return (
            <>
                <Section title='Application and cloud services'></Section>
                <Section title='Devices'></Section>
                <Section title='Gateway'></Section>
                <Section title='Undefined'></Section>
            </>
        );
    }
}

function Section(props: { title: string; translator?: ITranslator; }) {
    const translator = props.translator || nullTranslator;
    const trans = translator.load('jupyterlab');
    return (
        <div className={SECTION_CLASS}>
            <>
                <header className={SECTION_HEADER_CLASS}>
                    <h2>{trans.__(props.title)}</h2>
                </header>

                <div className={CONTAINER_CLASS}>
                    <ListView documents={['Juan', 'Pablo', 'Sáenz']}></ListView>
                </div>
            </>
        </div>
    );
}
/*
function List(props: {
    documents: string[];
    shutdownLabel?: string;
    shutdownAllLabel?: string;
    translator?: ITranslator;
}) {
    return (
        <UseSignal signal={null}>
            {() => (
                <ListView documents={props.documents}
                    translator={props.translator}
                />
            )}
        </UseSignal>
    );
}
*/
function ListView(props: {
    documents: string[];
    translator?: ITranslator;
}) {
    return (
        <ul className={LIST_CLASS}>
            {props.documents.map((item, i) => (
                <Item
                    key={i}
                    runningItem={item}
                    translator={props.translator}
                />
            ))}
        </ul>
    );
}

function Item(props: {
    runningItem: string;
    shutdownLabel?: string;
    //shutdownItemIcon?: LabIcon;
    translator?: ITranslator;
}) {
    const runningItem = props.runningItem;
    // const icon = LabIcon;
    // const detail = runningItem.detail?.();
    // const translator = props.translator || nullTranslator;
    // const trans = translator.load('jupyterlab');
    // const shutdownLabel = props.shutdownLabel || trans.__('Shut Down');
    // const shutdownItemIcon = props.shutdownItemIcon || closeIcon;

    return (
        <li className={ITEM_CLASS}>
            {//<iotaeIcon.react tag="span" stylesheet="runningItem" />
            }
            <span
                className={ITEM_LABEL_CLASS}
                title={runningItem}
                onClick={() => console.log('Hiciste click')}
            >
                {runningItem}
            </span>
        </li>
    );
}