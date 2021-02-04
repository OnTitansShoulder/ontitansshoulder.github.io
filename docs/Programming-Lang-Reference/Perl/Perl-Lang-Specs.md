---
layout: note_page
title: Perl Language Reference
title_short: perl_lang_syntax
dateStr: 2020-03-01
category: Language
tags: notes cheatsheet check
---

<br/>

### Dcoumentation

like shell, comments starts with a '#'

<br/>

### Debug

```sh
perl -de1
perl -MCPAN -e shell
perl -c file_to_compile
```

<br/>

### Type of Data

**Numbers**
Integers

- Base-10: 1, -4, 255, 25_000_000 ...
- Binary: 0b11111
- Octal: 0123, 055
- Hexadecimal: 0x4AF

**Floating-point numbers**
- 0.5, -0.0133, ...

**Strings**

- no processing: 'simple raw string' string evaluated as-is
- with interpolation: "Hello world\n"
- Alternative Delimiters
    - Instead of bounding strings with ' or ", can define you own delimiters for strings
    - use `qq` followed by an arbitrary non-alphanumeric character:
    - `print qq/'"Hi," said Jack. "Have you read Slashdot today?"'\n/;`
    - use `q//` works too
- Here-Documents, another way to specify a string, start with `<<` and then a `label`.

```perl
print<<EOF;
This is a here-document. It starts on the line after the two arrows,
and it ends when the text following the arrows is found at the beginning
of a line, like this:
EOF
```

**Numbers<->Strings**
- perl converts between strings, integers, and floating-point numbers behind the scenes automatically if necessary.
    - `"12" > "30"` yields false
- string contains no digit will be evaluated as 0 in Integer, if evaluated in an arithmetic expression
- Special function can be used on converting binary, octal, or Hexadecimal string into Integers:
    - hex("0x30"), oct("030"), oct("0b11010"), oct("0x35AB")

**Operators**

