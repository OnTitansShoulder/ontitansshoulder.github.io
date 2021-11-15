---
layout: note_page
title: Linux Network Adminstration
title_short: linux_network_admin
dateStr: 2021-12-01
category: Linux
tags: notes check
---
This set of notes were taken from the Linux Foundation Course: 
[Linux Networking and Administration (LFS211)](https://trainingportal.linuxfoundation.org/learn/course/linux-networking-and-administration-lfs211/){target=_blank}.

## Networking Concepts

### The OSI Model

The **Open System Interconnection (OSI)** model was created to standardize the language used to describe networking protocols.

OSI defines the manner in which systems communicate with one another using abstraction **layers**. Each layer communicates with the layer directly above and below. Not all layers are used at all times.

<img src="https://d36ai2hkxl16us.cloudfront.net/course-uploads/e0df7fbf-a057-42af-8a1f-590912be5460/47s4lc4nv4i6-osi-stack.png"/>

Most networking stacks have layer 1-4 and 7. The layer 5-6 is often combined into layer 4 or 7.

#### Physical Layer

The **Physical Layer** is the lowest possible layer and deals with the actual physical transfer of information; it deals with transferring bits over a physical medium such as:

- Electric pulses over copper cables
- Laser pulses over fiber optic cables
- Frequency modulations over radio waves
- Scraps of paper over carrier pigeons

Some protocols, hardware types and standards defined for this layer:

- IEEE 802.3: Copper or fiber connections (examples and additional information about various cables and connection is available on Wikipedia, in the "10BASE2" article)
- IEEE 802.11: Wireless (Wi-Fi) connections
- Bluetooth: Wireless connections
- USB: Copper connections
- RS232: Copper serial connections

A **Frame** is a unit of data collected from the physical layer interface.

#### Data Link Layer

The **Data Link Layer** accepts data from the hardware in Layer 1 and **prepends** an **address** to all the inbound packets it accepts.

The address number is 6 bytes, 3 bytes for the manufacturer and 3 random bytes assigned to the adapter. This 6 byte address is known as the **MAC (Media Access Control) Address**.

The Data Link layer deals with transferring data between **network nodes** using the MAC address. This layer is where the _IP address_ and _MAC address_ are associated using the **ARP protocol**.

A broadcast is initiated to find the MAC address of the IP address that is required. Quite often a broadcast is initiated requesting MAC addresses as the associations time out and are deleted. The ARP frame usually has the data of `Who has 192.168.0.2? Tell 192.168.0.7`.

Since ARP uses broadcasts, the packets are confined to a single network segment. A network segment may also be called a **broadcast domain** or **collision domain**. A collision domain may be expanded with the use of a **bridge**. Bridges will work but all nodes will hear and examine all traffic on the wire. Adding bridges increases the number of nodes on the wire.

Common Data Link protocols or EtherType include:

- ARP: ID=x0806, Address Resolution Protocol
- RARP: ID=x0825, Reverse Address Resolution Protocol
- IPv4: ID=x0800, Internet Protocol version 4
- PPPoE: ID=x8863, Point to Point Protocol over Ethernet (discovery)
- STP: Spanning Tree Protocol, does not have an ID as it uses an Ethernet II frame with a LLC (Logical Link Control) header.

#### Network Layer

The **Network Layer** deals with routing and forwarding packets, and may also have Quality of Service component.

The Data Link layer is confined to a single network segment and is used by Network Layer for local delivery.

