---
layout: note_page
title: Shell Scripting
title_short: shell_scripting
dateStr: 2019-04-01
category: Language
tags: notes reference check
---

Big thanks to William Shotts Jr. from linuxcommand.org for this great educational resource. Here are my reading notes taken.

<br/>

### Getting to Know Shell Script

There is no way to remember every command and every option associated with it. The real power is to know how to quickly learn from man page and write scripts to do what you need to do.

```sh
#!/bin/bash
# A line of comment
echo "Hello World!"
```

The first line is called a **shebang**, indicating what program is used to interpret the script.

Other scripting languages such as Perl, awk, tcl, Tk, and python also use this mechanism.

After giving a file execution permission, it can be run using `./script_name`

**PATH** is where Linux scans for commands and executable scripts

If a directory need to be added to the PATH var, do `export PATH=$PATH:directory`.

It is better to add this line to the `.bash_profile` or `.profile` file in your home directory.

Linux encourage each user to have a specific directory for programs the user personally uses, `bin` in the user's home directory. This is automatically included in the `$PATH` var.

<br/>

### shell (environment) variables

Linux is a multi-user system, each person logged-in will get a bash to use. Each bash will have a set of environment variables to make sure users workspace clean.

To set a **shell variable**, a few things:

1. `var_name=value`
2. no spaces on two sides of '='
3. _var_name_ can't start with number; var_name contains only alphanumeric chars
4. if var's value contains spaces, use `""` or `''` to wrap it up;
5. variables can be evaluated within `""`, but not `''`
6. use escape char `\` to include special chars in variables created within `""`.
7. can assign variable value from command's output using `$( <shell_expression> )`
8. use `export var_name` to make the variable an **environment variable**
9. usually **capitalized** VAR_NAME is an environment variable
10. use `unset` to cancel/remove a variable

use `env` to see a list of all environment vars

- `$RANDOM` is a special env var that gives a random number between 0-32767 every time used.

use `set` to see a list of user defined vars

- `$PS1` is the command character as well as anything before it! It can be customized to display more info at the beginning of each line of command in terminal.
    - see _Linux Terminal Tricks_ notes
- `$$` itself is a variable showing current shell's PID.
    - sub-program of bash can only **inherit** the parent's environment vars, not regular vars
    - export normal vars as env vars if necessary

`read` command allows user to enter something and store it as a variable. Useful for script requires user input.

`declare` or `typeset` both can set the variable type of a variable

- `-a`: array
- `-i`: integer
- `-x`: environment variable
- `-r`: readonly variable
- `+x`: cancel env var setting; '+' means cancel here...
- i.e. `declare -i sum=100+300+50`

**Modify variable content**

expression - | - purpose
------------ | ---------
`${variable#key_word}` | from begin to end, find shortest match and delete _key_word_
`${variable##key_word}` | from begin to end, find longest match and delete _key_word_
`${variable%key_word}` | from end to beginning, find shortest match and delete _key_word_
`${variable%%key_word}` | from end to beginning, find longest match and delete _key_word_
`${variable/key_word/new_word}` | find one match of _key_word_ and replace with _new_word_
`${variable//key_word/new_word}` | find all matches of _key_word_ and replace with _new_word_

<br/>

**Variable evaluation from another variable**

expression - | - `str` not set - | - `str` is empty - | - `str` set and non-empty
------------ | --------------- | ---------------- | ------------------------
`var=${str-expr}` | $var=expr | $var= | $var=$str
`var=${str:-expr}` | $var=expr | $var=expr | $var=$str
`var=${str+expr}` | $var= | $var=expr | $var=expr
`var=${str:+expr}` | $var= | $var= | $var=expr
`var=${str=expr}` | $str=expr, $var=expr | $str unchanged, $var= | $str unchanged, $var=$str
`var=${str:=expr}` | $str=expr, $var=expr | $str=expr, $var=expr | $str unchanged, $var=$str
`var=${str?expr}` | prints `expr` to stderr | $var= | $var=$str
`var=${str:?expr}` | prints `expr` to stderr | prints `expr` to stderr | $var=$str

<br/>


use `${#Var_Name}` to get the string length of a variable.

**array/list variable** can be created using syntax of `VARS=()`
- initialize with values `VARS=(a b c)`
- change index value with `VARS[0]="values"`
- access array indexes with `${VARS[0]}`
- get a string of all items of an array variable with `${VARS[@]}`
- get array length with `${#VARS[@]}`
- indexes start at 0. No need to specify initial capacity.

<br/>

use `source` to load configuration from a file immediately

<br/>

### Filtering Commands

Take std input and perform operations upon it and send results to std output

Command - | - What it does
--------- | --------------
`sort` | sorts std input then outputs sorted result
`uniq` | given a stream of data, removes duplicate lines
`grep` | examines each line receives, outputs lines containing specified patterns
`fmt` | reads text from input and outputs formatted text
`pr` | takes text input and splits data into pages with page breaks, headers and footers in preparation for printing
`head` | outputs first few lines of input
`tail` | outputs last few lines of input
`tr` | translate characters, such as upper/lowercase conversions, changing line termination chars.
`sed` | stream editor, perform more sophisticated text translations than `tr`. supports regex
`awk` | a programming lang designed for constructing filters

<br/>

Example: Printing from the command line

- `cat report.txt | sort | uniq | fmt | pr | lpr`
- `cat` is used to concatenate files and gives to output. here can be used to put single file content to std output
- `fmt` formats text into neat paragraphs
- `pr` splits text neatly into pages
- `lpr` sends std input to printer

**use of -**

- use `-` can replace stdin and stdout without creating files.
- i.e. `tar -cvf - /home | tar -xvf -`
- will pack the files and pass it to next command without writing to a file.

<br/>

### Expansion

expansion is when your command typed-in expanded into something else before shell acts upon it.

**Pathname Expansion**: we can use `echo D*` to show files starting with 'D' in the current directory.

**Tilde Expansion**

- `~` char has special meanings:
    - at beginning of a word, it expands to the name of the home directory of the named user.
    - at the end of a filename, it means this file is a temporary backup
    - if used alone it refers to the home directory of current user

**Arithmetic Expansion**: the use of `$((expression))` allows arithmetic evaluation inside the `$()` syntax

- if shell variables are used, their values must be numbers
- `+ - * / % **(exponential function)` are supported by shell script.

**Brace Expansion**

- create multiple text strings from a pattern containing braces
    - i.e. `echo Front-{A,B,C}-Back`
    - i.e. `echo Front-{1..5}-Back`
- Common good application is to make lists of files or directories to be created
    - i.e. `mkdir {2007..2009}-0{1..9} {2007..2009}-{10..12}`

**Parameter Expansion**

- make use of the system's ability to store small chunks of data and give each chunk a name (shell variables).
- `printenv` gives all available variables

**Command Substitution**

- allows us to use the output of a command as an expansion, like this: `echo $(ls)`, `ls -l $(which cp)`
- alternatively, can also use back-quotes to do the same thing: `` ls -l `which cp` ``

**Quoting**

- some special characters may need escapes using `\` or simply using double quotes "" to include the parts having special characters
- speical characters quoted within `''` don't need to be escaped

Here is a comparison of three levels of expansion suppressions

```sh
echo text ~/*.txt {a,b} $(echo foo) $((2+2)) $USER
# text /home/me/ls-output.txt a b foo 4 me
echo "text ~/*.txt {a,b} $(echo foo) $((2+2)) $USER"
# text ~/*.txt {a,b} foo 4 me
echo 'text ~/*.txt {a,b} $(echo foo) $((2+2)) $USER'
# text ~/*.txt {a,b} $(echo foo) $((2+2)) $USER
```

use backslash also to start a new line for a single line of command. Like this:

```sh
ls -l \
    --reverse \
    --human-readable \
    --full-time
```

Sometimes use the long version of the options help you read and know its purpose instantly.

<br/>

### Permissions

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

Value - | - Meaning
------- | ---------
`777` | (rwxrwxrwx) No restriction on permission.
`755` | (rwxr-xr-x) Owner may read/write/exec, no one else may write the file but only read/exec
`700` | (rwx------) Only Owner has all access
`666` | (rw-rw-rw-) All users may read/write, not exec
`644` | (rw-r--r--) Owner may read/write, others can only read
`600` | (rw-------) Owner read/write only

<br/>

### Job Control

commands used to control processes.

- `ps` - list the processes running on the system
- `kill` - send a terminate signal to one or more processes (usually to "kill" a process)
- `jobs` - an alternate way of listing your own processes
- `bg` - put a process in the background
- `fg` - put a process in the forground

**Some commond kill signals**

Signal# - | - Name - | - Description
--------- | -------- | -------------
`1` | SIGHUP | Hang up signal. Programs can listen for this signal and act upon it. This signal is sent to processes running in a terminal when you close the terminal.
`2` | SIGINT | Interrupt signal. This signal is given to processes to interrupt them. Programs can process this signal and act upon it. You can also issue this signal directly by typing Ctrl-c in the terminal window where the program is running.
`15` | SIGTERM | Termination signal. This signal is given to processes to terminate them. Again, programs can process this signal and act upon it. This is the default signal sent by the kill command if no signal is specified.
`9` | SIGKILL | Kill signal. This signal causes the immediate termination of the process by the Linux kernel. Programs cannot listen for this signal.

<br/>

### Editing Shell Scripts

**environment**

The Linux environment contains your path, your user name, etc. A complete list of the environment entries can be viewed using the command `set`.

Two types of commands are often contained in the environment: _aliases_ and _shell functions_.

Login shells read one or more startup files:

File - | - Contents
------ | ----------
`/etc/profile` | A global configuration script that applies to all users.
`~/.bash_profile` | A user's personal startup file. Can be used to extend or override settings in the global configuration script.
`~/.bash_login` | If ~/.bash_profile is not found, bash attempts to read this script.
`~/.profile` | If neither ~/.bash_profile nor ~/.bash_login is found, bash attempts to read this file.

Non-login shell sessions read the following:

File - | - Contents
------ | ----------
`/etc/bash.bashrc` | A global configuration script that applies to all users.
`~/.bashrc` | A user's personal startup file. Can be used to extend or override settings in the global configuration script.

**Creating alias** for longer commands can be set like this `alias today='date +"%A, %B %-d, %Y"'`

<br/>

### Creating shell functions

- inside a shell script, functions can be invoked by just using its name, or using `$(func_name)`
- shell commands can be called within functions simply with the command name.
- functions must be defined before using them.

```sh
today() {
    echo -n "Today's date is: "
    date +"%A, %B %-d, %Y"
}
# same as
function today {
    echo -n "Today's date is: "
    date +"%A, %B %-d, %Y"
}
```

A function local variables can be declared by appending `local` before it, like this: `local argc=0`

<br/>

### Here Script

A **here script** (a.k.a. **here document**) is an additional form of **I/O redirection**.

It provides a way to include content that will be given to the standard input of a command.

```sh
command << token
content to be used as the command's standard input
more lines here... until
token
```

`token` can be any string of characters, by convention is `EOF`

Another trick to have the here script ignoring the leading `tabs` (not spaces) is by writing it this way:

```sh
command <<- token
  line1
  line2
  ...
token
```

<br/>

### Variables

define and use a variable:

```sh
var_name="value" # to define
$var_name # to use it
```

Rules for variables:

- names must start with a letter
- names contain no embedded spaces; use underscores instead
- names cannot use punctuation marks

**Environment Variables**

use `printenv` to view all environment variables loaded by shell

These environment variables can be accessed directly in the shell script running within current shell session.

Environment variables names are uppercase by convention.

**Inline commands**

- we can have shell substitute the results of a command to existing script by using: `$(command_here)`
- can also assign the result of a command to a variable: `var_1=$(command_here)`
- variables inside `$(())` don't need a '$'
- Variables can be directly replaced with its value inside "" quoted strings, like so `"Today's date: $date"`

<br/>

### Control flow

An **if/else block**

```sh
if (condition_expression); then
  commands...
elif (condition_expression); then
  commands...
else
  commands...
fi
```

An **switch/case block**

```sh
case $character in
  1 ) echo "character is: 1" ;;
  2 ) echo "character is: 2" ;;
  3 ) echo "character is: 3" ;;
  4|5|6 ) echo "character matched one of: 4 5 6" ;;
  * ) echo "character matched to be anything else" ;;
esac
```

**Loops: while, until, and for**

An **while block**

```sh
number=0
while [ "$number" -lt 10 ]; do
  echo "Number = $number"
  number=$((number + 1))
done
```

An **until block** does exact the same thing as the while example

```sh
number=0
until [ "$number" -ge 10 ]; do
  echo "Number = $number"
  number=$((number + 1))
done
```

An **for block** assigns a word form a list of words to the specified variable, executes the commands, repeats until all words are exhausted.

```sh
for variable in words; do
  commands
done
```

**for** treats a string of text as a list of words by breaking by space chars

```sh
count=0
for i in $(cat ~/.bash_profile); do
  count=$((count + 1))
  echo "Word $count ($i) contains $(echo -n $i | wc -c) characters"
done
```

**Exit Status**: a zero exit-code indicates **success** by convention.

- Exit status can be examined by variable `$?` after running a program/script.
- Shell provides `true` and `false` commands that do nothing except terminate with either a zero or one exit status
- `exit` command causes the script to terminate immediately and set the exit status to a value, like this `exit 5`

**test/assertion**

`test` command is used most often as the condition check command. If the given expression is true, `test` exits with status 0; otherwise it exits with status 1.

```sh
test expression
# is the same as
[ expression ] # spaces are required!!
# or
[[ expression ]] # spaces are required!! also use this everywhere, it is better than [ ]
```

Most cases test can be used as a shortcut for `if`, like this `test -e path_to_file && echo "exist" || echo "not exist"`

In the `if` statement, a exit code of 0 evaluated as 'true' while other exit codes are evaluated as 'false'

```sh
if [ -f .bash_profile ]; then
    echo "You have a .bash_profile. Things are fine."
else
    echo "Yikes! You have no .bash_profile!"
fi
```

*;* the semicolon allows command statements to appear on the same line.

A full list of **`test` options**

option - | - meaning
-------- | ---------
`-e` | exists?
`-f` | is a **file**?
`-d` | is a **directory**?
`-b` | is a block device?
`-c` | is a character device?
`-S` | is a Socket file?
`-P` | is a FIFO (pipe) file?
`-L` | is a link?
`-r` | **read privilege**?
`-w` | **write privilege**?
`-x` | **execute privilege**?
`-u` | having SUID property?
`-g` | having SGID property?
`-k` | having sticky bit?
`-s` | **exists and non empty**?
`$file1 -nt $file2` | file1 newer than file2?
`$file1 -ot $file2` | file1 older than file2?
`$file1 -ef $file2` | file1 the same file as file2? check whether they point to the same **inode**
`$n1 -eq $n2` | strings equal?
`$n1 -ne $n2` | strings not equal?
`$n1 -gt $n2` | greater than?
`$n1 -lt $n2` | less than?
`$n1 -ge $n2` | greater than or equal?
`$n1 -le $n2` | less than or equal?
`-z string` | whether string is empty?
`-n string` | whether string is not empty?
`test $var1 == $var2` | var1 is the same as var2?
`test $var1 != $var2` | var1 is not the same as var2?
`-a` | **and**, same as `&&`
`-o` | **or**, same as `||`
`!` | **not**

<br/>

### I/O Redirection

redirect output of commands to files, devices, and input of other commands.

**Std I/O**

- `ls > file.txt` write output to file.txt, create if not exist
- `ls >> file.txt` append output to file.txt, create if not exist
- `sort < file.txt` redirect file.txt contents to command `sort` as input
- `ls -l | less` piping output of `ls` to program `less` as input

Whenever a new program is run on the system, the kernel creates a table of **file descriptors** for the program to use.

- File descriptors are **pointers** to files.
- By convention, **descriptors** `0 (STDIN)`, `1 (STDOUT)`, and `2 (STDERR)` are available.
- Initially, all three descriptors point to the _terminal device_ (which the system treats as a read/write file)
- **Redirection** is the process of manipulating the file descriptors so that input and output can be routed from/to different files.
- the shell assumes we want to redirect standard output if the file descriptor is omitted.

```sh
command > file
command 1> file
# the above two are equivalent, so as the following two lines
command < file
command 0< file
```

**Duplicating File Descriptors**

- i.e. `command 1> file 2>&1` to achieve sending both STDOUT and STDERR to the _file_
    - first redirects STDOUT to 1, which is to the _file_
    - then redirects STDERR to 1 (the _file_)

**Create additional File Descriptors**

```sh
exec 3> some_file.txt # Open new file descriptor 3
command 1>&3 # redirect STDOUT to file descriptor 3
exec 3>&- # Close file descriptor 3
```

**Debug Mode**

- Simply include `#!/bin/bash -x` at the beginning of the file.
- Alternatively, use `set -x` to turn tracing on and `set +x` to turn tracing off.

<br/>

### Take user inputs

`read` command takes input from the keyboard

- if `-s` option is passed, user's typing will not be displayed
- if `-t` option is passes, user has only specified seconds to enter the information.
- `read text` will store user's input into variable `text`
- `read -p "prompt\t" var` will print a prompt before asking

<br/>

### Positional parameters

- these are special variables `$0 through $9` that contain the contents of the command line arguments
- `$?` contains the exit status of last executed command/script
- `$#` contains the number of items on the command line in addition to the name of the command `$0`
- `shift` is a shell built-in that operates on the positional parameters.
    - Each time calling `shift`, the arguments `$2` becomes `$1`, `$3` becomes `$2`, so on.
    - `shift` can follow a number, `shift 3` means move and discard 3 arguments

```sh
while [ "$1" -ne "" ]; do
  echo "Parameter 1 equals $1"
  echo "now have $# positional parameters"
  shift
done
```

<br/>

### Error Handling

- One trivial way is to check `$?` for status of last command
- alternatively, can directly check the command's exit code in the `if [ command ]; then`

```sh
error_exit()
{
	echo "$1" 1>&2
	exit 1
}
if cd $some_directory; then
	rm *
else
	error_exit "Cannot change directory!  Aborting."
fi
```

here `$1` in `error_exit()` function is the first argument

By using `&&` or `||` can simplify the above example to the following:

```sh
cd $some_directory || error_exit "Cannot change directory! Aborting"
rm *
# or simply
cd $some_directory && rm *
```

A more slicker example of `error_exit` function:

```sh
PROGNAME=$(basename $0)
error_exit()
{
	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}
```

As shown before, the `1:-` means if variable `$1` is undefined, a default value "Unknown Error" is used.

<br/>

### Signals and Traps

Errors are not the only way a script can terminate unexpectedly. Signals can do too.

**SIGINT** is a signal sent to the script when user pressed `ctrl-c` in the middle of the program execution

`trap` is the command allows you to execute a command/function when a signal is received by your script

- `trap <arg> <signals>`
- `<signals>` is a list of signals to intercept
- `<arg>` is a command or function to execute when one of the signals is received.
- i.e. `trap "rm $TEMP_FILE; exit" SIGHUP SIGINT SIGTERM`
- The signals can be specified by number as well.
    - signal `9 (SIGKILL)` however, cannot be handled.
    - many programs create **lock files** to prevent multiple copies of the program running at the same time.
    - A program killed by `SIGKILL` doesn't get the chance to remove the lock file, which has to be manually removed for restarting the program
- it is better to write a function that does the clean up, and pass it to `trap`: `trap clean_up SIGHUP SIGINT SIGTERM`

A best practice in shell scripting is to use **absolute path** instead of **relative path** to ensure the correctness!
