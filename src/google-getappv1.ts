
import * as fs from 'fs';

const DBG = require('debug')('va-cli');
const SAY = console.log;
const ERROR = console.error;


export async function doCommand(options: any) {

    if (!options.projectId) throw new Error("projectId needed for getapp.");


    // The 'await' keyword essentially returns the data items from the Promise's resolve():
    output(await getapp(options));


    /** Output result as required, given return data from underlying API call: */
    function output(data) {

        //const fs = require('fs');
        //const Table = require('cli-table');

        //console.log("Response value:");
        //console.dir(data[0].latestResponse.response.value);


        let zipBuffer: Buffer = data[0].latestResponse.response.value;
        // A ZIP file should start with "PK".
        // The Buffer seems to arrive with 3 extraneous bytes at the start for some reason...Skip up to 16 bytes for this case:
        let PK_Index = zipBuffer.indexOf("PK");
        if (PK_Index > 0 && PK_Index < 16)
            zipBuffer = zipBuffer.slice(PK_Index);

        let zipFilePath = `${options.directory}/${options.projectId}.zip`;
        fs.writeFileSync(zipFilePath, zipBuffer, 'binary');
        SAY("Agent ZIP file created:", zipFilePath);

        var AdmZip = require('adm-zip');
        var zipper = new AdmZip(zipBuffer);
        zipper.extractAllTo(options.directory,/*overwrite=*/true);

        //console.log(JSON.stringify(data, null, 3));
        // console.log("ZIP Buffer:");
        // console.dir(zipBuffer);

    }
}


/** Call underlying API to achieve command, returning the API's Promise: */
export function getapp(options: any): Promise<any> {

    const dialogflow = require('dialogflow');

    // var client = new dialogflow.v2beta1.AgentsClient({ /* optional auth parameters. */ });

    // var formattedName = client.intentPath(projectId, intentGuid);

    // // intenView is required to get Training sentences in data:
    // return client.getIntent({ name: formattedName, intentView: 'INTENT_VIEW_FULL' });



    var client = new dialogflow.v2beta1.AgentsClient({
        // optional auth parameters.
    });

    var formattedParent = client.projectPath(options.projectId);

    // Handle the operation using the promise pattern.
    return client.exportAgent({ parent: formattedParent })

    // .then(responses => {
    //     var operation = responses[0];
    //     var initialApiResponse = responses[1];

    //     // Operation#promise starts polling for the completion of the LRO.
    //     return operation.promise();
    // })
    // .then(responses => {
    //     // The final result of the operation.
    //     var result = responses[0];

    //     // The metadata value of the completed operation.
    //     var metadata = responses[1];

    //     // The response of the api call returning the complete operation.
    //     var finalApiResponse = responses[2];
    // })
    // .catch(err => {
    //     console.error(err);
    // });






}
