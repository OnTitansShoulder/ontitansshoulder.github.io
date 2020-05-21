---
layout: note_page
title: Linux Frequently-used Commands
title_short: linux_freq_used_commands
dateStr: 2019-04-01
category: Linux
tags: notes reference check
---
<br/>
### Frequently Used sh/Bash Builtin Commands

#### (and their frequently used options)

- `alias [-p] [<name>[=<value>] …]`
  - without arguments or with the `-p` option, prints a list of aliases
  - if arguments are supplied, an alias is defined for each name whose value is given
- `caller [<expr>]`
  - without expr, caller displays the line number and source filename of the current subroutine call; good for debugging and printing stack trace
  - if a _non-negative integer_ is supplied as expr, caller displays the line number, subroutine name, and source file corresponding to that position in the current execution call stack.
- `cd [-L|[-P [-e]] [-@] [directory]` change the current working directory to directory
  - the value of the HOME shell variable is used if no _directory_ supplied
  - if _directory_ is `-`, it is converted to _$OLDPWD_ before the directory change is attempted
  - `-P` will not resolve symbolic links
  - `-L` will resolve symbolic links when changing directory (default)
- `command [-pVv] <command> [arguments ...]`
  - runs command with arguments ignoring any shell function named command
  - only shell builtin commands or commands found by searching the _PATH_ are executed.
  - `-p` option means to use a default value for PATH that is guaranteed to find all of the standard utilities
  - `-v -V` prints description of command
- `echo [-neE] [<arg> ...]`
  - output the args, separated by spaces, terminated with a newline
  - `-n` suppress the trailing newline for the print
  - `-e` enables interpretation of the following backslash-escaped characters
    - supported escape sequences: `\a \b \c \e \E \f \n \r \t \v \\ \0nnn \xHH \uHHHH \UHHHHHHHH`
  - `-E` disables interpretation of backslash-escaped characters
- `printf [-v <var>] <format> [<arguments>]`
  - write the formatted arguments to STDOUT under the control of the format
  - `-v` causes the output to be assigned to the variable _var_ rather than being printed to STDOUT
  - special extensions in _format_:
    - `%b` expand backslash escape sequences in the corresponding argument in the same way as `echo -e`
    - `%q` output the corresponding argument in a format that can be reused as shell input
    - `%(<datefmt>)T` output the date-time string resulting from using datefmt as a format string for strftime(3)
      - The corresponding argument is an integer representing the number of seconds since the epoch
      - Two special argument values may be used: -1 represents the current time, and -2 represents the time the shell was invoked
- `read [-ers] [-a <aname>] [-d <delim>] [-i <text>] [-n <nchars>] [-N <nchars>] [-p <prompt>] [-t <timeou>t] [-u <fd>] [<name> …]`
  - one line is read from the STDIN, or from the file descriptor fd supplied as an argument to the `-u` option
  - `-a <aname>` the words are assigned to sequential indices of the _array_ variable aname, starting at 0
  - `-d <delim>` the **first character** of _delim_ is used to terminate the input line, rather than newline. If delim is the empty string, read will terminate a line when it reads a NUL character.
  - `-p <prompt>` display _prompt_, without a trailing newline, before attempting to read any input
  - `-r` backslash does not act as an escape character
  - `-s` silence mode (good for password prompt). If input is coming from a terminal, characters are not echoed
  - `-t <timeout>` read to time out and return failure if a complete line of input (or a specified number of characters) is not read within timeout seconds
  - `-u <fd>` read input from file descriptor fd
- `source filename` A synonym for `.`
  - read and execute commands from the filename argument in the current shell context.
- `type [-afptP] [<name> …]` for each _name_, indicate how it would be interpreted if used as a command name
  - `-t` type prints a single word which is one of 'alias', 'function', 'builtin', 'file' or 'keyword', if _name_ is an alias, shell function, shell builtin, disk file, or shell reserved word, respectively
  - `-p` returns the name of the disk file that would be executed, or nothing
  - `-P` forces a path search for each _name_
  - `-a` returns all of the places that contain an executable named _file_
- `umask [-p] [-S] [mode]` set the shell process’s file creation mask to _mode_
  - if mode begins with a digit, it is interpreted as an octal number; if not, it is interpreted as a symbolic mode mask similar to that accepted by the _chmod_ command
