
const DBG = require('debug')('va-cli');
const ERROR = console.error;


export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for listintents");

    // The 'await' keyword essentially returns the data items from the Promises resolve():
    return output(await listintents(options));

    /** Output result as required, given return data from underlying API call: */
    function output(data) {

        const Table = require('cli-table');

        // Data from query seems to be:
        // an 'array of responses',
        // containing an array of intents:
        let intents = data[0];

        var table = new Table({
            head: ['Name', 'GUID', 'Info']
        });

        for (let i = 0; i < intents.length; i += 1) {
            // doThingsWith(resources[i])
            DBG(`INTENT #${i}:`, JSON.stringify(intents[i], null, 4));
            DBG(intents[i].displayName);

            // The basename of .name is effectively a GUID:
            let guid = intents[i].name.replace(/.+\//, '');
            let info: string = '';
            if (intents[i].action) info += `action=${intents[i].action}`;
            table.push(
                [intents[i].displayName, guid, info]
            );

        }

        console.log("Project:", options.projectId);
        console.log("Intents:");
        console.log(table.toString());

    }
}

/** Call underlying API to achieve command, returning the API's Promise: */
export function listintents(options: any): Promise<any> {

    const dialogflow = require('dialogflow');

    var client = new dialogflow.v2beta1.IntentsClient({ /* optional auth parameters. */ });

    var formattedParent = client.projectAgentPath(options.projectId);

    // Pass up Promise:
    return client.listIntents({ parent: formattedParent });
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



