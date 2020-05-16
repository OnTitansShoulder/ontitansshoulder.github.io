---
layout: note_page
title: Linux Terminal Tricks
title_short: linux_terminal_tricks
dateStr: 2019-04-01
category: Linux
categories: notes reference
---
#### Some Quick Terminal shortcuts

**Control Commands**

Command|Description
-------|-----------
Enter|causes the current command line to be accepted. Cursor location within the line does not matter. If the line is not empty, it is added to the command history.
Esc|Meta-prefix. If the Alt key is unavailable, the Esc key can be used in its place.
Ctrl-g|Abort the current editing command.
Ctrl-\_|Incrementally undo changes to the line.
Alt-r|Revert all changes to the line (i.e., complete undo).
Ctrl-l|Clear the screen.

**Moving Around**

Command|Description
-------|-----------
Alt-f|move forward one word
Alt-b|move backward one word
Ctrl-a|move to beginning of the line
Ctrl-e|move to end of the line

**Changing Text**

Command|Description
-------|-----------
Alt-u|Change the current word to uppercase.
Alt-l|Change the current word to lowercase.
Alt-c|Capitalize the current word.
Alt-t|Transpose words. Exchange the word at the point with the word preceding it.
Alt-.|recall the last argument from the previous command's argument list
