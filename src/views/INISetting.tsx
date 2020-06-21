import * as React from 'react';
import { Row, Col, OverlayTrigger, Popover, Button, ButtonGroup } from 'react-bootstrap';
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

        this.set = this.set.bind(this);
    }

    render() {
        const { setting } = this.state;
        const displayName = setting.title || getFriendlyName(setting.name) || setting.name;
        // span key={setting.name}

        return (
            <>
                <p><b title={setting.description || 'No description.'}>{displayName}</b>{/*setting.value.current != savedSetting.value.current ? <tooltip.Icon name="feedback-warning" tooltip='Data not saved!' /> : ''*/}</p>
                {this.renderInput()}
                {this.renderIcons()}
            </>
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
            case 'string': return <input className='form-control' value={value} onChange={(event) => this.set(event.target.value)}/>
            case 'boolean': return <Toggle checked={value == 1} onToggle={(checked) => this.set(checked)} />
            case 'number': return <input className='form-control' value={value ? parseInt(value) : undefined} onChange={(event) => this.set(event.target.value)}/>
            case 'float': return <input  className='form-control' value={value ? parseFloat(value).toFixed(8): undefined} onChange={(event) => this.set(event.target.value)}/>
            case 'choice': return <Select options={setting.choices} value={setting.choices.find(c => c.value === value)} onChange={(event) => this.set(event)} clearable={false}  /> 
            case 'free-choice': return <select><option>{value}</option></select>
            case 'range': return (
            <span className='ini-settings-range'>
                <input type='range' value={value || 0} min={setting.value.min} max={setting.value.max} step={setting.rangeStepSize} onChange={(event) => this.set(event.target.value)} />
                <input className='form-control' value={value}/>
            </span>);
            default: return <input className='form-control' value={value} readOnly/>
        }
    }

    set(newVal: any) {
        const { workingINI } = this.props;
        const { type, setting } = this.state;
        const current: any = util.getSafe(setting, ['value', 'current'], undefined);

        let newValue: number | string;

        if (type === 'boolean') newValue = newVal === true ? 1 : 0;
        else if (type === 'number') newValue = parseInt(newVal);
        else if (type === 'float') newValue = parseFloat(newVal).toFixed(8);
        else if (type === 'choice' || type === 'free-choice') {
            if (!newVal) newVal = setting.choices.find(c => c.value === setting.value.default).value;
            // Work out if this is a float, number or string.
            newValue = !isNaN(parseFloat(current)) && current.toString().includes('.') ? parseFloat(newVal.value).toFixed(8) : Number.isInteger(current) ? parseInt(newVal.value) : newVal.value;
        }
        else if (type === 'range') newValue = !isNaN(parseFloat(current)) && current.toString().includes('.') ? parseFloat(newVal).toFixed(8) : Number.isInteger(current) ? parseInt(newVal) : newVal;
        else newValue = newVal;

        if (current === newValue) return;

        //do validation and apply new value.

        workingINI.updateSetting(setting.name, newValue, setting.section);
        if (newValue !== null) this.nextState.setting.value.current = newValue;
        else delete this.nextState.setting.value.current;

    }

    renderIcons(): JSX.Element {
        const { savedSetting, setting } = this.state;
        const valueChanged: boolean = setting.value.current != savedSetting.value.current;

        const resetValue = util.getSafe(savedSetting, ['value', 'current'], null);
        const recommended = util.getSafe(savedSetting, ['value', 'recommended'], null);

        const InfoOverlay = (
        <Popover id={`${setting.name}-info`} title='Info'>
            <p>{setting.description || 'This setting has not been documented.'}</p>
            <p><b>[{setting.section}]</b><br />
            {setting.name}</p>
            <p><b>Value Type:</b> {setting.type}</p>
        </Popover>
        );

        return (
            <div className="ini-settings-icons">
            <ButtonGroup>
            <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={InfoOverlay}>
                <Button><Icon name="about" /></Button>
            </OverlayTrigger>
            <Button title={'Reset Value'} disabled={!valueChanged} onClick={() => this.set(resetValue)}><Icon name='refresh'/></Button>
            {recommended !== null ? 
            <Button title={'Use Recommended'} disabled={setting.value.current == recommended} onClick={() => this.set(recommended)}><Icon name='smart'/></Button> 
            : ''}
            </ButtonGroup>
            <ButtonGroup style={{color: 'var(--brand-warning)'}}>
            {valueChanged ? <tooltip.Icon className='ini-settings-warning' tooltip={'Edit not saved!'} name='feedback-warning' />: ''}
            </ButtonGroup>
            </div>
        ); 
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