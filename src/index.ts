import { fs, log, selectors, types } from 'vortex-api';
import * as path from 'path';
import INIEditor from './views/INIEditor';

async function main(context: types.IExtensionContext) {

  let supportedGameIds = ['skyrimse'] //fs.readdirAsync(path.join());

  context.registerAction('mod-icons', 100, 'changelog', {}, 'Game Settings', 
    () => context.api.events.emit('show-main-page', 'Game Settings'),
    () => {
      const gameId = selectors.activeGameId(context.api.store.getState());
      return supportedGameIds.includes(gameId);
    });

  context.registerMainPage('', 'Game Settings', INIEditor, { group: 'hidden' });
  return true;
}

export default main;
