---
layout: notes
title: Basic Linux Shell Scripting
title_short: linux_shell_scripting
dateStr: 2019-04-01
category: Linux
categories: notes
---
# Learning_Shell

Big thanks to William Shotts Jr. from linuxcommand.org for this great educational resource. Here are my reading notes taken.

## What is "Shell"

shell is a program (CLI) taking commands from keyboard and gives them to OS to perform.
- called bash in Linux (Bourne Again SHell), enchanced version of original Unix shell program, sh, written by Steve Bourne.
- other shell programs: ksh, tcsh, zsh

**Terminal**
terminal emulator, a program opens a window and allow interaction with the shell.
- some terminal emulators: gnome-terminal, konsole, xterm, rxvt, kvt, nxterm, eterm
- superuser: shell prompt is # rather than $

Linux has focus policy as "focus follows mouse", you don't have to click on the window to make it active, which can be very handy.

#### Navigation

*ls*
- -a show hidden files

*pwd*
*cd*
- *cd -* return to last working directory
- *cd* itself return to current user's home directory

file names is best to contain no white spaces. use _ instead.

**tab auto-complete**
hitting `tab` when entering a long command or filename, will auto complete it for you.
hitting `tab` twice after entering a portion of command will show all commands that prefixed by that portion.

use *type* can know whether a command is a built-in, alias, or from other sources.
use `[\ Enter]` to span commands to multiple lines.

#### Looking Around

*ls* (list files and directories)
- -l list files in long format
  - from left to right: File Permissions, Owner, Group, Size(in bytes), Modification time, File Name
  - symbolic links are shown by filename -> actual target
  - use *ln* to create symbolic links

*less* (view text files)
- often time, program producing long results pumped into less will be much nicer to view, since viewable terminal history will not be messed up
- bash history can hold up to 1000 records, and stored in ~/.bash_history
- Some very handy options for less:
  - PageUp or b: scroll back one page
  - PageDown or space: scroll forward one page
  - G: go to end of text file
  - 1G: go to beginning of text file
  - /characters: search forward in text file for specified characters
  - n: repeat previous search
  - h: display complete list of less commands and options
  - q: quit

