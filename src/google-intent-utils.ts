
import { listintents } from './google-listintents';

const DBG = require('debug')('va-cli');
const ERROR = console.error;


export async function getGuid(projectId: string, intentSpec: string) {

    let intentGuid;
    let matches = intentSpec.match(/(.*\/)?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/);
    if (matches) {
        DBG("getintent: intentspec is/contains GUID - use GUID");
        intentGuid = matches[2];
    } else {
        DBG("getintent: intentspec does not contain GUID - Assume Display Name:", intentSpec);
        let responses = await listintents({ projectId: projectId });
        let intents: any[] = responses[0];
        let foundIntent = intents.find((intent) => { return intent.displayName === intentSpec });
        if (!foundIntent) throw new Error(`Cannot find intent named: ${intentSpec}\n(Try listintents command)`);
        // GUID is in .name field - go figure: Actualy GUID is the basename:
        intentGuid = foundIntent.name.replace(/.*\//, '');
        DBG("getintent: Display name cross-referenced to GUID:", intentGuid);
    }
    return intentGuid;
}