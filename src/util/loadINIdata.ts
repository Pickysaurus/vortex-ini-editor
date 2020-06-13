import { app as appIn, remote } from 'electron';
import { fs, util } from 'vortex-api';
import * as Promise from 'bluebird';
import * as path from 'path';
import INIParser, { WinapiFormat, IniFile } from 'vortex-parse-ini';
import INIDetails, { INIEntry } from '../types/INIDetails';

const app = appIn || remote.app;
const parser = new INIParser(new WinapiFormat);

const gameSupport = {
    skyrimse: {
      id: "skyrimse",
      name: "Skyrim Special Edition",
      iniFiles: [
        path.join('{mygames}', 'Skyrim Special Edition', 'Skyrim.ini'),
        path.join('{mygames}', 'Skyrim Special Edition', 'SkyrimPrefs.ini'),
        path.join('{mygames}', 'Skyrim Special Edition', 'SkyrimCustom.ini'),
      ],
      iniFormat: 'winapi',
      presetPaths: [
        path.join("{gamefolder}", "low.ini"),
        path.join("{gamefolder}", "medium.ini"),
        path.join("{gamefolder}", "high.ini"),
        path.join("{gamefolder}", "ultra.ini")
      ]
    },
    fallout4: {
      id: "fallout4",
      name: "Fallout 4",
      iniFiles: [
        path.join('{mygames}', 'Fallout4', 'Fallout4.ini'),
        path.join('{mygames}', 'Fallout4', 'Fallout4Prefs.ini'),
        path.join('{mygames}', 'Fallout4', 'Fallout4Custom.ini'),
      ],
      iniFormat: 'winapi',
      presetPaths: [
        path.join("{gamefolder}", "low.ini"),
        path.join("{gamefolder}", "medium.ini"),
        path.join("{gamefolder}", "high.ini"),
        path.join("{gamefolder}", "ultra.ini")
      ]
    }
  };

function loadINIData(loadMsg: (message: string) => void, gameId: string, activeProfile?: string, discovery?: any) : Promise<any> {
    const supportData = gameSupport[gameId];
    const INIBasePaths = supportData.iniFiles.map(file => file.replace('{mygames}', path.join(app.getPath('documents'), 'My Games')));
    const PresetPaths = supportData.presetPaths.map(p => p.replace('{gamefolder}', discovery.path));

    let results = {};
    let presets = {};

    // return fs.readFileAsync(path.join(__dirname, 'data', gameId, 'settings.json'))
    // .then((data) => JSON.parse(data));

    return Promise.all(PresetPaths.map((p: string) => {
      return fs.statAsync(p).catch(() => undefined)
      .then(() => {
        loadMsg(`Reading ${path.basename(p)}...`);
        return parser.read(p).catch(() => undefined)
        .then((pre) => presets[path.basename(p, '.ini')] = pre.data);
      })
    }))
    .then(() => {
      return Promise.all(INIBasePaths.map((ini: string) => {
          // Check the INI actually exists.
          return fs.statAsync(ini)
          .then(() => {
              // Parse the INI file
              loadMsg(`Reading ${path.basename(ini)}...`);
              return parser.read(ini)
              .then((iniData : IniFile<any>) => results[path.basename(ini)] = {path: ini, settings: iniData.data})
              .catch(() => undefined);
          })
          .catch(() => undefined);
      }))
      .then((iniFiles : Object[]) => {
        loadMsg('Building indexes...');
        return buildINIData(iniFiles.filter(i => !!i), supportData, presets);  //results; //groupBysection(iniFiles.filter(i => !!i));
      });
    })
}


function buildINIData(iniFiles: Object, gameInfo, presets): Promise<INIDetails> {
  let result = {
    gameId: gameInfo.id,
    gameName: gameInfo.name,
    iniValues: []
  };

  return Promise.each(iniFiles, (iniData) => {
    // If the file name has "prefs" in it, we're reading the prefs file.
    const isPrefs = iniData.path.toLowerCase().includes('prefs');
    // Pull the settings
    const data = iniData.settings;
    // map through all settings. 
    const allSettings = Object.keys(data).map((section : string) => {
      // open the section of the INI.
      const settings = data[section];
      const mappedSettings = Object.keys(settings).map(name => { 
        if (result.iniValues.find(s => s.name === name && s.section === section)) return;
        let settingData : INIEntry = { name, section };
        // Add the default (make sure you're using the default INIs first)
        let values : any = { default: data[section][name] };
        // If this value must be placed in prefs, record that.
        if (isPrefs) settingData.allowPrefs = true; 
        // If the value is defined in the vanilla presets, all those. 
        if (util.getSafe(presets, ['low', section, name], undefined)) values.low = util.getSafe(presets, ['low', section, name], undefined);
        if (util.getSafe(presets, ['medium', section, name], undefined)) values.medium = util.getSafe(presets, ['medium', section, name], undefined);
        if (util.getSafe(presets, ['high', section, name], undefined)) values.high = util.getSafe(presets, ['high', section, name], undefined);
        if (util.getSafe(presets, ['low', section, name], undefined)) values.ultra = util.getSafe(presets, ['ultra', section, name], undefined);
        // If the default value is blank, we don't need to print this. 
        if (data[section][name] === '') settingData.hideIfBlank = true;
        // If we can guess the type from the name, add that. 
        if (getTypeFromName(name)) settingData.type = getTypeFromName(name);
        // Apply the default and preset values to the object. 
        settingData.value = values;
        return settingData;
      }).filter(s => !!s);
      result.iniValues = result.iniValues.concat(mappedSettings).sort((a,b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name));
      return mappedSettings;
    })
  }).then(() => {
    return fs.writeFileAsync(path.join(__dirname, 'data', gameInfo.id, 'settings2.json'), JSON.stringify(result, null, 2)).then(() => result)
  });


}

function getTypeFromName(name: string) {
  switch (name.substr(0,1).toLowerCase()) {
    case 'b': return 'boolean';
    case 'i': return 'number';
    case 'u': return 'number';
    case 'f': return 'float';
    case 's': return 'string';
    case 'r': return 'string';
    default: {
      console.log('Unknown prefix for value', name);
      return undefined;
    };
  }
}

function groupBysection(iniFiles: Object[]): Promise<Object> {
    const result = {};
    return Promise.each(iniFiles, (file) => {
        const categories = Object.keys(file);
        return categories.map((section) => result[section] = file[section]);
    }).then(() => result);
}

export default loadINIData;