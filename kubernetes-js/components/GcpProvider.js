const pulumi = require("@pulumi/pulumi");
const gcp = require("@pulumi/gcp");
const k8s = require("@pulumi/kubernetes");

class GcpProvider extends pulumi.ComponentResource {
    constructor(name, opts = {}) {
        super("alayshia:components:GcpProvider", name, {}, opts);

        // Create a GKE cluster
        const cluster = new gcp.container.Cluster(`${name}-cluster`, {
            // Define your cluster configuration here
            initialNodeCount: 1,
            minMasterVersion: "latest",
            nodeVersion: "latest",
            nodeConfig: {
                machineType: "e2-medium",
            },
        }, { parent: this });

        // Create a Kubernetes provider pointing to the created GKE cluster
        this.provider = new k8s.Provider(`${name}-k8s`, {
            kubeconfig: pulumi.all([cluster.name, cluster.endpoint, cluster.masterAuth]).apply(([name, endpoint, auth]) => {
                const context = `${gcp.config.project}_${gcp.config.zone}_${name}`;
                return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${auth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    client-certificate-data: ${auth.clientCertificate}
    client-key-data: ${auth.clientKey}
    token: ${auth.token}`;
            }),
        }, { parent: this });
    }

}
module.exports = { GcpProvider };