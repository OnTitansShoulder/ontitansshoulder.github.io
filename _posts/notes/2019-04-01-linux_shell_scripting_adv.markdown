---
layout: note_page
title: Advanced Linux Shell Scripting
title_short: linux_shell_scripting_adv
dateStr: 2019-04-01
category: Linux
tags: notes reference
---
# Writing Shell Scripts

Again, thanks to William Shotts Jr. from linuxcommand.org for this great educational resource.

## Why are we doing shell scripting

there is no way to remember every command and every option associated with it. The real power is to know how to quickly learn from man page and write scripts to do what you need to do.

A shell script is a file containing a series of commands.

#### Getting to Work

```
#!/bin/bash
# A HelloWorld program for shell script
echo "Hello World!"
```
the first line is called a *shebang*, indicating what program is used to interpret the script. Other scripting languages such as Perl, awk, tcl, Tk, and python also use this mechanism.
the second line is a comment.

After setting file permission with `chmod 755 script_name`, a shell script can be run using `./script_name`.

**PATH**
If a directory need to be added to the PATH var, do `export PATH=$PATH:directory`.
It is better to add this line to the *.bash_profile* or *.profile* file in your home directory.
Linux encourage each user to have a specific directory for programs the user personally uses, *bin* in the user's home directory. This is automatically included in the PATH var.

#### Editing Shell Scripts

**environment**
The Linux environment contains your path, your user name, etc. A complete list of the environment entries can be viewed using the command *set*.
Two types of commands are often contained in the environment: aliases and shell functions.
Login shells read one or more startup files:
File|Contents
----|--------
/etc/profile|A global configuration script that applies to all users.
~/.bash_profile|A user's personal startup file. Can be used to extend or override settings in the global configuration script.
~/.bash_login|If ~/.bash_profile is not found, bash attempts to read this script.
~/.profile|If neither ~/.bash_profile nor ~/.bash_login is found, bash attempts to read this file.

Non-login shell sessions read the following:
File|Contents
----|--------
/etc/bash.bashrc|A global configuration script that applies to all users.
~/.bashrc|A user's personal startup file. Can be used to extend or override settings in the global configuration script.

**Creating alias**
alias for longer commands can be set using `alias today='date +"%A, %B %-d, %Y"'`

**Creating shell functions**
```
today() {
    echo -n "Today's date is: "
    date +"%A, %B %-d, %Y"
}
or
function today {
    echo -n "Today's date is: "
    date +"%A, %B %-d, %Y"
}
```
function local variables can be declared by appending `local` before it, like this:
`local argc=0`

#### Here Script

A here script (a.k.a. here document) is an additional form of I/O redirection.
It provides a way to include content that will be given to the standard input of a command.
```
command << token
content to be used as the command's standard input
more lines here... until
token
```
token can be any string of characters, traditionally is _EOF_
Another trick to have the here script ignoring the leading *tabs* (not spaces) is by writing it this way:
```
command <<- token
lines here...
token
```
- *echo* command with "" quotations can span more than one line, and insert carriage returns

#### Variables

define and use a variable:
```
var_name="value" # to define
$var_name # to use it
```
Rules for variables:
- names must start with a letter
- names contain no embedded spaces; use underscores instead
- names cannot use punctuation marks

**Environment Variables**
use *printenv* to view all environment variables loaded by shell
These environment variables can be accessed directly in the shell script running within current shell session.
Environment variables names are uppercase by convention.

**Inline commands**
we can have shell substitute the results of a command to existing script by using: `$(command_here)`
- can also assign the result of a command to a variable: `var_1=$(command_here)`
- variables inside `$()` don't need a '$'
Variables can be directly replaced with its value inside "" quoted strings, like so `"Today's date: $date"`
Variables with all UPPERCASE letter name should be treated as constants.

#### Shell Functions

- inside a shell script, functions can be invoked by just using its name, or using `$(func_name)`
- shell commands can be called within functions simply with the command name.
- functions must be defined before using them.

