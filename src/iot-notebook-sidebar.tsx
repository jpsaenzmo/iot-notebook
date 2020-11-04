import { ReactWidget } from '@jupyterlab/apputils';

import * as React from 'react';

import { ToolbarButtonComponent } from '@jupyterlab/apputils';

import {
    Collapse, caretDownIcon,
    caretRightIcon,
} from '@jupyterlab/ui-components';

import { iotIcon } from './index'

/**
 * Icons with custom styling bound.
 */
const caretDownIconStyled = caretDownIcon.bindprops({
    height: 'auto',
    width: '20px'
});
const caretRightIconStyled = caretRightIcon.bindprops({
    height: 'auto',
    width: '20px'
});

/**
 * A notebook widget extension that adds a button to the sidebar.
 */
export class IoTSideBar extends ReactWidget {
    constructor() {
        super();
        this.id = 'simple-widget-example';
        this.title.icon = iotIcon;
        this.title.caption = 'IoT Architecture';
        this.title.closable = true;
        this.addClass('jp-iotsidebar-view');
    }

    render() {
        return <>
            <CollapsibleSection key="app-section" header='Application and cloud services' disabled={false}>
                <div className="jp-iotsidebar-disclaimer">
                    <div>
                        {'The cloud services manage the devices, acquire and store the data, and provide real-time and/or offline data analytics. Applications range from web-based dashboards to domain-specific web and mobile applications'}
                    </div></div>
            </CollapsibleSection>
            <CollapsibleSection key="devices-section" header='Devices' disabled={false}>
                <div className="jp-iotsidebar-disclaimer">
                    <div>
                        {'Devices comprise hardware to collect sensor data (sensing devices) or perform actions (acting devices)'}
                    </div></div>
            </CollapsibleSection>
            <CollapsibleSection key="gateway-section" header='Gateway' disabled={false}>
                <div className="jp-iotsidebar-disclaimer">
                    <div>
                        {'Gateways collect, preprocess, and forward the data coming from the sensing devices to the cloud, and vice-versa with the requests sent from the cloud to the acting devices'}
                    </div></div>
            </CollapsibleSection></>
    }
}

/**
 * The namespace for collapsible section statics.
 */
export namespace CollapsibleSection {
    /**
     * React properties for collapsible section component.
     */
    export interface IProperties {
        /**
         * The header string for section list.
         */
        header: string;

        /**
         * Whether the view will be expanded or collapsed initially, defaults to open.
         */
        isOpen?: boolean;

        /**
         * Handle collapse event.
         */
        onCollapse?: (isOpen: boolean) => void;

        /**
         * Any additional elements to add to the header.
         */
        headerElements?: React.ReactNode;

        /**
         * If given, this will be diplayed instead of the children.
         */
        errorMessage?: string | null;

        /**
         * If true, the section will be collapsed and will not respond
         * to open nor close actions.
         */
        disabled?: boolean;

        /**
         * If true, the section will be opened if not disabled.
         */
        forceOpen?: boolean;
    }

    /**
     * React state for collapsible section component.
     */
    export interface IState {
        /**
         * Whether the section is expanded or collapsed.
         */
        isOpen: boolean;
    }
}

class CollapsibleSection extends React.Component<
    CollapsibleSection.IProperties,
    CollapsibleSection.IState
    >{

    constructor(props: CollapsibleSection.IProperties) {
        super(props);
        this.state = {
            isOpen: props.isOpen ? true : false
        };
    }

    render(): React.ReactNode {
        {
            let icon = this.state.isOpen ? caretDownIconStyled : caretRightIconStyled;
            let isOpen = this.state.isOpen;
            let className = 'jp-iotsidebar-headerText';
            if (this.props.disabled) {
                icon = caretRightIconStyled;
                isOpen = false;
                className = 'jp-iotsidebar-headerTextDisabled';
            }
            return (
                <>
                    <header>
                        <ToolbarButtonComponent
                            icon={icon}
                            onClick={() => {
                                this.handleCollapse();
                            }}
                        />
                        <span className={className}>{this.props.header}</span>
                        {!this.props.disabled && this.props.headerElements}
                    </header>
                    <Collapse isOpen={isOpen}>{this.props.children}</Collapse>
                </>
            );
        }
    }

    /**
   * Handler for search input changes.
   */
    handleCollapse() {
        this.setState(
            {
                isOpen: !this.state.isOpen
            },
            () => {
                if (this.props.onCollapse) {
                    this.props.onCollapse(this.state.isOpen);
                }
            }
        );
    }
}