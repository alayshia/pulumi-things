import pulumi
from pulumi_kubernetes.apps.v1 import Deployment
from pulumi_kubernetes.core.v1 import Service
from pulumi_kubernetes import Provider


# Load Pulumi config
config = pulumi.Config()

kubeconfig_path = config.require("kubeconfig_path")

# Initialize a provider for deploying to Minikube
minikube_provider = Provider("minikube", kubeconfig=kubeconfig_path)

# Define the labels for the deployment
app_labels = {"app": "hello-world"}

# Define the Kubernetes Deployment
deployment = Deployment("hello-world-deployment",
                        spec={
                            "selector": {"matchLabels": app_labels},
                            "replicas": 1,  # Number of replicas
                            "template": {
                                "metadata": {"labels": app_labels},
                                "spec": {
                                    "containers": [{
                                        "name": "hello-world-container",
                                        "image": "alayshia/hello-world-py:1.0",  # Replace with your image
                                        "ports": [{"containerPort": 80}]  # Port the container exposes
                                    }]
                                }
                            }
                        },
                        opts=pulumi.ResourceOptions(provider=minikube_provider))

# Define the Kubernetes Service to expose the deployment
service = Service("hello-world",
                  spec={
                      "selector": app_labels,
                      "type": "NodePort",  # Expose the service on a port on each Node
                      "ports": [{"protocol": "TCP", "port": 80, "targetPort": 80}]  # Map port 80 on the service to 8080 on the container
                  },
                  opts=pulumi.ResourceOptions(provider=minikube_provider))


# # Export the service name and endpoint
service_name = service.metadata["name"]
port = service.spec.apply(lambda s: s.ports[0].port)
http_url = pulumi.Output.all(service_name, port).apply(lambda args: f'http://{args[0]}:{args[1]}')

pulumi.export("http_url", http_url)