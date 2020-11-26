import { Token } from '@lumino/coreutils';

import { ReactWidget, UseSignal } from '@jupyterlab/apputils';

import * as React from 'react';

//import { nullTranslator, ITranslator } from '@jupyterlab/translation';

import { ISignal } from '@lumino/signaling';

import { LabIcon } from '@jupyterlab/ui-components';

import { DirListing } from '@jupyterlab/filebrowser'

import { DisposableDelegate, IDisposable } from '@lumino/disposable';

import { iotIcon } from './index'

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

/* tslint:disable */
/**
 * The running sessions token.
 */
export const IRunningSessionManagers = new Token<IRunningSessionManagers>(
    '@jupyterlab/running:IRunningSessionManagers'
);
/* tslint:enable */

/**
* The running interface.
*/
export interface IRunningSessionManagers {
    /**
     * Add a running item manager.
     *
     * @param manager - The running item manager.
     *
     */
    add(manager: IRunningSessions.IManager): IDisposable;
    /**
     * Return an array of managers.
     */
    items(): ReadonlyArray<IRunningSessions.IManager>;
}

export class RunningSessionManagers implements IRunningSessionManagers {
    /**
     * Add a running item manager.
     *
     * @param manager - The running item manager.
     *
     */
    add(manager: IRunningSessions.IManager): IDisposable {
        this._managers.push(manager);
        return new DisposableDelegate(() => {
            const i = this._managers.indexOf(manager);

            if (i > -1) {
                this._managers.splice(i, 1);
            }
        });
    }

    /**
     * Return an iterator of launcher items.
     */
    items(): ReadonlyArray<IRunningSessions.IManager> {
        return this._managers;
    }

    private _managers: IRunningSessions.IManager[] = [];
}

/**
 * A notebook widget extension that adds a button to the sidebar.
 */
export class IoTSideBar extends ReactWidget {
    constructor(managers: IRunningSessionManagers, 
        //translator?: ITranslator
        ) {
        super();
        console.log('entra');
        this.id = 'iotsidebar';
        this.title.icon = iotIcon;
        this.title.caption = 'IoT Architecture';
        this.title.closable = true;

        this.managers = managers;
        if (this.managers == null) {
            console.log('managers is null');
        }

        //this.translator = translator || nullTranslator;

        this.addClass(WIDGET_CLASS);
    }

    render() {

        return (
            <RunningSessionsComponent
                managers={this.managers}
                //translator={this.translator}
            />
        );
    }

    private managers: IRunningSessionManagers;
    //protected translator: ITranslator;
}

function RunningSessionsComponent(props: {
    managers: IRunningSessionManagers;
    //translator?: ITranslator;
}) {
    //const translator = props.translator || nullTranslator;
    //const trans = translator.load('jupyterlab');
    return (
        <>
            <div className={HEADER_CLASS}>
                {/*<ToolbarButtonComponent
            tooltip={trans.__('Refresh List')}
            icon={refreshIcon}
            onClick={() =>
              props.managers.items().forEach(manager => manager.refreshRunning())
            }
        />*/}
            </div>
            {props.managers.items().map(manager => (
                <Section
                    key={manager.name}
                    manager={manager}
                    //translator={props.translator}
                />
            ))}
        </>
    );
}

function Section(props: { manager: IRunningSessions.IManager; 
    //translator?: ITranslator; 
}) {
    //const translator = props.translator || nullTranslator;
    //const trans = translator.load('jupyterlab');
    return (
        <div className={SECTION_CLASS}>
            <>
                <header className={SECTION_HEADER_CLASS}>
                    <h2>{props.manager.name}</h2>
                </header>
                <div className={CONTAINER_CLASS}>
                    <List manager={props.manager}></List>
                </div>
            </>
        </div>
    );
}

function List(props: {
    manager: IRunningSessions.IManager;
    shutdownLabel?: string;
    shutdownAllLabel?: string;
    //translator?: ITranslator;
}) {
    return (
        <UseSignal signal={props.manager.runningChanged}>
            {() => (
                <ListView runningItems={props.manager.running()}
                    //translator={props.translator}
                />
            )}
        </UseSignal>
    );
}

function ListView(props: {
    runningItems: IRunningSessions.IRunningItem[];
    //translator?: ITranslator;
}) {
    return (
        <ul className={LIST_CLASS}>
            {props.runningItems.map((item, i) => (
                <Item
                    key={i}
                    runningItem={item}
                    //translator={props.translator}
                />
            ))}
        </ul>
    );
}

function Item(props: {
    runningItem: IRunningSessions.IRunningItem;
    shutdownLabel?: string;
    //shutdownItemIcon?: LabIcon;
    //translator?: ITranslator;
}) {
    const { runningItem } = props;
    // const runningItem = props.runningItem;
    // const icon = LabIcon;
    // const detail = runningItem.detail?.();
    //const translator = props.translator || nullTranslator;
    //const trans = translator.load('jupyterlab');
    // const shutdownLabel = props.shutdownLabel || trans.__('Shut Down');
    // const shutdownItemIcon = props.shutdownItemIcon || closeIcon;

    return (
        <li className={ITEM_CLASS}>
            {//<iotaeIcon.react tag="span" stylesheet="runningItem" />
            }
            <span
                className={ITEM_LABEL_CLASS}
                title={runningItem.labelTitle ? runningItem.labelTitle() : ''}
                onClick={() => console.log('Hiciste click')}
            >
                {runningItem.label()}
            </span>
        </li>
    );
}

/**
 * The namespace for the `IRunningSessions` class statics.
 */
export namespace IRunningSessions {
    /**
     * A manager of running items grouped under a single section.
     */
    export interface IManager {
        // Name that is shown to the user in plural
        name: string;
        // called when the shutdown all button is pressed
        shutdownAll(): void;
        // list the running models.
        running(): IRunningItem[];
        // Force a refresh of the running models.
        refreshRunning(): void;
        // A signal that should be emitted when the item list has changed.
        runningChanged: ISignal<any, any>;
        // A string used to describe the shutdown action.
        shutdownLabel?: string;
        // A string used to describe the shutdown all action.
        shutdownAllLabel?: string;
        // A string used as the body text in the shutdown all confirmation dialog.
        shutdownAllConfirmationText?: string;
        // The icon to show for shutting down an individual item in this section.
        shutdownItemIcon?: LabIcon;
    }

    /**
     * A running item.
     */
    export interface IRunningItem {
        // called when the running item is clicked
        open: () => void;
        // called when the shutdown button is pressed on a particular item
        shutdown: () => void;
        // LabIcon to use as the icon
        icon: () => LabIcon;
        // called to determine the label for each item
        label: () => string;
        // called to determine the `title` attribute for each item, which is revealed on hover
        labelTitle?: () => string;
        // called to determine the `detail` attribute which is shown optionally
        // in a column after the label
        detail?: () => string;
    }
}

  /**
   * The default implementation of an `IRenderer`.
   */
  export class IoTRenderer extends DirListing.Renderer {
          /**
     * Create the DOM node for a dir listing.
     */
    createNode(): HTMLElement {
        const node = document.createElement('div');
        const header = document.createElement('div');
        const content = document.createElement('ul');
        //content.className = CONTENT_CLASS;
        header.className = HEADER_CLASS;
        node.appendChild(header);
        node.appendChild(content);
        node.tabIndex = 1;
        return node;
      }
  }