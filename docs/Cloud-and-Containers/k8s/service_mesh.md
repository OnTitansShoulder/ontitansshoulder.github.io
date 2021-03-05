---
layout: note_page
title: Service Mesh
title_short: service_mesh
dateStr: 2021-02-01
category: Cloud
tags: notes check
---

This set of notes was taken from a Linux Foundation course.

## Service Mesh Fundamentals

### Cloud-native applications

A **cloud-native app** is those apps designed to run in the cloud and take advantage of the cloud infrastructure properties and features, often packaged and run in **containers**.

The underlying cloud infrastructure often runs on **shared** commodity hardware that is **regularly changing, restarting, or failing**. The microservice should be designed to be **ephemeral** in nature. It should start up quickly, locate its dependent network services rapidly, and fail fast.

In addition to developing cloud-native app, a cloud-native **organization** should also have adopted development and operational practices that enable **agility** for both the app and the organization itself.

#### Common Architectures

In its architectures, each cloud-native app is composed of a number of **loosely-coupled** and **highly-cohesive** microservices working together to form a **distributed system**.

- loosely-coupled - the microservice can be changed internally with minimal impact on any other microservices
- highly-cohesive - microservices are built around a well-defined business context, and typically any modifications required are **focused around a single area of responsibility or functionality**

Developer's primary benefit of cloud-native apps development is that each app can be developed and deployed **separately** from the others, which enables faster development and release of apps.

Operation's primary benefit of cloud-native apps is the ability to easily deploy, scale up or down, upgrade, and replace those apps.

#### Common Challenges

Challenge 1: **service discovery** - being able to find all the microservices that are dynamically deployed. It becomes increasingly difficult to keep track of where all the instances are currently deployed at any given time.

Challenge 2: **security and observability** - cloud-native apps have larger attack surfaces and more logical pieces to protect, and it is harder to understand what's happening when things go wrong.

Challenge 3: **system-wide fault-tolerance** - while its architecture enables a crash in one service to be isolated, it is quite possible that a failure in one service can cascade throughout the entire application if this is not handled properly.

### Resilience for distributed systems

**Resilience** is the use of strategies for improving **availability**. Ensuring the distributed system is available by **reducing its downtime** increases the system's resilience.

The ultimate goal of resilience is to ensure that **failures or degradations** of particular microservice instances don't cause **cascading failures** that cause downtime for the entire distributed system.

(**Application Layer**) Developers could design and code an app so it will continue to work in a degraded state, providing vital functions, even when other functions have failed due to bugs, compromises, or other issues with one or more of the microservices.

(**Network Layer**) Network-level resilience strategies work to monitor the network performance of deployed instances of each microservice. Requests should be redirected to avoid unresponsive instances automatically to ensure availbility.

#### Load Balancing

**Load blalancing** (LB) for cloud-native apps can be performed at both the Network Layer or the Application Layer. The key difference is that Network level LB is per **connection**, while Application level LB is per **request**. Service Mesh is Application level LB.

For Kubernetes, Network Layer load balancing is by default implemented using **kube-proxy**. The management of Pod IP addresses and routing of traffic between virtual/physical network adapters is handled via the Container Networking Interface (CNI) implementation or an overlay network, such as Calico or Weave Net.

For cloud-native apps, load balancing refers to balancing the app's requests amongst the **running instances** of the microservices. Having multiple instances of each microservice distributed on several machines or nodes provides **redundancy**.

LB algorithms are mostly Round Robin, Least Request, Session Affinity (aka sticky sessions), and weighted versions of the first two.

#### Timeouts and Retries

When part of the system fails to handle the request in a certain period of time, the request **times out** and the requester can retry the request with a **redundant instance** of the failed system.

Requests should NOT ALWAYS be automatically retried. Main reason is to avoid duplicating a transaction that has already succeeded. A **safe transaction** (aka **idempotent transaction**) is that the same request causes the same result if ran multiple times.

#### Deadlines

**Distributed timeouts** (aka **deadlines**) involves more than one services that form a chain of requests. Each node of the **chain** adds processing time and needs to consider the time used from all of previous nodes' processing time against the deadline set when calling the first node. If the deadline is passed on any node from the call chain, the request should return as failure immediately.

#### Circuit Breakers

**Circuit breaker** works by setting a limit for the degree of **service degradation** or failures for a **single instance** of a microservice.

The goal of a circuit breaker is to prevent an issue with one microservice instance from negatively affecting other microservices and potentially causing a **cascading failure**.

