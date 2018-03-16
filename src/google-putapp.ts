
import * as dialogflow from 'dialogflow';
import * as fs from 'fs';
//import { getAppInfo } from './google-getappinfo';
//import { getIntents } from './google-listintents';
//import { getEntities } from './google-listentities';
import { putIntent } from './google-putintent';
import { putEntity } from './google-putentity';
//import { getIntent, writeIntent } from './google-getintent';
//import { getEntity, writeEntity } from './google-getentity';

const DBG = require('debug')('va-cli');
const SAY = console.log;
const WARN = console.warn;
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }



export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for getintent");

    const dirItems = fs.readdirSync(options.dir);
    let filesDone = 0;
    let proms = [];
    for (let dirItem of dirItems) {
        let dirPath = `${options.dir}/${dirItem}`;
        DBG("Considering file in options.dir:", dirPath);
        let m;
        if (null !== (m = dirItem.match(/^INTENT-(.*)\.json/))) {
            const intent = JSON.parse(fs.readFileSync(dirPath).toString());
            if (intent.displayName !== m[1]) WARN("WARNING:displayName mismatch inside file:", dirPath);
            // Async:
            proms.push(putIntent(intent, options));
            ++filesDone;
        } else if (null !== (m = dirItem.match(/^ENTITY-(.*)\.json/))) {
            const entity = JSON.parse(fs.readFileSync(dirPath).toString());
            if (entity.displayName !== m[1]) WARN("WARNING:displayName mismatch inside file:", dirPath);
            // Async:
            proms.push(putEntity(entity, options));
            ++filesDone;
        } else {
            WARN("putapp: Ignoring unrecognised file for upload:", dirItem);
        }
    }

    // Wait for all tasks to complete:
    Promise.all(proms);

    if (filesDone === 0)
        WARN(`No files identified in '${options.dir}' as INTENT/ENTITY files!`);
    else
        process.on("exit", () => SAY(`${filesDone} files identified to put into app.`));
}



