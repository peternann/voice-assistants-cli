
//
// Find example source and info at:
// https://github.com/dialogflow/dialogflow-nodejs-client-v2/blob/master/src/v2beta1/agents_client.js
//

const DBG = require('debug')('va-cli:listapps');
const SAY = console.log;
const ERROR = console.error;


export async function doCommand(options: any) {

    // The 'await' keyword essentially returns the data items from the Promises resolve():
    return output(await listapps(options));

    /** Output result as required, given return data from underlying API call: */
    function output(apps) {
        const Table = require('cli-table');
        var table = new Table({
            head: ['Name', 'ID', 'Default Lang', 'Timezone']
        });
        for (let i = 0; i < apps.length; i += 1) {
            table.push(
                [apps[i].displayName, apps[i].parent, apps[i].defaultLanguageCode, apps[i].timeZone]
            );

        }
        SAY("Apps:");
        SAY(table.toString());
    }
}

/** Call underlying API to achieve command, returning the API's Promise: */
export async function listapps(options: any): Promise<any> {

    const dialogflow = require('dialogflow');

    const client = new dialogflow.v2beta1.AgentsClient(options.dialogflowClientBaseOptions);

    // A project specified as '-' is a wildcard:
    const formattedParent = client.projectPath('-');

    const responses = await client.searchAgents({ parent: formattedParent });
    return responses[0];
}


    // // Or obtain the paged response.
    // var formattedParent = client.projectAgentPath(projectId);
    // var options = { autoPaginate: false };
    // var callback = responses => {
    //     // The actual resources in a response.
    //     var resources = responses[0];
    //     // The next request if the response shows that there are more responses.
    //     var nextRequest = responses[1];
    //     // The actual response object, if necessary.
    //     // var rawResponse = responses[2];
    //     for (let i = 0; i < resources.length; i += 1) {
    //         // doThingsWith(resources[i]);
    //     }
    //     if (nextRequest) {
    //         // Fetch the next page.
    //         return client.listIntents(nextRequest, options).then(callback);
    //     }
    // }
    // client.listIntents({ parent: formattedParent }, options)
    //     .then(callback)
    //     .catch(err => {
    //         console.error(err);
    //     });



