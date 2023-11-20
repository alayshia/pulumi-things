const pulumi = require("@pulumi/pulumi");
const MyDeploymentSettings = require("./component_resources/deployment_settings");
const fs = require("fs");

// Initialize Pulumi configuration
const config = new pulumi.Config();

/* Retrieves and sets configuration values from config file
Stack
Project
Organization
Skip Installation Dependencies
Pre Run Commands
OID Options
*/
const stack = config.require("stack");
const project = config.require("project");
const organization = config.require("organization");
const skipInstallDependencies = config.requireBoolean("skipInstallDependencies");
const preRunCommands = config.require("preRunCommands").split(",");
const oidcGoogle = JSON.parse(config.get("oidcGoogle") || "{}");
const oidcAws = JSON.parse(config.get("oidcAws") || "{}");

// Sets any environment variables from the config and adds it to the environment variable variable
const additionalEnvVars = JSON.parse(config.get("environmentVariables") || "{}");

let environmentVariables = {
    ...additionalEnvVars // Includes additional environment variables
};


/* (Optional) For instances where git ssh is needed for private repos, 
but the Github App is needed for Pulumi preview, deploy, etc.
The path to the SSH key file is set in the config file.
It checks if the SSH key file path is provided and the file exists. If not, then errors.
The code then reads the SSH Key as as secret and sets it into an secret environment variable to be used in the pre-run command in a config file.
See README for example for pre-runcommand.
*/
const sshKeyFilePath = config.get("sshKeyFilePath");

if (sshKeyFilePath && fs.existsSync(sshKeyFilePath)) {
    try {
        const sshKey = fs.readFileSync(sshKeyFilePath, "utf-8");
        const sshKeySecret = new pulumi.secret(sshKey);
        console.log(sshKeySecret);
        environmentVariables['SSHKEY'] = sshKeySecret;
    }
    catch (error) {
        console.error("Error reading SSH Key File", error);
    }
}

/*
Sets up the Github Integration for the App. 
It assumes that you have already invited Pulumi to your organization.
It sets the branch, github repository, deploy commits, preview pull requests, 
pull request templates and paths (optional) from the config.
*/

const sourceContext = {
    git: {
        branch: config.require("gitBranch"),
    }
};

const paths = config.get("paths");
if (paths) {
    githubConfig.paths = paths.split(",");
};

const githubConfig = {
    repository: config.require("githubRepository"),
    deployCommits: config.requireBoolean("deployCommits"),
    previewPullRequests: config.requireBoolean("previewPullRequests"),
    pullRequestTemplate: config.requireBoolean("pullRequestTemplate"),
};

// Combine OIDCs settings for AWS and Google
const oidc = {};
if (Object.keys(oidcGoogle).length > 0) oidc.google = oidcGoogle;
if (Object.keys(oidcAws).length > 0) oidc.aws = oidcAws;

/* Adds  operational context 
Pre-Run Commands
Environment Variables
OIDC
*/
const operationContext = {
    options: {
        skipInstallDependencies: skipInstallDependencies
    },
    preRunCommands: preRunCommands,
    environmentVariables: environmentVariables,
    oidc: oidc
};

/*Create a new MyDeploymentSettings instance with all applicable configs
*/
const myDeploymentSettings = new MyDeploymentSettings("my-deployment-settings", {
    stack,
    project,
    organization,
    operationContext,
    sourceContext: sourceContext,
    github: githubConfig
});

exports.deploymentSettingsId = myDeploymentSettings.settings.id;

