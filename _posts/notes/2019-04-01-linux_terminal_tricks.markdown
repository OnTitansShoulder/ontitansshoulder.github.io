---
layout: note_page
title: Linux Terminal Tricks
title_short: linux_terminal_tricks
dateStr: 2019-04-01
category: Linux
tags: notes cheatsheet check
---
Some things I found useful when using Linux terminal.

<br/>
### Execution Control

Command - | - Description
--------- | -------------
`Enter` | causes the current command line to be accepted
| Cursor location within the line does not matter
| If the line is not empty, it is added to the command history
`Esc` | Meta-prefix. If the Alt key is unavailable, the Esc key can be used in its place
`Ctrl-g` | Abort the current editing command
`Ctrl-_` | Incrementally undo changes to the line
`Alt-r` | Revert all changes to the line
`Ctrl-l` | **Clear the screen**
`Ctrl-c` | **interrupt current execution**
`Ctrl-r` | **back-ward search commands saved in history**

<br/>
**Editing Control**

Command - | - Description
----------|--------------
`Alt-f / Alt-rightkey` | **move forward one word**
`Alt-b / Alt-leftkey` | **move backward one word**
`Ctrl-a` | **move to beginning of the line**
`Ctrl-e` | **move to end of the line**
`Ctrl-u` | **delete chars up to the beginning of the line**
`Ctrl-k` | **delete chars up to the ending of the line**

<br/>
**Text Transformation**

Command - | - Description
----------|--------------
`Alt-u` | Change the current word to uppercase.
`Alt-l` | Change the current word to lowercase.
`Alt-c` | Capitalize the current word.
`Alt-t` | Transpose words. Exchange the word at the point with the word preceding it.
`Alt-.` | recall the last argument from the previous command's argument list

<br/>
### Beautify Terminal Outlook

Modify the `~/.bashrc` to set a preferred terminal style.

The `$PS1` bash env var represents the primary prompt string which is displayed when the shell is ready to read a command.

It takes the form of `PS1="[\u@\H \W] \$ "`

Find the full documentation of supported special chars in `man bash`, at the section _PROMPTING_. Here are some of them that is frequently used:

Char - | - Description
------ | -------------
`\u` | username of current user
`\h` | hostname up to the first dot in this machine's domain name
`\H` | display the Full Qualified Domain Name (FQDN)
`\W` | basename of current working directory
`\$` | if root display '#', else display '$'
`\!` | display the history number of current command
`\D{<date-format>}` | add formatted time of current timestamp

<br/>
You can change 3 aspects of the terminal outlook:

Text Format - | - Text color - | - Text-background color
------------- | -------------- | -----------------------
0: normal text | 30: black | 40: black
1: bold | 31: red | 41: red
4: underlined | 32: green | 42: green
| 33: yellow | 43: yellow
| 34: blue | 44: blue
| 35: purple | 45: purple
| 36: cyan | 46: cyan
| 37: white | 47: white

<br/>
To modify the text with the styles, use a format of `\e[<bg-color>;<format>;<txt-color>m`

If you need to change multiple parts of the prompt to use different styles, then use multiple `\e[;;m` followed by the parts.

`PS1="\e[41;4;33m[\u@\h \W] \$ "`

<br/>
### Useful aliases

**Colorize/prettify some commands output**
```sh
alias diff='colordiff' # need to install
alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'
alias grep='grep --color=auto'
alias ls='ls --color=auto'
alias ct='column -t'
alias dfc='df -hPT | column -t'
alias mountc='mount | column -t'
```

**Quick cd**
```sh
alias ..='cd ..'
alias 2..='cd ../../'
alias 3..='cd ../../../'
alias 4..='cd ../../../../'
```

**Datetime**
```sh
alias d='date +%F'
alias t='date +%T'
alias dt='date +"%F %T"'
alias now='date +"[%F %T]"'
```
