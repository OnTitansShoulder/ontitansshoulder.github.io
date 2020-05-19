---
layout: note_page
title: Linux Vim How to Use It
title_short: linux_vim_tricks
dateStr: 2019-04-01
category: Linux
tags: notes reference
---
All Unix-like system have *vi*, but not necessarily other editors
*vim* is an advanced version of vi, which supports syntax highlighting and helping software development.

#### use vi/vim

*vi* has three modes:
- *standard mode*, used when opening a file with vi, can use commands to move cursor, delete, copy, paste, and search and replace!
- *insert mode*, entered after pressing [i, I, o, O, a, A, r, R] during standard mode
- *command line mode*, entered after pressing [:, /, ?], where you can search, read/write, or any other actions can be taken.

**Moving cursors:**

Key Pressing|Function
------------|--------
h or left-arrow|move left
j or down-arrow|move down
k or up-arrow|move up
l or right-arrow|move right
type number N then hjkl|move N times in that direction
ctrl-f|page down
ctrl-b|page up
ctrl-d|half page down
ctrl-u|half page up
+|move cursor to next non empty line
-|move cursor to previous non empty line
[type number N]\[space]|move cursor right N times
0 or [Home]|move to the front of this line
$ or [End]|move to last point of this line
H|move to the first line first character of current view-port
M|move to the middle line first character of current view-port
L|move to the last line first character of current view-port
G|move to the last line of this file
nG|move to the nth line of this file
gg|move to the first line of this file
[type number N]\[enter]|move cursor down for N lines

**Search and Replace**

Key Pressing|Function
------------|--------
/word|move down and search for 'word'
?word|move up and search for 'word'
n|repeat last search action
N|repeat last action in reversed searching direction
:n1,n2s/word1/word2/g|find and replace! search for word1 between line n1 and n2 and replace them with word2
:1,$s/word1/word2/g|find and replace from begin to the end of this file
:1,$s/word1/word2/gc|find and replace from begin to the end, and asking for confirmation for each match!

**Delete, Copy, and Paste**

Key Pressing|Function
------------|--------
x, X|x delete a char from right of cursor like [del], X delete one from left like [Backspace]
nx|delete n chars from right
dd|delete current line
ndd|delete n lines after cursor
d1G|delete all lines from cursor to the beginning of the file
dG|delete all lines from cursor to the end of the file
d$|delete all chars from cursor to end of the line
d0|delete all chars from cursor to start of the line
yy|copy the line at the cursor
nyy|copy n lines after cursor
y1G|copy all lines from cursor to the beginning of the file
yG|copy all lines from cursor to the end of the file
y0|copy all chars from cursor to start of the line
y$|copy all chars from cursor to end of the line
p, P|p pastes on next line after cursor, P pastes on line before cursor
J|merge cursor line with next line
u|undo previous action
ctrl-r|redo previous action
.|repeat last action

**switch modes**

Key Pressing|Function
------------|--------
i, I|enter insert mode from current cursor
a, A|enter insert mode, a is from next position of cursor, A is from last position of current line
o, O|enter insert mode, o is insert a new line after cursor, O is insert a new line before cursor
r, R|enter replace mode, r is replacing cursor char once, R is to keep replacing cursor char until ESC pressed

**Save, quit, and line_numbers**

Key Pressing|Function
------------|--------
:w|write into filesystem
:q|quit the editor
:q!|quit without saving
ZZ|quit and ensure any edits saved
:w [filename]|save as
:r [filename]|read in contents from another file
:n1,n2 w [filename]|save lines between n1 and n2 as another file
:! [command]|temporarily leave vi and see shell command results
:set nu|display line numbers
:set nonu|cancel displaying line numbers

In vi, numbers are very meaningful as they represent the number of times a certain directive is repeated.
- i.e. `50dd` means delete 50 lines from cursor
- i.e. `20j` means move down 20 lines

#### vim features

**Visual Block** P344 Book
Allows us to select things spanning lines
Great feature to have, even some modern IDE doesn't have this!

Key Pressing|Function
------------|--------
v|select single chars where cursor passes
V|select lines where cursor passes
ctrl-v|select rectangular blocks where cursor specifies
y|copy selected area
d|delete selected area

**Multi-file editing** P345 Book
Need to open files on startup of vim command, like this `vim hosts /etc/hosts`

Key Pressing|Function
------------|--------
:n|edit next file
:N|edit previous file
:files|show files opened

**Multi-window editing**
This mode allow you to see files side-by-side, very useful!
You can even have three windows at the same time!

Key Pressing|Function
------------|--------
:sp|open a separate window on the bottom side, of the same file
:sp [filename]|open a new file on the bottom side
ctrl-w, then j OR downarrow|move to the window below
ctrl-w, then k OR uparrow|move to the window above
ctrl-w, then q|quit current window split
:q|can quit one of the window as well, like above

**Vim env config setting**
your behavior is automatically recorded by vim, and saved at ~/.viminfo

Key Pressing|Function
------------|--------
:set nu/nonu|set or cancel line number
:set hlsearch/nohlsearch|high light search or not to
:set autoindent/noautoindent|autoindent or not to
:set backup/nobackup|auto file backup or not (backed up will be [filename]~)
:set ruler/noruler|ruler shows the portion of current viewing portion in the file
:set showmode/noshowmode|whether to show --INSERT-- mode etc.
:set backspace=(0/1/2)|0 or 1 means can't backspace; 2 means can backspace anything
:set all|show all current config parameters
:set|show values different from default values
:syntax on/off|whether to turn on/off syntax highlighting
:set bg=dark/light|show color differently

Above preferences doesn't save unless you have a ~/.vimrc file. Write a file like this:
```
set hlsearch
set backspace=2
set autoindent
set ruler
set showmode
set nu
set bg=dark
syntax on
```
![vim_cheatsheet](vim_cheatsheet.png)

**Chinese Character become mess?**
Traditional Chinese characters can be encoded into big5 or utf8. If the file encode and the display decoder doesn't match, random chars can be shown. Things may be related:
1. Linux system default supported language data: /etc/sysconfig/i18n
2. bash: LANG var
3. file's original encode
4. software that opened the file

Usually Windows XP files use big5 by default.
Set terminal `LANG=zh_TW.big5`

**DOS and Linux linebreak**
use `cat -A` can see linebreak char of a file.
DOS file lines end with ^M, we call CR (^M) and LF($); Linux only have LF ($) as linebreak char.
We can convert it using *dos2unix* or *unix2dos* commands!
`uix2dos [-kn] filename [newfile_name]`
-k: keep file original mtime format (not update last modified time)
-n: keep old file, make a new file for the converted
