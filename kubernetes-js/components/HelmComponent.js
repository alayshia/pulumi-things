const pulumi = require("@pulumi/pulumi");
const k8s = require("@pulumi/kubernetes");

class HelmComponent extends pulumi.ComponentResource {
    constructor(name, chartOpts, provider, isMinikube, opts = {}) {
        super("my:components:HelmComponent", name, {}, opts);

        // Determine the service type based on the environment
        // const serviceType = isMinikube ? "ClusterIP" : "LoadBalancer";

        // Create a Helm Chart resource with the specific service type
        this.chart = new k8s.helm.v3.Chart(name, {
            chart: chartOpts.chart,
            version: chartOpts.version,
            namespace: chartOpts.namespace,
            fetchOpts: chartOpts.fetchOpts,
            // values: {
            //     ...chartOpts.values,
            //     service: {
            //         type: serviceType,
            //         port: chartOpts.servicePort,
            //         targetPort: chartOpts.serviceTargetPort,
            //         protocol: chartOpts.serviceProtocol
            //     }
            // },
            transformations: chartOpts.transformations,
        }, { parent: this, provider: provider });

    }
}

module.exports = { HelmComponent };