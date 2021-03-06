---
layout: note_page
title: C++ Lib Quick Reference
title_short: c++_lib_ref
dateStr: 2016-05-01
category: Language
tags: notes cheatsheet
---
## C++

C++ is a general purpose language, imperative, object-oriented, low-level memory manipulation.
Designed with a bias toward system programming and embedded, resource-constrained and large systems.

This note is like a cheatsheet for finding functions that would be helpful.
To view documentation related to the c++ functions, find the functions at http://www.cplusplus.com/
Good C++ learning site: https://www.learncpp.com/

#### Data Types

###### Simple data types

**Integral/Floating-Point Data Types**
- char, short, int, long, bool
- unsigned char, unsigned int, unsigned long
- float, double, long double

###### Structured data types

- class
- struct - like class without inheritance, all fields default public
- array - datatype variable_name[size], datatype* pointer_name = new datatype[size_var]
- union

###### Pointers

- data declared with `new`
- data as `long int` mem address
- use `*` to dereference address
- use `&` to pass/accept data as address pointer reference
- use `->` to access pointer class/struct type variables/functions
- use `++, +, -, --` to move pointers

###### Operators

- `+, -, * , /, %, ++, --`
- `<=, ==, >=, !=, <, >, &&, ||, !`
- `&, |, ^, ~, <<, >>`
- `sizeof()` gives the size of a variable
- `? :` ternary conditional operator

#### Standard I/O

`<iostream>`
- istream cin >> variable
- ostream cout << string

`<stdio.h>`
- printf - print to stdout
- fopen - open files
- puts - wrtie string to stdout
- fputs - write string to stream
- fread - read block of data from stream

`<iomanip>`
- setfill, setw, setprecision, get_time, put_time

`<fstream>` File I/O
- open - open file
- is_open - check if file is open
- close - close and save
- << >> - output / input strings to file
- get - get characters `cin.get(varname, length)`
- getline - get line `cin.getline(varname, length)`

#### String operations

`<cstring>`
- strcpy(s1, s2)
- strcmp(s1, s2)
- strstr(s1, s2)
- strtok(c_str, c_str_delimiters)
- s1.substr(start, length)

`<cctype>` `char type functions`
- isalnum, isalpha, isdigit, islower, isupper, tolower, toupper

#### Math functions

`<cmath>`
- cos, sin, tan, exp, log, pow, sqrt
- ceil, floor, trunc, round

`<cstdlib>`
- abs, div, ldiv, labs, size_t

#### misc functions

**string - other type conversions**
`<cstdlib>`
- atof, atoi, atol, strtod, strtof, strtol
- `<string>` stoi, stof, stoi, stol

**other type - string conversions**
- `<string>` to_string(...)

**other functions**
- rand - random number generation
- system - execute system commands
- getenv - get environment string
- abort - abort current process

- bsearch - binary search in array
- qsort - sort elements in array
