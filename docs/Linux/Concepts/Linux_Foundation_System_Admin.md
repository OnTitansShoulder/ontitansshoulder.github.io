---
layout: note_page
title: Linux System Adminstration
title_short: linux_sys_admin
dateStr: 2021-04-01
category: Linux
tags: notes check
---
This set of notes were taken from the Linux Foundation Course: 
[Essentials of Linux System Administration (LFS201)](https://training.linuxfoundation.org/training/essentials-of-linux-system-administration/){target=_blank}.

## Linux Filesystem Tree Layout

Linux's One Big Filesystem - diagrammed as an inverted tree with root directory `/` at top of tree. The large logical filesystem may have many distinct filesystems mounted at various points appear as subdirectories.

Data Distinctions

- Sharable - data can be shared between hosts
- Non-sharable - data that must be specific to a particular host
- Static - data such as binaries, libraries, documentation, that does not change without system admin's actions
- Variable - data that change without a system admin's help

The Filesystem Hierarchy Standard (FHS) document specifies the main directories that need to be present on a Linux host.

### /bin

Contains executable programs and scripts needed by both system administrators and unprivileged users, which are required when no other filesystems have yet been mounted (single user or recovery mode).

Required programs which must exist in /bin/ include:

```
cat, chgrp, chmod, chown, cp, date, dd, df, dmesg, echo, false, hostname, kill, ln, login, ls, mkdir, mknod, more, mount, mv, ps, pwd, rm, rmdir, sed, sh, stty, su, sync, true, umount and uname
```

### /boot

Essential files for booting the system. Stores data used before the kernel begins executing user-mode programs

- vmlinz - the compressed Linux kernel
- initramfs or initrd - initial RAM filesystem, mounted before the real root fs is available
- config - configure the kernel compilation
- System.map - Kernel symbol table, used for debugging

### /dev

Contains special device files (also known as device nodes) which represent devices built into or connected to the system. Such device files represent character (byte-stream) and block I/O devices.

Network devices do not have device nodes in Linux, and are instead referenced by name, such as eth1 or wlan0.

All modern Linux distributions use the udev system, which creates nodes in /dev only as needed when devices are found. On ancient systems (or embedded devices, it can be created by MAKEDEV or mknod at install or at any other time, as needed.

### /etc

Contains machine-local configuration files and some startup scripts.

Files and directories which may be found in this directory include:

```
csh.login, exports, fstab, ftpusers, gateways, gettydefs, group, host.conf, hosts.allow, hosts.deny, hosts,equiv, hosts.lpd, inetd.conf, inittab, issue, ld.so.conf, motd, mtab, mtools.conf, networks, passwd, printcap, profile, protocols, resolv.conf, rpc, securetty, services, shells, syslog.conf
```

- /etc/skel - Contains skeleton files used to populate newly created home directories.
- /etc/systemd - Contains or points to configuration scripts for starting, stopping system services when using systemd.
- /etc/init.d - Contains startup and shut down scripts when using System V initialization.

### /opt

This directory is designed for software packages that wish to keep all or most of their files in one isolated place, rather than scatter them all over the system in directories shared by other software.

For example, if dolphy_app were the name of a package which resided under /opt, then all of its files should reside in directories under /opt/dolphy_app, including /opt/dolphy_app/bin for binaries and /opt/dolphy_app/man for any man pages.

This can make both installing and uninstalling software relatively easy, as everything is in one convenient isolated location in a predictable and structured manner.

The directories /opt/bin, /opt/doc, /opt/include, /opt/info, /opt/lib, and /opt/man are reserved for local system administrator use. Packages may provide files which are linked or copied to these reserved directories, but the packages must also be able to function without the programs being in these special directories. Most systems do not populate these directories.

### /proc

Mount point for a pseudo-filesystem, where all information resides only in memory. The kernel exposes some important data structures through /proc entries

Important pseudo-files, including /proc/interrupts, /proc/meminfo, /proc/mounts, and /proc/partitions, provide an up-to-the-moment glimpse of the system's hardware.

Others, like /proc/filesystems and the /proc/sys/ directory, provide system configuration information and interfaces. The process directories contain information about each running process on the system.

### /sys

Mount point for the sysfs pseudo-filesystem where all information resides only in memory. It contains information about devices and drivers, kernel modules, system configuration structures, etc.

sysfs is used both to gather information about the system, and modify its behavior while running. Almost all pseudo-files in /sys contain only one line, or value.

### /sbin

Contains binaries essential for booting, restoring, recovering, and/or repairing in addition to those binaries in the /bin directory.

The following programs should be included in this directory (if their subsystems are installed):

```
fdisk, fsck, getty, halt, ifconfig, init, mkfs, mkswap, reboot, route, swapon, swapoff, update
```

### /usr

Can be thought of as a secondary hierarchy used for files which are not needed for system booting.

This directory is typically read-only data. It contains binaries which are not needed in single user mode.

### /var

Contains variable (or volatile) data files that change frequently during system operation. These include:

- Log files
- Spool directories and files
- Administrative data files
- Transient and temporary files, such as cache contents.

For security reasons, it is often considered a good idea to mount /var as a separate filesystem. Furthermore, if the directory gets filled up, it should not lock up the system.

### /run

The purpose of /run is to store transient files: those that contain runtime information, which may need to be written early in system startup, and which do not need to be preserved when rebooting.

Generally, /run is implemented as an empty mount point, with a tmpfs ram disk (like /dev/shm) mounted there at runtime. Thus, this is a pseudo-filesystem existing only in memory.

Some existing locations, such as /var/run and /var/lock, will be now just symbolic links to directories under /run.

## Processes

### Definition

A program is a set of instructions, along with any internal or external data used while carrying the instructions out.

People often distinguish between programs, which are compiled into a binary executable form; and scripts, which need to be run by an interpreter such as bash, Python or Perl.

A process is an instance of a program in execution. Every process has a pid (Process ID), a ppid (Parent Process ID), and a pgid (Process Group ID). Every process has program code, data, variables, file descriptors, and an environment.

For historical reasons, the largest PID has been limited to a 16-bit number, or 32768. It is possible to alter this value by changing /proc/sys/kernel/pid_max. Eventually when process id reaches the max, it will start again at PID = 300.

A program may be composed of multiple simultaneous threads (multithreading), each of which is considered as its own process.

### Process Attributes

At any given moment, the process may take a snapshot of itself by trapping the state of its CPU registers, where it is executing in the program, what is in the process' memory, and other information. This is the context (state) of the process, which is critical to the kernel's ability to do context switching.

Every process has permissions based on which user has called it to execute. It may also have permissions based on who owns its program file.

Programs which are marked with an "s" execute bit have a different "effective" user id than their "real" user id. These programs are referred to as setuid programs. They run with the user-id of the user who owns the program, where a non-setuid program runs with the permissions of the user who starts it. setuid programs owned by root can be a security problem.

Every process has resources such as allocated memory, file handles, etc. When a process is started, it is isolated in its own user space to protect it from other processes.

Processes do not have direct access to hardware. Hardware is managed by the kernel, so a process must use system calls to indirectly access hardware. System calls are the fundamental interface between an application and the kernel.

#### Control process with ulimit

`ulimit` is a built-in bash command that displays or resets a number of resource limits associated with processes running under a shell. The changes only affect the current shell. To make changes that are effective for all logged-in users, you need to modify `/etc/security/limits.conf`

A system administrator may need to change some of these values in either direction:

- To restrict capabilities so an individual user and/or process cannot exhaust system resources, such as memory, cpu time or the maximum number of processes on the system.
- To expand capabilities so a process does not run into resource limits; for example, a server handling many clients may find that the default of 1024 open files makes its work impossible to perform.

### Creating Processes

An average Linux system is always creating new processes. This is often called forking; the original parent process keeps running, while the new child process starts.

Often, rather than just a fork, one follows it with an exec, where the parent process terminates, and the child process inherits the process ID of the parent.

Take sshd daemon as an example: it is started when the init process executes the sshd init script, then the daemon process listens for ssh requests from remote users.When a request is received, sshd creates a new copy of itself to service the request. Each remote user gets their own copy of the sshd daemon running to service their remote login. The sshd process will start the login program to validate the remote user. If the authentication succeeds, the login process will fork off a shell (say bash) to interpret the user commands, and so on.

systemd-based systems run a special process named kthreadd with pid=2 whose job is to adopt orphaned children, who will then show ppid=2.

What happens when a user executes a command in a command shell interpreter, such as bash?

- A new process is created (forked from the user's login shell).
- A wait system call puts the parent shell process to sleep.
- The command is loaded onto the child process's space via the exec system call. In other words, the code for the command replaces the bash program in the child process's memory space.
- The command completes executing, and the child process dies via the exit system call.
- The parent shell is re-awakened by the death of the child process and proceeds to issue a new shell prompt.
- The parent shell then waits for the next command request from the user, at which time the cycle will be repeated.

If a command is issued for background processing (by adding an ampersand -&- at the end of the command line), the parent shell skips the wait request and is free to issue a new shell prompt immediately, allowing the background process to execute in parallel. Otherwise, for foreground requests, the shell waits until the child process has completed or is stopped via a signal.

Some shell commands (such as echo and kill) are built into the shell itself, and do not involve loading of program files. For these commands, neither a fork nor an exec is issued for the execution.

### Process States

Processes can be in one of several possible states. The scheduler manages all of the processes. The process state is reported by the process listing.

- Running - process is executing on a CPU or sitting in the run queue waiting for a new time slice
- Sleeping / Waiting - process is waiting on a request (usually I/O)
- Stopped - process has been suspended, commonly when the program's memory, CPU registers, or other attributes are being examined, after which can be resumed.
- Zombie / Defunct- process terminates and no other process or parent process requests for its exit state.
    - if the parent of a process dies, it is adopted by init (PID=1) or kthreadd (PID=2)

### Execution Modes

A process may be executing in either user mode or system mode (kernel mode). What instructions can be executed depends on the mode and is enforced at the hardware, not software, level.

The mode is not a state of the system; it is a state of the processor, as in a multi-core or multi-CPU system each unit can be in its own individual state.

#### User Mode

Each process executing in user mode has its own memory space, parts of which may be shared with other processes; except for the shared memory segments, a user process is not able to read or write into or from the memory space of any other process.

Even a process run by the root user or as a setuid program runs in user mode, except when jumping into a system call, and has only limited ability to access hardware.

#### System (Kernel) Mode

CPU has full access to all hardware on the system, including peripherals, memory, disks, etc. If an application needs access to these resources, it must issue a system call, which causes a context switch from user mode to kernel mode. This procedure must be followed when reading and writing from files, creating a new process, etc.

Application code never runs in kernel mode, only the system call itself which is kernel code. When the system call is complete, a return value is produced and the process returns to user mode with the inverse context switch.

### Daemons

A daemon process is a background process whose sole purpose is to provide some specific service to users of the system.

- They can be quite efficient because they only operate when needed.
- Many daemons are started at boot time.
- Daemon names often (but not always) end with d, e.g. httpd and systemd-udevd.
- Daemons may respond to external events (systemd-udevd) or elapsed time (crond).
- Daemons generally have no controlling terminal and no standard input/output - devices.
- Daemons sometimes provide better security control.
- Some examples include xinetd, httpd, lpd, and vsftpd.

### nice value set priorities

Process priority can be controlled through the `nice` and `renice` commands. `renice` is used to raise or lower the nice value of an already running process. Since the early days of UNIX, the idea has been that a nice process lowers its priority to yield to others. Thus, the higher the niceness is, the lower the priority.

The niceness value can range from -20 (the highest priority) to +19 (the lowest priority).

Note that increasing the niceness of a process does not mean it won't run; it may even get all the CPU time if there is nothing else with which to compete.

By default, only a superuser can decrease the niceness. After a non-privileged user has increased the nice value, only a superuser can lower it back. It is possible to give normal users the ability to decrease their niceness within a predetermined range, by editing `/etc/security/limits.conf`.

### Static and Shared Libraries

static library - The code for the library functions is inserted in the program at compile time, and does not change thereafter, even if the library is updated.

shared library - The code for the library functions is loaded into the program at run time, and if the library is changed later, the running program runs with the new library modifications.

Using shared libraries is more efficient because they can be used by many applications at once; memory usage, executable sizes, and application load time are reduced.

Shared Libraries are also called Dynamic Link Libraries (DLLs). Under Linux, shared libraries are (and must be) carefully versioned to avoid DLL Hell.

`ldd` can be used to ascertain what shared libraries an executable requires. It shows the soname of the library and what file it actually points to.

`ldconfig` is generally run at boot time (but can be run anytime), and uses `/etc/ld.so.conf`, which lists the directories that will be searched for shared libraries. ldconfig must be run as root, and shared libraries should only be stored in system directories when they are stable and useful. The linker also first search any directories specified in the environment variable `LD_LIBRARY_PATH`, a colon separated list of directories.

## Signals

Signals are one of the oldest methods of Inter-Process Communication (IPC) and are used to notify processes about asynchronous events (or exceptions).

Signals can only be sent between processes owned by the same user or from a process owned by the superuser to any process.

When a process receives a signal, what it does will depend on the way the program is written, or just respond according to system defaults. SIGKILL(#9) and SIGSTOP(#19) cannot be handled, and will always terminate the program.

Use `kill -l` to view list of signals. `man 7 signal` will give further documentation.

Generally, signals are used to handle two things:

- Exceptions detected by hardware (such as an illegal memory reference)
- Exceptions generated by the environment (such as the premature death of a process from the user's terminal)

Since a process cannot send a signal directly to another process, it must ask the kernel to send the signal. We use `kill` to send signals (by either number or name) to a process. `killall` kills all processes with a given name. `pkill` is similar to kill but uses name instead of pid.

Note that POSIX says one should use signal names, not numbers, which are allowed to be completely implementation dependent.

```sh
$ kill 1234
$ kill -9 1234
$ kill -SIGTERM 1234

$ killall bash
$ killall -9 bash
$ killall -SIGKILL bash

$ pkill -HUP rsyslogd
```

Signal | Value | Default | Action | POSIX? | Meaning
------ | ----- | ------- | ------ | ------ | -------
SIGHUP | 1 | Terminate | Yes | Hangup detected on controlling terminal or death of controlling process
SIGINT | 2 | Terminate | Yes | Interrupt from keyboard
SIGQUIT | 3 | Core dump | Yes | Quit from keyboard
SIGILL | 4 | Core dump | Yes | Illegal instruction
SIGTRAP | 5 | Core dump | No | Trace/breakpoint trap for debugging
SIGABTR SIGIOT | 6 | Core dump | Yes | Abnormal termination
SIGBUS | 7 | Core dump | Yes | Bus error
SIGFPE | 8 | Core dump | Yes | Floating point exception
SIGKILL | 9 | Terminate | Yes | Kill signal (cannot be caught or ignored)
SIGUSR1 | 10 | Terminate | Yes | User-defined signal 1
SIGSEGV | 11 | Core dump | Yes | Invalid memory reference
SIGUSR2 | 12 | Terminate | Yes | User-defined signal 2
SIGPIPE | 13 | Terminate | Yes | Broken pipe: write to pipe with no readers
SIGALRM | 14 | Terminate | Yes | Timer signal from alarm
SIGTERM | 15 | Terminate | Yes | Process termination
SIGSTKFLT | 16 | Terminate | No | Stack fault on math co-processor
SIGCHLD | 17 | Ignore | Yes | Child stopped or terminated
SIGCONT | 18 | Continue | Yes | Continue if stopped
SIGSTOP | 19 | Stop | Yes | Stop process (can not be caught or ignored)
SIGTSTP | 20 | Stop | Yes | Stop types at tty
SIGTTIN | 21 | Stop | Yes | Background process requires tty input
SIGTTOU | 22 | Stop | Yes | Background process requires tty output
SIGURG | 23 | Ignore | No | Urgent condition on socket (4.2 BSD)
SIGXCPU | 24 | Core dump | Yes | CPU time limit exceeded (4.2 BSD)
SIGXFSZ | 25 | Core dump | Yes | File size limit exceeded (4.2 BSD)
SIGVTALRM | 26 | Terminate | No | Virtual alarm clock (4.2 BSD)
SIGPROF | 27 | Terminate | No | Profile alarm clock (4.2 BSD)
SIGWINCH | 28 | Ignore | No | Window resize signal (4.3 BSD, Sun)
SIGIO SIGPOLL | 29 | Terminate | No	I/O now possible (4.2 BSD) (System V)
SIGPWR | 30 | Terminate | No | Power Failure (System V)
SIGSYS SIGUNUSED | 31 | Terminate | No	Bad System Called. Unused signal

## Package Management Systems

Use of Packages and Package Management System helps keep track of files and metadata in an automated, predictable and reliable way, so that system administrators can automate the process of installing, upgrading, configuring and removing software packages and scale to thousands of systems without requiring manual work on each individual system.

- Automation: No need for manual installs and upgrades.
- Scalability: Install packages on one system, or 10,000 systems.
- Repeatability and predictability.
- Security and auditing.

A given package may contain executable files, data files, documentation, installation scripts and configuration files. Also included are metadata attributes such as version numbers, checksums, vendor information, dependencies, descriptions, etc.

Upon installation, all that information is stored locally into an internal database, which can be conveniently queried for version status and update information.

### Package Types

**Binary Packages**
Binary packages contain files ready for deployment, including executable files and libraries. These are architecture dependent.

**Source Packages**
Source packages are used to generate binary packages; you should always be able to rebuild a binary package from the source package. One source package can be used for multiple architectures.

**Architecture-independent**
Architecture-independent packages contain files and scripts that run under script interpreters, as well as documentation and configuration files.

**Meta-packages**
Meta-packages are groups of associated packages that collect everything needed to install a relatively large subsystem, such as a desktop environment, or an office suite, etc.

### Packaing Tool Levels

**Low Level Utilities**
This simply installs or removes a single package, or a list of packages, each one of which is individually and specifically named. Dependencies are not fully handled, only warned about or produce an error:

- If another package needs to be installed, first installation will fail.
- If the package is needed by another package, removal will fail.

The rpm and dpkg utilities play this role for the packaging systems that use them.

**High Level Utilities**
If another package or group of packages needs to be installed before software can be installed, such needs will be satisfied. If removing a package interferes with another installed package, the administrator will be given the choice of either aborting, or removing all affected software.

The dnf and zypper utilities (and the older yum) take care of the dependency resolution for rpm systems, and apt-get and apt-cache and other utilities take care of it for dpkg systems.

### Package Sources

Every distribution has one or more package repositories where system utilities go to obtain software and to update with new versions. It is the job of the distribution to make sure all packages in the repositories play well with each other.

There are always other external repositories which can be added to the standard distribution-supported list. i.e. EPEL (Extra Packages for Enterprise Linux) fit well with RHEL since their source is Fedora and the maintainers are close to Red Hat.

Building your own package allows you to control exactly what goes in the software and exactly how it is installed.

- Creating needed symbolic links
- Creating directories as needed
- Setting permissions
- Anything that can be scripted.

### Source control Management System

#### Git

Git has two important data structures: an object database and a directory cache.

The object database contains objects of three varieties:

- Blobs: Chunks of binary data containing file contents
- Trees: Sets of blobs including file names and attributes, giving the directory structure
- Commits: Changesets describing tree snapshots.

The directory cache captures the state of the directory tree.

### RPM

RPM stood for Redhat Package Manager. All files related to a specific task or a subsystem are packaged into a single file, which also contains information about how and where to install and uninstall the files.

RPM allows builders to keep the changes necessary for building on Linux separate from the original source. This capability facilitates incorporating new versions of the code, because build-related changes are all in one place. It also facilitates building versions of Linux for different architectures.

rpm does not retrieve packages over the network unless given a specific URL to draw from. It installs from the local machine using absolute or relative paths.

The standard **naming convention** for a binary RPM package is:

```
<name>-<version>-<release>.<distro>.<architecture>.rpm
sed-4.5-2.e18.x86_64.rpm
```

`/var/lib/rpm` is the default system directory which holds RPM database files in the form of Berkeley DB hash files. The database files should not be manually modified; updates should be done only through the use of the rpm program. One can use `--dbpath` to specify another location for database, and `--rebuilddb` to rebuild the database indices from the installed package headers.

Helper programs and scripts used by RPM reside in `/usr/lib/rpm`. You can create an rpmrc file to specify default settings for rpm. By default, rpm looks for it in:

1. /usr/lib/rpm/rpmrc
2. /etc/rpmrc
3. ~/.rpmrc
4. specified by `--rcfile`

#### Queries

Run rpm inquiries with the `-q` option, which can be combined with numerous other query options:

- -f: allows you to determine which package a file came from
- -l: lists the contents of a specific package
- -a: all the packages installed on the system
- -i: information about the package
- -p: run the query against a package file instead of the package database
- --requires: return a list of prerequisites for a package
- --whatprovides: show what installed package provides a particular requisite package

i.e. to list files within a package, do `rpm -qilp <package_rpm>`

#### Verifying Packages

Run rpm verify inquiries with the `-V` option to verify whether the files from a particular package are consistent with the system’s RPM database.

In the output (you only see output if there is a problem) each of the characters denotes the result of a comparison of attribute(s) of the file to the value of those attribute(s) recorded in the database. A single ”.” (period) means the test passed, while a single ”?” (question mark) indicates the test could not be performed (e.g. file permissions prevent reading). Otherwise, the character denotes the failure of the corresponding `--verify` test.

- S: filesize differs
- M: mode differs (permissions and file type)
- 5: MD5 sum differs
- D: device major/minor number mismatch
- L: readLink path mismatch
- U: user ownership differs
- G: group ownership differs
- T: mTime differs 

#### Installing package

The command to install a package `sudo rpm -ivh <package_name>...`, or `sudo rpm -Uvh <package_name>...` for upgrading if package is already installed. `sudo rpm -U --oldpackage <package_name>...` for downgrading.

Tasks performed during installation:

- Performs dependency checks
- Performs conflict checks
- Executes commands required before installation
- Deals intelligently with configuration files
    - if doing an update, config files from original installation will be kept with `.rpmsave` extension
- Unpacks files from packages and installs them with correct attributes
- Executes commands required after installation
- Updates the system RPM database

The `-e <package_name>` option causes rpm to uninstall (erase) a package. It would fail with an error message if the package you are attempting to uninstall is required by other packages on the system. A successful uninstall produces no output. `--test` option can be used for a dry-run. `-vv` is for more verbose information.

Command `sudo rpm -Fvh <package_name>...` will attempt to freshen the packages, only when the older versions of the packages were installed, then upgrade will happen. Good for applying lots of patches at once.

When upgrading Linux kernel, it is recommended to use `-i` instead of `-U` which will remove the older kernel and it is irreversible.

### DPKG

DPKG (Debian Package) is the packaging system used to install, remove, and manage software packages under Debian Linux and other distributions derived from it.

Package files have a `.deb` suffix and the DPKG database resides in the `/var/lib/dpkg` directory.

The standard **naming convention** for a binary package is:

```
<name>_<version>-<revision_number>_<architecture>.deb
logrotate_3.14.0-4ubuntu3_amd64.deb
```

For historical reasons, the 64-bit x86 platform is called amd64 rather than x86_64

In the Debian packaging system, a source package consists of at least three files:

- An upstream tarball, ending with .tar.gz. This is the unmodified source as it comes from the package maintainers.
- A description file, ending with .dsc, containing the package name and other metadata, such as architecture and dependencies.
- A second tarball that contains any patches to the upstream source, and additional files created for the package, and ends with a name .debian.tar.gz or .diff.gz, depending on distribution.

#### Queries

- -l: List all packages installed
- -L: List files installed in the wget package
- -s: Show information about an installed package
- -I: Show information about a package file
- -c: List files in a package file
- -S: Show what package owns /etc/init/networking.conf
- -V: Verify the installed package's integrity

#### Installing package

The command to install or upgrade a package `sudo dpkg -i package.deb`. To remove all of an installed package except for its configurtion files, use `sudo dpkg -r package`. To complete remove a package include the configuration files, use `sudo dpkg -P package`.

### DNF and YUM

The higher-level package management systems (such as `dnf, yum, apt and zypper`) work with databases of available software and incorporate the tools needed to find, install, update, and uninstall software in a highly intelligent fashion.

- Use both local and remote repositories as a source to install and update binary, as well as source software packages.
- Automate the install, upgrade, and removal of software packages.
- Resolve dependencies automatically.
- Save time in search and download packages comparing to doing so manually.

Configuration files are located in `/etc/yum.repos.d` directory and have a `.repo` extension. You can toggle use of a particular repo on or off by changing the value of enabled, or using the `--disablerepo somerepo` and `--enablerepo somerepo` options.

```
[repo-name]
    name=Description of the repository
    baseurl=ht‌tp://somesystem.com/path/to/repo
    enabled=1
    gpgcheck=1
```

`dnf` replaced yum during the RHEL/CentOS 7 to 8 transition. `dnf` is backwards compatible - almost all common yum commands still work.

#### Queries

- dnf info package-name: Displays information about a package
- dnf list [installed | updates | available ]: Lists packages installed, available, or updates
- dnf search [keyword]: Find package by name or information in its metadata
- dnf grouplist: Shows information about package groups installed, available and updates
- dnf groupinfo packagegroup: Shows information about a package group
- dnf provides /path/to/file: Shows the owner of the package for file

#### Installing package

- sudo dnf install package: Installs a package from a repository; also resolves and installs dependencies
- sudo dnf localinstall package-file: Installs a package from a local rpm file
- sudo dnf groupinstall 'group-name': Installs a specific software group from a repository; also resolves and installs dependencies for each package in the group
- sudo dnf remove package: Removes a package from the system
- sudo dnf update [package]: Updates a package from a repository (if no package listed, updates all packages)

During installation (or update), if a package has a configuration file which is updated, it will rename the old configuration file with a .rpmsave extension. If the old configuration file will still work with the new software, it will name the new configuration file with a .rpmnew extension.

some other useful actions to perform:
- sudo dnf list "dnf-plugin*": Lists additional dnf plugins
- sudo dnf repolist: Shows a list of enabled repositories
- sudo dnf shell: Provides an interactive shell in which to run multiple dnf commands (the second form executes the commands in file.txt)
- sudo dnf install --downloadonly package: Downloads the packages for you (it stores them in the /var/cache/dnf directory)
- sudo dnf history: Views the history of dnf commands on the system, and with the correction options, even undoes or redoes previous commands
- sudo dnf clean [packages|metadata|expire-cache|rpmdb|plugins|all]: Cleans up locally stored files and metadata under /var/cache/dnf. This saves space and does house cleaning of obsolete data

Similar to `dnf`, `zypper` is the command line tool for installing and managing .rpm packages in SUSE Linux and openSUSE.

### APT

For use on Debian-based systems, the APT (Advanced Packaging Tool) set of programs provides a higher level of intelligent services for using the underlying dpkg program, and plays the same role as dnf on Red Hat-based systems.

The main utilities are **apt-get** and **apt-cache**. It can automatically resolve dependencies when installing, updating and removing packages. It accesses external software repositories, synchronizing with them and retrieving and installing software as needed. The APT system works with Debian packages whose files have a .deb extension.

Read more about it from [Debian packages webpage](https://www.debian.org/distrib/packages){target=_blank} and the [Ubuntu packages webpage](https://packages.ubuntu.com/){target=_blank}

#### Queries

Queries are done using the apt-cache or apt-file utilities. You may have to install apt-file first, and update its database, as in:

```
$ sudo apt-get install apt-file
$ sudo apt-file update
```

- apt-cache search apache2: Searches the repository for a package named apache2
- apt-cache show apache2: Displays basic information about the apache2 package
- apt-cache showpkg apache2: Displays detailed information about the apache2 package
- apt-cache depends apache2: Lists all dependent packages for apache2
- apt-file search apache2.conf: Searches the repository for a file named apache2.conf
- apt-file list apache2: Lists all files in the apache2 package

#### Installing package

Used to install new packages or update a package which is already installed: 

- sudo apt-get install [package]: Used to install new packages or update a package which is already installed
- sudo apt-get remove [package]: Used to remove a package from the system (this does not remove the configuration files)
- sudo apt-get --purge remove [package]: Used to remove a package and its configuration files from a system
- sudo apt-get update: Used to synchronize the package index files with their sources. The indexes of available packages are fetched from the location(s) specified in /etc/apt/sources.list
- sudo apt-get upgrade: Apply all available updates to packages already installed
- sudo apt-get autoremove: Gets rid of any packages not needed anymore, such as older Linux kernel versions
- sudo apt-get clean: Cleans out cache files and any archived package files that have been installed

## Linux System Monitoring

Linux distributions come with many standard performance and profiling tools which make use of mounted pseudo-filesystems, especially `/proc` and secondarily `/sys`.

Some frequently used utilities:

=== "Process and Load Monitoring"
    Utility | Purpose | Package
    ------- | ------- | -------
    top|Process activity, dynamically updated|procps
    uptime|How long the system is running and the average load|procps
    ps|Detailed information about processes|procps
    pstree|A tree of processes and their connections|psmisc (or pstree)
    mpstat|Multiple processor usage|sysstat
    iostat|CPU utilization and I/O statistics|sysstat
    sar|Display and collect information about system activity|sysstat
    numastat|Information about NUMA (Non-Uniform Memory Architecture)|numactl
    strace|Information about all system calls a process makes|strace

=== "Memory Monitoring"
    Utility | Purpose | Package
    ------- | ------- | -------
    free|Brief summary of memory usage|procps
    vmstat|Detailed virtual memory statistics and block I/O, dynamically updated|procps
    pmap|Process memory map|procps

=== "I/O Monitoring"
    Utility | Purpose | Package
    ------- | ------- | -------
    iostat|CPU utilization and I/O statistics|sysstat
    sar|Display and collect information about system activity|sysstat
    vmstat|Detailed virtual memory statistics and block I/O, dynamically updated|procps

=== "Network Monitoring"
    Utility | Purpose | Package
    ------- | ------- | -------
    netstat|detailed networking statistics|netstat
    iptraf|Gather information on network interfaces|iptraf
    tcpdump|Detailed analysis of network packets and traffic|tcpdump
    wireshark|Detailed network traffic analysis|wireshark

### sar

`sar` stands for the Systems Activity Reporter. It is an all-purpose tool for gathering system activity and performance data and creating reports that are readable by humans.

`sar` backend is `sadc` (system activity data collector), which is usually cron-based `/etc/cron.d/sysstat` and accumulates the statistics (logs in `/var/log/sa`).

Option | Meaning
------ | -------
-A|Almost all information
-b|I/O and transfer rate statistics (similar to iostat)
-B|Paging statistics including page faults
-d|Block device activity (similar to iostat -x)
-n|Network statistics
-P|Per CPU statistics (as in sar -P ALL 3)
-q|Queue lengths (run queue, processes and threads)
-r|Memory utilization statistics
-S|Swap utilization statistics
-u|CPU utilization (default)
-v|Statistics about inodes and files and file handles
-w|Context switching statistics
-W|Swapping statistics, pages in and out per second
-f|Extract information from specified file, created by the -o option
-o|Save readings in the file specified, to be read in later with the -f option

### Log files

System log files are under `/var/log`, controlled by the syslogd (usually rsyslogd on modern systems) daemon.

Important system messages are located at `/var/log/messages` for RHEL and `/var/log/syslog` for Debian. `boot.log` holds system boot messages, and `secure` holds security-related messages.

You can view new messages continuously as new lines appear with `sudo tail -f /var/log/messages` or view kernel-related messages with `dmesg -w`.

`logrotate` program is run periodically and keeps four previous copies (by default) of the log files (optionally compressed) and is controlled by `/etc/logrotate.conf`.

### stress and stress-ng

`stress` is a C language program written by Amos Waterland and is designed to place a configurable amount of stress by generating various kinds of workloads on the system.

Install stress-ng (enhanced version of stress):

```
$ git clone git://kernel.ubuntu.com/cking/stress-ng.git
$ cd stress-ng
$ make
$ sudo make install

# fork 8 CPU-intensive processes via sqrt() calculation
# fork 4 IO-intensive processes via sync()
# fork 6 mem-intensive processes via malloc() and each allocate 256MB by default (override with --vm-bytes 128M)
# run stress test for 20 seconds
$ stress-ng -c 8 -i 4 -m 6 -t 20s
```

### Process Monitoring

#### ps

`ps` displays characteristics and statistics associated with processes, all of which are garnered from the /proc directory associated with the process.

`ps` has existed in all UNIX-like operating system variants and the options rule is a little different:

- UNIX options, which must be preceded by -, and which may be grouped.
- BSD options, which must not be preceded by -, and which may be grouped.
- GNU long options, each of which must be preceded by --.

Some common choices of options are:

```sh
$ ps aux # show all processes
$ ps -elf # show process and parent process id, nice value
$ ps -eL # show shorter summary about pid and commands
$ ps -C "bash" # show process using that command
$ ps -o pid,user,uid,priority,cputime,pmem,size,command # costomize the outputs
```

#### pstree

`pstree` gives a visual description of the process ancestry and multi-threaded applications.

i.e. `pstree -aAp 2408` checks process tree of process with PID 2408, which shows the child processes spawned by that process. Another way to see that is doing `ls -l /proc/2408/task`

Use `-p` to show process IDs, use `-H [pid]` to highlight `[pid]` and its ancestors.

#### top

`top` is used to display processes with highest CPU usage. Processes are initially sorted by CPU usage.

If not run in secure mode (top s) user can signal processes:

- Press the k key
- Give a PID when prompted
- Give a signal number when prompted 

### Memory Montioring

One can use `free -m` to see a brief summary of memory usage: total, used, free, shared, buff/cached, available.

The pseudofile `/proc/meminfo` contains a wealth of information about how memory is being used.

The `/proc/sys/vm` directory contains many tunable knobs to control the Virtual Memory system, which can be changed either by directly writing to the entry, or using the `sysctl` utility.

The primary (inter-related) tasks are: 

- Controlling flushing parameters; i.e., how many pages are allowed to be dirty and how often they are flushed out to disk.
- Controlling swap behavior; i.e., how much pages that reflect file contents are allowed to remain in memory, as opposed to those that need to be swapped out as they have no other backing store. 
- Controlling how much memory overcommission is allowed, since many programs never need the full amount of memory they request, particularly because of copy on write (COW) techniques.

The usual best practice is to adjust one thing at a time and look for effects.

#### vmstat

`vmstat` is a multi-purpose tool that displays information about memory, paging, I/O, processor activity and processes. i.e. `vmstat [options] [delay] [count]`

If delay is given in seconds, the report is repeated at that interval count times; if count is not given, vmstat will keep reporting statistics forever until killed by a signal.

If the option` -S m` is given, memory statistics will be in MB instead of KB.

With the `-a` option, vmstat displays information about active and inactive memory, where active memory pages are those which have been recently used; they may be clean (disk contents are up to date) or dirty (need to be flushed to disk eventually).

With the `-d` option to get a table of disk statistics. Use `-p partition` to view statistics for a particular partition only.

#### OOM

One way to deal with memory pressure would be to permit memory allocations to succeed as long as free memory is available and then fail when all memory is exhausted.

Alternatively, use swap space on disk as "secondary memory" to push some of the resident memory out when under memory pressure.

Linux also permits the system to overcommit memory (only for user processes, not kernel processes), so that it can grant memory requests that exceed the size of RAM plus swap.

Every time a child process is forked, it receives a copy of the entire memory space of the parent. Linux uses the COW (copy on write) technique, unless one of the child processes modifies its memory space, no actual copy needs be made. However, the kernel has to assume that the copy might need to be done.

You can modify overcommission by setting the value of /proc/sys/vm/overcommit_memory:

- 0: (default) Permit overcommission, but refuse obvious overcommits, and give root users somewhat more memory allocation than normal users.
- 1: All memory requests are allowed to overcommit.
- 2: Turn off overcommission. Memory requests will fail when the total memory commit reaches the size of the swap space plus a configurable percentage (50 by default) of RAM. This factor is modified changing /proc/sys/vm/overcommit_ratio.

If available memory is exhausted, Linux invokes the **OOM-killer** (Out Of Memory) to decide which process(es) should be exterminated to open up some memory. A value called the **badness** is computed (which can be read from `/proc/[pid]/oom_score`) for each process on the system and the order of the killing. `oom_adj_score` can be directly adjusted to override the badness score of a process.

### IO Monitoring

Disk performance problems can be strongly coupled to other factors, such as insufficient memory or inadequate network hardware and tuning. Both real-time monitoring and tracing are necessary tools for locating and mitigating disk bottlenecks.

A system can be considered as I/O-bound when the CPU is found sitting idle waiting for I/O to complete, or the network is waiting to clear buffers.

What appears to be insufficient memory can result from too slow I/O; if memory buffers that are being used for reading and writing fill up, it may appear that memory is the problem, when the real problem is that buffers are not filling up or emptying out fast enough.

Network transfers may also be waiting for I/O to complete and cause network throughput to suffer.

#### iostat

`iostat` is the basic workhorse utility for monitoring I/O device activity on the system. i.e. `iostat [OPTIONS] [devices] [interval] [count]`

IO statistics given (broken out by disk partition and logical partitions if LVM is used):

- tps (I/O transactions per second; logical requests can be merged into one actual request)
- blocks read and written per unit time, where the blocks are generally sectors of 512 bytes
- total blocks read and written

With `-k` shows results in KB instead of blocks; with `-m` shows in MB. With `-N` or `-d` shows the device name. With `-x` shows some extended statistics.

#### iotop

`iotop` displays a table of current I/O usage and updates periodically.

The `be` and `rt` entries in the `PRIO` field stand for best effort and real time.

#### ionice

`ionice` utility lets you set both the I/O scheduling class and priority for a given process. i.e. `ionice [-c class] [-n priority] [-p pid ] [COMMAND [ARGS] ]`

If a pid is given with the `-p` argument results apply to the requested process, otherwise it is the process that will be started by COMMAND with possible arguments.

The -c parameter specifies the I/O scheduling class:

- 0 - default
- 1 - real time, get first access to the disk, can starve other processes; the priority defines how big a time slice each process gets
- 2 - best effort, programs serviced in round-robin fashion, according to priority settings (default)
- 3 - idle - no access to disk I/O unless no other program has asked for it for a defined period

The Best Effort and Real Time classes take the `-n` argument which gives the priority, which can range from 0 to 7, with 0 being the highest priority.

#### Benchmarking

`bonnie++` is a widely available benchmarking program that tests and measures the performance of drives and filesystems.

Results can be read from the terminal window or directed to a file, and also to a csv
format. Companion programs, `bon_csv2html` and `bon_csv2txt`, can be used convert to html and plain text output formats.

`fs_mark` benchmark gives a low level bashing to file systems, using heavily asynchronous I/O across multiple directories and drives.