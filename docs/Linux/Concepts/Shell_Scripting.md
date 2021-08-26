
## Shell Scripting

**Advantages** of shell scripting:

- automate tasks and reduce risk of errors
- combine long and repetitive sequences of commands into a single command
- share procedures among several users
- provide controlled interface to users
- create new commands using combination of utilities and logic
- quick prototyping, no compilation

The **first line** of a shell script, which starts with `#!`, contains the full path of the **command interpreter**. Commonly used script interpreters:

- /usr/bin/perl
- /bin/sh, include its varieties:
    - /bin/bash
    - /bin/csh
    - /bin/tcsh
    - /bin/ksh
    - /bin/zsh
- /usr/bin/python

A shell script can be started with `bash`, or `./script_name` or `full_path_to_script` when the user executing it has the priviledge to execute it.

Basic syntax and special characters:

| Character | Description |
| --------- | ----------- |
|`#`|Used to add a comment, except when used as \#, or as #! when starting a script|
|`\`|Used at the end of a line to indicate continuation on to the next line|
|`;`|Used to interpret what follows as a new command to be executed next|
|`$`|Indicates what follows is an environment variable|
|`>`|Redirect output|
|`>>`|Append output|
|`<`|Redirect input|
|`|`|Used to pipe the result into the next command|

All shell scripts generate a **return value** (stored in `$?` shell variable) upon finishing execution, which can be explicitly set with the `exit` statement. Return values permit a process to monitor the exit state of another process to take actions for different scenarios.

Use the concatenation operator `\` (the backslash character) to split long commands over **multiple lines**, but still executed as one command.

The `;` (semicolon) character is used to separate commands and execute them **sequentially** regardless the return value of each command. If subsequent commands run only when **previous command succeeds** (return value 0), use the `&&` (and) operator to chain the commands. The `||` (or) runs a chain of commands until one succeeds (return value 0).

**Chaining commands** is noNOTt the same as piping them; with piped commands, succeeding commands begin operating on data streams produced by earlier ones before they complete, while in chaining each step exits before the next one starts.

Shell scripts always have access to applications such as `rm, ls, df, vi, gzip` (aka **shell built-ins** full list can be viewed by `help` command), which are programs compiled from lower level programming languages such as `C`. Other compiled applications are binary executable files residing in `/usr/bin`.

Within a script, the parameter or an argument is represented with a `$` and a **number** or **special character**. `$0` is the script name; `$1 $2 ...` is the first, second, ... argument; `$*` has all arguments; `$#` has number of arguments.

You may need to **substitute the result of a command** as a portion of another command, using `$()` or within backticks ```(`)``` so that the specified command will be executed in a newly launched shell environment, and the **standard output** of the shell will be inserted where the command substitution is done.

Get a list of environment variables with the `env, set, printenv` commands. By default, the variables created within a script are available only to the **subsequent steps** of that script.

Any **child processes** (sub-shells) do NOT have automatic access to the values of these variables; to make them available, `export` the variables. Typing `export` with no arguments will give a list of all currently exported environment variables.

A **function** is a code block that implements a set of operations. Functions are useful for executing procedures multiple times, perhaps with varying input variables (the first argument can be referred to as $1, the second as $2, and so on).

```sh
function_name () {
   command...
}
```

The **if statement** takes actions depend on the evaluation of specified conditions. In  bash scripts, the `condition` block uses double brackets instead of single brackets (supported by sh), which allows more enhanced conditional syntax.

```sh
if condition
then
    statements
elif condition2
    statements
else
    statements
fi

# compact form
if TEST-COMMANDS; then CONSEQUENT-COMMANDS; fi
```

Some condition **operators on files** in this table. Full list of conditions use `man 1 test`. Boolean expressions operators are no surprise `&& || !`

| Condition | Meaning |
| --------- | ------- |
|`-e file`|Checks if the file exists.|
|`-d file`|Checks if the file is a directory.|
|`-f file`|Checks if the file is a regular file (i.e. not a symbolic link, device node, directory, etc.)|
|`-s file`|Checks if the file is of non-zero size.|
|`-g file`|Checks if the file has sgid set.|
|`-u file`|Checks if the file has suid set.|
|`-r file`|Checks if the file is readable.|
|`-w file`|Checks if the file is writable.|
|`-x file`|Checks if the file is executable.|

When **comparing numbers**, use `-gt -lt -ge -le -eq -ne`; **comparing strings** ue `== !=` or `> < ` for their sorting order.

For **arithmetic** expressions, use `$(())`, `let` shell built-in, or `expr` utility. i.e. `X=$(expr $ARG + 8)` is same as `X=$((ARG + 8))` and same as `let X=( $ARG + 8 )`.

A **string** variable contains a sequence of text characters. It can include letters, numbers, symbols and punctuation marks. Access string length with `${#VAR_NAME}`.

To **extract** the first n characters of a string we can specify: `${string:0:n}`; To extract all characters in a string after a dot (.), use the following expression: `${string#*.}`, so anything after `#*` is the pattern we are looking for.

The **case statement** is used in scenarios where the actual value of a variable can lead to different execution paths, usually used for handling command-line options. It is readable and easy to compare many values at once.

```sh
case expression in
   pattern1 ) execute commands;;
   pattern2 ) execute commands;;
   pattern3 ) execute commands;;
   pattern4 | pattern5 | pattern6 ) execute commands;;
   * )       execute some default commands or nothing ;;
esac
```

There are three types of **loop constructs**, `for, while, until`.

```sh
# for must operate on each item in a list of items
for variable-name in list # list can be a variable, a command, or hard-coded values separated by space
do
    execute one iteration for each item in the list until the list is finished
done

# while loop goes on as long as condition is evalutated as true
while condition
do
    Commands for execution
    ----
done

# until loop goes on as long as condition is evalutated as false
until condition
do
    Commands for execution
    ----
done
```

A command (without brackets) can be used as **condition** so that its **return value** is evaluated: 0 is true and other values are false.

**Debugging bash scripts** either by running it with `bash -x ./script` or bracketing parts of the script code with `set -x` and `set +x`. The debug mode traces and prefixes each command with the `+` character, and prints each command's output.

**Temporary files** (and directories) are meant to store data for a short time. Usually, one should arrange it so that these files disappear when the program using them terminates.

To do so use the `mktemp` utility. i.e. `TEMP=$(mktemp /tmp/tempfile.XXXXXXXX)` and for temp dir `TEMPDIR=$(mktemp -d /tmp/tempdir.XXXXXXXX)`. `XXXXXXXX` is replaced by mktemp with **random characters** to ensure the name of the temporary file cannot be easily predicted and is only known within your program.

It is often useful to generate random numbers and other random data for certain tasks. Such random numbers can be easily generated (from the entropy pool) by using the `$RANDOM` **environment variable**.

`/dev/random` is used where very **high quality randomness** is required, such as one-time pad or key generation, but it is relatively slow to provide values. `/dev/urandom` reuses the internal pool to produce more **pseudo-random bits**.

