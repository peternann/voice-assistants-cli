
import * as fs from 'fs';
import * as dialogflow from 'dialogflow';
//import { listintents } from './google-listintents';
import { getGuid } from './google-intent-utils';

const DBG = require('debug')('va-cli');
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }


export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for putintent");
    if (!options.intentspec) throw new Error("intentSpec needed for putintent");

    let intentGuid = await getGuid(options.projectId, options.intentspec);

    // The 'await' keyword essentially returns the data items from the Promise's resolve():
    output(await putintent(intentGuid, options));


    /** Output result as required, given return data from underlying API call: */
    function output(data) {

        //const Table = require('cli-table');

        console.log(JSON.stringify(data, null, 3));

    }
}


/** Call underlying API to achieve command, returning the API's Promise: */
export async function putintent(intentGuid: string, options: any) {

    try {
        var client = new dialogflow.v2beta1.IntentsClient({ /* optional auth parameters. */ });

        //var formattedName = client.intentPath(options.projectId, intentGuid);

        var intent = JSON.parse(fs.readFileSync("StartStopwatch2.json").toString());

        var request = {
            // The GUID (and displayName) that we 'put' to are embedded in the intent object:
            intent: intent,
            languageCode: 'en'
        };
        return await client.putintent(request);
    } catch (err) {
        BAIL(`ERROR: Dialogflow getIntent: ${err.message}`);
    }
}