#### Resilience with Proxies

Over time, library-based implementations of resilience strategies have been supplanted by **proxy-based** implementations. Proxies can implement resilience strategies between the instances of microservices.

For example, when an instance of microservice A sends a request to microservice B, that request actually goes to a proxy (controlled with **CNAMEs**). The proxy would process A's request and decide which instance of microservice B it should go to (through **endpoint mappings** and LB), and then it would issue the request on A's behalf where some **minor-altering** to the request can happen such as special heads to indicate source IP, or upgrade request with mTLS.

Using proxy may also do cached responses for heavily requested contents to reduce the load on downstream requests.

### Data Planes and Control Planes

#### Data Plane

The **data plane** is a group of proxies directly **manipulates traffic** and is responsible for service discovery, resilience, observability, and security for the microservices. It consists of one or more **service proxies** within a cluster, each of which typically runs next to a single service or microservice of an app, called a **service (mesh) proxy**, or a **sidecar proxy** running alongside a service.

A service proxy is actually **both a proxy and a reverse proxy**. It can accept incoming requests and make out-going requests, and handles proxy-to-proxy remote procedure calls (RPCs). Data plane features:

- **Service discovery** - find suitable service proxies to make requests to
- **Resilience** - implement resilience strategies
- **Observability** - observe each request and reply that it receives, collect performance metrics (throughput, latency, failure rates, etc)
- **Security** - reject requests that violate policies

Common service mesh data plane solutions include Envoy Proxy, linkerd-proxy, NGINX, and HAProxy.

#### Control Plane

The **control plane** manages and coordinates the data plane, and defines **policy** and ensuring every service proxy in the data plane **follows** that policy. Requests do NOT pass through the control plane.

A service mesh is one of the patterns for architecture designs considering control plane and data plane together.

#### Ingress and API Gateway

A service mesh handles an app's **service-to-service** (east-west) traffic within a cluster. An **Ingress controller** manages the app's ingress (north-south), **traffic entering the cluster**.

The integration between an Ingress controller and a service mesh:

- at control plane - share **service discovery information** so that traffic is consistently routed to the correct target
- at data plane - share **encryption secrets** so that all communications can be trusted and secured

Some Ingress controllers also function as **API Gateways**. An API Gateway provides additional **management capabilities** such as authentication, rate limiting, and API management.

An Ingress controller is particular to Kubernetes, while API gateways are used in many environments and for purposes in addition to Ingress control.

Common Ingress controllers: Ambassador, Contour, ingress-nginx

##### Orchestration

The service mesh control plane frequently updates the Ingress controller on the state of the microservices in its data plane. The Ingress controller uses that information to decide how to handle incoming requests entering the cluster from the external load balancer.

<img src="https://d36ai2hkxl16us.cloudfront.net/course-uploads/e0df7fbf-a057-42af-8a1f-590912be5460/qgxp8x7qsnlv-LFS243_CourseGraphics_1.png" />

Ingress controllers provide a feature known as **TLS termination**. This is the process of serving **digital certificates** to clients so that they can use TLS and also decrypt the TLS connections, and let the Ingress controller read the contents of incoming requests.

### Service Mesh Benefits

#### Service Discovery

In a service mesh, service discovery refers to the processes that find microservices and **keep track of** where they are on the network. It can be performed in many ways, inluding a **DNS** infrastructure, a consistent **key value datastore**, or a specialized solution.

Service mesh needs to have **up-to-date** information on what microservices are currently **deployed** and **how to communicate** with them. Ensure as each microservice instance is deployed, it is automatically assigned a service proxy (aka automatic sidecar/proxy injection) that is deployed within its pod.

The communications between the microservice and the service proxy in a pod utilize the **localhost loopback adapter**, 127.0.0.1.

#### Resilience

##### Timeouts and Retries

**Timeouts and automatic retries** need proper configurations, otherwise can cause **large number of retries** that overwhelm systems and slow down all services.

Service meshes can address these problems, methods commonly used are known as using a **service profile** (Linkerd) or a **virtual service** (Istio). They both define **routes** for a microservice.

Another method is called a **retry budget**, for which the service mesh keeps track of the **first-time requests** and **retried requests**, then make sure the **ratio** of first-time requests to concurrently retried requests stays at an acceptable level.

##### Circuit Breakers

**Circuit breakers** are defined through groups of configuration settings in the service mesh, and closely monitor those conditions and trip the actions from the configuration.

