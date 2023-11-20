# Using Pulumi Service Provider

The Pulumi Service provider for Pulumi can be used to provision resources available in Pulumi Cloud. This provider must be configured with credentials to deploy and update resources in Pulumi Cloud.

(Written in JS)

## Current Features

- [Deployment Settings](./component_resources/deployment_settings.js) 🚀
  - Sets up **all configurations** for deployment settings using the Github Integration feature
  - (Optional) Adds private ssh keys if you need to download private github packages

## To Use

1. Install Packages

    ```bash
    npm install
    ```

2. Configure Variables

    Replace `Pulumi.stack_name.yaml` with stack name ie `Pulumi.dev.yaml`. Add appropriate values

    ```yaml
      config:
        # stack name
        pulumi-service-js:stack:
        # project name
        pulumi-service-js:project:
          # organization name (
        pulumi-service-js:organization:
        # dependency skip
        pulumi-service-js:skipInstallDependencies: true
        # any preRunCommands. Example adding ssh keys
        pulumi-service-js:preRunCommands: mkdir /root/.ssh && printf -- "$SSHKEY" > /root/.ssh/id_ed25519, chmod 600 /root/.ssh/id_ed25519, ssh-keyscan github.com >> ~/.ssh/known_hosts, cd .. && git config --global --add url.\"git@github.com:\".insteadOf \"https://github.com\"
        ....
    ```

3. Run Pulumi

```bash
pulumi up
```

More to come 📺
