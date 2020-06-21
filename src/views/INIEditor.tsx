import { ComponentEx, selectors, types, util, Spinner, MainPage, IconBar, ToolbarIcon, log, Icon } from 'vortex-api';
import { Panel, Tab, Tabs } from 'react-bootstrap';
import * as React from 'react';
import * as Redux from 'redux';;
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { TFunction } from 'i18next';

import { INISettings } from '../types/INIDetails';
import loadINIData from '../util/loadINIdata';
import INITabContent from '../views/INITabContent';

type INITab = 'General' | 'Display' | 'Gameplay' | 'Interface' | 'Visuals' | 'Advanced';

interface IBaseProps {
    shown: boolean;
    onHide: () => void;
    active: boolean;
}

interface IConnectedProps {
    gameId: string;
    game: types.IGame;
    profile: types.IProfile;
    discovery: any;
    t?: TFunction;
}

interface IActionProps {};
  
interface IComponentState {
    loading: boolean;
    loadingMessage?: string;
    loadedData?: INISettings;
    workingData?: INISettings;
    activeTab: INITab;
    error?: boolean;
}
  
type IProps = IBaseProps & IConnectedProps;

class INIEditor extends ComponentEx<IProps, IComponentState> {
    private staticButtons: types.IActionDefinition[];
    private static INITabs: INITab[] = ['General', 'Display', 'Gameplay', 'Interface', 'Visuals', 'Advanced'];
    
    constructor(props: IProps) {
        super(props);

        this.initState({
            loading: true,
            activeTab: 'General',
        });

        this.staticButtons = [
            {
                component: ToolbarIcon,
                props: () => {
                    const { loading, error } = this.state;
                    const { t } = this.props;
                    return {
                        id: 'btn-back-to-mods',
                        key: 'btn-back-to-mods',
                        icon: 'nav-back',
                        text: 'Back to Mods',
                        state: loading,
                        condition: () => loading && !error ? t('Please wait for the page to finish loading.') : true,
                        onClick: () => {
                            if (loading) return;
                            this.context.api.events.emit('show-main-page', 'Mods');
                        }
                    }
                }
            },
            {
                component: ToolbarIcon,
                props: () => {
                    const { loading } = this.state;
                    const { t } = this.props;
                    return {
                        id: 'btn-save-inis',
                        key: 'btn-save-inis',
                        icon: 'savegame',
                        text: 'Save',
                        state: loading,
                        condition: () => loading ? t('Please wait for the page to finish loading.') : true,
                        onClick: () => undefined
                    }
                }
            },
            {
                component: ToolbarIcon,
                props: () => {
                    const { loading } = this.state;
                    const { t } = this.props;
                    return {
                        id: 'btn-reset-inis',
                        key: 'btn-reset-inis',
                        icon: 'refresh',
                        text: 'Reset',
                        state: loading,
                        condition: () => loading ? t('Please wait for the page to finish loading.') : true,
                        onClick: () => {
                            this.nextState.loading = true;
                            this.start(); 
                            this.forceUpdate();
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

    private start(): Promise<any> {
        const { gameId, profile } = this.props;
        // const profileId = profile ? profile.id : undefined;
        const loadMsg = (msg : string) => this.nextState.loadingMessage = msg;

        return loadINIData(loadMsg, gameId)
        .then((iniData) => {
            this.nextState.loadedData = iniData;
            this.nextState.workingData = new INISettings(JSON.parse(JSON.stringify(iniData)));
            this.nextState.loading = false;
            this.nextState.loadingMessage = null;
            // console.log(iniData);
            return Promise.resolve();
        })
        .catch((err) => {
            log('error', 'Error getting INI data', err);
            this.nextState.error = true;
            setTimeout(() => {
                this.context.api.events.emit('show-main-page', 'Mods');
                this.nextState.error = undefined;
            }, 5000);
        });
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
        const { loadingMessage, error } = this.state;
        return (
        <MainPage.Body id='ini-editor-loading'>
            <Panel>
                <Panel.Body>
                    <div className="page-wait-spinner-container">
                    {!error ? <Spinner className='page-wait-spinner' /> : <Icon name='feedback-error' />}
                    </div>
                    {loadingMessage}
                </Panel.Body>
            </Panel>
        </MainPage.Body>
        );
    }

    private renderPage(): JSX.Element {
        const { game } = this.props;
        const { activeTab } = this.state;

        return (
            <MainPage.Body id='ini-editor-page-content'>
                <Panel>
                    <Panel.Body>
                    <h1>Game Settings for {game.name}</h1>
                    Some fluff goes here about the purpose of the extension and how to use it. 
                    <Tabs id="ini-tabs" activeKey={activeTab} onSelect={(tab: INITab) => this.nextState.activeTab = tab}>
                        {INIEditor.INITabs.map((tab: INITab) => {
                            return (
                            <Tab key={tab.toLowerCase().replace(' ', '-')} eventKey={tab} title={tab}>
                                {this.renderTabContent(tab)}
                            </Tab>
                            );
                        })}
                    </Tabs>
                    </Panel.Body>
                </Panel>
            </MainPage.Body>
        );
    }

    private renderTabContent(tabName: INITab): JSX.Element {
        const { activeTab, workingData, loadedData } = this.state;

        switch(INIEditor.INITabs.includes(tabName) && activeTab === tabName) {
            case true: return <INITabContent tabName={tabName} working={workingData} saved={loadedData} />
            default : return null
        }
    }

}

function mapStateToProps(state: types.IState): IConnectedProps {
    const gameId = selectors.activeGameId(state);
    const game = selectors.gameById(state, gameId);
    const profile = selectors.activeProfile(state);
    const discovery = util.getSafe(state, ['settings', 'gameMode', 'discovered', gameId], {})
    return {
        gameId,
        game,
        profile,
        discovery,
    };
}
  
function mapDispatchToProps(dispatch: Redux.Dispatch<any>): IActionProps {
    return {};
}
  
export default withTranslation([ 'common' ])(
    connect(mapStateToProps, mapDispatchToProps)
    (INIEditor) as any) as React.ComponentClass<IBaseProps>;