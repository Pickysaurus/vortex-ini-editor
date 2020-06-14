import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import { INIEntry, INISettings } from '../types/INIDetails';
import { ComponentEx, tooltip } from "vortex-api";
import Select from 'react-select';

interface IProps {
    name: string;
    workingINI: INISettings;
    savedINI: INISettings;
    get?: (name: string) => void;
    set?: (section: string, name: string, value: string | boolean | number) => void;
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
        const { savedSetting, setting, type } = this.state;
        const displayName = setting.title || getFriendlyName(setting.name) || setting.name;

        return (
            <span key={setting.name} title={setting.description || 'No description.'}>
                <p><b>{displayName}</b>{setting.value.current != savedSetting.value.current ? <tooltip.Icon name="feedback-warning" tooltip='Data not saved!' /> : ''}</p>
                {this.renderInput()}
            </span>
        )
    }

    renderInput() {
        const { setting, type } = this.state;
        const value : string | number = (type === 'boolean') ? setting.value.current ? 1 : 0 : `${setting.value.current}`;
        switch(type) {
            case 'string': return <input className='form-control' value={value} onChange={this.set.bind(this)}/>
            case 'boolean': return <input type='checkbox' checked={value == 1} onChange={this.set.bind(this)}/>
            case 'number': return <input value={value} readOnly/>
            case 'float': return <input value={value} readOnly/>
            case 'choice': return <Select options={setting.choices} value={setting.choices.find(c => c.value === setting.value.current)} onChange={this.set.bind(this)} isClearable={false}  /> 
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
        const current: any = setting.value.current;

        if (type === 'boolean') newValue = event.target.checked ? 1 : 0;
        else if (type === 'choice') {
            if (!event || !!event.value) event = setting.choices.find(c => c.value === setting.value.default);
            newValue = !isNaN(parseFloat(current)) ? parseFloat(event.value) : Number.isInteger(current) ? parseInt(event.value) : event.value
        }
        else if (type === 'range') newValue = !isNaN(parseFloat(current)) ? parseFloat(event.target.value) : Number.isInteger(current) ? parseInt(event.target.value) : event.target.value;
        else newValue = event.target.value;

        if (current === newValue) return;

        //do validation and apply new value.

        workingINI.updateSetting(setting.section, setting.name, newValue);
        this.nextState.setting.value.current = newValue;

    }
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