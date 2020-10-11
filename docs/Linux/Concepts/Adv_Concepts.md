---
layout: note_page
title: Linux Advanced Must-know
title_short: linux_advanced
dateStr: 2019-04-01
category: Linux
tags: notes reference check
---

Big thanks to vbird from linux.vbird.org for this great educational resource. Here are my reading notes taken.

### Process Management and SELinux

**process and program**

- **program**: usually binary program, stored within physical media like hard-drives
- **process**: when a program is executed, executor's access and program data being loaded into the memory and OS gets assigned a _PID_
- `fork` and `exec`
  - system fork a parent process as temporary process to execute the child program
  - a PID is assigned and PPID is the parent's PID
  - temporary process exec the child program and becomes the child process

**system service programs**

these type of programs' processes are called **daemon**s; they started listening a port and provide access from clients.

**job control**

- **foreground jobs**: the jobs actively prompting in the terminal and is interact-able
- **background jobs**: the jobs running in the background without interaction with the user
  - appending `&` to commands will be thrown to the background
- switching jobs: in the middle of running a command, press `ctrl-z` to pause it and throw it to the background
- use **`jobs`** command to check running/stopped jobs
  - lists process recently put into the background, with (+) means next retrieving job using `fg` and (-) means the second latest job put into hte background
  - `jobs [-lrs]`
  - `-l`: show PID
  - `-r`: show running only
  - `-s`: show stopped only
- **`fg`** to bring back a job suspended.
  - `fg %<jobnumber>` use it without _jobnumber_ will bring back the one with (+)
  - can also `fg -` to bring back the one with (-)
- **`bg`** can make a stopped job running in the background again
  - `bg %<jobnumber>` will also append `&` to the job command
- **`kill`** can remove jobs or restart jobs
  - `kill -<signal> %<jobnumber>` the `<signal>` can be a number or text:
  - `-l`: list all kill signals
  - `-1`: reload configuration files
  - `-2`: like entering ctrl-c to interrupt a process
  - `-9`: forced stop
  - `-15`: normal termination
  - `-17`: like entering ctrl-z to stop a process
  - `kill -<signal> PID` also works
- `killall` can work on all running processes of a command, useful if you don't want bother to lookup its PID
  - `killall [-iIe] [-signal] [command_name]`
  - `-i`: interactive
  - `-e`: exact, means the command_name must match
  - `-I`: command_name ignore cases

**offline jobs**

Notice the background from job control is not "system background", it is just a way to help you run and manage multiple things in the terminal.

If there is need to run a job even after logged out of the system, then offline jobs may help.

While `at` works for this case, `nohup` can also work!

- `nohup <command>` or `nohup <command> &` to run in the background

**process management**

**`ps`** command shows process info at a time point

- `ps -auxlAjf`
- `-A`: show all process, same as `-e`
- `-a`: show process without terminal processes
- `-u`: show effective user's processes
- `-x`: shows complete info, usually used with `-a`
- `-l`: shows more detailed and longer process info
- `-j`: jobs format
- `-f`: more complete output

**Several useful `ps` combination should be remembered:**

`ps -l` shows only your process related to this bash. Some columns explained:

- `F` represents process flags, means this process's access
  - 4 means root
  - 1 means forked but not exec
- `S` represents Status
  - R: running
  - S: sleep, idle, can be signaled to wakeup
  - D: usually doing I/O, cannot be wakeup
  - T: stop, might be under job control
  - Z: zombie, process terminated but cannot be moved out of memory
- `C` represents CUP usage percentage
- `PRI/NI` is short for priority/nice, means the priority for CPU to execute it. Smaller number means higher priority
- `ADDR/SZ/WCHAN` related to memory, ADDR is a kernel function showing which part of memory; SZ means size; WCHAN means whether it is running ('-' means running)
- `TTY`: user's terminal from logged in
- `TIME`: CPU time used
- `CMD`: command

`ps aux` shows all process. Some columns explained:

- `USER` the process belongs to
- `PID` that process has
- `%CPU` usage
- `%MEM` usage
- `VSZ` virtual memory usage (Kbytes)
- `RSS` physical memory usage (Kbytes)
- `TTY` from which terminal, if pts/n, means logged in from remote terminal
- `STAT`, status, shows the same as `ps -l`
- `TIME`, actual CPU usage in time unit
- `COMMAND`, which command triggered

