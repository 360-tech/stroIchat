// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Constants from 'utils/constants';
import RootPortal from 'components/root_portal';

import MenuWrapperAnimation from './menu_wrapper_animation';

import './menu_wrapper.scss';

declare module 'react' {

    // This isn't a valid HTML attribute, but we use it in enough places now that it'll require some work to remove it

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface HTMLAttributes<T> {
        disabled?: boolean;
    }
}

type Props = {
    children?: React.ReactNode;
    className: string;
    onToggle?: (open: boolean) => void;
    animationComponent: any;
    id?: string;
    isDisabled?: boolean;
    stopPropagationOnToggle?: boolean;
    open?: boolean;
    portalRootId?: string;
    renderInPortal?: boolean;
}

type State = {
    open: boolean;
    menuPosition: MenuPosition | null;
}

type MenuPosition = {
    readonly top: number;
    readonly left: number;
};

/**
 * @deprecated Use the "webapp/channels/src/components/menu" instead.
 */
export default class MenuWrapper extends React.PureComponent<Props, State> {
    private node: React.RefObject<HTMLDivElement>;

    public static defaultProps = {
        className: '',
        animationComponent: MenuWrapperAnimation,
    };

    public constructor(props: Props) {
        super(props);
        if (!Array.isArray(props.children) || props.children.length !== 2) {
            throw new Error('MenuWrapper needs exactly 2 children');
        }
        this.state = {
            open: false,
            menuPosition: null,
        };
        this.node = React.createRef();
    }

    public componentDidMount() {
        if (this.state.open) {
            this.addEventListeners();
        }
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.open !== undefined && props.open !== state.open) {
            return {
                open: props.open,
            };
        }
        return null;
    }

    public componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.open && !prevState.open) {
            this.addEventListeners();
        } else if (!this.state.open && prevState.open) {
            this.removeEventListeners();
        }
    }

    public componentWillUnmount() {
        if (this.state.open) {
            this.removeEventListeners();
        }
    }

    private addEventListeners() {
        document.addEventListener('click', this.closeOnBlur, true);
        document.addEventListener('keyup', this.keyboardClose, true);

        if (this.props.renderInPortal) {
            this.updatePortalPosition();
            window.addEventListener('resize', this.updatePortalPosition);
            window.addEventListener('scroll', this.updatePortalPosition, true);
        }
    }

    private removeEventListeners() {
        document.removeEventListener('click', this.closeOnBlur, true);
        document.removeEventListener('keyup', this.keyboardClose, true);

        if (this.props.renderInPortal) {
            window.removeEventListener('resize', this.updatePortalPosition);
            window.removeEventListener('scroll', this.updatePortalPosition, true);
        }
    }

    private updatePortalPosition = () => {
        if (!this.node.current) {
            return;
        }

        const rect = this.node.current.getBoundingClientRect();
        const nextPosition = {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
        };

        this.setState((prevState) => {
            if (
                prevState.menuPosition &&
                prevState.menuPosition.top === nextPosition.top &&
                prevState.menuPosition.left === nextPosition.left
            ) {
                return null;
            }

            return {menuPosition: nextPosition};
        });
    };

    private keyboardClose = (e: KeyboardEvent) => {
        if (e.key === Constants.KeyCodes.ESCAPE[0]) {
            this.close();
        }

        if (e.key === Constants.KeyCodes.TAB[0]) {
            this.closeOnBlur(e);
        }
    };

    private closeOnBlur = (e: Event) => {
        const target = e.target as Node | null;
        if (!target) {
            this.close();
            return;
        }

        if (this.node && this.node.current && this.node.current.contains(target)) {
            return;
        }

        if (this.props.portalRootId) {
            const portalRoot = document.getElementById(this.props.portalRootId);
            if (portalRoot && portalRoot.contains(target)) {
                return;
            }
        }

        this.close();
    };

    public close = () => {
        if (this.state.open) {
            this.setState({open: false, menuPosition: null});
            if (this.props.onToggle) {
                this.props.onToggle(false);
            }
        }
    };

    toggle = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        /**
         * This is only here so that we can toggle the menus in the sidebar, because the default behavior of the mobile
         * version (ie the one that uses a modal) needs propagation to close the modal after selecting something
         * We need to refactor this so that the modal is explicitly closed on toggle, but for now I am aiming to preserve the existing logic
         * so as to not break other things
        **/
        if (this.props.stopPropagationOnToggle) {
            e.preventDefault();
            e.stopPropagation();
        }
        const newState = !this.state.open;
        this.setState({open: newState}, () => {
            if (newState && this.props.renderInPortal) {
                this.updatePortalPosition();
            }

            if (this.props.onToggle) {
                this.props.onToggle(newState);
            }
        });
    };

    private handlePortalClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement | null;
        if (!target) {
            return;
        }

        if (target.classList.contains('Menu__content')) {
            return;
        }

        this.close();
    };

    public render() {
        const {children} = this.props;

        const Animation = this.props.animationComponent;
        const menuContent = (
            <Animation show={this.state.open}>
                {children ? Object.values(children)[1] : {}}
            </Animation>
        );
        const shouldRenderInPortal = this.props.renderInPortal && this.props.portalRootId;

        return (
            <div
                id={this.props.id}
                className={'MenuWrapper ' + this.props.className + (this.state.open ? ' MenuWrapper--open' : '')}
                onClick={this.toggle}
                ref={this.node}
                disabled={this.props.isDisabled}
            >
                {children ? Object.values(children)[0] : {}}
                {shouldRenderInPortal ? (
                    <RootPortal>
                        <div
                            id={this.props.portalRootId}
                            style={{
                                position: 'absolute',
                                top: this.state.menuPosition?.top,
                                left: this.state.menuPosition?.left,
                                zIndex: 10000,
                            }}
                            onClick={this.handlePortalClick}
                        >
                            {menuContent}
                        </div>
                    </RootPortal>
                ) : (
                    menuContent
                )}
            </div>
        );
    }
}
