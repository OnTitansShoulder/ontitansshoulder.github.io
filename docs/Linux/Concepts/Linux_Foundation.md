---
layout: note_page
title: Linux Foundation
title_short: linux_basics
dateStr: 2021-03-01
category: Linux
tags: notes check
---
This set of notes were taken from the Linux Foundation Course:
[Introduction to Linux (LFS101x)](https://training.linuxfoundation.org/training/introduction-to-linux/){target=_blank} as well as some enrichments from linux.vbird.org

## About Linux

### Linux History

Linux's inception was in 1991, created by **Linus Torvalds** and lead maintainer **Greg Kroah-Hartman**. Linux is initially developed on and for Intel x86-based personal computers. It has been subsequently ported to an astoundingly long list of other hardware platforms.

In 1992, Linux was re-licensed using the **General Public License** (GPL) by GNU (a project of the Free Software Foundation or FSF, which promotes freely available software), which made it possible to build a worldwide community of developers.

The Linux distributions created in the mid-90s provided the basis for fully free computing (in the sense of freedom, not zero cost) and became a driving force in the open source software movement.

The success of Linux has catalyzed **growth in the open source community**, demonstrating the commercial efficacy of open source and inspiring countless new projects across all industries and levels of the technology stack.

Today, Linux powers more than half of the servers on the Internet, the majority of smartphones, consumer products, automobiles, and all of the world’s most powerful supercomputers.

### Linux Philosophy

Linux borrows heavily from the well-established **UNIX** operating system. It was written to be a **free and open source** system to be used in place of UNIX, which at the time was designed for computers much more **powerful** than PCs and was quite expensive.

Files are stored in a **hierarchical** filesystem, with the top node of the system being the root or simply "/". Whenever possible, Linux makes its components available via files or objects that **look like files**.

**Processes**, **devices**, and **network sockets** are all represented by **file-like objects**, and can often be worked with using the same utilities used for regular files.

Linux is a fully **multitasking**, **multiuser** operating system, with built-in networking and service processes known as **daemons** in the UNIX world.

Linux stands for _Linux is not UNIX_.

### Linux Terminology

- **kernel** - brain of the Linux OS, controls **hardware** and let applications interacts with hardware
- **distribution** (Distro) - **collection of programs** combined with Linux kernel to make up a Linux-based OS
- **boot loader** - a program **boots the OS**, i.e. GRUB, ISOLINUX
- **service** - a program runs as a **background process**, i.e. httpd, nfsd, ntpd, ftpd, named
- **filesystem** - the method for **storing and organizing files** in Linux, i.e. ext3, ext4, FAT, XFS, Btrfs
- **X Window System** - provides **standard toolkit and protocal** to build **graphical** UI on all Linux Distro
- **desktop environment** - a **graphical user interface** on top of the OS, i.e. GNOME, KDE, Xfce, Fluxbox
- **command line** - interface for typing **commands** on top of OS
- **shell** - command line **interpreter** that interprets the command line input and instructs the OS to perform tasks, i.e. bash, tcsh, zsh

### Linux Distributions

Linux is constantly evolving, both at the technical level (including kernel features) and at the distribution and interface level.

A full Linux distribution consists of the **kernel** plus a number of other software **tools** for file-related operations, user management, and software package management. Linux distributions may be based on different kernel versions.

Examples of other essential tools and ingredients provided by distributions include the C/C++ compiler, the gdb debugger, the core system libraries applications need to link with in order to run, the low-level interface for drawing graphics on the screen, as well as the higher-level desktop environment, and the system for installing and updating the various components, including the kernel itself.

Three widely used Linux distributions (all distributions found [here](https://lwn.net/Distributions/){target=_blank}):

- Red Hat Enterprise Linux (RHEL) Family - CentOS, Fedora, Oracle Linux
- SUSE Family - SLES, openSUSE
- Debian Family - Ubuntu, Linux Mint

All major distributors provide update services for keeping your system primed with the latest security and bug fixes, and performance enhancements, as well as provide online support resources.

#### RHEL

**RHEL** is the most popular Linux distribution in **enterprise** environments. Some facts:

- Fedora is opensource version of RHEL, shipped with lots more software, and serves as an upstream testing platform for RHEL.
- CentOS is a close clone of RHEL now owned by Red Hat, while Oracle Linux is mostly a copy with some changes
- A heavily patched version 3.10 kernel is used in RHEL/CentOS 7, while version 4.18 is used in RHEL/CentOS 8.
- It supports hardware platforms such as `Intel x86`, `Arm`, `Itanium`, `PowerPC`, and `IBM System z`.
- It uses the `yum` and `dnf` **RPM-based** yum package managers to install, update, and remove packages in the system.

**CentOS** is a popular free alternative to RHEL and is often used by organizations that are comfortable operating without paid technical support.

#### SUSE

**SUSE** is an acronym for _Software- und System-Entwicklung_ (Software and Systems Development). And SLES stands for _SUSE Linux Enterprise Server_. Some facts:

- SLES is upstream for openSUSE.
- Kernel version 4.12 is used in openSUSE Leap 15.
- It uses the **RPM-based** `zypper` package manager to install, update, and remove packages in the system.
- It includes the `YaST` (Yet Another Setup Tool) application for system administration purposes.
- SLES is widely used in **retail** and many other sectors.

#### Debian

**Debian** provides by far the largest and most complete software repository to its users of any Linux distribution, and has a strong focus on stability. Some facts:

- The Debian family is upstream for Ubuntu, and Ubuntu is upstream for Linux Mint and others.
- Debian is a pure open source community project not owned by any corporation.
- Kernel version 4.15 is used in Ubuntu 18.04 LTS.
- It uses the **DPKG-based** `APT` package manager (using `apt`, `apt-get`, `apt-cache`, etc.) to install, update, and remove packages in the system.
- Ubuntu has been widely used for **cloud deployments**.
- While Ubuntu is built on top of Debian and is GNOME-based under the hood, it differs visually from the interface on standard Debian, as well as other distributions.

**Ubuntu** and **Fedora** are widely used by developers and are also popular in the educational realm.

## How Linux Works

### Boot Process

The Linux boot process is the procedure for initializing the system, from pressing the power switch to a fully operational user interface.

```
Power ON
-> BIOS
--> Master Boot Record (MBR)
---> Boot Loader
----> Kernel
-----> Initial RAM disk
------> /sbin/init (parent process)
-------> Command Shell using getty
--------> X Windows System (GUI)
```

#### BIOS

**BIOS** stands for Basic Input/Output System. It runs and initializes the **I/O hardware** such as screen and keyboard, and tests the main memory, a process called **POST** (Power On Self Test).

BIOS software is stored on a ROM chip on the motherboard.

#### MBR and Boot Loader

After POST, control is passed to the boot loader, usually stored on one of the hard disks either in the boot sector (**MBR**) or the **EFI/UEFI** partition ((Unified) Extensible Firmware Interface).

Date, time, and other peripherals are loaded from the **CMOS** values (from a battery-powered memory store which allows the machine track date and time when powered off).

##### MBR

**MBR** is just 512 bytes in size which holds the boot loader. The boot loader examines the **partition table** and finds a **bootable partition**, then search for a second stage boot loader and loads it into RAM.

##### EFI/UEFI

**EFI/UEFI** boot method has firmware reads its Boot Manager data and determine the UEFI application to launch and the **disk and partition** to launch it from.

##### Second stage boot loader

The **second stage boot loader** resides under `/boot`. Common boot loaders:

- **GRUB** - GRand Unified Boot Loader, on most machines and Linux distributions
- **ISOLINUX** - for booting from removable media
- **DAS U-Boot** - for booting on embedded devices and appliances

When booting Linux, the boot loader is responsible for loading and uncompress the **kernel image** and load the **initial RAM disk**, **filesystem**, or **drivers** into memory. Most boot loaders provide an UI for choosing boot options or other OS to boot into.

#### Initial RAM Disk

The **initramfs** filesystem image is a RAM-based filesystem which contains programs and binary files that perform all actions needed to provide kernel functionality, locating devices and drivers, mount the proper **root filesystem**, and check for filesystem errors.

The mount program instructs the OS that a filesystem is ready for use, and associates it with a particular point in the overall **hierarchy** of the filesystem (the **mount point**).

Then initramfs is cleared from RAM and `/sbin/init` is executed, which handles the **mounting and pivoting** over to the final **real root filesystem**. It ten starts a number of text-mode login prompts (ttys) which allow you to type in username and password to get a command shell.

Most distributions start six text terminals and one graphics terminal, and swith with `CTRL-ALT + F1~F7`. The default command shell is `bash` (the GNU Bourne Again Shell).

#### Linux Kernel

When the **kernel** is loaded in RAM, it immediately **initializes and configures** the computer’s **memory** and all the **hardware** attached to the system, and loads some necessary user space applications.

`/sbin/init` is only ran after kernel set up all hardware and mounted the root filesystem. It is the origin of all non-kernel processes and is responsible for **keeping the system running** and for **clean shutdowns**.

##### SysVinit

In older distros, this process startup follows a System V UNIX convention (aka **SysVinit**) where the system pass through a serial process of **runlevels** containing collections of scripts that start and stop services. Each runlevel supports a **different mode of running the system**. Within each runlevel, **individual services** can be set to run, or to be shut down if running. This startup method is slow and does NOT use the parallel processing benefit from multi-core processors.

##### systemd

Major recent distros have moved away from runlevels and use systemd and Upstart. **Upstart** was developed by Ubuntu in 2006, adopted in Fedora 9 in 2008 and RHEL 6. **systemd** was adopted by Fedora in 2011, by RHEL 7 and SUSE, and by Ubuntu 16.04. 

All distros now use systemd. Complicated startup shell scripts are replaced with simpler **configuration** files, which enumerate what has to be done before a service is started, how to execute service startup, and what conditions the service should indicate have been accomplished when startup is finished. `/sbin/init` just points to `/lib/systemd/systemd`.

- Starting, stopping, restarting a service
    - `$ sudo systemctl start|stop|restart nfs.service`
- Enabling or disabling a system service from starting up at system boot
    - `$ sudo systemctl enable|disable nfs.service`
- `.service` can be omitted.

### Linux Filesystem

A **filesystem** is a method of storing/finding files on a hard disk (usually in a partition). A **partition** is a physically contiguous section of a disk. Partition is like a container in which a filesystem resides.

By dividing the hard disk into partitions, data can be **grouped and separated** as needed. When a failure or mistake occurs, only the data in the affected partition will be damaged, while the data on the other partitions will likely survive.

Different types of filesystems supported by Linux:

- Conventional disk filesystems: ext2, ext3, **ext4**, **XFS**, **Btrfs**, **JFS**, NTFS, etc.
- Flash storage filesystems: ubifs, JFFS2, YAFFS, etc.
- Database filesystems
- Special purpose filesystems: procfs, sysfs, tmpfs, squashfs, debugfs, etc.
- other filesystems: ntfs, FAT, vfat, hfs, hfs+

It is often the case that more than one filesystem type is used on a machine, based on considerations such as the size of files, how often they are modified, what kind of hardware they sit on and what kind of access speed is needed, etc.

Linux filesystem use a standard layout, **Filesystem Hierarchy Standard** (FHS), which uses `/` to separate paths and does not have drive letters. File names are case-sensitive.

Multiple drives and/or partitions are **mounted as directories** in the single filesystem, called **mount points**. Mount points are usually empty. The `mount` command is used to attach a filesystem somewhere within the filesystem tree, i.e. `sudo mount /dev/sda5 /home`. `umount` does the opposite.

`fstab` at `/etc/fstab` can be used to configure auto mount disks at system start up. `df -Th` can be used to display information about mounted filesystems, type, and usage statistics.

In Linux, all open files are represented internally by what are called **file descriptors**. Simply put, these are represented by numbers starting at zero. stdin is file descriptor 0, stdout is file descriptor 1, and stderr is file descriptor 2. Typically, if other files are opened in addition to these three, which are opened by default, they will start at file descriptor 3 and increase from there.

#### NFS

A network filesystem (**NFS**) may have all its data on one machine or have it spread out on more than one network node. It is used to share data across physical systems which may be either in the same location or anywhere that can be reached by the Internet.

NFS can be started as **daemon** with `sudo systemctl start nfs`. The text file `/etc/exports` configures the directories and permissions that a host is sharing with other systems over NFS. After updating the config file while nfs is running, use `exportfs -av` to notify NFS to re-apply the configuration.

```sh
# example entry in /etc/exports
/projects *.example.com(rw)
# mount /projects using NFS with read and write permissions
# and share within the example.com domain
```

Client machine can mount the remote directory via NFS by

```sh
mkdir -p /mnt/nfs/projects
sudo mount <server_hostname/IP>:/projects /mnt/nfs/projects

# let system boot auto mount the remote directory
# add to /etc/fstab
<server_hostname/IP>:/projects /mnt/nfs/projects nfs defaults 0 0
```

#### Directories under /

| directory | function | examples |
| --------- | -------- | -------- |
|**/bin** (might link to /usr/bin)|essential commands used to boot the system or in single-user mode, and required by all system users|cat, cp, ls, mv, ps, rm|
|**/sbin** (might link to /usr/sbin)|essential binaries related to system administration|fsck, ip|
|**/proc** (a type of pseudo-filesystem)|no permanent presence on the disk, contains virtual files (in memory) for constantly changing runtime system information|system memory, devices mounted, hardware configs|
|**/dev**|contains device nodes, pseudo-file that is used by most hardware and software devices|sda1 (first partition on the first hard disk), lp1 (second printer), random (source of rangom numbers), null (special file to safely dump unwanted data)|
|**/var**|contains files that are expected to change in size and content as the system is running|log (system log files), lib (packages and database files), spool (print queue), tmp (temporary files), ftp (FTP service), www (HTTP web service)|
|/var/cache | program execution generated temp cache file
|/var/lib | data file when program executes
|/var/lock | lock files for programs to prevent simultaneous modification of files
|/var/log | log files, including the login record for who used this system
|/var/mail | personal mail
|/var/run | storing PIDs after process started
|/var/spool | stores some queue data, that is something queued up for process to use in order. Often deleted after use.
|**/etc**|home for system configuration files or scripts, only for the superuser|passwd, shadow, group (for managing user accounts), resolv.conf (DNS settings)|
|**/boot**|essential files needed to boot the system|vmlinuz (compressed Linux kernel), initramfs/initrd (initial RAM filesystem), config (kernel config file), System.map (kernel symbol table), grub.conf (boot loader config)|
|**/lib** and **/lib64** (might link to /usr/lib)|contains kernel modules and common code shared by applications and needed for them to run, mostly known as dynamically loaded libraries (aka Shared Objects)|libncurses.so.5.9|
|/media, /run, /mnt|either one can be used for mounting removable media onto the system|NFS, loopback filesystems, USB drive|
|/opt|optional application software packages||
|/sys|virtual pseudo-filesystem giving information about the system and the hardware||
|/srv|site-specific data served up by the system ||
|**/tmp**|temporary files; on some distributions erased across a reboot and/or may actually be a ramdisk in memory||
|**/usr**|stands for Unix Software Resource, for sharing in the Linux's multi-user setup|applications, utilities and data, mostly static files|
|/usr/bin|This is the primary directory of executable commands on the system|
|/usr/include|Header files used to compile applications|
|/usr/lib|Libraries for programs in /usr/bin and /usr/sbin|
|/usr/lib64|64-bit libraries for 64-bit programs in /usr/bin and /usr/sbin|
|/usr/local|Data and programs specific to the local machine. Subdirectories include bin, sbin, lib, share, include, etc.|
|/usr/sbin|Non-essential system binaries, such as system daemons|
|/usr/share|Shared data used by applications, generally architecture-independent|
|/usr/src|Source code, usually for the Linux kernel|

Some directories to consider for larger space allocation via partitioning:

- /
- /usr
- /home
- /var
- /tmp
- Swap

Use `basename` on a file to get the file's name; use `dirname` on a file to get the full path to this file's belonging directory

#### inode and block


- **superblock**: records this filesystem's information, including number of inode/block, used amount, remaining amount, filesystem format, etc.
- **inode**: records file-specific properties and records the block number of this record
    - each record use one inode
    - each 128 bytes
    - for a large file, its inode records one block number for which that block records twelve additional direct block numbers, one redirect block number, and one triple-redirect block number. P247 Book.
- **block**: records the actual content of the file, may span to multiple blocks for larger files
- knowing an inode can know its block number.
- this way, data saved onto multiple continuous blocks can be read in sequence within a short amount of time, this is called **localization**
- to compensate possible large file system's performance, **block group** is used to divide the storage into block groups, for each having a separate inode/block/superblock system.

**data block** stores file and data. block size: 1K, 2K or 4K

- small block size may cause larger file use more block and inodes
- large block size may create many blocks not fully utilized

**inode/block bitmaps** records and track used and unused blocks and inodes which gives fast lookup and fast search for unused block/inode

i.e. the process of reading a file at `/etc/passwd`:

1. filesystem find `/` inode
2. filesystem locate `/` block and look for `etc` inode
3. find `etc` inode and check whether current user has `rx` access
4. find `etc` block and look for `passwd` inode
5. find `passwd` inode and check whether current user has `r` access
6. read `passwd` block content

**Journaling filesystem**: during sudden power outage during writing to the disk, disk data and real data can be inconsistent.

To deal with this and prevent a whole scan of the filesystem, a journaling filesystem helps by:

- record each write to the filesystem in a log.
- preparation, writing, and completion are supposed to be recorded for each write.
- if anything happens, can quickly check the journal to find which file is wrong.

This is available in ex3 filesystem on Linux. It can help servers recover faster from power outage.

#### Commonly seen devices

Device | name in Linux
------ | -------------
`IDE` | `/dev/hd[a-d]`
`SCSI/SATA/USB` | `/dev/sd[a-p]`
`ROM` | `/dev/fd[0-1]`
`printer` | `/dev/lp[0-2]` or `/dev/usb/lp[0-15]`
`mouse` | `/dev/usb/mouse[0-15]` or `/dev/psaux`
`CDROM/DVDROM` | `/dev/cdrom`
`current mouse` | `/dev/mouse`
`tape` | `/dev/ht0 (IDE)` or `/dev/st0 (SCSI)`

#### Searching commands

`file` command gives information on what kind of file it is

`which` command gives exact path location of the command inspected

`whereis` and `locate` can be used to find files. These two commands use database mapping to lookup and is therefore faster

`find` can search files physically in the harddrive, can be slow and expensive

- `find [PATH] [option] [action]`
- some freq used options
    - `-mtime n`: n is a number, means day. It makes a huge difference between adding `[+]` or `[-]` before the number: + means older than n days, - means within past n days, and neither, means exact n days ago.
    - `-newer`: `find /dir1 -newer /dir1/file` finds files newer than /dir1/file
    - `-atime`, `-ctime` similar as `-mtime`
    - `-perm`: find files with/above/below certain access rights

#### Comparing Files

`diff` is used to compare **files and directories**. `cmp` can be used fro comparing **binary files**. You can compare **three files** at once using `diff3`, which uses one file (second file argument) as the reference basis for the other two.

Some common diff options

| diff Option | Usage |
| ----------- | ----- |
|-c|Provides a listing of differences that include three lines of **context** before and after the lines differing in content|
|-r|Used to recursively compare **subdirectories**, as well as the current directory|
|-i|Ignore the **case** of letters|
|-w|Ignore differences in **spaces and tabs** (white space)|
|-q|Be quiet: only report **if files are different** without listing the differences|

Many modifications to source code and configuration files are distributed utilizing **patches** with the `patch` program. A patch file contains the **deltas** (changes) required to update an older version of a file to the new one. Use `

```sh
diff -Nur originFile newFile > patchFile # create a patch file
patch -p1 < patchFile # apply a patch file to an entire directory tree
patch originFile patchFile # apply patch on one file
```

In Linux, a file's extension does not categorize it, most applications directly examine a file's contents to see what kind of object it is rather than relying on an extension. Use `file` utility to assert the real nature of a file.

#### Backing up Data

While simple `cp` can help back up files or entire directory, `rsync` is more robust to synchronize **directory trees**, using the `-r` option, i.e. `rsync -r sourceDir destinationDir`.

`rsync` checks if the file being copied already exists and skips copy if there is no change in size or modification time, therefore avoids unnecessary operations and saves time. Furthermore, `rsync` only copies the **parts of files** that **actually changed** and is very fast. `rsync` can also copy files from one machine to another in the form of `user@host:filepath`. A good combination of options `rsync --progress -avrxH --delete sourceDir destinationDir`

Note that `rsync` could be destructive if not used properly, as a lot of files could be created at the target and it might use up all the space. Always use the `-dry-run` option to know what will be done before executing it.

The **Disk-to-Disk Copying** program `dd` is very useful for making exact copies of raw disk space. Mostly used to backup a MBR, create a disk image, or install and OS, i.e. `dd if=/dev/sda of=sda.mbr bs=512 count=1`

#### Compressing Data

File data is often compressed to save disk space and reduce the time it takes to transmit files over networks. Some good compression programs:

- **gzip** - the most frequently used Linux compression utility
    - `gzip` to compress and `gunzip` or `gzip -d` to decompress
    - compresses very well and is very fast, produces `.gz` files
- **bzip2** - produces files significantly smaller than those produced by gzip but takes longer
    - `bzip2` to compress and `bunzip2` or `bzip2 -d` to decompress
    - produces `.bz2` files
- **xz** - the most space-efficient compression utility used in Linux
    - `xz` to compress and `xz -d` to decompress
    - used to store archives of Linux kernel
- **zip** - often required to examine and decompress archives from other operating systems
    - `zip` to compress and `unzip` to decompress
- **tar** - group files in an archive and then compress the whole archive at once
    - `tar czf` to compress with `gzip` and gives `xxx.tar.gz`
    - `tar cjf` to compress with `bz2` and gives `xxx.tar.bz2`
    - `tar cJf` to compress with `xz` and gives `xxx.tar.xz`
    - `tar xf` to decompress, no need to pass the option to tell it which format
    - mostly used to archive files to a magnetic tape

Generally, the more **space-efficient** techniques take **longer**. Decompression time does NOT vary as much across different methods.

`du` can be used to check file sizes and **total size** for a directory. Use `du -shc [list of files and dirs]` to get a quick overview of selected files/dirs sizes.

Use utilities such as `zcat, zless, zdiff, zgrep` to work directly with compressed files

### X Window System

The **X Window System** (aka **X**) is loaded as one of the final steps in the boot process. It can also be started from text-mode by the `startx` command, or commands to start the display manager `gdm, lightgdm, kdm, xdm`.

A service called the **Display Manager** keeps track of the displays being provided and loads the X server. The display manager also handles graphical logins and starts the appropriate desktop environment after a user logs in.

A desktop environment consists of a session manager, which starts and maintains the components of the graphical session, the window manager, which controls the placement and movement of windows, window title-bars, and controls, and a set of utilities.

X is old software and has **deficiencies in security**. A newer system, **Wayland**, is superseding it and is used on Fedora, RHEL 8, and other Distros.

For Distros using gnome-based X winodw manager, use `gnome-tweak-tool` to customize and remap keys.

### Package Management Systems

A **Package Management System** distributes packages that each contains the files and other instructions needed to make one software component work well and cooperate with the other components that comprise the entire system. Two broad families of package managers: **Debian** and **RPM**.

A package management system operates on two levels:

- low-level tool, such as `dpkg, rpm`, is responsible for **unpacking** individual packages, running **scripts**, getting the software **installed** correctly
- high-level tool, such as `apt, yum, dnf, zypper`, works with **groups of packages**, **downloads** packages from the vendor, and figures out **dependencies**
    - `apt` stands for Advanced Packaging Tool, used on Debian-based systems
    - `yum` stands for Yellowdog Updater Modified, is an open source tool for RPM-compatible Distros
    - `dnf` aka Dandified YUM, is also RPM-based and used on Fedora and RHEL 8 systems
    - `zypper` is RPM-based and used on openSUSE

| Operation | RPM | debian |
| --------- | --- | ------ |
|Install package|`rpm -i foo.rpm`|`dpkg --install foo.deb`|
|Install package, dependencies|`yum install foo`|`apt-get install foo`|
|Remove package|`rpm -e foo.rpm`|`dpkg --remove foo.deb`|
|Remove package, dependencies|`yum remove foo`|`apt-get autoremove foo`|
|Update package|`rpm -U foo.rpm`|`dpkg --install foo.deb`|
|Update package, dependencies|`yum update foo`|`apt-get install foo`|
|Update entire system|`yum update`|`apt-get update && apt-get upgrade` or `apt-get dist-upgrade`|
|Show all installed packages|`rpm -qa` or `yum list installed`|`dpkg --list`|
|Get information on package|`rpm -qil foo`|`dpkg --listfiles foo`|
|Show packages named foo|`yum list "foo"`|`apt-cache search foo`|
|Show all available packages|`yum list`|`apt-cache dumpavail foo`|
|What package is `<file>` part of?|`rpm -qf <file>`|`dpkg --search <file>`|

Package documentation is directly pulled from the upstream source code and placed under the `/usr/share/doc` directory, grouped in subdirectories named after each package, perhaps including the version number in the name.

### Linux Documentation

#### `info` pages

`info` is the other form of documentation pages besides `man`.

Navigation within `info`:

=== "Navigate within a Node"
    Action | Keys
    ------ | ----
    Next Line|CTRL-n or <Down> arrow key
    Previous Line|CTRL-p or <Up> arrow key
    Beginning of Line|CTRL-a or <Home> key
    End of Line|CTRL-e or <End> key
    Forward 1 Character|CTRL-f or <Right> arrow key
    Backward 1 Character|CTRL-b or <Left> arrow key
    Forward 1 Word|ALT-f or CTRL-<Right> arrow key
    Backward 1 Word|ALT-b or CTRL-<Left> arrow key
    **Beginning of Node**|ALT-<
    **End of Node**|ALT->
    End of Current Node|e Quit q

=== "Selecting Nodes"
    Action | Keys
    ------ | ----
    **Next Node**|n
    **Previous Node**|p
    **Up a Node**|u
    **Last Node Viewed**|l
    Top Node|t
    Directory Node|d
    First Node|<
    Last Node|>
    **Global Next Node**|]
    **Global Previous Node**|[

=== "Searching within a Node"
    Action | Keys
    ------ | ----
    **Search Forward**|s(string) or /(string)
    **Search Backwards**|?(string)
    Search Case-Sensitive|S(string)
    Next word in Search|n
    Next word Case-Sensitive|N
    **Interactively Search Forwards**|CTRL-s(string)
    **Interactively Search Backwards**|CTRL-r(string)
    Index Search|i(string)
    Next Index Search|,
    
#### Ask the `man`

`man` is short for "manual". **man pages** are present on all Linux distributions and offer in-depth documentation about many programs and utilities, as well as other topics, including configuration files, and programming APIs for system calls, library routines, and the kernel.

The man pages are divided into **chapters** numbered **1 through 9**. In some cases, a letter is appended to the chapter number to identify a specific topic.

It is common to have multiple pages across multiple chapters with the **same name**, especially for names of **library functions** or **system calls**. The chapter number can be used to force man to display the page from a **particular chapter**, i.e. `man 2 socket`. Display all pages with `-a` option.

[Linux man pages online](https://man7.org/linux/man-pages/){target=_blank}

The `man` program searches, formats, and displays the information contained in the man page system. To list all pages on the topic, use `-f` option (same result as `whatis`). To list all pages that discuss a specified topic, use the `–k` option (same result as `apropos`).

##### Man page number

Numb | Meaning
---- | -------
1 | shell executables or commands (**important**)
2 | functions for kernels
3 | library or libc functions
4 | device manuals, often under /dev
5 | setting file or format (**important**)
6 | games
7 | protocols
8 | system administrator's commands (**important**)
9 | kernel files

##### navigation (`less`)

Keys | Functions
---- | ---------
`[Space]` | next page
`[PageDown]` | next page
`[PageUp]` | next page
`[Home]` | first page
`[End]` | last page
`/string` | search string after current position
`?string` | search string before current position
`n, N` | when searching, find next matching entry
`q` | quit

##### search man pages

- To search for a specific man page, use `man -f command_name`
- To find any man page related to a term, use `man -k searching_term`, which will return all man-pages contain this phrase

#### Info Page

Info Page is a Linux specific feature that displays help doc like small paragraphs(pages), like a web-page. Use `info command`

There are lots of information about the page displayed, including the progress of viewing the entire doc.

Keys | Functions
---- | ---------
`[Space]` | next page
`[PageDown]` | next page
`[PageUp]` | next page
`[Home]` | first page
`[End]` | last page
`[b]` | move cursor to the first node in current screen
`[e]` | move cursor to the last node in current screen
`[n]` | next node
`[p]` | previous node
`[u]` | upper layer
`[s]` or `[/]` | search in current info page
`[h]` | show help
`[?]` | view commands
`[q]` | exit

Additionally, `/usr/share/doc/` usually contains many documentation docs

#### GNU Info System

This is the **GNU** project's **standard documentation format**, which it prefers as an **alternative** to `man`. The Info System is free-form, and its topics are connected using **links**.

You can view help for a particular **topic** by typing `info <topic name>`, or view a top level index of available topics. The system then searches for the topic in all available info files. The topic which you view in an info page is called a **node**. You can move between nodes or view each node sequentially. Each node may contain menus and linked subtopics, aka **items**. Use `n` to go to next node, `p` for previous node, and `u` for moving one node up in the index.

**Items** function like browser links and are identified by an **asterisk** (*) at the beginning of the item name. **Named items** (outside a menu) are identified with **double-colons** (::) at the end of the item name. Items can refer to other nodes within the file or to other files.

#### --help option

Most commands have an available short description which can be viewed using the `--help` or the `-h` option along with the command or application, which offers a quick reference and it displays information faster than the `man` or `info` pages.

### Process

A **process** is simply an instance of one or more related tasks (**threads**) executing on your computer. A single command may start several processes simultaneously. Some processes are **independent** of each other and others are **related**.

- **program**: usually binary program, stored within physical media like hard-drives
- **process**: when a program is executed, executor's access and program data being loaded into the memory and OS gets assigned a _PID_
- `fork` and `exec`
    - system fork a parent process as temporary process to execute the child program
    - a PID is assigned and PPID is the parent's PID
    - temporary process exec the child program and becomes the child process

Processes use many system resources, such as memory, CPU cycles, and peripheral devices, such as network cards, hard drives, printers and displays. The OS (especially the kernel) is responsible for allocating a proper share of these resources to each process and ensuring overall optimized system utilization.

#### Types

| Process Type | Description | Example |
| ------------ | ----------- | ------- |
|**Interactive Processes**|Need to be **started by a user**, either at a command line or through a graphical interface such as an icon or a menu selection.|bash, firefox, top|
|**Batch Processes**|Automatic processes which are **scheduled from** and then **disconnected from the terminal**. These tasks are **queued** and work on a FIFO (First-In, First-Out) basis.|updatedb, ldconfig|
|**Daemons**|**Server processes** that run continuously. Many are launched during system startup and then wait for a user or system request indicating that their service is required.|httpd, sshd, libvirtd|
|**Threads**|**Lightweight processes**. These are tasks that run under the umbrella of a **main process**, sharing memory and other resources, but are scheduled and run by the system on an individual basis. An individual thread can end without terminating the whole process and a process can create new threads at any time. Many non-trivial programs are multi-threaded.|firefox, gnome-terminal-server|
|**Kernel Threads**|Kernel tasks that users neither start nor terminate and have little control over. These may perform actions like moving a thread from one CPU to another, or making sure input/output operations to disk are completed.|kthreadd, migration, ksoftirqd|

#### Scheduling

The **kernel scheduler** constantly shifts processes **on and off** the CPU, sharing time according to relative **priority**, how much time is needed and how much has already been granted to a task. Some process states:

- **running** state means the process is either currently **executing instructions** on a CPU, or is **waiting** to be granted a share of time. All processes in this state reside on what is called a **run queue**. For machines with multi-core CPUs, there is a run queue on each core.
- **sleep** state means the process is **waiting** for something to happen before it can resume. It is said to be sitting on a wait queue.
- **zombie** state means when a child process is completed but its parent process has not asked about its state, then it still shows up in the system's list of processes but not really alive.

The OS assigns each process an unique process ID (**PID**) to track process state, CPU usage, memory use, precisely where resources are located in memory, and other characteristics. You can terminate a process by issuing `kill -SIGKILL <pid>`, `kill -9 <pid>`, or `kill -SIGTERM`

| ID Type | Description |
| ------- | ----------- |
|Process ID (**PID**)|Unique Process ID number|
|Parent Process ID (**PPID**)|Process (Parent) that started this process. If the parent dies, the PPID will refer to an adoptive parent; on recent kernels, this is kthreadd which has PPID=2.|
|Thread ID (**TID**)|Thread ID number. This is the same as the PID for single-threaded processes. For a multi-threaded process, each thread shares the same PID, but has a unique TID.|

#### Users and Groups

The OS identifies the user who starts a process by the Real User ID (**RUID**) assigned to the user. The user who determines the access rights for the users is identified by the Effective UID (**EUID**). EUID may not be the same as the RUID in some situations.

Users can be categorized into various groups. Each group is identified by the Real Group ID (**RGID**). The access rights of the group are determined by the Effective Group ID (**EGID**).

#### Priority and NICE

The priority (PRI) for a process can be set by specifying a **nice value**, aka **niceness** (NI). **The lower** the nice value, **the higher** the priority. Higher priority processes grep preferential access to the CPU, therefore more CPU time.

In Linux, a nice value of **-20** represents the highest priority and **+19** represents the lowest. This convention was adopted from UNIX.

You can view the nice values using `ps -lf` and use `renice +5/-5 <pid>` to set the nice value. Parent process's nice value change also affects its child process's nice value.

_root_ can change all process `NI`, while a normal user can only adjust **owning process** `NI` within `[0, 19]` and can only adjust `NI` to a **higher value**, with command `nice [-n numb] command` or adjust existing process with `renice [numb] PID`. `NI` adjustments will be passed from parent process to child

The load average is displayed using three numbers (i.e. 0.45, 0.17, and 0.12) with command `w`, interpreted as CPU utilization within last minute, 5 minutes before, and 15 minutes before.

#### background process

You can put a job in the background by suffixing & to the command, i.e. `updatedb &`. Use `CTRL-Z` to suspend a foreground job and `bg` to put it running in the background. Use `fg` to bring a process back to foreground, and `jobs` to see a list of background jobs (`-l` option for showing PIDs).

##### `ps` command

For the BSD variation of `ps` command, use `ps aux` to display all processes of all users, and use `ps axo <attributes>` to specify a list of attributes to view.

For the SystemV variation of `ps` command, options need the dash prefixes and are different.

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

`pstree` displays the processes running on the system in the form of a tree diagram showing the relationship between a process and its parent process and any other processes that it created, and threads displayed within `{}`.

- `pstree [-A|U] [-up]`
- `-A`: use ASCII char to represent tree
- `-U`: use UTF char to represent tree
- `-p`: show process PID
- `-u`: show process user

##### `top` command

`top` gives an over view of system performance live over time.

_The first line_ of the top output displays a quick summary of what is happening in the system:

- How long the **system has been up**
- How many **users** are logged on
- What is the **load average**
    - load average of 1.00 per CPU indicates a **fully subscribed** system
    - if greater than 1, the system is **overloaded** and processes are competing for CPU time
    - if very high, it indicates the system may have a **runaway process** (non-responding state)

_The second line_ displays the total **number of processes**, the number of running, sleeping, stopped, and zombie processes.

_The third line_ indicates how the **CPU time is being divided** by displaying the **percentage of CPU time** used for each:

- **us** - CPU for user initiated processes
- **sy** - CPU for kernel processes
- **ni** - niceness, CPU for  user jobs running at a lower priority
- **id** - idle CPU
- **wa** - waiting, CPU for  jobs waiting for I/O
- **hi** - CPU for harware interrupts
- **si** - CPU for software interrupts
- **st** - steal time, used with virtual machines, which has some of its idle CPU time taken for other users

_The fourth and fifth lines_ indicate **memory** usage, which is divided in two categories and both displays total memory, used memory, and free space:

- Physical memory (RAM) on line 4.
- Swap space on line 5.

Once the physical memory is exhausted, the system starts using swap space (temporary storage space on the hard drive) as an extended memory pool, and since accessing disk is much slower than accessing memory, this will negatively affect system performance.

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

##### `free` command

`free [-b|-k|-m|-g] [-t]` shows memory usage

- `-b|-k|-m|-g`, by default output shows in unit Kbytes, use this to override to bytes, Mbytes, Gbytes
- `-t`, shows physical and swap memory as well

##### `uname` command

`uname [-asrmpi]` checks system and core information

- `-a`: all system related information will be shown
- `-s`: system core name
- `-r`: system core version
- `-m`: system hardware architecture
- `-p`: CPU type
- `-i`: hardware platform

##### `netstat` command

`netstat -[atunlp]` can track network usage on a process level

- `-a`: show current system's all network, listening port, sockets
- `-t`: list tcp packet data
- `-u`: list udp packet data
- `-n`: show service by port number
- `-l`: list services being listened
- `-p`: show services with PID

##### `vmstat`

`vmstat` can track system resource changes

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

##### `fuser` command

`fuser [-umv] [-k [i] [-signal]] file/dir` can find out which process is using which file/directory, from the point of the file/directory

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

##### `lsof` command

`lsof [-aUu] [+d]` lists which process is using which files

- `-a`: show when all criteria satisfied
- `-U`: show only Unix like system's socket files
- `-u username`: list files opened by the user
- `+d directory`: list files opened under a directory

##### `pidof` command

`pidof [-sx] program_name` list the active PIDs of a program

- `-s`: show only one, not all of the PIDs
- `-x`: show also the program's possible parent PID (PPID)

###### Process List

**Process list** shows information about each process. By default, processes are ordered by highest CPU usage, with other information:

- PID - process id
- USER - process owner
- PR - priority
- NI - nice values
- VIRT - virtual memory
- RES - physical memory
- SHR - shared memory
- S - status
- %CPU - percentage of CPU used
- %MEM - percentage of memory used
- TIME+ - execution time
- COMMAND - command started the process

`top` can be used interactively for monitoring and controlling processes

| Command | Output |
| ------- | ------ |
|t|Display or hide summary information (rows 2 and 3)|
|m|Display or hide memory information (rows 4 and 5)|
|A|Sort the process list by top resource consumers|
|r|Renice (change the priority of) a specific processes|
|k|Kill a specific process|
|f|Enter the top configuration screen|
|o|Interactively select a new sort order in the process list|

#### Schedule Processes

##### at and sleep

Use `at` program to execute any non-interactive command at a specified future time for once.

```sh
$ at now + 2 days
at> cat file1.txt
at> <EOT> (CTRL-D)
job 1231 at xxxx-xx-xx xx:xx
```

Use `sleep` to delay execution of a command for a specific period.
```sh
sleep NUMBER[SUFFIX]
# SUFFIX can be s(seconds, default if not provided), m(minutes), h(hours), d(days)
```

##### cron

**cron** is a time-based scheduling utility program. It can launch routine background jobs at specific times and/or days on an **on-going basis**. cron is configured at `/etc/crontab ` (cron table) which contains the various shell commands that need to be run at the properly scheduled times.

cron can be configured with the system-wide or the user-specific crontab. each line of crontab is composed of a CRON expression and a shell command. Use `crontab -e` to edit existing or add new jobs.

```sh
# CRON expression
  MIN HOUR DOM MON DOW CMD
# minute(0-59), hour(0-23), day of month(1-31), month(1-12), day of week(0-6), shell command
```

##### System Services (Daemon)

System service programs are called daemons. usually the service name with a suffix **d**

**Stand-alone Daemons** starts without being managed by other programs. It Stays in the system memory once started, and uses resources. Fast responding to users.

**Super Daemon** is a single daemon to start other daemons upon request from the client. The daemons started will be closed when the client session ends. i.e. `telnet` is a service managed by the super daemon

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

#### Job Control

**foreground jobs** are jobs actively prompting in the terminal and is interactable. **Background jobs**: the jobs running in the background without interaction with the user. Appending `&` to commands will be thrown to the background

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

##### Offline Jobs

Notice the background from job control is not "system background", it is just a way to help you run and manage multiple things in the terminal.

If there is need to run a job even after logged out of the system, then offline jobs may help. While `at` works for this case, `nohup` can also work!

- `nohup <command>` or `nohup <command> &` to run in the background

### Linux Users and Groups

Linux is a multi-user operating system. To identify the current user, use `whoami`. To list the currently logged-on users, use `who` or `users`. `who -a` gives more detailed information.

All Linux **users** are assigned a unique integer **user ID** (uid); normal users start with a uid of **1000** or greater. Use `id` to get information about current user, and `id <username>` can get information from other user.

Linux uses **groups** for organizing users. Groups are collections of accounts with certain shared **permissions**, defined in the `/etc/group` file. Permissions on various files and directories can be modified at the **group level**. Users also have one or more **group IDs** (gid), including a default one which is the same as the user ID.

Groups are used to establish a set of users who have common interests for the purposes of access rights, privileges, and security considerations.

Only the root user can add and remove users and groups. Adding a new user is done with `useradd` and removing is done with `userdel`. i.e. `sudo /usr/sbin/useradd bjmoose` sets the **home directory** to `/home/bjmoose`, populates it with some **basic files** (copied from `/etc/skel`) and adds a line to `/etc/passwd` such as: `bjmoose:x:1002:1002::/home/bjmoose:/bin/bash`.

Removing a user with `userdel` will leave the user home directory, and is good for a temporary inactivation. Use `userdel -r` to remove the home directory too.

Similiarly, add a new group with `groupadd` and remove with `groupdel`. To add a user to a new group, use `usermod`. i.e. `usermod -aG <newgroup> <username>`. To remove a user from a group, you must give the full list of groups except the one want to remove. i.e. `usermod -G <groups>... <username>`.

To temporarily become the superuser for a series of commands, you can use `su` and then be prompted for the root password. To execute just one command with root privilege use `sudo <command>`.

**sudo** access priviledge is granted per user and its configuration files are stored in the `/etc/sudoers` file and in the `/etc/sudoers.d/` directory. By default, the sudoers.d directory is empty.

#### File Ownership, Permission

In Linux, every file is associated with a user who is the **owner** and a group for whom has the right to acess it in certain ways: `read(r), write(w), execute(x)`.

For a file, `execute(x)` means whether it can be executed; for a directory it means whether a user can `cd` into this directory as working directory. Whether a user can delete a file depends on its access right on the current directory. Must be `write(w)`

File permission

```
[-][rwx][r-x][r--]
 0  123  456  789
0 - file type
123 - owner access right
456 - group access right
789 - global access right
```

file types:

- `-` regular file
- `d` directory
- `l` link
- `b` block device file, like a hard-drive; or `c` character device file, like a mouse or keyboard
- `s` socket, for network data
- `p` pipe, FIFO, allow many process read the same file

`chown` is used to change user ownership (and group) of a file or directory, `chgrp` for changing group ownership. `chmod` is for changing the permissions on the file at `user(u) group(g) others(o)` levels.

A single digit is sufficient to specify all three types permission bits for each entity: `read(4), write(2), execute(1)` which is the sum of those digits.

##### umask

`umask` can be used to disable certain rights for newly created files or directories. i.e.  `unmask 023` means new files created will NOT have `w` for groups and not have `wx` for world

##### Hidden attributes

Hidden attributes on a file are useful for security reasons.

- `lsattr` allows you to view the hidden attributes of a file
- `chattr` allows you to change the hidden attributes of a file
    - `-i` means let a file be unchangable
    - `-a` allows adding but not changing/deleting old portion of the file

#### Clean shutdown

- use `who` to see who is using current system.
- use `netstat -a` to see Internet connections status
- use `ps -aux` to see running process in the background

`sync` command will sync data into hard drives. It is best to remember to run this command before reboot or shutdown the system.

`shutdown` or `halt` can done many things such as shutdown, reboot, or enter single-user mode

- set shutdown time, now or in the future
- set shutdown message to online users
- send warning info broadcast. Useful when need to notify others for important messages
- whether use fsck to check file system
- `shutdown [-t seconds] [-arkhncfF] [time] [warning_info]`
- usage below:

Option | Setting
------ | -------
`-t sec` | shutdown in some seconds
`-k` | send warning message without shutting down
`-r` | reboot after system services terminate
`-h` | shutdown after system services terminate
`-n` | shutdown without the init process
`-f` | reboot skipping fsck check
`-F` | reboot force fsck check
`-c` | cancel current shutdown directive

### Linux shell

#### Startup file

The command shell program uses one or more startup files to configure the **user environment**. Files in the `/etc` directory define **global settings** for **all users**, while initialization files in the user's **home directory** can include and/or override the global settings. Things can be configured:

- Customizing the **prompt**
- Defining command line **aliases**
- Setting the **default text editor**
- Setting the **path** for where to find executable programs

Order of startup files evaluation (for user first logs onto the system): `/etc/profile`, then `~/.bash_profile` or `~/.bash_login` or `~/.profile`.

Every time you create a new shell, or terminal window, etc., you do NOT perform a **full system login**; only a file named `~/.bashrc` file is read and evaluated.

`PATH` is a variable of an ordered list of directories (the path) which is scanned when a command is given to find the appropriate program or script to run.

Use `alias` with no arguments will **list** currently defined **aliases**. `unalias` will remove an alias. Alias definition needs to be placed within either single or double quotes if it contains any spaces. i.e. `alias ls='ls --color -l'`

**Prompt Statement** (the `PS1` variable) is used to **customize your prompt string** in your terminal windows to display the information you want.

#### Environment Variables

**Environment variables** are quantities that have specific values which may be utilized by the command shell or other utilities and applications. Some are set by the system and others are set by the user, either at the command line or within startup and other scripts.

An environment variable is actually just a **character string** that contains information used by one or more applications. Use `set, env, export` to view the values of currently set environment variables.

Variables created within a script are only available to the **current shell**; child processes (sub-shells) will NOT have access to values that have been set or modified. Allowing child processes to see the values requires use of the `export` command. You can also set environment variables to be fed as a **one shot to a command** as in: `$ SDIRS=s_0* KROOT=/lib/modules/$(uname -r)/build make modules_install`.

#### Command History

**bash** keeps track of previously entered commands and statements in a **history buffer**, stored in `~/.bash_history` (each session saves the history in the very end). Recall previous commands using the `arrow keys`, search with `CTRL-r`, or use `history` to view all and use `!<number>` to re-execute a past command.

#### Shell shortcuts

| Keyboard Shortcut | Task |
| ----------------- | ---- |
|CTRL-L|Clears the screen|
|CTRL-D|Exits the current shell|
|CTRL-Z|Puts the current process into suspended background|
|CTRL-C|Kills the current process|
|CTRL-H|Works the same as backspace|
|CTRL-A|Goes to the beginning of the line|
|CTRL-W|Deletes the word before the cursor|
|CTRL-U|Deletes from beginning of line to cursor position|
|CTRL-K|Deletes from cursor position to end of line|
|CTRL-E|Goes to the end of the line|
|Tab|Auto-completes files, directories, and binaries|

#### Text Manipulation

`sed` is abbreviation for **stream editor** and is a powerful text processing tool and is one of the oldest, earliest and most popular UNIX utilities. It is used to modify the contents of a file or input stream, usually placing the contents into a new file or output stream.

sed can **filter text**, as well as perform **substitutions** in data streams.

- `sed -e command <filename>` - Specify editing commands at the command line, operate on file and put the output on standard out
    - specify multiple `-e command`s to use perform multiple operations
- `sed -f scriptfile <filename>` - Specify a scriptfile containing sed commands, operate on file and put output on standard out

Basic sed substitutions:

| Command | Usage |
| ------- | ----- |
|sed s/pattern/replace_string/ file|Substitute first string occurrence in every line|
|sed s/pattern/replace_string/g file|Substitute all string occurrences in every line|
|sed 1,3s/pattern/replace_string/g file|Substitute all string occurrences in a range of lines|
|sed -i s/pattern/replace_string/g file|Save changes for string substitution in the same file|

`awk` is used to **extract** and then print **specific contents** of a file and is often used to construct reports. It got its name from the authors, Alfred Aho, Peter Weinberger, and Brian Kernighan.

- `awk 'command' <filename>` - Specify a command directly at the command line
- `awk -f scriptfile <filename>` - Specify a file that contains the script to be executed

Basic awk usage:

| Command | Usage |
| ------- | ----- |
|`awk '{ print $0 }' /etc/passwd`|Print entire file|
|`awk -F: '{ print $1 }' /etc/passwd`|Print first field (column) of every line, separated by a space|
|`awk -F: '{ print $1 $7 }' /etc/passwd`|Print first and seventh field of every line|

#### File Manipulation

`sort` is used to **rearrange the lines of a text file**, in either ascending or descending order according to a sort key, or sort with respect to particular fields (**columns**) in a file

| Syntax | Usage |
| ------ | ----- |
|`sort <filename>`|Sort the lines in the specified file, according to the characters at the beginning of each line|
|`cat file1 file2 | sort`|Combine the two files, then sort the lines and display the output on the terminal|
|`sort -r <filename>`|Sort the lines in reverse order|
|`sort -k 3 <filename>`|Sort the lines by the 3rd field on each line instead of the beginning|
|`sort -r <filename>`|Sort the lines then keep only unique lines, same as running `uniq`|

`uniq` removes **duplicate consecutive** lines in a text file and is useful for simplifying the text display. It requires duplicate entries be consecutive to be removed. Use `uniq -c` to only count the number of duplicate lines.

`paste` can be used to **combine file contents** with respect to **columns**. `paste -s` causes it to combine data like you do `cat file1 file2 > file3`

`join` can be used when two files have **shared column** values that one can **combine data** based on that column, like you do in SQL statement.

`split` is used to break up a file into **equal-sized segments** of new files for easier viewing and manipulation, by default 1000 lines per file segment. An optional prefix of the new files can be specified with `split <file> <prefix>`

`grep` is extensively used as a primary **text searching** tool. It scans files for specified patterns and can be used with regular expressions.

| Command | Usage |
| ------- | ----- |
|`grep [pattern] <filename>`|Search for a pattern in a file and print all matching lines|
|`grep -v [pattern] <filename>`|Print all lines that do not match the pattern|
|`grep -C 3 [pattern] <filename>`|Print context of lines (specified number of lines above and below the pattern) for matching the pattern|
|`strings book1.xls | grep my_string`|Take text input from pipe|

`strings` extracts **printable character strings** from binary files.

`tr` is used to **translate** specified **characters** into other characters or to **delete** or **keep** some of them

| Command | Usage |
| ------- | ----- |
|`tr a-z A-Z`|Convert lower case to upper case|
|`tr '{}' '()' < inputfile > outputfile`|Translate braces into parenthesis|
|`echo "This is for testing" | tr [:space:] '\t'`|Translate white-space to tabs|
|`echo "This   is   for    testing" | tr -s [:space:]`|Squeeze repetition of characters using -s|
|`echo "the geek stuff" | tr -d 't'`|Delete specified characters using -d option|
|`echo "my username is 432234" | tr -cd [:digit:]`|Complement the sets using -c option. Combined with -d, means only keep the characters in the set|
|`tr -cd [:print:] < file.txt`|Remove all non-printable character from a file|
|`tr -s '\n' ' ' < file.txt`|Join all the lines in a file into a single line|

`tee` takes the output from any command, and, while sending it to **standard output**, it also saves to a **file**

`wc` counts the number of lines (`-l` option), words (`-w` option), and characters (`-c` option) in a file or list of files.

`cut` is used for manipulating **column-based** files and is designed to **extract specific columns** using option `-f <number>`. Default separator is tab; use `cut -d ';'` to override that.

### Linux Networking

Exchanging information across the network requires using **streams** of small **packets**, each of which contains a piece of the information going from one machine to another. These packets contain **data buffers**, together with **headers** which contain information about where the packet is going to and coming from, and where it fits in the sequence of packets that constitute the stream.

A network requires the connection of many nodes. Data moves from source to destination by passing through a series of **routers** and potentially across multiple networks.

#### IP Address

Devices attached to a network must have at least one unique network address identifier known as the **IP (Internet Protocol) address**. The address is essential for **routing packets** of information through the network.

**IPv4** uses 32-bits for address and is older and by far the more widely used, while **IPv6** uses 128-bits for addresses and is newer and designed to get past **address pool limitations** inherent in the older standard and furnish many more possible addresses.

**NAT** (Network Address Translation) enables sharing one IP address among many **locally** connected computers, each of which has a unique address only seen on the local network.

A 32-bit IPv4 address is divided into four **8-bit** sections called **octets**, or **bytes**.

Network addresses are divided into **five classes**: A, B, C, D and E. Classes `A, B, C` are classified into two parts: **Network addresses** (Net ID, for identify the network) and **Host address** (Host ID, for identify a host in the network). Class `D` is used for special **multicast** applications (information is broadcast to multiple computers simultaneously) and Class `E` is **reserved** for future use.

##### Class A Address

Class A addresses use the **first octet** as Net ID and use the other three as the Host ID.

The **first bit** of the **first octet** is always set to **zero**, so you can use only 7-bits for unique network numbers, leaving a maximum of **126** Class A networks available (the addresses 0000000 and 1111111 are reserved).

Each Class A network can have up to **16.7 million** unique hosts on its network. The range of host address is from `1.0.0.0` to `127.255.255.255`.

##### Class B Address

Class B addresses use the **first two octets** of the IP address as their Net ID and the last two octets as the Host ID.

The **first two bits** of the **first octet** are always set to **binary 10**, so there are a maximum of **16384** (14-bits) Class B networks. The first octet of a Class B address has values from `128` to `191`.

Each Class B network can support a maximum of **65,536** unique hosts on its network. The range of host address is from `128.0.0.0` to `191.255.255.255`.

##### Class C Address

Class C addresses use the **first three octets** of the IP address as their Net ID and the last octet as their Host ID.

The **first three bits** of the **first octet** are set to **binary 110**, so almost **2.1 million** (21-bits) Class C networks are available. The first octet of a Class C address has values from `192` to `223`. These are most common for smaller networks which don't have many unique hosts.

Each Class C network can support up to **256** (8-bits) unique hosts. The range of host address is from `192.0.0.0` to `223.255.255.255`.

#### IP Address Allocation

Typically, a **range** of IP addresses are requested from your **Internet Service Provider** (ISP) by your organization's network administrator. The class of IP address gieven depends on the size of your network and growth needs. If NAT is in operation, you only get one externally visible address.

You can assign IP addresses to computers over a network either manually (**static** address) or dynamically (can change when machine reboots) using **Dynamic Host Configuration Protocol** (DHCP).

#### Name Resolution

Name Resolution is used to **convert** numerical IP address values into a human-readable format known as the **hostname**.

The special hostname localhost is associated with the IP address 127.0.0.1, and describes the machine you are currently on.

#### Network Configuration

Network configuration files are located in the /etc directory tree. Debian family distros store them under `/etc/network`, while Fedora and SUSE store under `/etc/sysconfig/network`.

**Network interfaces** are a connection channel between a **device** and a **network**. Physically, network interfaces can proceed through a **network interface card** (NIC), or can be more abstractly implemented as **software**, and each can be activated or deactivated any time. Use `ip` or `ifconfig` utilities to view network interface information.

#### Network utils

`ping` is used to check whether or not a machine attached to the network can **receive** and **send data**; i.e. it confirms that the remote host is online and is responding.

One can use the `route` utility or the `ip route` command to view or change the IP routing table to add, delete, or modify specific (static) routes to specific hosts or networks.

`traceroute` is used to **inspect the route** which the data packet takes to reach the destination host, which makes it quite useful for troubleshooting **network delays and errors**. By using traceroute, you can isolate connectivity issues between hops, which helps resolve them faster.

Some other networking tools:

| Networking Tools | Description |
| ---------------- | ----------- |
|ethtool|Queries network interfaces and can also set various parameters such as the speed|
|netstat|Displays all active connections and routing tables. Useful for monitoring performance and troubleshooting|
|nmap|Scans open ports on a network. Important for security analysis|
|tcpdump|Dumps network traffic for analysis|
|iptraf|Monitors network traffic in text mode|
|mtr|Combines functionality of ping and traceroute and gives a continuously updated display|
|dig|Tests DNS workings. A good replacement for host and nslookup|

`wget` is a command line utility for handling large file downloads, recursive downloads, password-protected downloads, or multi-file downloads.

`curl` can be used from the command line or a script to read information about a http call, or save the contents to a file.

**File Transfer Protocol** (FTP) is a well-known and popular method for transferring files between computers using the Internet, built on a **client-server model**. All web browsers support FTP. Some cli FTP clients are `ftp, sftp, ncftp, yafc`.

**Secure Shell** (SSH) is a **cryptographic network protocol** used for secure data communication (using `ssh`) and remote services and other secure services between two devices on the network.

Move files securely using Secure Copy (`scp`) between two networked hosts. scp uses the SSH protocol for transferring data.

### Linux Security

#### User Accounts

The Linux kernel allows properly **authenticated users** to access files and applications. Each user is identified by a unique integer (**UID**) and a separate database associates a username with each UID. Related tools are `useradd userdel` for creating and removing accounts.

Upon account creation, new user information is added to the user database and the user's home directory must be created and populated with some essential files. For each user, the following seven fields are maintained in the /etc/passwd file:

| Field Name | Details | Remarks |
| ---------- | ------- | ------- |
|Username|User login name|Should be between 1 and 32 characters long|
|Password|User password (or the character `x` if the password is stored in the `/etc/shadow` file) in **encrypted** format|Is never shown in Linux when it is being typed; this stops prying eyes|
|User ID (UID)|Every user must have a user id (UID)|UID 0 is reserved for **root** user; UID's ranging from 1-99 are reserved for other **predefined** accounts; UID's ranging from 100-999 are reserved for **system accounts** and groups; **Normal users** have UID's of 1000 or greater|
|Group ID (GID)|The primary Group ID (GID); Group Identification Number stored in the `/etc/group` file|Is covered in detail in the chapter on Processes|
|User Info|This field is optional and allows insertion of extra information about the user such as their name|For example: `Rufus T. Firefly`|
|Home Directory|The absolute path location of user's home directory|For example: `/home/rtfirefly`|
|Shell|The absolute location of a user's default shell|For example: `/bin/ba`|

For a safe working environment, it is advised to grant the **minimum privileges** possible and necessary to accounts, and remove inactive accounts. The `last` utility can be used to identify potential inactive users.

**root** is the most privileged account on a Linux/UNIX system. This account has the ability to carry out ALL facets of system administration, and utmost care must be taken when using this account. root privilege is required for performing administration tasks such as restarting most services, manually installing packages and managing parts of the filesystem that are outside the normal user’s directories.

##### SUID, SGID, SBIT

**SUID** (**Set owner User ID upon execution** - similar to the Windows "run as" feature) is a special kind of file permission given to a file.

Use of SUID provides **temporary permissions** to a user to run a program with the permissions of the **file owner** (which may be root) instead of the permissions held by the user.

i.e., I have `x` access to `/usr/bin/passwd` and `passwd` is owned by _root_. When I execute `passwd` I temporarily get root access so I can change `/etc/shadow`

SUID can only be used on binary program, NOT on shell script, and NOT on directories.

SGID can be used on binary program and directories, NOT on shell script.

SBIT, Sticky Bit, only used on directories. When a user has `wx` access on a directory and creates a file under it, only this user or root can delete that file.

How to set these bits: `SUID: 4, SGID: 2, SBIT: 1`, i.e. `chmod 4755 file_name`

##### sudo

In Linux you can use either `su` (requires root password, can be root for as long as needed, limited logging trails) or `sudo` (requires the user's password, temporary access, more logging trails) to **temporarily** grant root access to a normal user.

sudo has the ability to keep track of **unsuccessful attempts** at gaining root access (usually logged in `/var/log/secure`). Users' authorization for using sudo is based on configuration information stored in the `/etc/sudoers` file and in the `/etc/sudoers.d` directory, which should be edited with command `visudo` for proper validations.

sudo commands and any failures are logged in `/var/log/auth.log` under the **Debian** distribution family, and in `/var/log/messages` and/or `/var/log/secure` on other systems. A typical entry of the message for sudo contains: caller's username, terminal info, working dir, user account invoked, command & args.

sudo inherits the PATH of the user, not the full root user. So the directories ``/sbin` and `/usr/sbin` are not searched when a user executes a command with sudo. It is best to add these two dirs to the user's `.bashrc`.

##### passwords

On modern systems, passwords are actually stored in an **encrypted** format in a secondary file named `/etc/shadow`. Only those with **root** access can **read or modify** this file.

Most Linux distributions rely on a modern password encryption algorithm called **SHA-512 (Secure Hashing Algorithm 512 bits)**, developed by the U.S. National Security Agency (NSA) to encrypt passwords. SHA-512 is widely used by security applications and protocols such as `TLS, SSL, PHP, SSH, S/MIME and IPSec` and is one of the most tested hashing algorithms. Its CLI tool is `sha512sum`.

`chage` can be used to configure the password expiry for users. **Pluggable Authentication Modules (PAM)** can be configured to automatically verify that a password created or modified using the `passwd` utility is sufficiently **strong**.

You can secure the **boot process** with a secure password to prevent someone from bypassing the user authentication step (such as editing the bootloader configuration during boot). This can work in conjunction with password protection for the **BIOS** (such as botting from an alternative boot media and mount the harddrives and view the contents).

You should NEVER edit `/boot/grub/grub.cfg` **directly**; instead, you can modify the configuration files in `/etc/grub.d` and `/etc/defaults/grub`, and then run `update-grub`, or `grub2-mkconfig` and save the new configuration file.

##### Physical Hardware Vulnerability

Physical access to a system makes it possible for attackers to easily leverage several attack vectors, in a way that makes all operating system level recommendations irrelevant. Some possible attacks:

- Key logging
    - Recording the real time activity of a computer user including the keys they press. The captured data can either be stored locally or transmitted to remote machines.
- Network sniffing
    - Capturing and viewing the network packet level data on your network.
- Booting with a live or rescue disk
- Remounting and modifying disk content.

The guidelines of enhancing security are:

- Lock down workstations and servers.
- Protect your network links such that it cannot be accessed by people you do not trust.
- Protect your keyboards where passwords are entered to ensure the keyboards cannot be tampered with.
- Ensure a password protects the BIOS in such a way that the system cannot be booted with a live or rescue DVD or USB key.

#### Process Isolation

Linux is considered to be more secure than many other operating systems because **processes** are naturally **isolated** from each other. One process normally cannot access the resources of another process, even when that process is running with the same user privileges.

More recent additional security mechanisms that limit risks even further include:

- **Control Groups (cgroups)** - Allows system administrators to **group processes** and associate finite resources to each cgroup.
- **Containers** - Makes it possible to run multiple **isolated Linux systems** (containers) on a single system by relying on **cgroups**.
- **Virtualization** - Hardware is **emulated** in such a way that not only processes can be isolated, but **entire systems** are run simultaneously as isolated and insulated guests (**virtual machines**) on one physical host.

#### Hardware Device Access

Linux limits user access to **non-networking hardware devices** in a manner that is extremely similar to regular **file access**.

Applications interact with devices by engaging the **filesystem** layer, which opens a **device special file** (aka device node) under `/dev` that corresponds to the device being accessed. Each device special file has standard **owner, group and world permission** fields. Security is naturally enforced just as it is when standard files are accessed.

### Linux System Troubleshoot

#### Syslog files

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
- `logrotate`: for switching and getting rid of old large log files

### Other Misc. Linux Utilities

#### Printing

Printing itself requires software that converts information from the application you are using to a language your printer can understand. The Linux standard for printing software is the **Common UNIX Printing System (CUPS)**.

CUPS uses a modular printing system which accommodates a wide variety of printers and also processes various data formats. It acts as a print server for both local and network printers. CUPS can be managed with the `systemctl` utility. The CUPS web interface is available on your browser at: http://localhost:631.

##### How CUPS works

The print **scheduler** reads server settings from several **configuration files**, commonly `/etc/cups/cupsd.conf` (system-wide settings, mostly related to network security, allow-listed devices), and `/etc/cups/printers.conf` (printer-specific settings).

CUPS stores print **requests** as files under the `/var/spool/cups` directory and accessible before a doc is sent to a printer. Data files are prefixed with the letter d while control files are prefixed with the letter c. Data files are removed after a printer handles a job successfully.

**Log** files are placed in `/var/log/cups` and are used by the scheduler to record activities that have taken place.

CUPS uses **filters** to convert job file formats to **printable formats**. **Printer drivers** contain descriptions for currently connected and configured printers, and are usually stored under `/etc/cups/ppd/`. The print data is then sent to the printer through a filter, and via a **backend** that helps to locate devices connected to the system.

##### Print from CLI

CUPS provides two command-line interfaces `lp` (System V, actually a front-end to `lpr`) or `lpr` (BSD), useful in cases where printing operations must be **automated**. Some `lp` commands

| Command | Usage |
| ------- | ----- |
|`lp <filename>`|To print the file to default printer|
|`lp -d printer <filename>`|To print to a specific printer (useful if multiple printers are available)|
|`program | lp` or `echo string | lp`|To print the output of a program|
|`lp -n number <filename>`|To print multiple copies|
|`lpoptions -d printer`|To set the default printer|
|`lpq -a`|To show the queue status|
|`lpadmin`|To configure printer queues|
|`lpstat -p -d`|To get a list of available printers, along with their status|
|`lpstat -a`|To check the status of all connected printers, including job numbers
|`cancel job-id` OR `lprm job-id`|To cancel a print job|
|`lpmove job-id newprinter`|To move a print job to new printer|

##### Print formats

**PostScript** is a standard **page description language**. It effectively manages scaling of fonts and vector graphics to provide quality printouts. It is purely a text format that contains the data fed to a PostScript interpreter. The format itself is a language that was developed by Adobe in the early 1980s to enable the transfer of data to printers. `enscript` is a tool that is used to convert a text file to PostScript and other formats.

Postscript has been for the most part superseded by the **PDF** format (Portable Document Format). It can be converted from one to another format with tools like `pdf2ps pdftops convert`. Some other operations such as:

- Merging/splitting/rotating PDF documents
- Repairing corrupted PDF pages
- Pulling single pages from a file
- Encrypting and decrypting PDF files
- Adding, updating, and exporting a PDF’s metadata
- Exporting bookmarks to a text file
- Filling out PDF forms

can be done with tools like `qpdf pdftk gs(ghostscript)`. Some additional tools `pdfinfo flpsed pdfmod` provides basic information-fetching/editing capabilities.

## Tricks

**Calculator in Terminal** `bc` can be a quick and light-weight calculator

- set `scale = 4` to make division precision (number of digits after decimal point)
- `quit` to leave

**check filesystem space**

- `df` gives the overall filesystem usage
- `du` evaluates filesystem usage of certain directory

**create partitions**

- `fdisk` - use `fdisk [-l] device_name` shows the device's partitions. without `-l` will be interactive mode. (P264 for more info)
- `df` - use `df pathname` to find the name and usage of the hosting device
- It is best to do partition in single-user mode

**disk check**

- `fsck` is a serious command to use when filesystem has problems
    - actually calling `e2fsck`
    - must be used when the partition inspected was unmounted
- `badblocks` can check whether the drive has broken sectors
    - `badblocks -[svw] device_name`

**End of File**

- `[Ctrl]+[d]` means End of File, End of Input. Can be used in the place of entering `exit` command

**Format a partition**

- `mkfs` - to format and make a filesystem
    - use `mkfs [-t filesystem_format] device_name`
    - do `mkfs[tab][tab]` will give you a list of supported filesystem format
- `mke2fs` - a very detailed and sophisticated command
    - can set filesystem label, block size, inode per N bytes, journal system configuration
    - i.e. `mke2fs -j -L "vbird_logical" -b 2048 -i 8192 /dev/hdc6`

**Linux X Window and Terminal Switching**

- `[Ctrl]+[Alt]+[F1]~[F6]` are pre-loaded _tty1 ~ tty6_ Terminal workspaces
- `[Ctrl]+[Alt]+[F7]` switch back to X Window interface
- if started without X Window, can start it using command `startx`

To change run levels, change `/etc/inittab`

**mount/unmount a partition**

- Things to ensure before mounting
    - single filesystem should not be mounted to different mounting points
    - single directory should not be mounting multiple filesystems
    - directories mouting filesystems should be originally empty
- `mount`
    - `mount -l` shows mounted info
    - `mount -a` mounts all unmounted filesystems
    - `mount [-t filesystem] [-L Label_name] [-o otheroptions] device_name mounting_point` typical use of command
    - `mount -o remount,rw,auto /` when root became read-only, use this to remount and make it writable again (saves a reboot)
- `unmount`
    - `unmount [-fn] device_name[or]mounting_point`

**Mount at boot time**

- Some limitations:
    - root '/' must be the first to mount
    - other mount point must be existing directory
    - all mount points can be used only once
    - all partition can be mounted only once
- `/etc/fstab` file
    - contents listed in order:
    - Device_label Mount_point filesystem parameters dump fsck
    - device_label can be checked using `dumpe2fs`

**Softlink vs. hardlink**

- use `ln` to make hard links
- use `ln -s` to make hard links
- hardlink to a file shares the original's inode
    - hardlink has the same access rights of the original
    - original inode exists as long as there is pointer to this inode
    - content not lost if original file is deleted
- softlink is just a pointer to another file.
    - can span to different filesystem
    - can work on directory
    - if original file deleted, content is lost and softlink become invalid

**troubleshoot file system errors**

Possible causes:

- abnormal shutdown, like sudden cut off of power
- frequent Harddisk access, over-heat, high-humidity

If the error happens in partition of `/dev/sda7`, then at boot time press ctrl-D to enter root password
- then enter `fsck /dev/sda7` to check for disk errors. If none found, enter Y to clear and reboot

If root is broken, unplug the harddisk and connect to another working Linux machine

- do not mount that drive
- login as root, execute `fsck /dev/sdb1` assume `sdb1` is the broken disk
- the same thing can be done using a Linux bootable USB to rescue the disk

**use Single User Mode to reset forgotten root password**

- reboot, when it is counting seconds, press any key to enter grub editor
- press `[e]` to enter grub editing mode
- move cursor to line starting with 'kernel', add 'single' at the end of line
- press `[enter]` to save
- press `[b]` to enter single user maintenance mode
- enter `passwd` and enter new root password twice
