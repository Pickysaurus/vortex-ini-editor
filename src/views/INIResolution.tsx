import * as React from 'react';
import { INIEntry, INISettings } from '../types/INIDetails';
import { ComponentEx, tooltip } from "vortex-api";
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
            savedH: props.savedINI.getSetting(props.nameW),
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
        workingINI.updateSetting('Display', nameW, newValue.w);
        this.nextState.w.value.current = newValue.w;
        workingINI.updateSetting('Display', nameH, newValue.h);
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
            <span key='resolution' title='Changes the resolution. You can manually type a custom resolution.'>
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
            </span>
        );

    }

    private createPrompt = (label: string): string => {
        return `Add: ${label}`;
    }
}

export default INIResolution;