##### Load Balancing

Every service mesh supports at least one type of **load balancing** for requests, or using the general terms: **traffic shifting or traffic splitting**.

**Blue-green** deployment refers to having two **production** environments, one designated by blue and the other by green. When users are interacting with the blue, new deployments and testing will be done in green, then switch users to green.

**Canary deployment, canary rollout, and canary release** all refer to testing a new microservice release (called canary) by sending a **percentage of production requests** to the new microservice and **gradually increasing** that percentage over time. The older version ends when all requests are going to the new version.

##### Fault Injection

Service mesh technologies support **Fault injection**, which means that you can test your app by having faults or errors **purposely generated** to see how they affect the app. This can be a great way to **simulate various conditions** and ensure that the app behaves the way you expect it to.

The service mesh can inject many of the error conditions and other adverse circumstances on its own without having to alter the app code at all.

#### Observability

##### Telemetry and Metrics

**Observability** is being able to monitor an app's **state** and to determine a high level cause when there was a system failure in the microservice.

**Telemetry** (aka **Metrics**) means the collection of data that measures something. Google's Four Goden Signals, those metrics important to collect when monitoring distributed systems:

- Latency - time takes to receive a reply for a request
- Traffic, rps - requests per second, or what reflects the demand of the system
- Errors - percentage of requests result in an error
- Saturation - the utilization of resources such as CPU and Memory allocated

Service mesh technologies offer multiple ways to access their metrics, such as a GUI or API.

##### Distributed Tracing

**Distributed tracing** is to have a special and unique ID-based **trace header** added to each request. Typically this unique ID is a **universally unique identifier** (UUID) that is added at the point of **Ingress** and binds to a user-initiated request, which can be useful for troubleshooting.

Distributed tracing is intended to be used when metrics and other information already collected by the service mesh doesn't provide enough information to troubleshoot a problem or understand an unexpected behavior.

