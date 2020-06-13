import { remote } from 'electron';
import * as path from 'path';
import * as Promise from 'bluebird';
import { IniFile } from 'vortex-parse-ini';

export default interface INIDetails {
    gameId: string;
    gameName: string;
    iniPaths: [string[]];
    presetPaths?: [string[]];
    iniValues: INIEntry[];
}

export class INISettings implements INIDetails {
    gameId: string;
    gameName: string;
    iniPaths: [string[]];
    presetPaths?: [string[]];
    iniValues: INIEntry[];
    constructor(data : INIDetails) {
        this.gameId = data.gameId;
        this.gameName = data.gameName;
        this.iniPaths = data.iniPaths;
        this.presetPaths = data.presetPaths;
        this.iniValues = data.iniValues;        
    }

    // resolve the paths to the INI files
    getIniPaths(): string[] {
        return parsePaths(this.iniPaths);
    }

    // resolve the paths to the presets
    getPresetPaths(gamePath: string): string[] {
        if (!this.presetPaths) return [];
        return parsePaths(this.presetPaths, { gamefolder: gamePath });
    }

    // prepare the settings for printing.
    buildINIObjects(preferCustom?: boolean, settings?: INIEntry[]): Promise<{key: {ini: IniFile<any>}}> {
        if (!settings) settings = this.iniValues;
        let output: {key? : {ini?: IniFile<any>}} = {};
        // Get the names of our INIs and push them into the output object
        const iniNames = this.iniPaths.map((i: string[]) => {output[i.slice(-1).pop()] = {}; return i.slice(-1).pop()});
        // See if we have a custom INI
        const base = iniNames.find(i => !i.toLowerCase().includes('custom') && !i.toLowerCase().includes('prefs'));
        const custom = iniNames.find(i => i.toLowerCase().includes('custom'));
        const prefs = iniNames.find(i => i.toLowerCase().includes('prefs'))
        // If we don't have a custom INI but preferCustom is true, set it to false. 
        if (preferCustom && !custom) preferCustom = false;
        return Promise.all(settings.map((s: INIEntry) => {
            // Exit if it's not a value we need to print.
            if ((!s.value || s.value === '') && s.hideIfBlank) return;
            // Work out which INI to place it in.
            const destination = s.allowPrefs && prefs ? prefs : preferCustom ? custom : base;
            // Apply the value, creating the category if it's not already there.
            if (!output[destination][s.section]) output[destination][s.section] = {};
            return output[destination][s.section][s.name] = s.value || '';
        })).then(() => {
            Object.keys(output).map(f => output[f] = new IniFile(output[f]));
            return output;
        });
        
    }

}

function parsePaths(input: [string[]], options?: {gamefolder?: string}): string[] {
    const joined = input.map((p: string[]) => path.join.apply(null, p));

    return joined.map((p : string) => {
        p = p.replace('{mygames}', path.join(remote.app.getPath('documents'), 'My Games'));
        if (options && options.gamefolder) p = p.replace('{gamefolder}', options.gamefolder); 
        return p;
    });
}

export interface INIEntry {
    // @name: name of the INI entry (setting)
    name: string;
    // @title: alternate name to display e.g. ISizeH could be Horizontal Resolution
    title?: string; 
    // @section: which part of the INI did this appear in e.g. [General]
    section: string;
    // @description: human readable description of what this does. 
    description?: string;
    // @images: to use in the description/help modal. Left/Right compare and/or a single main image.
    images?: {
        compareLeft?: string;
        compaireRight?: string;
        main?: string;
    }
    // @type: what type of value is it (how should we render it?)
    type?: 'boolean' | 'string' | 'float' | 'number' | 'choice' | 'free-choice' | 'range' | 'special';
    value?: {
        // @current: the current value.
        current?: string | boolean | number;
        // @default: the default value used when the value is not assigned by the INI file
        default?: string | boolean | number;
        // @fixedDefault: the fixed default value (some default values are bugged and should never be used)
        fixedDefault?: string | boolean | number;
        // @max: the max value
        max?: number;
        // @min: the min value
        min?: number;
        // @low: the low preset value
        low?: string | boolean | number;
        // @medium: the medium preset value
        medium?: string | boolean | number;
        // @high: the high preset value
        high?: string | boolean | number;
        // @ultra: the ultra preset value
        ultra?: string | boolean | number;
        // @recommended: a recommended value
        recommended?: string | boolean | number;
    }
    // @choices: If "choice" or "free-choice" are chosen as the type, list the choices here.
    choices?: string[] | number[];
    // @rangeStepSize: If the type is 'range' this indicates which increments the slider moves in.
    rangeStepSize?: number;
    // @displayTab: Which tab should we load this into for Vortex's UI? If this is unfilled it will be classed as an "undocumented" value under "Advanced"
    displayTab?: string;
    // @category: For general the setting will be visible, for advanced it will appear under "advanced" in the displayTab, if not set, it will appear under "undocumented" in the displayTab. 
    category?: 'general' | 'advanced';
    // @allowPrefs: This setting works in the prefs INI
    allowPrefs?: boolean;
    // @hideIfBlank: Should this value not be printed to the resulting INI file if it's blank?
    hideIfBlank?: boolean;
}

/* INIEntry Example */
const entryExample = {
    'name': 'SIntroSequence',
    'section' : 'General',
    'type': 'string',
    'defaultValue': 'BGS_Logo.bik',
    'description': 'The video to play on starting up the game. Must be the file name from the Data/Videos folder. Leave blank to skip the intro.',
    'foundIn': 'Skyrim.ini',
    'allowCustom': true,
    'category': 'general'
}
