---
layout: note_page
title: Kafka
title_short: kafka
dateStr: 2022-01-01
category: Tools
tags: notes check tools
---

**Kafka** is an event streaming platform that implements the key capabilities end-to-end, and all the functionalities are provided in a **distributed**, highly **scalable**, **elastic**, **fault-tolerant**, and **secure** mannor.

Kafka is a distributed system consisting of servers and clients that communicate via a high-performance TCP network protocol.

Kafka servers can span multiple regions. Some form the **storage** layer, called **brokers**. Others run **Kafka Connect** to continuously **import and export** data as event streams to integrate Kafka with your existing systems such as relational databases as well as other Kafka clusters.

Kafka clients can be distributed **applications** and **microservices** you built that read, write, and process streams of events in parallel, at scale, and in a fault-tolerant manner. Kafka ships with some such clients included; there are also **Kafka Streams** library and REST APIs for many languages.

Kafka is widely used in software industry and is backed by a large and active community of opensource engineers.

## Main Concepts

An **event** records the fact that "something happened" in the world or in your business. An event has a `key, value, timestamp`, and optional `metadata` headers. 

**Producers** are those client applications that publish (write) events to Kafka. 

**Clients** talk to Producers/Brokers to insert events to Kafka, and several other components work with Producers to ensure the non-duplicated successful deliver of a client message:

1. A Client sends the message to Producer and get an ACK.
2. Client sends a synchronous blocking request to the Future server
3. Once Producer gets a message, it append it to the RecordAccumulator
4. Once certain condition is met (time, numb of records), the RecordAccumulator prepares and make the accumulated records as a RecordAppendResult to persist to storage
5. Once it is complete, it sends a confirmation to the Future server
6. The Future server responses to the Client that the message send is complete.

**Consumers** are those that subscribe to (read and process) these events. Producers and consumers are fully decoupled and agnostic of each other, which is a key design element to achieve the high scalability.

**Consumer group** is the unit which Kafka uses to map one topic partition to. Each partition can only be connected and consumed by one of the consumers within a consumer group. A consumer group can have one or more consumers. A consumer can connect to multiple partitions from multiple topics. A partition, however, can ONLY have one consumer connected to it.

Events are organized and durably stored in **topics**. Topics in Kafka are always multi-producer and multi-subscriber. Events in a topic can be read as often as needed and are **NOT deleted** after consumption; an event retain limit can be defined instead. Kafka's performance is effectively **constant** with respect to data size.

Topics are **partitioned**, meaning a topic is spread over a number of "buckets" located on different Kafka brokers. Kafka guarantees that any consumer of a given topic-partition will always read that partition's events in exactly the **same order** as they were written. Every topic can be **replicated** for fault-tolerance and availability.

## Kafka APIs

- **Producer** API - publish (write) a stream of events to one or more Kafka topics
- **Consumer** API - subscribe to (read) one or more topics and to process the stream of events produced
- **Streams** API - for implementing stream processing applications and microservices, provides higher-level functions including transformations, stateful operations like aggregations and joins, windowing, processing based on event-time, etc., effectively transforming the input streams to output streams
    - alternative open source stream processing tools include Apache Storm and Apache Samza
- **Connect** API - build and run reusable data import/export connectors that consume (read) or produce (write) streams of events from and to external systems and applications
- **Admin** API - manage and inspect topics, brokers, and other Kafka objects
    - talks to the Zookeeper

## Kafka Deeper Look

### Kafka's High Throughput

#### Log-based message

**log-based** event message format allows append-only operation, fast to write. Log files are saved in directories of the name `topic name` appended with `partition number`.

The log files in each partition are **indexed** for fast search. Each log message is of `1+4+n` bytes long:

- "magic" value of 1 byte: version number
- CRC (Cyclic Redundancy Check) of 4 bytes: ensures message integrity
- payload of n bytes: actual message body

#### Topic Partitioning

Topics are **partitioned** to distribute the load and allow fast search and send. Each partition logs are saved as same-sized **segments**, the number of messages in each segment may vary depends on the message length.

Logs in each partition are append-only and write to the last segment; the segment got written to disk once a condition is met. Logs are read in order.

Log indexes stores the start location of each message based on its id. There is also a timeIndex that stores the start location based on its timestamp.

#### Batch Send/Receive

**Batch** sending and receiving with data compression saves number of network calls and bandwidth

#### sendfile syscall

A typical read file and send file over network flow is roughly as such:

- Server program instructs Kernel to load a file from disk
    - Kernel does syscall to load file into Kernel buffer memory
    - File content is copied from Kernel buffer to User space buffer memory for the Server program
    - Kernel returns control back to the Server program
- Server program initiates send to the Network interface
    - File content is optionally serialized and put back to memory
    - File content is copied to socket buffer
    - File content is sent through Network interface
- Data pass through the Internet hops and reach the target user

Use Linux **`sendfile`** system call to pass files to network socket buffer, avoid re-copying IO from filesystem to user space memory and then copied to the network socket buffer memory, which saves two copy operations.

## Use Cases

### Messing Queue

Unlike other MessageQueue solutions such as ActiveMQ, Kafka does NOT guarantee the **strict order** of messages being processed, because Kafka holds messages for potential re-processing.

Message order on each partition is ordered. Use key and offset to keep a rough order of messages during read.

### Activity Tracking

### Metrics Collection

### Log Aggregation

### Stream Processing

### Event Sourcing

### Commit Logs