All the service meshes use the same specification for their trace headers: **B3**. Read more about [openzipkin/b3-propagation](https://github.com/openzipkin/b3-propagation){target=_blank}

#### Security

##### Mutual TLS

Service meshes can protect the communications between pods by using **Transport Layer Security** (TLS). TLS uses **cryptography** to ensure that the information being communicated can't be **monitored or altered** by others.

In service meshes, TLS is used between service proxies in the form called **mutual TLS**:

- Each service proxy has a secret **cryptographic key** that **confirms its identity** and allows it to **decrypt the communications** it receives.
- Each service proxy also has a **certificate** (aka **public key**) for **every other service proxy** that allows it to **encrypt the communications** it sends out to other service proxies.
- When initiating pod-to-pod communications, each service proxy first **verifies the identity** of the other service proxy through authentication, then **encrypts** their communications.
    - Because each microservice instance has a **unique private key**, each session is encrypted in a way that only that **particular** microservice instance can **decrypt**.

Instead of the old security models that enforced policies based on **IP address**, new security models can enforce policies based on **service proxy identity**. Enforcing trust boundaries through identities verified by mutual TLS helps prevent attackers from laterally moving through microservices to reach the assets of greatest value.

### Service Mesh Disadvantages and Costs

**Increased complexity** - more components in the architecture, and tasks like configuring the components properly and troubleshooting problems will be more challenging.

**More overhead** - more compute resources and other resources will be needed, and higher latency in communications.

**Rapid evolution** - service mesh technologies are still frequently evolving and not necessarily stable. Need to make a conscious effort to keep up with the latest developments in your service mesh technology.

#### When to consider Service Mesh

As the **number of microservices** in an app **increases**, the growing complexity of the app makes a service mesh more beneficial for supporting resilience, observability, and security among all the microservices and their interrelationships.

Also in **deeper microservice topologies**, with many microservices sending requests to each other, service meshes can be invaluable in having visibility into these requests, as well as securing the communications and adding resilience features to prevent cascading failures and other issues.

If you're not sure if a service mesh is needed for a particular situation, consider if an Ingress controller alone may be sufficient.

### Service Mesh Interface

**Service Mesh Interface** (SMI) is a **Kubernetes-native specification** and supports **interoperability** for common service mesh features. It defines a standard set of Kubernetes **Custom Resource Definitions** (CRDs) and **APIs** for service meshes.

Users can define applications that use service mesh technology without tightly binding to any specific implementation. Read more about [smi specifications](https://smi-spec.io){target=_blank}.

#### Traffic Specs API

Allow you to **define routes** that an app can use.

For example,

```yaml
kind: HTTPRouteGroup
metadata:
  name: m-routes
spec:
  matches:
  - name: metrics
    pathRegex: "/metrics"
    methods:
    - GET
```

defines a `HTTPRouteGroup` resource named m-routes, which will match on any HTTP GET request the app sees with the string "/metrics" in its path. By itself it doesn't do anything for the matched requests, other resources are responsible for acting on them.

#### Traffic Split API

Allow you to implement **traffic splitting** and **traffic shifting** methods like `A/B testing`, `blue-green deployment`, and `canary deployment`.

For example,

```yaml
kind: TrafficSplit
metadata:
  name: e8-feature-test
  namespace: e8app
spec:
  service: e8-widget-svc
  backends:
  - service: e8-widget-svc-current
    weight: 75
  - service: e8-widget-svc-patch
    weight: 25
```

Specify services under `backends` and give them `weights` for amount of traffic shed to them. The weights are not percentage, but the number over their total gives exact percentage (25-75 is the same as 1-3, or 250-750). It will be easier to make sure they add up to 100, or 1000.

#### Traffic Access Control API

Allow you to set **access control policies** for **pod-to-pod** (**service proxy to service proxy**) communications based on service proxy **identity**. By default ALL traffic is **denied** and need to explicitly grant permission for types of traffic to allow.

For example,

```yaml
kind: TrafficTarget
metadata:
  name: path-specific
  namespace: default
spec:
  destination:
  - kind: ServiceAccount
    name: service-a
    namespace: default
    port: 8080
  rules:
  - kind: HTTPRouteGroup
    name: m-routes
    matches:
    - metrics
  sources:
  - kind: ServiceAccount
  name: prometheus
  namespace: default
```

The `rules` defines the characteristics the source traffic must have in order to be allowed to reach its destination.

#### Traffic Metrics API

Allow you to **collect metrics** on HTTP traffic and make those metrics available to other tools. Each metric involves a Kubernetes resource and limited to a particular source or destination (aka edge).

For example,

```yaml
kind: TrafficMetrics
# See ObjectReference v1 core for full spec
resource: # source of traffic
  name: foo-775b9cbd88-ntxsl
  namespace: foobar
  kind: Pod
edge: # destination of traffic
  direction: to
  side: client
  resource:
    name: baz-577db7d977-lsk2q
    namespace: foobar
    kind: Pod
timestamp: 2019-04-08T22:25:55Z
window: 30s
metrics:
- name: p99_response_latency
  unit: seconds
  value: 10m
- name: p90_response_latency
  unit: seconds
  value: 10m
- name: p50_response_latency
  unit: seconds
  value: 10m
- name: success_count
  value: 100
- name: failure_count
  value: 100
```

### Debug and Mitigate App Failures

#### Service Mesh Status Checks

Check of the status of the service mesh components first, some app failures you are seeing may actually be caused by a problem in service mesh.

This can be done with the service mesh's cli tool. For example, `linkerd check` does following checks:

- Can the service mesh communicate with Kubernetes?
- Is the Kubernetes version compatible with the service mesh version?
- Is the service mesh installed and running?
- Is the service mesh's control plane properly configured?
- Are the service mesh's credentials valid and up to date?
- Is the API for the control plane running and ready?
- Is the service mesh installation up to date?
- Is the service mesh control plane up to date?

And `linkerd check --proxy` checks more things:

- Are the credentials for each of the data plane proxies valid and up to date?
- Are the data plane proxies running and working fine?

#### Service Route Metrics

Check service app route metrics. Viewing the metrics for each route can indicate where slowdowns or failures are occurring within the mesh and narrow down the problem.

#### Request Logging

Log individual requests and responses. Be causcious that log data can grow very large rapidly, selectively log requests may help.

#### Service Proxy Logging

Configure the service proxy to record more events or record more details about each event. Be causcious as it may degrade the proxy's performance and also generate massive amount of logs.

#### Inject Debug Container

Have your service mesh inject a debug container into bad pod. Debug container (debug sidecar) is designed to monitor the activity within the pod and to collect information on that activity, such as capturing network packets.

#### Telepresence Tool

Using Telepresence, you can run a single process (a service or debug tool) locally, and a two-way network proxy enables that local service to effectively operate as part of the remote Kubernetes cluster. Telepresence is also intended for use in testing or staging.