*uptime* to check length of time the system has been "up" (running) since its last re-boot, the number of users and recent system load.
*df* to get a summary of the drive space used by mounted file systems.
*du* lists each file's size in a directory. `du -s /dir/* | sort -nr`

**Control flow, branching**
*if/else block*
```
if commands; then
commands...
[elif commands; then
commands...]
[else
commands...]
fi
```
*switch/case block*
```
case $character in
  1 ) echo "entered: 1" ;;
  2 ) echo "entered: 2" ;;
  3 ) echo "entered: 3" ;;
  * ) echo "invalid"
esac
```
case word in
  patterns ) commands ;;
esac
- multiple patterns can be separated by the '|' character
- '\*' will match anything

**Loops: while, until, and for**
*while*
```
number=0
while [ "$number" -lt 10 ]; do
  echo "Number = $number"
  number=$((number + 1))
done
```
*until*
```
number=0
until [ "$number" -ge 10 ]; do
  echo "Number = $number"
  number=$((number + 1))
done
```
does exact the same thing as the while example
*for*
```
for variable in words; do
  commands
done
```
*for* assigns a word form a list of words to the specified variable, executes the commands, repeats until all words are exhausted. Another example:
```
count=0
for i in $(cat ~/.bash_profile); do
  count=$((count + 1))
  echo "Word $count ($i) contains $(echo -n $i | wc -c) characters"
done
```
*for* can use the positional parameters as the list of words:
```
for i in "$@"; do
  echo $i
done
```
`$@` here contains the list of command line arguments

**Exit Status**
A zero exit-code indicates success by convention.
Exit status can be examined by variable `$?` after running a program/script.
Shell provides *true* and *false* commands that do nothing except terminate with either a zero or one exit status
*exit* command causes the script to terminate immediately and set the exit status to a value, like this `exit 5`

**test/assertion**
*test* command is used most often with the *if* command.
```
test expression
# alternative form
[ expression ] # spaces are required!!
```
if the given expression is true, *test* exits with status 0; otherwise it exits with status 1.
```
if [ -f .bash_profile ]; then
    echo "You have a .bash_profile. Things are fine."
else
    echo "Yikes! You have no .bash_profile!"
fi
```
In the case above, [  ] evaluates an expression and with exit-code 0 as success/true so the first block is executed.
*;* the semicolon allows command statements to appear on the same line.
*test* can also check whether a file/directory exists, by `test -e path_to_file && echo "exist" || echo "not exist"`
*id* command tells who the current user is.
```
if [ $(id -u) != "0" ]; then
    echo "You must be the superuser to run this script" >&2
    exit 1
fi
```
the *>&2* at the end is another form of I/O redirection. It will direct the message to standard error instead of standard output.

```
[ "$yn" == "Y" -o "$yn" == "y" ]
# these two are interchangeable
[ "$yn" == "Y" ] || [ "$yn" == "y" ]
```

A full list of *test* options

option|meaning
------|-------
-e|exists?
-f|is a file?
-d|is a directory?
-b|is a block device?
-c|is a character device?
-S|is a Socket file?
-P|is a FIFO (pipe) file?
-L|is a link?
-r|read privilege?
-w|write privilege?
-x|execute privilege?
-u|having SUID property?
-g|having SGID property?
-k|having sticky bit?
-s|exists and non empty?
file1 -nt file2|file1 newer than file2?
file1 -ot file2|file1 older than file2?
file1 -ef file2|file1 the same file as file2? check whether they point to the same inode
n1 -eq n2|equal
n1 -ne n2|not equal
n1 -gt n2|greater than
n1 -lt n2|less than
n1 -ge n2|greater than or equal
n1 -le n2|less than or equal
test -z string|whether string is empty
test -n string|whether string is not empty
test str1 == str2|whether str1 is the same as str2
test str1 != str2|whether str1 is not the same as str2
-a|and
-o|or
!|not

*Variable String Length*
use `${#Var_Name}` to get the string length of a variable.

