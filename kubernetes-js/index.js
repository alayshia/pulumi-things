const pulumi = require("@pulumi/pulumi");
const { HelmComponent } = require("./components/HelmComponent");
const { AwsProvider } = require("./components/AwsProvider");
const { GcpProvider } = require("./components/GcpProvider");
const { MinikubeProvider } = require("./components/MinikubeProvider");

// Configuration setup
const config = new pulumi.Config();
const cloudProvider = config.require("cloudProvider"); // "aws", "gcp", or "minikube"
const chartName = config.require("chartName");
const chartVersion = config.require("chartVersion");
const chartRepo = config.require("chartRepo");
const servicePort = config.require("servicePort");
const serviceTargetPort = config.require("serviceTargetPort");
const serviceProtocol = config.require("serviceProtocol");

// Initialize variables for Kubernetes provider and Minikube flag
let k8sProvider, isMinikube;

// Select the appropriate Kubernetes provider based on the configuration
switch (cloudProvider) {
    case "aws":
        k8sProvider = new AwsProvider("awsProvider").provider;
        isMinikube = false;
        break;
    case "gcp":
        k8sProvider = new GcpProvider("gcpProvider").provider;
        isMinikube = false;
        break;
    case "minikube":
        k8sProvider = new MinikubeProvider("minikubeProvider").provider;
        isMinikube = true;
        break;
    default:
        throw new Error("Unsupported cloud provider specified");
}

// Define Helm chart options
const nginxChartOpts = {
    chart: chartName,
    version: chartVersion,
    namespace: "default",
    fetchOpts: {
        repo: chartRepo
    },
    servicePort: servicePort,
    serviceTargetPort: serviceTargetPort,
    serviceProtocol: serviceProtocol
};

// Deploy the Helm chart using the HelmComponent
const nginx = new HelmComponent("nginx-helm", nginxChartOpts, k8sProvider, isMinikube);

// Export the service status and LoadBalancer IP
exports.serviceStatus = nginx.serviceStatus;
exports.loadBalancerIP = nginx.loadBalancerIP;