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
**Execution Control**

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

### Beautify Terminal Outlook
