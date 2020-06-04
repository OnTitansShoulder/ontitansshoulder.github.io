---
layout: note_page
title: Beginner Guide to System Design
title_short: system_design_guide
dateStr: 2020-06-01
category: Reading-Notes
tags: notes reading_notes reference check
---
### Beginner Guide to System Design

<br/>
#### Characteristics of Distributed System

- Scalability, Reliability, Availability, Efficiency, and Manageability.

**Design a large system**
1. different architectural pieces can be used
2. how these pieces work with each other
3. how to best utilize these pieces, what are trade-offs

**Scalability**
- capability of a system, process, or network to grow and manage increased demand.
  - increased data vol, increased work amount, increased work load...
  - ensure performance
- horizontal scaling: adding more servers into pool of resources. easier and dynamical
- vertical scaling: adding more power (CPU, RAM, Storage, etc.) to existing servers. requires downtime and having an upper limit

**Reliability**
- probability a system will fail in a given period. keeping delivering services even when some components fail.
- achieves thru redundancy, both software and data
- comes at a cost on removing single point of failure.

**Availability**
- the time/percentage a system remains operational to perform required function.
  - when taking down, or failed, considered unavailable during that time
- Reliability is availability over time
- availability - not necessarily reliable. reliable -> available

**Efficiency**
- Two standard measures of efficiency:
  - response time (latency), delay to obtain resp
  - throughput (bandwidth), numb of delivery in a given time unit

**Serviceability or Manageability**
- how to operate and maintain
  - ease of diagnosing problems, ease of updating, how to operate, etc.
  - auto failure detection can decrease or avoid system downtime

<br/>
#### CAP Theorem

> It is impossible for distributed system to simultaneously provide more than two of: Consistency, Availability, and Partition tolerance.

- Consistency: all nodes see the same data at the same time
  - achieved by updating nodes before further reads
- Availability: every request gets a response on success/failure; system continues function even with node failures
  - by replicating data across servers
- Partition tolerance: system continues to work despite message loss or partial failure.
  - survive network failures that doesn't fail entire network

<br/>
#### Caching

- locality of ref principle: recently request data likely accessed again
- can be at all levels in an architecture, mostly found close to front-end

**App Server cache**
- place local storage on a request layer node
- quickly return local cached data if exists, else query db
- for the case of LB, use global caches or distributed caches

**Distributed cache**
- cache is divided using consistent hashing function, so a node can quickly know where to look for data existence in a dist cache.
- advantage: ease of adding nodes to expand cache space
- disadvantage: missing node; sol multiple copies of data on diff nodes

**Global cache**
- all nodes use single cache space. need a server dedicated for this. no good as # of requests inc
- two forms, on cache miss either: server fetch from DB, or request nodes fetch from DB

**Content Distribution Network (CDN)**
- for sites serving large amounts of static media
- server does query on miss
- can use Nginx (a light w HTTP server) for your app

**Cache Invalidation**
- data modified in DB should be invalidated in cache:
1. Write-through cache: data written into cache & DB at same time. (higher latency, write 2ice)
2. Write-around cache: data written to DB only. When accessed, must query DB
3. Write-back cache: data written to cache first, then write back to DB in an interval/cond. risk of data loss in crash of cache node

**Cache eviction policies**
1. First In First Out
2. Last In First Out
3. Least Recently Used
4. Most Recently Used
5. Least Frequently Used
6. Random Replacement

<br/>
#### Indexes

- well-known DB indexing, improves queries performance
  - index on a table makes it faster to search through the table and find the rows desired
- provides sorted list of data that is easily searchable by relevant info
  - index is a data structure that points to location where data lives
- disadvantage: slower to add rows or updates/delete rows, because the need to update the index.
  - better read performance, worse write performance
  - unnecessary indexes should be avoided/removed

<br/>
#### Consistent Hashing

- Distributed Hash Table (DHT): key, value, hash function
  - index = hash_function(key)

**'key % n' hashing approach**
- drawbacks:
  1. not horizontally scalability. new cache host adding to system requires re-hash all existing mappings
  2. may not be load balanced, especially non-uniformly distributed data (some caches busy while others idle)

**Consistent Hashing definition**
- allows distributing data across a cluster and minimize reorganization when nodes are added/removed
  - easier scale up/down caching system
