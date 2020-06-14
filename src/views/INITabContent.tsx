import * as React from 'react';
import { Row, Col, Panel, PanelGroup } from 'react-bootstrap';
import { ComponentEx, Icon } from 'vortex-api';
import { INISettings } from '../types/INIDetails';
import INISetting from './INISetting';

// List of settings that are manually rendered in the visible area at the top of each tab. Others will be loaded into to the advanced/undocumented sections.
const visibleSettings = {
    General: ['iSize H', 'iSize W'],
    Display: [],
    Gameplay: [],
    Interface: [],
    Visuals: [],
    Advanced: [],
}

// For undocumented settings, place the settings in these categories on each tab.
const sectionsToInclude = {
    General: [],
    Display: [],
    Gameplay: [],
    Interface: [],
    Visuals: [],
    Advanced: [],
}

interface IProps {
    tabName: string;
    working: INISettings;
    saved: INISettings;
}

interface IComponentState {
    expandAdvanced: boolean;
    expandUndocumented: boolean;
}

function nop() {
    // nop
}

class INITabContent extends ComponentEx<IProps, IComponentState> {
    constructor(props) {
        super(props);

        this.initState({
            expandAdvanced: false,
            expandUndocumented: false,
        });

    }

    render(): JSX.Element {
        const { tabName } = this.props;
        const { expandAdvanced, expandUndocumented } = this.state;

        return (
            <span className='ini-editor-tab-content'>
                {tabName} Settings go here.
                {this.renderVisibleSettings()}
                
                <PanelGroup id={`${tabName}-panel-group`}>
                    <Panel expanded={expandAdvanced} eventKey={`${tabName}-advanced`} onToggle={nop}>
                        <Panel.Heading onClick={this.toggleAdvanced}>
                            <Panel.Title><Icon name={expandAdvanced ? 'showhide-down' : 'showhide-right'} /> Advanced</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body collapsible>
                            {expandAdvanced ? 'Advanced Settings.' : null}
                        </Panel.Body>
                    </Panel>
                    <Panel expanded={expandUndocumented} eventKey={`${tabName}-undocumented`} onToggle={nop}>
                        <Panel.Heading onClick={this.toggleUnDocumented}>
                            <Panel.Title><Icon name={expandUndocumented ? 'showhide-down' : 'showhide-right'} /> Undocumented</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body collapsible>
                            {expandUndocumented ? 'Undocumented Settings.' : null}
                        </Panel.Body>
                    </Panel>
                </PanelGroup>
            </span>
        );
    }

    private toggleAdvanced = () => {
        this.nextState.expandAdvanced = !this.state.expandAdvanced;
    }

    private toggleUnDocumented = () => {
        this.nextState.expandUndocumented = !this.state.expandUndocumented;
    }

    renderVisibleSettings(): JSX.Element {
        const { tabName } = this.props;
        switch (tabName) {
            case 'General': return this.renderGeneralSettings();
            case 'Display': return this.renderDisplaySettings();
            case 'Gameplay': return this.renderGameplaySettings();
            case 'Interface': return this.renderInterfaceSettings();
            case 'Visuals': return this.renderVisualSettings();
            case 'Advanced': return this.renderAdvancedSettings();
            default: return null;
        }
    }

    renderGeneralSettings(): JSX.Element {
        const { tabName, working, saved } = this.props;

        let settingComponents: JSX.Element[] = [];

        const widthSetting = working.getSetting('iSize W');
        const heightSetting = working.getSetting('iSize H');
        if (widthSetting && heightSetting) settingComponents.push(<p>Resolution: {widthSetting.value.current} x {heightSetting.value.current}</p>);

        if (working.getSetting('bUseTAA')) settingComponents.push(
        <INISetting
            name='bUseTAA'
            workingINI={working}
            savedINI={saved}
        />
        );


        if (working.getSetting('bFull Screen')) settingComponents.push(
        <INISetting
            name='bFull Screen'
            workingINI={working}
            savedINI={saved}
        />
        );

        if (working.getSetting('bBorderless')) settingComponents.push(
        <INISetting
            name='bBorderless'
            workingINI={working}
            savedINI={saved}
        />
        );

        if (working.getSetting('bFXAAEnabled')) settingComponents.push(
        <INISetting
            name='bFXAAEnabled'
            workingINI={working}
            savedINI={saved}
        />
        );
        if (working.getSetting('bAlwaysActive')) settingComponents.push(
            <INISetting
                name='bAlwaysActive'
                workingINI={working}
                savedINI={saved}
            />
            );
        
        const otherValues = working.iniValues.filter(v => v.displayTab === tabName && v.category === 'general')
        .map(set => (
        <INISetting 
            name={set.name}
            workingINI={working}
            savedINI={saved}
        />
        ));

        settingComponents = settingComponents.concat(otherValues);


        
        return (
        <span>
            {this.createRows(settingComponents)}
        </span>
        );
    }

    renderDisplaySettings(): JSX.Element {
        const { tabName } = this.props;
        
        return (<p>Render {tabName}</p>);
    }

    renderGameplaySettings(): JSX.Element {
        const { tabName } = this.props;
        
        return (<p>Render {tabName}</p>);
    }

    renderInterfaceSettings(): JSX.Element {
        const { tabName } = this.props;
        
        return (<p>Render {tabName}</p>);
    }

    renderVisualSettings(): JSX.Element {
        const { tabName } = this.props;
        
        return (<p>Render {tabName}</p>);
    }

    renderAdvancedSettings(): JSX.Element {
        const { tabName } = this.props;
        
        return (<p>Render {tabName}</p>);
    }

    createRows(settings: JSX.Element[]): JSX.Element {
        const rowCount = 4;
        let index = 0;
        let result = [];
        for (index = 0; index < settings.length; index += rowCount) {
            const rowValues = settings.slice(index, index+rowCount);
            result.push(
            <Row>
                <Col className={rowValues[0] ? `ini-setting-container`: ''} xs={12}>{rowValues[0]}</Col>
                <Col className={rowValues[1] ? `ini-setting-container`: ''} xs={12}>{rowValues[1]}</Col>
                <Col className={rowValues[2] ? `ini-setting-container`: ''} xs={12}>{rowValues[2]}</Col>
                <Col className={rowValues[3] ? `ini-setting-container`: ''} xs={12}>{rowValues[3]}</Col>
            </Row>
            );
        }

        return (<span>{result}</span>);

    }


}

export default INITabContent;