const pulumi = require("@pulumi/pulumi");
const pulumiservice = require("@pulumi/pulumiservice");

/*
Creates a deployment settings instance, registering the settings passed
*/

class MyDeploymentSettings extends pulumi.ComponentResource {
    constructor(name, args, opts) {
        super("my:components:MyDeploymentSettings", name, args, opts);

        this.settings = new pulumiservice.DeploymentSettings(name, args, { parent: this });

        this.registerOutputs({
            deploymentSettingsId: this.settings.id
        });
    }
}

module.exports = MyDeploymentSettings;