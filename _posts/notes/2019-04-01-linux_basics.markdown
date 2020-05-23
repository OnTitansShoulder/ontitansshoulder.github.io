---
layout: note_page
title: Linux Basics Must-know
title_short: linux_basics
dateStr: 2019-04-01
category: Linux
tags: notes reference check
---
Big thanks to vbird from linux.vbird.org for this great educational resource. Here are my reading notes taken.

### System Boot and devices

**Some frequently seen device and names**

Device - | - name in Linux
-------- | ---------------
`IDE` | `/dev/hd[a-d]`
`SCSI/SATA/USB` | `/dev/sd[a-p]`
`ROM` | `/dev/fd[0-1]`
`printer` | `/dev/lp[0-2]` or `/dev/usb/lp[0-15]`
`mouse` | `/dev/usb/mouse[0-15]` or `/dev/psaux`
`CDROM/DVDROM` | `/dev/cdrom`
`current mouse` | `/dev/mouse`
`tape` | `/dev/ht0 (IDE)` or `/dev/st0 (SCSI)`

<br/>
**Harddisk**
First sector is the most important
- Master Boot Record (MBR), 446 bytes
- partition table, 64 bytes
- [more: Book P.84]

Each additional sector has its own *boot sector*

**System Startup** (by order):
1. BIOS
2. MBR
3. boot loader
- choose which system to boot
- load kernel
- load other loader
4. kernel booted

Therefore, it is best to install Windows then Linux when dual-booting, since Windows will always take over the MBR, but Linux boot loader can be in MBR or other boot sector.

<br/>
### File System

*Directory Tree* everything is from the root `/`

`mount` use a directory as mounting point for devices

**The Science in Partition**

Analyze the computer's expected tasks and purpose, then partition the disk for different Linux directories.

Some directories to consider for large space allocation:
- /
- /usr
- /home
- /var
- /tmp
- Swap

`Swap` is for swapping infrequently used things from Physical memory to Harddrive, to free some memory space for other applications.

**Linux X Window and Terminal Switching**
- `[Ctrl]+[Alt]+[F1]~[F6]` are pre-loaded _tty1 ~ tty6_ Terminal workspaces
- `[Ctrl]+[Alt]+[F7]` switch back to X Window interface
- if started without X Window, can start it using command `startx`

To change run levels, change `/etc/inittab`

**Calculator in Terminal** `bc` can be a quick and light-weight calculator
- set `scale = 4` to make division precision (number of digits after decimal point)
- `quit` to leave

**End of File**
- `[Ctrl]+[d]` means End of File, End of Input. Can be used in the place of entering `exit` command

**Typical Man page Number and Meaning**

Numb - | - Meaning
------ | ---------
1 | shell executables or commands (**important**)
2 | functions for kernels
3 | library or libc functions
4 | device manuals, often under /dev
5 | setting file or format (**important**)
6 | games
7 | protocols
8 | system administrator's commands (**important**)
9 | kernel files

<br/>
**Shortcuts for Man Page (Less) navigation**

Keys - | - Functions
------ | -----------
`[Space]` | next page
`[PageDown]` | next page
`[PageUp]` | next page
`[Home]` | first page
`[End]` | last page
`/string` | search string after current position
`?string` | search string before current position
`n, N` | when searching, find next matching entry
`q` | quit

<br/>
**Search for Man Pages for a Command**
- To search for a specific man page, use `man -f command_name`
- To find any man page related to a term, use `man -k searching_term`, which will return all man-pages contain this phrase

**Info Page** is a Linux specific feature that displays help doc like small paragraphs(pages), like a web-page. Use `info command`

There are lots of information about the page displayed, including the progress of viewing the entire doc.

Keys - | - Functions
------ | -----------
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

<br/>
`/usr/share/doc/` contains many documentation docs

**Nano editor** like _vim_, _nano_ is a very common and popular text editor for Linux.

Keys - | - Functions
------ | -----------
`ctrl-G` | get help
`ctrl-X` | leave nano
`ctrl-O` | save document
`ctrl-R` | read from another file
`ctrl-W` | search for text string
`ctrl-C` | learn the line number and column number at current cursor
`ctrl-_` | input line number and move to it
`alt-Y` | syntax highlighting on/off
`alt-M` | support using mouse to move the cursor

