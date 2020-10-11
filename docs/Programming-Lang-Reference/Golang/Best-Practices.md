---
layout: note_page
title: Golang - Effective Go
title_short: effective_go
dateStr: 2020-05-01
category: Reading-Notes
tags: notes reference check
---

This set of notes is taking from [golang.org](https://golang.org/doc/effective_go.html)

Thinking about the problems from a Go's _perspective_ could produce a successful but quite different program. To write Go well, it's important to understand its properties and idioms, to know its conventions for programming.

<br/>

### Formatting and Styles

Formatting issues are the most contentious but the least consequential. 

In Go we can let the machine to take care of most formatting issues, by using `gofmt` program.

- `gofmt` is also available as command `go fmt`
- operates at the _package level_ rather than source file level
- reads a Go program and emits the source in a standard style of _indentation_ and _vertical alignment_ while retaining and _reformatting comments_ if necessary
- a few formatting details
  - use tabs for indentation
  - if a line feels too long, wrap it and indent with an extra tab
  - use fewer parentheses; mathematic expression can be concise and clear without parentheses i.e. `x<<8 + y<<16`

Therefore, don't spend time on formatting the comments, let Go do it by running `gofmt`

```go
type T struct {
    name string // name of the object
    value int // its value
}
// after running gofmt
type T struct {
    name    string // name of the object
    value   int    // its value
}
```

[github.com/uber-go](https://github.com/uber-go/guide/blob/master/style.md) offers a good style guide.

Install some useful [IDE plugins](https://github.com/golang/go/wiki/IDEsAndTextEditorPlugins) to help lint styles and errors quicker and sooner. 

<br/>

### Commentary

Go provides C-style `/* */` _block comments_ and C++-style `//` _line comments_. Block comment is usually used for adding package comments.

`godoc` is a program (and web server) that processes Go source files to extract documentation about the contents of the package.

- Comments that appear immediately before _top-level declarations_, with NO intervening newlines, are extracted along with the declaration to serve as _explanatory text_ or _doc comment_ for the declaration.
  - every **exported** (capitalized) name in a program should have a _doc comment_
  - doc comments work best as complete sentences
  - first sentence should be a one-sentence summary that starts with the _name_ being declared
    - will allow docs search results to be more intuitive
    - you can search docs to find a desired function by a command like `go doc -all regexp | grep -i parse`
- `godoc` displays _indented text_ in a fixed-width font, suitable for **program snippets**

```go
// Compile parses a regular expression and returns, if successful,
// a Regexp that can be used to match against text.
func Compile(str string) (*Regexp, error) {
  // ...
}
```

Every package should have a **package comment**, a block comment preceding the `package` clause. However if the package is simple, the package comment can be brief and use line comments to serve the purpose

```go
/*
Package regexp implements a simple library for regular expressions.
The syntax of the regular expressions accepted is:
    regexp:
        concatenation { '|' concatenation }
    concatenation:
        { closure }
    closure:
        term [ '*' | '+' | '?' ]
    term:
        '^'
        '$'
        '.'
        character
        '[' [ '^' ] character-ranges ']'
        '(' regexp ')'
*/
package regexp
```

Go's declaration syntax allows grouping of declarations.

- a single doc comment can introduce a group of related constants or variables
- grouping can also indicate relationships between items, such as the fact that a set of variables is protected by a mutex.

```go
// Error codes returned by failures to parse an expression.
var (
    ErrInternal      = errors.New("regexp: internal error")
    ErrUnmatchedLpar = errors.New("regexp: unmatched '('")
    ErrUnmatchedRpar = errors.New("regexp: unmatched ')'")
    ...
)
```

<br/>

### Names

In Go, the **visibility** of a name outside a package is determined by whether its _first character_ is _upper case_. And naming convention matters.

**Package Names**

When a package is imported, the _package name_ becomes an **accessor** for the contents with the package.

- when `import "bytes"`, can access `bytes.Buffer`
- packages should be given _lower case_, _single-word_ names and no need for _underscores_ or _mixedCaps_
- package name is only the _default name_ for imports; it need not be unique across all source code
  - when there is a collision, a package can be given an alias for use locally
- package name should be the _base name_ of its **source directory**
  - the package in `src/encoding/base64` is imported as `"encoding/base64"` but has name `base64`, NOT `encoding_base64` and NOT `encodingBase64`
- don't use the `import .` notation
- importer of a package will use the name to refer to its contents
  - give clear and concise names for things within a package
  - i.e. `bufio.Reader`, so no need to name the `Reader` as `BufReader`
  - i.e. `ring.New`, not need to name the constructor as `NewRing`
- long names don't automatically make things more readable. A helpful doc comment can often be more valuable than an extra long name

Go doesn't provide automatic **Getters** or **Setters**, but when writing ones on your own, it is best to omit the "Get" part, say `obj.Owner()` should be concise and straight-forward.

By convention, one-method **interfaces** are named by the method name plus an `-er` suffix to construct an agent noun.

`Read, Write, Close, Flush, String` and so on have _canonical signatures and meanings_. To avoid confusion, don't give your method one of those names unless it has the same signature and meaning.

The convention in Go is to use `MixedCaps` or `mixedCaps` rather than underscores to write **multiword names**

<br/>

### Semicolons

Go's formal grammar uses `semicolons` to terminate statements but they do NOT appear in the source.

- “if the newline comes after a token that could end a statement, insert a semicolon”
- a semicolon can also be omitted immediately before a closing brace
- idiomatic Go programs have semicolons only in places such as **for loop** clauses, to separate the initializer, condition, and continuation elements
- semicolons are also necessary to separate multiple statements on a line
- you CANNOT put the _opening brace_ of a control structure (`if, for, switch,` or `select`) on the next line because of the semicolon insertion rule

<br/>

### Control Structures

Control structures of Go are related to those of C but differ in important ways:

- there is no `do` or `while` loop, only a slightly generalized `for`
- `switch` is more flexible
- `if` and `switch` accept an optional **initialization statement** like that of `for`
  - mandatory braces encourage writing simple `if` statements on multiple lines
  - when an `if` statement doesn't flow into the next statement—that is, the body ends in `break, continue, goto, or return`, the unnecessary `else` is omitted
- `break` and `continue` statements take an optional **label** to identify what to break or continue
- there are new control structures including a `type switch` and a multi-way communications multiplexer, `select`
  - there are no parentheses and the bodies must always be brace-delimited

Three forms of **`for`** loops

- `for init; condition; post {}`
- `for condition {}` is like a while loop
  - a `range` clause can manage the loop, i.e. `for key, value := range oldMap {}`
  - `for _, value := range array {}` use `_` (aka the **blank identifier**) to discard UNWANTED return values
- `for {}` is like a while-true loop
- Go has NO `comma operator` and `++` and `--` are **statements**, NOT **expressions**
  - `for i, j := 0, len(a)-1; i < j; i, j = i+1, j-1 {}`

Go's **`switch`** evaluates the cases _top to bottom_ UNTIL a match is found

- if the `switch` has NO **expression** it switches on `true`
- it is idiomatic to write an _if-else-if-else_ chain as a `switch`
- there is NO automatic **fall through**, but cases can be presented in **comma-separated lists**
- `break` statements can be used to **terminate** a switch early
  - when trying to break out of a _surrounding loop_, not the `switch`, use a `label` on the loop and "breaking" to that `label`
  - `continue` with `label` is specific to loops only
- a **type switch** can also be used to discover the **dynamic type** of an `interface` variable
  - such a `type switch` uses the syntax of a _type assertion_ with the keyword `type` inside the parentheses

```go
var t interface{}
t = functionOfSomeType()
switch t := t.(type) {
default:
    fmt.Printf("unexpected type %T\n", t)     // %T prints whatever type t has
case bool:
    fmt.Printf("boolean %t\n", t)             // t has type bool
case int:
    fmt.Printf("integer %d\n", t)             // t has type int
case *bool:
    fmt.Printf("pointer to boolean %t\n", *t) // t has type *bool
case *int:
    fmt.Printf("pointer to integer %d\n", *t) // t has type *int
}
```

In a **`:=` declaration** a variable `v` may appear even if it has ALREADY been declared, when

- this declaration is in the same scope as the existing declaration of `v`
  - if `v` is already declared in an outer scope, the declaration will create a NEW variable
  - in Go the _scope_ of **function parameters** and **return values** is the same as the **function body**
- the corresponding value in the initialization is assignable to v
- there is at least one other variable that is created by the declaration

<br/>

### Functions

In Go, functions and methods can return **multiple values**, which is convenient to report errors.

- i.e. `func (file *File) Write(b []byte) (n int, err error)` returns the number of bytes written and a non-nil error when n != len(b)
- i.e. a simple-minded function to grab a number from a position in a byte slice, returning the number and the next position

```go
func nextInt(b []byte, i int) (int, int) {
    for ; i < len(b) && !isDigit(b[i]); i++ {
    }
    x := 0
    for ; i < len(b) && isDigit(b[i]); i++ {
        x = x*10 + int(b[i]) - '0'
    }
    return x, i
}
for i := 0; i < len(b); {
    x, i = nextInt(b, i)
    fmt.Println(x)
}
```

The return or **result parameters** of a Go function can be given _names_ and used as regular variables, just like the incoming parameters

- when named, they are initialized to the **zero values** for their types when the function begins
- if the function executes a return statement with no arguments, the current values of the named result parameters are used as the returned values
- the names are not mandatory but they can make code shorter and clearer: they're _documentation_

Go's `defer` statement schedules a function call to be run immediately before the function returns

- it is effective for closing or releasing resources
  - it guarantees that you will never forget to close the file
  - the `close` sits near the `open`, which is much clearer than placing it at the end of the function
- the arguments to the deferred function (including the receiver if it is a method) are evaluated when the defer executes
  - if it is a variable, that variable value can change within the function body before the defer function is executed
- a function can defer _multiple_ function executions
  - deferred functions are executed in **LIFO** order

```go
// simple ways to add function traces for debugging
func trace(s string)   { fmt.Println("entering:", s) }
func untrace(s string) { fmt.Println("leaving:", s) }
func a() {
    trace("a")
    defer untrace("a")
    // do something....
}

// simple ways to time a function for debugging
func startTimer(s string) (string, int64) { return (s, time.Now().UnixNano()) }
func timeIt(s string, t int64) {
    now := time.Now()
    t2 := now.UnixNano()
    fmt.Println("Function ", s, " run time is ", t2, " nano seconds")
}
func b() {
    defer timeIt(startTimer("a"))
    // do something....
}
```

<br/>

### Data

Go has two **allocation primitives**, the built-in functions `new` and `make`

- **`new(T)`** allocates memory and zeros it (uninitialized) and returns its address with type `*T` (pointer)
- it's helpful to arrange when designing your data structures that the zero value of each type can be used without further initialization

```go
p := new(SyncedBuffer)  // type *SyncedBuffer
var v SyncedBuffer      // type  SyncedBuffer
```

Sometimes it is easier to use a **composite literal**, which is an expression that creates a new _instance_ each time it is evaluated

- taking the address of a composite literal allocates a _fresh instance_ each time it is evaluated
- fields of a _composite literal_ are laid out **in order** and MUST ALL be present
  - by labeling the elements explicitly as field:value pairs, the initializers can appear in any order and the missing ones left as their zero values
- if a composite literal contains no fields at all, it creates a zero value for the type
  - in other words, the expressions `new(File)` and `&File{}` are equivalent
- composite literals can also be created for `arrays, slices, and maps`, with the field labels being indices or map keys as appropriate

```go
func NewFile(fd int, name string) *File {
    if fd < 0 {
        return nil
    }
    f := new(File)
    f.fd = fd
    f.name = name
    f.dirinfo = nil
    f.nepipe = 0
    return f
}
// vs.
func NewFile(fd int, name string) *File {
    if fd < 0 {
        return nil
    }
    return &File{fd, name, nil, 0}
}
```

built-in function **`make(T, args)`** creates `slices, maps, and channels` only, and it returns an _initialized_ (not zeroed) value of type `T` (not *T)

- these three types represent, under the covers, references to data structures that MUST be initialized before use
  - i.e. `make([]int, 10, 100)` allocates an array of 100 ints and then creates a slice structure with length 10 and a capacity of 100 pointing at the first 10 elements of the array
  - `new([]int)` returns a pointer to a newly allocated, zeroed slice structure, that is, a pointer to a nil slice value

**Arrays** are useful when planning the detailed layout of memory
- arrays are values and building block for slices
- assigning one array to another _copies_ ALL the elements
  - when passing an array to a function, it will receive a copy of the array
- size of an array is part of its type
- you can pass a pointer of an array
- use slices whenever you can

```go
func Sum(a *[3]float64) (sum float64) {
    for _, v := range *a {
        sum += v
    }
    return
}
array := [...]float64{7.0, 8.5, 9.1}
x := Sum(&array)
```

**slices** wrap arrays to give a more general, powerful, and convenient interface to sequences of data

- most array programming in Go is done with slices rather than simple arrays
- slices hold _references_ to an underlying array
- if you assign one slice to another, both refer to the same array
- `length` within the slice sets an UPPER LIMIT of how much data to read
  - length of a slice may be changed as long as it still fits within the limits of the underlying array
  - do this by assigning it to a slice of itself
- `capacity` of a slice, accessible by the built-in function `cap`, reports the maximum length the slice may assume

```go
func Append(slice, data []byte) []byte {
    l := len(slice)
    if l + len(data) > cap(slice) {  // reallocate
        // Allocate double what's needed, for future growth.
        newSlice := make([]byte, (l+len(data))*2)
        // The copy function is predeclared and works for any slice type.
        copy(newSlice, slice)
        slice = newSlice
    }
    slice = slice[0:l+len(data)]
    copy(slice[l:], data)
    return slice
}
```

slices are variable-length, it is possible to have each inner slice be a different length, when defining a 2D slice.

```go
type Transform [3][3]float64  // A 3x3 array, really an array of arrays.
type LinesOfText [][]byte     // A slice of byte slices.
```

The built-in data structure `map` associate values of one type (the key) with values of another type (the element or value)

- key can be of any type for which the `equality` operator is defined
  - integers, floating point and complex numbers, strings, pointers, interfaces (as long as the dynamic type supports equality), structs and arrays
- maps hold **references** to an underlying data structure
- maps can be constructed using `composite literal` syntax with colon-separated key-value pairs
- attempt to fetch a map value with a key that is not present in the map will return the zero value for the type of the entries in the map
- use `delete` to unset a map entry, like this `delete(timeZone, "PDT")`

```go
var timeZone = map[string]int{
    "UTC":  0*60*60,
    "EST": -5*60*60,
    "CST": -6*60*60,
    "MST": -7*60*60,
    "PST": -8*60*60,
}
if offset, isKeyDefined := timeZone["EST"]; isKeyDefined {
  // do something with offset
}
```

formatted print functions `fmt.Fprint` and its friends take as a first argument any object that implements the `io.Writer` interface

```go
// prints same results
fmt.Printf("Hello %d\n", 23)
fmt.Fprint(os.Stdout, "Hello ", 23, "\n")
fmt.Println("Hello", 23)
fmt.Println(fmt.Sprint("Hello ", 23))
```

Attach a method such as `String` to any _user-defined type_ makes it possible for arbitrary values to format themselves automatically for printing

<br/>

### Initialization

Complex structures can be built during initialization and the ordering issues among initialized objects, even among different packages, are handled correctly

Go's **constants** are created at _compile time_ and can only be `numbers, characters (runes), strings or booleans`; expressions that define them must be constant expressions

**Variables** can be initialized just like constants but the initializer can be a general expression computed at _run time_

Each source file can define its own niladic `init` function(s) to set up whatever state is required

- `init` is called after all the variable declarations in the package have evaluated their initializers
- evaluated only after all the imported packages have been initialized
- `init` can also be used to verify or repair correctness of the program state before real execution begins

<br/>

### Methods

**Methods** can be defined for any named type (except a pointer or an interface) and the receiver does not have to be a `struct`.

The rule about pointers vs. values for receivers is that value methods can be invoked on pointers and values, but pointer methods can ONLY be invoked on pointers

- this rule arises because pointer methods can modify the receiver; invoking them on a value would cause the method to receive a copy of the value, so any modifications would be discarded
- when the value is addressable, the language takes care of the common case of invoking a pointer method on a value by inserting the address operator automatically

The idea of using `Write` on a `slice` of bytes is central to the implementation of `bytes.Buffer`

```go
func (p *ByteSlice) Append(data []byte) {
    slice := *p
    // Body same as above Append function, without the return.
    *p = slice
}
// implements the io.Write interface
func (p *ByteSlice) Write(data []byte) (n int, err error) {
    slice := *p
    // Body same as above Append method
    *p = slice
    return len(data), nil
}
var b ByteSlice
fmt.Fprintf(&b, "This hour has %d days\n", 7) // because we implemented the Write method
```

<br/>

### Interfaces and other types

**Interfaces** in Go provide a way to specify the behavior of an object: _if something can do this, then it can be used here_.

- a type can implement multiple interfaces
  - a collection can be sorted by the routines in package `sort` if it implements `sort.Interface`, which contains `Len(), Less(i, j int) bool, and Swap(i, j int)`, and it could also have a `custom formatter`
- Interfaces with only one or two methods are common in Go code, and are usually given a name derived from the method

```go
type Sequence []int
// Methods required by sort.Interface.
func (s Sequence) Len() int {
    return len(s)
}
func (s Sequence) Less(i, j int) bool {
    return s[i] < s[j]
}
func (s Sequence) Swap(i, j int) {
    s[i], s[j] = s[j], s[i]
}
// Copy returns a copy of the Sequence.
func (s Sequence) Copy() Sequence {
    copy := make(Sequence, 0, len(s))
    return append(copy, s...)
}
// Method for printing - sorts the elements before printing.
func (s Sequence) String() string {
    s = s.Copy() // Make a copy; don't overwrite argument.
    sort.Sort(s)
    str := "["
    for i, elem := range s { // Loop is O(N²); will fix that in next example.
        if i > 0 {
            str += " "
        }
        str += fmt.Sprint(elem)
    }
    return str + "]"
}
```

If we convert the `Sequence` back to `[]int`, we can call `Sprint` directly on `s`. The **conversion** doesn't create a new value, it just temporarily acts as though the existing value has a new type.

```go
func (s Sequence) String() string {
    s = s.Copy()
    sort.IntSlice(s).Sort()
    return fmt.Sprint([]int(s))
}
```

It's an idiom in Go programs to convert the type of an expression to access a different set of methods.

**Type switches** are a form of conversion: they take an interface and, for each case in the switch, in a sense convert it to the type of that case.

```go
type Stringer interface {
    String() string
}
var value interface{} // Value provided by caller.
switch str := value.(type) {
case string:
    return str
case Stringer:
    return str.String()
}
```

A **type assertion** takes an interface value and extracts from it a value of the specified explicit _type_ and the result is a new value with the static type `<typeName>`

- that _type_ must either be the concrete type held by the interface, or a second interface type that the value can be converted to.
- i.e. `str := value.(string)`
  - if the value does not contain a string, the program will crash with a run-time error.
  - can guard against it with a "comma, ok" idiom to test
  - if assertion fails, `str` will still be a string with its zero value

```go
str, ok := value.(string)
if ok {
    fmt.Printf("string value is: %q\n", str)
} else {
    fmt.Printf("value is not a string\n")
}
```

If a type exists only to implement an interface and will never have exported methods beyond that interface, there is no need to export the type itself

- its constructor should return an interface value rather than the implementing type
  - in this way, similar types that implements the same interfaces can be easily replaced for one another by changing the constructor call and the rest of the code is unaffected

Almost anything can have methods attached, almost anything can satisfy an interface. A simple http handler:

```go
type Counter int
func (ctr *Counter) ServeHTTP(w http.ResponseWriter, req *http.Request) {
    *ctr++
    fmt.Fprintf(w, "counter = %d\n", *ctr)
}
...
import "net/http"
...
ctr := new(Counter)
http.Handle("/counter", ctr)
```

<br/>

### The blank identifier

It's a bit like writing to the Unix /dev/null file: it represents a write-only value to be used as a place-holder where a variable is needed but the actual value is irrelevant. Some common use cases are

- multiple variable assignment as placeholder to take up a variable's value assignment i.e. `_, err := os.Stat(path)`
- to silence compiler complaints about unused imports or variable assignments that would eventually be used i.e. `fd, err := os.Open("test.go"); _ = fd`
- to rename a package that is imported only for its side effects i.e. `import _ "net/http/pprof"`
- to check whether a type implements an interface i.e. `if _, ok := val.(json.Marshaler); ok {}`

<br/>

### Embedding

Go allows a type to “borrow” pieces of an implementation by embedding types within a struct or interface

- you can directly include other interfaces in a type to form a new type, without specifying all of their methods
- only interfaces can be embedded within interfaces

```go
// ReadWriter is the interface that combines the Reader and Writer interfaces.
type ReadWriter interface {
    Reader
    Writer
}
// ReadWriter stores pointers to a Reader and a Writer.
// It implements io.ReadWriter.
type ReadWriter struct {
    reader *Reader  // *bufio.Reader
    writer *Writer  // *bufio.Writer
}
```

When we embed a type, the methods of that type become methods of the outer type, but when they are invoked the receiver of the method is the inner type, not the outer one

If we need to refer to an embedded field directly, the type name of the field, ignoring the package qualifier, can be served as a field name

If embedding types introduces name conflicts, there are two rules

- if an embedded type introduces methods or fields that are defined by the same name at this struct, then the definition at this struct will dominate it (and suppress the conflicting methods/fields introduced by the embedded type)
- if embedded a type and also defined another type of method with the same name as the embedded type, it is an error unless neither one of them was used

<br/>

### Concurrency

> Do not communicate by sharing memory; instead, share memory by communicating.

The goal of concurrency, structuring a program as independently executing components and executing calculations in parallel for efficiency on multiple CPUs

In Go, shared values are passed around on channels and never actively shared by separate threads of execution

- only one goroutine has access to the value at any given time
- data races cannot occur, by design

A **goroutine** is a function executing concurrently with other goroutines in the same address space and when the call completes, the goroutine exits silently

- it is lightweight, costing little more than the allocation of stack space
- the stacks start small, cheap, and grow by allocating (and freeing) heap storage as required
- goroutines are multiplexed onto multiple OS threads so some can block and others can execute

**Unbuffered channels** combine communication(the exchange of a value) with synchronization(guaranteeing that the two ends are in a known state)

A **buffered channel** can be used like a _semaphore_, for instance to limit throughput.

A common use of channels is to implement safe, parallel demultiplexing by creating "channels of channels".

- can be done by creating structs that contains channels and pass struct objects to a channel

<br/>

### Errors

Library routines must often return some sort of error indication to the caller

- errors have type error, a simple built-in interface.
- when successful the error will be nil; when there is a problem, it should hold an error
- when feasible, error strings should identify their origin, such as by having a prefix naming the operation or package that generated the error

```go
type error interface {
    Error() string
}
```

Caller can use a type switch or a type assertion to look for specific errors and extract details

```go
for try := 0; try < 2; try++ {
    file, err = os.Create(filename)
    if err == nil {
        return
    }
    if e, ok := err.(*os.PathError); ok && e.Err == syscall.ENOSPC {
        // if the err was of type *os.PathError, and then so is e
        deleteTempFiles()  // Recover some space.
        continue
    }
    return
}
```

If an error is unrecoverable, it will be better to use `panic` to create a run-time error that will stop the program

- `panic` takes a single argument of arbitrary type (often a string) to be printed as the program dies
  - when `panic` is called, it immediately stops execution of the current function and begins unwinding the stack of the goroutine, running any deferred functions along the way.
  - if that unwinding reaches the top of the goroutine's stack, the program dies
  - it is possible to use the built-in function `recover` to regain control of the goroutine and resume normal execution
- it's also a way to indicate that something impossible has happened
- real library functions should avoid using `panic`
  - it's always better to let things continue to run rather than taking down the whole program
  - one exception is during initialization, if the library truly cannot set itself up, it might be reasonable to panic without further damage

A call to recover stops the unwinding and returns the argument passed to panic

- `recover` is only useful inside **deferred functions** because the only code that runs while undergoing unwinding is inside deferred functions
- one application of recover is to shut down a failing goroutine inside a server without killing the other executing goroutines
- deferred code can call library routines that themselves use panic and recover without failing
- deferred functions can modify named return values

```go
func server(workChan <-chan *Work) {
    for work := range workChan {
        go safelyDo(work)
    }
}
func safelyDo(work *Work) {
    defer func() {
        if err := recover(); err != nil {
            log.Println("work failed:", err)
        }
    }()
    do(work)
}
```

A more complete example, with deferred function modifying the named return values

```go
// Error is the type of a parse error; it satisfies the error interface.
type Error string
func (e Error) Error() string {
    return string(e)
}
// error is a method of *Regexp that reports parsing errors by
// panicking with an Error.
func (regexp *Regexp) error(err string) {
    panic(Error(err))
}
// Compile returns a parsed representation of the regular expression.
func Compile(str string) (regexp *Regexp, err error) {
    regexp = new(Regexp)
    // doParse will panic if there is a parse error.
    defer func() {
        if e := recover(); e != nil {
            regexp = nil    // Clear return value.
            err = e.(Error) // Will re-panic if not a parse error.
        }
    }()
    return regexp.doParse(str), nil
}
```

<br/>

### Web Server

An simple example

```go
package main
import (
    "flag"
    "html/template"
    "log"
    "net/http"
)
var addr = flag.String("addr", ":1718", "http service address") // Q=17, R=18
var templ = template.Must(template.New("qr").Parse(templateStr))

func main() {
    flag.Parse()
    http.Handle("/", http.HandlerFunc(QR))
    err := http.ListenAndServe(*addr, nil)
    if err != nil {
        log.Fatal("ListenAndServe:", err)
    }
}
func QR(w http.ResponseWriter, req *http.Request) {
    templ.Execute(w, req.FormValue("s"))
}
const templateStr = `
<html>
<head>
<title>QR Link Generator</title>
</head>
<body>
{{if .}}
<img src="http://chart.apis.google.com/chart?chs=300x300&cht=qr&choe=UTF-8&chl={{.}}" />
<br>
{{.}}
<br>
<br>
{{end}}
<form action="/" name=f method="GET">
    <input maxLength=1024 size=70 name=s value="" title="Text to QR Encode">
    <input type=submit value="Show QR" name=qr>
</form>
</body>
</html>
`
```

The `html/template` package is very powerful. Documentation to it is [here](https://golang.org/pkg/html/template/)
