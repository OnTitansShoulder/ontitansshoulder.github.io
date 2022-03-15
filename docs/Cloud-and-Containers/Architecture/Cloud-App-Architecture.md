---
layout: note_page
title: Cloud Application Architectures
title_short: cloud_app_architecture
dateStr: 2022-04-01
category: Design-Pattern
tags: notes reference check
---

This notes is taken from [Microsoft Azure Architecture Center](https://docs.microsoft.com/en-us/azure/architecture/){target=_blank}. These principles still apply to any cloud applications not just limited to Azure.

## Architecture styles

An architecture style is a family of architectures that share certain characteristics.

An architecture style places constraints on the design, including the set of elements that can appear and the allowed relationships between those elements.

Before choosing an architecture style, make sure that you understand the underlying principles and constraints of that style. Otherwise, you can end up with a design that conforms to the style at a superficial level, but does not achieve the full potential of that style. It's also important to be pragmatic. Sometimes it's better to relax a constraint, rather than insist on architectural purity.

### Weigh the tradeoffs

Constraints also create challenges, so it's important to understand the trade-offs when adopting any of these styles.

Some main challenges to consider:

- Complexity - is the style too simplistic or too complex for your domain? Is it managable?
- Asynchronous messaging and eventual consistency - is eventual consistency guaranteed? Any possiblity for lost message or duplicated messages?
- Inter-service communication - how much overall latency will be increased from the separated components? Will there be network congestion?
- Manageability - how hard to monitor, deploy, extend the app?

## Common Styles

### N-tier

<img src="https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/images/n-tier-logical.svg" />

**N-tier** - a traditional architecture for enterprise apps, where dependencies are managed by dividing the application into **layers** that perform **logical functions**, such as presentation, business logic, and data access.

Layers is a way to separate **responsibilities** and manage **dependencies**. A layer can only call into layers that **sit below** it, which makes it hard to introduce changes in one part of the application without touching the rest of the application.

Tiers are **physically** separated, running on separate machines. A tier can call to another tier directly, or use asynchronous messaging (message queue). Several layers might be hosted on the same tier.

Physically separating the tiers improves **scalability** and **resiliency**, but also adds **latency**.

N-tier is most often seen in infrastructure as a service (IaaS) solutions.

An N-tier application can have a **closed** layer architecture (a layer can only call the next layer immediately down) or an **open** layer architecture (a layer can call any of the layers below it).

Benefits:

- portabilityp
- simplicity in design

Challenges:

- largely monolithic design prevents independent deployment of features

Best practices:

- avoid a middle layer that only does CRUD operations to data tier which adds latency
- use autoscaling to handle load changes
- use asynchronous messaging to decouple tiers
- cache semistatic data
- make database tier highly available
- place Web Application Firewall (WAF) between frontend and the Internet to block abuse
- place each tier in its subnet and use subnets as a security boundary
- restrict data tier to only middle tier

### Web-Queue-Worker

<img src="https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/images/web-queue-worker-logical.svg" />

A **Web-Queue-Worker** app has a web frontend that handles HTTP **requests** and a backend worker that performs CPU-intensive tasks or long-running operations. The front end communicates to the worker through an **asynchronous message queue**.

Other components that can be commonly incorporated:

- database
- cache
- CDN
- remote service
- identity provider for authentication

The web frontend and worker should be **stateless**. Session state can be stored in a distributed cache. Any **long-running** or **resource-intensive** work is done by the worker asynchronously through active poll or periodical batch-processing, otherwise the worker is **optional**.

The frontend and the worker can easily become large, monolithic components, and involves complex dependencies, which makes it hard to maintain and update.

Benefits:

- simplicity in design, deploy, and manage
- separation of concerns
- good scalability for the decoupled componets

Challenges:

- components can still get large and monolithic, making it hard to maintain and update
- hidden dependencies in terms of data schemas or modules for communication

Best practices:

- expose a well-designed API to client
- use autoscaling to handle load changes
- cache semistatic data
- use a CDN to host static content
- partition data to improve scalability, reduce contention, and optimize performance

### Microservices

<img src="https://docs.microsoft.com/en-us/azure/architecture/includes/images/microservices-logical.png" />

A **microservice** app is composed of many small, **independent** services. Each service implements a **single** business capability. Services are **loosely coupled**, communicating through API **contracts**.

Each service can be built by a small, focused development team. Individual services can be deployed without a lot of coordination between teams, which encourages **frequent updates**. Services are responsible for persisting their own data or external state.

However, this architecture is more complex to build and manage and requires a mature development and DevOps culture. Done right, this style can lead to **higher release velocity, faster innovation, and a more resilient architecture**.

**Management/orchestration** component is responsible for placing services on nodes, identifying failures, and rebalancing services across nodes. For example, Kubernetes, and certain public cloud services.

**API Gateway** - the entry point for clients which forwards the call to the appropriate services on the back end.

Benefits:

- Agile development
- Small, focused teams for each service
- Small code base on each service
- Mix of technologies, some services can be built with different stacks
- Fault isolation, some services failure will not bring down the whole service
- Better scalability, independent scaling
- Data isolation, each service owns its data. But common schema changes are tricky.

Challenges:

- Complexity, more moving parts and need to make sure they work in harmony
- Development and testing, hard to test service dependencies
- Lack of goverance, may end up with things built with different stacks and styles and making it harder to maintain and see the entire picture
- Network congestion and latency, more components lead to more inter-service communication. Reduce unnecessary calls, use more efficient serialization formats, and switch to asynchronous communication patterns helps
- Data integrity, data consistency can become a problem as each service keeps its own state
- Management, logging and tracing, DevOps
- Versioning, potential backward or forward compatibility
- Skill set for building highly distributed systems

Best practices:

- Decentralize as much as possible
- API should be designed around the business domain
- offload auth and SSL termination to the Gateway
- The gateway should handle and route client requests without any knowledge of the business rules or domain logic

### Event-driven

<img src="https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/images/event-driven.svg" />

An application of **event-driven** architecture use a **publish-subscribe** (pub-sub) model, where **producers** publish events, and **consumers** subscribe to them. The producers are independent from the consumers, and consumers are **independent** from each other.

Events are delivered in near real time, so consumers can respond immediately to events as they occur, and every consumer sees all of the events.

This architecture is good for apps that ingest and process large volume of data with low latency, or when multiple different subsystems must perform different types of processing on the same event data. Two Event-driven architecture variations:

- The **Pub/Sub** model - sends published events to each subscriber and the events cannot be replayed and new subscribers do not see past events.
- The **Event streaming** model - writes events to a log and keeps the events strictly ordered and persistent. Consumers can read from any part of the stream and is responsible for advancing its position in the stream. A consumer can join any time and replay past events.

Three common consumer variations:

- Simple event processing, each event immediately triggers an action
- complex event processing, the consumer processes a series of events to look for a pattern, like aggregation over sliding time windows
- event stream processing, use a pipeline to ingest events and to process or transform the stream. Good for IoT workloads.

Benefits:

- decoupled design of producers and consumers
- easy to add or remove consumers
- consumers respond to events immediately
- highly scalable and distributed
- consumers can have independent view of the event stream

Challenges:

- Guaranteed delivery is essential
- Process events in order or exactly once can be hard to guarantee

Best practices:

- Each event can pact more data to reduce event conjestion, performance and cost

Another great read about Event-driven design https://particular.net/blog/putting-your-events-on-a-diet

### Big Data/Compute

**Big data** and **Big Compute** are specialized architecture for workloads that fit certain specific profiles. 

Big data **divides** a very large dataset into chunks, performing **parallel processing** across the entire set, for analysis and reporting.

Big compute, aka high-performance computing (HPC), makes parallel computations across a large number (thousands) of cores, mostly used on simulations, modeling, rendering.

