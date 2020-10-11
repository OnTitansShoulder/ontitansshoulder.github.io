---
layout: note_page
title: Linux Network Concepts
title_short: linux_network_concepts
dateStr: 2019-04-01
category: Linux
tags: notes reference
---

## Network and Internet Knowledge must knows for Linux

### what makes up a network

**some concepts**

- node: devices having an Internet IP address, such as PC, Linux, ADSL modem, printer, etc.
- server: devices that serves contents
- workstation, client: devices that consumes contents from servers
- Network Interface Card, NIC: provide network access, usually each node has 1+ NIC.
- network access point: provides IP address
- topology: the way nodes are connected with each other
- route or gateway: having 2+ access points, can connect to 2+ different networks.

**Local Area Network, LAN**

close transmission distance, like within a building or an university campus. Can use expensive connection materials. Fast.

**Wide Area Network, WAN**

far transmission distance, like between cities, and use cheap connection materials. Slower and less reliable.

### Network protocols

**OSI seven layers**

Open System Interconnection (OSI). From the top layer to the bottom layer:

- Application Layer: defines how data reach specific application
- (Presentation Layer): transform data to satisfy network standard
- (Session Layer): process to process
- Transport Layer: defines TCP, UDP packet format
- Network Layer: defines IP protocols, establish/maintain/terminate connections, path selection in routing
- Data-link Layer: transform/interpret data packet to/from 0s and 1s
- Physical Layer: physical wires and media; transmit data as 0s and 1s via fibers

While TCP/IP uses five of the seven: Application -> Transport -> Network -> Link -> Physical

**MAC address**

Each machine has a MAC (Media Access Control) address, that is unique and given when the NIC is manufactured.
MAC packets size can vary from 64 bytes to 1500 bytes.

**IP Packet Header**

![IPv4 Packet]('ipv4_packet')

- Versions: this IP packet version, like IPv4
- IHL (Internet Header Length): tells the length of this IP header
- Type of Service: [PPPDTRUU]
  - PPP: shows priority of this IP packet
  - D: if 0 means normal latency, 1 means low latency
  - T: if 0 means normal throughput, 1 means high throughput
  - R: if 0 means normal reliability, 1 means high reliability
  - UU: unused
  - by setting this part, Gigabit Ethernet can make this packet high-speed and low-latency
- Total Length: shows the total length of this packet, including header and data portions. Max 65535 bytes
- Identification: since MAC frame max size is 1500 bytes, larger packet need to be broken down into smaller pieces, and each will have this Id for reassemble
- Flags: [0DM]
  - D: if 0 means can be fragmented, 1 means cannot be fragmented
  - M: if 0 means this IP is the last fragment, 1 means it is not the last fragment
- Fragment Offset: means this IP fragment's position in the original IP packet. Like an ordering number
- Time To Live (TTL): [0-255], shows how many routers to pass before this packet being discarded
- Protocol Number: this number represents a specific protocol.
  - 6 is TCP; 17 is UDP; 4 is IP; 1 is ICMP (Internet Control Message Protocol) ...
- Header Checksum: to check the integrity of this packet's content
- Source Address: source IP address
- Destination Address: destination IP address
- Options: extra parameters, such as security, router, timestamp
- Padding: use padding to fill bits that are unused by Options

**IP address composition and classification**

Example: 192.168.0.0 ~ 192.168.0.255

Here 192.168.0 is the Net_ID, 0 ~ 255 is the Host_ID

- Within the same network, the Net_ID doesn't change within the same LAN
- Within the same network, machines can use CSMA/CD broadcast information, and also send message from
- Host_ID as 0 is reserved for Network IP; and as 255 is reserved for Broadcast IP.

IP has five classifications:

- Class A: Net_ID starts with 0
  - 0xxxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx
  - |--net--|-----------host----------|
  - 0.xx.xx.xx ~ 127.xx.xx.xx
- Class B: Net_ID starts with 10
  - 10xxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx
  - |--net-----------|----------host--|
  - 128.xx.xx.xx ~ 191.xx.xx.xx
