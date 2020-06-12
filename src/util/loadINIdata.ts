import { app as appIn, remote } from 'electron';
import { fs } from 'vortex-api';
import * as Promise from 'bluebird';
import * as path from 'path';
import INIParser, { WinapiFormat, IniFile } from 'vortex-parse-ini';

const app = appIn || remote.app;
const parser = new INIParser(new WinapiFormat);

const gameSupport = {
    skyrimse: {
      iniFiles: [
        path.join('{mygames}', 'Skyrim Special Edition', 'Skyrim.ini'),
        path.join('{mygames}', 'Skyrim Special Edition', 'SkyrimPrefs.ini'),
        path.join('{mygames}', 'Skyrim Special Edition', 'SkyrimCustom.ini'),
      ],
      iniFormat: 'winapi',
    },
    fallout4: {
      iniFiles: [
        path.join('{mygames}', 'Fallout4', 'Fallout4.ini'),
        path.join('{mygames}', 'Fallout4', 'Fallout4Prefs.ini'),
        path.join('{mygames}', 'Fallout4', 'Fallout4Custom.ini'),
      ],
      iniFormat: 'winapi',
    }
  };

function loadINIData(loadMsg: (message: string) => void, gameId: string, activeProfile?: string) : Promise<any> {
    const supportData = gameSupport[gameId];
    const INIBasePaths = supportData.iniFiles.map(file => file.replace('{mygames}', path.join(app.getPath('documents'), 'My Games')));

    let results = {};

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
      return results; //groupByCategory(iniFiles.filter(i => !!i));
    });
}


function groupByCategory(iniFiles: Object[]): Promise<Object> {
    const result = {};
    return Promise.each(iniFiles, (file) => {
        const categories = Object.keys(file);
        return categories.map((category) => result[category] = file[category]);
    }).then(() => result);
}

export default loadINIData;