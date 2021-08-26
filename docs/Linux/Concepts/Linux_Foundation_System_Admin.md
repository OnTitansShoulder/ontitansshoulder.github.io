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

### I/O Scheduling

The I/O scheduler provides the interface between the generic block layer and low-level physical device drivers.

The I/O scheduling layer prioritize and order the requests from VM and VFS before they are given to the block devices.

Any I/O scheduling algorithm has to satisfy certain requirements:

- Hardware access times should be minimized; i.e., requests should be ordered according to physical location on the disk. This leads to an elevator scheme where requests are inserted in the pending queue in physical order.
- Requests should be merged to the extent possible to get as big a contiguous region as possible, which also minimizes disk access time.
- Requests should be satisfied with as low a latency as is feasible; indeed, in some cases, determinism (in the sense of deadlines) may be important.
- Write operations can usually wait to migrate from caches to disk without stalling processes. Read operations, however, almost always require a process to wait for completion before proceeding further. Favoring reads over writes leads to better parallelism and system responsiveness.
- Processes should share the I/O bandwidth in a fair, or at least consciously prioritized fashion; even if it means some overall performance slowdown of the I/O layer, process throughput should not suffer inordinately.

At least one of the I/O scheduling algorithms must be compiled into the kernel. The scheduler for each device can be selected or viewed at run time. i.e. `/sys/block/sda/queue/scheduler` and scheduler-specific tunables can be found in /sys/block/sda/queue/iosched.

## Filesystems and VFS

A UNIX-like filesystem uses a tree hierarchy. Multiple filesystems can be merged together into a single tree structure. Linux uses a virtual filesystem layer (VFS) to communicate with the filesystem software.

Local filesystems generally reside within a disk partition which can be a physical partition on a disk, or a logical partition controlled by a Logical Volume Manager (LVM).

Filesystems can also be of a network nature and their true physical embodiment completely hidden to the local system across the network.

### inodes

An inode is a data structure on disk that describes and stores file attributes such as name, location, file attributes (permissions, ownership, size, etc.), access & modify times and others.

Filenames are not stored in the inode; they are stored in the directory that contains the files.

#### Hard/soft links

A directory file is a particular type of file that is used to associate file names and inodes. Two ways to associate (or link) a file name with an inode:

- Hard links point to an inode.​ All hard linked files have to be on the same filesystem. Changing the content of a hard linked file in one place may not change it in other places.
- Soft (or symbolic) links point to a file name which has an associated inode. Soft linked files may be on different filesystems. If the target does not yet exist or is not yet mounting, it can be dangling.

When two or more directory entries to point to the same inode (hard links), a file can be known by multiple names, each of which has its own place in the directory structure.

When a process refers to a pathname, the kernel searches directories to find the corresponding inode number. After the name has been converted to an inode number, the inode is loaded into memory and is used by subsequent requests.

### VFS

When an application needs to access a file, it interacts with the VFS abstraction layer, which then translates all the I/O system calls (reading, writing, etc.) into specific code relevant to the particular actual filesystem.

Neither the specific actual filesystem or physical media and hardware on which it resides need be considered by applications.

Network filesystems (such as NFS) can also be handled transparently. This permits Linux to work with more filesystem varieties than any other operating system.

Commonly used filesystems include ext4, xfs, btrfs, squashfs, nfs and vfat.

A list of currently supported filesystems is at /proc/filesystems. The ones with nodev are special filesystems which do not reside on storage.

#### Journaling Filesystems

Journaling filesystems recover from system crashes or ungraceful shutdowns with little or no corruption, and do so very rapidly.

In a journaling filesystem, operations are grouped into transactions. A transaction must be completed without error, atomically; otherwise, the filesystem is not changed. A log file is maintained of transactions. When an error occurs, usually only the last transaction needs to be examined.

### Disk Partitioning

Reasons for doing disk partitions:

- Separation of user and application data from operating system files
- Sharing between operating systems and/or machines
- Security enhancement by imposing different quotas and permissions for different system parts
- Size concerns; keeping variable and volatile storage isolated from stable
- Performance enhancement of putting most frequently used data on faster storage media
- Swap space can be isolated from data and also used for hibernation storage.

A common partition layout contains a `/boot` partition, a partition for the root filesystem `/`, a swap partition, and a partition for the `/home` directory tree.

It is more difficult to resize a partition after the fact than during install/creation time.

#### common disk types

SATA (Serial Advanced Technology Attachment) - SATA disks were designed to replace the old IDE (Integrated Drive Electronics) drives. They offer a smaller cable size (7 pins), native hot swapping, and faster and more efficient data transfer. They are seen as SCSI devices.

SCSI (Small Computer Systems Interface) - SCSI disks range from narrow (8 bit bus) to wide (16 bit bus), with a transfer rate from about 5 MB per second (narrow, standard SCSI) to about 160 MB per second (Ultra-Wide SCSI-3). SCSI has numerous versions such as Fast, Wide, and Ultra, Ultrawide.

