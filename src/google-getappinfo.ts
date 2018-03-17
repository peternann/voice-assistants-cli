
import * as fs from 'fs';
const Table = require('cli-table');

const DBG = require('debug')('va-cli');
const SAY = console.log;
const ERROR = console.error;


export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for getappinfo.");


    // The 'await' keyword essentially returns the data items from the Promise's resolve():
    output(await getAppInfo(options));


    /** Output result as required, given return data from underlying API call: */
    function output(data) {

        DBG("Got data:");
        DBG(data);

        const outFileName = `${options.dir}/APPINFO-${data.displayName}.json`;
        fs.writeFileSync(outFileName, JSON.stringify(data, null, 2));
        SAY("Wrote:", outFileName);

        const table = new Table();

        // Make sure these 2 are at top:
        table.push({ displayName: data.displayName });
        table.push({ parent: data.parent });

        let o = {};
        for (let prop in data) {
            let value = String(data[prop]);
            if (prop !== 'displayName' && prop !== 'parent') {
                o = {};
                o[prop] = value;
                table.push(o);
            }
        }


        SAY("App info:");
        SAY(table.toString());

    }
}


/** Call underlying API to achieve command, returning the API's Promise: */
export async function getAppInfo(options: any): Promise<any> {

    const dialogflow = require('dialogflow');

    const client = new dialogflow.v2beta1.AgentsClient(options.dialogflowClientBaseOptions);

    const formattedParent = client.projectPath(options.projectId);

    // Handle the operation using the promise pattern.
    const responses = await client.getAgent({ parent: formattedParent });

    return responses[0];
}
