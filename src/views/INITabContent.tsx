import * as React from 'react';
import { Row, Col, Panel, PanelGroup } from 'react-bootstrap';
import { ComponentEx, Icon } from 'vortex-api';
import Select from 'react-select';
import { INISettings, INIEntry } from '../types/INIDetails';
import INISetting from './INISetting';
import INIResolution from './INIResolution';

// List of settings that are manually rendered in the visible area at the top of each tab. Others will be loaded into to the advanced/undocumented sections.
const visibleSettings = {
    General: ['iSize H', 'iSize W', 'bFull Screen', 'bBorderless', 'bUseTAA', 'bAlwaysActive'],
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
    advancedFilter?: { label: string, value: any };
    advancedActiveSetting?: { label: string, value: any, setting?: INIEntry };
}

function nop() {
    // nop
}

class INITabContent extends ComponentEx<IProps, IComponentState> {
    constructor(props) {
        super(props);

        this.initState({
            expandAdvanced: false,
        });

    }

    render(): JSX.Element {
        const { tabName, working, saved } = this.props;
        const { expandAdvanced } = this.state;

        const advanced = working.iniValues.filter(s => !s.visible && s.displayTab === tabName)
        .map(uS => <INISetting name={uS.name} workingINI={working} savedINI={saved} />);

        if (tabName === 'Advanced') return this.renderAdvancedSettings();

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
                            {this.createRows(advanced)}
                        </Panel.Body>
                    </Panel>
                </PanelGroup>
            </span>
        );
    }

    private toggleAdvanced = () => {
        this.nextState.expandAdvanced = !this.state.expandAdvanced;
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

        if (working.getSetting('iSize W') && working.getSetting('iSize H')) settingComponents.push(
            <INIResolution nameW='iSize W' nameH='iSize H' workingINI={working} savedINI={saved}/>
        );

        if (working.getSetting('bFull Screen')) settingComponents.push(
            <INISetting name='bFull Screen' workingINI={working} savedINI={saved} />
        );
        if (working.getSetting('bBorderless')) settingComponents.push(
            <INISetting name='bBorderless' workingINI={working} savedINI={saved} />
        );
        if (working.getSetting('bFXAAEnabled')) settingComponents.push(
            <INISetting name='bFXAAEnabled' workingINI={working} savedINI={saved} />
        );
        if (working.getSetting('bUseTAA')) settingComponents.push(
            <INISetting name='bUseTAA' workingINI={working} savedINI={saved} />
        );
        if (working.getSetting('bAlwaysActive')) settingComponents.push(
            <INISetting name='bAlwaysActive' workingINI={working} savedINI={saved} />
        );
        const otherValues = working.iniValues.filter(v => v.displayTab === tabName && v.visible && !visibleSettings[tabName].includes(v.name))
        .map(set => (<INISetting name={set.name} workingINI={working} savedINI={saved} />));

        settingComponents = settingComponents.concat(otherValues);
        
        return (
        <>
            {this.createRows(settingComponents)}
        </>
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
        const { tabName, working, saved } = this.props;
        const { advancedFilter, advancedActiveSetting } = this.state;

        const sections = [];

        const options = working.iniValues.map((v: INIEntry) => {
            if (!sections.find(s => s.value === v.section)) sections.push({ label: `[${v.section}]`, value: v.section });

            return {
                label: v.name,
                value: v.name,
                setting: v
            }
        }).filter((o) => advancedFilter ? o.setting.section === advancedFilter.value : o);
        
        return (
        <span className='ini-editor-tab-content'>
            <p>{tabName} settings</p>
            Category
            <Select
                options={sections}
                value={advancedFilter}
                onChange={(newValue: { label: string, value: any }) => {
                    this.nextState.advancedFilter = newValue;
                    this.nextState.advancedActiveSetting = null;
                }}
            />
            Setting
            <Select
                options={options}
                value={advancedActiveSetting}
                onChange={(newValue: { label: string, value: any }) => this.nextState.advancedActiveSetting = newValue}
            />
            {advancedActiveSetting ? <div className="ini-setting-container">
                <INISetting name={working.getSetting(advancedActiveSetting.label).name} workingINI={working} savedINI={saved} /> 
            </div>: ''}
        </span>
        );
    }

    createRows(settings: JSX.Element[], rowCount: 4 | 3 = 4): JSX.Element {
        let index = 0;
        let result = [];
        for (index = 0; index < settings.length; index += rowCount) {
            const rowValues = settings.slice(index, index+rowCount);
            result.push(
            <Row>
                <Col className={rowValues[0] ? `ini-setting-container`: ''} xs={12}>{rowValues[0]}</Col>
                <Col className={rowValues[1] ? `ini-setting-container`: ''} xs={12}>{rowValues[1]}</Col>
                <Col className={rowValues[2] ? `ini-setting-container`: ''} xs={12}>{rowValues[2]}</Col>
                {rowCount === 4 ? <Col className={rowValues[3] ? `ini-setting-container`: ''} xs={12}>{rowValues[3]}</Col>: ''}
            </Row>
            );
        }

        return (<span>{result}</span>);

    }


}

export default INITabContent;