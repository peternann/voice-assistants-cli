
import * as fs from 'fs';
import * as dialogflow from 'dialogflow';
import { getIntentGuid } from './google-listintents';

const DBG = require('debug')('va-cli');
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }


export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for putintent");
    if (!options.spec) throw new Error("Spec needed for putintent");

    // options.spec here should point to an Intent JSON file.
    // This file will contain the name and resource GUID:
    let intentFilePath: string = null;
    for (let filePath of [options.spec, `${options.dir}/${options.spec}`, `${options.dir}/INTENT-${options.spec}`, `${options.dir}/${options.spec}.json`, `${options.dir}/INTENT-${options.spec}.json`]) {
        if (fs.existsSync(filePath)) {
            intentFilePath = filePath;
            break;
        }
    }
    if (!intentFilePath) throw new Error(`Cannot find Intent file based on '${options.spec}'`);

    const intent = JSON.parse(fs.readFileSync(intentFilePath).toString());

    // TODO: Changing 'displayName' in the intent simply changes the displayed name in WEB GUI:
    // Changing the GUI causes the update to fail:

    // The 'await' keyword essentially returns the data items from the Promise's resolve():
    output(await putIntent(intent, options));


    /** Output result as required, given return data from underlying API call: */
    function output(data) {

        //const Table = require('cli-table');

        //console.log(JSON.stringify(data, null, 3));

    }
}


/** Call underlying API to achieve command, returning the API's Promise: */
export async function putIntent(intent: any, options: any) {

    try {
        const client = new dialogflow.v2beta1.IntentsClient({ /* optional auth parameters. */ });

        //var formattedName = client.intentPath(options.projectId, intentGuid);

        const request = {
            // The GUID (and displayName) that we 'put' to are embedded in the intent object:
            //parent: client.projectAgentPath(options.projectId),
            intent: intent,
            languageCode: 'en'
        };

        return await client.updateIntent(request);

        // TODO: For create variant, we must:
        // A) set request.parent as above, 
        // B) Clobber intent.name (Where the GUID is)
        //return await client.createIntent(request);


    } catch (err) {
        BAIL(`ERROR: Dialogflow putIntent: ${err.message}`);
    }
}