**I/O Redirection**
Whenever a new program is run on the system, the kernel creates a table of file descriptors for the program to use.
- File descriptors are pointers to files.
- By convention, descriptors 0 (stdin), 1 (stdout), and 2 (stderr) are available.
- Initially, all three descriptors point to the terminal device (which the system treats as a read/write file)
- Redirection is the process of manipulating the file descriptors so that input and output can be routed from/to different files.
- the shell assumes we want to redirect standard output if the file descriptor is omitted.
```
command > file
command 1> file
# the two are equivalent, so as the following two lines
command < file
command 0< file
```
*Duplicating File Descriptors*
```
command 1> file 2>&1
```
this line redirects stdout to a *file* and then redirects stderr to 1 (not stdout anymore), which is the *file*, to achieve both stdout and stderr going to the *file*
*Additional File Descriptors*
```
exec 3> some_file.txt # Open file descriptor 3
exec 3>&- # Close file descriptor 3
```

**Debug Mode**
Simply include `#!/bin/bash -x` at the beginning of the file.
Alternatively, use `set -x` to turn tracing on and `set +x` to turn tracing off.

#### Take user inputs

*read* command takes input from the keyboard
  - if -s option is passed, user's typing will not be displayed
  - if -t option is passes, user has only specified seconds to enter the information.
  - `read text` will store user's input into variable `text`
  - `read -p "prompt\t" var` will print a prompt before asking
*echo* with option -n will not put a line break at the end of output.

**Arithmetic operations**
`+ - * / % **(exponential function)` are supported by shell script.

#### Positional parameters

- these are special variables `$0 through $9` that contain the contents of the command line
- remember `$?` contains the exit status of last executed command/script?
- `$#` contains the number of items on the command line in addition to the name of the command `$0`
- *shift* is a shell built-in that operates on the positional parameters. Each time you call `shift`, the arguments `$2` becomes `$1`, `$3` becomes `$2`, so on.
  - *shift* can follow a number, `shift 3` means move and discard 3 arguments

```
while [ "$1" != "" ]; do
  echo "Parameter 1 equals $1"
  echo "now have $# positional parameters"
  shift
done
```
*find* is used to search for files or directories that meet specific criteria.
*wc* gives some stats about a string of text
*uname* gives some info about the system
*head* gives some lines of text from the beggining of a file

#### Error Handling

- One trivial way is to check `$?` for status of last command
- alternatively, can directly check the command's exit code in the `if [condition]; then`

```
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
- by using `&&` or `||` can simplify the above if/else by the following:
```
cd $some_directory || error_exit "Cannot change directory! Aborting"
rm *
```
or
```
cd $some_directory && rm *
```
A more slicker example of `error_exit` function:
```
PROGNAME=$(basename $0)
error_exit()
{
	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}
```
Note the `1:-` means if variable `$1` is undefined, a default value \"Unknown Error\" is used.

#### Signals and Traps

Errors are not the only way a script can terminate unexpectedly. Signals can do too.
**SIGINT** is a signal sent to the script when user pressed ctrl-c in the middle of the program execution
*trap* is the command allows you to execute a command when a signal is received by your script
`trap arg signals`
“signals” is a list of signals to intercept and "arg" is a command to execute when one of the signals is received:
`trap "rm $TEMP_FILE; exit" SIGHUP SIGINT SIGTERM`
- The signals can be specified by number as well.
- signal 9: kill, SIGKILL however, cannot be handled.
  - many programs create *lock* files to prevent multiple copies of the program running at the same time.
  - A program killed by SIGKILL doesn't get the chance to remove the lock file, which has to be manually removed for restarting the program
- it is better to write a function that does the clean up, and pass it to *trap*: `trap clean_up SIGHUP SIGINT SIGTERM`

`$$` is a shortcut giving current program's PID
`$RANDOM` is a fast way to get a random number b/w 0-99999
`pr` prepares some text for printing, adding header/footer

**Path**
Shell scripts should use absolute path instead of relative path to ensure the correctness!

#### Some good habits writing shell scripts

P449 Book
