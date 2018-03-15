
import * as dialogflow from 'dialogflow';
import * as fs from 'fs';
import { getIntentGuid } from './google-listintents';

const DBG = require('debug')('va-cli');
const SAY = console.log;
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }



export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for getintent");
    if (!options.spec) throw new Error("Spec needed for getintent");

    const intentGuid = await getIntentGuid(options.projectId, options.spec);

    // The 'await' keyword essentially returns the data items from the Promise's resolve():
    writeIntent(await getIntent(intentGuid, options), options);


}

/** Output result as required, given return data from underlying API call: */
export function writeIntent(data, options) {
    const filePath = `${options.dir}/INTENT-${data.displayName}.json`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    SAY(`Wrote intent file: ${filePath}`);
}

/** Call underlying API to achieve command, returning the API's Promise: */
export async function getIntent(resourceGuid: string, options: any) {

    try {
        const client = new dialogflow.v2beta1.IntentsClient({ /* optional auth parameters. */ });
        if (!resourceGuid.includes('/'))
            resourceGuid = client.intentPath(options.projectId, resourceGuid);
        DBG("getIntent(): resourceGuid (name):", resourceGuid);

        // intentView is required to get Training sentences in data:
        const responses = await client.getIntent({ name: resourceGuid, intentView: 'INTENT_VIEW_FULL' });
        return responses[0];
    } catch (err) {
        BAIL(`ERROR: Dialogflow getIntent: ${err.message}`);
    }
}

