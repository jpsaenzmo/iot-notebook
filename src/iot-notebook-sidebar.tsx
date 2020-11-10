import { ReactWidget } from '@jupyterlab/apputils';

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
                </div>
            </>
        </div>
    );
}