<br/>
#### Correct way to shutdown Linux
- use `who` to see who is using current system.
- use `netstat -a` to see Internet connections status
- use `ps -aux` to see running process in the background

**Sync** command will sync data into hard drives
- It is best to remember to run this command before reboot or shutdown the system.

**Shutdown** can done many things such as shutdown, reboot, or enter single-user mode
- set shutdown time, now or in the future
- set shutdown message to online users
- send warning info broadcast. Useful when need to notify others for important messages
- whether use fsck to check file system
- `shutdown [-t seconds] [-arkhncfF] [time] [warning_info]`
- usage below:

Option - | - Setting
-------- | ---------
`-t sec` | shutdown in some seconds
`-k` | send warning message without shutting down
`-r` | reboot after system services terminate
`-h` | shutdown after system services terminate
`-n` | shutdown without the init process
`-f` | reboot skipping fsck check
`-F` | reboot force fsck check
`-c` | cancel current shutdown directive

<br/>
#### Possible reasons for file system error

- abnormal shutdown, like sudden cut off of power
- frequent Harddisk access, over-heat, high-humidity

**If root [/] not broken**
- if the error happens in partition of `/dev/sda7`, then at boot time press ctrl-D to enter root password
- then enter `fsck /dev/sda7` to check for disk errors. If none found, enter Y to clear and reboot

**If root is broken**
- unplug the harddisk and connect to another working Linux machine
- do not mount that drive
- login as root, execute `fsck /dev/sdb1` assume `sdb1` is the broken disk
- the same thing can be done using a Linux CD boot

<br/>
#### Forgotten root password? Enter Single User Mode

- reboot, when it is counting seconds, press any key to enter grub editor
- press `[e]` to enter grub editing mode
- move cursor to line starting with 'kernel', add 'single' at the end of line
- press `[enter]` to save
- press `[b]` to enter single user maintenance mode
- enter `passwd` and enter new root password twice

<br/>
#### Ownerships and Access rights

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

**change ownership/groupship**

```sh
chgrp group_name file_name # straight forward, group_name must exist
chown user_name.group_name file_name # change both at the same time
chown .group_name # change the group access only
```

**change access rights**

`chmod` can set access with numbers:
```sh
# r:4 w:2 x:1
user = rwx = 4 + 2 + 1 = 7
group = r-x = 4 + 0 + 1 = 5
others = r-- = 4 + 0 + 0 = 4

chmod 754 file_name
# chmod u/g/o/a +(add)/-(remove)/=(set) r/w/x file_name
# u=user, g=group, o=others, a=all!
chmod u=rwx,go=rx .bashrc
```

**interesting x**

- `x` means execute
- on a file means whether it can be executed
- on a directory it means whether a user can `cd` into this directory as working directory
- whether a user can delete a file depends on its access right on the current directory. Must be `w`ritable

**Unmask: set default access for new files**
- new files created will **NOT** have certain access rights
- think as 'disabling' certain rights by digits
- i.e. `unmask 023` means new files created will NOT have `w` for groups and not have `wx` for others

**directory access explained**
1. a user can `cd` into a directory if having `x`
2. a user can `ls` on a directory if having `r`
3. a user can change a file if having `x` on the directory and `rw` on the file
4. a user can create file in a directory if having `rx` on the directory

<br/>
#### Special Hidden attributes

Hidden attributes on a file are useful for security reasons.
- `lsattr` allows you to view the hidden attributes of a file
- `chattr` allows you to change the hidden attributes of a file
  - `-i` means let a file be unchangable
  - `-a` allows adding but not changing/deleting old portion of the file

**File special access**

`SUID` - Set UID, happens at access bit replacing `x`
- only available for **binary** program
- executor need `x` access
- only valid for **run-time**
- not valid for directories
- executor can have the owner access

For example, I have `x` access to `/usr/bin/passwd` and `passwd` is owned by _root_. When I execute `passwd` I temporarily get root access so I can change `/etc/shadow`
SUID can only be used on binary program, NOT in shell script.

`SGID` - Set GID, like `SUID`:
- only available for binary program
- executor need `x` access
- executor can have the group access

