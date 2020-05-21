---
layout: note_page
title: Vim How to Use It
title_short: vim_tricks
dateStr: 2019-04-01
category: Editor
tags: notes cheatsheet check
---
All Unix-like system have *vi*, but not necessarily other editors
*vim* is an advanced version of vi, which supports syntax highlighting and helping software development.

### use vi/vim

*vi* has three modes:
- *standard mode*, used when opening a file with vi, can use commands to move cursor, delete, copy, paste, and search and replace.
- *insert mode*, entered after pressing `i, I, o, O, a, A, r, R` during standard mode
- *command line mode*, entered after pressing `:, /, ?`, where you can search, read/write, or any other actions can be taken.

<br/>
#### Moving cursors

Key Pressing - | - Function
-------------- | ----------
`h` / `left-arrow` | move left
`j` / `down-arrow` | move down
`k` / `up-arrow` | move up
`l` / `right-arrow` | move right
`w` | **jump forwards to the start of a word**
`e` | jump forwards to the end of a word
`b` | **jump backwards to the start of a word**
`numb N` + `hjkl` | **move N times in that direction**
`ctrl` + `f` | **page down**
`ctrl` + `b` | **page up**
`ctrl` + `d` | **half page down**
`ctrl` + `u` | **half page up**
`+` | move cursor to next non empty line
`-` | move cursor to previous non empty line
`numb N` + `[space]` | move cursor right N times
`0` / `[Home]` | **move to the first char of this line**
`^` | **move to the first non-blank char of this line**
`$` / `[End]` | **move to last char of this line**
`H` | **move to the first line first character of current view-port**
`M` | **move to the middle line first character of current view-port**
`L` | **move to the last line first character of current view-port**
`G` | **move to the last line of this file**
`nG` | **move to the nth line of this file**
`gg` | **move to the first line of this file**
`zz` | center cursor on screen
`numb N` + `[enter]` | move cursor down for N lines

<br/>
#### Search and Replace

Key Pressing - | - Function
-------------- | ----------
`/word` | **move down and search for 'word'**
`?word` | **move up and search for 'word'**
`\vword end with period.` | **non-alphanumeric chars are interpreted as special regex symbols, no escaping needed**
`n` | **repeat last search action**
`N` | **repeat last action in reversed searching direction**
`:n1,n2s/word1/word2/g` | find and replace! search for word1 between line n1 and n2 and replace them with word2
`:1,$s/word1/word2/g` | **find and replace from begin to the end of this file**
`:1,$s/word1/word2/gc` | **find and replace from begin to the end, and asking for confirmation for each match**

<br/>
#### Delete, Copy, and Paste

Key Pressing - | - Function
-------------- | ----------
`x, X` | x delete a char from right of cursor like [del], X delete one from left like [Backspace]
`nx` | delete n chars from right
`dd` | **delete current line**
`ndd` | **delete n lines after cursor**
`d1G` | delete all lines from cursor to the beginning of the file
`dG` | delete all lines from cursor to the end of the file
`d$` | **delete all chars from cursor to end of the line**
`d0, D` | **delete all chars from cursor to start of the line**
`yy` | **copy the line at the cursor**
`nyy` | **copy n lines after cursor**
`y1G` | copy all lines from cursor to the beginning of the file
`yG` | copy all lines from cursor to the end of the file
`y0` | copy all chars from cursor to start of the line
`y$` | copy all chars from cursor to end of the line
`p, P` | **p pastes on next line after cursor, P pastes on line before cursor**
`J` | merge cursor line with next line
`u` | **undo previous action**
`ctrl-r` | **redo previous action**
`.` | **repeat last action**

<br/>
#### switch modes

Key Pressing - | - Function
-------------- | ----------
`i, I` | **enter insert mode from current cursor**
`a, A` | enter insert mode, a is from next position of cursor, A is from last position of current line
`o, O` | **enter insert mode, o is insert a new line after cursor, O is insert a new line before cursor**
`r, R` | enter replace mode, r is replacing cursor char once, R is to keep replacing cursor char until ESC pressed
`Esc` | leave current mode

<br/>
#### Save, quit, and line_numbers

Key Pressing - | - Function
-------------- | ----------
`:w` | **write into filesystem**
`:w !sudo tee %` | **save changes to a file that forgot using `sudo vim`**
`:q` | **quit the editor**
`:q!` | **quit without saving**
`ZZ` | quit and ensure any edits saved
`:w [filename]` | **save as another file**
`:r [filename]` | **read in contents from another file**
`:n1,n2 w [filename]` | save lines between n1 and n2 as another file
`:! [command]` | temporarily leave vi and see shell command results
`:set nu` / `:set number` | **display line numbers**
`:set nonu` | **cancel displaying line numbers**

<br/>
### vim features

#### Visual Block

Allows us to select things spanning lines
Great feature to have, even some modern IDE doesn't have this!

