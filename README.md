# voice-assistants-cli
A tool for managing Voice Assistant models. More CLI, less GUI.

`va-cli` facilitates 'get/put' of your online voice assistant project 'language/interction model source', onto/from your local filesystem.

This achieves 2 aims:
1. Version control of your interaction model, right alongside your source,
2. Minimizes your time spent in the web GUI.

In other words, the aim is to support a typical CLI-based development process, with a unified commandset for multiple voice assistants.

With the correct authentication in place in your environment/shell:

```sh
# 'get' the voice app config onto local filesystem:
$ va-cli -g getapp

# 'put' the config back from your local filesystem, into your online project:
$ va-cli -g putapp

# '-g' option means to use a Google(Dialogflow) project
```
## Installation
```sh
# Make 'va-cli' available globally, in your shell of choice:
$ npm install -g voice-assistants-cli
```

## Setup
It is strongly recommended to setup your shell environment to be pre-authorised against the relevant Google/Amazon projects.

### Google (Dialogflow)
Refer to this walkthrough: https://dialogflow.com/docs/reference/v2-auth-setup, and try this command to check you have access to your online project: `va-cli -g getappinfo`

### Alexa
    TBD


## Usage
To pull down from a Google (Dialogflow) project, into ./models/google/:
```sh
$ va-cli -g -d models/google getapp
# Creates files like "./models/google/INTENT-*.json" and ..."/ENTITY-*.json"
```
To update just a single entity online, from the current folder:
```sh
$ va-cli -g putentity ENTITY-Animals.json
# Or shortcut meaning the same thing:
$ va-cli -g putentity Animals
```

Show some debug of what's going on:
```sh
$ DEBUG=va-cli va-cli -g getapp
```

## Source code
This tool is written in TypeScript (see src folder), with common use of async/wait. This is compiled into Javascript targetting ES3, output to the bin folder. Beware reading the generated .js files - Your eyes may bleed from all the helper code supporting async/wait.

The Google(Dialogflow) support is a wrapper around the [dialogflow](https://www.npmjs.com/package/dialogflow) npm package.