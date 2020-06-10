import { ComponentEx, fs, selectors, types, util, Spinner, MainPage, IconBar, ToolbarIcon } from 'vortex-api';
import { Panel, Tab, Tabs } from 'react-bootstrap';
import * as React from 'react';
import * as Redux from 'redux';
import * as path from 'path';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { TFunction } from 'i18next';

import INIDetails, { INIEntry } from '../types/INIDetails';

interface IBaseProps {
    shown: boolean;
    onHide: () => void;
    active: boolean;
}

interface IConnectedProps {
    gameId: string;
    game: types.IGame;
    profile: types.IProfile;
    t?: TFunction;
}

interface IActionProps {};
  
interface IComponentState {
    loading: boolean;
    loadingMessage?: string;
    iniData?: INIDetails;
}
  
type IProps = IBaseProps & IConnectedProps;

class INIEditor extends ComponentEx<IProps, IComponentState> {
    private staticButtons: types.IActionDefinition[];
    
    constructor(props: IProps) {
        super(props);

        this.initState({
            loading: true,
        });

        this.staticButtons = [
            {
                component: ToolbarIcon,
                props: () => {
                    const { loading } = this.state;
                    return {
                        id: 'btn-back-to-mods',
                        key: 'btn-back-to-mods',
                        icon: loading ? 'locked' : 'nav-back',
                        text: 'Back to Mods',
                        state: loading,
                        onClick: () => {
                            if (loading) return;
                            this.context.api.events.emit('show-main-page', 'Mods');
                        }
                    }
                }
            }
        ];
    }

    // IF REQUIRED THIS CAN BE UNCOMMENTED TO RESET THE PAGE EACH TIME IT IS SWITCH IN AND OUT OF.
    // public componentWillReceiveProps(nextProps: IProps) {
    //     if (!this.props.active && nextProps.active) {
    //         this.nextState.loading = true;
    //         this.start();
    //     }
    // }

    public componentDidMount() {
        this.nextState.loading = true;
        this.start();
    }

    public componentWillUnmount() {
        this.nextState.loading = true;
    }

    private start(): void {
        const { gameId } = this.props;
        setTimeout(() => {
            fs.readdirAsync(path.join(__dirname, gameId)).then()
            .catch(err => console.log(err));
            this.nextState.loading = false
        }, 2000);
    }

    render() : JSX.Element {
        const { loading } = this.state;

        return (
            <MainPage id='ini-editor-page'>
                {this.renderToolBar()}
                {loading
                ? this.renderSpinner()
                : this.renderPage()}
            </MainPage>
        );
    }

    private renderToolBar(): JSX.Element {
        const { t } = this.props;

        return (
            <MainPage.Header>
                <IconBar 
                    group='ini-editor-icons'
                    staticElements={this.staticButtons}
                    className='menubar'
                    t={t}
                />
            </MainPage.Header>
        )
    }

    private renderSpinner(): JSX.Element {
        return (
        <MainPage.Body id='ini-editor-loading'>
            <Panel>
                <Panel.Body>
                    <Spinner />
                </Panel.Body>
            </Panel>
        </MainPage.Body>
        );
    }

    private renderPage(): JSX.Element {
        const { game } = this.props;

        return (
            <MainPage.Body id='ini-editor-page-content'>
                <Panel>
                    <Panel.Body>
                    <h1>Game Settings for {game.name}</h1>
                    Some fluff goes here about the purpose of the extension and how to use it. 
                    </Panel.Body>
                </Panel>
            </MainPage.Body>
        );
    }

}

function mapStateToProps(state: types.IState): IConnectedProps {
    const gameId = selectors.activeGameId(state);
    const game = selectors.gameById(state, gameId);
    const profile = selectors.activeProfile(state);
    return {
        gameId,
        game,
        profile,
    };
}
  
function mapDispatchToProps(dispatch: Redux.Dispatch<any>): IActionProps {
    return {};
}
  
export default withTranslation([ 'common' ])(
    connect(mapStateToProps, mapDispatchToProps)
    (INIEditor) as any) as React.ComponentClass<IBaseProps>;