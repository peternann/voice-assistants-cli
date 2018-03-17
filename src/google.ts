
const DBG = require('debug')('va-cli');
const WARN = console.warn;
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }


/** Function to rationalise the CLI options, adjusting, checking and auto-filling as necessary: */
export function rationaliseOptions(options: any) {

    const fs = require('fs');

    options.dialogflowClientBaseOptions = {};

    if (options.identitySpec) {
        DBG("Checking supplied identitySpec:", options.identitySpec);
        if (fs.existsSync(options.identitySpec)) {
            // This is used by all API calls as the basis for the options object:
            options.dialogflowClientBaseOptions.keyFilename = options.identitySpec;
        } else BAIL(`ERROR: Specified Google identity credentials do not exist: ${options.identity}`);
    } else {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            DBG("Google credentials seemingly in place in env.GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
            // options.identity = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        } else {
            WARN(`WARNING: No apparent Google identity credentials in place. See '-i' option.`);
        }
    }

    //if (!options.identity) WARN(`WARNING: No apparent Google identity credentials in place. See '-i' option.`);

    if (!options.projectId) try {
        // Try to auto-guess it from a few sources:
        if (options.identitySpec && fs.existsSync(options.identitySpec)) {
            // The Project ID should be evident in this key file as JSON property 'project_id':
            options.projectId = JSON.parse(fs.readFileSync(options.identitySpec).toString()).project_id;
            if (options.projectId) WARN("WARNING: projectId obtained from -i specified identity file:", options.projectId);
        } else {
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
                options.projectId = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS).toString()).project_id;
                if (options.projectId) WARN("WARNING: projectId obtained from env.GOOGLE_APPLICATION_CREDENTIALS file contents:", options.projectId);
            }
            // Could also pull it from existing data in output folder, if existant...
        }
    } catch (err) {
        // Ignore
    }

}