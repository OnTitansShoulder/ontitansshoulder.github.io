---
layout: notes
title: Kubernetes Freq-used Commands
title_short: k8s_commands
dateStr: 2019-01-01
category: Kubernetes
categories: notes
---
**Minikube**

\$ minikube start/stop/delete ```create a kubernetes cluster on current machine```

\$ minikube dashboard ```the kubernetes dashboard```

\$ minikube addons list ```list addons status```

**Switch context**

\$ kubectl config use-context CNTXTNM

**create a deployment via a yaml file**

\$ kubectl create -f deployment.yaml --validate=false (ignore some warnings)

\$ kubectl create ns Namespacename ```in case namespace not exist```

**start a service container specifying the image**

\$ kubectl run hello-minikube --image=k8s.gcr.io/echoserver:1.10 --port=8090

**expose a container via service**
```
things running in pods are for internal use only.
services make it possible for outside to use.
you can expose anything as a service
```

\$ kubectl expose deployment hello-minikube --type=NodePort

\$ kubectl delete service <name>

**service types**
'Cluster IP'
  provides internal access by exposing the service on a cluster-internal IP
'NodePort'
  exposes a port on Kubernetes hosts
'LoadBalancer' (in public cloud solutions)
  used in private cloud if Kubernetes provides a plugin for that cloud type

\$ `export NODE_PORT=$(kubectl get services/hello-minikube -o go-template='\{\{(index .spec.ports 0).nodePort\}\}')`

**get deployment and all other information**

\$ kubectl get pods

\$ kubectl get services (svc)

\$ kubectl get deployments

\$ curl -k (insecure mode, no need CA) $(minikube service hello-minikube --url) # test access of service

**update/upgrade project**
kubectl apply -f Job.yaml -s "kubernetes server ip:port" --user="" --password=""

**scaling deployments**

\$ kubectl scale --replicas=NUMB deployment/name

**to show all details of a container**

\$ docker inspect (-f filter)

\$ kubectl proxy & # start a kubernetes proxy without exposing the service

\$ kubectl port-forward http 8000:80

**kubernetes is RESTful**

**setting labels helps sometimes**

\$ kubectl describe pod pod-name # to check existing labels

\$ kubectl label pod pod-name labelName=value

\$ kubectl expose pod pod-name --labelName="value matching" --port=80 (internal port) --type=NodePort (useExt port)

**run shell in minikube**

\$ minikube ssh (automatically run as root, can check anything about containers)

**alternatively, just run single command from outside of a container:**

\$ kubectl exec pod-name [commands]
