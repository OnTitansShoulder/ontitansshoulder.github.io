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

Some of the common Layer 3 protocols are:

- IPv4, Internet Protocol version 4
- IPv6, Internet Protocol version 6
- OSPF, Open Shortest Path First
- IGRP, Interior Gateway Routing Protocol
- ICMP, Internet Control Message Protocol

The layer 3 is tasked with packet delivery to the next hop. Each packet is sent/forwarded on its own merits and run in a connectionless environment. In many cases the final destination is not adjacent to this machine so the packets are routed based on the local routing table information.

##### Internet Protocol

The **addressing** function examines the address on the incoming packet:

- If the address indicates the datagram is for the local system then the headers are removed and the datagram is passed up to the next layer in the protocol stack.
- If the address indicates the datagram is for another machine then it is passed to the next system in the direction of the final destination.

The **fragmentation** component will split and re-assemble the packets if the path to the next system uses a smaller transmission unit size.

##### IP Address

IP addresses have two parts:

- Network Part - indicated by the value of the netmask
- Host Part - the remaining bits after the host network component is removed

They are distinguished by using a **netmask**, a bitmask defining which part of an IP address is the network part.

IP networks can be broken into smaller pieces by using a **subnet**.

As an example:

| parts | address | | | |
| ----- | ------- | | | |
|IP Addr Dec|10|20|0|100|
|Netmask Dec|255|255|0|0|
|IP Addr Bin|00001010|00010100|00000000|01100100|
|Netmask Bin|11111111|11111111|00000000|00000000|
|Subnet Bin| | |11111111| |
|Network Part Bin|00001010|00010100| | |
|Subnet Part Bin| | |00000000| |
|Host Part Bin| | |00000000|01100100|

Originally, the IPv4 addresses were broken into the following three classes:

- Class A: 0.0.0.0/255.0.0.0
- Class B: 128.0.0.0/255.255.0.0
- Class C: 192.0.0.0/255.255.255.0

Original classes of networks and subnets did not scale well. Networks which did not fit in a class B were often given a class A. This led to IP addresses going to waste and the creation of **CIDR** (Classless Inter-Domain Routing) which uses a **numbered bitmask** instead of the **class bitmask**.

Example CIDR Network Netmask:

| parts | address | | | |
| ----- | ------- | | | |
|CIDR /18 Dec|255|255|192|0|
|CIDR /18 Bin|11111111|11111111|11000000|00000000|

##### IP Routing

Routing begins when the adapter collects a Frame of data and passes it up the stack.

1. In the first stage the Data Link (MAC) is examined to see if it matches the local machine’s hardware address.
2. When a match is made, the packet is examined for a match of the Destination IP Address.
3. If a match of IP addresses is made, then the packet’s destination is the local machine. The packet is then passed up to Layer 4 (Transport), for additional processing.
4. If there is no IP address match then the datagram is forwarded to the next hop based on the local routing tables.
5. The MAC address is updated to the next hop machine and the packet is passed along. Notice that the MAC address is modified to the next hop and the IP address is the final destination and is not usually modified.

Network routers inspect packet headers, and make routing decisions based on the destination address. There are multiple routes the packets can take to reach the final destination and the routers involved make routing decisions based on path data for most direct path or fastest path.

##### IPv4 and IPv6

IPv4 was the first major Internet Protocol version and most used protocol. Its 32bit address allows 4,294,967,296 possible addresses, which has exhausted on Jan. 31, 2011.

Some solutions for mitigating the problem are:

- The move from Classed networks to Classless Inter-Domain Routing (CIDR)
- The invention of Network Address Translation (NAT)
- The move to IPv6