`ps -axjf` shows all processes in a tree view fashion

- `pstree` can be another way to show process hierarchical relationships in a tree fashion
- `pastree [-A|U] [-up]`
- `-A`: use ASCII char to represent tree
- `-U`: use UTF char to represent tree
- `-p`: show process PID
- `-u`: show process user

**continuous monitoring processes**

`ps` shows process info one at a time, **`top`** monitor all process info over time

- `top [-d numb] | top [-bnp]`
- `-d`: screen refresh rate at seconds
- `-b`: exec *top* in order, used with data redirection
- `-n`: used with -b, number of times *top* outputs
- `-p`: specify some PID for monitoring
- commands in `top`:
  - `?`: shows available commands
  - `P`: arrange by CPU usage
  - `M`: arrange by Memory usage
  - `N`: arrange by PID
  - `T`: arrange by CPU time
  - `k`: send one PID a signal
  - `r`: send one PID new nice value
  - `q`: quit

`top` displays two sections, **system resource** and **process info**:

1. top... current time, total up time since reboot, number of users, and system load average at 1, 5, 15 minute
2. Tasks... number of process and by Status
3. Cpus... overall CPU load. press '1' to show all CPU cores
4. physical memory usage
5. swap memory usage. swap usage should be as little as possible
6. top command status
7. process usage, like `ps` outputs

<br/>

### System Process Priority and NICE Value

Each process has a priority value, the smaller the higher priority, means it will get more CPU time compare to others

**Priority (PRI) value** is dynamically adjusted by the CPU. However, you can modify it indirectly through **NICE (NI) value**.

- the formula is roughly: `PRI(new) = PRI(old) + NI`, but CPU still will make adjustments
- `NI` range is `[-20, 19]`
- _root_ can change all process `NI`
- normal user can only adjust **owning process** `NI`, range `[0, 19]`
- normal user can only adjust `NI` to a **higher value**
- adjust using the `nice` command, `nice [-n numb] command`
- adjust existing process's `NI` using `renice`, `renice [numb] PID`
- `NI` adjustments will be passed from parent process to child

<br/>

### Other System Monitoring Tools

**`free`** to view memory usage

- `free [-b|-k|-m|-g] [-t]`
- `-b|-k|-m|-g`, by default output shows in unit Kbytes, use this to override to bytes, Mbytes, Gbytes
- `-t`, shows physical and swap memory as well

**`uname`** checks system and core information

- `uname [-asrmpi]`
- `-a`: all system related information will be shown
- `-s`: system core name
- `-r`: system core version
- `-m`: system hardware architecture
- `-p`: CPU type
- `-i`: hardware platform

**`uptime`** shows system time, time since boot, like first line in `top`

**`netstat`** can track network usage, but quite related to process as well.

- `netstat -[atunlp]`
- `-a`: show current system's all network, listening port, sockets
- `-t`: list tcp packet data
- `-u`: list udp packet data
- `-n`: show service by port number
- `-l`: list services being listened
- `-p`: show services with PID

**`vmstat`** can track system resource changes

- `-a [delay [total examine times]]`shows active/inactive replace buffer/cache info
- `-f` show number of forks
- `-s` show memory changes
- `-S <unit>` use `K/M` replace bytes
- `-d` show number of disk read/write
- `-p <partition>` show a partition read/write stats
- categories shown: procs, memory, swap, io, system, cpu
- `procs`: the more of r and b, the busier the system
  - r: process waiting to run
  - b: un-wakeable processes
- `memory`: like shown by `free`
  - swpd: virtual memory usage
  - free: unused mem
  - buff: buffer storage
  - cache: high-speed cache
- `swap`: when si and so get larger, system is short of memory
  - si: amount taken from disk
  - so: amount written into swap
- `io`: when bi and bo get larger, system is doing lots of I/O
  - bi: blocks read from disk
  - bo: blocks written into disk
- `system`: when in and cs get larger, system communicates with external devices quite often
  - in: processes interrupted per second
  - cs: context-switch times per second
- `cpu`:
  - us: non-core usage of CPU
  - sy: core usage of CPU
  - id: idle status
  - wa: wait I/O CPU waste
  - st: virtual machine CPU usage.