*file* (classify a file's contents)
- sometimes a file's extension lies

File Type|Description|Viewable as Text?
---------|-----------|-----------------
ASCII text|text file|yes
bash script|script|yes
ELF 32-bit LSB core file|core dump file|no
ELF 32-bit LSB executable|executable binary program|no
ELF 32-bit LSB shared object|a shared library|no
GNU tar archive|a tape archive file, a common way of storing groups of files|no, use tar tvf to view listing
gzip compressed data|archive compressed with gzip|no
HTML doc|a web page|yes
JPEG|compressed JPEG image|no
PostScript doc|a PostScript file|yes
RPM|a Red Hat Package Manager archive|no, use rpm -q to examine contents
Zip archive data|an archive compressed with zip|no

#### Guided Tour

Interesting Linux folders

Directory|Description
---------|-----------
/|The root directory where the file system begins
/boot|where Linux kernel and boot loader files are kept. The kernel is a file called vmlinuz
/etc|contains configuration files for the system. All files here should be text files: <br> /etc/passwd defines essential info for each user; <br> /etc/fstab contains devices/drives mounted; <br> /etc/hosts lists network host names & IP addrs known; <br> /etc/init.d contains scripts start system services at boot time
/bin, /usr/bin|contain most of the programs for the system; <br> /bin has essentials for system to operate; <br> /usr/bin contains apps for system's users
/usr|contains things support user applications: <br> /usr/share/X11 has support files for the X Window system; <br> /usr/share/dict is spelling checker [see *look* and *aspell*] <br> /usr/share/doc has documentation files w/ multi. formats <br> /usr/share/man has man pages <br> /usr/src contains source code files
/usr/local|for installation of software and other files on local machine (software not officially distributed). Most often use /usr/local/bin
/var|contains files that change as the system is running: <br> /var/log updated as system runs, contains health of the system <br> /var/spool hold files queued for some process, i.e. mail messages and print jobs
/lib|shared libraries kept here
/home|users keep personal work. Usually only place users are allowed to write files
/root|superuser's home directory
/tmp|programs write temporary files
/dev|contains devices available to the system, while devices are treated like files. all devices kernel recognizes are here
/proc|entirely virtual, contains little peep holes into the kernel. Group of numbered entries correspond to all processes running. A number of named entries permit access to current configuration of the system. Many can be viewed. i.e. */proc/cpuinfo* shows what the kernel thinks of your CPU
/media, /mnt|/media is used for mount points. system boots and reads a list of mounting instructions in */etc/fstab* which describes which device is mounted and which mount point in directory tree. /mnt is for mounting temporary devices such as CD-ROMs, thumb drives, and floppy disks. *mount* shows devices - mount points used

#### Manipulating Files

- cp - copy files and directories
  - ex. `cp -u \*.html destination` copy only html files to destination if they are newer. can be hard to do one by one in GUI
  - `cp file1 file2` copy and silently replace
  - -i can be added for interaction: prompt user for replace action
  - -R copy directory recursively
  - `cp file... directory` cp multiple files into directory
- mv - move or rename files and directories
- rm - remove files and directories
  - NOTE that rm is irreversible. test the wildcard with ls first before using rm on it!!!
- mkdir - create directories

**Wildcards**
Special character can help rapidly specify groups of filenames:

Wildcard|Meaning
--------|-------
\*|Matches any characters, any number of
?|Matches any single character
[*characters*]|Matches any character that is a member of the set *characters*. can also be expressed as a *POSIX character class*.
[!*characters*] or [^*characters*]|Matches any character that is not a member of the set characters

**POSIX character class**

Symbol|Representation
------|--------------
[:alnum:]|Alphanumeric characters
[:alpha:]|Alphabetic characters
[:digit:]|Numerals
[:upper:]|Uppercase Alphabetic characters
[:lower:]|Lowercase Alphabetic characters

#### A higher level

**Linux Command types**
1. executable program: like all files in /usr/bin, can be compiled binaries or programs in scripting languages such as shell, Perl, Python, Ruby, etc.
2. command built in shell itself: called shell built-ins, like cd, type.
3. shell function: shell scripts incorporated into the environment.
4. alias: commands defined by other (long) commands. set alias: `alias alias_name='long command here'`

- *type* - Display information about command type
- *which* - Locate a command's actual path
  - only works for executable programs
- *help* - Display reference page for shell built-in
  - shell built-ins have no manpages available
  - `help -m` serves as displaying a manpage format for built-ins
  - many executable programs support `--help` option to display a description of supported syntax & options
- *man* - Display formal piece of documentation
  - most executable programs have manpages
  - usually don't include examples

#### shell (environment) variables
Linux is a multi-user system, each person logged-in will get a bash to use.
each bash will have a set of environment variables to make sure users workspace clean.
to set variables:
1. var_name=value
2. no spaces on two sides of '='
3. var_name can't start with number; var_name contains only alphanumeric chars
4. if var's value contains spaces, use \" or \' to wrap it up; However, variables can be evaluated within \", but not \'
5. use escape char '\\' to include special chars.
6. can assign variable value from command's output using $()
7. use `export var_name` to make the variable an environment var
8. usually capitalized VAR_NAME is an environment variable
9. use *unset* to cancel/remove a variable

use *env* to see a list of all environment vars
- *$RANDOM* is a special env var that gives a random number between 0-32767 every time used.

use *set* to see a list of user defined vars
- *$PS1* is the command character as well as anything before it! It can be customized to display more info at the beginning of each line of command in terminal.
  - \\d: shows [Weekday Month Day] format of date
  - \\h: host name
  - ... P368 Book
- *$$* '$' itself is a variable showing current shell PID.
  - sub-program of bash can only inherit the parent's environment vars, not regular vars
  - export normal vars as env vars if necessary

*read* command allows user to enter something and store it as a variable. Useful for script requires user input.
*declare / typeset* both is to set the variable type of a variable
- -a: array
- -i: integer
- -x: environment variable
- -r: readonly variable
- +x: cancel env var setting; '+' means cancel here...

`declare -i sum=100+300+50`

**Modify variable content**

expression|purpose
----------|-------
${variable#key_word}|from begin to end, find shortest match and delete
${variable##key_word}|from begin to end, find longest match and delete
${variable%key_word}|from end to beginning, find shortest match and delete
${variable%%key_word}|from end to beginning, find longest match and delete
${variable/key_word/new_word}|find one match and replace with new_word
${variable//key_word/new_word}|find all matches and replace with new_word

**Default if empty**
${var_name-default_value} if var_name is not set or empty, default_value will be used.

expression|str not set|str is empty|str set and non-empty
----------|-----------|------------|---------------------
var=${str-expr}|var=expr|var=|var=$str
var=${str:-expr}|var=expr|var=expr|var=$str
var=${str+expr}|var=|var=expr|var=expr
var=${str:+expr}|var=|var=|var=expr
var=${str=expr}|str=expr,var=expr|str unchanged, var=|str unchanged, var=$str
var=${str:=expr}|str=expr,var=expr|str=expr,var=expr|str unchanged, var=$str
var=${str?expr}|expr 输出至 stderr|var=|var=$str
var=${str:?expr}|expr 输出至 stderr|expr 输出至 stderr|var=$str

**array**
var[index]="values"
indexes start at 0. No need to specify initial capacity.

**limiting usage**
use *ulimit* to limit the memory/CPU/etc each user can use.
P375 Book.

**tty**
use [alt-ctrl-(F1-F6)] to access tty1-6
welcome message at login is in /etc/issue
welcome message at login for telnet is in /etc/issue.net
message after login is in /etc/motd

#### login and non-login shell

login shell - need to go through login process
non-login shell - no need login, i.e. after you login through X window, your bash assignment required no password again, neither when you initiated bash terminal there.
The two shells read different configuration files
login shell:
- /etc/profile: overall system settings, don't change
  - vars like PATH, MAIL, USER, HOSTNAME, HISTSIZE
  - call other config files, like /etc/inputrc, /etc/profile.d/\*.sh, /etc/sysconfig/i18n
- ~/.bash_profile or ~/.bash_login or ~/.profile: personal settings

non-login shell:
- ~/.bashrc

key_press|results
---------|-------
ctrl-c|interrupt
ctrl-d|enter EOF
ctrl-m|like enter
ctrl-s|pulse screen output
ctrl-q|continue screen output
ctrl-u|delete a line of command
ctrl-z|pulse current process

use *source* to load configuration from a file immediately


#### I/O Redirection

redirect output of commands to files, devices, and input of other commands.

**Std I/O**
- `ls > file.txt` write output to file.txt, create if not exist
- `ls >> file.txt` append output to file.txt, create if not exist
- `sort < file.txt` redirect file.txt contents to command *sort* as input
- `ls -l | less` piping output of *ls* to program *less* as input

**Some handy command combinations**

Command|What it does
-------|------------
ls -lt \| head|Displays 10 newest files in the current directory
du \| sort -nr|displays a list of dirs and how much space they consume, from largest to smallest
find . -type f -print \| wc -l|Displayss total number of files in current working directory and all of its subdirectories

**Filtering**
filter programs take std input and perform operations upon it and send results to std output, to be combined and process info in powerful ways.

**Some handy command combinations**

Command|What it does
-------|------------
sort|sorts std input then outputs sorted result
uniq|given a sorted stream of data, removes duplicate lines
grep|examines each line receives, outputs lines containing specified pattern of chars
fmt|reads text from input and outputs formatted text
pr|takes text input and splits data into pages with page breaks, headers and footers in preparation for printing
head|outputs first few lines of input. e.g. getting header of a file
tail|outputs last few lines of input. e.g. getting most recent entries from a log file
tr|translate characters, such as upper/lowercase conversions, changing line termination chars.
sed|stream editor, perform more sophisticated text translations than *tr*. supports regex
awk|a programming lang designed for constructing filters

**Example performing tasks with pipelines & filters**
1. Printing from the command line
  - `cat report.txt | sort | uniq | fmt | pr | lpr`
  - *cat* is used to concatenate files and gives to output. here can be used to put single file content to std output
  - *fmt* formats text into neat paragraphs
  - *pr* splits text neatly into pages
  - *lpr* sends std input to printer

**use of -**
use '-' can replace stdin and stdout without creating files. i.e. `tar -cvf - /home | tar -xvf -` will pack the files and pass it to next command without writing to a file.

#### Expansion

expansion is when your command typed-in expanded into something else before shell acts upon it.
**Pathname Expansion**
For example, we can use `echo D*` to show files starting with 'D' in the current directory.

**Tilde Expansion**
'~' char has special meaning.
- at beginning of a word, it expands to the name of the home directory of the named user.
- at the end of a filename, it means this file is a temporary backup
- if used alone it refers to the home directory of current user

**Arithmetic Expansion**
the use of `$((expression))` allows arithmetic evaluation inside the `$()` syntax

**Brace Expansion**
create multiple text strings from a pattern containing braces. i.e. `echo Front-{A,B,C}-Back`, `echo Front-{1..5}-Back`
Common good application is to make lists of files or directories to be created. i.e. `mkdir {2007..2009}-0{1..9} {2007..2009}-{10..12}`

**Parameter Expansion**
make use of the system's ability to store small chunks of data and give each chunk a name.
*printenv* gives all available variables

**Command Substitution**
allows us to use the output of a command as an expansion, like this: `echo $(ls)`, `ls -l $(which cp)`
alternatively, can also use back-quotes to do the same thing:
```
ls -l `which cp`
```

**Quoting**
some special characters may need escapes using '\\' or simply using double quotes "" to include the parts having special characters. i.e. see differences between `echo $(cal)` and `echo "$(cal)"`

Here is a comparison of three levels of expansion suppressions
`echo text ~/*.txt {a,b} $(echo foo) $((2+2)) $USER`
text /home/me/ls-output.txt a b foo 4 me
`echo "text ~/*.txt {a,b} $(echo foo) $((2+2)) $USER"`
text ~/\*.txt {a,b} foo 4 me
`echo 'text ~/*.txt {a,b} $(echo foo) $((2+2)) $USER'`
text ~/\*.txt {a,b} $(echo foo) $((2+2)) $USER

use backslash also to start a new line for a single line of command. Like this:
```
ls -l \
  --reverse \
  --human-readable \
  --full-time
```
Sometimes use the long version of the options help you read and know its purpose instantly.

#### Permissions

Linux is a multitasking and multi-user system.

- chmod - modify file access rights
  - rwx = 111, rw- = 110, r-x = 101, r-- 4, ...
  - `chmod 600 some_file` makes the file only read/writable for the user, strips the rights for group and global
  - for directory, x allows directory to be entered. r/w is for its contents to be listed/modified
- su - temporarily become the superuser
- sudo - temporarily become the superuser
- chown - change file ownership
  - `chown new_owner_username file`
  - superuser or owner can do this
- chgrp - change a file's group ownership
  - `chgrp new_group_name file`
  - only owner can do this

**Frequently used file permission settings**

Value|Meaning
-----|-------
777|(rwxrwxrwx) No restriction on permission.
755|(rwxr-xr-x) Owner may read/write/exec, no one else may write the file but only read/exec
700|(rwx------) Only Owner has all access
666|(rw-rw-rw-) All users may read/write, not exec
644|(rw-r--r--) Owner may read/write, others can only read
600|(rw-------) Owner read/write only

#### Job Control

commands used to control processes.
- ps - list the processes running on the system
- kill - send a terminate signal to one or more processes (usually to "kill" a process)
- jobs - an alternate way of listing your own processes
- bg - put a process in the background
- fg - put a process in the forground

**Some commond kill signals**

Signal#|Name|Description
-------|----|-----------
1|SIGHUP|Hang up signal. Programs can listen for this signal and act upon it. This signal is sent to processes running in a terminal when you close the terminal.
2|SIGINT|Interrupt signal. This signal is given to processes to interrupt them. Programs can process this signal and act upon it. You can also issue this signal directly by typing Ctrl-c in the terminal window where the program is running.
15|SIGTERM|Termination signal. This signal is given to processes to terminate them. Again, programs can process this signal and act upon it. This is the default signal sent by the kill command if no signal is specified.
9|SIGKILL|Kill signal. This signal causes the immediate termination of the process by the Linux kernel. Programs cannot listen for this signal.
