
import * as dialogflow from 'dialogflow';
import * as fs from 'fs';
import { getEntityGuid } from './google-listentities';

const DBG = require('debug')('va-cli');
const SAY = console.log;
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }



export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for getintent");
    if (!options.spec) throw new Error("Spec needed for getintent");

    const intentGuid = await getEntityGuid(options.projectId, options.spec);

    // The 'await' keyword essentially returns the data items from the Promise's resolve():
    output(await getEntity(intentGuid, options));


    /** Output result as required, given return data from underlying API call: */
    function output(data) {
        const filePath = `${options.directory}/ENTITY-${data.displayName}.json`;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        SAY(`Wrote entity file: ${filePath}`);
    }
}


/** Call underlying API to achieve command, returning the API's Promise: */
export async function getEntity(guid: string, options: any) {

    try {
        const client = new dialogflow.v2beta1.EntityTypesClient({ /* optional auth parameters. */ });

        const formattedName = client.entityTypePath(options.projectId, guid);

        const responses = await client.getEntityType({ name: formattedName });
        return responses[0];
    } catch (err) {
        BAIL(`ERROR: Dialogflow getEntity: ${err.message}`);
    }
}

