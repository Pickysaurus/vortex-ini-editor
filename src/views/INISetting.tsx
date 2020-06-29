import * as React from 'react';
import { OverlayTrigger, Popover, Button, ButtonGroup } from 'react-bootstrap';
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
    value: any;
    error?: string;
    inputTimer?: any;
}

class INISetting extends ComponentEx<IProps, IComponentState> {
    constructor(props){
        super(props);

        const setting = props.workingINI.getSetting(props.name);

        this.initState({
            setting,
            savedSetting: props.savedINI.getSetting(props.name),
            type: setting.type,
            value: util.getSafe(setting, ['value', 'current'], undefined),
        });

        this.set = this.set.bind(this);
        this.inputChange = this.inputChange.bind(this);
        this.validate = this.validate.bind(this);
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
            const newSetting = this.props.workingINI.getSetting(nextProps.name);
            this.nextState.setting = newSetting;
            this.nextState.savedSetting = this.props.savedINI.getSetting(nextProps.name);
            this.nextState.type = newSetting.type;
            this.nextState.value = util.getSafe(newSetting, ['value', 'current'], undefined);
        }
    }

    renderInput(): JSX.Element {
        const { setting, type, value } = this.state;

        let iniValue: any = setting.value.current || '';
        const min: number = util.getSafe(setting, ['value', 'min'], undefined);
        const max : number = util.getSafe(setting, ['value', 'max'], undefined);
        const step : number = util.getSafe(setting, ['value', 'rangeStepSize'], undefined);

        switch(type) {
            case 'string': return <input className='form-control' value={value} onChange={this.inputChange}/>
            case 'boolean': return <Toggle checked={value == 1} onToggle={(checked) => this.validate(checked)} />
            case 'number': return <input className='form-control' value={value} onChange={this.inputChange}/>
            case 'float': return <input  className='form-control' value={value} onChange={this.inputChange}/>
            case 'choice': return <Select options={setting.choices} value={setting.choices.find(c => c.value === iniValue)} onChange={(event) => this.set(event)} clearable={false}  /> 
            case 'free-choice': return <select><option>{iniValue}</option></select>
            case 'range': return (
            <span className='ini-settings-range'>
                <input type='range' value={value || 0} min={min} max={max} step={step} onChange={this.validate} />
                <input className='form-control' value={value || 0} onChange={this.validate}/>
            </span>);
            default: return <input className='form-control' value={iniValue} readOnly/>
        }
    }

    inputChange(event: any) {
        // Allow the user to type in input without immediately rejecting it. 
        if (this.state.inputTimer) clearTimeout(this.state.inputTimer);
        const newVal = util.getSafe(event.target, ['value'], undefined);
        this.nextState.inputTimer = setTimeout(() => this.validate(newVal), 500);
        this.nextState.value = newVal;
    }

    validate(newValue: any) {
        const { type, setting } = this.state;
        const min: number = util.getSafe(setting, ['value', 'min'], undefined);
        const max : number = util.getSafe(setting, ['value', 'max'], undefined);
        // Set the value to update the UI.
        this.nextState.value = newValue;
        
        // If the input is blank, a string or a set choice we don't need to validate.
        if (!newValue || type === "choice" || type === "string" || type === "special") return this.set(newValue);

        if (type === 'boolean') return (newValue === true) ? this.set(1) : this.set(0);

        // Compare numerical values.
        if (type === 'number' || type === 'float' || type === 'range') {
            let numberValue = undefined;
            if (type === 'float') {
                numberValue = parseFloat(newValue).toFixed(8);
                if (isNaN(parseFloat(numberValue))) return this.nextState.error = 'Invalid float value.';
            }
            if (type === 'number') {
                numberValue = parseInt(newValue);
                if (!Number.isInteger(numberValue)) return this.nextState.error = 'Invalid number value.';
            }
            if (type === 'range') {
                // It's impossible for this to be an invalid number, but we don't know if it's a float or an int.
                const current = util.getSafe(setting, ['value', 'current'], undefined);
                numberValue = !isNaN(parseFloat(current)) && current.toString().includes('.') ? parseFloat(newValue).toFixed(8) : Number.isInteger(current) ? parseInt(newValue) : undefined;
                if (!numberValue) return this.nextState.error = 'Invalid range value.';
            }

            if (min && numberValue < min) return this.nextState.error = `Value must be greater than ${min}`;
            if (max && numberValue > max) return this.nextState.error = `Value must be less than ${max}`;
            this.nextState.value = numberValue;
            this.set(numberValue);
        }

        // ADD VALIDATION FOR FREE-CHOICE ONE IMPLEMENTED.
    }

    set(newVal: any) {
        const { workingINI } = this.props;
        const { type, setting, value } = this.state;
        const current: any = util.getSafe(setting, ['value', 'current'], undefined);

        let newValue: any;

        if (type === 'choice' || type === 'free-choice') {
            if (!newVal) newVal = setting.choices.find(c => c.value === setting.value.default).value;
            // Work out if this is a float, number or string.
            newValue = !isNaN(parseFloat(current)) && current.toString().includes('.') ? parseFloat(newVal.value).toFixed(8) : Number.isInteger(current) ? parseInt(newVal.value) : newVal.value;
        }
        else newValue = newVal;

        if (current === newValue) return;

        //do validation and apply new value.
        delete this.nextState.error;

        workingINI.updateSetting(setting.name, newValue, setting.section);
        if (newValue !== null) this.nextState.setting.value.current = newValue;
        else delete this.nextState.setting.value.current;
        if (value !== newValue) this.nextState.value = newValue;
    }

    renderIcons(): JSX.Element {
        const { savedSetting, setting, error, value } = this.state;
        const valueChanged: boolean = setting.value.current != savedSetting.value.current;

        const resetValue = util.getSafe(savedSetting, ['value', 'current'], null);
        const recommended = util.getSafe(savedSetting, ['value', 'recommended'], null);
        const defaultValue = util.getSafe(savedSetting, ['value', 'fixedDefault'], util.getSafe(savedSetting, ['value', 'default'], undefined));

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
            <Button title='Default' onClick={() => this.set(defaultValue)}><Icon name='remove' /></Button>
            {recommended !== null ? 
            <Button title={'Use Recommended'} disabled={setting.value.current == recommended} onClick={() => this.set(recommended)}><Icon name='smart'/></Button> 
            : ''}
            </ButtonGroup>
            <ButtonGroup style={{color: 'var(--brand-warning)'}}>
            {valueChanged ? <tooltip.Icon className='ini-settings-warning' tooltip={'Edit not saved!'} name='savegame' />: ''}
            {error ? <tooltip.Icon className='ini-settings-warning' tooltip={error} name='feedback-warning' />: ''}
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