- `unset [-fnv] [name]` remove each variable or function _name_
  - `-f` refers function; `-v` refers variable
  - `-n` means _name_ will be a nameref attribute; only _name_ is unset, not the variable it references

For more info visit https://www.gnu.org/software/bash/manual/html_node/index.html

<br/>
### Linux Text Manipulation Commands

**awk** suitable for smaller data processing.
- Works like sed, line-by-line, but separate a line into parts to process.
- The default separation char is space or [tab]
- `awk 'condition1{action1} condition2{action2} ...' filename`
- can use _$numb_ to access which part, starting from 1:
  - `last -n 5 | awk '{print $1 "\t" $3}'`
  - $0 represents the entire line
- additionally, *awk* has internal variables accessible:
  - `NF` how many parts on this line
  - `NR` which line is current line
  - `FS` current separation char
  - `cat /etc/passwd | awk 'BEGIN {FS=":"} $3 < 10 {print $1 "\t " $3}'`
- using conditions for different outputs
  - i.e. `awk 'NR==1{printf "%10s %10s %10s %10s %10s\n",$1,$2,$3,$4,"Total" } NR>=2{total = $2 + $3 + $4; printf "%10s %10d %10d %10d %10.2f\n", $1, $2, $3, $4, total}'`

**col** for simple process of a text file, like converting [tab] with spaces, etc.

**cut** gets some part of info out of a line of text, like a log
- `-d`: [sparation char]
- `-f`: nth_part
- `-c`: get range of characters

**diff** compare two pure-text files/dirs and output the differences.
- `diff [-bBi] from-file to-file`
- `-b`: ignore diff of one of more spaces, like "about me" and "about    me" are the same
- `-B`: ignore empty lines
- `-i`: ignore capitalized differences
- diff can be used on directories to show difference in files

**grep** supports regex, analyze a block of text and get the lines containing the match
`grep [-A] [-B] [--color=auto] 'search_regex' filename`
- `-A` is display n lines after the result line
- `-B`: is display n lines before the result line
- `-n`: show line-number
- `-v`: reverse the condition
- *Extended regex*
  - '|' means OR i.e: `grep -v '^$' file | grep -v '^#'` gives the same result as `grep -v -E '^$|^#' file`, to show lines without empty lines and commented lines
  - grouping '()', `egrep -n 'g(la|oo)d' file` finds 'good' or 'glad' lines

**join, paste, expand**
- *join* merge two files by comparing them and only put together similar parts/lines.
  - Files should be sorted before doing join.
- *paste* is simpler, just connected two lines together with a [tab]
- *expand* converts [tab] as a number of spaces

**patch**
- use _diff_ to generate difference file, then apply difference file on the old file to patch updates.
- `diff -Naur passwd.old passwd.new > passwd.patch`
- `patch -pN < patch_file` apply patch
- `patch -R -pN < patch_file` restore old file from patch

**pr** for processing pure text and format to be print-ready.

**printf** format lines columns to be visually appealing

**sed** useful for analyzing input, replace, delete, append, or extract text and lines
`sed [-nefr] ['action'] [filename]`
- `-n`: silent mode, only processed lines being output
- `-e` [script]: have the script added to the command to be executed
- `-f` [filename]: read script from a file
- `-r`: let sed work with extended regex
- `-i`: direct modify the file instead of output results
- `[action]`:
  - in the form of `[n1[,n2]]function`; function has:
  - `a`: insert a line after i.e. `nl /etc/passwd | sed '2a drink tea'`
  - `c`: replace lines b/w n1,n2
  - `d`: delete matched line i.e. `nl /etc/passwd | sed '2,5d'`
  - `i`: insert a line before
  - `p`: print (stdout) selected lines of data/text i.e. `nl /etc/passwd | sed -n '5,7p'` is same as `ln file | head -n 7 | tail -n 3`
  - `s`: find and replace inline! `1,20s/old_phrase/new_phrase/g` here the phrase part supports regex!