Differently, SGID can be used on directories
- user have `rx` access can enter the directory
- user's effective group will be this directory's group
- if the user has `w` access, the newly created files here have the same group as this directory

`SBIT` - Sticky Bit, only available to **directory**:
- when a user has `wx` in a directory
- when this user creates file under this directory, only _this user_ or _root_ can delete that file
- How to set it:
  - `SUID: 4, SGID: 2, SBIT: 1`
  - `chmod 4755 file_name`

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

<br/>
#### FHS

- static AND shareable: `/usr` (software included), `/opt` (third party software)
- static AND unsharable: `/etc` (configurations), `/boot` (boot and kernels)
- variable AND shareable: `/var/mail` (user mail), `/var/spool/news` (news)
- variable AND unsharable: `/var/run` (program related), `/var/lock` (program related)

**`/usr` directory** is short for Unix Software Resource, not 'user'!

Therefore, files in /usr should be shareable and static files. This directory typical need a lot space.

Path - | - Content
------ | ---------
`/usr/X11R6` | X Window system files (this example name implies X version being 11 and the sixth time released)
`/usr/bin` | most of common commands
`/usr/include` | c/c++ header and includes
`/usr/lib` | library or object files, scripts, shared by many software
`/usr/local` | software from non-distribution provider should be installed here, or newer version of some software included in Linux
`/usr/sbin` | non-system-critical commands, i.e. daemon for some network server
`/usr/share` | for sharing files
`/usr/src` | source code

<br/>
**/var directory** is used after the system is up, for the purpose of cache, log file, and other files generated by software including lock file and run file.

Path - | - Content
------ | ---------
`/var/cache` | program execution generated temp cache file
`/var/lib` | data file when program executes
`/var/lock` | lock files for programs to prevent simultaneous modification of files
`/var/log` | log files, including the login record for who used this system
`/var/mail` | personal mail
`/var/run` | storing PIDs after process started
`/var/spool` | stores some queue data, that is something queued up for process to use in order. Often deleted after use.

<br/>
More details can be found on FHS. A good tree-structure representation can be found on page 196 of the book.

**File pathname and dirname**
use `basename` on a file to get the file's name
use `dirname` on a file to get the full path to this file's belonging directory

<br/>
#### File System

**inode and block (indexed allocation)**
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

**inode/block bitmaps** records and track used and unused blocks and inodes
which gives fast lookup and fast search for unused block/inode

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

**check filesystem space**
- `df` gives the overall filesystem usage
- `du` evaluates filesystem usage of certain directory

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

<br/>
#### Partition, Format, and Mount Hard-drives

**Partition**
- `fdisk` - use `fdisk [-l] device_name` shows the device's partitions. without `-l` will be interactive mode. (P264 for more info)
- `df` - use `df pathname` to find the name and usage of the hosting device
- It is best to do partition in single-user mode

**Format**
- `mkfs` - to format and make a filesystem
  - use `mkfs [-t filesystem_format] device_name`
  - do `mkfs[tab][tab]` will give you a list of supported filesystem format
- `mke2fs` - a very detailed and sophisticated command
  - can set filesystem label, block size, inode per N bytes, journal system configuration
  - i.e. `mke2fs -j -L "vbird_logical" -b 2048 -i 8192 /dev/hdc6`

**disk check**
- `fsck` is a serious command to use when filesystem has problems
  - actually calling `e2fsck`
  - must be used when the partition inspected was unmounted
- `badblocks` can check whether the drive has broken sectors
  - `badblocks -[svw] device_name`

**mount/unmount**
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

**Infrequently used commands** `mknod, e2label, tune2fs, hdparm` P282 Book for details

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

**Mount .iso image using loop**
- `mount -o loop /path/to/centos5.2_x86_64.iso /mnt/centos_dvd`

In this way, one can quickly mount an iso without the trouble to burn it into a DVD and insert it into the CDROM

**Make a large file and format it to be a portable filesystem**

```sh
dd if=/dev/zero of=/home/loopdev bs=1M count=512
mkfs -t ext3 /home/loopdev
mount -o loop /home/loopdev /media/cdrom/
```

**Make/start a swap partition**
P289 Book for more details

**superblock and boot sectors**
P293 Book for more details
