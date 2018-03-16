
import * as dialogflow from 'dialogflow';
import * as fs from 'fs';
import { getAppInfo } from './google-getappinfo';
import { getIntents } from './google-listintents';
import { getEntities } from './google-listentities';
import { getIntent, writeIntent } from './google-getintent';
import { getEntity, writeEntity } from './google-getentity';

const DBG = require('debug')('va-cli');
const SAY = console.log;
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }



export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for getintent");

    getAppInfo(options)
        .then(data => {
            const outFileName = `${options.dir}/APPINFO-${data.displayName}.json`;
            fs.writeFileSync(outFileName, JSON.stringify(data, null, 2));
            SAY("Wrote:", outFileName);
        })
        .catch();

    // Get the list of Intents in the app, then get them and save them...
    getIntents(options)
        .then(intents => {
            for (let intent of intents)
                getIntent(intent.name, options)
                    .then(intent => writeIntent(intent, options));
        })
        .catch();

    // As above:
    getEntities(options)
        .then(entities => {
            for (let entity of entities)
                getEntity(entity.name, options)
                    .then(entity => writeEntity(entity, options));
        })
        .catch();
}

// Old non-parallel core code for above:
// const intents = await getIntents(options);
// for (let i = 0; i < intents.length; i += 1) {
//     // Note that the .name field is the GUID:
//     writeIntent(await getIntent(intents[i].name, options), options);
// }
//
// const entities = await getEntities(options);
// for (let i = 0; i < entities.length; i += 1) {
//     // Note that the .name field is the GUID:
//     writeEntity(await getEntity(entities[i].name, options), options);
// }



