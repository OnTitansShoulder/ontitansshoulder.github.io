---
layout: note_page
title: Why Latency Matters
title_short: why_latency_matters
dateStr: 2020-07-01
category: Case-Study
tags: notes case-study check
---
This notes it taken from an article on [High Scalability](http://highscalability.com/blog/2009/7/25/latency-is-everywhere-and-it-costs-you-sales-how-to-crush-it.html)

Latency matters. Amazon found every 100ms of latency cost them 1% in sales. Google found an extra .5 seconds in search page generation time dropped traffic by 20%. A broker could lose $4 million in revenues per millisecond if their electronic trading platform is 5 milliseconds behind the competition.

The less interactive a site becomes the more likely users are to click away and do something else. Slow sites generally lead to higher customer defection rates, which lead to lower conversation rates, which results in lower sales.

Low-latency and high-latency are relative terms. A system has low-latency if it's low enough to meet requirements, otherwise it's a high-latency system.

> If you have a network link with low bandwidth then it's an easy matter of putting several in parallel to make a combined link with higher bandwidth, but if you have a network link with bad latency then no amount of money can turn any number of them into a link with good latency.
> --Stuart Cheshire

**Possible sources of latency**:
- low level infrastructure - OS, CPU, Memory, Storage I/O, Network I/O
- high level infrastructure - DNS, TCP, Web server, network links, routers
  - in most cases, half of time is spent from the network hops; the bottleneck is the Internet itself
  - incentive for edge-computing, putting servers closer to users
- software processing - the server's code processing time limited by the speed of the processor and the level of optimization of the software after compilation
  - algorithm and logic plays a big part
- frontend - to process the backend response and display accordingly for the user to see can take time
  - very important, as the end-user response time takes up to 80% of the time
  - most likely speeding up the frontend is more effective than the backend
- service dependency latency - more dependent components increase latency
- propagation latency - the speed at which data travels through the link at physical layer
  - every 20km adds about 100ms propagation latency
- transmission latency - the speed at which data is transmitted on a communication link
  - not related to distance; more like the transmission speed limited by the hardware (or how much paid)
- geographical distribution - BCP requires running in multiple datacenters and add WAN latency constraints
- messaging latency - Intermediaries, Garbage Collection, Retransmissions, Reordering, Batching, CPU Scheduling, Socket Buffers, Network Queuing, Network Access Control, Serialization.

If we want to increase interactivity we have to address every component in the system that introduces latency and minimize or remove it's contribution.

As latency increases work stays queued at all levels of the system which puts stress everywhere. **Some of the problems caused by higher latency**: Queues grow; Memory grows; Timeouts cascade; Memory grows; Paging increases; Retries cascade; State machines reset; Locks are held longer; Threads block; Deadlock occurs; Predictability declines; Throughput declines; Messages drop; Quality plummets. That's how it costs sells and bad user-experiences.

The general algorithm for **managing latency**:
- continually map, monitor, and characterize all sources of latency
- remove and/or minimize all latency sources that are found
- target your latency slimming efforts where it matters the most

Dan Pritchett's Lessons for Managing Latency
- Create Loosely Couple Components
  - failure at one place won't fail the whole system or other components
  - can be independently scaled and engineered for latency
- Use Asynchronous Interfaces
  - set expectation of asynchronous behavior between components
  - synchronous low-latency interactions doesn't allow architecture flexibility
- Horizontally Scale from the Start
  - will be easier to scale later, when the system grows
- Create an Active/Active Architecture
  - differs from typical BCP approach (active/backup, aka hot/warm)
  - all data centers operate simultaneously
    - users are served from the closest data center
    - much lower latency for all users
- Use a BASE (basically available, soft state, eventually consistent) instead of ACID (atomicity, consistency, isolation, durability) Shared Storage Model
  - more tolerant to latency
  - makes one update to one partition and return
  - no latency from coordinating a transaction across multiple database servers

> Database services cannot ensure all three of the following properties at once: Consistency, Availability, Partition tolerance
> --The CAP Theorem

**Latency Reduction Ideas**
- Use Application-level Caches
  - each app instance serves out of cache unless misses
  - need time to warm up the cache for new app instances
- Use a CDN to distribute some contents
  - better speed and latency for users everywhere around the world
- Use Caching Proxy Server(s)
  - each app instance call the cache proxy server to get expensive contents
- Optimize Virtual Machines
  - virtualized I/O can suffer a substantial performance penalty
- Use Ajax to minimize perceived latency to the user
  - clever UI design can make a site feel faster than it really is
- Optimize firewalls
- Use Small Memory Chunks When Using Java
  - GC in Java kills latency
  - use more VMs and less memory in each VM instead of VM with a lot of memory, avoids large GC

**Some Suggestions on Server Architecture to Reduce Latency**
- Stop Serializing/Deserializing Messages
  - leave messages in a binary compressed format and decode only on access
- Load Balance Across Read Replicas
  - the more copies of objects you have the more work you can perform in parallel
  - consider keeping objects replicas for both high availability and high scalability
- Don't Block
  - block for any reason and your performance tanks because not only do you incur the latency of the operation but there's added rescheduling latency as well
- Minimize Memory Paging
  - avoid memory thrashing
  - difficult to achieve
- Minimize/Remove locking
  - locks add latency and variability to a processing pipeline
- Colocate Application
  - servers adds less latency when communicating with each other
  - use a cloud
