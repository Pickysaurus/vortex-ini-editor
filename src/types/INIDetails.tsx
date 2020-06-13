export default interface INIDetails {
    name: string;
    sections: [{id: string, value: INIEntry[]}];
}

/* INIDetails Example
{
    name: 'Skyirm.ini'
    sections: [
        {'General': [
            {
                name: 'SIntroSequence',
                type: 'string',
                value: '',
                defaultValue: 'BGS_Logo.bik',
                description: 'The video to play on starting up the game. Must be the file name from the Data/Videos folder. Leave blank to skip the intro.',
                foundIn: ['SkyrimCustom.ini', 'Skyrim.ini'],
                category: 'general',
            }
        ]}
    ]
}
*/

export interface INIEntry {
    // @name: name of the INI entry (setting)
    name: string;
    // @title: alternate name to display e.g. ISizeH could be Horizontal Resolution
    title?: string; 
    // @section: which part of the INI did this appear in e.g. [General]
    section: string;
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
    // @description: human readable description of what this does. 
    description?: string;
    // @category: Is this a general setting or an advanced one? If this is unfilled it will be classed as "undocumented"
    // Perhaps we could expand this to tell which tab in the GUI this setting is in (e.g., Visuals)
    category?: 'general' | 'advanced',
    // @images: to use in the description/help modal. Left/Right compare and/or a single main image.
    images?: {
        compareLeft?: string;
        compaireRight?: string;
        main?: string;
    }
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
