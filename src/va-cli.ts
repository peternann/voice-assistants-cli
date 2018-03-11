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
    .option("-b, --bare", "Screen output in bare format - plan, text-delimited")   // - TODO
    .version('0.1.0');

var requestedCommandSet: string[] = [];
function setCommand(cmd) { requestedCommandSet.push(cmd) }

commander
    .command("listintents")
    .description("list intents in the app")
    // Set command boolean on 'commander' property:
    .action(() => setCommand('listintents'));

commander
    .command("getagent")
    .description("get the whole agent/app, in platform format")
    .action(() => setCommand('getagent'));

commander
    .command("getintent <intent_spec>")
    .description("get an intent, either by name or GUID (See listintents)")
    .action((dir) => { commander.intentspec = dir; setCommand('getintent') });

commander
    .command("putintent <intent_spec>")
    .option('-f, --file', 'input file')
    .action((intent_spec, cmd) => { commander.putintent_cmd = cmd; commander.intentspec = intent_spec; setCommand('getintent') })
    .description("Put an intent model into the project.\n" +
        "        If intent_spec matches an existing intent in the project, it will be updated.\n" +
        "        Otherwise a new intent will (TODO!) be created.\n\n" +
        "Command options:\n" +
        "    -f <file>    Input/Output file (else looks for file matching intent_spec)\n");


commander
    .parse(process.argv);

/** Helper function to show usage and exit */
function USAGE(msg) {
    (msg) && ERROR(msg);
    commander.help();
    BAIL();
}

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

if (!commander.directory) {
    if (fs.existsSync(`va-cli-output/.`))
        commander.directory = 'va-cli-output';
    else
        commander.directory = '.';
    DBG("Output folder default to:", commander.directory);
} else {
    // Clobber trailing slash if supplied: (Common with shell completion)
    if (commander.directory.endsWith('/'))
        commander.directory = commander.directory.substring(0, commander.directory.length - 1);
    if (!fs.existsSync(`${commander.directory}/.`)) {
        BAIL(`ERROR: specified output folder ${commander.directory}/ does not exist.`);
    }
}
DBG(`Output folder prefix to use: '${commander.directory}'`);

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