all processes are stored in memory, and what is in memory is stored into `/proc/` , more on Book P628

**`fuser`** can find out which process is using which file/directory, from the point of the file/directory

- `fuser [-umv] [-k [i] [-signal]] file/dir`
- `-u`: show both PID and process owner
- `-m`: increase priority of the file
- `-v`: show each file and process related
- `-k`: show the process using this file/dir, and signal kill to the process
- `-i`: use with -k, ask for decision before kill the process
- `-<signal>`: send a signal code
- What will be shown is `USER PID ACCESS COMMAND`
  - the _ACCESS_ represents:
  - `c`: the process is under current directory
  - `e`: can be executed
  - `f`: is an opened file
  - `r`: is the root directory
  - `F`: the file is opened but pending complete
  - `m`: sharable dynamical library

**`lsof`** lists which process is using which files, from the point of the program.

- `lsof [-aUu] [+d]`
- `-a`: show when all criteria satisfied
- `-U`: show only Unix like system's socket files
- `-u username`: list files opened by the user
- `+d directory`: list files opened under a directory

**`pidof`** list the active PIDs of a program

- `pidof [-sx] program_name`
- `-s`: show only one, not all of the PIDs
- `-x`: show also the program's possible parent PID (PPID)

<br/>

### SELinux

Stands for "Security Enhanced Linux", developed by NSA.

SELinux introduced Mandatory Access Control (MAC), which made **program** controls its access, NOT the user.

**How it works**

- **Subject**: can be seen as process
- **Object**: can be seen as filesystem
- **Policy**:
  - targeted: limits more on the network service than the machine
  - strict: total limit on the machine and network

The Subject ask SELinux to provide access to Object, where SELinux analyze the Policies and compare to the Security Context to determine whether to grant access.

More Details P634 Book

<br/>

### System Services and Daemons

System service programs are called daemons. usually the service name appending a **d**

**Stand-alone Daemons** starts without being managed by other programs.
- It Stays in the system memory once started, and uses resources. Fast responding to users.

**Super Daemon** is a single daemon to start other daemons upon request from the client.
- The daemon started will be closed when the client session ends.
- i.e. `telnet` is a service managed by the super daemon

Each service maps to an unique port and this mapping is in `/etc/services` file

To starting up a daemon, it requires an executable, a configuration, and an environment. They are stored at:

- `/etc/init.d/`: for starting up scripts
- `/etc/sysconfig/`: for initialization environment config
- `/etc/xinetd.conf`, `/etc/xinetd.d/`: super daemon config
- `/etc/`: services' configuration files
- `/var/lib/`: services' database files
- `/var/run/`: all services' PID record

`service` is a command (in fact, a script) to start, terminate, and monitor any services.

- `service [service_name] (start|stop|restart|status|--status-all)`

**xinetd.conf**

Super daemon uses `xinetd`to manage security or the control of other daemons.

The default configuration file is `/etc/xinetd.conf`, and more configs are in `/etc/xinetd.d/`.

The general format of each file:

```sh
service <service_name>
{
  <attribute>   <assign_op>   <value>   <value> ...
  ...
  # A simple `/etc/xinetd.d/rsync` example can be viewed on Book P662
}
```

<br/>

### Server Firewall management xinetd, TCP Wrappers

`/etc/hosts.{allow|deny}` grant/deny access to external requests by IP addresses

**TCP Wrappers** change the access by:

1. source IP or some range of IP
2. port

To test whether a service program supports TCP Wrappers use:

- `ldd $(which program_name)`
- `ldd` stands for Library Dependency Discovery, to check the library dependency of a program/command
- Format: `<service (program_name)> : <IP, domain, hostname> : <action>`

**setting system startup program/service**

- use `chkconfig` to check services that start on startup
- `chkconfig --list [service_name]`
- `chkconfig [--level [0123456]] [service_name] [on|off]`

<br/>

### Syslog files

_Syslog files_ log the timestamp, source IP, service name, actions from users

It is useful in may ways:

- system side error debugging
- monitor service actions for abnormal activities
- fix network issues

Some mostly accessed sys logs:

- `/var/log/cron`: for crontab
- `/var/log/dmesg`: core check on start up
- `/var/log/lastlog`: last logged in for each account
- `/var/log/maillog`: record SMTP provider's and POP3 provider's info and log
- `/var/log/messages`: all system error info will be here
- `/var/log/secure`: logs for any actions to do with passwords
- `/var/log/wtmp`, `/var/log/faillog`: records correct logged in users and failed log in attempts
- `/var/log/httpd/`, `/var/log/news/`, `/var/log/samba/`: each service's own logs

**system services related to logs**

- `syslogd`: for logging system and network info
- `klog`: for logging anything from core
- `logrotate`: for switching and ridding old large log files

configure `syslogd` from `/etc/syslog.conf` on Book P683

`chattr +a /var/log/messages` can make the file only be able to be appending new content, not modifying existing contents. the root must use `chattr -a` to cancel this setting. `lsattr` shows the attributes.

**Change sys log service, logrotate config**

see Book P688

<br/>

### Source code and Tarball

To reduce the size of files for download purpose, Tarball compresses files using `tar`, then use `gzip` to compress the tar. The common extension is then `*.tar.gz` or `*.tgz`

However, `bzip2` has better compression rate, so `*.tar.bz2` is another type of Tarball.

Intallation process from a Tarball:

1. download the `*.tar.gz`
2. decompress
3. use `gcc` to compile, get object files
4. use `gcc` to link library and get binary files
5. put the binary into correct directory

**makefile syntax**

```make
VAR_NAME = define vars here
# defines an objective; can use `make target_files` to run it
target_files: obj_file1 obj_file2 ...
<tab>   gcc -o target_bin_file
# comment
$VAR_NAME # use a variable like doing so in shell
# env vars can be used in makefiles
$@ # means current target
```

**manage Tarball installation**

1. decompress Tarball data into `/usr/local/src` and give a good name of the directory `tar -zxvf tarball_file`
2. install of runnable and libraries should be under `/usr/local`, again give a good name
3. make it independent so it is easy to be removed
4. add its man page's path to man path for searching.
- i.e. if `/usr/local/apache/` is installed, then man search adding `/etc/man.config` for `MANPATH /usr/local/apache/man`

**patch updates from source patch file**

- patch files are created using `diff`, like `diff -Naur f1 f2`
- then on the first line of the patch file, the command that created this patch file will be shown.
- `patch` is likely used as `patch [-pNUMB] < patch_file`
  - where the NUMB is for how many directories to strip from the first level. (P793)

`*.a` are static library files, `*.so` are dynamic library files.

- **static library** file compiles the library code into the binary, so it is executable independently
  - updates to this kind of libraries requires recompilation from the source.
- **dynamic library** uses pointer to the actual library, and therefore need the library installed to run
  - updates to this kind of libraries do not require recompilation from the source

`ldconfig` and `/etc/ld.so.conf`: use these two to load library files into highspeed cache

`ldd` shows what library files one binary contains/uses.

`md5sum` and `sha1sum` are commands for checking file integrity from downloaded source

- `md5sum/sha1sum [-bct] filename`
- `md5sum/sha1sum [--status|--warn] --check filename`

<br/>

### Software distributions

**dpkg**

- By Debian Linux community, for installing software.
- Then follows there is **apt, apt-get** for online update

**rpm**

- By Red Hat (RedHat Package Manager), pre-compiled software for installation, and
- there is **yum** for online update. (P824)
- files are like `*.rpm`
- naming convention:
  - software_name-software_version_number-number_of_compilation-hardware-extension
  - i.e. `rp-pppoe-3.1-5-.i386-.rpm`
- install an rpm
- `rpm -ivh package_name`
- `-i`: install
- `-v`: verbose, show more printed details
- `-h`: show progress
  - more options see man or Book P808

**srpm**

- Source rpm, allow you install source code, properly configures them, and compile on your machine.
- files are like `*.src.rpm`
- uses `*.sepc` (P819)
- more on P815

**GNU Privacy Guard and Digital Signatures**

properly distributed software provide digital signatures to ensure file integrity. a public key will be provided and ensured the software match the key. P813

<br/>

### X Window

Skipped, P836

### Linux Backup Strategy

Skipped, P860

### Linux Kernel Programming

Skipped, P893
