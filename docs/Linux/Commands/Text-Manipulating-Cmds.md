## Linux Text Manipulation Commands

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

- `grep [-A] [-B] [--color=auto] 'search_regex' filename`
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