- when hash table resized, only k/n keys need to be remapped (k = total keys, n = total numb of servers)
  1. Given a list of cache servers, hash them to integers in the range
  2. map a key to a server
    - Hash it to a single integer
    - Move clockwise on the ring until finding the first cache it encounters
    - That cache is the one contains the key
  3. add a cache server on the ring, causing the portion of keys previously mapping to next server map to this new server, and removed from the next server
  4. removing a cache server on the ring, causing the keys mapping to this one mapping to next server on the ring
  5. Virtual replicas of the servers on the ring, enables more evenly distributed keys to each server, and remains distributed when servers being added/removed from the ring

<br/>
#### Long-Polling vs. Web Sockets vs. Server-Sent Events

all are popular and common protocols between client and web server.

**Ajax Polling**
- client repeatedly polls a server for data.
  1. client opens a connection & request data from server
  2. request page sends requests to server at regular intervals
  3. server calculate resp and sends back
  4. client repeated 1-3 periodically to get updates from server
- problem: many requests could be empty data and creating HTTP overhead

**HTTP Long-Polling**
- aka. "Hanging GET", client requests expected that server may not resp immediately
  - server holds client request if no data available, then sends it when it becomes available.
  - client sends new request immediately follows receiving the resp, to make sure server can always push updated data to client immediately when its available.
  - Long-Polling request can be timeout so new request has to be sent when previous one timeouts.

**Web Sockets**
- use handshake to establish persistent connection so both can exchange data in both direction any time.
- two-way ongoing conversation can take place b/w two machines.

**Server-Sent Events (SSEs)**
- use a persistent long-term connection b/w client and server. Server can send data to client any time, but not client to server, which requires separate Http connection.
- best when need real-traffic from server to client or when server is generating data in a loop to be sent to client.

<br/>
#### Queues

- manage requests in large-scale distributed system. high performance requires different components work asynchronously thru queues.
- provide some protection from service outages and failures. retry service requests that failed
- implemented on asynchronous common protocol, client get Acknowledgement when request received, serves as a reference for the results of work when client requires it.
- open source tools like (RabbitMQ, ZeroMQ, Active MQ, & BeanstalkD)

<br/>
#### Proxy

- intermediary piece of hardware/software b/w client & back-end server.
  - receives requests, relays to servers
- typically used to filter requests, log requests, transform requests (add/remove headers, encryption/decryption, compression).
- cache can serve lots of requests.
- coordinating requests, optimize request traffic. (ex. collapse similar data access into one "collapsed forwarding")
- particularly useful when under high load or have limited caching available (batch several requests into one)

<br/>
#### Load Balancing (LB)

- spread traffic across a cluster of servers
  - improves responsiveness & availability of app, web, or db
- keeps track of resource status
  - stop distribute to failed server immediately
- sits between client & server, balancing app requests
  - reduces individual server load, prevents single pt of failure
  - detects bottlenecks before they happen

**Three places for LB**
1. b/w user & web servers
2. b/w web servers & internal platform layer (ex. app servers or cache servers)
3. b/w internal platform layer and db

**LB algorithms**
- Prerequisite: Health Checks: keep list of alive and healthy server. remove unresponsive servers
  - Least Connection: fewest active connections
  - Least Response Time: fewest active connections & lowest avg resp time
  - Least bandwidth: serving least amount of traffic in Mbps
  - Round Robin: cycles thru list of servers, good for equal spec servers & non-persist connections
  - Weighted Round Robin: each server assigned a weight (processing capacity), higher weight get new connections first and more connections
  - IP Hash: calculate hash of client IP to assign server

**Redundant LB**
- multi-LB setup, each monitors health of the others, one active, one passive(s)
  - in case of active LB failure, another one takes over and becomes active one

**Ways to implement LB**
- Smart Clients:
  - client take a pool of service hosts and balances load across them
  - detect failed hosts and recovered hosts, adding new hosts
- Hardware LB:
  - most expensive, high performance (ex. Citrix NetScaler)
- Software LB:
  - (ex. HAProxy)

<br/>
#### SQL vs. NoSQL

**SQL**
- Relational DB has predefined schemas, structured
- stores data in rows and columns, each row about one entity, columns being data points

