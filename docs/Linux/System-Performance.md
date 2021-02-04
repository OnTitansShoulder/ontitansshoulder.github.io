---
layout: note_page
title: System Performance
title_short: system_perf
dateStr: 2020-11-01
category: System
tags: notes reference check
---
This set of notes is taken from the book Systems Performance: Enterprise and the Cloud by Brendan Gregg.

## Introduction

**Systems performance** is the study of the entire system, including all physical hardware components and the full software stack.

Systems performance as an activity can be done by a variety of **roles**, including system administrators, support staff, application developers, database administrators, and web administrators. 

For some performance issues, finding the root cause requires a cooperative effort from these teams. The ideal steps of a system performance analysis activities:

1. Setting performance objectives and performance modeling
2. Performance characterization of prototype software or hardware
3. Performance analysis of development code, pre-integration
4. Performing non-regression testing of software builds, pre- or post-release
5. Benchmarking/benchmarketing for software releases
6. Proof-of-concept testing in the target environment
7. Configuration optimization for production deployment
8. Monitoring of running production software
9. Performance analysis of issues

Technology disciplines tend to be objective, performance, on the other hand, is often subjective. Subjectivity can be made objective by defining clear goals, such as having a target average response time, or requiring a percentage of requests to fall within a certain latency range.

Performance can be a challenging discipline due to the complexity of systems and the lack of a clear starting point for analysis.

Performance issues may also originate from complex interactions between subsystems that perform well when analyzed in isolation, due to cascading failure.

Bottlenecks can also be complex and related in unexpected ways; fixing one may simply move the bottleneck elsewhere in the system.

Performance issues may be caused by a complex characteristic of the production workload and is not reproducible in a lab environment.

A system can have many performance issues and it is difficult to identify the issue that matter the most.

A metric well suited to performance quantification, when available, is latency. High latency can cause frustration, and customers may take their business elsewhere.

Dynamic tracing allows all software to be instrumented, live and in production. It is a technique of taking in-memory CPU instructions and dynamically building instrumentation upon them. This allows custom performance statistics to be created from any running software, providing observability far beyond what the baked-in statistics provide.

Cloud computing needs performance improvement to achieve immediate cost savings because most cloud services are charging by hours.

## Methodology

It is a capital mistake to theorize before one has data. Insensibly one begins to twist facts to suit theories, instead of theories to suit facts.

### Terminologies

- IOPS - rate of data transfer operations. i.e. disk read/write per second
- Throughput - rate of work performed. i.e. data transfer rate in bytes/bits per second; database transactions per second
- Response time - time for an operation to complete, include idle time and service time
- Latency - time an operation spend waiting to be serviced
- Utilization - how busy a resource is. i.e. memory utilization
    - Resource Utilization = Time Busy / Duration
    - Resource Utilization = Capacity Busy / Total Capacity
- Saturation - how much work has queued on a resource
    - start occur at 100% utilization (capacity-based)
- Bottleneck - the resource that limits the performance of the system
- Workload - input/load applied to the system
- Profiling - build a picture of a target that can be studied and understood
- Cache - fast storage to buffer a limited amount of data
    - runtime = (hit rate x hit latency) + (miss rate x miss latency)
    - Cache management algorithms
        - Most recently used (MRU)
        - Least recently used (LRU)
        - Most frequently used (MFU)
        - Least frequently used (LFU)
- System under Test - perturbations (interference) can affect performance test results
    - i.e. scheduled system activity, other users of the system, other workloads, other operations on the physical host
    - perturbations are hard to determine and may come from many components

### Perspectives

Resource analysis

- Analyzes the system resources: CPU, memory, disks, network interfaces, busses, and interconnects
- Usually done by system administrators
    - Performance issue investigations
    - Capacity planning
- Best suited for: IOPS, Throughput, Utilization, Saturation
- tools: vmstat(1), iostat(1), mpstat(1)

Workload analysis
- Examines the performance of the applications, apply workload and see how application responds
- Usually done by developers and support staff
    - Requests, send in traffic
    - Latency, measure response time of application
    - Completion, measure error rate
- Best suited for: Throughput, Latency

### Methodologies

**Streetlight Anti-Method**

Analyzes performance by choosing observability tools that are familiar, found on the Internet, or just random to see if anything obvious shows up.

It will be slow. It may find issues but not the target issue.

**Random Change Anti-Method**

Randomly guesses where the problem may be and then changes things until it goes away.

It will be time-consuming and leave tuning that won't be appropriate in the long term. It may even cause worse problems.

**Blam-Someone-Else Anti-Method**

Instead of investigating performance issues, the user of this methodology makes them someone else’s problem.

Wasteful of everyone's resources.

**Ad Hoc Checklist Method**

Stepping through a canned checklist is a common methodology used by support professionals when asked to check and tune a system.

While these checklists can provide the most value in the shortest time frame, they are point-in-time recommendations and need frequent refreshing.

**Problem Statement**

Define the problem statement. Helpful questions to ask:

1. What makes you think there is a performance problem?
2. Has this system ever performed well?
3. What changed recently? Software? Hardware? Load?
4. Can the problem be expressed in terms of latency or runtime?
5. Does the problem affect other people or applications (or is it just you)?
6. What is the environment? What software and hardware are used? Versions? Configuration?

**Scientific Method**

The scientific method studies the unknown by making hypotheses and then testing them.

Question - Hypothesis - Prediction - Test - Analysis

**Diagnosis Cycle**

Deliberately tests a hypothesis through the collection of data.

hypothesis - instrumentation - data - hypothesis

**Tools Method**

Three-step approach showing which tool to run, which metrics to read, and how to interpret them:

1. List available performance tools
2. List useful metrics to collect from each tool
3. List possible rules for interpretation for each metric

**The USE Method**

Utilization, Saturation, and Errors (USE) method should be used early in a performance investigation, to identify systemic bottlenecks for each resource.