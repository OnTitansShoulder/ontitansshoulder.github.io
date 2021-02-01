---
layout: note_page
title: K8s Knowledge
title_short: k8s_knowledge
dateStr: 2020-08-05
category: Cloud
tags: notes
---

This set of notes is taken straight from [kubernetes.io](https://kubernetes.io){target=_blank}

## Breif Kubernetes Overview

**Kubernetes** is a portable, extensible, open-source platform for managing **containerized** workloads and services, that facilitates both declarative configuration and automation.

k8s provides:

- **Service discovery and load balancing**
  - expose a container using DNS name or IP address
  - balance loads among many instances of a service
- **Storage orchestration**
  - mount storage from local or other cloud providers
- **Automated rollouts and rollbacks**
  - describe desired state of containers and have k8s monitor it
- **Automatic bin packing**
  - k8s can make the best use of resources by fitting containers among the nodes
- **Self-healing**
  - k8s manages the avaibility, restart, replacement, and termination of containers
- **Secret and configuration management**
  - k8s manages and stores sensitive info

k8s is not a traditional Platform as a Service system.

<img src="https://d33wubrfki0l68.cloudfront.net/26a177ede4d7b032362289c6fccd448fc4a91174/eb693/images/docs/container_evolution.svg" alt="Deployment evolution">

## Kubernetes Components

When you deploy Kubernetes, you get a **cluster**. At an enterprise grade k8s deployment, there would be multiple clusters for _fault-tolerance_ and _high availablility_.

These components exist within a cluster:

- **nodes** - a number of worker machines
- **control plane** - a set of programs that together manages the nodes and the Pods
  - may span across multiple physical machines
  - consists of: kube-apiserver, etcd, kube-scheduler, kube-controller-manager, cloud-controller-manager

<img src="https://d33wubrfki0l68.cloudfront.net/2475489eaf20163ec0f54ddc1d92aa8d4c87c96b/e7c81/images/docs/components-of-kubernetes.svg" alt="Components of Kubernetes">

### Control Plane Components

The control plane's components can be run on _any machine_ in the cluster and they make **global decisions** about the cluster as well as detecting and responding to **cluster events**.

See [Building High-Availability Clusters](https://kubernetes.io/docs/admin/high-availability/){target=_blank} for an example multi-master-VM setup.

#### kube-apiserver

The apiserver is the front end for the k8s control plane and it is designed to scale horizontally. Multiple `kube-apiserver` can be deployed to balance traffic.

`kube-apiserver` serves **REST http requests** which can be consumed from apps built by any languages. `kubectl` and `kubeadm` also consumes this API.

List of [client libraries](https://kubernetes.io/docs/reference/using-api/client-libraries/){target=_blank} for consuming k8s API.

Full [k8s API reference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/){target=_blank} is available, but it is better to use the client libraries.

#### etcd

`etcd` provides a _consistent_ and _highly-available_ **key value store** for **all cluster data**.

K8s allows you to use alternative key-value store for the cluster data. Be sure to have [back up plan](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster){target=_blank} for the data no matter which store you use.

[etcd official documentation](https://etcd.io/docs/){target=_blank}

#### kube-scheduler

`kube-scheduler` watches for newly created Pods with no assigned node and selects a node for them to run on. Some **decision-making factors**:

- collective resource requirements
- hardware/software/policy constraints
- affinity and anti-affinity specs
- data locality
- inter-workload interference
- deadlines

#### kube-controller-manager

`kube-controller-manager` runs controller processes, combined in a single binary.

- **Node controller** - notices and reports when nodes go down
- **Replication controller** - maintains the correct number of pods for every replication controller object
- **Endpoints controller** - populates the endpoints object (joins Services & Pods)
- **Service Account & Token controller** - creates default accounts and API access tokens for new namespaces

#### cloud-controller-manager

`cloud-controller-manager` has cloud-specific control logic. Lets you link your cluster into your external cloud provider's API.

Only runs controllers that are specific to your cloud provider.

### Node Components

Node components run on **every node**, **maintaining running pods** and providing the Kubernetes runtime environment.

#### kubelet

`kubelet` makes sure containers are running healthy in a Pod described by the **PodSpecs**. It doesn't manage containers that were not create by Kubernetes.

#### kube-proxy

`kube-proxy` is a **network proxy** that maintains network rules, implementing part of the Kubernetes Service concept. It allows **communication** to Pods inside or outside the cluster.

#### container runtime

`container runtime` is the software responsible for running containers. Typically are one of: **Docker, containerd, CRI-O**, or any that implements **Kubernetes CRI** (Container Runtime Interface)

### Addons

Addons use Kubernetes resources to implement **cluster features**.

#### Cluster DNS

A DNS server that **serves DNS records** for Kubernetes services. Containers started by Kubernetes automatically include this DNS server.

#### Web UI Dashboard

The general web UI for clusters allow **manage and troubleshoot applications** running in the cluster.

#### Container Resource Monitoring

Records generic time-series **metrics about containers**.

#### Cluster-level logging

Saving **container logs** to a central log store with search/browsing interface.

## The Kubernetes API

The control plane is the apiserver and it exposes a HTTP API for querying and manipulating the state of objects in Kubernetes.

Tools like kubectl and kubeadm use this API. You can also consume it with REST calls. Client libraries exist for many languages for consuming the API.

**Extend Kubernetes API** by adding `CustomResourceDefinition`.

## Kubernetes Objects

Kubernetes objects are persistent entities to represent **state of your cluster**.

- what **applications** are running
- the **resources** available to the applications
- **policies** around how the applications behave

Kubernetes objects are represented in the Kubernetes API and can be expressed in `.yaml` format. Kubernetes API consumes the **converted JSON** of the configs specified in the yaml file.

Almost every k8s object includes `spec` and `status`. `spec` describes the **desired state** for the resource, and `status` describes the **current state** of the object. `spec` is done by you when the resource is first created, and `status` is updated by k8s. `metadata` is used to **identify the resource**.

Required fields:

- **apiVersion** - the version of the k8s API used when creating this object
- **kind** - what kind of object
- **metadata** - object identifier, usually a name, UID, and optional namespace
  - each object has a **unique name** for that **specific type** of resource in **one cluster**
    - for name restriction check [here](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names){target=_blank}
  - each object has a **unique UID** that is unique across the **whole cluster**
    - generated by k8s
- **spec** - desired state for the object
  - precise spec is different for each k8s object

### Namespaces

Kubernetes supports multiple **virtual clusters** backed by the same physical cluster. These virtual clusters are called `namespaces`.

Namespaces are intended for use in environments with **many users** spread across **multiple teams, or projects**.

Namespaces provide a **scope for names**. Names of resources need to be unique within a namespace, but not across namespaces.

Namespaces provide a way to **divide cluster resources** between multiple users via **resource quota**.

Some resources are in a namespace and some are not. To find out:

```sh
# In a namespace
kubectl api-resources --namespaced=true
# Not in a namespace
kubectl api-resources --namespaced=false
```

### Labels and Selectors

`labels`, under `metadata`, are key-value pairs that are intended to be used to specify **identifying attributes** of objects that are **meaningful and relevant to users**, but do not directly imply semantics to the core system.

Labels can be attached to objects at creation time and added/modified any time and can be used to **organize and to select** subsets of objects.

- Labels are made up from an `optional prefix` and a `name`, connected by a `slash`.
  - labels are **NOT unique** among multiple objects
- prefix must be a **DNS subdomain**
  - if prefix is omitted, label key is presumed to be **private to the user**
  - **automated system components** must specify a prefix
- name must be **less or equals to 63 chars length**, starts and ends with `alphanumerics` and can have `dashes, underscores, or dots` between.

Using a `label selector` to identify a set of objects, which is the core grouping primitive in k8s.

- A label selector can be made of multiple requirements of **comma-separated string**, for which _all_ must satisify.
- A label selector requirement can be specified with equality-based operators, `=, ==, !=`
  - for inequality, resources without the label key (**null**) will also be selected.
  - for objects definitions in JSON or YAML, some **only** support equality requirement selectors and some supports set requirements
  - see https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#resources-that-support-set-based-requirements
- A label selector requirement can also be a **set of values** with operators, `in, notin, exists`
  - i.e. `environment in (prod, qa)`, `tier notin (fe, be)`, `partition` (only the key for exists), `!partition` (opposite of exists)

Common labels

Key | Description | Example | Type
----|-------------|---------|-----
app.kubernetes.io/name | The name of the application | mysql | string
app.kubernetes.io/instance | A unique name identifying the instance of an application | mysql-abcxzy | string
app.kubernetes.io/version | The current version of the application (e.g., a semantic version, revision hash, etc.) | 5.7.21 | string
app.kubernetes.io/component | The component within the architecture | database | string
app.kubernetes.io/part-of | The name of a higher level application this one is part of | wordpress | string
app.kubernetes.io/managed-by | The tool being used to manage the operation of an application | helm | string

### Annotations

`annotations` are not used to identify and select objects. It serves as **additional information** for the application or for **debugging** purposes.

The metadata in an annotation can be small or large, structured or unstructured, and CAN include characters not permitted by labels.

The naming restrictions of annotation keys are the SAME as that for label keys.

### Field Selectors

`field selectors` allow selecting resources based on the value of one or more **resource fields**. This is broader than the label selector, but it works **only on API** and can't be specified in the resource itself to select other objects.

Supported field selectors vary by the resource type. Using unsupported field selectors produces an error. Operators `=, ==, !=` can be used; multiple requirements can be combined with a comma. i.e. `metadata.name=my-service,status.phase!=Running`

## Cluster Architecture

### Nodes

Kubernetes runs workload by placing **containers into Pods** that run on `Nodes`.

A node can be a **virtual or physical** machine. Each node contains services necessary to run Pods which are managed by the **control plane**.

A node has components: **kubelet**, a **container runtime**, and the **kube-proxy**.

A node can be added to the k8s apiserver either by the kubelet self-register or by a mnaully-created Node resource object, for which the control plane server will validate and healthcheck. The Node object must have a **valid DNS subdomain name**.

Node can be marked **unscheduleable** before maintenance or upgrades.

The node lifecycle controller automatically creates **taints** that represent **conditions**. The Pod scheduler takes the Node's taints into consideration when assigning a Pod to a Node. Pods can also have **tolerations** which let them tolerate a Node's taints.

The node controller is responsible for assigning **Classless Inter-Domain Routing** (CIDR) block to the node when it is registered, keeping the node controller's internal list of nodes up-to-date with the **list of available machines**, and monitoring the **nodes' health**.

For _reliability_, spread your nodes across **availability zones** so that the workload can be shifted to healthy zones when one entire zone goes down.

### Control Plane <--> Node Communication

All **API usage** from nodes terminate at the `apiserver`. The apiserver is configured to listen for remote connections on a secure HTTPS port (typically 443) with one or more forms of client authentication enabled.

Nodes should be provisioned with the **public root certificate** for the cluster such that they can connect securely to the apiserver along with valid client credentials.

Pods that wish to connect to the apiserver can do so securely by leveraging a **service account** so that Kubernetes will automatically inject the public root certificate and a valid bearer token into the pod when it is instantiated. 

The kubernetes service (in all namespaces) is configured with a virtual IP address that is **redirected** (via kube-proxy) to the HTTPS endpoint on the apiserver.

Control Plane can talk to the nodes from the apiserver to the kubelet process on each node in the cluster, or from the apiserver to **any node, pod, or service** through the apiserver's proxy.

Kubernetes supports **SSH tunnels** to protect the control plane to nodes communication paths but it is deprecated. `Konnectivity` service is the replacement for this communication channel.

### Controllers

In Kubernetes, `controllers` are control loops that **watch the state** of your cluster, then make or request changes where needed. Each controller tries to move the current cluster state closer to the desired state.

A controller might handle the action itself or messages the apiserver to do so. Built-in controllers run inside the kube-controller-manager and manage state by interacting with the cluster apiserver.

Controllers that interact with external state find their desired state from the apiserver, then communicate directly with an external system to bring the current state closer in line.

There can be several controllers that create or update the same kind of object. Behind the scenes, Kubernetes controllers make sure that they only change the resources linked to their controlling resource.

You can find controllers that run outside the control plane, to extend Kubernetes. Or, if you want, you can write a new controller yourself. You can run your own controller as a set of Pods, or externally to Kubernetes (via CustomResourceDefinition).

### Cloud Controller Manager

The `cloud-controller-manager` is a Kubernetes control plane component that embeds cloud-specific control logic and allow linking your cluster into your cloud provider's API. It works like an **adaptor**.

The cloud-controller-manager is structured using a plugin mechanism that allows different cloud providers to integrate their platforms with Kubernetes. The cloud controller manager runs in the control plane as a replicated set of processes and each cloud-controller-manager implements multiple controllers in a single process. It can also run as a k8s addon rather than part of the control plane.

## Containers

### Images

A `container image` is a **ready-to-run software package**, containing everything needed to run an application: the code and any runtime it requires, application and system libraries, and default values for any essential settings. An image makes very well defined assumptions about their runtime environment.

You typically create a container image of your application and push it to a **registry** before referring to it in a Pod.

An image name can include a registry hostname and an optional port number. If you don't specify a registry hostname, Kubernetes assumes that you mean the Docker public registry. After the image name part you can add a tag to identify different versions of that image. If you don't specify a tag, Kubernetes assumes you mean the tag latest.

**Avoid using latest** tag when deploying containers in production, as it is harder to track which version of the image is running and more difficult to roll back to a working version. Use a **pinned version** instead.

A container registry can also serve a container image index to allow different systems to fetch the right binary image for the **machine architecture** they are using. Kubernetes itself typically names container images with a suffix -$(ARCH).

A container is **immutable**: you cannot change the code of a container that is already running. To do so you need to build a new image that includes the change, then recreate the container to start from the updated image.

The `container runtime` is the software that is responsible for running containers. K8s suports Docker, containerd, CRI-O, and any implementation of the Kubernetes CRI.

### Container Environment

The resources available to containers in the `container environment`:

- **filesystem**, a combination of image and volumes
- information about the **container**
  - i.e. env variables like Pod name and namespace, other user defined env variables and others statically specified in the image
- information about other **objects** in the cluster
  - a list of all services that were running when the container is created, available as env variables
    - i.e. `FOO_SERVICE_HOST` and `FOO_SERVICE_PORT` is available as env variables for a service named `foo` that maps to that container

### Runtime Class

`RuntimeClass` is a feature for selecting the container runtime configuration, which is used to run a Pod's containers.

You can set a different RuntimeClass between different Pods to balance **performance and security**.

You can also use RuntimeClass to run different Pods with the same container runtime but with different settings.

### Container Lifecycle Hooks

kubelet managed containers can use the `container lifecycle hook` framework to run code triggered by events during their management lifecycle.

The hooks enable containers to be **aware of events** in their management lifecycle and run code implemented in a **handler** when the corresponding lifecycle hook is executed.

Two hooks exposed to containers:

- **PostStart** - executed immediately after a container is **created**
- **PreStop** - called immediately before a container is **terminated** due to an API request or management event such as **liveness probe failure**, **preemption**, **resource contention**, **cordon**, **container exit**, and others.

Containers can access a hook by implementing and registering a handler for that hook.

Two types of hook handlers:

- **exec** - executes a specific **command or script**, such as pre-stop.sh, inside the cgroups and namespaces of the container
- **http** - executes an **HTTP request** against a specific **endpoint on the container**

Hook handler calls are **synchronous** within the context of the Pod containing the container. The hook need to finish before the container reach a running state. Users should make their hook handlers **as lightweight as possible**.

PostStart or PreStop **hook failures kills the container**. Hook delivery is intended to be at least once and **generally only once**. It doesn't get resend if delivery fails. If a handler fails for some reason, it broadcasts an event, which is viewable by `kubectl describe`.

## Workloads

A `workload` is an application running on Kubernetes, usually in **a set of Pods**. A Pod represents a set of running containers on your cluster. You can use workload resources that manage a set of Pods on your behalf.

Workload resources:

- `Deployment` and `ReplicaSet`
- `StatefulSet`
- `DaemonSet`
- `Job` and `CronJob`

Garbage collection tidies up objects from your cluster after their owning resource has been removed.

The time-to-live after finished controller removes Jobs once a defined time has passed since they completed.

Once your application is running, you might want to make it available on the internet as a `Service` or, for web application only, using an `Ingress`.

### Pods

`Pods` are the smallest deployable units of computing that you can create and manage in Kubernetes.

A Pod is a **group** of one or more **containers**, with **shared** storage/network resources, and a specification for how to run the containers. A Pod's contents are always co-located and co-scheduled, and run in a shared context.  

A Pod models an application-specific "**logical host**": it contains one or more application containers which are relatively **tightly coupled**.

A Pod can contain `init containers` that run during Pod startup. You can also inject ephemeral containers for debugging if your cluster offers this. Init containers run and complete before the app containers are started.

The shared context of a Pod is a set of Linux namespaces, cgroups, and potentially other facets of isolation.

Pods are generally used to run a single container or run multiple containers that need to work together. For example, one container serving data stored in a shared volume to the public, while a separate **sidecar container** refreshes or updates those files.

The containers in a Pod are automatically **co-located and co-scheduled** on the same physical or virtual machine in the cluster. The containers can share resources and dependencies, communicate with one another, and coordinate when and how they are terminated.

A Pod is not a process, but an **environment for running container(s)**. A Pod persists until it is deleted.

Within a Pod, containers **share an IP address and port space**, and can find each other via localhost. The containers in a Pod can also communicate with each other using **standard inter-process communications** like SystemV semaphores or POSIX shared memory. Containers that want to interact with a container running in a different Pod can use IP networking to communicate.

#### YAML Reference

???+ note "Pod Example"
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: pod-example
    spec:
      containers:
      - name: ubuntu
        image: ubuntu:trusty
        command: ["echo"]
        args: ["Hello World"]
    ```

???+ note "Frequently used commands"
    ```sh
    kubectl get pods
    kubectl get pods --show-labels
    kubectl describe pod/<pod>
    kubectl exec -it pod/<pod> -c <container> <command>
    kubectl logs pod/<pod> -c <container>
    ```

`Static Pods` are managed directly by the **kubelet daemon** on a specific node, without the API server observing them. The main use for static Pods is to run a **self-hosted control plane** (or manage its components).

#### Pod lifecycle

**Pod lifecycle**: starting in the Pending phase, moving through Running if at least one of its primary containers starts OK, and then through either the Succeeded or Failed phases depending on whether any container in the Pod terminated in failure.

Pods are considered to be **relatively ephemeral** (rather than durable) entities. Pods do not, by themselves, self-heal. If a Pod is scheduled to a node that then fails, or if the scheduling operation itself fails, the Pod is deleted.

A given Pod (as defined by a UID) is never "rescheduled" to a different node; instead, that Pod can be replaced by a new, near-identical Pod, with even the same name if desired, but with a different UID. The same rule applies to the volumes attached to a given Pod.

You can use container lifecycle hooks to trigger events to run at certain points in a container's lifecycle.

Pod has three states:

- **Waiting** - a container is running the operations it requires in order to complete start up
- **Running** - a container is executing without issues, and the postStart hook has been executed and finished
- **Terminated** - a container has begun execution and either ran to completion or failed for some reason. The preStop hook is executed and finished before a container enters the Terminated state

A Pod's `restartPolicy` controls restarts of Terminated containers.

A Pod has `PodStatus`, which contains an array of PodConditions which the Pod has/hasn't passed:

- **PodScheduled** - the Pod has been scheduled to a node
- **ContainersReady** - all containers in the Pod are ready
- **Initialized** - all init containers have started successfully
- **Ready** - the Pod is able to serve requests and should be added to the load balancing pools of all matching Services

#### Probe

A `Probe` is a diagnostic performed periodically by the kubelet on a container. To perform a diagnostic, the kubelet calls a Handler implemented by the container. There are three types of handlers:

- **ExecAction** - Executes a specified command or script inside the container and expects it exits with 0
- **TCPSocketAction** - Performs a TCP check against the Pod's IP address on a specified port and expects the port to be open
- **HTTPGetAction** - Performs an HTTP GET request against the Pod's IP address on a specified port and path and expect response status code, x, to be `200 <= x < 400`

The kubelet can optionally perform and react to three kinds of probes on running containers:

- **livenessProbe** - whether the container is **running**. kubelet kills the container according to its restart policy if the probe fails
- **readinessProbe** - whether the container is **ready to respond to requests**.The endpoints controller removes the Pod's IP from the Services that match the Pod, if the probe fails.
- **startupProbe** - whether the application within the container is started. Other probes are disabled until this probe succeeds. kubelet kills the container according to its restart policy if the probe fails

Pods represent processes running on nodes in the cluster, it is important to allow those processes to gracefully terminate when they are no longer needed. The container runtime sends a **TERM signal to the main process** (PID=1) in each container. Once the `PodTerminationGracePeriod` has expired, the KILL signal is sent to **any remaining processes**, and the Pod is then deleted from the API Server.

If the **order** of shutting down the containers within a Pod matters, consider using the preStop hook to **synchronize**.

#### initContainers

`initContainers` can contain utilities or setup scripts not present in an app image, which are run before the app containers are started. They always **run to completion** and must complete **sequentially** and successfully before next one starts. If one fails, the kubelet repeatedly restarts that init container until it succeeds unless the restartPolicy is Never, then the Pod fails to start and pending deletion.

Init containers offer a mechanism to block or **delay app container startup** until a set of preconditions are met, and can securely run utilities or custom code that would otherwise make an app container image less secure, as they access to Secrets that app containers cannot access.

You can use `topology spread constraints` to control how Pods are spread across your cluster among failure-domains such as regions, zones, nodes, and other user-defined topology domains. This can help to achieve high availability as well as efficient resource utilization.

Directives related to "Affinity" control how Pods are scheduled - more packed or more scattered.

`PodPresets` are API resource objects for injecting additional runtime information such as secrets, volumes, volume mounts, and environment variables, into pods at creation time. Pod template authors to not have to explicitly provide all information for every pod.

#### Pod Disruptions

Pods do not disappear until someone (a person or a controller) destroys them, or there is an unavoidable hardware or system software error.

Unavoidable Pod disruptions are `involuntary disruptions`. Examples:

- hardware failure from physical machine
- cluster admin deletes VM by mistake
- cloud provider hypervisor failure causes VM disappear
- kernel panic
- node disappears from the cluster due to network partition
- eviction of Pods due to out-of-resource errors

Other cases are `voluntary disruptions`. Examples:

- deleting a deployment or the controller that manages the Pods
- updating a deployment's Pod template causing a restart
- directly deleting a Pod by accident
- cluster admin drain a node for maintenance
- removing a Pod from a node to free up resource

To mitigate involuntary disruptions

- ensure the Pod requests just enough resources it needs
- replicate application for higher availability
- spread applications across racks or across zones

A `PodDisruptionBudget(PDB)` limits the number of Pods of a replicated application that are down simultaneously from voluntary disruptions. However, deleting deployments or pods bypasses this rule. When a pod is evicted using the eviction API, it is gracefully terminated.

As a cluster admin to perform a disruptive action on all the nodes in your cluster, some options:

- accept downtime during the upgrade
- failover to another complete replica cluster, maybe costly
- write disruption-rolerant applications and use PDBs, can be tricky on the application effort

Ephemeral containers are intended to help troubleshoot a hard-to-reproduce bug through running within a Pod and inspect its state and run arbitrary commands. It is a way to run containers with many limitations and has to be added to a Pod through k8s API.

### Deployments

A `Deployment` provides declarative updates for `Pods` and `ReplicaSets`.

Creating a new Deployment creates a ReplicaSet, which in turn creates Pods per the `PodTemplateSpec` of the Deployment. With a Deployment:

- Scale up/down the Deployment
- Rollback the Deployment and apply an earlier ReplicaSet
- Make changes to PodTemplateSpec and rollout new a RelicaSet

#### YAML Reference

???+ note "Deployment Template"
    ```yaml
    apiVersion: apps/v1         # required
    kind: Deployment            # required
    metadata:                   # required
      name: nginx-deployment
      labels:                   # must match spec.template.metadata.labels
        app: nginx
    spec:                       # required
      minReadySeconds: 0            # default 0, time that newly created Pod should be
                                    #   ready without any of its containers crashing
                                    #   for it to be considered available 
      progressDeadlineSeconds: 600  # default 600, time to wait for your Deployment to
                                    #   progress before the system reports back that
                                    #   the Deployment has failed progressing
                                    #   must > minReadySeconds
      paused: false             # default false, for pausing and resuming a Deployment
      replicas: 3               # default 1
      revisionHistoryLimit: 10  # default 10, number of old ReplicaSets kept for rollback
      selector:                 # required
        matchLabels:            # must match spec.template.metadata.labels
          app: nginx
      strategy:                 # strategy used to replace old Pods by new ones
        type: RollingUpdate     # default RollingUpdate, also possible: Recreate
        rollingUpdate:
          maxUnavailable: 25%   # default 25%, max number of Pods over desired replicas
                                #   that can be unavailable during the update process
                                #   can be an absolute number or percentage (rounding down)
          maxSurge: 25%         # default 25%, max number of Pods that can be created
                                #   over desired replicas
                                #   can be an absolute number or percentage (rounding up)
      template:                 # required, aka Pod template, 
                                #   same schema as Pod, apiVersion and kind excluded
        metadata:               # required
          labels:
            app: nginx
        spec:                   # required
          containers:           # required
          - name: nginx
            image: nginx:1.14.2
            ports:
            - containerPort: 80
          restartPolicy: Always # default Always, also available: Never, OnFailure
    ```

A Deployment may **terminate** Pods whose labels match the selector if their template is different from `.spec.template` or if the total number of such Pods exceeds `.spec.replicas`. For labels, make sure not to overlap with other controllers, otherwise the controllers won't behave correctly 

???+ note "Frequently used commands"
    ```sh
    kubectl apply -f <.yaml>
    kubectl get deployment
    kubectl describe deployment/<deployment_name>
    kubectl scale deployment/<deployment_name> --replicas=10
    kubectl autoscale deployment/<deployment_name> --min=10 --max=15 --cpu-percent=80
    kubectl rollout status deployment/<deployment_name>
    kubectl rollout history deployment/<deployment_name>
    kubectl rollout undo deployment/<deployment_name> --to-revision=2
    kubectl rollout pause/resume deployment/<deployment_name>
    kubectl edit deployment/<deployment_name>
    kubectl get rs
    ```

#### RollingUpdate vs. Recreate

A Deployment's `revision` is created when a Deployment's rollout is triggered. New revision is created each time the PodTemplate (.spec.templates) is changed. Set `.spec.revisionHistoryLimit` field (default 10) to specify how many old ReplicaSets for this Deployment you want to retain.

During a **RollingUpdate**, `Deployment controller` creates new Pods per the new ReplicaSet and termiantes existing replicas in the active ReplicaSets, in a controlled rate in order to mitigate risk.

With `propertional scaling`, Deployment controller decide where to add new replicas instead of adding all blindly to the new ReplicaSet. Parameters affecting this are `maxSurge` and `maxUnavailable`

When setting `.spec.strategy.type` to **Recreate**, existing Pods are killed before new ones are created, which guarantee Pod termination previous to creation for upgrades. Successful removal is awaited before any Pod of the new revision is created.

#### Deployment statuses

A Deployment can have various states during its lifecycle: progressing, complete, fail to progress

**Progressing** state:

- creating a new ReplicaSet
- scaling up newest ReplicaSet
- scaling down older ReplicaSet(s)
- wait new Pods to become Ready

**Complete** state:

- all replicas updated to latest version per the PodTemplateSpec and Ready
- no old replicas present

**Failed** state:

- progressing got stuck for a while and cannot complete by the `.spec.progressDeadlineSeconds` configured
  - Possible causes:
    - insufficient quota
    - readiness probe fails
    - image pull errors
    - insufficient permissions
    - application runtime misconfiguration causing container exits
- Kubernetes takes **NO action** on a stalled Deployment other than to report a status condition `.status.conditions`:
  - "Type=Progressing"
  - "Status=False"
  - "Reason=ProgressDeadlineExceeded"
- Higher level orchestrators can take advantage of it and act accordingly, such as rollback to previous version

### ReplicaSet

A **ReplicaSet** maintains a stable set of replica Pods running at any given time. When a ReplicaSet needs to create new Pods, it uses its `Pod template`.

#### ReplicaSet and its Links with Pods

A ReplicaSet is **linked** to its Pods via the Pods' `metadata.ownerReferences` field, which specifies what resource the current object is owned by. A ReplicaSet identifies new Pods to **acquire** by using its selector on Pods missing `metadata.ownerReferences` or the reference is an invalid controller, for which the reference is established.

While you can create `bare Pods`, it is important to make sure they DO NOT have labels which match the selector of one of exiting ReplicaSets, otherwise they can be acquired by the ReplicaSets and got deleted (because exceeding the desired number of replica).

You can remove Pods from a ReplicaSet (`orphan Pods`) by changing their labels so they do not match any ReplicaSet's selector. This technique may be used to remove Pods from service for **debugging, data recovery, etc**.

`Deployment` is a higher-level resource that manages ReplicaSets, and you may never need to manipulate ReplicaSet objects directly. Use a Deployment instead, and define your application in the `spec` section.

#### YAML Reference

???+ note "ReplicaSet Example"
    ```yaml
    apiVersion: apps/v1
    kind: ReplicaSet
    metadata:
      name: frontend
      labels:
        app: guestbook
        tier: frontend
    spec:
      replicas: 3
      selector:
        matchLabels:
          tier: frontend
      template:
        metadata:
          labels:
            tier: frontend
        spec:
          containers:
          - name: php-redis
            image: gcr.io/google_samples/gb-frontend:v3
    ```

???+ note "Frequently used commands"
    ```sh
    kubectl get rs
    kubectl delete rs/<rs_name>
    kubectl delete replicaset/<rs_name>
    kubectl delete replicaset/<rs_name> --cascade=orphan # keep the Pods managed by this ReplicaSet
    ```

#### ReplicaSet as a Horizontal Pod Autoscaler (HPA) Target

ReplicaSet can be auto-scaled by an HPA according to settings such as CPU usage, cron expression, etc.

???+ note "HPA Example"
    ```yaml
    apiVersion: autoscaling/v1
    kind: HorizontalPodAutoscaler
    metadata:
      name: frontend-scaler
    spec:
      scaleTargetRef:
        kind: ReplicaSet
        name: frontend
      minReplicas: 3
      maxReplicas: 10
      targetCPUUtilizationPercentage: 50
    ```

???+ note "Frequently used commands"
    ```sh
    kubectl autoscale rs frontend --max=10 --min=3 --cpu-percent=50
    ```

### StatefulSets

**StatefulSets** are like Deployments that manages the deployment and scaling of a set of Pods, while providing guarantees about the **ordering** and **uniqueness** of these Pods. Pods created are not interchangeable and each has a **persistent identifier** that it maintains across any rescheduling.

StatefulSets are valuable for applications that require one or more of:

- Stable, unique network identifiers.
- Stable, persistent storage.
- Ordered, graceful deployment and scaling.
- Ordered, automated rolling updates.

#### Limitations/Behaviors

- Storage for a Pod must be provisioned by a `PersistentVolumeProvisioner` based on the `storage class`, or pre-provisioned by an admin
- Deleting/scaling down StatefulSet will NOT delete the volumes to ensure data safety
- A Headless Service is required for the network identity of the Pods
- Deletion of the Pods when a StatefulSet is deleted, is not guaranteed.
  - try scale down the StatefulSet to 0 prior its deletion
- RollingUpdates with default `podManagementPolicy` as `OrderedReady` can run into a broken state that requires [manual intervention](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#forced-rollback){target=_blank}

#### YAML Reference

???+ note "StatefulSet Example"
    ```yaml
    apiVersion: apps/v1                       # required
    kind: StatefulSet                         # required
    metadata:                                 # required
      name: web
    spec:                                     # required
      podManagementPolicy: OrderedReady       # default OrderedReady, also possible: Parallel
      replicas: 3                             # default 1
      selector:                               # required
        matchLabels:                          # must match spec.template.metadata.labels
          app: nginx
      serviceName: "nginx"                    # must match the Service name
      template:                               # required
        metadata:                             # required
          labels:
            app: nginx
        spec:
          terminationGracePeriodSeconds: 10   # should be non-0
          containers:                         # required
          - name: nginx
            image: k8s.gcr.io/nginx-slim:0.8
            ports:
            - containerPort: 80
              name: web
            volumeMounts:
            - name: www
              mountPath: /usr/share/nginx/html
      updateStrategy:
        type: RollingUpdate                   # default RollingUpdate, also possible: OnDelete, Partitions
      volumeClaimTemplates:                   # provide stable storage using PersistentVolumes
      - metadata:
          name: www
        spec:
          accessModes: [ "ReadWriteOnce" ]
          storageClassName: "my-storage-class"
          resources:
            requests:
              storage: 1Gi
    ---
    # Headless Service
    apiVersion: v1
    kind: Service
    metadata:
      name: nginx
      labels:
        app: nginx
    spec:
      ports:
      - port: 80
        name: web
      clusterIP: None
      selector:
        app: nginx
    ```

#### StatefulSet Pods

StatefulSet Pods have a unique identity that is comprised of an **ordinal**: each Pod assigned an integer ordinal from `0` up through `N-1`, for N replicas.

Pod will be named `$(statefulset name)-$(ordinal)` and getting a matching DNS subdomain `$(podname).$(governing service domain)`.

The domain managed by the Headless Service has form `$(service name).$(namespace).svc.$(cluster_domain)`. cluster_domain will be `cluster.local` unless [configured](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/){target=_blank}.

Pod will also be added a label `statefulset.kubernetes.io/pod-name` with it name, for attaching a Service to specific Pods.

#### Scaling

StatefulSet being deployed will do updates to the Pods sequentially in the order from **{0..N-1}**; and Pod N must wait ALL Pods N-1 and below to have started and available, before being created and replaced.

Upon StatefulSet deletion, the Pods will be terminatated sequentially in the order from **{N-1..0}**; and Pod N must wait ALL Pods N+1 and above to have completed terminated and deleted, before going into termination.

#### Parallel Pod Management

Specifying `.spec.podManagementPolicy` with `Parallel` will launch or terminate all Pods in parallel regardless the ordering.

#### Update Strategies

StatefulSet's `.spec.updateStrategy` field allows you to **configure and disable** automated rolling updates for containers, labels, resource request/limits, and annotations for the Pods in a StatefulSet.

##### OnDelete

**OnDelete** tells StatefulSet controller to not automatically update Pods; users must manually delete Pods to cause new Pods being created to reflect changes to `.spec.template`.

##### RollingUpdate

**RollingUpdate** strategy implements automated, rolling update for the Pods in a StatefulSet.

##### Partitions

**Partitions** is a setting under RollingUpdate, by specifying a `.spec.updateStrategy.rollingUpdate.partition` number. All Pods with an ordinal **>= partition number** will be updated when the StatefulSet's `.spec.template` is updated; the rest won't ever be updated even on deletion (recreated at previous version)

### DaemonSet

**DaemonSet** ensures that all (or some) Nodes run a **copy** of a Pod. As nodes are added to the cluster, Pods are added to them, and vice-versa.

Deleting a DaemonSet will clean up the Pods it created.

Typical use of DaemonSet:

- running a cluster storage daemon on every node
- running a logs collection daemon on every node
- running a node monitoring daemon on every node

#### YAML Reference

???+ note "DaemonSet Template"
    ```yaml
    apiVersion: apps/v1                       # required
    kind: DaemonSet                           # required
    metadata:                                 # required
      name: fluentd-elasticsearch
      namespace: kube-system
      labels:
        k8s-app: fluentd-logging
    spec:                                     # required
      selector:                               # required, if both types of matchers specified, ANDed
        matchLabels:                          # must match spec.template.metadata.labels
          name: fluentd-elasticsearch
        matchExpressions: ...                 # allows more sophisticated selectors by key or list values
      template:                               # required
        metadata:
          labels:
            name: fluentd-elasticsearch
        spec:
          containers:
          - name: fluentd-elasticsearch
            image: quay.io/fluentd_elasticsearch/fluentd:v2.5.2
            resources:
              limits:
                memory: 200Mi
              requests:
                cpu: 100m
                memory: 200Mi
            volumeMounts:
            - name: varlog
              mountPath: /var/log
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
          affinity:                             # default unset, decide what nodes to schedule Pods
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchFields:
                  - key: metadata.name
                    operator: In
                    values:
                    - target-host-name
          nodeName: ...                         # default unset (schedule on all nodes)
          restartPolicy: Always                 # default Always, must be Always
          terminationGracePeriodSeconds: 30
          tolerations:                          # have the daemonset runnable on master nodes
                                                # remove if your masters can't run pods
          - key: node-role.kubernetes.io/master
            effect: NoSchedule
          volumes:
          - name: varlog
            hostPath:
              path: /var/log
          - name: varlibdockercontainers
            hostPath:
              path: /var/lib/docker/containers
    ```

Once a DaemonSet is created, do not edit its `.spec.selector` as it creates orphaned Pods. Instead, delete the old DaemonSet and deploy a new one if it is necessary to update the selector.

Normally, the node that a Pod runs on is selected by the Kubernetes scheduler. DaemonSet pods are created and scheduled by the **DaemonSet controller**. By adding the NodeAffinity term to the DaemonSet pods, `ScheduleDaemonSetPods` allows you to schedule DaemonSets using the default scheduler instead of the DaemonSet controller.

### Jobs

A **Job** creates one or more Pods and will continue to **retry execution** of the Pods until a specified number of them successfully terminate. Deleting a Job cleans up the Pods created.

Job is used to run some task to completion, and run multiple tasks in parallel from multiple Pods. Parallel Jobs are good for processing of a set of independent but related work items.

#### Parallel executions

1. Non-parallel **default** Jobs
  - only one Pod started, Job completes as soon as the Pod terminates successfully
2. Parallel Jobs with a **fixed completion** count
  - Multiple Pods started, each successful Pod termination get completion count increment by 1
  - Job completes when there is one successful Pod for each value in the range 1 to `.spec.completions`
  - you may specify `.spec.parallelism` to speed up Job completion
    - actual number of pods running in parallel will not exceed the number of remaining completions
3. Parallel Jobs with a **work queue**
  - specify `.spec.parallelism`, leave `.spec.completions` unset
  - Multiple Pods started, Job completes only when at least one Pod terminates successfully and all Pods are terminated
    - requires Pods coordinate amongst themselves or an external service to determine what each should work on
    - requires each Pod independently capable of determining whether or not all its peers are done
  - No new Pods scheduled once one of the Pods terminates successfully

When running a Job in parallel, the Pods should be tolerant to concurrency.

#### YAML Reference

???+ note "Job example"
    ```yaml
    apiVersion: batch/v1            # required
    kind: Job                       # required
    metadata:                       # required
      name: pi
    spec:                           # required
      activeDeadlineSeconds: 100    # default unset, Job must complete within this period
      ttlSecondsAfterFinished: 100  # default unset, time to delete Job after its completion
                                    #   currently an Alpha feature, needs feature gate
      backoffLimit: 6               # default 6, fail a Job after some amount of retries
                                    #   with an exponential back-off delay
      completions: 3                # default 1, run parallel jobs for fixed completion count
      parallelism: 3                # default 1, run parallel jobs with work queue
      manualSelector: false         # only when manually specifying the selector
                                    #   optional and best to omit
      selector: ...
      template:                     # required
        spec:
          containers:
          - name: pi
            image: perl
            command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
          restartPolicy: Never      # only Never or OnFailure allowed
    ```

???+ note "Frequently used commands"
    ```sh
    kubectl get jobs
    kubectl get pods --selector=job-name=pi --output=jsonpath='{.items[*].metadata.name}'
    ```

#### Job termination

When a Job completes, no more Pods are created, and the terminated Pods are around for viewing the logs and diagnostics. The job object also **remains** after it is completed. It must be manually cleaned up or set `ttlSecondsAfterFinished` for auto cleanup. Or switch to a `CronJob` instead.

If `.spec.activeDeadlineSeconds` is set, the Job must complete within the period and will fail otherwise and terminate all its running Pods.

### CronJob

A **CronJob** creates Jobs on a repeating schedule. One CronJob object is like one line of a `crontab` (cron table) file.

All CronJob `schedule:` times are based on the **timezone** of the `kube-controller-manager`.

CronJob name must be **<= 52 chars** because 11 chars are usually generated and the max length for name is 63 chars.

A cron job creates a job object about **once per execution time** of its schedule. CronJobs scheduled should be idempotent since in rare circumstances it might be that 2 jobs are created or none created.

#### YAML Reference

???+ note "CronJob Example"
    ```yaml
    apiVersion: batch/v1beta1                   # required
    kind: CronJob                               # required
    metadata:                                   # required
      name: hello
    spec:                                       # required
      schedule: "*/1 * * * *"                   # required: minute[0-59], hour[0-23], day of the month[1-31], month[1-12], day of week[0-6](Sunday to Saturday)
                                                #   consult tool at https://crontab.guru/
      concurrencyPolicy: Allow                  # default Forbid
      startingDeadlineSeconds: 200              # default unset
      jobTemplate:                              # required
        spec:
          template:
            spec:
              containers:
              - name: hello
                image: busybox
                imagePullPolicy: IfNotPresent
                args:
                - /bin/sh
                - -c
                - date; echo Hello from the Kubernetes cluster
              restartPolicy: OnFailure
    ```

#### CronJob limitations

- A CronJob is counted as **missed** if it has **failed to create** Job at its scheduled time.
  - If concurrencyPolicy is set to Forbid and a CronJob was attempted to be scheduled when there was a previous schedule still running, then it would count as missed.
- CronJob Controller checks how many schedules it missed in the duration from its last scheduled time until now.
  - If there are more than **100 missed** schedules, then it does not start the job and logs an error.
  - If the `startingDeadlineSeconds` field is set, controller counts how many missed jobs occurred from this value rather than from the last scheduled time until now.
  - If `startingDeadlineSeconds` is set to a large value or left unset (the default) and if `concurrencyPolicy` is set to Allow, the jobs will always run **at least once**.

--8<-- "includes/abbreviations.md"