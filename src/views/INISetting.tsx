import * as React from 'react';
import { Row, Col, OverlayTrigger, Popover } from 'react-bootstrap';
import { INIEntry, INISettings } from '../types/INIDetails';
import { util, ComponentEx, tooltip, Toggle, Icon } from "vortex-api";
import Select from 'react-select';

interface IProps {
    name: string;
    workingINI: INISettings;
    savedINI: INISettings;
}

interface IComponentState {
    setting: INIEntry;
    savedSetting: INIEntry;
    type: string;

}

class INISetting extends ComponentEx<IProps, IComponentState> {
    constructor(props){
        super(props);

        this.initState({
            setting: props.workingINI.getSetting(props.name),
            savedSetting: props.savedINI.getSetting(props.name),
            type: props.workingINI.getSetting(props.name).type,
        });
    }

    render() {
        const { savedSetting, setting } = this.state;
        const displayName = setting.title || getFriendlyName(setting.name) || setting.name;

        return (
            <span key={setting.name}>
                <p><b title={setting.description || 'No description.'}>{displayName}</b>{/*setting.value.current != savedSetting.value.current ? <tooltip.Icon name="feedback-warning" tooltip='Data not saved!' /> : ''*/}</p>
                {this.renderInput()}
                {this.renderIcons()}
            </span>
        )
    }

    UNSAFE_componentWillUpdate(nextProps) {
        // This is a little cheat for the advanced tab where we re-render the same component with different values.
        if (nextProps.name !== this.props.name) {
            this.nextState.setting = this.props.workingINI.getSetting(nextProps.name);
            this.nextState.savedSetting = this.props.savedINI.getSetting(nextProps.name);
            this.nextState.type = this.props.workingINI.getSetting(nextProps.name).type;
        }
    }

    renderInput(): JSX.Element {
        const { setting, type } = this.state;

        let value : any = setting.value.current || '';

        switch(type) {
            case 'string': return <input className='form-control' value={value} onChange={this.set.bind(this)}/>
            case 'boolean': return <Toggle checked={value == 1} onToggle={this.set.bind(this)} />
            case 'number': return <input className='form-control' value={value ? parseInt(value) : undefined} onChange={this.set.bind(this)}/>
            case 'float': return <input  className='form-control' value={value ? parseFloat(value).toFixed(8): undefined} onChange={this.set.bind(this)}/>
            case 'choice': return <Select options={setting.choices} value={setting.choices.find(c => c.value === setting.value.current)} onChange={this.set.bind(this)} clearable={false}  /> 
            case 'free-choice': return <select><option>{value}</option></select>
            case 'range': return (
            <Row>
                <Col sm='auto'><input type='range' value={setting.value.current || 0} min={setting.value.min} max={setting.value.max} step={setting.rangeStepSize} onChange={this.set.bind(this)} /></Col>
                <Col sm={6}><input className='form-control' value={setting.value.current}/></Col>
            </Row>);
            default: return <input className='form-control' value={value} readOnly/>
        }
    }

    set(event) {
        const { workingINI } = this.props;
        const { type, setting } = this.state;

        let newValue: number | string;
        const current: any = util.getSafe(setting, ['value', 'current'], undefined);

        if (type === 'boolean') newValue = event ? 1 : 0;
        else if (type === 'choice') {
            if (!event || !!event.value) event = setting.choices.find(c => c.value === setting.value.default);
            newValue = !isNaN(parseFloat(current)) ? parseFloat(event.value).toFixed(8) : Number.isInteger(current) ? parseInt(event.value) : event.value
        }
        else if (type === 'range') newValue = !isNaN(parseFloat(current)) ? parseFloat(event.target.value).toFixed(8) : Number.isInteger(current) ? parseInt(event.target.value) : event.target.value;
        else newValue = event.target.value;

        if (current === newValue) return;

        //do validation and apply new value.

        workingINI.updateSetting(setting.section, setting.name, newValue);
        this.nextState.setting.value.current = newValue;

    }

    renderIcons(): JSX.Element {
        const { savedSetting, setting } = this.state;
        const valueChanged: boolean = setting.value.current != savedSetting.value.current;

        return (
            <>
            <OverlayTrigger
                trigger='click'
                rootClose
                placement='bottom'
                overlay={
                    <Popover>
                        {formatDescriptionTooltip(setting)}
                    </Popover>
                }
            >
            <Icon name="about" />
            </OverlayTrigger>
            <tooltip.Icon name="feedback-warning" tooltip={valueChanged ? 'Edit not saved!' : 'Saved'} />
            <tooltip.Icon name="refresh" tooltip={'Reset Value'} />
            </>
        ); 
    }
}

function formatDescriptionTooltip(setting: INIEntry): string {
    return `${setting.description || 'This setting has not been documented.'}\n\n[${setting.section}]\n${setting.name}\nValue Type: ${setting.type}`;
}

function getFriendlyName(setting: string): string {
    let i = 0;
    let workingString = '';
    while (i < setting.length && workingString === '') {
        const char = setting.charAt(i);
        if (char == char.toUpperCase()) {
            workingString = setting.substr(i, setting.length);
        }
        i++
    }

    return workingString || setting;
}

export default INISetting;