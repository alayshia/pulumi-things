const pulumi = require("@pulumi/pulumi");
const k8s = require("@pulumi/kubernetes");

// Creates a Minikube Provider that 
class MinikubeProvider extends pulumi.ComponentResource {
    constructor(name, opts = {}) {
        super("alayshia:components:MinikubeProvider", name, {}, opts);

        this.provider = new k8s.Provider(name,
            {
                context: "minikube",
            }, { parent: this });
    }
}

module.exports = { MinikubeProvider };