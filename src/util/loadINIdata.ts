import { fs, util } from 'vortex-api';
import * as Promise from 'bluebird';
import * as path from 'path';
import INIParser, { WinapiFormat, IniFile } from 'vortex-parse-ini';
import { INISettings } from '../types/INIDetails';

const parser = new INIParser(new WinapiFormat);



function loadINIData(loadMsg: (message: string) => void, gameId: string) : Promise<INISettings> {

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
                let currentValue = data[section][name];
                const type = getTypeFromName(name);
                if (type === 'boolean' || type === 'number') currentValue = parseInt(currentValue);
                else if (type === 'float') currentValue = parseFloat(currentValue).toFixed(8);
                iniSettings.updateSetting(section, name, currentValue);
              }))
            }));
          });
        });
      }).then(() => iniSettings);

    })
    .catch((err) => loadMsg(`Error!\n ${err.code} - ${err.message}`)); 
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

export default loadINIData;