**sort** arranges text lines in the order we want.
- `-f`: ignore capitalized difference
- `-b`: ignore the space at the beginning
- `-M`: arrange using month
- `-n`: use number to arrange
- `-r`: reversed order
- `-u`: uniq lines only (filter out repeated lines)
- `-t`: separation char for columns (fields), default is [tab]
- `-k` [n]: use nth field to arrange

**split** useful for splitting a large file into smaller ones according to size, or number of lines.

**tee** redirects data as well as saving part of the data.
- `last | tee last.list | cut -d " " -f1`

**tr** deletes / replaces some text within a block of text
- `last | tr '[a-z]' 'A-Z'` will replace all lower case with upper

**wc** shows text stats like number of characters, lines, english words.
- `-l`: lines
- `-w`: words
- `-m`: characters

**uniq** shows only unique (non-repeated) lines only
- `-c` show count

**xargs** provides pipe access to the commands that don't support pipes

**xclip** copy STDOUT piped from other commands to the clipboard; MacOS equivalent is **pbcopy**

<br/>
### Other General Linux Commands

**common commands** `halt(shutdown), reboot`

**apt-get** tool for handling packages using APT library
- `apt-get [OPTIONS]... [update|upgrade|install|remove|purge|source|build-dep|download|check|clean|autoclean|autoremove]`
- `update`: resynchronize package index files from their sources specified in /etc/apt/sources.list
- `upgrade`: install newest versions of all packages currently installed on the system from the sources in /etc/apt/sources.list
- `install`: get one+ package desired for install or upgrade
- `remove`: opposite of install
- `purge`: like remove but packages and configs are also removed
- `source`: causes to fetch source packages
- `build-def`: causes apt-get to install/remove packages to satisfy build dependencies for a source package.
- `check`: diagnostic tool; updates package cache and checks for broken dependencies
- `download`: download given binary package into curr dir
- `clean`: clean clears out local repo of retrieved package files. removes everything but the lock file from /var/cache/apt/archives/ and .../partial/
- `autoremove`: remove packages that were auto installed to satisfy dependencies but no longer needed

**cat** Concatenate FILEs to standard output.
- `cat [OPTION]... FILE...`
- `-A`: show all info, equivalent to -vET
- `-n`: number all output lines. -b number nonempty lines only
- `-s`: suppress repeated empty output lines
- `-T`: display TAB chars as ^I

**chmod** change file mode bits
- `chmod [OPTION]... MODE... FILE...`
- `-R`: change files and dirs recursively
- MODE is of the form:
  - `[ugoa]*([-+=]([rwxXst]*|[ugo]))+|[-+=][0-7]+`
  - `chmod a+x file` or `chmod 755 file`

**cp** copy files/directories
- `cp [OPTION]... SOURCE... DEST...`
- `-H`: follow command-line symbolic links in SOURCE
- `-s`: make symbolic links instead of copying

**df** report file system disk space usage
- `df [OPTION]... [FILE]...`
- `-a`: all, include pseudo, duplicate, inaccessible fs
- `-B`: print sizes by SIZE unit
- `-h`: size in human readable format
- `-i`: list inode info instead of block usage
- `-l`: listing only local fs
- `-T`: print fs type. -t=TYPE for limiting fs type to display

**du** summarize disk usage of set of FILES, recursively for dirs
- `du [OPTION]... [FILE]...`
- `-h`: human readable
- `-c`: produce grand total
- `--apparent-size`: rather than disk usage, excludes sparse

**echo** Echo the STRINGs to standard output.
- `echo [SHORT-OPTION]... STRING...`
- `-n`: do not output trailing newline
- `-e/-E`: enable/disable interpretation of backslash escapes

**hostname** show or set the system's host name
- `hostname [OPTIONS]...`
- `-d`: display name of the DNS domain
- `-I`: display all network addresses of the host.

**locate** to find files by name
- `locate [OPTION]... PATTERN...`
- `-A`: print entries that match all PATTERNs instead of any one
- `-c`: print number of matching entries
- `-b`: match only base name against patterns. -w is opposite
- `-d`: replace default database with DBPATH (: separated db file names)
- `-e`: print only existing files
- `-i`: ignore case when matching patterns
- `-l`: limit output entries
- `-L`: follow trailing symbolic links when checking file existence. -P is the opposite
- `-q`: write no error messages
- `-r`: [REGEXP] search for a basic regexp REGEXP, can be used multiple times