Key Pressing - | - Function
-------------- | ----------
`v` | **select single chars where cursor passes**
`V` | **select lines where cursor passes**
`ctrl-v` | **select rectangular blocks where cursor passes**
`o` | move to the other end of marked area
`O` | move to the other corner of block
`ab` | **select the entire block within () where the cursor is**
`aB` | **select the entire block within {} where the cursor is**
`ib` | select the contents of a block within () where the cursor is
`iB` | select the contents of a block within {} where the cursor is
`>` | **add a tab indent to selected block**
`<` | **remove a tab indent to selected block**
`~` | switch case for selected block
`y` | **copy selected area**
`d` | **delete selected area**
**Tip** | for multiple indenting, add a `numb N` before pressing `>` or `<`

<br/>
#### Registers

Registers allows copying

Key Pressing - | - Function
-------------- | ----------
`:reg` | **show registers content**
`:*` | contains contents on clipboard
`:%` | contains current filename
`"xy` | **yank into register 'x' (x could be a digit or a letter)**
`"xp` | **paste contents of register 'x'**
`"xNp` | **paste contents of register 'x' for N times**
**Tip** | registers are stored in ~/.viminfo
| saved registers will be loaded again at next start of vim
**Tip** | Register-0 always contains the value of last yank command

<br/>
#### Marks

Marks allows quickly jump to a saved position in a large file.

Key Pressing - | - Function
-------------- | ----------
`:marks` | list of saved marks
`ma` | set current position for mark 'a'
`` `a `` | jump to position of mark 'a'
`` y`a `` | yank text to position of mark 'a'

<br/>
#### Multi-window editing

This mode allow you to see files side-by-side, very useful!
You can even have three windows at the same time!

Key Pressing - | - Function
-------------- | ----------
`:sp` | **open a split window for the same file on the bottom side of this window**
`:vsp` | **open a split window for the same file on the left side of this window**
`:sp [filename]` | **open a split window for a new file on the bottom side of this window**
`:vsp [filename]` | **open a split window for a new file on the left side of this window**
`ctrl-w, then hjkl OR narrows` | **move to the window in the direction**
`ctrl-w, then w` | **switch windows**
`ctrl-w, then q` | **quit current window split**
`:q` | can quit one of the window as well, like above

<br/>
#### Multi-file editing

Need to open more than one files on startup of vim command, like this `vim hosts /etc/hosts`

Key Pressing - | - Function
-------------- | ----------
`:e` | edit a file in a new buffer (while attempt to close current buffer)
`:n` | **edit next file**
`:N` | edit previous file
`:bnext, :bn` | go to next buffer
`:bprev, :bp` | go to previous buffer
`:bd` | delete a buffer (close a file)
`:ls` | **list all open buffers**
`:files` | **show files opened**

<br/>
#### Multi-tab editing

Probably not quite useful today, but still offers a way to organize your workspace within the same terminal using vim.

Key Pressing - | - Function
-------------- | ----------
`:tabnew [filename]` | **open a file in a new tab**
`ctrl-w, then T` | **move current split window to its own tab**
`gt, :tabnext, :tabn` | **move to next tab**
`gT, :tabprev, :tabp` | **move to previous tab**
`Ngt` | move to tab N
`:tabmove N` | move current tab to Nth position (starting from 0)
`:tabclose, :tabc` | **close current tab and all its windows**
`:tabdo command` | run command on all tabs

<br/>
#### Vim env config setting

your behavior is automatically recorded by vim, and saved at ~/.viminfo

Key Pressing - | - Function
-------------- | ----------
`:set nu/nonu` | **set or cancel line number**
`:set hlsearch/nohlsearch` | high light search or not to
`:set autoindent/noautoindent` | autoindent or not to
`:set backup/nobackup` | **auto file backup or not (backed up will be [filename]~)**
`:set ruler/noruler` | ruler shows the portion of current viewing portion in the file
`:set showmode/noshowmode` | whether to show --INSERT-- mode etc.
`:set backspace=(0/1/2)` | 0 or 1 means can't backspace; 2 means can backspace anything
`:set all` | show all current config parameters
`:set` | show values different from default values
`:syntax on/off` | **whether to turn on/off syntax highlighting**
`:set bg=dark/light` | **show color differently**

Above preferences doesn't save unless you have a `~/.vimrc` file. Write a file like this:
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

<br/>
#### When non-English Character become mess

Traditional Chinese characters can be encoded into big5 or utf8. If the file encode and the display decoder doesn't match, random chars can be shown. Things may be related:
1. Linux system default supported language data: /etc/sysconfig/i18n
2. bash: LANG var
3. file's original encode
4. software that opened the file

Usually Windows XP files use big5 by default.
Set terminal `LANG=zh_TW.big5`

<br/>
#### DOS and Linux linebreak

use `cat -A` can see linebreak char of a file.
DOS file lines end with ^M, we call CR (^M) and LF($); Linux only have LF ($) as linebreak char.
We can convert it using *dos2unix* or *unix2dos* commands!
- `unix2dos [-kn] filename [newfile_name]`
- `-k`: keep file original mtime format (not update last modified time)
- `-n`: keep old file, make a new file for the converted
