const pulumi = require("@pulumi/pulumi");
const awsx = require("@pulumi/awsx");
const k8s = require("@pulumi/kubernetes");

class AwsProvider extends pulumi.ComponentResource {
    constructor(name, opts = {}) {
        super("alayshia:components:AwsProvider", name, {}, opts);

        // Create a new VPC for your cluster or use an existing one
        const vpc = new awsx.ec2.Vpc(`${name}-vpc`, {
            numberOfAvailabilityZones: 2
        });

        // Create an EKS cluster
        const cluster = new awsx.eks.Cluster(`${name}-cluster`, {
            vpcId: vpc.id,
            subnetIds: vpc.publicSubnetIds,
            instanceType: "t2.medium", // specify the desired instance type
            desiredCapacity: 2,        // desired number of instances in the node group
            minSize: 1,                // minimum number of instances in the node group
            maxSize: 3,                // maximum number of instances in the node group
        }, { parent: this });

        // Create a Kubernetes provider pointing to the created EKS cluster
        this.provider = new k8s.Provider(`${name}-k8s-provider`, {
            kubeconfig: cluster.kubeconfig,
        }, { parent: this });
    }
}

module.exports = { AwsProvider };