- _Arithmetic_ Operators: + - * / % **(power function) ++ --
- _Logical_ Operators: & | ~(NOT) ^
- _Bit-wise_ Operators: << >>
- _Comparison_ Operators: == != > < >= <= <=>(like java's compareTo, returns -1, 0, 1 i.e. 6<=>9 yields -1)
- _Boolean_ Operators: && || ! and or xor not
- _String_ Operators: .(for concatenation) x[0-9]+(repetes previous string N times)
- _String Compare_ Operators: lt gt ge le eq ne cmp(like java's compareTo, returns -1, 0, 1) ord(takes first character of input string, returns its ASCII)
- _Range_ Operators: ... and ...
- _Build-list_ Operator: ..., ..., ...
- _Regex_ Operator: =~ !~
- _Pointer_ Operator: -> \

**Variables types**

- _Scalars_ `$name`, holds Numbers, Strings, limited by the size of your computer's memory
- _Lists_ `@list`, holds Numbers, Strings, variables
    - `(42, 39) ("cheese", "cake") (42, 1.5, "lalala", $test)`
    - `qw/one two three four/` will yield `('one', 'two', 'three', 'four')`
        - '/' can be replaced with other special chars; spaces can be replaced with tabs, new lines, or any number of white spaces
    - Note that lists inside lists will be flattened to level one list
    - list element can be accessed with [N]; negative index rewinds from the end of the list
        - nit: use `$a = $array[0]` instead of `$a = (@array)[0]`
        - prime rule is this: the prefix represents what you want to get, not what you've got.
        - [N] N can be a list, or a range of numbers to access corresponding elements
        - Swap elements in-place: `@months[3,4] = @months[4,3]` which isn't far from swapping variables using list assignment `($mone, $mtwo) = ($mtwo, $mone)`
    - list slicing: [(index1, index2)] will return a new list containing elements in those indexes from the old list
    - Ranges: `(1 .. 6)` will yield a list of 1-6 `('a' .. 'z')` will yield a list of a-z
    - array functions
        - change elements: push pop shift(taken from index 0) unshift(adding to index 0)
        - other: reverse sort
            - sort is based on alphabetic orders by default. If sorting numbers or others things where special rule is required, can pass a compareTo func:
            - `my @string_sorted = sort { $a cmp $b } @unsorted;`
            - `my @number_sorted = sort { $a <=> $b } @unsorted;`
    - special variable: `$#array` gives the highest element index in `@array`
        - this made it okay to use `for (0..$#array)` for traversal using `$_` as index
        - note that this value is 1 less than the value from `salar @array`, which gives the size of the array
- _Hashes_ `%hash`
- can be created by:
    - List with key value pairs separated by commas.

```perl
%where = (
    "Gary", "Dallas",
    "Lucy", "Exeter"
);
```

List with key value pairs more readable:

```perl
%where = (
  Gary => "Dallas",
  Lucy => Exeter
);
```
From an array:

```perl
@array = qw(Gary Dallas Lucy Exeter Ian Reading Samantha Oregon);
%where = @array;
```

- access/set values with `$where{Key}`
- `keys %where` gives a list of keys in this hash
- `exists` can be used to test whether a key exists in a hash `if (not exists $rates{$key})`

Variable name must begin with alphabetic character or underscore, then can be followed by numbers, letters, underscores

Note that `$var @var %var` are different variables

Scalar vs. List Context: if a variable is evaluated in different context, its return value will be different

Can force scalar context using `scalar` operator on another variable, like this `print scalar @array`

```perl
print @array; # list context, returns list elements
$scalar = @array; # scalar context, returns list size
```

**Variable scopes**
Variables declared within blocks {} are lexical (local) variables; otherwise are global.

Locla variable overrides global variable value at evaluation, while it does not modify global variable (with the same variable name).

```perl
$global_var
{
  my $local_var
  my ($var1, $var2, $var3) # () is needed if declaring many at a time
}
```

With `use strict;` set, have to declare global variable with `our $global_var`

**Special Variables**

- `$_` the default variable that functions read from/write to
- `$!` a way of getting various things Perl want to give, like error message
- `<>` an abbreviation for `<ARGV>`
- `$/` defines your own line separator for I/O purposes
    - note that the `$/` being set as `""` will make reading chunk as paragraph instead of lines
- `@_` stores arguments passed into a subroutine

**Variable interpolation**

- `print "My name is $name\n";`
- `print "This is the ${times}th time.\n";`
- `print "@array"` will add spaces between its elements
- `$scalar = "@array"` achieve the same thing above, while storing into a string

<br/>

### I/O

**Printing**

- call `print(RawStr...)` is implicitly `print(STDOUT, RawStr...)`
- can print to error with `print STDERROR RawStr`
- expressions evaluated as false will be printing nothing; otherwise printing 1
- `die` can be used to print error message and exit out current project.

```perl
@array = (4, 6, 3, 9)
print @array, "\n" # yields 4639
print "@array\n" yields 4 6 3 9
```

**Reads input**

- `my $cash = <STDIN>;`
- use `chomp($var1, $var2, ...)` to get rid of '\n' read from STDIN

**Read File**

```perl
open FILE, "nlexample.txt" or die $!;
my $lineno = 1;
while (<FILE>) { # equivalent as "while (defined ($_ = <FILE>)) {"
  print $lineno++;
  print ": $_";
}
```

Another shortcut for read/process files

```perl
my $lineno = 1;

while (<>) {
  print $lineno++;
  print ": $_";
}
```

Then just run the script and pass filenames as command-line args, the files will automatically be read in and processed in the loop

Further reading here
https://docs.google.com/viewer?url=https%3A%2F%2Fblob.perl.org%2Fbooks%2Fbeginning-perl%2F3145_Chap06.pdf

<br/>

### Conditions

```perl
if Condition {
  do this;
} elsif Condition {
  do this;
} else {
  do this;
}
# alternatively
Condition ? do this : do this
```

`defined` can be used to test whether a variable is defined

**Boolean evaluations**

- Empty string "" is false
- Number zero 0 and string "0" are false
- Empty list () is false
- Undefined value is false
- Everything else is true

**Statement modifier form**

- `die "Something bad happened" if $error`

Another fashion of condition check

```perl
for ($choice) {
  $_ == 1 && print "You chose number one\n";
  $_ == 2 && print "You chose number two\n";
  $_ == 3 && print "You chose number three\n";
  ...
}
```

<br/>

### Loops

For-each loop for list traversal. Note that the variable `$element` is a reference to the element itself, so changes can be made directly on it

```perl
for $element (@array) {
  print $element, "\n";
}
# can also do
for (@array) {
  $_ *= 2
}
# for each loop
foreach $i (@array) {
  print "Element: $i\n";
}
# while loop
my $countdown = 5;
while ($countdown > 0) {
  print "Counting down: $countdown\n";
  $countdown--;
}
do {
  ...
} while ($_)
# loop until loops
until (<condition) {
  ...
}
```
for loop creates an `alias` rather than a `value`. The `alias` is just an iterator direct referencing its value.

Changes made on it will be reflected somewhere else where it is used.
loops can be break out using `last`: `last if $_ eq "STOP THIS NOW";`
loops can go to next iteration using `next`

**labeling**

```perl
OUTER: while (<STDIN>) {
  chomp;
  INNER: for my $check (@getout) {
    last OUTER if $check eq $_;
  }
  print "Hey, you said $_\n";
}
```

**Statement modifier form**

- `$total += $_ for @ARGV`
- `<statement> while <condition>`

<br/>

### Regex

**Pattern**

- regex patterns are defined in between '/'s, like this `/regex/`
- patterns support interpolation, so variable can be put inside '/'s like this `/$pattern/`
- 'i' tells that pattern is "case insensitive", like this `/regex/i`
- special chars that need to be escaped: `. * ? + [ ] ( ) { } ^ $ | \`
    - alternatively, use `\Q` and `\E` to set range that these chars are matched as is
    - `/\Q$pattern\E/` variable interpolation still in effect
    - `s/regex/regex_replace/` will do in-place replacement of matched string, once
    - `s/regex/regex_replace/g` will do it as many times (global)
- change delimiters
    - `s#/usr/local/share/#/usr/share/#g;`
- other modifiers
    - /m – treat the string as multiple lines. Normally, ^ and $ match the very start and very end of the string. If the /m modifier is in play, then they will match the starts and ends of individual lines (separated by \n). For example, given the string: "one\ntwo", the pattern `/^two$/` will not match, but `/^two$/m` will.
    - /s – treat the string as a single line. Normally, . does not match a new line character; when /s is given, then it will.
    - /x – allow the use of whitespace and comments inside a match.
- look ahead/behind
    - `/fish(?= cake)/` will match only if fish is followed by cake
    - `/fish(?! cake)/` does the opposite

**Other functions that uses regex**

- split(regex, target)

<br/>

### Transliteration

Works a lot like regex, except it defines a rule of translating things from one to another.

What this does is to correlate the characters in its two arguments, one by one, and use these pairings to substitute individual characters in the referenced string.

```perl
$string =~ tr/0123456789/abcdefghij/;
# would turn, say, "2011064" into "cabbage".
my $vowels = $string =~ tr/aeiou//;
# would count the number of vowels in a string
$string =~ tr/ //d;
# would remove the spaces from the $string
```

<br/>

### Reference

Always scalar but can give the data stored in an array or hash.

It differs from pointers in the sense that, only store memory locations for specific, clearly defined data structures – maybe not predefined, but defined nevertheless.

You create a reference by putting a backslash in front of the variable.

```perl
my @array = (1, 2, 3, 4, 5);
my $array_r = \@array;
my %hash = ( apple => "pomme", pear => "poire" );
my $hash_r = \%hash;
my $scalar = 42;
my $scalar_r = \$scalar;
my $a = 3;
my $b = 4;
my $c = 5;
my @refs = (\$a, \$b, \$c);
my @refs2 = \($a, $b, $c);
```

**Anonymous References**
To get an array reference instead of an array, use square brackets `[]` instead of parentheses.

To get a hash reference instead of a hash, use curly braces `{}` instead of parentheses.

```perl
my $array_r = [1, 2, 3, 4, 5];
my $hash_r = { apple => "pomme", pear => "poire" };
my %months = (
  english => ["January", "February", "March", "April", ",May", ",June"],
  french => ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin"]
);
my @array = ( 100,200,[ 2,4,[ 1,2,[ 10,20,30,40,50 ],3,4 ],6,8 ],300,400 );
```

To dereference data, put the reference in _curly braces_ wherever you would normally use a variable's name.

- `my @array2 = @{$array_r};`
- `%{$hash_r}`
- `${$href}{$_}`
- You don't have to write the curly brackets.

```perl
for (@$array_r) {
  print "An element: $_\n";
}
for (keys %$href) {
  print "Key: ", $_, " ";
  print "Hash: ",$hash{$_}, " ";
  print "Ref: ",$$href{$_}, " ";
  print "\n";
}
```

Instead of `${$ref}`, we can say `$ref->`

```perl
my @array = (68, 101, 114, 111, 117);
my $ref = \@array;
$ref->[0] = 100; # compare to ${$ref}[0] = 100;
print "Array is now : @array\n";
```

Between sets of brackets, the arrow is optional.

```perl
$ref = [ 1, 2, [ 10, 20 ] ];
$element = {$ref->[2]}->[1];
$element = $ref->[2][1];
```

Destroy/GC a reference using `undef $ref` or `delete $addressbook{$who}`

**Autovivification**

```perl
my $ref;
$ref->{UK}->{England}->{Oxford}->[1999]->{Population} = 500000;

my @chessboard;
$chessboard[0]->[0] = "WR";
```

perl will automatically know that we need $ref to be a hash reference. So, it'll make us a nice new anonymous hash, and another...

We don't have to worry about creating all the entries ourselves.

<br/>

### Subroutines (user-defined functions)

Like C, perl requires subroutines to be defined or declared before using them.

You can choose to define them before using them, or just declare them, use them, then defined them at the end of the file.

declare subroutines using

```perl
sub marine;
# alternatively, use this statement at the top of the program
use subs qw(marine setup teardown);

# call subroutine
setup;

# then define it later
sub marine {
  ...
}
```

Now pass arguments to subroutines and use them. Arguments are stored in `@_`:

```perl
total(1...100);
sub total {
  my $total = 0;
  $total += $_ for @_;
  print "The total is $total\n";
  $total;
}
```

Can set default arg value using this: `my $message = shift || "Something's wrong";`

**Named Parameters**

```perl
logon( username => $name, password => $pass, host => $hostname);
sub logon {
  die "Parameters to logon should be even" if @_ % 2;
  my %args = @_;
  print "Logging on to host $args{hostname}\n";
  ...
}
```

Finally we can return a value. We can return a list or a hash instead of a scalar.

To do so implicitly was easy, just make the value we want to return the last thing in our subroutine, like above.

To return explicitly, use the keyword `return`.

```perl
sub secs2hms {
  my ($h,$m);
  my $seconds = shift; # uses @_ implicitly if nothing is passed.
                       # uses @ARGV implicitly if outside a subroutine
  $h = int($seconds/(60*60)); $seconds %= 60*60;
  $m = int($seconds/60); $seconds %= 60;
  return ($h,$m,$seconds);
  print "This statement is never reached.";
}
```

Just like a built-in function, when we're expecting a subroutine to return a list, we can use an array or list of variables to collect the return values. `my ($hours, $minutes, $seconds) = secs2hms(3723);`

**Context-aware Subroutines**

The function `wantarray` tells whether the context was array or scalar. It returns true if it is in an array context.
Use this if there is a need to return different values for different context.

**Subroutine Prototype**

Define how many arguments a subroutine needs to consume using `$`, `\@`, or `%`.

The number of `$`s defines the number of expected arguments.

You can also use an `@_` to denote any number of arguments is ok.

```perl
sub sum_of_two_squares ($$) {
  my ($a,$b) = (shift, shift);
  return $a**2+$b**2;
}
```

**References to Subroutines**

Usually we can use this mechanism to do callbacks.

```perl
sub something { print "Wibble!\n" }
my $ref = \&something;
# reference to an anonymous subroutine
my $ref = sub { print "Wibble!\n" }
# calling reference to a subroutine
&{$ref};
&{$ref}(@parameters);
&$ref(@parameters);
$ref->();
$ref->(@parameters);
```

<br/>

### Recursion in perl

An example program that use BFS search to validate all internal links are valid:

```perl
#!/usr/bin/perl
# webchecker.plx
use warnings;
use strict;
my %seen;

print "Web Checker, version 1.\n";
die "Usage: $0 <starting point> <site base>\n"
  unless @ARGV == 2;

my ($start, $base) = @ARGV;
$base .= "/" unless $base=~m|/$|;
die "$start appears not to be in $base\n"
  unless in_our_site($start);

traverse($start);
sub traverse {
  my $url = shift;
  $url =~ s|/$|/index.html|;
  return if $seen{$url}++; # Break circular links
  my $page = get($url);
  if ($page) {
    print "Link OK : $url\n";
  } else {
    print "Link dead : $url\n";
    return; # Terminating condition : if dead.
  }
  return unless in_our_site($url); # Terminating condition : if external.
  my @links = extract_links($page, $url);
  return unless @links; # Terminating condition : no links
  for my $link (@links) {
    traverse($link) # Recurse
  }
}

sub in_our_site {
  my $url = shift;
  return index($url, $base) == 0;
}
sub get {
  my $what = shift;
  sleep 5; # Be friendly
  return `lynx -source $what`;
}
sub extract_links{
  my ($page, $url) = @_;
  my $dir = $url;
  my @links;
  $dir =~ s|(.*)/.*?$|$1|;
  for (@links = ($page=~/<A HREF=["']?([^\s"'>]+)["']?/gi)) {
    $_ = $base.$_ if s|^/||;
    $_ = $dir."/".$_ if !/^(ht|f)tp:/;
  }
  return @links;
}
```

<br/>

### Modules

Declare a package using `package Wibble;` at the top of the file.
Three ways to import another package: `do`, `require`, and `use`

**do** will look for a file by searching the @INC path (default contents of the search path). If the file can't be found, it'll
silently move on. If it is found, it will run the file just as if it was placed in a block within our main
program – but with one slight difference: we won't be able to see lexical variables from the main
program once we're inside the additional code.

**require** is like do, but it'll only do once. It'll record the fact that a file has been loaded and will ignore
further requests to require it again.
```perl
require Wibble; # look for a file called Wibble.pm in the @INC path
require Monty::Python; # look for a file in directory Monty and a file Python.pm in @INC path
```

**use** The way we normally use modules. This is like require, except that perl applies it before anything else in the program starts. If Perl sees a use statement anywhere in your program, it'll include that module.

`use` takes place at compile time and not at run time.

```perl
# both packages will be included
if ($graphical) {
  use MyProgram::Graphical;
} else {
  use MyProgram::Text;
}
```

Import particular subroutines and variables: `use Wibble ("wobble", "bounce", "boing");`

```perl
# if ever need to limit what can be imported by another package
use Exporter;
our @ISA = qw(Exporter);
our @EXPORT_OK = qw(wobble bounce boing);
our @EXPORT = qw(bounce) # default imports
sub wobble { print "wobble\n" }
sub bounce { warn "bounce\n" }
sub boing { die "boing!\n" }
```

You can always directly address the subroutine without importing it: `Wibble::boing()`

**Change \@INC**

```perl
# BEGIN subroutine will always run at compile time
sub BEGIN {
  push @INC, "my/module/directory";
}
```

**Perl Standard Modules**

See page https://docs.google.com/viewer?url=https%3A%2F%2Fblob.perl.org%2Fbooks%2Fbeginning-perl%2F3145_Chap10.pdf

Find more moduels from CPAN, the Comprehensive Perl Archive Network, http://www.cpan.org.

<br/>

### command in shell

To execute a command in shell, use `system($command)` function. It forks a child process, and then waits for the child process to terminate.

The value 0 is returned if the command succeeds and the value 1 is returned if the command fails.
