---
layout: note_page
title: DevOps and SRE
title_short: devops_sre
dateStr: 2021-11-01
category: Linux
tags: notes cheatsheet check
---

LF Course https://learning.edx.org/course/course-v1:LinuxFoundationX+LFS162x+3T2019

## DevOps Today

Reliability, Availability, Scalability, Observability

Five Pillars of DevOps: Cloud, Container, CI/CD, Infrastructure as Code, Observability

### Cloud

Major cloud providers: Google Cloud, Microsoft Azure, Amazon AWS

Major cloud orchestration engins: Kubernetes, Docker - Swarm, Mesos - Marathon

#### Benefits from Cloud

Utility Computing Model - use as much of infrastructure that we want, and pay at the end of the month to the cloud provider, just like the utility providers.

Plus, you get access to the global infrastructure. Without the cloud that would be very expensive and time-consuming.

The platform itself that you host your infrastructure on is scalable

OPEX versus CAPEX: capital expenses versus operational expenses; your finance team would definitely love the operational expenses model than the capital expenses.

Business continuity, benefits from the multi-region datacenters available to you.

Managed services. No headaches from setting up, configuring and managing, automating on services such as a database cluster that needs backups, high avilability, scalability. Especially useful when your team is small.

Automation out-of-box.

#### Types of Cloud

With Infrastructure as a Service, what you can get from a service provider is the infrastructure components, like compute, network, storage, and databases.

With Platform as a Service, what you get is basically a deployed application, it scales on its own as well, and you don't have a control over it and you may not need it.

With Service as a Service, what you get is purely services that offers certain functionalities to consume for your service.

#### Cloud deployment models

**Public cloud**, rely entirely on IaaS - You could start with an idea, build your application, just go live, and serve your global customers within hours. It accelerated the growth of the startup world in general.

**Private cloud** is what you build in-house or in the datacenter that you control, which can be completely private or exposed to outside. You get a self-service ability, automation, self-provisioning capacity, dynamic capacity in certain cases. Tools like OpenStack help you build your own private cloud platform.

**Hybrid cloud**, for organizations who have their own datacenters and who have been running their own cloud in-house that is a private cloud, still need some capacity in certain cases, such as content delivery network (CDN), or bursting traffic.

#### Major Cloud Services

Block Storage - provision disks spaces, usually large storage space

Object Storage - also disks to attach to, mostly store files or objects for connect and retrival

Network Service - virtual network services in a multi-tenant environment, especially from the security and customization point of view, ability to set firewall, divide network into subnets, provision public IP, etc.

User Access Management (IAM) - manages who can access the resources

### Container

Major container technologies: Docker, runc

Container technology like Docker defines a standard for creating and running the containers, so that it can be used anywhere that this standard is adopted.

So, what appears as a container and what separates one container from another is a bunch of namespaces. Only those things are virtualized; everything else is from the system. The container is sharing the kernel with the system here, and it's just running a process, just like a process running on your system, but in an isolated environment.

Cgroups, from Google's contribution, offer resource isolation through control groups

A Docker image differs from a VM image in that it is layered, while VM is not.

What an orchestration engine like Kubernetes offer:

- scheduling containers
- networking for accessing containers
- high availability of containers by auto scaling
- security:
    - network policies
    - scanning images
- admission control, athentication and authorization
- controller for different workloads
- extensibility through CRDs

### Infra as Code

Major IaC tools: Ansible, Chef, Terraform

With Infrastructure as Code, you manage infrastructure configurations and states through a centralized management system using the language it understands.

Infra as Code allows you to template things, reuse, reproduce, and automate.

#### Categories

**VM provisioning** - with tools like Vagrant, configure VM of certain resources; with a tool like Packer, create a template and define the process of building your image as a code.

**Cloud provisioning** - provision VMs running in a managed environment along with virtual private networks, network components, virtual private clouds, the security components. Tools available such as Cloudformation for AWS, Terraform as a generic tool, and Ansible

**Configuration management** - configure the system further such as user creation, package management, package installation, application configuration. Popular tools are Chef, Puppet, Ansible, and SaltStack. Application configs are mostly baked within the containers nowadays, though

**container provisioning** - deploy container-based apps, with tools like Docker Compose or Kubernetes YAML configs.

