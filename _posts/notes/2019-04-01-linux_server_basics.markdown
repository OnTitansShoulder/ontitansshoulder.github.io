---
layout: note_page
title: Basic Linux Server Concepts & Commands
title_short: linux_server_concepts
dateStr: 2019-04-01
category: Linux
tags: notes reference
---
## Linux Server Setup and Maintain

*netstat*

**IP**
127.0.0.1 - available on the local machine only.
0.0.0.0 - open to the Internet

**Frequently used ports**
- 80: www
- 22: ssh
- 21: ftp
- 25: mail
- 111: RPC (remote process control)
- 631: CPUS (printer services)

Install CentOS requirements on P15

#### Linux Error Debugging

Skipped, Book2 P194

#### Linux Network Security

Linux already comes with two layers of Firewall
**IP Filtering or Net Filtering**
It analyzes TCP/IP header to filter unwanted packets
**TCP Wrappers**
/etc/hosts.allow and /etc/hosts.deny settings decide whether to use the packet.

#### Linux Software Distribution and Update

**RPM**
one of the most popular Linux Software package manager among CentOS, Fedora, SuSE, Red Hat, Mandriva, etc.
Packages are precompiled binaries.
**Tarball**
Use source code to compile and install. Every update need recompile.
**dpkg**
Provided with Debian Linux.
Packages are precompiled binaries.

To achieve Auto-updates, tarball is not a choice to have.

**yum**
CentOS and Fedora used over FTP or WWW to auto update software
**apt**
from Debian. Portable.
**you**
Yast Online Update, by SuSE
**urpmi**
Mandriva Linux

*yum* install, search, list, info, grouplist, groupinstall ... Book2 P226

`yum update` will update the OS

`netstat -tunp` show service, PID, IP and port
`nmap -sTU localhost` show all TCP/UDP ports
`nmap -sP localhost` show all hosts in current LAN

**Find and stop a service**
```
which rpcbind
rpm -qf /sbin/rpcbind
rpm -qc rpcbind | grep init
/etc/init.d/rpcbind stop
```

Book2 P242 SELinux

#### Routing and Router

Router is for deciding packet path and direction.
Use *route* to view routing and set preferences.
Use *traceroute* to analyze each packet flow.
Dynamic routing can be achieved with the help of software.

**IP Aliasing**
can make virtual connector to make the NIC having multiple IP.
- good for testing
- easy way to having computers within the same network segment
can use *ifconfig* to achieve this:
`ifconfig [device] [IP] netmask [netmask IP] [up|down]`

modify /etc/sysctl.conf to turn a Linux machine into a router: set `net.ipv4.ip_forward=1`
The way Linux sets routing table differs by:
- static routing: set routing table from Kernel.
- dynamic routing: using software like Quagga or Zebra to monitor network changes and update Linux Kernel routing tables

**Turn Linux into a Router**
Book2 P277

#### Firewall and NAT Server

Firewall is used to filter Internet packets according to some rules.
NAT (Network Address Translation) Server is like an IP sharer with added functionality of IP translation.
Linux NAT server can change packet IP header to target IP, to let private IP packet change into having a public IP and connect to Internet.

**Netfilter**
analyze the Internet packets enters the machine, analyze their headers and decide to proceed or block.
Netfilter provides iptables for filtering command.
- refuse some packets to enter some machines
- refuse some packets from specific IPs
- refuse some packets with specific flags
- refuse some packets by its MAC address

**TCP Wrappers**
analyze programs' access to Networks according to a set of rules.

**Proxy Server**
The proxy server carries out the request of its clients.
Client could be offline from Internet, only need to connect to the proxy server.
This single Proxy Server can be combined with a firewall to keep all machines behind the wall safe from attacks.
Can also monitor the traffic in/out.

**iptables**
![iptables]('iptables.png')
`iptables [-t tables] [-L] [-nv]`
- -t: follows table, like nat or filter
- -L: list table rules
- -n: not look up IP and hostname, faster
- -v: show more info like number of packet, connection..

What's being shown:
- target: ACCEPT, REJECT, or DROP
- prot: protocol: tcp, udp, icmp, or all
- opt: other optional info
- source: this rule is valid on source IP
- destination: this rule is valid on destination IP

*iptables-save* can list the complete unformatted information
more on rules setting on Book2 P318
It is best to use scripts to setup firewall.

**NAT Server**
NAT can change the source/destination IP and ports info from the packets.
i.e. :
(SNAT) when a machine in the LAN sent a request out, it first reaches the router and the NAT replaces its source IP with a public IP (this mapping will be stored in NAT table) and the packet is forwarded onto the Internet.
(DNAT) When a packet of response is back, it reaches the router and the NAT replaces its public IP with the machine IP from the mapping in NAT table. Then this packet continue to reach its target machine in the LAN.
Settings using *iptables* see Book2 P341
`iptables -t nat -A POSTROUTING -o eth0 -j SNAT --to-source 192.168.1.210-192.168.1.220`
`iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j DNAT --to-destination 192.168.100.10:80`

#### Domain and Static IP

each router uses DHCP to get a public IP from ISP periodatically.
If your server is built in this case, for the outside to know its IP, need to have the new IP udpated with DNSs periodically as well.

#### Servers in LAN

**Remote Server**
Remote Server allows sharing Unix Like machines computing power
Allows you to change server/machine settings anytime anywhere.
