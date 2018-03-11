
const DBG = require('debug')('va-cli');
const WARN = console.warn;
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }


/** Function to rationalise the CLI options, adjusting, checking and auto-filling as necessary: */
export function rationaliseOptions(options: any) {

    const fs = require('fs');

    if (options.identity) {
        if (!fs.existsSync(options.identity))
            BAIL(`ERROR: Specified Google identity credentials do not exist: ${options.identity}`);
    } else {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS)
            options.identity = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }

    if (!options.identity) WARN(`WARNING: No apparent Google identity credentials in place. See '-i' option.`);

    if (!options.projectId) {
        // Try to auto-guess it from a few sources:

        try {
            // The Project ID should be evident in this key file as JSON property 'project_id':
            options.projectId = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS).toString()).project_id;
            DBG("projectId obtained from identity file:", options.projectId);
        } catch (err) {
            // Ignore
        }

        // Could also pull it from existing data in output folder, if existant...

    }
}