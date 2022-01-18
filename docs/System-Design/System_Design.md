---
layout: note_page
title: System Design
title_short: system_design
dateStr: 2022-01-01
category: Foundation
tags: notes check
---

System Design is the heart of software engineering. Each successful and sophisticated software system takes careful and thorough design process.

Some good extra resources for system design

- https://www.educative.io/courses/grokking-the-system-design-interview/m2ygV4E81AR

## Approach System Design

- Write down the functional requirements of the system of interest
    - what is the user/audience
    - what I/O interface we are giving to the user
    - what functionalities are provided to the user
        - go into more detail for those may affect the design
- Write down the non-functional requirements
    - highly available
    - low latency
    - analytics, monitoring and alerts
- Possible constraints
    - what is the estimated usage capacity
        - start from small estimate, then extend to larger time range
        - look at RPS for number of servers, latency for whether we want to use cache, request size for network bandwidth, data unit storage size for total storage
    - what is the service SLA
        - think of ways to meet this SLA later in design
- Detailed design thought process
    - high level components
    - System APIs
        - what we are offerring for data exchange
    - interaction between components
    - Things should be touched on
        - Should it be a pull or push based architecture
        - Database
            - whether to use relational database or NoSQL database
            - is the system expected to be read-heavy or write-heavy
            - define the DB schema early will help understand the data flow between components and guides towards data partitioning
        - Data structure and algorithm used in main components
            - can we improve the efficiency by doing some parallel processing
            - or producer consumer to take away some of the expensive calculations during serving the request?
            - what special cases we need to consider to be treated differently from the majority of use cases? How would a normal case transform into a special case?
        - Do we need to consider separating read and write into different servers
        - Do we need data partitioning/sharding
            - how we can ensure fairly evenly distributed, consistent hashing
                - partition on userId, objectId, hash
        - Do we need data replication
        - Do we need Cache
            - Cache strategy, eviction policy
            - Cache memory, how much keys to cache
            - the flow to update cache
        - Load Balancer
            - where we should place the load balancer
        - Bottlenecks
            - any places where a SPF can happen, how to resolve this bottleneck
        - Monitoring
            - how to make sure we know when the system performance has degraded
        - Cleanup
            - offline jobs to cleanup, keep system healthy
        - Security
            - abuse protection

## SQL vs. NoSQL

??? Note "Comparison in table"
    Parameter | SQL | NOSQL
    --------- | --- | -----
    Definition|SQL databases are primarily called RDBMS or Relational Databases|NoSQL databases are primarily called as Non-relational or distributed database
    Design|Traditional RDBMS uses SQL syntax and queries to analyze and get the data for further insights. They are used for OLAP systems.|NoSQL database system consists of various kind of database technologies. These databases were developed in response to the demands presented for the development of the modern application.
    Query Language|Structured query language (SQL)|No declarative query language
    Type|SQL databases are table based databases|NoSQL databases can be document based, key-value pairs, graph databases
    Schema|SQL databases have a predefined schema|NoSQL databases use dynamic schema for unstructured data.
    Scalability|SQL databases are vertically scalable|NoSQL databases are horizontally scalable
    Examples|Oracle, Postgres, and MS-SQL.|MongoDB, Redis, Neo4j, Cassandra, Hbase.
    Use cases|An ideal choice for the complex query intensive environment.|It is not good fit complex queries.
    Hierarchical data storage|SQL databases are not suitable for hierarchical data storage.|More suitable for the hierarchical data store as it supports key-value pair method.
    Variations|One type with minor variations.|Many different types which include key-value stores, document databases, and graph databases.
    Open-source|A mix of open-source like Postgres & MySQL, and commercial like Oracle Database.|Open-source
    Consistency|It should be configured for strong consistency.|It depends on DBMS as some offers strong consistency like MongoDB, whereas others offer only offers eventual consistency, like Cassandra.
    Best Used for|RDBMS database is the right option for solving ACID problems.|NoSQL is a best used for solving data availability problems
    Importance|It should be used when data validity is super important|Use when it’s more important to have fast data than correct data
    Hardware|Specialized DB hardware(Oracle Exadata, etc.)|Commodity hardware
    Network|Highly available network(Infiniband, Fabric Path, etc.)|Commodity network(Ethernet, etc.)
    Storage Type|Highly Available Storage (SAN, RAID, etc.)|Commodity drives storage (standardHDDs, JBOD)
    Best features|Cross-platform support, Secure and free|Easy to use, High performance, and Flexible tool.
    ACID vs. BASE Model|ACID( Atomicity, Consistency, Isolation, and Durability) is a standard for RDBMS|Base ( Basically Available, Soft state, Eventually Consistent) is a model of many NoSQL systems

    source: https://www.guru99.com/sql-vs-nosql.html#:~:text=SQL%20pronounced%20as%20%E2%80%9CS%2DQ%2DL%E2%80%9D%20or,%2Dvalue%20pairs%2C%20graph%20databases

## Stream Processing

**Event streaming** is the practice of:

- capturing data in real-time from event sources like databases, sensors, mobile devices, cloud services, and software applications in the form of streams of events;
- storing these event streams durably for later retrieval;
- manipulating, processing, and reacting to the event streams in real-time as well as retrospectively;
- routing the event streams to different destination technologies as needed.

Event streaming ensures a **continuous** flow and interpretation of data so that the right information is at the right place, at the right time. An event streaming system is 'always-on'.

Key capabilities of event streaming architecture

- **publish** (write) events and **subscribe** to (read) topics of streams of events
- **store** streams of events durably and reliably
- **process** streams of events as they occur or retrospectively

