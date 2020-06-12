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
    // @name: name of the INI entry
    name: string;
    // @title: alternate name to display e.g. ISizeH could be Horizontal Resolution
    title?: string; 
    // @section: which part of the INI did this appear in e.g. [General]
    section: string;
    // @type: what type of value is it (how should we render it?)
    type?: 'boolean' | 'string' | 'float' | 'number' | 'choice' | 'free-choice' | 'range' | 'special';
    // @value: the current value.
    value?: string | boolean | number;
    // @value: the default value.
    defaultValue?: string | boolean | number;
    // @choices: If "choice" or "free-choice" are chosen as the type, list the choices here.
    choices?: string[] | number[];
    // @maxValue: for numerical/range entries specify a max value.
    maxValue?: number;
    // @maxValue: for numerical/range entries specify a min value.
    minValue?: number;
    // @description: human readable description of what this does. 
    description?: string;
    // @category: Is this a general setting or an advanced one? If this is unfilled it will be classed as "undocumented"
    category?: 'general' | 'advanced',
    // @images: to use in the description/help modal. Left/Right compare and/or a single main image.
    images?: {
        compareLeft?: string;
        compaireRight?: string;
        main?: string;
    }
    // @foundIn: Which INI is this found in?
    foundIn: string;
    // @allowCustom: This value works in the Custom.ini
    allowCustom?: boolean;
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
