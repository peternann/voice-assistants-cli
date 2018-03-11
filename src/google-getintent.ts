
import * as dialogflow from 'dialogflow';
import * as fs from 'fs';
import { listintents } from './google-listintents';
import { getGuid } from './google-intent-utils';

const DBG = require('debug')('va-cli');
const SAY = console.log;
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }



export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for getintents");
    if (!options.intentspec) throw new Error("intentSpec needed for getintent");

    let intentGuid = await getGuid(options.projectId, options.intentspec);

    // The 'await' keyword essentially returns the data items from the Promise's resolve():
    output(await getintent(intentGuid, options));


    /** Output result as required, given return data from underlying API call: */
    function output(data) {
        let intentFilePath = `${options.directory}/${data.displayName}.json`;
        fs.writeFileSync(intentFilePath, JSON.stringify(data, null, 2));
        SAY(`Wrote intent file: ${intentFilePath}`);
    }
}


/** Call underlying API to achieve command, returning the API's Promise: */
export async function getintent(intentGuid: string, options: any) {

    try {
        let client = new dialogflow.v2beta1.IntentsClient({ /* optional auth parameters. */ });

        let formattedName = client.intentPath(options.projectId, intentGuid);

        // intenView is required to get Training sentences in data:
        let responses = await client.getIntent({ name: formattedName, intentView: 'INTENT_VIEW_FULL' });
        return responses[0];
    } catch (err) {
        BAIL(`ERROR: Dialogflow getIntent: ${err.message}`);
    }
}

