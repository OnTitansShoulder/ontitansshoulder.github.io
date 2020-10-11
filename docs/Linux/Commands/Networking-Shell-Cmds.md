---
layout: note_page
title: Freq Used Network Cmds
title_short: linux_network_commands
dateStr: 2019-04-01
category: Linux
tags: notes reference
---

## Linux Networking Related Commands/Knowledge

To connect to Internet, proper settings of IP, Netmask, Gateway, DNS IP, and device name are all required.

### Linux based on CentOS

**Linux NIC**

Network Interface Card are named like modules in Linux, like `eth0` for the first NIC, `eth1` for the second NIC, and so on.

- Use *dmesg* to view specific device info. Like `dmesg | grep -in eth`
- Use *lsmod* to view whether the device is loaded by kernel. Like `lsmod | grep 1000`
- Use *modinfo* to view details about this device, passing in the device number, like `e1000`
  - the filename portion is the NIC driver for current Kernel version.
- Use *ifconfig* to lookup the NIC number for a device.
- write driver for your NIC, see Book2 P113

**Linux Networks config files**

- /etc/services: sets port number for protocols
- /etc/protocols: defines protocols' related info
- /etc/init.d/networking restart: this is an important script to reset entire network to default
- ifup eth0 (ifdown eth0): a script to turn on or off one of the network device

modify|config file and important script|commands to view results
------|--------------------------------|------------------------
IP related|/etc/sysconfig/network-scripts/ifcfg-eth0; /etc/init.d/network restart|ifconfig; route -n
DNS|/etc/resolv.conf|dig www.google.com
host|/etc/sysconfig/network|hostname; ping hostname; reboot

`vim /etc/sysconfig/network-scripts/ifcfg-eth0`

```
DEVICE="eth0" <== device number, must match ifcfg-eth0
HWADDR="08:00:27:71:85:BD" <== NIC address (MAC), can be omitted if having only one NIC
NM_CONTROLLED="no" <== uncontrolled by other software
ONBOOT="yes" <== startup on bootup
BOOTPROTO=none <== can be ''dhcp'' or 'none'
IPADDR=192.168.1.100 <== id address
NETMASK=255.255.255.0 <== subnet mask
GATEWAY=192.168.1.254 <== router
# 重点是上面这几个设定项目,底下的则可以省略的啰!
NETWORK=192.168.1.0 <== first IP of this network segment
BROADCAST=192.168.1.255 <== broadcast IP
MTU=1500 <== max transmition unit
```

the file /etc/resolv.conf contains information about the IP address of DNS nameserver

the command *dig* shows which DNS nameserver is used to reach an IP, which is part of a package called `bind-utils`

**change host name**

change /etc/sysconfig/network and /etc/hosts

Book2 P123

**ADSL configuration**

Book2 P124

**Access Point**

When connecting to a router, in fact you are connecting to its Wireless Access Point(AP)

When you are exposed under multiple AP range, you can detect many APs.

Each AP has a SSID or ESSID for the client to identify the right AP.

*lsusb* is part of usbutils package, that can show usb devices plugged-in

### Linux Networking Commands

**set on/off IP parameters**

*ifconfig* can directly change IP config for a NIC device.

- `ifconfig [interface] [up|down|options]`
  - up, down: like the commands below
  - mtu: change mtu value
  - netmask: set subnet mask
  - broadcast: set broadcast address

*ifup*, *ifdown* can only turn on/off of the device, not changing its parameters

**set router parameters**

*route* is the command to use

- `route [-nee]`
- `route add/del [-net|-host] [ip] netmask [mask]`

The command *ip* is like a combination of *ifconfig* and *route*

**host to host communication**

*ping*

- `ping [options and parameters] IP`
  - -c numb: execute ping numb times
  - -n: don't lookup hostname, use IP directly
  - -s numb: the ICMP packet size is numb bytes
  - -t numb: TTL's limit is numb
  - -W numb: numb seconds to wait for respond
  - -M [do|dont]: to test MTU size, do means send a DF(Don't Fragment) flag packet

**analyze nodes b/w host to host**

*traceroute*

- `traceroute [options and parameters] IP`
  - -n: don't lookup hostname, use IP directly
  - -U: use UDP port 33434 to test
  - -I: use ICMP to test
  - -T: use TCP port 80 to test
  - -w numb: numb seconds to wait for respond
  - -p port: use other port to test
  - -i: only used when need to specify which AP to use

**view current machine's network stats**

*netstat*

- `netstat -[rn]` related to router
- `netstat -[antulpc]` related to network ports
  - -r: show route table
  - -n: don't lookup hostname, use IP directly
  - -a: show all, including tcp/udp/unix socket
  - -t show only TCP connections
  - -u: show only UDP connections
  - -l: show only listening services
  - -p: show PID and Program filename
  - -c: update after N seconds

**hostname, hostname lookup**

*host* can give you some host's IP. use `host [-a] hostname [server]` to get more info

*nslookup* does similar thing. `nslookup [-query=[type]] [hostname|IP]`

### Remote control

**terminal and BBS: telnet**

*telnet* can combine with BBS and connect to a remote server. The downside is that it is not encrypted. `telnet [host|IP [port]]`

**FTP file transfer**

*ftp*, *lftp*, *gftp* can be used for this purpose. *gftp* has to be in X window mode

`ftp [host|IP] [port]` to log in a system. use 'anonymous' to login anonymously. type help for useful commands.

use *lftp* to call scripts and speed up the process of logging in. Book2 P173

### Internet Surfing in Command Mode

**links**

*links* command allows you to view pure html docs. `links URL/path_to_HTML`

there is no css styling nor img showing

- some freq-used shortcut:
 - h: history of viewing
 - g: goto URL
 - d: download a URL link's target
 - q: quit
 - o: option, set preferences
 - up/down arrow: move to next anchor
 - left/right arrow: move back/forward in pages
 - ENTER: like right-click

can use `links -dump url > index.html` to download an entire page

**wget**

*wget* is used to fetch data from web servers. `wget [option] URL`

- options:
  - --http-user=username
  - --http-password=password
  - --quiet

can also set proxy at /etc/wgetrc

### Packet catching

*tcpdump* allows you to intercept packet, analyze its contents. It provides so much information, that is categorized as a hecker software. Must be root to run it.

Book2 P182

*wireshark* or *burp* is the equivalent in X window mode
