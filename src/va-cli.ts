#!/usr/bin/env ts-node

process.env.GOOGLE_APPLICATION_CREDENTIALS = "/home/peter/.gcloud/ForgetMeNot-9573bc77b4c7-GCP-ServiceAccount-Key.json";

import * as fs from 'fs';
import * as commander from 'commander';

const DBG = require('debug')('va-cli');
const ERROR = console.error;
function BAIL(msg?: string) { (msg) && ERROR(msg); process.exit(1) }


commander
    .name('va-cli')
    .description("Voice Assistant CLI tool. All CLI, No web.")
    .usage("<-g|-a> [options] <command> [command-options]")
    .option("-g, --google", "Google Assistant platform mode")
    .option("-a, --alexa", "Amazon Alexa ASK platform mode")
    .option("-i, --identity <file|string>", "supply identity credentials for the platform")
    .option("-p, --project <projectId>", "Specify project ID (Optional if safely derivable)")
    .option("-d, --directory <dir>", "Use directory (folder) for input/output files")
    .option("-b, --bare", "TODO: Screen output in bare format - plan, text-delimited")   // - TODO
    .version('0.1.0');

var requestedCommandSet: string[] = [];
/** Set command boolean on 'commander' property: */
function setCommand(cmd) { requestedCommandSet.push(cmd) }

commander
    .command("listapps").description("list apps accessible with your identity credentials")
    .action(() => setCommand('listapps'));

commander
    .command("listintents").description("list intents in the app")
    .action(() => setCommand('listintents'));
commander
    .command("getintent <spec>").description("get an intent, either by name or GUID (See listintents)")
    .action((spec) => { commander.spec = spec; setCommand('getintent') });

commander
    .command("listentities").description("list entities in the app")
    .action(() => setCommand('listentities'));
commander
    .command("getentity <spec>").description("Get an entity, either by name or GUID (See listentities)")
    .action((spec) => { commander.spec = spec; setCommand('getentity') });
commander
    .command("putentity <spec>").description("Create/Update an entity, either by name or GUID (See listentities)")
    .action((spec) => { commander.spec = spec; setCommand('putentity') });

commander
    .command("getappinfo").description("Get info on the agent specified")
    .action(() => setCommand('getappinfo'));

commander
    .command("getappv1").description("get the whole Google/Dialogflow V1 agent as an exported ZIP")
    .action(() => setCommand('getappv1'));

commander
    .command("getapp").description("get the whole Google/Dialogflow V2 agent as individual files.")
    .action(() => setCommand('getapp'));
commander
    .command("putapp").description("The opposite of getapp.")
    .action(() => setCommand('putapp'));


commander
    .command("putintent <spec>")
    .action((spec) => { commander.spec = spec; setCommand('putintent') })
    .description("Put an intent model into the project.\n" +
        "        If spec matches an existing intent in the project, it will be updated.\n" +
        "        Otherwise a new intent will (TODO!) be created.\n\n" +
        "Command options:\n" +
        "    -f <file>    Input/Output file (else looks for file matching spec)\n");


commander
    .parse(process.argv);

/** Helper function to show usage and exit */
function USAGE(msg) {
    (msg) && ERROR(msg);
    commander.help();
    BAIL();
}

// commander seems broken: commander.args DOES NOT seem to end up with excess args:
//if (commander.args.length > 0) USAGE(`UNKNOWN command line request: ${commander.args[0]}`);

// ###################################################
// #### Sanity check CLI parameters
// ###################################################
if (!commander.google && !commander.alexa) USAGE("Must supply either -g or -a!!!");
if (commander.google && commander.alexa) USAGE("Please supply JUST ONE of -g or -a!!!");

var PLATFORM: string;
if (commander.google) {
    commander.PLATFORM = 'google';
}
if (commander.alexa) {
    commander.PLATFORM = 'alexa';
}
DBG("Platform mode is:", commander.PLATFORM);
// We have some rationalisation code for the options per platform
// in google.ts and alexa.ts:
const platform = require(`./${commander.PLATFORM}`);
platform.rationaliseOptions(commander);

if (!commander.dir) {
    if (fs.existsSync('va-cli-dir/.'))
        commander.dir = 'va-cli-dir';
    else
        commander.dir = '.';
    DBG("Output folder defaulted to:", commander.dir);
} else {
    // Clobber trailing slash if supplied: (Common with shell completion)
    if (commander.dir.endsWith('/'))
        commander.dir = commander.dir.substring(0, commander.dir.length - 1);
    if (!fs.existsSync(`${commander.dir}/.`)) {
        BAIL(`ERROR: specified output folder ${commander.dir}/ does not exist.`);
    }
}
DBG(`Output folder prefix to use: '${commander.dir}'`);

// Check the user actually requested some command:
if (requestedCommandSet.length <= 0) USAGE("No command given!");


//
// Hacky eval loop to require and call our command methods:
// npm 'commander' package has similar functionality, but I couldn't get it to play nice
// wrapped in a Typescript file...
//
for (let cmd of requestedCommandSet) {
    DBG(`require()ing and calling ./${cmd} : ${cmd}() ...`);

    // Note that the methods in these files RUN ASYNC, so this loop will complete quickly:
    // This ends up eval'ing like:   commandModule = require('./alexa-getapp')
    let commandModule;
    eval(
        `commandModule = require('./${commander.PLATFORM}-${cmd}');`
    );
    // 'async' doCommand() method returns a promise:
    commandModule.doCommand(commander)
        .then()
        .catch((err) => ERROR("Error: " + err.message));
}
// Note that we get here before the processing above actually completes.


// The process doesn't actually exit until the async tasks (via commander[cmd]) complete:
process.on('exit', function () {
    DBG('CLI processing completes.');
});