[IPv6](https://ietf.org/rfc/rfc2460.txt) is the successor to IPv4; it has 128bit address allows for 3.4 x 10^38 possible addresses. It was designed to deal with IPv4 exhaustion and other shortcomings:

- Expanded addresses capabilities
- Header format simplification
- Improved support for extensions and options
- Flow labeling capabilities

##### IP Management Tools

`ip` is part of the iproute2 package, the default tool for many distributions that manages layer 2 and 3 settings.

**NetworkManager** is a daemon with D-bus for communication to applications and a robust API available to inspect network settings and operations. It has command line interface (`nmcli`), curses-based interface (`nmtui`) and graphical interface (`nm-connection-editor`)

`ifconfig` is part of the net-tools package, not recommened as some new constructs created by `ip` are not visible to `ifconfig`.

##### Network Types

**Local Area Network** (LAN) form a network on its own

- Smaller, locally connected network.
- Connected at layer 2 by the same series of switches or hubs.
- Node to node communication happens at layer 3 using the same network.
- Layer 2 to layer 3 association may use layer 2 broadcasts and the ARP and RARP protocols to associate MAC addresses with IP addresses.

**Virtual Local Area Network** (VLAN) is a method for combining two or more separated LANs to appear as the same LAN, or securing several LANs from each other on the same set of switches.

VLANs are defined to the switch, and must configure the trunk port for switch-to-switch communication.

A **network bridge** or repeater accepts packets on one side of the bridge and passes them through to the other side of the bridge, and it is bi-directional. It can be a hardware bridge or software bridge.

- It is a combination of two or more networks at layer 2.
- Bridged networks communicate as a **single network**.
- It is generally used to increase the length of the network connections or increase the number of connections by **joining** two LANs.

Software bridges are present in Kernel and mostly noticeable when implementing VMs, containers or network namespaces. Several methods for configuring software bridges: `iproute2, systemd-networkd, nmcli, and VM software`

**Wide Area Networks** (WAN) are the components that make the internet work. Typically a WAN is comprised of many individual LAN’s connected together.

<img src="https://d36ai2hkxl16us.cloudfront.net/course-uploads/e0df7fbf-a057-42af-8a1f-590912be5460/ikyygzinaabv-WAN-v2.png" />

The layer 2 (MAC address) contains the address of the "gateway" node. Once the "gateway" node receives the packet it determines if the packet is local or needs to be "forwarded" to the next "gateway".

#### Transport Layer

The **Transport Layer** is responsible for the end-to-end communication protocols. Data is properly multiplexed by defining source and destination port numbers.

This layer deals with reliability by adding check sums, doing request repeats, and avoiding congestion.

Common protocols in the Transport Layer include:

- Transmission Control Protocol (TCP), the main component of the TCP/IP (Internet Protocol Suite) stack.
- User Datagram Protocol (UDP), another popular component of the Internet Protocol Suite stack.
- Stream Control Transmission Protocol (SCTP)

Transport Layer uses port numbers to allow for connection multiplexing. The port numbers are usually used in pairs, servers have fixed ports that they listen on and clients use a random port number for port number.

The ports are classed in three different ways:

- Well-Known Ports 0-1023 - assigned by the Internet Assigned Numbers Authority (IANA), and usually require super-user privilege to be bound. Some of the well-known ports are: `22 TCP: SSH; 25 TCP: SMTP; 80 TCP: HTTP; 443 TCP: HTTPS`.
- Registered Ports 1024-49151 - also assigned by the IANA. They can be bound on most systems by non-super-user privilege.
- Dynamic or Ephemeral Ports 49152-65535 - used as source ports for the client-side of a TCP or UDP connection. Can also be used for a temporary or non-root service.

##### TCP, UDP, SCTP

TCP is useful when data integrity, ordered delivery and reliability are important.

UDP is useful when transmission speed is important and the integrity of the data isn’t as important, or is managed by a higher layer.

SCTP is an evolving protocol designed for efficient robust communication. Some of the features are still being sorted such as using SCTP through a NAT firewall.

Characteristics | TCP | UDP | SCTP
--------------- | --- | --- | ----
Connection-oriented|Yes|No|Yes
Reliable|Yes|No|Yes
Ordered delivery|Yes|No|Yes
Checksums|Yes|Optional|Yes
Flow control|Yes|No|Yes
Congestion avoidance|Yes|No|Yes
NAT friendly|Yes|Yes|Not yet
ECC|Yes|Yes|No
Header size|20-60 bytes|8 bytes|12 bytes

#### Session Layer

**Session Layer** is used for establishing, managing, synchronizing and termination of application connections between local and remote application.

If an established connection is lost or disrupted, this layer may try to recover the connection. If a connection is not used for a long time, the session layer may close and reopen it.

There are two types of sessions: connection-mode service and connectionless-mode sessions. 

Session options:

- Simplex or duplex communication
- Transport Layer reliability
- Checkpoints of data units

Session services may be involved in:

- Authentication for Transport Layer
- Setup and encryption initialization
- Support for steaming media
- Support for smtp,http and https protocols
- SOCKS proxy, Secure Sockets, TLS

The Session Layer creates a semi-permanent connection which is then used for communications, many of the RPC-type protocols depend on this layer:

- NetBIOS: Network Basic Input Output System
- RPC: Remote Procedure Call
- PPTP: Point to Point Tunneling Protocol

#### Presentation Layer

The Presentation Layer is commonly rolled up into a different layer, Layer 5 and/or Layer 7. 

Some of the protocols that function at this level include:

- AFP, Apple filing protocol
- NCP, Netware Core protocol
- x25 PAD, x25 Packet Assembler/Disassembler

Some of the services that may be available at the Presentation level are:

- Data Conversion (EBCDIC to ASCII)
- Compression
- Encryption/Decryption
- Serialization

#### Application Layer

The Application Layer is the top of the stack and deals with the protocols which make a global communications network function.

Common protocols which exist in the Application Layer are:

- HTTP: Hypertext Transfer Protocol
- SMTP: Simple Mail Transfer Protocol
- DNS: Domain Name System
- FTP: File Transfer Protocol
- DHCP: Dynamic Host Configuration Protocol

### Manage System Services with systemd

Common actions performed from `systemctl` utility:

```sh
# Start the service
systemctl start httpd.service
# Stop the service
systemctl stop httpd.service
# Enable the service to auto start on system boot
systemctl enable httpd.service
# Disable or prohibit a service from auto starting
systemctl disable httpd.service
# Obtain the status of a service
systemctl status httpd.service
# reload systemd confs after making changes
systemctl daemon-reload
# restart a service after the reload (.service can be omitted)
systemctl restart httpd
# Run the service in foreground for debugging
/usr/sbin/httpd -f /etc/httpd/httpd.conf

# List the services (units) currently loaded
systemctl
# List the sockets in use by systemd launched services
systemctl list-sockets
# List the timers currently active
systemctl list-timers
# Set specific unit runtime values if supported; this will set properties used for resource control if enabled
systemctl  set-property foobar.service CPUWeight=200 MemoryMax=2G IPAccounting=yes
# Display the status, state, configuration file(s) and last few log messages for this service
systemctl status httpd.service
# Find overridden configuration files and display the differences
systemd-delta
```

Some transient system services are not used enough to keep a daemon running full time. The `xinet` daemon was created to manage these transient daemons. Its default configuration file is `/etc/xinetd.conf`, with additional per-service files in `/etc/xinetd.d/`.

The sequence that systemd processes the configuration files is predictable and extensible. The common scan sequence is:

- The vendor or package supplied unit files in one of the following directories: `/usr/lib/systemd/system/<service>.service` or `/lib/systemd/system/<service>.service`
- Optional or dynamically created unit files in `/run/systemd/system/` directory
- Optional user unit override files in `/etc/systemd/system/` directory
- Optional user drop-in files in `/etc/systemd/system/<service>.d` (most popular drop-in directory)
    - `<service>.d` might need to be manually created
    - It is common practice to copy the vendor unit file into the `/etc/systemd/system/` directory and make appropriate customizations.
    
Often times it is desirable to add or change features by program or script control, the drop-in files are convenient for this. One item of caution, if one is changing a previously defined function (like ExecStart) it must be undefined first then added back in.

With `systemd`, additional features and capabilities can be easily added.  As an example, **cgroups** controls can be added to our service by adding a `Slice` directive in the `Service` block.

## Network Configuration

### Layer 2 Configuration

There are two methods for examining/changing additional parameters for Layer 2:

- Kernel module tools modinfo and modprobe using `/etc/modprobe.d/`, with suffix in `.conf` or `.local`
- udev using the drop-in directory `/etc/udev/rules.d/`

The **udev** (user device facility) is used to manage network hardware interfaces for the Linux kernel. Sometimes changes are needed to rename interfaces or change configurations to match hardware MAC addresses. When rules are processed, all the files in the rules directories are combined and sorted in a lexical order.

The udevadm command is used for control, query and debugging udev configuration files. You can see an example rule to rename a network interface:

```sh
cat /etc/udev/rules.d/70-persistent-net.rules
SUBSYSTEM=="net" ,ACTION=="add" ,ATTR{address}=="52:54:42:42:00:01" ,NAME="net%n"
```

The operations required are:

- List optional parameters
- Set optional parameters
- Verify additional parameters
- Block or allow hardware modules from loading

Sometimes it becomes necessary to inhibit the loading of a hardware module. The syntax is `blacklist MODULENAME`

Example of changing layer 2 configuration:

```sh
# change the maximum transmission unit (MTU):
ip link set mtu 1492 dev eth0
# change the link speed:
ethtool -s eth0 speed 1000 duplex full
# check the link status
ip -s link
ip -s link show dev eth0
# check the network interface driver
ethtool -i eth0
# check driver module info to understand optional parameters to the module
modinfo e1000
udevadm info -a /sys/class/net/ens9
# add parameters in /etc/modprobe.d/mynic.conf:
options e1000 Speed=100 Duplex=0 AutoNeg=0
```

### Layer 3 Configuration

Examples of changing layer 3 configuration

```sh
# manually set a network (Layer 3) address:
ip addr add 10.0.2.25/255.255.255.0 dev eth0
# manually set or change the default route:
ip route add default via 10.0.2.2
route add default gw 10.0.2.2
# add the address of a DNS server, use:
echo "nameserver 4.2.2.1" >> /etc/resolv.conf
# manually request a DHCP configuration, use the dhclient command:
dhclient eth0
```

### Boot Time Configuration

Network settings are stored in configuration files which allow for persistent configuration across reboots. **Network-Manager** is an example of a common configuration tool with several interfaces (`nmcli`).

The `systemd-network` service relies on text file configuration and has no text or GUI menu application (`networkctl`).

`netplan` is a a Ubuntu-specific tool that creates a network configuration at runtime from a pre-defined yaml file. It can dynamically create either a Network Manager or a systemd-networkd based configuration.

#### Network Manager

Network Manager is used by Ubuntu, CenOS, SUSE, and Debian, which provides:

- GUI tool (`nm-connection-editor`)
- applet (`nm-applet`)
- text interface (`nmtui`)
- CLI interface (`nmcli`)

The current release of Network Manager will automatically configure and start a network interface with a Dynamic Host Configuration Protocol (DHCP) if there is no network configuration file for the adapter.

If there is a configuration file, Network Manager will set the device to an "unmanaged" state and initialize the adapter with the attributes of the configuration file.

Network Manager can manage

- Hardware: `Bluetooth, DSL/PPPoE, Ethernet, InfiniBand, Mobile Broadband, Wi-Fi`
- Virtual: `Bond, Bridge, IP Tunnel, MACsec, Team, Vlan, Wireguard`

The network configuration files on an Ubuntu system typically reside in the `/etc/network` directory, with the interface configuration file being `/etc/network/interfaces`. The hostname config file is `/etc/hostname`.

The network configuration files on a CentOS system are located in the `/etc/sysconfig/network-scripts` directory and match the `ifcfg-<interface>` pattern. The DNS client settings are managed by editing the `/etc/resolv.conf` file.

Beware that some of the network adapters may be excluded from Network Manager and will have to be re-added to allow Network Manager to control the interfaces.

### VPN

**Virtual Private Networks** (VPNs) provide a secure connection for remote users through unsecured networks. Data is encrypted to avoid unwanted exposure. Initialization of the connection usually has multi-factor authentication for additional security. There are VPN types provided by many different protocols:

- Secure Transport Layer (SSL/TLS)
- Internet Protocol Security (IPSEC)
- Datagram Transport Layer (DTLS)
- Secure Shell (SSH) VPN.

One of the more popular VPN tools is [OpenVPN](https://openvpn.net/community/), which provides SSL/TLS-based VPN connectivity. OpenVPN is a single binary for both the server and the client, and is a command-line tool.

## Network Troubleshoot and Monitor

### Client side Troubleshoot

Some common networking issues found at the client side include DNS issues, Firewall settings, or incorrect network settings (routes, netmasks).

The basics of network troubleshooting usually deal with connectivity testing. You can use the tools `ping, traceroute, and nmap`

Use `ping` for checking connectivity. `ping` uses the ICMP protocol. Test the IP address to your network adapter, gateway, and DNS. Use the DNS name for domain name resolution.

Use `traceroute` or `mtr` which shows the connectivity path to the destination. `mtr` show statistics of the connection and packets drops/failures.

Use `nmap` which scans the server to see if the required ports are available.

Use `telnet` to test plain-text protocols, such as http. i.e. `telnet example.com 80`.

Use `openssl` to test SSL or TLS protocols. i.e. `openssl s_client -connect www.google.com:443`

Use `arp` to check link-layer connectivity.

Advanced troubleshooting involves using `tcpdump` and `wireshark`. The command line-based `tcpdump` truncates packets by default and generates `pcap` files. 

`wireshark` uses the graphical interface to capture packets. It can capture and analyze packets in real time. It is useful to analyze `pcap` files, but you may not want wireshark installed on the system you are troubleshooting.

To capture packets with tcpdump for use with wireshark, do `sudo tcpdump -i eth0 -s 65535 -w capture.pcap port 22`

### Server side Troubleshoot

Common server problems include broken DNS, overzealous firewall rules, incorrect network settings, and the daemon not listening on the right interface/port. Some protocols break when return traffic comes back from a different IP address. Verify that your egress route is correct. Some access control systems require that Reverse DNS be properly set up.

Perform basic server troubleshooting: test the network connectivity from the server's point of view. One of the first steps in troubleshooting a server-side daemon should be to check the log files, and verify the daemon/service is running.

Use `netstat` to list the ports that daemons listen on, i.e. `sudo netstat -taupe | grep httpd`

The `ss` command is another socket statistics utility. It may be a replacement to `netstat` although it is missing some socket types. Usage: `sudo ss -ltp | grep httpd`.

Server side firewall configuration needs to take into account that it allows certain inbound and outbound traffic. Also check the settings of tools such as TCP wrappers (`/etc/hosts.allow` and `/etc/hosts.deny`). Consult `man 5 hosts_access` for additional details.

For advanced server troubleshooting, the /proc filesystem has settings that affect the network stack:

- `/proc/sys/net/ipv4/ip_forward` - Allows for network traffic to be forwarded from one interface to another.
- `/proc/sys/net/ipv4/conf/*/accept_redirects` - Accepting Internet Control Message Protocol (ICMP) redirects from a router to find better routes. This setting has the potential to be exploited by a malicious party to redirect your traffic.
- `/proc/sys/net/ipv4/icmp_echo_ignore_all` - Changing this setting will affect the host's visibility to ICMP ping packets.
- `/proc/sys/net/ipv4/icmp_echo_ignore_broadcasts` - This setting will change the host's visibility to broadcast ICMP ping packets.
- `/proc/net/arp` - Contains the current arp table.

These settings are not persistent across reboots. To persistently enable changes you must use the sysctl command with its configuration file `/etc/sysctl.conf`. The syntax for `/etc/sysctl.conf` matches the path for the file in `/proc/sys` with the `.` character instead of `/`.

`netcat` is a TCP and UDP sender and listener. To test a network connection, use `netcat` to open a listening port on one system with `netcat -l 4242`, cause it to listen on all adapters port 4242 for traffic. On another machine, use `netcat <listener_ip_address> 4242` to open a connection to the listener, then send input which should appear on the listener side, the communication is bi-directional.

`netcat` can save many hours of frustration by proving TCP and UDP traffic can transverse the network.

### Network Monitoring

The `iptraf` tool is a real-time network traffic analyzer. It recognizes protocols: `IP, TCP, UDP, ICMP, IGMP, IGP, IGRP, OSPF, ARP, RARP`.

`snort` is a network intrusion detection system. In addition to being a network monitor, it can help pinpoint unwanted traffic inside of a network.

`ntop` is an application and web app for monitoring network usage. It can pinpoint bandwidth use, display network statistics, and more.

`tcpdump` has been around for a long time, it is text-based, small and efficient.

`wireshark`, graphical tracer with protocol decode that allows the user to view more or less data depending on the requirement. It can read `tcpdump` output files, which allows the collection of trace data with the efficient `tcpdump` on prod system and then use `wireshark` to display the information for analysis.

## Remote Access

### Cryptography

Cryptography is about securing communications.

**Symmetric encryption** uses a single secret **shared key**, which both parties must have to communicate. Plain text encrypted with a symmetric encryption method can easily be turned back into plain text using the same key. Example [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher){target=_blank}

One benefit of symmetric encryption is that it is less computationally-intensive than asymmetric encryption. One downside of symmetric encryption is that a secure shared key exchange is difficult to attain.

**Asymmetric encryption** uses mathematically-related public and private keys to communicate. Plain text encrypted with an asymmetric **public key** can only be decrypted by using the **corresponding private key**, not the public key.

Asymmetric encryption has no key-exchange problem and uses the published public key to send secure messages. However, it is more computationally-intensive than symmetric encryption, and needs proper verification on the shared public key.

By using the asymmetric encryption to pass the symmetric key, you can overcome the problems associated with both.

1. Party One creates a session key using a symmetric algorithm.
2. Party One then encrypts the session key, using the public key of Party Two, and sends the encrypted session key to Party Two.
3. Party Two uses their private key to decrypt the session key.
4. Both parties now communicate using the symmetric session key for encryption.

### Secure Shell

`telnet` is one of the earlier protocols developed for the Internet back in 1969 and was not built with security in mind, the protocol is sent over the wire in plain text.

Remote Shell `rsh` was originally written for the BSD (Berkeley Software Distribution) system in 1983. `rsh` is a similar system to `telnet` and is an insecure protocol, which is not encrypted and sends data in clear text.

The Secure Shell (`ssh`) protocol was developed to overcome the security concerns of `telnet` and `rsh`.

OpenSSH is the most widely used version of SSH and is built upon the concepts of symmetric and asymmetric encryption.

OpenSSH Architecture Layers:

- transport layer - deals with the initial key-exchange and setting up a symmetric-key session and establish the connection layer.
- user auth layer - deals with authenticating and authorizing the user accounts.
- connection layer - deals with the communication once the session is set up.

The OpenSSH host-wide client configuration is `/etc/ssh/ssh_config`. The per-user client configuration is each user's `$HOME/.ssh/config`. SSH uses a key-based authentication. Syntax can be found with `man 5 ssh_config`

Other protocols can be tunneled over SSH. The X11 protocol support is part of the OpenSSH client. You can also manually open a connection for any other protocol using the LocalForward and RemoteForward tokens in the OpenSSH client configuration.

#### Client SSH config

`$HOME/.ssh/config` can be set up with shortcuts to servers you frequently access.

As an example, you can do `ssh web` rather than typing `ssh webusr@www.example.com`:

```
Host web
  HostName www.example.com
  User webusr
```

More advanced configuration:

```
Host web
  KeepAlive yes
  IdentityFile ~/.ssh/web_id_rsa
  HostName www.example.com
  Port 2222
  User webusr
  ForwardX11 no
Host  *
  Port 22
```

OpenSSH client key-based authentication provides a **passwordless** authentication for users. Private keys can be encrypted and password protected. `ssh-agent` program can cache decrypted private keys. `ssh-copy-id` program can copy your public key to a remote host.

```sh
# To generate a user key for SSH authentication, use:
$ ssh-keygen -f $HOME/.ssh/id_rsa -N 'supersecret' -t rsa
# To start ssh-agent and use it to cache your private key, use:
$ eval $(ssh-agent)
$ ssh-add $HOME/.ssh/id_rsa
# To copy your public key to the remote system overthere for remote user joe, use:
$ ssh-copy-id joe@overthere
```

#### OpenSSH Tunnel

<img src="https://d36ai2hkxl16us.cloudfront.net/course-uploads/e0df7fbf-a057-42af-8a1f-590912be5460/vsm3q4vd0omm-wur4d50lt2am-OpenSSHTunnel.png" />

The local tunnel (`ssh -L`) indicates which port is to be opened on the local host (4242) and the final destination to be (charlie:2200), and the connection to the final destination is made by machine (bob).

The remote tunnel (`ssh -R`) requests machine (bob) to open a listening port (2424) to which any connection will be transferred to the destination, (charlie:2200).

There is also dynamic port forwarding using `ssh -B`. Option `-N` sets the option to not execute a command on connection to the remote system, and option `-f` informs ssh to go into background just before command execution.

#### Parallel SSH Commands

The `pssh` package is available for execute the same command on many systems, which includes:

- pssh: parallel ssh
- pnuke: parallel process kill
- prsync: parallel copy program using rsync
- pscp: parallel copy using scp
- pslurp: parallel copy from hosts

The pssh command and friends use the existing ssh configuration. It is best to configure aliases, keys, known hosts and authorized keys prior to attempting to use pssh. If there is a password or fingerprint prompt, the pssh command will FAIL.

When using pssh, it is convenient to create a file with a list of the hosts you wish to access. The list can contain IP addresses or hostnames.

```sh
$ cat ~/ips.txt
127.0.0.1
192.168.42.1
$ pssh -i -h ~/ips.txt date
[1] 10:07:35 [SUCCESS] 120.0.0.1
Thu Sep 28 10:07:35 CDT 2017
[2] 10:07:35 [SUCCESS] 192.168.42.1
Thu Sep 28 10:07:35 CDT 2017
```

### VNC Server

The Virtual Network Computing (VNC) server allows for cross-platform, graphical remote access. The most common implementation is `tigervnc` client and server.

The server component has `Xvnc` (the main server for VNC and X), `vncserver` (Perl script to control Xvnc), `vncpasswd` (set and change vnc-only password), and `vncconfig` (configure and control a running Xvnc).

When the server starts, it uses the xstartup configuration from the users `~/.vnc` directory. If the xstartup file is altered, the vncserver needs to be restarted.

VNC is a display-based protocol, which makes it cross-platform. It also means that it is a relatively heavy protocol, as pixel updates have to be sent over-the-wire.

The client, `vncviewer`, is usually packaged separately. It connects to the VNC server on the specified port or display number. Passwords are not sent in clear text. On its own, VNC is not secure after the authentication step. However, the protocol can be tunneled through SSH or VPN connections.

#### X Window System

The X Window system was developed as part of Project Athena at MIT in 1984. This simple network-transparent GUI system provides basic GUI primitives and is network transparent, allowing for ease of use.

When it comes to X authentication, the client-server security is done using keys.

To secure the X protocol, it must be tunneled with VPN or SSH. OpenSSH supports X11 tunneling via `-X` option.

## Domain Name Service

Before `DNS`, there was `ARPANET`. The original solution to a name service was a flat text file called HOSTS.TXT. This file was hosted on a single machine, and, when you wanted to get a copy, you pulled it from this central server using File Transfer Protocol (FTP) or a similar protocol.

A descendant of the HOSTS.TXT file is the `/etc/hosts` file. It has a very simple syntax: `<IP ADDRESS> <HOSTNAME> [HOSTNAME or alias] ...`. This hosts file usually takes precedence over other resolution methods.

**The Domain Name System** (DNS) is a distributed, hierarchical database for converting DNS names into IP addresses. The DNS protocol runs in two modes: `recursive with caching, authoritative`

When a network node makes a DNS query, it most often makes that query against a recursive, caching server. That recursive, caching server will then make a recursive query through the DNS database, until it comes to an authoritative server. The authoritative server will then send the answer for the query.

<img src="https://d36ai2hkxl16us.cloudfront.net/course-uploads/e0df7fbf-a057-42af-8a1f-590912be5460/jq1cp4ny4pui-DNS-Tree.png" />

The DNS database consists of a tree-like, key-value store. The database is broken into tree nodes called Domains. These domains are managed as part of a zone. Zones are the area of the namespace managed by authoritative server(s). DNS delegation is done on zone boundaries.

<img src="https://d36ai2hkxl16us.cloudfront.net/course-uploads/e0df7fbf-a057-42af-8a1f-590912be5460/muu8okika9sp-DNS-Query.png" />

The Caching Server most likely have already cached those frequently accessed top domains so this process would usually be fast.

### Query/Record Types

- A Record - Address Mapping Records, a 32bit IPv4 address.
- AAAA Record - IP Version 6 Address Records, a 128big IPv6 address.
- CNAME - Canonical Name Records, an alias to another name
- MX - Mail Exchanger Records, the message transfer agents (mail servers) for a domain.
- NS - Nameserver Records, delegate an authoritative DNS zone nameserver.
- PTR - Reverse-Lookup Pointer Records, pointer to a canonical name (IP address to name).
- SOA - Start of Authority Records, Start of Authority for a domain (domain and zone settings).
- TXT - Text Records, arbitrary human-readable text, or machine-readable data for specific purposes.

More about [DNS](https://www.ietf.org/rfc/rfc1034.txt){target=_blank}

### DNS Queries

**Forward DNS queries** use A or AAAA record types and are most often used to turn a `DNS` name into an IP address.

A **Fully Qualified Domain Name** (FQDN) is the full DNS address in the DNS database, and the most significant part is first.

A **reverse DNS query** is used to turn an IP address into a DNS name. It uses a `PTR` record type and an `arpa.` domain in a DNS database. In an IP address, the most significant part is on the right; we have to translate an IP address to put it into the DNS database. i.e. `192.168.13.32` becomes `32.13.168.192.in-addr.arpa.`; `2001:500:88:200::10` becomes `0.1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.2.0.8.8.0.0.0.0.5.0.1.0.0.2.ip6.arpa.`

See [popular DNS servers](https://en.wikipedia.org/wiki/Comparison_of_DNS_server_software){target=_blank}.

#### DNS Client

Network configuration is more dynamic and the nameserver entries need to be adjusted dynamically.

In most distros, the nameserver information may be added to the interface configuration file, overwriting or modifying the `/etc/resolv.conf` when the interface is started.

The DHCP Server often provides nameserver information as part of the information sent to the DHCP client, replacing the existing nameserver records.

`resolvconf` service uses additional files like `/etc/resolvconf.conf` and a background service resolvconf.service to "optimize" the contents of /etc/resolv.conf.

`dnsmasq` sets up in "mini" caching DNS server and may alter the resolver configuration to look at dnsmasq instead of the items listed in /etc/resolv.conf.

`systemd.resolved` provides a DNS stub listener on IP address 127.0.0.53 on the loopback adapter and takes input from several files including: `/etc/systemd/resolved.conf, /etc/systemd/network/*.network` and any DNS information made available by other services like "dnsmasq".

### BIND

`BIND`, Berkeley Internet Name Domain, is a widely-used, ISC standard DNS Internet software available for most UNIX-type systems. Its configuration file is `/etc/named.conf` or `/etc/bind/named.conf`, syntax specified in `man 5 named.conf`. On CenOS or SUSE distro, its package is `bind` and the service is `named`; on Ubuntu, its package is `bind9` and the service is also `bind9`.

Authoritative zones are defined and must contain an SOA (Start of Authority) record. Zone files should contain an NS (nameserver) record.

Some of the syntax considerations include:

- The record format is: "{name} {ttl} {class} {type} {data}"
- Always use trailing "." on all fully-qualified domain names
- @ special character
- GENERATE syntax
- Comment marker - ; to end of line.

The SOA (Start of Authority) is required for every zone. Special control fields include:

- Admin email
- Primary name server
- Serial number
- Timers (secondary server refresh settings)
    - Refresh: How often to check for new serial from primary.
    - Retry: How often to retry if no response from primary.
    - Expire: How long to keep returning authoritative answers when we cannot reach the primary server.
    - Negative TTL: How long to cache an NX domain answer.

A **DNS view** (aka split horizon) will cause the DNS server to respond with different data depending on the match criteria, such as source IP address:

- it can provide different DNS answers to requests depending on selection criteria
- uses multiple zone files with different data for the same zone
- can provide DNS services inside a corporation using private or non-routable addresses.​​​​​​​​​​​​​​

### DNS Tools

Tools for DNS testing are in three categories: server configuration testing, server information testing, and server update.

DNS client tools formulate a standard DNS request and send it off to the default or named DNS server.

`dig` (domain information groper) queries DNS for for domain name or ip address mapping, and output format resembles the records used by the DNS server.

`host` is a simple interface for DNS queries, good for use in scripts

`nslookup` queries DNS for domain name or IP address mapping and less verbose than `dig`

`nsupdate` end updates to a name server and requires authentication and permission

## HTTP Servers

Apache used to be the lead technology of all active web servers. The location of the Apache configuration files move from distribution to distribution, and so is its systemd.service name and package name.

```sh
# On RedHat, CentOS, or Fedora:
Package: httpd
Service: httpd
Primary configuration file: /etc/httpd/conf/httpd.conf

# On OpenSUSE:
Package: apache2
Service: apache2
Primary configuration file: /etc/apache2/httpd.conf

# On Debian, Ubuntu, or Linux Mint:
Package: apache2
Service: apache2
Primary configuration file: /etc/apache2/apache2.conf
```

Apache allows include other files and directories from the primary configuration files, just like a drop-in configuration file. The default include directories are:

```sh
# CentOS:
/etc/httpd/conf.d/*.conf

# OpenSUSE:
/etc/apache2/conf.d/
/etc/apache2/*

# Ubuntu:
/etc/apache2/*-enabled
/etc/apache2/*-available/
```

Other important files include the document root (`/var/www/html/, /srv/www/htdocs`), log file locations (`/var/log/httpd, /var/log/apache2`), and module locations.

### Logs

To create custom logs on an Apache server, you must first define a custom log format: `LogFormat "example-custom-fmt %h %l %u %t "%r" %>s %b" example-custom-fmt`

Variable | Explanation
-------- | -----------
%h|Remote host name
%l|Remote login name
​%u|Remote user
%t|​Time of request
%r|First line of request
​%s|Status
%b|Size of response

More tokens reference is here [apache mod_log_config](http://httpd.apache.org/docs/2.2/mod/mod_log_config.html#formats){target=_blank}

### mod_userdir

The `mod_userdir` module is used to allow all or some users to share a part of their home directory via the web server, even without access to the main document root. The URIs will look something like http://example.com/~user/index.html and will commonly be placed in the /home/user/public_html/ directory.

### IP/Port Virtual Hosts

For multiple web sites using multiple addresses/ports, use VirtualHost stanzas, and a unique IP address and port pair. Ensure all of the IP addresses and ports are defined in a Listen directive, and add a stanza for each virtual host. i.e.

```
Listen 192.168.42.11:4374
<VirtualHost 192.168.42.11:4374>
   ServerAdmin webmaster@host1.example.com
    DocumentRoot /www/docs/host1.example.com
    ServerName host1.example.com
    ErrorLog logs/host1.example.com-error_log
    CustomLog logs/host1.example.com-access_log common
</VirtualHost>
```

To enable a name-based virtual host for an IP/Port, create a VirtualHost stanza and modify the DocumentRoot and ServerName directives. Host names which are not defined in a VirtualHost stanza which match the IP address and port will be served by the first VirtualHost stanza.

Name-based virtual hosts have some SSL limitations. Due to the way SSL works, the server has no way of knowing which host name is being sent by the client before the SSL session is started. The server cannot send the proper certificate back to the client without the proper host name. This has been worked around by using [Server Name Indication](https://en.wikipedia.org/wiki/Server_Name_Indication){target=_blank} (SNI).

### Access Control

Password-protected directories are protected via SSL. Use `htpasswd` to create new passwords. See `man 1 htpasswd`. Per-User Access Control is activated using AllowOverride (.htaccess file). i.e.

```
<Location /secure/>
    AuthType Basic
    AuthName "Restricted Files"
    AuthUserFile secure.passwords
    Require valid-user
</Location>
<Directory /var/www/html/get-only/>
  <LimitExcept GET>
    Require valid-user
  </LimitExcept>
</Directory>
```

Filesystem permissions must allow access for the user the Apache httpd daemon is running under (`apache` on most systems).

A properly configured SELinux system can increase the security of an Apache web server. There are some settings you may need to change:

- To allow Apache to make outbound network connections (not directly related to serving a request), modify the httpd_can_network_connect boolean.
- The default Document Root and CGI root have the proper SELinux context. If you serve files from outside those locations, you need to use the chcon command.
- To enable the userdir module, modify the httpd_read_user_content boolean.
- To serve files from an NFS filesystem, modify the httpd_use_nfs boolean.

### Secure Sockets Layer

While HTTP is a clear text protocol, **Secure Sockets Layer** (SSL) is a port-based vhost. Types of SSL certificates include:

- Self-signed: for hobby or testing use.
- Certificate Authority Signed (Certificate Signing Request or CSR)​.

```sh
# generate a private key
$ openssl genrsa -aes128 2048 > server.key
# generate a CSR
$ openssl req -new -key server.key -out server.csr
# generate a self-signed certificate
$ openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
# remove the encryption on private key (not recommended)
$ openssl rsa -in server.key -out server.key.unlocked
```

To install the keys, change the configuration file (`ssl.config`) or place them

```sh
# On CentOS:
/etc/pki/tls/certs/localhost.crt: Signed Certificate
/etc/pki/tls/private/localhost.key: Private Key
# On OpenSUSE:
/etc/apache2/ssl.crt/server.crt: Signed Certificate
/etc/apache2/ssl.key/server.key: Private Key
# On Ubuntu:
/etc/ssl/certs/ssl-cert.pem: Signed Certificate
/etc/ssl/private/ssl-cert.key: Private Key
```

### Rewriting rules with mod_rewrite

**URL rewriting** is a powerful way to modify the request that an Apache process receives. Modifications can include moved documents, forcing SSL, forcing login, human-readable URIs, and redirecting based on the browser.

Rewrite rules can exist in the `.htaccess` files, the main `configuration file`, or `<Directory>` stanzas. The `.htaccess` files seem the most common, but the main configuration file may be more secure.

The mod_rewrite uses **PCRE** (Perl Compatible Regular Expressions). This provides nearly unlimited conditions or filters to include, like:

- Time of day
- Environment variables
- URLs or query strings
- HTTP headers
- External scripts

Use a [rewrite map](http://httpd.apache.org/docs/current/rewrite/rewritemap.html){target=_blank} for advanced or dynamic rewrite rules, which is useful when rewrite rules are too complex or numerous.. Pre-compiled rewrite maps exist for specific purposes, i.e. [WURFL](http://wurfl.sourceforge.net/){target=_blank}.

There are many different types of maps:

- txt: Flat text
- dbm: DBM hash (indexed)
- rnd: Randomized plain text
- prg: External program

Some rewriting examples

```sh
# turn on the rewrite engine
RewriteEngine on
# force a redirect to a new location for a document
RewriteRule ˆ/old.html$ new.html [R]
# rewrite a URI based on the web browser (without a redirect), use:
RewriteCond %{HTTP_USER_AGENT} .*Chrome.*
RewriteRule ˆ/foo.html$ /chrome.html [L]
# create a human-readable URI from a CGI script (the PT or Passthrough flag: without it, the rewrite is treated as a file, not a URI)
RewriteRule ˆ/script/(.*) /cgi-bin/script.cgi?$1 [L,PT]
```

### mod_alias

The `mod_alias` maps URIs to filesystem paths outside of normal `DocumentRoot`. It also provides `Alias` and `Redirect` directives, Apache access control considerations, file permission considerations, and SELinux considerations.

`mod_alias` is much simpler than `mod_rewrite`. A redirect directive sends a redirect that is similar to the `[R]` flag for `mod_rewrite`. `AliasMatch` allows use of regular expressions. Example:

```sh
# serve the files located at /newdocroot/ under the URI /new/ (the <Directory> stanza for access control modifications)
Alias /new/ /newdocroot/
<Directory /newdocroot/>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
# serve the files located at /newdocroot/<SUBDIR> under the URI /new/<SUBDIR> with different permissions for each
AliasMatch \ˆ{}/new/(.*)$ /newdocroot/$1
<Directory /newdocroot/foo/>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
<Directory /newdocroot/bar/>
    Options -Indexes FollowSymLinks
    Require all granted
</Directory>
```

There are two ways to run scripts outside your document root:

- Create an `Alias` and set the handler to `cgi-script`.
- Use `ScriptAlias` (does the above automatically).

Because of the nature of Common Gateway Interface (CGI) scripts, they should not be directly served as plain files and should not be in your document root. Example

```sh
ScriptAlias /newscripts/ /newscripts-docroot/
<Directory /newscripts-docroot/>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

### mod_status, mod_include, mod_perl

`mod_status` provides an endpoint to show characteristics:

- Apache server status
- Human-readable page
- Machine-readable page
- Security considerations with access control and extended status

`mod_include` provides filtering before a response is sent to the client. It is enabled with the `+Includes` directive. By default, this is enabled only for `*.shtml` files, but it can be enabled for all `*.html` files with the `XBitHack` directive, and execute permission should be set on the file.

`mod_perl` is a Perl interpreter embedded in Apache. It can provide full access to the entire Apache API, sharing information between Apache processes. CGI scripts can run unmodified. However, some CPAN (Comprehensive Perl Archive Network) modules are not thread-safe, therefore they do not work with the worker MPM (Multi-Processing Module). Some Perl methods like `die()` and `exit()` can cause performance issues.

Example:

```sh
<Location /status>
  SetHandler server-status
  Require ip 10.100.0.0/24
</Location>

<Location /dynamic/>
   Options +Includes
   XBitHack on
</Location>
# An HTML file which had includes would contain:
<!--#set var="dude" value="yes" -->
<!--#echo var="dude" -->
<!--#include virtual="http://localhost/includes/foo.html" -->

Alias /perl /var/www/perl
<Directory /var/www/perl>
   SetHandler perl-script
   PerlResponseHandler ModPerl::Registry
   PerlOptions +ParseHeaders
   Options +ExecCGI
</Directory>
```

### Multi-Processing Modules (MPMs)

The **Prefork** MPM is the default MPM, non-threaded, safe for non-thread-safe scripts and libraries. It uses more memory and resources to handle the same number of connections compared to others.

The **Worker** MPM is a hybrid multi-process, multi-threaded model. Each sub-process spawns threads which handle the incoming connections and perform better from the lighter threads than processes.

The **Event** MPM is based on the Worker MPM but it off-loads some of the request handling to shared processes and further boosts performance.

Some Prefork configurations:

- `StartServers` - number of child server processes to create on startup
- `MinSpareServers` - min number of child server processes to keep on hand to serve incoming requests
- `MaxSpareServers` - max number of child server processes to keep on hand to serve incoming requests
- `MaxRequestsPerChild` - max number of requests a child server process serves
- `MaxClients` - max number of simultaneous connections to serve. May also have to increase the `ServerLimit` directive

Some Worker configurations in addition to the Prefork:

- MinSpareThreads - min number of worker threads to keep on hand to serve incoming requests
- MaxSpareThreads - max number of worker threads to keep on hand to serve incoming requests
- ThreadsPerChild - number of worker threads in each child server process

### Load Test

The best testing results come from using URIs which match the real-life workflow. Apachebench (`ab`) is the tool provided as a part of the Apache httpd server package. Httperf (`httperf`) can use log files as a source of URIs to load test.

### Load Balance

Apache load balancer requires the modules `mod_proxy` (along with its complementary modules) and `mod_proxy_balancer` which have specialized modules for the balancing strategy:

- `mod_libmethod_byrequests` (request counting)
- `mod_libmethod_traffic` (weighted traffic counting)
- `mod_libmethod_bybusyness` (pending request counting)
- `mod_libmethod_heartbeat` (heartbeat traffic counting)

A minimal configuration as an example:

```sh
<VirtualHost *:80>
    ProxyRequests off
    ServerName www.somedomain.com
    <Proxy balancer://mycluster>
        BalancerMember ht‌tp://10.176.42.144:80 #minion1
        BalancerMember ht‌tp://10.176.42.148:80 #minion2
        BalancerMember ht‌tp://10.176.42.150:80 #minion3
        Require all granted # all requests are allowed
        ProxySet lbmethod=byrequests # balancer setting, round-robin
    </Proxy>
    ProxyPass / balancer://mycluster/
</VirtualHost>
```

### Cacheing and Proxy

Apache can act as a **forward** or **reverse proxy** that is managed by `mod_proxy` and `mod_proxy_http`. However, there are special-purpose tools which do caching much more efficiently:

- Varnish: A RAM and disk-based cache which uses the Linux kernel's swapping mechanism to speed up caching.
- Squid: A general-purpose caching proxy.

```sh
# enable a reverse proxy to an internal server
<Location /foo>
    ProxyPass ht‌tp://appserver1.example.com/foo
</Location>
# alternative syntax
ProxyPass /foo ht‌tp://appserver1.example.com/foo
```

### C10k Problem and Speciality HTTP Servers

The **C10k Problem** describes the issues in making a web server which can scale to ten thousand concurrent connections/requests.

Specialty HTTP servers have been developed to deal with different issues.

- cherokee - innovative web-based configuration panel, very fast in serving dynamic and static content
- nginx - has a small resource footprint, scales well from small servers to high performance web servers
- lighttpd - power some high-profile sites, light-weight and scales well

