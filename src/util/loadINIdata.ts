import { fs, util } from 'vortex-api';
import * as Promise from 'bluebird';
import * as path from 'path';
import INIParser, { WinapiFormat, IniFile } from 'vortex-parse-ini';
import { INISettings } from '../types/INIDetails';

const parser = new INIParser(new WinapiFormat);



function loadINIData(loadMsg: (message: string) => void, gameId: string, activeProfile?: string, discovery?: any) : Promise<any> {

    let results = {};
    let presets = {};

    loadMsg('Getting game data...');

    return fs.readFileAsync(path.join(__dirname, 'data', gameId, 'settings.json'))
    .then((data) => {
      let iniSettings: INISettings = new INISettings(JSON.parse(data));
      const iniPaths = iniSettings.getIniPaths();
      return Promise.each(iniPaths, (ini) => {
        return fs.statAsync(ini).catch(() => undefined)
        .then(() => {
          loadMsg(`Reading ${path.basename(ini)}...`);
          return parser.read(ini).catch((err) => console.error(err))
          .then((iniParsed: IniFile<any>) => {
            const data = iniParsed.data;
            return Promise.all(Object.keys(data).map((section: string) => {
              const settings = Object.keys(data[section]);
              return Promise.all(settings.map((name: string) => {
                const currentValue = data[section][name];
                iniSettings.updateSetting(section, name, currentValue);
              }))
            }));
          });
        });
      }).then(() => iniSettings);

    })
    .catch((err) => loadMsg(`Error!\n ${err.code} - ${err.message}`)); 
}

function groupBysection(iniFiles: Object[]): Promise<Object> {
    const result = {};
    return Promise.each(iniFiles, (file) => {
        const categories = Object.keys(file);
        return categories.map((section) => result[section] = file[section]);
    }).then(() => result);
}

export default loadINIData;