- Class C: Net_ID starts with 110
  - 110xxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx
  - |--net--------------------|-host--|
  - 192.xx.xx.xx ~ 223.xx.xx.xx
- Class D: Net_ID starts with 1110. For the purpose of multicast
  - 1110xxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx
  - 224.xx.xx.xx ~ 239.xx.xx.xx
- Class E: Net_ID starts with 1111. Reserved and unused.
  - 1111xxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx
  - 240.xx.xx.xx ~ 255.xx.xx.xx

**Netmask (Subnet mask)**

Each Class A's Host_ID range is 0.0.1 ~ 255.255.255, which is definitely too large and broadcasting could be devastating.

We need to divide it further to make subnets: to take some bits from Host_ID and make it part of Net_ID.

`Netmask` is the trick to divide one large network segment into smaller ones. Example:

```
192.168.0.0 ~ 192.168.0.255, a Class C Netmask instruction:
First IP: 11000000.10101000.00000000.00000000
Last  IP: 11000000.10101000.00000000.11111111
          |---------Net_ID----------|-host--|
Netmask : 11111111.11111111.11111111.00000000 # binary rep.
        : 255.255.255.0 # decimal rep.
  Network: 192.168.0.0
  Broadcast: 192.168.0.255
# In this way, the representation of Class ABC are:
Class A: 11111111.00000000.00000000.00000000 # 255.0.0.0
Class B: 11111111.11111111.00000000.00000000 # 255.255.0.0
Class C: 11111111.11111111.11111111.00000000 # 255.255.255.0
```

After dividing the network segment into two subnets:

```
Netmask:  11111111.11111111.11111111.10000000 # 255.255.255.128
First subnet :
  Network:  11000000.10101000.00000000.0 0000000
  Broadcast:11000000.10101000.00000000.0 1111111
            |---------Net_ID------------|-host-|
Second subnet:
  Network:  11000000.10101000.00000000.1 0000000
  Broadcast:11000000.10101000.00000000.1 1111111
            |---------Net_ID------------|-host-|
```

**IP types**

There are two types of IP for IPv4:

- public IP: planned by INTERNIC, required to get on Internet
- private IP: cannot be used to get on Internet, used for LAN computers.
  - private IP reserved some IP at A B C classifications of IP:
  - Class A: 10.0.0.0 ~ 10.255.255.255
  - Class B: 172.16.0.0 ~ 172.31.255.255
  - CLass C: 192.168.0.0 ~ 192.168.255.255
  - these IPs are used for communication within a private LAN
  - packets from private IP cannot be sent onto Internet

**CIDR (Classless Interdomain Routing)**

```
Network/Netmask
  192.168.0.0/255.255.255.0
  192.168.0.0/24 # because Net_ID has 24 bits
# since 192.168.0.0 is Class C, when it comes to the need we need to break the rule and make 192.168.0.0 ~ 192.168.255.255 available, we are doing CIDR!
```

**loopback IP**

This IP segment is 127.0.0.0/8 on Class A. The frequently used "localhost" is 127.0.0.1, and there is no need for NIC.

**How IP is assigned**

- static IP: check for usable IP and directly set your IP to a fixed value.
- dial-up IP: check in with your ISP with acocunt and password and get an IP assigned to you.
- DHCP: one machine designated for assigning IP to other machines

**IP and MAC: Link Layer ARP and RARP**

ARP (Address Resolution Protocol), to transmit message via Ethernet
RARP(Reverse ARP), to reverse the ARP packets' contents
ICMP (Internet Control Message Protocol), wrapped by IP (Book P77)

**TCP Packet Header**

The ports are ranging from 1 ~ 65535 (16 bits)
Some ports are privileged and reserved for special purposes:

Port|service
----|-------
20|FTP-data
21|FTP-command
22|SSH
23|Telnet
25|SMTP
53|DNS
80|WWW
110|POP3
443|https