**NoSQL**
- Non-relational DB are unstructured, distributed, and have dynamic schema.
1. Key-Value Stores:
  - data stored in an array of key-value pairs (ex. Redis, Voldemort, Dynamo)
2. Document Databases:
  - data stored in documents, & docs are grouped together in collections
  - each doc can have different structure (ex. CouchDB, MongoDB)
3. Wide-Column Databases:
  - column families, containers for rows.
  - no need to know all columns up front, each row unnecessary same numb of columns.
  - good for aanalyzing large daatasets (ex. Cassandra, HBase)
4. Graph Databases:
  - data relations represented in a graph
  - nodes (entities), properties (entity info), & lines (entities connections). (ex. Neo4J, InfiniteGraph)

**High level differences**
- Storage approach
- Schema, fixed/dynamic
- Querying
- Scalability, SQL(vertical); NoSQL(horizontal)
- Reliability or ACID Compliance (Atomicity, Consistency, Isolation, Durability). SQL still better at data reliability and transactions performance, and NoSQL sacrifice ACID compliance for performance and scalability

**When to use which**
- SQL:
  1. need to ensure ACID, which reduces anomalies and protects db integrity
  2. data is structured and unchanging. no massive growth expected
- NoSQL:
  1. prevent data from being bottleneck by distributing DBs
  2. large volumes of data storage having little or no structure, no need to define type in advance
  3. use of cloud computing and storage for scaling up
  4. rapid development, little prep ahead of time, little downtime b/w versions

<br/>
#### Redundancy and Replication

- duplicate critical data or services to increase reliability
- remove single pt of failure, fail-overs when one instance down
- shared-nothing architecture, where each node can operate independent of one another
  - new servers can be added without conditions

<br/>
#### Sharding (Data Partitioning)

- break up big DB into smaller parts
  - improve manageability, performance, availability, & LB
  - after certain scale pt, cheaper to scale horizontally (more same machines) than grow vertically (upgrade server gears)

**Partitioning Methods**
1. horizontal partitioning:
  - range based sharding. best for evenly distributed ranges
  - disadvantage: can lead to unbalanced servers for bad range selection
2. vertical partitioning:
  - divide into tables for data related to a specific feature to their own server
  - disadvantage: when app grows, may need to partition feature specific DB across various servers
3. dictionary based partitioning:
  - loosely coupled approach
  - lookup service which knows partitioning scheme, holds mapping between each tuple key to its DB server

**Partitioning Criteria**
1. Key or Hash-based partitioning:
  - apply a hash function to some key attribute of the entries
  - need redistribution of data when adding new DB servers
2. List partitioning:
  - each partition assigned list of values
  - look up partition contains our key and store in its list
3. Round-robin partitioning:
  - ensures uniform data dist. i mod n
4. Composite partitioning:
  - combine above schemes.
  - a consistent hashing is hash and list: hash reduces key space to a smaller size

**Common Problems of Sharding**
- operations across multiple tables or multiple rows in the same table, no longer run on the same server
1. Joins and Denormalization: joins is inefficient across multiple servers. Need to denormalize the database so that previous operation requires joins can perform from a single table
2. Referential integrity: foreign keys in sharded db can be difficult. need to enforce it in application code
3. Rebalancing: when distribution is no longer uniform, or lots of load on one shard, either have to create more shards, or rebalance existing shards.
- these are cost of using sharding. using directory based partitioning can make rebalancing easier at the cost of increasing system complexity and creating new pt of failure.

<br/>
#### System Design Interviews, how to approach

- Scoping the problem
  - ask questions to understand constraints and use cases
- Sketching up an abstract design
  - illustrate building blocks and relationships b/w them
- Identifying & addressing bottlenecks
- no absolute answers, open-ended

**As a candidate**
- learn from existing systems
  - prepare ahead, learn based on real-life products, issues, & challenges
  - foster analytical ability and questioning on the problem
- lead the conversation
  - communicate your idea to interviewer, your thought process, what you are considering
- solve by breaking it down
  - top-down, modularize into modules, tackle each independently
- deal with bottlenecks
  - talk about possible solutions to these, and trade-offs and their impacts on the sys.
- try understand interviewer's intention and direction
