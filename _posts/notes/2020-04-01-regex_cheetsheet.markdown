---
layout: note_page
title: Regex Cheatsheet
title_short: regex_cheatsheet
dateStr: 2020-04-01
category: Language
tags: notes cheetsheet check
---
The regular expression engine starts as soon as it can, grabs as much as it can, then tries to finish as soon as it can, while taking the first decision available to it.

<br/>

#### Anchors

char -  | - usage
------ | -----
`   ^` | Start of string, or start of line in multi-line pattern
`  \A` | Start of string
`   $` | End of string, or end of line in multi-line pattern
`  \Z` | End of string
`  \b` | Word boundary
`  \B` | Not word boundary
`  \<` | Start of word
`  \>` | End of word

<br/>

#### Character Classes

char -  | - usage
------ | -----
`  \c` | Control character
`  \s` | White space (space or tab)
`  \S` | Not white space
`  \d` | Digit, same as `[0-9]`
`  \D` | Not digit, same as `[^0-9]`
`  \w` | Alphanumeric (letters, numbers, underscore)
`  \W` | Not alphanumeric
`  \x` | Hexade cimal digit
`  \O` | Octal digit

<br/>

#### POSIX Classes

char -  | - usage
------ | -----
`[:upper:]` | Upper case letters
`[:lower:]` | Lower case letters
`[:alpha:]` | All letters
`[:alnum:]` | Digits and letters
`[:digit:]` | Digits
`[:xdigit:]` | Hexade cimal digits
`[:punct:]` | Punctuation
`[:blank:]` | Space and tab
`[:space:]` | Blank characters
`[:cntrl:]` | Control characters
`[:graph:]` | Printed characters
`[:print:]` | Printed characters and spaces
`[:word:]` | Digits, letters and underscore

<br/>

#### Assertions

char -  | - usage
------ | -----
`?=` | Lookahead assertion
`?!` | Negative lookahead
`?<=` | Lookbehind assertion
`?!=` | or ?<! Negative lookbehind
`?>` | Once-only Subexpression
`?()` | Condition [if then]
`?()|` | Condition [if then else]
`?#` | Comment

<br/>

#### Quantifiers

char -  | - usage
------ | -----
`*` | 0 or more
`+` | 1 or more
`?` | 0 or 1
`{3}` | Exactly 3
`{3,}` | 3 or more
`{,5}` | at most 5
`{3,5}` | 3, 4 or 5
**Tip** | Add a ? to a quantifier to make it ungreedy.

<br/>

#### Escape Sequences

char -  | - usage
------ | -----
`\` | Escape following character
`\Q` | Begin literal sequence
`\E` | End literal sequence
**Tip** | Within a literal sequence, no need to escape Metacharacters

<br/>**Metacharacters** in regex need to be escaped in order to let regex recognize and match them.

Common Metacharacters: `^ [ . $ { * ( \ + ) | ? < >`

<br/>

#### Special Characters

char -  | - usage
------ | -----
`\n` | New line
`\r` | Carriage return
`\t` | Tab
`\v` | Vertical tab
`\f` | Form feed
`\xxx` | Octal character xxx
`\xhh` | Hex character hh

<br/>To match above special characters, need to escape the backslash like this `\\n` in a regex expression.

<br/>

#### Groups and Ranges

char -  | - usage
------ | -----
`.` | Any character except new line (\n)
`(a|b)` | a or b
`(...)` | Group
`(?:...)` | Passive (non-capturing) group
`[abc]` | Range (a or b or c)
`[^abc]` | Not (a or b or c)
`[a-q]` | Lower case letter from a to q
`[A-Q]` | Upper case letter from A to Q
`[0-7]` | Digit from 0 to 7
`\x` | Group/subpattern number "x"
**Tip** | Ranges are inclusive

<br/>

#### Pattern Modifiers

char -  | - usage
------ | -----
`g` | Global match
`i *` | Case-insensitive
`m *` | Multiple lines
`s *` | Treat string as single line
`x *` | Allow comments and whitespace in pattern
`e *` | Evaluate replacement
`U *` | Ungreedy pattern
**Tip** | starred (*) are Perl-compatible Regular Expressions (PCRE) modifiers
| https://www.pcre.org/original/doc/html/index.html

<br/>

#### String Replacement

char -  | - usage
------ | -----
`$n` | nth non-passive group
`$2` | "xyz" in /^(abc(xyz))$/
`$1` | "xyz" in /^(?:abc)(xyz)$/
`` $` `` | Before matched string
`$'` | After matched string
`$+` | Last matched string
`$&` | Entire matched string
**Tip** | Some regex implem ent ations use '\' instead of '$' (i.e. regex used by Splunk)