SAS (Serial Attached SCSI) - SAS uses a newer point-to-point protocol, has a better performance than SATA disks and is better suited for servers. Learn more [SAS vs SATA](https://www.hp.com/us-en/shop/tech-takes/sas-vs-sata){target=_blank}

USB (Universal Serial Bus) - These include flash drives and floppies. And are seen as SCSI devices.

SSD (Solid State Drives) - Modern SSD drives have come down in price, have no moving parts, use less power than drives with rotational media, and have faster transfer speeds. Internal SSDs are even installed with the same form factor and in the same enclosures as conventional drives. SSDs still cost a bit more, but price is decreasing. It is common to have both SSDs and rotational drives in the same machines, with frequently accessed and performance critical data transfers taking place on the SSDs.

#### Disk drives

Rotational disks are composed of one or more platters and each platter is read by one or more heads. Heads read a circular track off a platter as the disk spins. Circular tracks are divided into data blocks called sectors. A cylinder is a group which consists of the same track on all platters.

The physical structural image has become less and less relevant as internal electronics on the drive actually obscure much of it.

Use `sudo fdisk -l /dev/sdc` to list the partition table without entering interactive mode.

`fdisk` is a menu-driven partition table editor and included in any Linux installation. It is the most standard and one of the most flexible of the partition table editors. As with any other partition table editor, make sure that you either write down the current partition table settings or make a copy of the current settings before making changes.

No actual changes are made until you write the partition table to the disk by entering w. It is therefore important to verify your partition table is correct (with p) before writing to disk with w. If something is wrong, you can jump out safely with q. After the edit is made, either reboot or use `sudo partprobe -s` to make the change taking in effect.

`parted` is the GNU tool that create, remove, resize, and move partitions (including certain filesystems).

`cat /proc/partitions` to examine what partitions the operating system is currently aware of.

#### Partition Organization

Disks are divided into partitions. A partition is a physically contiguous region on the disk. Two partition schemes:

- MBR (Master Boot Record)
- GPT (GUID Partition Table)

MBR dates back to the early days of MSDOS. When using MBR, a disk may have up to four primary partitions. One (and only one) of the primary partitions can be designated as an extended partition, which can be subdivided further into logical partitions with 15 partitions possible.

GPT is on all modern systems and is based on UEFI (Unified Extensible Firmware Interface). By default, it may have up to 128 primary partitions. When using the GPT scheme, there is no need for extended partitions. Partitions can be up to 233 TB in size (with MBR, the limit is just 2TB).

#### MBR Parition Table

The disk partition table is contained within the disk's Master Boot Record (MBR), and is the 64 bytes following the 446 byte boot record. One partition on a disk may be marked active. When the system boots, that partition is where the MBR looks for items to load.

The structure of the MBR is defined by an operating system-independent convention. The first 446 bytes are reserved for the program code. They typically hold part of a boot loader program.

There are 2 more bytes at the end of the MBR known as the magic number, signature word, or end of sector marker, which always have the value 0x55AA.

Each entry in the partition table is 16 bytes long and contains information:

- Active bit
- Beginning address in cylinder/head/sectors (CHS) format
- Partition type code, indicating: xfs, LVM, ntfs, ext4, swap, etc.
- Ending address in CHS
- Start sector, counting linearly from 0
- Number of sectors in partition.

Linux only uses the last two fields for addressing, using the linear block addressing (LBA) method.

For MBR systems, `dd` can be used for converting and copying files. However, be careful using `dd`: a simple typing error or misused option could destroy your entire disk.

The following command will backup the MBR (along with the partition table): `$ dd if=/dev/sda of=mbrbackup bs=512 count=1`

The MBR can be restored using the following command: `$ sudo dd if=mbrbackup of=/dev/sda bs=512 count=1`

#### GPT Partition table

Modern hardware comes with GPT support; MBR support will gradually fade away. The Protective MBR is for backwards compatibility, so UEFI systems can be booted the old way.

There are two copies of the GPT header, at the beginning and at the end of the disk, describing metadata:

- List of usable blocks on disk
- Number of partitions
- Size of partition entries. Each partition entry has a minimum size of 128 bytes.

The `blkid` utility shows information about partitions. i.e. `sudo blkid /dev/sda8`

`blkid` is a utility to locate block devices and report on their attributes, such as type of contents, tokens, LABEL or UUID

`lsblk` presents block device information in a tree format

#### Devices Nodes

The Linux kernel interacts at a low level with disks through device nodes normally found in the /dev directory.

Device nodes for SCSI and SATA disks follow a simple xxy[z] naming convention, where xx is the device type (usually sd), y is the letter for the drive number (a, b, c, etc.), and z is the partition number.

sd means SCSI or SATA disk. Back in the days where IDE disks could be found, they would have been /dev/hda3, /dev/hdb

### Filesystem Features

#### File Attributes

Extended Attributes associate metadata not interpreted directly by the filesystem with files: user, trusted, security, and system

The system namespace is used for Access Control Lists (ACLs), and the security namespace is used by SELinux.

Flag values are stored in the file inode and may be modified and set only by the root user. They are viewed with `lsattr filename` and set with `chattr [+|-|=mode] filename`.

Flags that can be set:

- i: immutable - A file with the immutable attribute cannot be modified (not even by root). It cannot be deleted or renamed. No hard link can be created to it, and no data can be written to the file. Only the superuser can set or clear this attribute.
- a: append-only - A file with the append-only attribute set can only be opened in append mode for writing. Only the superuser can set or clear this attribute.
- d: no-dump - A file with the no-dump attribute set is ignored when the dump program is run. This is useful for swap and cache files that you don't want to waste time backing up.
- A: no atime update - A file with the no-atime-update attribute set will not modify its atime (access time) record when the file is accessed but not otherwise modified. This can increase the performance on some systems because it reduces the amount of disk I/O.

#### mkfs

`mkfs` is a utility for formatting (making) a filesystem on a partition. See the fs programs with `ls -lhF /sbin/mkfs*`. General usage: `mkfs [-t fstype] [options] [device-file]`

Each filesystem type has its own particular formatting options and its own mkfs program, and can be learned from its man page.

#### fsck

`fsck` a utility designed to check for errors and may fix if found any. Like `mkfs`, it also have many variations for different filesystem types, view with `ls -lhF /sbin/fsck*`. General usage: `fsck [-t fstype] [options] [device-file]`

Usually, you do not need to specify the filesystem type, as fsck can figure it out by examining the superblocks at the start of the partition.

You can control whether any errors found should be fixed one by one manually with the -r option, or automatically, as best possible, by using the -a option.

`fsck` is run automatically after a set number of mounts or a set interval since the last time it was run or after an abnormal shutdown. It should only be run on unmounted filesystems. You can force a check of all mounted filesystems at boot by doing: `sudo touch /forcefsck` then reboot.

#### /etc/fstab

During system initialization, the command `mount -a` is executed in order to mount all filesystems listed in `/etc/fstab`. `/etc/fstab` is used to define mountable file systems and devices on startup. This may include both local and remote network-mounted filesystems, such as NFS and samba filesystems.

Each record in the /etc/fstab file contains white space separated files of information about a filesystem to be mounted:

- Device file name (such as /dev/sda1), label, or UUID
- Mount point for the filesystem (where in the tree structure is it to be inserted)
- Filesystem type
- A comma-separated list of options
- dump frequency used by the dump -w command, or a zero which is ignored by dump
- fsck pass number or a zero - meaning do not fsck this partition

Linux systems have long had the ability to mount a filesystem only when it is needed, which is done through `autofs`.

While `autofs` is very flexible and well understood, `systemd`-based systems (including all enterprise Linux distributions) come with `automount` facilities built into the `systemd` framework.

#### check filesystem usage

`df` (disk free) is used to look at filesystem usage. The option `-h` shows human-readable format, `-T` shows filesystem type, and `-i` shoes inode information.

`du` (disk usage) is used to look at both disk capacity and usage. The option `-a` lists all files in addition to directories. `find . -maxdepth 1 -type d -exec du -shx {} \; | sort -hr` shows directory size total and sort in decending order.

### swap

Linux employs a virtual memory system which overcommits functions in two ways such that:

1. programs do not actually use all the memory they are given permission to use
2. when under memory pressure, less active memory regions may be **swapped out** to disk, to be recalled only when needed again

Swapping is usually done to one or more dedicated partitions or files; Linux permits multiple swap areas. Each area has a priority, and lower priority areas are not used until higher priority areas are filled.

In most situations, the recommended swap size is the total RAM on the system. Current swap in use can be found under `/proc/swaps`. Its usage can be viewed with `free -m`

Commands involved with swap are

- `mkswap`: format a swap paritition or file
- `swapon`: activate a swap partition or file
- `swapoff`: deactivate a swap partition or file

At any given time, most memory is in use for caching file contents to prevent actually going to the disk any more than necessary and are never swapped out since it is pointless; instead, dirty pages are flushed out to disk.

Linux memory used by the kernel itself, as opposed to application memory, is never swapped out.

#### Quotas

Disk quotas allow administrators to control the maximum space particular users (or groups) are allowed. Commands involved with quota:

- `quotacheck`: generates and updates quota accounting files
    - use option `-u` for user files and `-g` for group files
    - pass in the filesystem to update, otherwise use  `-a` to apply/update all filesystems in `/etc/fstab`
    - generally only run after quota is initially turned on, or `fsck` reports errors in a filesystem
- `quotaon`: enables quota accounting
- `quotaoff`: disables quota accounting
- `edquota`: edit user or group quotas
    - use option `-u` for edit user quota and `-g` for group
    - use option `-p` to copy quota value from a user/group to another
    - use option `-t` to set grace periods
- `quota` reports usage and limits

Quotas may be enabled or disabled on a per-filesystem basis. Quota operations require the existence of the files `aquota.user` and `aquota.group` in the root directory of the filesystem using quotas. Linux supports the use of quotas based on user and group IDs.

Quotas for users and groups may be set for disk blocks and/or inodes. In addition, soft and hard limits may be set, as well as grace periods: Soft limits may be exceeded for a grace period. Hard limits may never be exceeded.

Steps to set up quota: first make sure you have mounted the filesystem with the user and/or group quota mount options `usrquota grpquota` in `/etc/fstab`. Then run `quotacheck` on the filesystem to set it up. Then enable quota and use `edquota` to set limits. For example:

```sh
# add in /etc/fstab (assume /home is on a dedicated partition)
/dev/sda5 /home ext4 defaults,usrquota 1 2

# test with the following commands:
$ sudo mount -o remount /home
$ sudo quotacheck -vu /home
$ sudo quotaon -vu /home
$ sudo edquota someusername
```

### filesystem types

#### ext4

The ext4 filesystem can support volumes up to 1 EB and file sizes up to 16 TB. Until very recently, ext4 was the most frequent default choice of Linux distributions, due to its excellent combination of performance, integrity, and stability.

An extent is a group of contiguous blocks. Use of extents can improve large file performance and reduce fragmentation. Extents replace the older block mapping mechanism from ext3.

ext4 is backwards compatible with ext3 and ext2. It can pre allocate disk space for a file. The allocated space is usually guaranteed and contiguous. It also uses a performance technique called allocate-on-flush (delays block allocation until it writes data to disk). ext4 breaks the 32,000 subdirectory limit of ext3.

ext4 uses checksums for the journal which improves reliability. This can also safely avoid a disk I/O wait during journalling. ext4 provides timestamps measured in nanoseconds.

The superblock is stored in block 0 of the disk, and contains global information about the ext4 filesystem:

- Mount count and maximum mount count (every time the disk is successfully mounted, mount count is incremented; the filesystem is checked every maximum-mount-counts or every 180 days whichever comes first)
- Block size (block size can be set through the mkfs command)​
- Blocks per group
- Free block count
- Free inode count
- Operating System ID

All fields in ext4 are written to disk in little-endian order, except the journal.

An ext4 filesystem is split into a set of block groups. The block allocator tries to keep each file’s blocks within the same block group to reduce seek times. The default block size is 4 KB, which would create a block group of 128 MB.

For block group 0, the first 1024 bytes are unused (to allow for boot sectors, etc), and the superblock will start at the first block after block group 0, then followed by the group descriptors and a number of GDT (Group Descriptor Table) blocks. These are followed by the data block bitmap, the inode bitmap, the inode table, and the data blocks.

In blocks view, they are like

```
Super Block | Group Descriptors | Data Block Bitmap | Inode Bitmap | Inode Table (n blocks) | Data Blocks (n blocks)
```

The first and second blocks are the same in every block group, and comprise the Superblock and the Group Descriptors. Under normal circumstances, only those in the first block group are used by the kernel; the duplicate copies are only referenced when the filesystem is being checked. If everything is OK, the kernel merely copies them over from the first block group. If there is a problem with the master copies, it goes to the next and so on until a healthy one is found and the filesystem structure is rebuilt. This redundancy makes it very difficult to thoroughly fry an ext2/3/4 filesystem.

As an optimization, today not all block groups have a copy of the superblock and group descriptors. To view which block holds backups use `dumpe2fs`.

Use the `dumpe2fs` program to get information about a particular partition, such as limits, capabilities, flags, and other attributes.

`tune2fs` can be used to change filesystem parameters. Use `-l` to list the contents of the superblock (same as global information from `dumpe2fs`).

#### xfs

The xfs filesystem was engineered to deal with large data sets for SGI systems, as well as handle parallel I/O tasks very effectively.

xfs can handle up to 16 EB (exabytes) for the total filesystem and up to 8 EB for an individual file and implements methods for high performance:

- Allowing DMA (Direct Memory Access) I/O
- Guaranteeing an I/O rate
- Adjusting stripe size to match underlying RAID or LVM storage devices.

xfs also journals quota information for fast recovery on uncleanly unmounted filesystem. xfs maintenance can be done online, for defragmenting, resizing (enlarge), and dumping/restoring

Backup and restore can be done with `xfsdump` and `xfsrestore` utilites. xfs also supports per-directory quotas, use `xfs_quota` command. Check out more xfs-related utilities with `man -k xfs`

#### btrfs

btrfs stands for B-tree filesystem, which is intended to address the lack of pooling, snapshots, checksums, and integral multi-device spanning in other Linux filesystems such as ext4.

One of the main features is the ability to take frequent snapshots of entire filesystems, or sub-volumes of entire filesystems in virtually no time. Because btrfs makes extensive use of COW techniques (Copy on Write), such a snapshot does not involve any more initial space for data blocks or any I/O activity except for some metadata updating.

One can easily revert to the state described by earlier snapshots and even induce the kernel to reboot off an earlier root filesystem snapshot.

btrfs maintains its own internal framework for adding or removing new partitions and/or physical media to existing filesystems, much as LVM (Logical Volume Management) does.

### disk encryption

Filesystems may be encrypted to protect them from both prying eyes and attempts to corrupt the data they contain. Encryption can be chosen at installation or incorporated later.

It is straightforward to create and format encrypted partitions at a later time, but you cannot encrypt an already existing partition in place without a data copying operation.

Modern Linux distributions provide block device level encryption mainly through the use of LUKS (Linux Unified Key Setup).

LUKS is built on top of `cryptsetup` to encrypt filesystems. The general form of a command is: `cryptsetup [OPTION...] <action> <action-specific>`

Examine `/proc/crypto` to see the encryption methods your system supports, and choose one to encrypt a filesystem. Example:

```sh
# encrypt a partition using LUKS
# (a passphrase will be prompted to enter)
sudo cryptsetup luksFormat --cipher aes /dev/sdc12
# make the volume available (create unencrypted passthrough device)
sudo cryptsetup --verbose luksOpen /dev/sdc12 SECRET
# format the partition
sudo mkfs.ext4 /dev/mapper/SECRET
# mount it
sudo mount /dev/mapper/SECRET /mnt
# unmount it
sudo umount /mnt
# remove the volume association
sudo cryptsetup --verbose luksClose SECRET
```

To mount an encrypted filesystem at boot time, first ensure it has an entry in `/etc/fstab`, then additionally add an entry to `/etc/crypttab` (which will prompt for passphrase on boot time). Read more with `man crypttab`.

### LVM

LVM (Logical Volume Management) breaks up one virtual partition into multiple chunks, each of which can be on different partitions and/or disks.

Logical volumes are created by putting all the devices into a large pool of disk space (the volume group), and then allocating space from the pool to create a logical volume. Additional devices can be added to the logical volume at any time.

Logical volumes have features similar to RAID devices. They can actually be built on top of a RAID device. This would give the logical volume the redundancy of a RAID device with the scalability of LVM.

LVM makes it easy to change the size of the logical partitions and filesystems, to add more storage space, rearrange things, etc. Use of logical volumes is a mechanism for creating filesystems which can span more than one physical disk.

LVM does create a definite additional performance cost that comes from the overhead of the LVM layer. However, even on non-RAID systems, if you use striping (splitting of data to more than one disk), you can achieve some parallelization improvements.

#### Volume and Volume Groups

Partitions are converted to physical volumes and multiple physical volumes are grouped into volume groups; there can be more than one volume group on the system.

Space in the volume group is divided into extents; these are 4 MB in size by default.

Logical volumes are allocated from volume groups:

- Can be defined by the size or number of extents
- Filesystems are built on logical volumes
- Can be named anything.

The hierarchy in layers:
Physical Drives -> Parititions -> Physical Volumes -> Volume Groups -> Logical Volumes -> File Systems

Commands to manipulate volume groups:

- `vgcreate`: Creates volume groups.
- `vgextend`: Adds to volume groups.
- `vgreduce`: Shrinks volume groups.

Commands to manipulate physical volumes:

- `pvcreate`: Converts a partition to a physical volume.
- `pvdisplay`: Shows the physical volumes being used.
- `pvmove`: Moves the data from one physical volume within the volume group to others; this might be required if a disk or partition is being removed for some reason. It would then be followed by:
- `pvremove`: Remove a partition from a physical volume.

use `man lvm` to view more utilities related. There are a number of utilities that manipulate logical volumes, and a short list can be viewed with `ls -lF /sbin/lv*`

Commands to manipulate logical volumes:

- `lvcreate` allocates logical volumes from within volume groups. The size can be specified either in bytes or number of extents (remember, they are 4 MB by default). Names can be anything desired.
- `lvdisplay` reports on available logical volumes.
- `lvresize` expands or shrinks a logical volume.
    - Some variations: `lvextend`, `lvreduce`, `resize2fs`

#### Manipulate LV

Steps involved in setting up and using a new logical volume, as an example:

```sh
# Create partitions on disk drives.
sudo fdisk /dev/sdb
# Create physical volumes from the partitions.
sudo pvcreate /dev/sdb1
sudo pvcreate /dev/sdc1
# Create the volume group named 'vg'.
sudo vgcreate -s 16M vg /dev/sdb1
sudo vgextend vg /dev/sdc1
# Allocate logical volumes from the volume group.
sudo lvcreate -L 50G -n mylvm vg
# Format the logical volumes.
sudo mkfs -t ext4 /dev/vg/mylvm
# Mount the logical volumes (also update /etc/fstab as needed).
sudo mkdir /mylvm
sudo mount /dev/vg/mylvm /mylvm
# Persistent mount on reboot, add to /etc/fstab
/dev/vg/mylvm /mylvm ext4 defaults 1 2
```

Resizing a logical volume is quick and easy compare to doing so with a physical paritition that already contains a filesystem. 

Extents for a logical volume can be added or subtracted from the logical volume, and they can come from anywhere in the volume group; they need not be from physically contiguous sections of the disk.

When expanding a logical volume with a filesystem, you must first expand the volume, and then expand the filesystem.​ When shrinking a logical volume with a filesystem, you must first shrink the filesystem, and then shrink the volume. This is done using `lvresize`.

As an example of shrinking: `sudo lvresize -r -L 20 GB /dev/VG/mylvm`. The `-r` option causes resizing of the filesystem at the same time as the volume size is changed. The filesystem cannot be mounted when being shrunk.

`sudo lvresize -r -L +100M /dev/vg/mylvm` to grow a logical volume, while the plus sign (+) indicates adding space. Note that you need not unmount the filesystem to grow it.

#### LVM Snapshots

LVM snapshots create an exact copy of an existing logical volume. They are useful for backups, application testing, and deploying VMs (Virtual Machines). The original state of the snapshot is kept as the block map.

Snapshots only use space for storing deltas:

- When the original logical volume changes, original data blocks are copied to the snapshot.
- If data is added to snapshot, it is stored only there.

Use `-s` option with `lvcreate` to create snapshots, i.e. `lvcreate -l 128 -s -n mysnap /dev/vg/mylvm`

### RAID

RAID (Redundant Array of Independent Disks) spreads I/O over multiple disks. This can really increase performance in modern disk controller interfaces, such as SCSI, which can perform the work in parallel efficiently.

RAID can be implemented either in software or in hardware. One disadvantage of using hardware RAID is that if the disk controller fails, it must be replaced by a compatible controller, which may not be easy to obtain. When using software RAID, the same disks can be attached to and work with any disk controller.

Three essential features of RAID:

- mirroring: writing the same data to more than one disk
- striping: splitting of data to more than one disk
- parity: extra data is stored to allow problem detection and repair, yielding fault tolerance.

RAID devices are typically created by combining partitions from several disks together to create filesystems which are larger than any one drive. Striping provides better performance by spreading the information over multiple devices so simultaneous writes are possible. Mirroring writes the same information to multiple drives, giving better redundancy.

`mdadm` is used to create and manage RAID devices, with the array name, `/dev/mdX`.

#### RAID Levels

As a general rule, adding more disks improves performance.

- RAID 0 - only striping available
- RAID 1 - only mirroring
- RAID 5 - uses a rotating parity stripe, at least three disks required. Can endure one disk failure without loss of data
- RAID 6 - striped disks with dual parity, at least four disks required, and can handle two disk failures
- RAID 10 - mirrored and striped data set, at least four disks required

#### Software RAID

The essential steps in configuring a software RAID device are:

- Create partitions on each disk (type fd in fdisk)
- Create RAID device with mdadm
- Format RAID device
- Add device to `/etc/fstab`
- Mount RAID device
- Capture RAID details to ensure persistence
- Examine `/proc/mdstat` to see the RAID status

as an example:

```sh
$ sudo fdisk /dev/sdb
$ sudo fdisk /dev/sdc
$ sudo mdadm --create /dev/md0 --level=1 --raid-disks=2 /dev/sdbX /dev/sdcX
$ sudo mkfs.ext4 /dev/md0
$ sudo bash -c "mdadm --detail --scan >> /etc/mdadm.conf"
$ sudo mkdir /myraid
$ sudo mount /dev/md0 /myraid
$ sudo cat >> /etc/fstab <<EOF
/dev/md0 /myraid ext4 defaults 0 2
EOF
```

Use `mdadm -S /dev/md0` to stop the RAID device. Use `mdadm --detail /dev/mdX` to show the current status of a RAID device. You can also use mdmonitor, which requires configuring `/etc/mdadm.conf`

To help ensure any reduction in that redundancy is fixed as quick as possible, a hot spare can be used. To create a hot spare when creating the RAID aray, use `-x <number_of_spares>`, i.e. `sudo mdadm --create /dev/md0 -l 5 -n3 -x 1 /dev/sda8 /dev/sda9 /dev/sda10 /dev/sdb2`

To restore the tested drive, or a new drive in a legitimate failure situation, first remove the "faulty" member, then add the "new" member, use `--add --remove`, i.e. `mdadm --remove /dev/md0 /dev/sdb2; mdadm --add /dev/md0 /dev/sde2`

## Kernel Services

Narrowly defined, Linux is only the kernel of the operating system, which includes many other components, such as libraries and applications that interact with the kernel.

The kernel is the essential central component that connects the hardware to the software and manages system resources, such as memory and CPU time allocation among competing applications and services. It handles all connected devices using device drivers, and makes the devices available for operating system use.

A system running only a kernel has rather limited functionality. It will be found only in dedicated and focused embedded devices.

The main responsibilities of the kernel include:

- System initialization and boot up
- Process scheduling
- Memory management
- Controlling access to hardware
- I/O (Input/Output) between applications and storage devices
- Implementation of local and network filesystems
- Security control, both locally (such as filesystem permissions) and over the network
- Networking control

### Kernel Command Line

Various parameters are passed to the system at boot on the kernel command line, typically placed on the `linux` line in the GRUB config file, such as `/boot/grub`, or in a place like `/boot/efi/EFI/centos/grub.cfg` (however, RHEL/CentOS 8 saves in `/boot/grub2/grubenv`), which may look like

```
linux boot/vmlinuz-4.19.0 root=UUID=7ef4e747-afae-90b4-9be8be8d0258 ro quiet crashkernel=384M-:128M

linuxefi /boot/vmlinuz-5.2.9 root=UUID=77461ee7-c34a-4c5f-b0bc-29f4feecc743 ro crashkernel=auto rhgb quiet

linux16 /boot/vmlinuz-3.19.1.0 root=UUID=178d0092-4154-4688-af24-cda272265e08 ro vconsole.keymap=us crashkernel=auto vconsole.font=latarcyrheb-sun16 rhgb quiet LANG=en_US.UTF-8
```

Everything after the `vmlinuz` file specified is an option. Any options not understood by the kernel will be passed to `init` (pid = 1). The complete list of kernel boot parameters can be found at its [documentation](https://www.kernel.org/doc/Documentation/){target=_blank} or using `man bootparam`.

Use `cat /proc/cmdline` to see what command line a system was booted with.

#### sysctl

`sysctl` interface can be used to read and tune kernel parameters at run time. View kernel parameters with `sysctl -a`; each value corresponds to a particular pseudofile residing under /proc/sys, with directory slashes being replaced by dots.

To apply a change at runtime:

```sh
$ sudo sh -c 'echo 1 > /proc/sys/net/ipv4/ip_forward' # or execute as root user
$ sudo sysctl net.ipv4.ip_forward=1
```

If settings are placed in `/etc/sysctl.conf` (see `man sysctl.conf` for details), settings can be fixed at boot time (and reloaded at run time with `sysctl -p`)

Vendors put their settings in files in the `/usr/lib/sysctl.d/` directory. These can be added to or supplanted by files placed in `/etc/sysctl.d`

### Kernel Modules

The Linux kernel makes extensive use of modules, which contain important software that can be dynamically loaded and unloaded as needed after the system starts.

This flexibility also aids in development of new features as system reboots are almost never needed to test during development and debugging.

#### modprobe

There are a number of utility programs that are used with kernel modules:

- lsmod - List loaded modules.
- insmod - Directly load modules.
- rmmod - Directly remove modules.
- `modprobe` - Load or unload modules, using a pre-built module database with dependency and location information, which does dependency modules check and loads/unloads automatically.
    - i.e. `modprobe e1000e`, `modprobe -r e1000e`
- depmod - Rebuild the module dependency database.
- modinfo - Display information about a module.

`modprobe` requires a module dependency database be updated. Use depmod to generate or update the file `/lib/modules/$(uname -r)/modules.dep`

All files in the `/etc/modprobe.d` subdirectory tree which end with the `.conf` extension are scanned when modules are loaded and unloaded using modprobe. These config files control some parameters when loading with `modprobe`. You can also disable specific modules to avoid them being loaded.

The format of files in` /etc/modprobe.d` is simple: one command per line, with blank lines and lines starting with `#` ignored; a backslash at the end of a line causes it to continue on the next line.

Some rules for `modprobe` to keep in mind:

- It is impossible to unload a module being used by one or more other modules
- It is impossible to unload a module that is being used by one or more processes
- When a module is loaded with modprobe, the system will automatically load any other modules that need to be loaded first
- When a module is unloaded with modprobe -r, the system will automatically unload any other modules being used by the module (if not used by other modules)

Much information about modules can also be seen in the `/sys/module/<module_name>` pseudo-filesystem directory tree, such as parameters.

### Devices and udev

dev stands for User Device management. It dynamically discovers built-in hardware as well as peripheral devices during boot time or ad-hoc plugged at run time.

udev handles loading and unloading device drivers with proper configurations as need, including:

- Device naming
- Device file and symlink creating
- Setting file attributes
- Taking other needed actions (such as execute a program)

udev runs as a daemon (either udevd or systemd-udevd) and monitors a netlink socket. When new devices are initialized or removed, the uevent kernel facility sends a message through the socket, which udev receives and takes appropriate action to create or remove device nodes of the right names and properties according to the rules.

The three components of udev are:

- The libudev library which allows access to information about the devices
- The udevd or systemd-udevd daemon that manages the /dev directory
- The udevadm utility for control and diagnostics

The main configuration file is `/etc/udev/udev.conf`. It contains information such as where to place device nodes, default permissions and ownership, etc

#### udev rules

When devices are added or removed from the system, udev receives a message from the kernel. It then parses the rules files under `/etc/udev/rules.d`, `/run/udev/rules.d`, or `/usr/lib/udev/rules.d` for actions. A rules file may look like `60-persistent-storage.rules`.

There are two separate parts defined on a single line:

- one or more match pairs denoted by `==`. These try to match a device’s attributes and/or characteristics to some value.
- one or more assignment key-value pairs that assign a value to a name, such as a file name, assignment, even file permissions, etc.

The format for a udev rule is simple: `<match><op>value [, ...] <assignment><op>value [, ... ]`. If no matching rule is found, it uses the default device node name and other attributes. Example of a rules file:

```
$ cat /etc/udev/rules.d/60-vboxdrv.rules
KERNEL=="vboxdrv", NAME="vboxdrv", OWNER="root", GROUP="vboxusers", MODE="0660"
KERNEL=="vboxdrvu", NAME="vboxdrvu", OWNER="root", GROUP="root", MODE="0666"
KERNEL=="vboxnetctl", NAME="vboxnetctl", OWNER="root", GROUP="vboxusers", MODE="0660"
SUBSYSTEM=="usb_device", ACTION=="add", RUN+="/usr/lib/virtualbox/VBoxCreateUSBNode.sh $major $minor $attr{bDeviceClass}"
SUBSYSTEM=="usb", ACTION=="add", ENV{DEVTYPE}=="usb_device", RUN+="/usr/lib/virtualbox/VBoxCreateUSBNode.sh $major $minor $attr{bDeviceClass}"
```

System administrators can control how udev operates and craft special udev rules.

#### Device Nodes

Device nodes are used by programs to communicate with devices through nodes using normal I/O methods. Character and block devices have device nodes; network devices do not.

A device driver may use multiple device nodes. Device nodes are located in the `/dev` directory. Device nodes can be created with: `sudo mknod [-m mode] /dev/name <type> </major> <minor>`

The major and minor numbers identify the driver associated with the device, with the driver uniquely reserving a group of numbers. In most cases, device nodes of the same type (block or character) with the same major number use the same driver.

The major and minor numbers appear in the same place that file size would when looking at a normal file with `ls`. The minor number is used only by the device driver to differentiate between the different devices it may control, or how they are used. These may either be different instances of the same kind of device, (such as the first and second sound card, or hard disk partition) or different modes of operation of a given device (such as different density floppy drive media).

Device numbers have meaning in user-space as well. Two system calls, mknod() and stat(), return information about major and minor numbers.

## Virtualization

Virtual Machines are a virtualized instance of an entire operating system, and may fulfill the role of a server or a desktop/workstation. The outside world sees the VM as if it were an actual physical machine, present somewhere on the network. Applications running in the VM are generally unaware of their non-physical environment.​

Other kinds of virtualization:

- Network - The details of the actual physical network, such as the type of hardware, routers, etc., are abstracted and need not be known by software running on it and configuring it.
- Storage - Multiple network storage devices are configured to look like one big storage unit, such as a disk. Examples: Network Attached Storage or NAS.
- Application - An application is isolated into a standalone format, such as a container

Virtualization is developed and evolving for several reasons:

- Enables better hardware utilization
- Operating systems often progress more quickly than hardware
- It is microcode-driven
- CPUs enhanced to support virtualization led to a boost in performance, easier configuration, and more flexibility in VM installation and migration

From early mainframes to mini-computers, virtualization has been used for expanding limits, debugging and administration enhancements.

A host is the underlying physical operating system managing one or more virtual machines. A guest is the VM which is an instance of a complete operating system, running one or more applications. The guest should not care what host it is running on and can be migrated from one host to another.

Low-level performance tuning on areas such as CPU utilization, networking throughput, memory utilization, is often best done on the host, while application tuning will be done mostly on the guest.

### Emulation

The first implementations of virtualization on the PC architecture were through the use of emulators. An Emulator runs completely in software. It is useful for running virtual machines on different architectures, such as running a pretend ARM guest machine on an X86 host. Performance is relatively slow.

### Hypervisors

The host system acts as the hypervisor that initiates, terminates, and manages guests. It also called Virtual Machine Monitor (VMM). Two basic methods of virtualization:

- hardware virtualization - The guest system runs without being aware it is running as a virtualized guest, and does not require modifications to be run in this fashion. ​It is also known as Full Virtualization.
- para-virtualization - The guest system is aware it is running in a virtualized environment, and has been modified specifically to work with it.

You can check directly if your CPU supports hardware virtualization extensions by looking at /proc/cpuinfo; if you have an IVT-capable chip, you will see vmx in the flags field; and, if you have an AMD-V capable chip, you will see svm in the same field. You may also have to ensure the virtualization capability is turned on in your CMOS.

The hypervisor can be:

- External to the host operating system kernel: VMware
- Internal to the host operating system kernel: KVM

Going past Emulation, the merging of the hypervisor program into a specially-designed lightweight kernel was the next step in the Virtualization deployment. i.e. the KVM project added hypervisor capabilities into the Linux kernel. Specific CPU chip functions and facilities were required and deployed for this type of virtualization.​

### libvirt

The [`libvirt` project](https://www.libvirt.org/){target=_blank} is a toolkit to interact with virtualization technologies. It provides management for virtual machines, virtual networks, and storage, and is available on all enterprise Linux distributions.

### KVM

KVM uses the Linux kernel for computing resources, including memory management, scheduling, synchronization, and more. When running a virtual machine, KVM engages in a co-processing relationship with the Linux kernel.

Managing KVM can be done with ommand line tools include: `virt-*` and `qemu-*`. Graphical interfaces include virt-manager, kimchi, OpenStack, oVirt, etc.

### Containers

Further integration between the hypervisor and the Linux kernel allowed the creation of operating system-level virtual machines, or containers.

Containers share many facilities in the Linux kernel, and make use of namespaces and cgroups. Containers are very lightweight and reduce the overhead associated with having whole virtual machines.

OS container is a flavor that runs an image of an operating system with the ability to run init processes and spawn multiple applications. i.e. LXC (Linux Containers)

Application virtualization runs one application for each container. Many single application containers are typically initialized on a single machine which creates a greater flexibility and reduces overhead normally associated with virtualization.

Virtual machines run a complete operating system, and can run many services and applications. Virtual machines use more resources than a container. ​Containers usually run one thing. Containers are more portable, and can be run inside a VM.

Scaling workloads is different for containers and virtual machines. Orchestration systems such as Kubernetes or Mesos can decide on the proper quantity of containers needed, do load balancing, replicate images and remove them, etc., as needed.

#### Docker

Docker is an application-level virtualization using many individual images to build up the necessary services to support the target application. These images are packaged into containers - they are components in containers. Images may contain:

- Application code​
- Runtime libraries​
- System tools​
- ​Or just about anything required for an application

Images may reside on a Docker Hub or a registry server. An application can be packaged up with all of its dependent code and services and deployed as a single unit with the minimum of overhead. This deployment can be easily repeated as often as desired.

#### Podman

RHEL8/CentOS8 have replaced pure docker with podman. Podman uses a child/parent forking model for container creation and management, while Docker uses a server/client model with a daemon running in background for management. Emulation layer enables backwards compatibility with docker commands. Promised benefits include better security and less overhead.

## Account Management

Linux systems provide a multi-user environment which permits people and processes to have separate simultaneous working environments:

- Providing each user with their own individualized private space
- Creating particular user accounts for specific dedicated purposes
- Distinguishing privileges among users

### User Accounts

Normal user accounts are for people who will work on the system. Some user accounts (like the daemon account) exist for the purpose of allowing processes to run as a user other than root. Each user on the system has a corresponding line in the `/etc/passwd` file that describes their basic account attributes.

A line in `/etc/passwd` consists of: user name, user password (use `/etc/shadow` if value is `x`), UID, GID, comment, home directory, login shell

Add user with `sudo useradd <username>`, which will create an account using default algorithms for assigning user and group id, home directory, and shell choice; the defaults can easily be overruled by using options to `useradd`. i.e. `sudo useradd dexter` will:

- The next available UID greater than UID_MIN (specified in /etc/login.defs) by default is assigned as dexter's UID.
    - The convention most Linux distributions have used is that any account with a user ID less than 1000 is considered special and belongs to the system; normal user accounts start at 1000 (UID_MIN defined in `/etc/login.defs`)
- A group called dexter with a GID=UID is also created and assigned as dexter's primary group.
    - aka Primary Group ID, and sometimes called User Private Groups (UPG)
- A home directory /home/dexter is created and owned by dexter.
- dexter's login shell will be /bin/bash.
- The contents of /etc/skel is copied to /home/dexter. By default, /etc/skel includes startup files for bash and for the X Window system.
- An entry of either !! or ! is placed in the password field of the /etc/shadow file for dexter's entry, thus requiring the administrator to assign a password for the account to be usable.

Use of `/etc/shadow` enables password aging on a per user basis. At the same time, it also allows for maintaining greater security of hashed passwords since it has permission 400 while `/etc/passwd` has permission 644.

/etc/shadow contains one record (one line) for each user, such as `daemon:*:16141:0:99999:7:::`. The colon-separated fields are:

- username: unique user name
- password: the hashed (sha512) value of the password
- lastchange: date that password was last changed
- mindays: minimum days before password can be changed
- maxdays: maximum days after which password must be changed
- warn: days before password expires that the user is warned
- grace: days after password expires that account is disabled
- expire: date that account is/will be disabled
- reserved: reserved field

Note the _dates_ are stored as the number of days since Jan. 1, 1970 (the epoch date). The username in each record must match exactly that found in /etc/passwd, and also must appear in the identical order. The password hash is the string "$6$" followed by an eight character salt value, which is then followed by a $ and an 88 character (sha512) password hash.

Additionally, `userdel` is used to remove user accounts, and `usermod` is used to change characteristics of a user account.

You can lock a user account to prevent login by `usermod -L <username>` (and unlock with `-U` option). Linux ships with some system accounts that are locked (such as bin, daemon, or sys), which means they can run programs, but can never login to the system and have no valid password associated with them. These accounts has `/sbin/nologin` as their login shell. Attempt to login will show message from `/etc/nologin.txt`.

You can also lock a user account by setting an expiration date on an account, with `change`: `chage [-m mindays] [-M maxdays] [-d lastday] [-I inactive] [-E expiredate] [-W warndays] user`. i.e. `sudo chage -E 2014-09-11 morgan`. Only the root user can use chage. Normal user can run `change -l` to check when their password or account will expire.

Passwords can be changed with `passwd`; a normal user can change only their own password, while root can change any user password. 

#### Account Restriction

One can set restricted shell as login shell `/bin/rbash`, which is equivalent to `/bin/bash -r`. It:

- Prevents the user from using cd to change directories.
- Prevents setting the SHELL, ENV or PATH environment variables.
- Prohibits specifying path or command names containing /.
- Restricts redirection of output and/or input.

However, it is fairly easy to defeat the restricted shell. Read more at ["Escaping Restricted Shell rbash"](https://www.metahackers.pro/breakout-of-restricted-shell/){target=_blank} and ["Linux Restricted Shell Bypass"](https://www.exploit-db.com/docs/english/44592-linux-restricted-shell-bypass-guide.pdf){target=_blank}

You can also set up restricted user account which:

- Uses the restricted shell
- Limits available system programs and user applications
- Limits system resources
- Limits access times
- Limits access locations

When the restricted shell is invoked, it executes $HOME/.bash profile without restriction. This is why the user must not have either write or execute permissions on the home directory.

Make sure that when you set up such an account that you do not inadvertently add system directories to the PATH environment variable, because this allows the restricted user the ability to execute other system programs, such as an unrestricted shell.

By default, root logins through the network are generally prohibited for security reasons. It is generally recommended that all root access be through `su`, or `sudo` (causing an audit trail of all root access through `sudo`). PAM  (Pluggable Authentication Modules) can also be used to restrict which users are allowed to `su` to root. It might also be worth it to configure auditd to log all commands executed as root.

#### ssh

SSH (Secure SHell) exists for the needs to login through the network into a remote system, or to transfer files to and from a remote machine.

User-specific ssh configuration files are created under every user's home directory in the hidden `.ssh` directory. Within the directory:

- id_rsa: The user's private encryption key
- id_rsa.pub: The user's public encryption key
- authorized_keys: A list of public keys that are permitted to login
- known_hosts: A list of hosts from which logins have been allowed in the past
- config: A configuration file for specifying various options

First, a user has to generate their private and public encryption keys with `ssh-keygen`. The private keys must never be shared. The public key, however, should be given to any machine with which you want to permit password-less access. It should also be added to your authorized_keys file, together with all the public keys from other users who have accounts on your machine and you want to permit password-less access to their accounts.

### Group Accounts

Linux systems form collections of users called groups which share some common purpose, and share certain files and directories and maintain some common privileges. 

Groups are defined in `/etc/group`, which has the same role for groups as `/etc/passwd` has for users. Each line of the file looks like: `groupname:password:GID:user1,user2,...`. A Linux user has one primary group; this is listed in /etc/passwd and will also be listed in `/etc/group`. A user may belong to between 0 and 15 secondary groups.

Group passwords may be set, but only if `/etc/gshadow` exists. GID is the group identifier. Values between 0 and 99 are for system groups. Values between 100 and GID_MIN (as defined in /etc/login.defs and usually the same as UID_MIN) are considered special. Values over GID_MIN are for UPG (User Private Groups)

#### Group Management

Group accounts may be managed and maintained with:

- `groupadd`: Add a new group.
- `groupmod`: Modify a group and add new users.
- `groupdel`: Remove a group.
- `usermod`: Manage a user's group memberships by giving a complete list of groups, or add new group memberships
    - Note you will have to log out and log back in again for the new group membership to be effective.

Group membership can be identified by running either of the following commands: `groups [user1 user2 ...]` or `id -Gn [user1 user2 ...]`

#### User Private Groups

Each user will have his or her own group, and additional members may be added to someone's private group in `/etc/group`. By default, users whose accounts are created with useradd have: primary GID = UID and the group name is also identical to the user name.

As specified in `/etc/profile`, the umask is set to 002 for all users created with UPG. Under this scheme, user files are thus created with permissions 664 (rw-rw-r--) and directories with 775 (rwxrwxr-x).

### File permissions and Ownership

When viewing file permission with `ls -l a_file`, i.e. `-rw-rw-r-- 1 coop aproject 1601 Mar 9 15:04 a_file`. There are nine more which indicate the access rights granted to potential file users, with each three characters grouped as a triplet.

- owner: the user who owns the file (also called user)
- group: the group of users who have access
- other: the rest of the world (also called world)

Each of the triplets can have each of the following sets:

- r: read access is allowed
- w: write access is allowed
- x: execute access is allowed

In addition, other specialized permissions exist for each category, such as the setuid/setgid permissions. Any request to access a file requires comparison of the credentials and identity of the requesting user to those of the owner of the file.

#### Manage permissions and ownership

Changing file permissions is done with `chmod`. Permissions can be represented either as a bitmap, usually written in octal, or in a symbolic form. Octal bitmaps usually look like `0755`, while symbolic representations look like `u+rwx, g+rwx, o+rx`.

The octal number representation is the sum for each digit of:

- 4 if the read permission is desired
- 2 if the write permission is desired
- 1 if execute permission is desired

Changing the group is done with `chgrp`. You can only change group ownership to groups that you are a member of. One can change file ownership and group ownership at the same time with `chown`. The option `-R` applies the change recursively

#### umask

The default permissions given when creating a file are read/write for owner, group and world (0666), and for a directory it is read/write/execute for everyone (0777). 

However, the actual permissions have changed to 664 for the file and 775 for the directory as they have been modified by the current `umask` whose purpose is to show which permissions should be denied.

You can change the `umask` at any time with the `umask` command; which is the most conventional value set by system administrators for users. This value is combined with the file creation permissions to get the actual result; i.e., `0666 & ~002 = 0664; i.e., rw-rw-r--`

#### Filesystem ACLs

POSIX ACLs (Access Control Lists) extend the simpler user, group, and world system, by granting privileges to specific users or groups of users when accessing certain objects or classes of objects. Files and directories can be shared without using 777 permissions.

All major filesystems used in modern Linux distributions incorporate the ACL extensions, and one can use the option -acl when mounting. A default set of ACLs is created at system install.

Use `getfacl/setfacl` to get/set ACLs. New files inherit the default ACL (if set) from the directory they reside in. Also `mv` and `cp -p` preserve ACLs.

## Pluggable Authentication Modules

Historically, authentication of users was performed individually by individual applications; i.e., su, login, and ssh would each authenticate and establish user accounts independently of each other.

Most modern Linux applications have been written or rewritten to exploit PAM so that authentication can be done in one uniform way, using libpam.

PAM incorporates the following concepts:

- PAM-aware applications
- Configuration files in `/etc/pam.d/`
- PAM modules in the libpam* libraries, which can be found in different locations depending on the Linux distribution

### PAM Rules

Each file in `/etc/pam.d/` corresponds to a service and each (non-commented) line in the file specifies a rule. The rule is formatted as a list of space-separated tokens, the first two of which are case insensitive: `type control module-path module-arguments`

type controls the step of the authentication process:

- auth: Instructs the application to prompt the user for identification (username, password, etc). May set credentials and grant privileges.
- account: Checks on aspects of the user's account, such as password aging, access control, etc.
- password: Responsible for updating the user authentication token, usually a password.
- session: Used to provide functions before and after the session is established (such as setting up environment, logging, etc.)

The control flag controls how the success or failure of a module affects the overall authentication process:

- required: Must return success for the service to be granted. If part of a stack, all other modules are still executed. Application is not told which module or modules failed.
- requisite: Same as required, except a failure in any module terminates the stack and a return status is sent to the application.
- optional: Module is not required. If it is the only module, then its return status to application may cause failure.
- sufficient: If this module succeeds, then no subsequent modules in the stack are executed. If it fails, then it doesn't necessarily cause the stack to fail, unless it is the only one in the stack.

### LDAP Authentication

The Lightweight Directory Access Protocol (LDAP) is an industry standard protocol for using and administering distributed directory services over the network, and is meant to be both open and vendor-neutral.

With LDAP, each system (or client) connects to a centralized LDAP server for user authentication. Using Transport Layer Security (TLS) makes it a secure option and is recommended.

When you configure a system for LDAP authentication, five files are changed:

```
/etc/openldap/ldap.conf
/etc/pam_ldap.conf
/etc/nslcd.conf
/etc/sssd/sssd.conf
/etc/nsswitch.conf
```

You can edit these files manually or use one of the utility programs available (`system-config-authentication` or `authconfig-tui`).

## Network

### Network Addresses

The IP address is the number that identifies your system on the network. IP addresses are used to uniquely identify nodes across the internet. They are registered through ISPs (Internet Service Providers).

IPv4 is a 32-bit address, composed of 4 octets (an octet is just 8 bits, or a byte); IPv6 is a 128-bit address, composed of 8 16-bit octet pairs. In either case, a set of reserved addresses is also included.

### IPv4 Address Types

- Unicast - An address associated with a specific host. i.e. `140.211.169.4`
- Network - An address whose host portion is set to all binary zeroes. i.e. `192.168.1.0`
- Broadcast - An address to which each member of a particular network will listen. i.e. `172.16.255.255`
- Multicast - An address to which appropriately configured nodes will listen. Only nodes specifically configured to pay attention to a specific multicast address will interpret packets for that multicast group

#### Reserved IPv4 Addresses

Certain addresses and address ranges are reserved for special purposes:

- 127.x.x.x - Reserved for the loopback (local system) interface
- 0.0.0.0 - Used by systems that do not yet know their own address. Protocols like DHCP and BOOTP use this address when attempting to communicate with a server.
- 255.255.255.255 - Generic broadcast private address, reserved for internal use. These addresses are never assigned or registered to anyone. They are generally not routable.
- Others
    - 10.0.0.0 - 10.255.255.255
    - 172.16.0.0 - 172.31.255.255
    - 192.168.0.0 - 192.168.255.255
    - etc.

#### IPv4 Address Classes

Historically, IP addresses are based on defined classes. Classes A, B, and C are used to distinguish a network portion of the address from a host portion of the address, for routing purposes.

Network Class | Highest order octet range | Notes
------------- | ------------------------- | -----
A|1-127	128|networks, 16,772,214 hosts per network, 127.x.x.x reserved for loopback
B|128-191|16,384 networks, 65,534 hosts per network
C|192-223|2,097,152 networks, 254 hosts per network
D|224-239|Multicast addresses
E|240-254|Reserved address range

### IPv6 Address Types

- Unicast - a packet is delivered to one interface
    - link-local - Auto-configured for every interface to have one. Non-routable.
    - global - Dynamically or manually assigned. Routable.
    - or reserved for documentation
- Multicast - a packet is delivered to multiple interfaces
- Anycast - a packet is delivered to the nearest of multiple interfaces in terms of routing distance
- IPv4-mapped - an IPv4 address mapped to IPv6, i.e. `::FFFF:a.b.c.d/96`

IPv6 has some special types of addresses such as loopback, which is assigned to the lo interface, as `::1/128`.

### Netmasks

netmask is used to determine how much of the address is used for the network portion and how much for the host portion as we have seen. It is also used to determine network and broadcast addresses.

Network Class | Decimal | Hex | Binary
------------- | ------- | --- | ------
A|255.0.0.0|ff:00:00:00|11111111 00000000 00000000 00000000
B|255.255.0.0|ff:ff:00:00|11111111 11111111 00000000 00000000
C|255.255.255.0|ff:ff:ff:00|11111111 11111111 11111111 00000000

The network address is obtained by logical anding (`&`) the IP address with the netmask. We are interested in the network addresses because they define a local network which consists of a collection of nodes connected via the same media and sharing the same network address. All nodes on the same network can directly see each other. For example:

```
172.16.2.17 ip address
&255.255.0.0 netmask
-----------------
172.16.0.0 network address
```

### hostname

The hostname is simply a label to distinguish a networked device from other nodes. The hostname is generally specified at installation time, and can be modified at any time later. The hostname for a machine can be checked with command `hostname`.

To change hostname only once before next reboot, just execute `sudo hostname <new_hostname>`; to change it persistently, do `sudo hostnamectl set-hostname <new_hostname>`.

Hostname configuration is stored under `/etc/`. On Red Hat-based systems this was `/etc/sysconfig/network`, on Debian-based systems this was `/etc/hostname` and on SUSE-based systems it was `/etc/HOSTNAME`.

For DNS purposes, hostnames are appended with a period (dot) and a domain name, so that a machine with a hostname of antje could have a fully qualified domain name (FQDN) of antje.linuxfoundation.org.

## Network Devices and Configs

### network devices

Unlike block and character devices, network devices are not associated with special device files (aka device nodes). Network devices are known by their names, which usually consist of a type identifier followed by a number:

- `eth0, eth1, eno1, eno2, etc.`, for ethernet devices.
- `wlan0, wlan1, wlan2, wlp3s0, wlp3s2, etc.`, for wireless devices.
- `br0, br1, br2, etc.`, for bridge interfaces.
- `vmnet0, vmnet1, vmnet2, etc.`, for virtual devices for communicating with virtual clients

Historically, multiple virtual devices could be associated with single physical devices; these were named with colons and numbers; so, eth0:0 would be the first alias on the eth0 device. This was done to support multiple IP addresses on one network card, but deprecated today. It is also not compatible with IPv6.

### ip

`ip` is the command line utility used to configure, control and query interface parameters and control devices, routing, etc. It is more efficient and versatile than `ifconfig` because it uses netlink sockets, rather than ioctl system calls.

`ip` basic syntax is `ip [ OPTIONS ] OBJECT { COMMAND | help }`. It can also be used with `ip [ -force ] -batch filename` to process commands from a file. The `OBJECT` argument describes what kind of action is going to be performed; the `COMMANDS` depends on the OBJECT selected:

OBJECT | Function
------ | --------
address|IPv4 or IPv6 protocol device address
link|Network Devices
maddress|Multicast Address
monitor|Watch for netlink messages
route|Routing table entry
rule|Rule in the routing policy database
tunnel|Tunnel over IP

Some examples of using `ip`:

- `$ ip link show` - Show information for all network interfaces
- `$ ip -s link show eth0` - Show information for the eth0 network interface, including statistics
- `$ sudo ip addr add 192.168.1.7 dev eth0` - Set the IP address for eth0
- `$ sudo ip link set eth0 down` - Bring interface eth0 down
- `$ sudo ip link set eth0 mtu 1480` - Set MTU to 1480 bytes for interface eth0
- `$ sudo ip route add 172.16.1.0/24 via 192.168.1.5` - Set route to network

### ifconfig

`ifconfig` is a system administration utility long found in UNIX-like operating systems used to configure, control, and query network interface parameters from either the command line or from system configuration scripts.

Some examples of using `ifconfig`:

- `$ ifconfig` - Display information about all interfaces
- `$ ifconfig eth0` - Display information about only eth0
- `$ sudo ifconfig eth0 192.168.1.50` - Set the IP address to 192.168.1.50 on interface eth0
- `$ sudo ifconfig eth0 netmask 255.255.255.0` - Set the netmask to 24-bit
- `$ sudo ifconfig eth0 up` - Bring interface eth0 up
- `$ sudo ifconfig eth0 down` - Bring interface eth0 down
- `$ sudo ifconfig eth0 mtu 1480` - Set the MTU (Maximum Transfer Unit) to 1480 bytes for interface eth0

### PNIDN

The Predictable Network Interface Device Names (PNIDN) is strongly correlated with the use of udev and integration with systemd. There are now 5 types of names that devices can be given:

- Incorporating Firmware or BIOS provided index numbers for on-board devices
    - Example: eno1
- Incorporating Firmware or BIOS provided PCI Express hotplug slot index numbers
    - Example: ens1
- Incorporating physical and/or geographical location of the hardware connection
    - Example: enp2s0
    - These names are correlated with the physical locations of the hardware on the PCI system: `$ lspci | grep Ethernet`
- Incorporating the MAC address
    - Example: enx7837d1ea46da
- Using the old classic method
    - Example: eth0

It is easy to turn off the new scheme and go back to the classic names.

### NIC Config Files

Each distribution has its own set of files and/or directories, and they may be slightly different, depending on your distribution version.

- Red Hat
    - /etc/sysconfig/network
    - /etc/sysconfig/network-scripts/ifcfg-ethX
    - /etc/sysconfig/network-scripts/ifcfg-ethX:Y
    - /etc/sysconfig/network-scripts/route-ethX
- Debian
    - /etc/network/interfaces
- SUSE
    - /etc/sysconfig/network

### Network Manager

As a system was booted, it consulted the network configuration files in the `/etc` directory subtree in order to establish the interface properties such as static or dynamic (DCHP) address configuration, whether the device should be started at boot, etc. If there were multiple network devices, policies had to be established as to what order they would be brought up, which networks they would connect to, what they would be called, etc.

Modern systems often have dynamic configurations:

- Networks may change as a device is moved from place to place.
- Wireless devices may have a large choice of networks to hook into.
- Devices may change as hardware such as wireless devices, are plugged in or turned on and off.

Use of a GUI tool, `nmtui` or `nmcli` (for scripting) are the common ways to manage networks. Examples of `nmcli` can be found at [Networking/CLI Fedora wiki webpage](https://fedoraproject.org/wiki/Networking/CLI){target=_blank} or with `man nmcli-examples`

### Routing

Routing is the process of selecting paths in a network along which to send network traffic. The routing table is a list of routes to other networks managed by the system. It defines paths to all networks and hosts, sending remote traffic to routers.

To see the current routing table, you can use `route -n` or `ip route`.

The default route is the way packets are sent when there is no other match in the routing table for reaching the specified network, which can be obtained dynamically using DHCP or manually configured (static). You can set the default gateway at runtime with: `sudo route add default gw 192.168.1.10 enp2s0`

To make persistent change, do:

- add `GATEWAY=x.x.x.x` to `/etc/sysconfig/network` for Red Hat systems
    - or `/etc/sysconfig/network-scripts/ifcfg-ethX` for device-specific change
- add `gateway=x.x.x.x` to `/etc/network/interfaces` for Debian systems

#### Static Routes

Static routes are used to control packet flow when there is more than one router or route. They are defined for each interface and can be either persistent or non-persistent. When the system can access more than one router, or perhaps there are multiple interfaces, it is useful to selectively control which packets go to which router.

To make static route at run time, do `ip route add 10.5.0.0/16 via 192.168.1.100`

To make persistent change, do:

- add `10.5.0.0/16 via 172.17.9.1` to `/etc/sysconfig/network-scripts/route-ethX` for Red Hat system
- add following to `/etc/network/interfaces` for Debian systems:

```
iface eth1 inet dhcp
post-up route add -host 10.1.2.51 eth1
post-up route add -host 10.1.2.52 eth1
```

- for SUSE systems add following to files such as `/etc/sysconfig/network/ifroute-eth0`:

```
# Destination Gateway Netmask Interface [Type] [Options]
# where each field is separated by tabs
192.168.1.150 192.168.1.1 255.255.255.255 eth0
10.1.1.150 192.168.233.1.1 eth0
10.1.1.0/24 192.168.1.1 - eth0
```

### Name Resolution

Name resolution is the act of translating hostnames to the IP addresses of their hosts. There are two facilities for doing this translation:

- Static name resolution (using `/etc/hosts`).
- Dynamic name resolution (using DNS servers).

Commands used to resolve the IP address of a hostname: `[dig | host | nslookup] linuxfoundation.org`

#### /etc/hosts

`/etc/hosts` holds a local database of hostnames and IP addresses. It contains a set of records (each taking one line) which map IP addresses with corresponding hostnames and aliases.

Such static name resolution is primarily used for local, small, isolated networks. It is generally checked before DNS is attempted to resolve an address; however, this priority can be controlled by `/etc/nsswitch.conf` (not often used today).

The other host-related files in `/etc` are `/etc/hosts.deny` and `/etc/hosts.allow`. The allow file is searched first and the deny file is only searched if the query is not found there. `/etc/host.conf` contains general configuration information; it is rarely used.

#### DNS

If name resolution cannot be done locally using /etc/hosts, then the system will query a DNS (Domain Name Server) server.

DNS is dynamic and consists of a network of servers which a client uses to look up names. The service is distributed; any one DNS server has only information about its zone of authority; however, all of them together can cooperate to resolve any name.

The machine's usage of DNS is configured in /etc/resolv.conf, which historically has looked like:

```
search example.com aps.org
nameserver 192.168.1.1
nameserver 8.8.8.8
```

which:

- Can specify particular domains to search
- Defines a strict order of nameservers to query
- May be manually configured or updated from a service such as DHCP (Dynamic Host Configuration Protocol)

Most modern systems will have an `/etc/hosts.resolv` file generated automatically which was generated by NetworkManager invoking DHCP on the primary network interface.

### Network Diagnostics

Some utilities that helps diagnosis network:

- ping - Sends 64-byte test packets to designated network hosts and tries to report back on the time required to reach it, any lost packets, and some other parameters. You can see whether the network is working and the host is reachable.
- traceroute - Displays a network path to a destination. It shows the routers packets flow through to get to a host, as well as the time it takes for each hop.
- mtr - It combines the functionality of `ping` and `traceroute`, and creates a continuously updated display.
- dig - It is useful for testing DNS functionality. Note that one can also use `host` or `nslookup`, older programs that also try to return DNS information about a host.

## Firewall

A firewall is a network security system that monitors and controls all network traffic. It applies rules on both incoming and outgoing network connections and packets and builds flexible barriers depending on the level of trust and network topography (or topology) of a given connection.

Firewalls can be hardware or software based. They are found both in network routers, as well as in individual computers, or network nodes. Many firewalls also have routing capabilities.

Information is transmitted​ across networks in the form of packets, and each one of these packets has: Header, Payload, Footer. The header and footer contain information about destination and source addresses, what kind of packet it is, and which protocol it obeys, various flags, which packet number this is in a stream, and ​all sorts of other metadata about transmissions. The actual data is in the payload.

Almost all firewalls are based on Packet Filtering. ​Packet filtering intercepts packets at one or more stages in the network transmission, including application, transport, network, and datalink. A firewall establishes a set of rules by which each packet may be:

- Accepted or rejected based on content, address, etc.​
- Mangled in some way
- Redirected to another address
- Inspected for security reasons, etc.

The next generation of firewalls were based on stateful filters, which also examine the connection state of the packet, to see if it is a new connection, ​part of an already existing one, or part of none. Denial of service attacks can bombard this kind of firewall to try and overwhelm it.

The third generation of firewalls is called Application Layer Firewalls, and are aware of the kind of application and protocol the connection is using. They can block anything which should not be part of the normal flow.​

### Firewall Configurations

Configuring the firewall with low-level cli tools such as `iptables, firewall-cmd, ufw`, or GUI tools such as `system-config-firewall, firewall-config, gufw, yast`.

#### firewalld

`firewalld` is the Dynamic Firewall Manager. It utilizes network/firewall zones which have defined levels of trust for network interfaces or connections. It supports both IPv4 and IPv6 protocols. Additionally, it separates runtime and permanent (persistent) changes to configuration, and also includes interfaces for services or applications to add firewall rules. Configuration files are kept in `/etc/firewalld` (primary) and `/usr/lib/firewalld`

As a service, firewalld replaces the older iptables. It is an error to run both services, firewalld and iptables, at the same time. The command line tool to manage `firewalld` is `firewall-cmd`.

Note that if you have more than one network interface when using IPv4, you have to turn on ip forwarding, with:

```sh
sudo sysctl net.ipv4.ip_forward=1
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward
sudo sysctl -p
```

#### zones

`firewalld` works with zones, each of which has a defined level of trust and a certain known behavior for incoming and outgoing packets. Each interface belongs to a particular zone (normally, it is NetworkManager which informs firewalld which zone is applicable) which can be changed with `fireweall-cmd`.

Types of zones and their effects:

- drop - All incoming packets are dropped with no reply. Only outgoing connections are permitted.
- block - All incoming network connections are rejected. The only permitted connections are those from within the system.
- public - Do not trust any computers on the network; only certain consciously selected incoming connections are permitted.
- external - Used when masquerading is being used, such as in routers. Trust levels are the same as in public.
- dmz (Demilitarized Zone) - Used when access to some (but not all) services are to be allowed to the public. Only particular incoming connections are allowed.
- work - Trust (but not completely) connected nodes to be not harmful. Only certain incoming connections are allowed.
- home - You mostly trust the other network nodes, but still select which incoming connections are allowed.
- internal - Similar to the work zone.
- trusted - All network connections are allowed.

On system installation, most, if not all Linux distributions, will select the public zone as default for all interfaces.

Any zone can be bound not just to a network interface, but also to particular network addresses. A packet is associated with a zone if:

- It comes from a source address already bound to the zone; or if not,
- It comes from an interface bound to the zone.

Any packet not fitting the above criteria is assigned to the default zone (i.e, usually public).

```sh
# example commands for adding rules for setting zones on the level of interface, IP addresses, service, port and protocal
sudo firewall-cmd --permanent --zone=internal --change-interface=eno1
sudo firewall-cmd --permanent --zone=trusted --add-source=192.168.1.0/24
sudo firewall-cmd --permanent --zone=home --add-service=dhcp
sudo firewall-cmd --zone=home --add-port=21/tcp
```

## System Startup and Shutdown

The boot sequence basic steps are:

- The BIOS/UEFI locates and executes the boot program, or boot loader.
    - POST (Power On Self Test) is run to check the memory and hardware and then search a specific location or device for a boot program
    - boot program is found in MBR or using UEFI. It is usually GRUB.
- The boot loader loads the kernel.
    - kernel need to be decompressed, then performs hardware checks, gains access to important peripheral hardware
- The kernel starts the init process (pid=1).
- init manages system initialization, using systemd or the older Upstart and SysVinit startup scripts.

### GRUB

Virtually, all (non-embedded) modern Linux distributions use GRUB (GRand Unified Boot Loader). efibootmgr is not actually a boot loader, but is a boot manager, used in conjunction with GRUB on multi-boot EFI systems.

Some important features of GRUB are:

- Alternative operating systems can be chosen at boot time.
- Alternative kernels and/or initial ramdisks can be chosen at boot time for a given operating system.
- Boot parameters can be easily changed at boot time without having to edit configuration files, etc., in advance.

At boot, a basic configuration file is read, `/boot/grub/grub.cfg`, or `/boot/grub2/grub.cfg`, or `/boot/efi/EFI/redhat/grub.cfg`. This file is auto-generated by `update-grub` (or `grub-mkconfig` or `grub2-mkconfig`) based on configuration files in the `/etc/grub.d` directory and on `/etc/default/grub` and should not be edited by hand.

Upon system boot, after the initial POST and BIOS stages, GRUB will be entered and display a menu containing a list of bootable images either from one or more Linux distributions or operating systems, with submenus. After selecting an entry, you can type e for edit and then enter into an interactive shell to edit the particular boot option.

If there are serious problems, like not being able to find a configuration file, GRUB reverts back to a pure shell mode and you may be able to rescue the system without resorting to rescue media.

In both GRUB versions, the first hard drive is denoted as hd0, the second is hd1, etc. However, in Version 1, partitions start counting from 0, and in Version 2 from 1. For example: sda1 is (hd0,1) in GRUB 2, but (hd0,0) in GRUB 1.

On systems configured with Boot Loader Specification Configuration (BLSCFG), one still uses the usual grub commands when installing or updating kernels, but detailed information and options for each kernel are found in `/boot/loader/entries`. This new scheme can be turned on/off with `grub2-switch-to-blscfg` or altering the variable `GRUB_ENABLE_BLSCFGS=[true|false]` in `/etc/default/grub`.

### Configuration Files in `/etc`

For historical reasons, Linux distributions evolved their own rules about exactly where to place some information in /etc. For example, all Red Hat-derived systems make extensive use of /etc/sysconfig, while Debian-based systems have used /etc/default. Interestingly, RHEL and SUSE use both.​

There should be only text files found under /etc, no binary formats or data.

#### /etc/sysconfig

Files in this directory and its subdirectories are used by many system utilities services, often consulted when the system starts and stops services or queries their status.

#### /etc/default

The files are used to provide extra options when starting a service and typically contain code to set environment variables.

### shutdown

`shutdown` is used to bring the system down in a secure fashion, notifying all users that the system is going down and then stopping it in a graceful and non-destructive way. After it is shut down, the system is either halted or rebooted. There are also the legacy commands `reboot`, `halt`, and `poweroff`

### /sbin/init

`/sbin/init` (usually just called init) is the first user-level process (or task) run on the system and continues to run until the system is shutdown. Traditionally, it has been considered the parent of all user processes, although technically that is not true, as some processes are started directly by the kernel.

init coordinates the later stages of the boot process, configures all aspects of the environment, and starts the processes needed for logging into the system. init also works closely with the kernel in cleaning up after processes when they terminate.

Traditionally, nearly all distributions based the init process on UNIX's venerable SysVinit' software. However, this scheme was developed decades ago under rather different circumstances:

- The target was multi-user mainframe systems (and not personal computers, laptops, and other devices)
- The target was a single processor system
    - startup was viewed as a serial process, divided into a series of sequential stages (run levels).
- Startup (and shutdown) time was seen rare and not an important matter; it was far less important than getting things right.

Modern systems have required newer methods with enhanced capabilities.

### systemd

The `systemd` system and session manager for Linux is now dominant in all major distributions. Features include the following:

- Boots faster than previous init systems
- Provides aggressive parallelization capabilities
- Uses socket and D-Bus activation for starting services
- Replaces shell scripts with programs
- Offers on-demand starting of daemons
- Keeps track of processes using cgroups
- Maintains mount and automount points
- Implements an elaborate transactional dependency-based service control logic
- Can work as a drop-in replacement for SysVinit and is compatible with SysVinit scripts.

`systemd` is backward compatible with SysVinit and the concept of runlevels is supported via runlevel targets. The telinit program is emulated to work with runlevels. `systemd` prefers to use a set of standardized configuration files, it can also use distribution-dependent legacy configuration files as a fall-back.

#### systemctl

systemctl is the main utility for managing services. Its basic syntax is: `systemctl [options] command [name]`. Some examples:

- `systemctl` - To show the status of everything that systemd controls
- `systemctl list-units -t service --all` - To show all available services
- `systemctl list-units -t service` - To show only active services
- `sudo systemctl start/stop foo.service` -  To start (activate) or stop (deactivate) one or more units (a service or a socket)
- `sudo systemctl enable/disable sshd.service` - To enable/disable a service

For most commands, you can omit the `.service` attached to the service name. 

Also worth read [SysVinit to Systemd Cheetsheet](https://fedoraproject.org/wiki/SysVinit_to_Systemd_Cheatsheet){target=_blank}.

## Backup and Recovery

Obviously, files essential to your organization require backup. Configuration files may change frequently, and along with individual user's files, require backup as well.

Logging files can be important and worth to backup if you have to investigate your system's history, which can be particularly important for detecting intrusions and other security violations.

The simplest backup scheme is to do a full backup of everything once, and then perform incremental backups of everything that subsequently changes. While full backups can take a lot of time, restoring from incremental backups can be more difficult and time consuming. Thus, you can use a mix of both to optimize time and effort.

An example of one useful strategy involving tapes (you can easily substitute other media in the description):

- Use tape 1 for a full backup on Friday.
- Use tapes 2-5 for incremental backups on Monday-Thursday.
- Use tape 6 for full backup on second Friday.
- Use tapes 2-5 for incremental backups on second Monday-Thursday.
- Do not overwrite tape 1 until completion of full backup on tape 6.
- After full backup to tape 6, move tape 1 to external location for disaster recovery.
- For next full backup (next Friday) get tape 1 and exchange for tape 6.

A good rule of thumb is to have at least two weeks of backups available.

### Backup utilities

- `cpio` and `tar` - create and extract archives of files.
- `gzip, bzip2, xz` - create archive files to be written to disk, magnetic tape, or any other device which can hold files. Archives are very useful for transferring files from one filesystem or machine to another.
- `dd` - transfer raw data between media. It can copy entire partitions or entire disks.
- `rsync` - synchronize directory subtrees or entire filesystems across a network, or between different filesystem locations on a local machine.
- `dump` and `restore` - old but designed specifically for backups. They read from the filesystem directly (which is more efficient). However, they must be restored only on the same filesystem type that they came from. There are newer alternatives.
- `mt` - useful for querying and positioning tapes before performing backups and restores.

#### dd

`dd` is a common UNIX-based program whose primary purpose is the low-level copying and conversion of raw data. It is used to copy a specified number of bytes or blocks, performing on-the-fly byte order conversions, as well as being able to convert data from one form to another. It can also be used to copy regions of raw device files, for example backing up the boot sector of a hard disk, or to read fixed amounts of data from special files like /dev/zero or /dev/random. The basic syntax is: `dd if=input-file of=output-file options`

#### rsync

`rsync` (remote synchronize) is used to transfer files across a network (or between different locations on the same machine). The basic syntax is: `rsync [options] sourcefile destinationfile`

The source and destination can take the form of `target:path`, where target can be in the form of `[user@]host`. The `user@` part is optional and used if the remote user is different from the local user.

You have to be very careful with rsync about exact location specifications (especially if you use the `--delete` option), so it is highly recommended to use the `--dry-run` option first, and then repeat if the projected action looks correct.

`rsync` is very clever; it checks local files against remote files in small chunks, and it is very efficient in that when copying one directory to a similar directory, only the differences are copied over the network. This synchronizes the second directory with the first directory. You may often use the -r option, which causes rsync to recursively walk down the directory tree copying all files and directories below the one listed as the sourcefile. Thus, a very useful way to back up a project directory might be similar to: `rsync -r project-X archive-machine:archives/project-X`

A simple (and very effective and very fast) backup strategy is to simply duplicate directories or partitions across a network with rsync commands and to do so frequently.

#### cpio

`cpio` (copy in and out) is a general file archiver utility that has been around since the earliest days of UNIX and was originally designed for tape backups. It is light weight than `tar`.

The `-o` or `--create` option tells cpio to copy files out to an archive, which reads a list of file names (one per line) from standard input and writes the archive to standard output. The `-i` or `--extract` option tells cpio to copy files from an archive, reading the archive from standard input. The `-t` or `--list` option tells cpio to list the archive contents.

#### Backup programs

- Amanda - (Advanced Maryland Automatic Network Disk Archiver) uses native utilities (including tar and dump) but is far more robust and controllable. Amanda is generally available on Enterprise Linux systems through the usual repositories.
- Bacula - designed for automatic backup on heterogenous networks. It can be rather complicated to use and is recommended (by its authors) only to experienced administrators. Bacula is generally available on Enterprise Linux systems through the usual repositories.
- Clonezilla - a very robust disk cloning program, which can make images of disks and deploy them, either to restore a backup, or to be used for ghosting, to provide an image that can be used to install many machines.

## Linux Security Modules

Linux Security Modules (LSM) emphasis the idea of implementing mandatory access controls over the variety of requests made to the kernel in a way that:

- Minimizes changes to the kernel
- Minimizes overhead on the kernel
- Permits flexibility and choice between different implementations, each of which is presented as a self-contained LSM (Linux Security Module)

The basic idea is to hook system calls and insert code whenever an application requests a transition to kernel (system) mode. This code makes sure permissions are valid, malicious intent is protected against, by invoking security-related functional steps before and/or after a system call is fulfilled by the kernel.

The current LSM implementations: SELinux, AppArmor, Smack, Tomoyo.

### SELinux

SELinux was originally developed by the United States NSA (National Security Administration) and has been brought into a large usage base.

Operationally, SELinux is a set of security rules that are used to determine which processes can access which files, directories, ports, and other items on the system.

It works with three conceptual quantities:

- Contexts - Context are labels to files, processes and ports. Examples of contexts are SELinux user, role, type, level.
- Rules - Rules describe access control in terms of contexts, processes, files, ports, users, etc.
- Policies - Policies are a set of rules that describe what system-wide access control decisions should be made by SELinux.

SELinux modes are selected (and explained) in `/etc/sysconfig/selinux` (CentOS and openSUSE) or `/etc/selinux/config` (Ubuntu). The `sestatus` utility can display the current mode and policy. The list of SELinux modes:

- Enforcing - All SELinux code is operative and access is denied according to policy. All violations are audited and logged. 
- Permissive - Enables SELinux code, but only audits and warns about operations that would be denied in enforcing mode.
- Disabled - Completely disables SELinux kernel and application code, leaving the system without any of its protections.

#### getenforce, setenforce

`getenforce` can be used to get the current SELinux mode. `setenforce` can be used to switch between enforcing and permissive modes on the fly while the system is in operation, but it does not allow you to enable/disable SELinux completely.

Disable SELinux is done through either:

- Edit the SELinux configuration file and set `SELINUX=disabled`
- Add selinux=0 to the kernel parameter list when rebooting

Note that disabling SELinux on systems in which SELinux will be re-enabled is not recommended. It is preferable to use the permissive mode instead of disabling SELinux, so as to avoid relabeling the entire filesystem, which can be time-consuming.

#### Policies

SELinux configuration file also sets the SELinux policy. Multiple policies are allowed, but only one can be active at a time.

Changing the policy may require a reboot of the system and a time-consuming re-labeling of filesystem contents. Each policy has files which must be installed under `/etc/selinux/[SELINUXTYPE]`. Some common SELinux policies:

- targeted - The default policy in which SELinux is more restricted to targeted processes. User processes and init processes are not targeted, while network service processes are targeted. SELinux enforces memory restrictions for all processes, which reduces the vulnerability to buffer overflow attacks.
- minimum - A modification of the targeted policy where only selected processes are protected.
- MLS - The Multi-Level Security policy is much more restrictive; all processes are placed in fine-grained security domains with particular policies.

SELinux policy behavior can be configured at runtime without rewriting the policy. This is accomplished by configuring SELinux Booleans, which are policy parameters that can be enabled and disabled:

- `getsebool` - to see booleans
- `setsebool` - to set booleans
    - default the change is not persistent. Make it persistent with option `-P`
- `semanage boolean -l` - to see persistent boolean settings


#### Contexts

There are four SELinux contexts: User, Role, Type, Level.

Use `-Z` with utilities such as `ls`, `ps`, `cp`, `mv`, and `mkdir`. To see the context associated witha file/process. Type is the most commonly utilized context, and its label should end with `_t`, as in `kernel_t`.

You can use `chcon` to change a file's context, as in `chcon -t etc_t somefile`.

Note that newly created files inherit the context from their parent directory, but when moving files, it is the context of the source directory which may be preserved. In that event, use `restorecon` which resets file contexts, based on parent directory settings. i.e. `restorecon -Rv /home/jimih` on a directory will correct the context recursively for files under.

To configure the default context for a newly created directory, use `semanage fcontext` (from `policycoreutils-python` package). After the change, a call to `restorecon` is still required.

#### Monitoring Access

SELinux comes with a set of tools that collect issues at run time, log these issues and propose solutions to prevent same issues from happening again, via `setroubleshoot-server` package.

### AppArmor

AppArmor is an LSM alternative to SELinux, used by SUSE, Ubuntu and other distributions. It:

- Provides Mandatory Access Control (MAC)
- Allows administrators to associate a security profile to a program which restricts its capabilities
- Is considered easier (by some but not all) to use than SELinux
- Is considered filesystem-neutral (no security labels required)

In addition to manually specifying profiles, AppArmor includes a learning mode, in which violations of the profile are logged, but not prevented. This log can then be turned into a profile, based on the program's typical behavior.

To view its status, do `sudo apparmor_status`.

AppArmor Modes:

- Enforce Mode - Applications are prevented from acting in ways which are restricted. Attempted violations are reported to the system logging files. This is the default mode. A profile can be set to this mode with aa-enforce.
- Complain Mode - Policies are not enforced, but attempted policy violations are reported. This is also called the learning mode. A profile can be set to this mode with aa-complain.

Profiles restrict how executable programs that have pathnames on the system can be used. Linux distributions come with​ pre-packaged profiles or installed with an AppArmor package (`apparmor-profiles`), included in `/etc/apparmor.d`.

Some common AppArmor utilities:

Program | Use
------- | ---
apparmor_status|Show status of all profiles and processes with profiles
apparmor_notify|Show a summary for AppArmor log messages
complain|Set a specified profile to complain mode
enforce|Set a specified profile to enforce mode
disable|Unload a specified profile from the current kernel and prevent from being loaded on system startup
logprof|Scan log files, and, if AppArmor events that are not covered by existing profiles have been recorded, suggest how to take into account, and, if approved, modify and reload
easyprof|Help set up a basic AppArmor profile for a program

## Local System Security

Security can be defined in terms of the system's ability to regularly do what it is supposed to do, integrity and correctness of the system, and ensuring that the system is only available to those authorized to use it.

The biggest problem with security is to find that appropriate mix of security and productivity; if security restrictions are tight, opaque, and difficult, especially with ineffective measures, users will circumvent procedures.

It is important to create and publicize to your organization a clear security policy that is descriptive, easy to understand, and constantly updated. Policies should be generic and specify enforcement actions and response to breach.

Essential aspects to cover:

- Confidentiality
- Data Integrity
- Availability
- Consistency
- Control
- Audit

You should make sure that the data is correct and the system behaves as it is expected to do. There should be processes in effect to determine who is given access to your system.

### Risk Analysis

Risk analysis is based on the following three questions:

- What do I want to protect (identify assets)?
- What am I protecting it against (identify threats)?
- How much time, personnel, and money is needed to provide adequate protection?

Two basic philosophies found in use in most computing environments:

- Anything not expressly permitted is denied.​
- Anything not expressly forbidden is permitted.

The first choice is tighter: a user is allowed to do only what is clearly and explicitly specified as permissible without privilege. This is the most commonly used philosophy.

The second choice builds a more liberal environment where users are allowed to do anything except what is expressly forbidden. It implies a high degree of assumed trust and is less often deployed for obvious reasons.

### Patch system updates

Most attacks exploit known security holes and are deployed in the time period between revelation of a problem and patches being applied. It is critical to pay attention to your Linux distributor's updates and upgrades and apply them as soon as possible.

### Hardware Accessibility

Any time hardware is physically accessible security can be compromised by:

- Key logging: Recording the real time activity of a computer user including the keys they press. The captured data can either be stored locally or transmitted to remote machines.
- Network sniffing: Capturing and viewing the network packet level data on your network.
- Booting with a live or rescue disk.
- Remounting and modifying disk content.

Physical access to a system makes it possible for attackers to easily leverage several attack vectors, in a way that makes all operating system level recommendations irrelevant. Thus, security policy should start with requirements on how to properly secure physical access to servers and workstations.

Necessary protective steps include:

- Locking down workstations and servers
- Protecting your network links against access by people you do not trust
- Protecting your keyboards where passwords are entered to ensure the keyboards cannot be tampered with
- Configuring password protection of the BIOS in such a way that the system cannot be booted with a live or rescue CD/DVD or USB key

Setting a BIOS password protects against unauthorized persons changing the boot options to gain access to your system. You can secure the boot process further with a secure bootloader password to prevent someone from bypassing the user authentication step.

### Secure Mount Filesystem

When a filesystem is mounted, either at the command line with a mount command, or automatically by inclusion in /etc/fstab, various options can be specified to enhance security:

- nodev - Do not interpret character or block special devices on the filesystem.
- nosuid - The set-user-identifier or set-group-identifier bits are not to take effect.​
- noexec - Restrict direct execution of any binaries on the mounted filesystem.
- ro - Mount the filesystem in read-only mode as in: `mount -o ro,noexec,nodev /dev/sda2 /edsel`

By setting the `setuid` (set user ID) flag on an executable file, you modify this normal behavior by giving the program the access rights of the owner rather than the user of the program. Similar rule apply for `setgid` bit for giving runtime group access rights.

By default, when a file is created in a directory, it is owned by the user and group of the user that created it. Using the setgid setting on the directory changes this so that files created in the directory are group owned by the group owner of the directory. This allows you to create a shared directory in which a group of users can share files.

Set the setuid bit with `chmod u+s somefile`, and setgid bit with `chmod g+s somefile`

## Troubleshooting

Troubleshooting involves taking a number of steps which need to be repeated iteratively until solutions are found. A basic recipe might be:

- Characterize the problem
- Reproduce the problem
- Always try the easy things first
- Eliminate possible causes one at a time
- Change only one thing at a time; if that doesn't fix the problem, change it back
- Check the system logs (/var/log/messages, /var/log/secure, etc.) for further information

### System Rescue

Sooner or later a system is likely to undergo a significant failure. System Rescue media in the form of optical disks or portable USB drives can be used to fix the situation. Booting into either emergency or single user mode can enable using the full suite of Linux tools to repair the system back to normal function.

The rescue image can be mounted and use `chroot` to change into that environment. You may install software packages from inside the chroot-ed environment. You may also be able to install them from outside the chroot-ed environment. i.e. `sudo rpm -ivh --force --root=/mnt/sysimage /mnt/source/Packages/vsftpd-2*.rpm`.

Emergency boot media are useful when your system won't boot due to some issue such as missing, misconfigured, or corrupted files or a misconfigured service.

In emergency mode you are booted into the most minimal environment possible. The root filesystem is mounted read-only, no init scripts are run and almost nothing is set up. To enter emergency mode, you need to select an entry from the GRUB boot menu and then hit e for edit. Then add the word emergency to the kernel command line before telling the system to boot.

If your system boots, but does not allow you to log in when it has completed booting, try single user mode:

- init is started
- Services are not started
- Network is not activated
- All possible filesystems are mounted
- root access is granted without a password
- A system maintenance command line shell is launched

In this mode, your system boots to runlevel 1 (in SysVinit language). To enter single user mode, you need to select an entry from the GRUB boot menu and then hit e for edit. Then add the word single to the kernel command line before telling the system to boot.