**CICD provisioning** - define pipelines as code, notable ones are Jenkins's Jenkinsfile, Docker's Dockerfile and Docker-compose file, Vagrant's Vagrantfile, Spinnaker's YAML file.

#### Features

**Declarative syntax** - simply put, you define what you want and let the tool handle "how" to get there. It provides an abstracted or simplified language.

**Ability to store as code** - the config can be easily stored in a version-control system like git, and benefit from IDE's autocompletion, tools that lint syntax.

**Idempotence** - the same code applied and achieve the same thing, and the tool is smart enough to figure out the differences to apply the changes. It manages the state from code, by comparing the declarative code with the code from current state, and appropriate action is chosen based on the current state.

**Self-document** - the code is mostly written in a readable and simple language, human-friendly. It saves effort on explaning a lot of things.

**Templating** - the code can be generalized through templating to improve reusability.

### CI/CD

Major CI/CD orchestrators: Jenkins, Spinnaker, Travis CI, Circle CI

Continuous Integration pipeline allows many developers to work in parallel and push for integrations. It also gives quick and immediate feedback from tests, builds, and integrations for each commit merged, thus continuously and iteratively improve the quality of software.

Continuous Integration helps find bugs early and fail early. Read on paper `Simple Testing Can Prevent Most Critical Failures; An Analysis of Production Failures in Distributed Data-Intensive Systems`.

Static code analysis like SonarQube, and Canary deployment and analysis are also effective tools to add to the pipeline. Other kinds of tests such as acceptance tests, load tests, compliance tests, and chaos tests, are optional but ideal to add as well.

The end goal is to ensure reliability before releasing to production.

Agile is the fundamental practice that you start with in order to incorporate Continuous Integration.

Another practice is to make builds quick. This becomes harder as you go up the testing pyramid, say, those integration tests that are expensive to run. And to fight that, you should add a unit test every time some integration test catches a bug, to _shift left_ in the testing pyramid.

In terms of Continuous Delivery, Spinnaker is a very useful automated deployment tool that supports multiple cloud platforms. It does not replace Jenkins, but rather extends it to achieve Continuous Delivery.

#### Release Strategies

Release with downtime by scheduled release that shuts users off when applying and configuring the update.

Release with zero downtime by performing a rolling update and apply patches in batches. Chances are that the customers will see different versions of the application during this update.

Blue/green release requires extra hardware capacity to bring up a set of v2 servers in stand by, then tell load balancer to switch all new traffic to the v2 servers and take down v1 servers to allow next update.

Canary release aims updating only part of your servers to v2, let some beta customers get directed here. In other words, it is a test-in-production strategy. Additionally, canary analysis, aka A/B testing, can be performed between v1 and v2.

Another release strategy is feature flagging. You first rolling deploy the new features turned off, then enable the feature by switching it on that reconfigure all servers to serve. A great advantage is that rollback is quick and easy.

### Observailibity

Major observailibity tools: Nagios, Prometheus (Time-series DB) and Grafana (Visualizer), Jaeger (Traces), Zipkin (traces)

Getting the metric-measuring done is a very important aspect of observability. It helps improve existing system and troubleshoot issues.

Metrics (system resource, network, application health), logs, and traces are what to observe.

The ELK stack - Elasticsearch, Logstash, and Kibana, is a very popular stack in opensource world.

#### SLA SLO SLI

**SLA - Service Level Aggrement** - a contract between the service providers and their clients, which defines a guarantee that the service infrastructure will be up and the services will be functional. i.e. a 99% SLA gives the provider some room of downtime for maintenance.

When SLA is breached, you have an outage. It is a strict aggrement.

To ensure you can guarantee the SLA, you can use a tighter **Internal SLA**, now it is called a **SLO - Service Level Objective**, which give you some buffer for guarantee the SLA.

To know whether you comply with SLA or SLO, measure the service uptime, latencies, number of requests, number of errors, etc. And they will be your **SLI - Service Level Indicators** 

## DevOps Future

K8s stays strong. Service Mesh is new thing (Istio, Linkerd). Canary Releases and Canary Analyses integration in CI/CD pipelines. Intelligent routing, send certain traffic for certain users. Redirect or mirror prod traffic to staging for testing. Faults injection for Chaos testing.
