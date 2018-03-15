
import * as fs from 'fs';
import * as dialogflow from 'dialogflow';
import { getEntityGuid } from './google-listentities';
import { getEntities } from './google-listentities';

const DBG = require('debug')('va-cli');
const SAY = console.log;
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }


export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for putentity");
    if (!options.spec) throw new Error("Spec needed for putentity");

    // options.spec here should point to an Intent JSON file.
    // This file will contain the name and resource GUID:
    let inputFilePath: string = null;
    for (let filePath of [options.spec, `${options.dir}/${options.spec}`, `${options.dir}/ENTITY-${options.spec}`, `${options.dir}/${options.spec}.json`, `${options.dir}/ENTITY-${options.spec}.json`]) {
        if (fs.existsSync(filePath)) {
            DBG("File DOES exist:", filePath);
            inputFilePath = filePath;
            break;
        }
        DBG("File does not exist:", filePath);
    }
    if (!inputFilePath) throw new Error(`Cannot find Input file based on '${options.spec}'`);

    const resource = JSON.parse(fs.readFileSync(inputFilePath).toString());

    output(await putEntity(resource, options));


    /** Output result as required, given return data from underlying API call: */
    function output(data) {
        DBG("putEntity result:", JSON.stringify(data, null, 3));

        // 'data' is actually the new resource as updated/created.
        // Update the file if it differs:
        const resourceJson = JSON.stringify(data, null, 2);
        if (JSON.stringify(data, null, 2).trim() !== resourceJson) {
            fs.writeFileSync(inputFilePath, resourceJson);
            SAY("Wrote updated:", inputFilePath);
        }

    }
}


/** Call underlying API to achieve command, returning the API's Promise: */
export async function putEntity(resource: any, options: any) {

    try {
        const client = new dialogflow.v2beta1.EntityTypesClient({ /* optional auth parameters. */ });

        const entities = await getEntities(options);
        const existingEntity = entities.find(ent => { return ent.name === resource.name && ent.displayName === resource.displayName });
        let response;
        if (existingEntity) {
            DBG("UPDATING entity:", resource.name, '=', resource.displayName);
            const request = {
                entityType: resource,
            };
            response = await client.updateEntityType(request);
        } else {
            DBG("CREATING entity:", resource.name);
            // If doing a create, we must leave name (guid) field blank:
            delete resource.name;
            const request = {
                parent: client.projectAgentPath(options.projectId),
                entityType: resource,
            };
            response = await client.createEntityType(request);
        }
        return response[0];
    } catch (err) {
        BAIL(`ERROR: Dialogflow putentity: ${err.message}`);
    }
}
