import { ReactWidget } from '@jupyterlab/apputils';

import * as React from 'react';

import { ToolbarButtonComponent } from '@jupyterlab/apputils';

import {
    LabIcon, Collapse, caretDownIcon,
    caretRightIcon,
} from '@jupyterlab/ui-components';


export const iotIcon = new LabIcon({
    name: 'defaultpkg:iot',
    svgstr: iotIconSvgStr
});

import iotIconSvgStr from '../style/icons/iot.svg';

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
                        {}
                    </div></div>
            </CollapsibleSection>
            <CollapsibleSection key="devices-section" header='Devices' disabled={false}>
                <div className="jp-iotsidebar-disclaimer">
                    <div>
                        {}
                    </div></div>
            </CollapsibleSection>
            <CollapsibleSection key="gateway-section" header='Gateway' disabled={false}>
                <div className="jp-iotsidebar-disclaimer">
                    <div>
                        {}
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