**ls** show files in a directory
- `ls [OPTION]... [FILE]...`
- `-a`: show hidden(implied) files (starting with .)
- `-c`: sort by ctime newest first
  - with `-lt`: sort by and show ctime (last modif.)
  - with `-l`: show ctime and sort by name
- `-h`: with -l or -s: print human readable sizes
- `-r`: reverse order while sorting
- `-R`: list subdirs recursively
- `-S`: sort by file size, largest first
- `--sort=WORD`, WORD=[-U(none),-S,-t,-v,-X(extension)]

**mkdir** create a directory
- `mkdir [OPTION]... DIRECTORY...`
- `-p`: make parent dirs as needed
- `-v`: print message for each created dir
- `-m`: set file mode (as in chmod)

**mv** move file/directories to another location or rename file/directory
- `mv [OPTION]... SOURCE... DEST`
- `-f`: no prompt before overwriting; -i prompt before overwrite
- `-n`: do not overwrite existing file
- `-u`: move only when SOURCE file is newer than dest file (or missing)
- `-v`: explain what is done

**ping** send ICMP ECHO_REQUEST to network hosts
- `ping [OPTIONS]... destinationIP`
- `-b`: allow pinging a broadcast address
- `-c`: COUNT stop after sending COUNT packets
- `-D`: print timestamp before each line
- `-f`: flood ping. check how many packets are being dropped
- `-i`: INTERVAL wait INTERVAL seconds b/w packets sending
- `-w`: DEADLINE a timeout for ping exists
- `-W`: TIMEOUT set time to wait for a resp
- `-v`: verbose output

**rm** delete file/directories
- `rm [OPTION]... {script} FILE...`
- `-f`: ignore non-existent files and arguments
- `-r`:/-R remove dirs and sub-contents
- `-d`: remove empty directories
- `-v`: explain what is done

**sed** stream editor for filtering and transforming text
- `sed [OPTION]... [FILE]...`
- `-n`: suppress auto printing of pattern space
- `-e`: SCRIPT add the script to the commands to exec
- `-i`: edit files in place
- `-r`: use extended regular expressions in the script
- _sed_ commands:
  - `=` print the current line number
  - `a` TEXT append text
  - `i` TEXT insert text
  - `c` TEXT replace selected lines with text
  - `d` delete pattern space
  - `/regexp/` match lines using this regexp

**tar** work with tarballs archive file, ex. .tar .tar.gz .tar.bz2
- `tar [...] [OPTIONS] [PATHNAME...]`
- `-A`: append tar files to an archive
- `-c`: create a new archive
- `-d`: run differences b/w archive and fs
- `--delete`: delete from archive
- `-r`: append files to the end of an archive
- `-t`: list contents of an archive
- `-u`: only append files newer than copy in archive
- `-x`: extract files from an archive
- `-a`: auto determine compression program by archive suffix
- `-f`: ARCHIVE use archive file or device ARCHIVE
- `-h`: follow symbolic links; archive and dump files linked
- `-l`: check links, print msg if not all links are dumped
- `-s`: handle sparse files efficiently
- `-U`: remove each file prior to extracting over it
- `-v`: print files processed
- `-W`: verify archive after writing it

**touch** create a file or update file modification date
- `touch [OPTION]... FILE...`
- `-c`: do not create file
- `-a/-m`: change access/modification time only

**uname** print system information
- `uname [OPTION]...`
- `-a`: print all info, in following order:
  - kernel name, network node hostname, kernel release, kernel version, machine hardware name, processor type, hardware platform, OS

**zip/unzip** compress/decompress zip files
- `zip [OPTIONS]... ZIPPEDFILE FILE...`
- `-u`: update existing entries for newer entries, or add new entries
- `-f`: like -u, but not adding new entries
- `-d`: delete entries in an existing archive
- `-U`: select entries and copy to a new archive
- `-e`: encrypt using a password
- `-F`: fix zip archive
- `-i`: include only specified files
- `-o`: output the archive modified file as a new archive
- `-P`: include relative file paths as part of the file names
- `-r`: traverse dir recursively
