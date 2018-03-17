
const DBG = require('debug')('va-cli');
const ERROR = console.error;


export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for listintents");

    // The 'await' keyword essentially returns the data items from the Promises resolve():
    return output(await getEntities(options));

    /** Output result as required, given return data from underlying API call: */
    function output(items) {

        const Table = require('cli-table');

        var table = new Table({
            head: ['Name', '#Items', 'GUID', 'Info']
        });

        for (let i = 0; i < items.length; i += 1) {
            // doThingsWith(resources[i])
            DBG(`ENTITY #${i}:`, JSON.stringify(items[i], null, 4));
            DBG(items[i].displayName);

            // The basename of .name is effectively a GUID:
            let guid = items[i].name.replace(/.+\//, '');
            let info = [];
            if (items[i].kind) info.push(`kind=${items[i].kind}`);
            table.push(
                [items[i].displayName, items[i].entities.length, guid, info.join(',')]
            );

        }

        console.log("Project:", options.projectId);
        console.log("Intents:");
        console.log(table.toString());

    }
}

/** Call underlying API to get list of intents: */
export async function getEntities(options: any) {

    const dialogflow = require('dialogflow');

    const client = new dialogflow.v2beta1.EntityTypesClient(options.dialogflowClientBaseOptions);

    const formattedParent = client.projectAgentPath(options.projectId);

    const responses = await client.listEntityTypes({ parent: formattedParent });
    // Data from API queries seems to be 'an array of responses':
    // Usually the first item is interesting:
    return responses[0];
}

/** Turn an IntentSpec of some type, into an Intent GUID, as required: */
export async function getEntityGuid(projectId: string, itemSpec: string) {

    let guid;
    // May already be supplied as a GUI, or full resource path with GUID at the end:
    const matches = itemSpec.match(/(.*\/)?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/);
    if (matches) {
        guid = matches[2];
        DBG("getEntityGuid():Intentspec is/contains GUID - using GUID:", guid);
    } else {
        DBG("getEntityGuid():Intentspec does not contain GUID - Assume Display Name:", itemSpec);
        const items = await getEntities({ projectId: projectId });
        const foundIntent = items.find((intent) => { return intent.displayName === itemSpec });
        if (!foundIntent) throw new Error(`Cannot find item named: ${itemSpec}\n(Try 'list' commands)`);
        // GUID is in .name field - go figure: Actualy GUID is the basename:
        guid = foundIntent.name.replace(/.*\//, '');
        DBG("getEntityGuid():Display name cross-referenced to GUID:", guid);
    }
    return guid;
}


