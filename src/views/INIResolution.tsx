import * as React from 'react';
import { OverlayTrigger, Popover, Button, ButtonGroup } from 'react-bootstrap';
import { INIEntry, INISettings } from '../types/INIDetails';
import { ComponentEx, tooltip, Icon } from "vortex-api";
import { Creatable } from 'react-select';

interface IProps {
    nameW: string;
    nameH: string;
    workingINI: INISettings;
    savedINI: INISettings;
}

interface IComponentState {
    w: INIEntry;
    h: INIEntry;
    savedW: INIEntry;
    savedH: INIEntry;
    current: string;
    options: any;
}

class INIResolution extends ComponentEx<IProps, IComponentState> {
    constructor(props) {
        super(props);

        const w = props.workingINI.getSetting(props.nameW);
        const h = props.workingINI.getSetting(props.nameH);
        const current = `${w.value.current} x ${h.value.current}`;

        this.initState({
            w,
            h,
            current,
            savedW: props.savedINI.getSetting(props.nameW),
            savedH: props.savedINI.getSetting(props.nameH),
            options: [
                {w: w.value.current, h: h.value.current, label: current, value: current},
                ...w.choices.map((wd: {label: string, value: number}, i: number) => {
                    const ht = h.choices[i];
                    return {w: wd.value, h: ht.value, label: wd.label, value: ht.value };
            }).filter(v => v.label !== current)]
        });

    }

    handleChange = (newValue: {label: string, value: any, h: number, w: number}, actionMeta?: any) => {
        if (!newValue) return;
        const { workingINI, nameW, nameH } = this.props;
        workingINI.updateSetting(nameW, newValue.w);
        this.nextState.w.value.current = newValue.w;
        workingINI.updateSetting(nameH, newValue.h);
        this.nextState.h.value.current = newValue.h;
        this.nextState.current = newValue.label;

    }

    createOption = (arg: { label: string, labelKey: string, valueKey: string }): {label: string, value: string, w?: number, h?: number} => {
        const [w, h] = arg.label.split('x').map(n => parseInt(n.trim()));
        return {
            label: `${w} x ${h}`,
            value: arg.valueKey,
            w,
            h,
        }
    }

    render(): JSX.Element {
        const { current, options } = this.state;
        const currentOpt = options.find(o => o.label === current);

        return (
            <>
                <p><b>Resolution</b></p>
                <Creatable 
                    options={options}
                    value={currentOpt}
                    onChange={this.handleChange}
                    promptTextCreator={this.createPrompt}
                    clearable={false}
                    isValidNewOption={(arg: {label: string}) => arg.label && !!arg.label.match(/[0-9]{3,}( x |x)[0-9]{3,}/)}
                    newOptionCreator={this.createOption}
                />
                {this.renderIcons()}
            </>
        );

    }

    private createPrompt = (label: string): string => {
        return `Add: ${label}`;
    }

    renderIcons(): JSX.Element {
        const { savedH, savedW, w, h } = this.state;
        const { workingINI, nameW, nameH } = this.props;
        const valueChanged: boolean = (w.value.current !== savedW.value.current || h.value.current !== savedH.value.current);

        const InfoOverlay = (
        <Popover id={'resolution-info'} title='Info'>
            <p>Change the game resolution. You can manually try a custom resolution</p>
            <p><b>[Display]</b><br />
            {nameW}, {nameH}</p>
            <p><b>Value Type:</b> Custom</p>
        </Popover>
        );

        const resetValues = () => {
            workingINI.updateSetting(nameW, savedW.value.current);
            this.nextState.w.value.current = savedW.value.current;
            workingINI.updateSetting(nameH, savedH.value.current);
            this.nextState.h.value.current = savedH.value.current;
            this.nextState.current = `${savedW.value.current} x ${savedH.value.current}`;
        }

        return (
            <div className="ini-settings-icons">
            <ButtonGroup>
            <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={InfoOverlay}>
                <Button><Icon name="about" /></Button>
            </OverlayTrigger>
            <Button title={'Reset Value'} disabled={!valueChanged} onClick={() => resetValues()}><Icon name='refresh'/></Button>
            </ButtonGroup>
            <ButtonGroup style={{color: 'var(--brand-warning)'}}>
            {valueChanged ? <tooltip.Icon className='ini-settings-warning' tooltip={'Edit not saved!'} name='feedback-warning' />: ''}
            </ButtonGroup>
            </div>
        ); 
    }
}

export default INIResolution;