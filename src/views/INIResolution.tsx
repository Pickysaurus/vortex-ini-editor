import * as React from 'react';
import { INIEntry, INISettings } from '../types/INIDetails';
import { ComponentEx, tooltip } from "vortex-api";
import Creatable from 'react-select';

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

    handleChange = (newValue: any, actionMeta: any) => {
        if (!newValue) return;
        const { workingINI, nameW, nameH } = this.props;
        workingINI.updateSetting('Display', nameW, newValue.w);
        this.nextState.w.value.current = newValue.w;
        workingINI.updateSetting('Display', nameH, newValue.h);
        this.nextState.h.value.current = newValue.h;
        this.nextState.current = newValue.value;

    }

    handleCreate = (inputValue: any) => {
        const { options } = this.state;
        const newOption = this.validateNewOption(inputValue);
        if (!newOption) return console.warn('Invalid resolution input', inputValue);
        this.nextState.options = [newOption, ...options];
        this.nextState.current = newOption.value;
        this.nextState.w.value.current = newOption.w;
        this.nextState.h.value.current = newOption.h;
    }

    validateNewOption = (opt: any) => {
        try {
            const sizes = opt.value.split('x');
            if (sizes.legth !== 2) return;
            const w = parseInt(sizes[0].trim());
            const h = parseInt(sizes[1].trim());
            if (w == NaN || h === NaN) return;
            const label = `${w} x ${h}`;
            return { label, value: label, w, h };
        }
        catch(err) {
            return;
        }
    }

    render(): JSX.Element {
        const { current, options } = this.state;

        return (
            <span key='resolution' title='Changes the resolution. You can manually type a custom resolution.'>
                <p><b>Resolution</b></p>
                <Creatable 
                    options={options}
                    value={current}
                    onChange={this.handleChange}
                    onCreateOption={this.handleCreate}
                    promptTextCreator={this.createPrompt}
                />
            </span>
        );

    }

    private createPrompt = (label: string): string => {
        return `Add Resolution: ${label}`;
    }
}

export default INIResolution;