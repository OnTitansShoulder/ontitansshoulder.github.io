---
layout: note_page
title: Golang Reference
title_short: go_lang_syntax
dateStr: 2020-04-01
category: Language
tags: notes reference check
---

This is set of notes is taking from golang.org/ref/spec and gobyexample.com

Go is a general-purpose language designed with systems programming in mind. It is strongly typed and garbage-collected and has explicit support for concurrent programming.

<br/>

### Go code organization

Go organizes code into a collection of files that would be compiled together, called **packages**.

- _Functions, types, variables, and constants_ defined in one source file are visible to all other source files within the same package.

Go packages that are related and released together are organized within a **module**. A **repository** typically contains only one module located at the root of the repo.

- `go.mod` decalres the `module path`
- A module's path serves as an import path prefix for its packages and indicates where the go command should look to download it

A package's **import path** is its module path joined with its subdirectory within the module.

- i.e. the module `github.com/google/go-cmp` contains a package in the directory `cmp/`. That package's import path is `github.com/google/go-cmp/cmp`

<br/>

### Go command

**Create from scratch**

```sh
module_path=<module_path>
mkdir "$module_path"
go mod init "$module_path"
```

A _module path_ can be in the form of `example.com/user/hello`, where the part before the first `/` is the organization domain name, then follows a variable-sized path, and the part after the last `/` will be the _module name_.

**A simple program**

```go
package main

import (
  "fmt"
)

func main() {
	fmt.Println("Hello, world.")
}
```

The first statement in a Go source file must be package name.

When building **Executable** binaries, its starting point must always use package `main`.

**Build a program**

`go install "$module_path"` will build and install the executable binary to `$HOME/go/bin/module_name`

- has to be within the source directory of `$module_path`
- go commands accept paths relative to the working directory
- `go build` will just compile and build the code within current directory

The install directory is controlled by the `$GOPATH` and `$GOBIN` environment variables.

- If `$GOBIN` is set, binaries are installed to that directory
    - use `go env -w GOBIN=/somewhere/else/bin` to dynamically change its value
    - use `go env -u GOBIN` to unset it
- If `$GOPATH` is set, binaries are installed to the bin subdirectory of the first directory in the `$GOPATH` list.
- Otherwise, binaries are installed to the bin subdirectory of the default `$GOPATH` (`$HOME/go`)

Run the binary after the build, like you would do with a Linux command. Alternatively, can use `go run <main_package>.go` to preview running the program before building it.

<br/>

### Use packages from other sources

An **import path** can describe how to obtain the package source code using a revision control system such as Git.

```go
package main

import (
	"fmt"

	"example.com/user/hello/morestrings"
	"github.com/google/go-cmp/cmp" // load github.com/google/go-cmp/cmp in this program
)

func main() {
	fmt.Println(morestrings.ReverseRunes("!oG ,olleH"))
	fmt.Println(cmp.Diff("Hello World", "Hello Go")) // directly invoke functions defined in 'cmp' module
}
```

When you run commands like `go install, go build, or go run`, the go command will automatically download the remote module and record its version in your `go.mod` file.

An interesting [article](https://maelvls.dev/go111module-everywhere/){target=_blank} about GO111MODULE.

Module dependencies are automatically downloaded to the `pkg/mod` subdirectory of the directory indicated by the `$GOPATH` environment variable.

To remove all downloaded modules, use `go clean -modcache`

<br/>

### Testing

Go has a lightweight test framework composed of the `go test` command and the `testing` package.

- A test file should be named ending with `_test.go`
- A test function should be named like `TestXXX` with signature like `func (t *testing.T)`
- If the function calls a failure function such as `t.Error` or `t.Fail`, the test is considered to have failed.

```go
package morestrings

import "testing"

func TestReverseRunes(t *testing.T) {
	cases := []struct {
		in, want string
	}{ // shortcut to initialize anonymous struct
		{"Hello, world", "dlrow ,olleH"},
		{"Hello, 世界", "界世 ,olleH"},
		{"", ""},
	}
	for _, c := range cases {
		got := ReverseRunes(c.in)
		if got != c.want {
			t.Errorf("ReverseRunes(%q) == %q, want %q", c.in, got, c.want)
		}
	}
}

// run the tests
go test
go test -v
// PASS
// ok  	example.com/user/morestrings 0.165s
```

<br/>

### Commenting

 Go provides C-style `/* */` **block comments** and C++-style `//` **line comments**

<br/>

### Type of Data

A **variable** is a storage location for holding a value. The set of permissible values is determined by the variable's type.

- Go can infer the type of initialized variables so a type is optional
    - `var a = "initial"` same as `var a string = "string value"`
- declare multiple variables in one line: `var b, c int = 1, 2`
- shorthand for declaring and assigning value to a variable: `f := "apple"`

A **variable declaration** or, for function parameters and results, the signature of a function declaration or function literal reserves storage for a named variable.

**Structured variables** of _array, slice, and struct_ types have elements and fields that may be addressed individually. Each such element acts like a variable.

The **static type** of a variable is the type given in its declaration, the type provided in the _new_ call or composite literal, or the type of an element of a structured variable.

Variables of interface type also have a distinct **dynamic type**, which is the concrete type of the value assigned to the variable at run time

```go
var x interface{}  // x is nil and has static type interface{}
var v *T           // v has value nil, static type *T
x = 42             // x has value 42 and dynamic type int
x = v              // x has value (*T)(nil) and dynamic type *T
```

type declarations:
```go
type (
	A1 = string
	A2 = A1
)
```

**Constants**

There are boolean constants, rune constants, integer constants, floating-point constants, complex constants, and string constants.

There are no constants denoting the IEEE-754 negative zero, infinity, and not-a-number values

A constant may be given a type explicitly by a constant declaration or conversion, or implicitly when used in a variable declaration or an assignment or as an operand in an expression.

- declares a constant with `const s string = "string constant"`
- `const` can be used anywhere `var` is used

**Numbers**

A numeric type represents sets of integer or floating-point values.

```go
uint8       the set of all unsigned  8-bit integers (0 to 255)
uint16      the set of all unsigned 16-bit integers (0 to 65535)
uint32      the set of all unsigned 32-bit integers (0 to 4294967295)
uint64      the set of all unsigned 64-bit integers (0 to 18446744073709551615)

int8        the set of all signed  8-bit integers (-128 to 127)
int16       the set of all signed 16-bit integers (-32768 to 32767)
int32       the set of all signed 32-bit integers (-2147483648 to 2147483647)
int64       the set of all signed 64-bit integers (-9223372036854775808 to 9223372036854775807)

float32     the set of all IEEE-754 32-bit floating-point numbers
float64     the set of all IEEE-754 64-bit floating-point numbers

complex64   the set of all complex numbers with float32 real and imaginary parts
complex128  the set of all complex numbers with float64 real and imaginary parts

byte        alias for uint8
rune        alias for int32

uint        either 32 or 64 bits
int         same size as uint
uintptr     an unsigned integer large enough to store the uninterpreted bits of a pointer value
```

**Strings**

A string type represents the set of string values. String value is a sequence of bytes: `"go lang"`

- string length can be obtained from function `len(str)`
- chars within a string can be accessed with `str[i]`
- range can also be used on a string value to iterate through its chars

**Numbers<->Strings**

**Operators and punctuation**

```
+    &     +=    &=     &&    ==    !=    (    )
-    |     -=    |=     ||    <     <=    [    ]
*    ^     *=    ^=     <-    >     >=    {    }
/    <<    /=    <<=    ++    =     :=    ,    ;
%    >>    %=    >>=    --    !     ...   .    :
     &^          &^=
```

**Keywords reserved**

```
break        default      func         interface    select
case         defer        go           map          struct
chan         else         goto         package      switch
const        fallthrough  if           range        type
continue     for          import       return       var
```

**Arrays** is a numbered sequence of elements of a specific length.

```go
var a [5]int // declare an array
a[4] = 100 // access specific index
b := [5]int{1, 2, 3, 4, 5} // declare and assign with initialized list of elements
var twoD [2][3]int // declare an 2D array
p := [1000]*float64 // array of float64 pointers
for _, num := range nums { // use range on array
  sum += num
}
```

**Slices** is a descriptor for a contiguous segment of an underlying array and provides access to a numbered sequence of elements from that array.

A slice can be taken from another slice or from an array

```go
b := [5]int{11, 22, 33, 44, 55}
l := b[2:5] // in fact takes indexes from [start:end), so 2-4 in this case
l = b[:4] // takes indexes 0-3 in this case
l = b[2:] // takes indexes 2-4 in this case
l = []string{"g", "h"} // declare and initialize a slice
c := make([]int, len(b)) // make a slice with initial length
copy(c, b) // copy values from another slice
c = append(c, 100, 200) // can dynamically add elements to a slice
```

**Maps** are Go’s built-in associative data type aka hashes or dicts in other language

```go
m := make(map[string]int) // create a map with [key-type]value-type
m["key1"] = 1 // access key and modify value
val, exists := m["key2"] // 2nd value is a boolean indicates whether key2 defined
len(m) // gives the number of key/value pairs
delete(m, "key2") // deletes a key/value pair
for k, v := range m { // use range on map
  fmt.Printf("%s -> %s\n", k, v)
}
```

**Structs** are mutable and typed collections of fields

- useful for grouping data together to form records.
- A field declaration may be followed by an optional string literal **tag**, which becomes an **attribute** for all the fields in the corresponding field declaration.
    - An empty tag string is equivalent to an absent tag.
    - The tags are made visible through a reflection interface and take part in type identity for structs but are otherwise ignored.
- Go supports methods defined on struct types.
- An embedded field must be specified as a type name T or as a pointer to a non-interface type name *T, and T itself may not be a pointer type.
    - The unqualified type name acts as the field name.
    - field names must be unique in a struct type, so cannot have more than one embedded field of the same type

```go
type person struct {
  name string
  age  int "tag string for age"
  T1 // embedded field of type T1
}
func newPerson(name string) *person {
  p := person{name: name} // specify values to the variables in the struct
  p.age = 42 // explicitly change the value
  return &p
}
```

**Zero values**

When storage is allocated for a variable, either through a **declaration** or a call of `new`, or when a new value is created, either through a **composite literal** or a call of `make`, and no **explicit initialization** is provided, the variable or value is given a _default value_.

`false` for **booleans**, `0` for **numeric** types, `""` for **strings**, and `nil` for **pointers, functions, interfaces, slices, channels, and maps**.

This initialization is done recursively.

<br/>

### Conditions

**If-else** condition block is just like other programming language. There is no ternary form, however.

Note that you don’t need parentheses around conditions in Go. This is true for loops as well.

```go
// A statement can precede conditionals;
// any variables declared here are available in all branches
if num := f(); num < 0 {
  fmt.Println(num, "is negative")
} else if num < 10 {
  fmt.Println(num, "has 1 digit")
} else {
  fmt.Println(num, "has multiple digits")
}
```

**Switch** block conditions are evaluated left-to-right and top-to-bottom

- the first one that equals the switch expression triggers execution of the statements of the associated case; the other cases are skipped
- `default` condition can appear anywhere in the block
- use keyword `fallthrough` to fallthrough

```go
switch code := f(); {
default: s3() // can appear anywhere in this block
case 0, 1, 2, 3: s1() // there is a hidden break for each case
case 4, 5, 6, 7: fallthrough // is necessary to fallthrough to next case
case 8, 9 , 10, 11:
  s2()
  s3()
}
```

<br/>

### Loops

**for** is Go’s only looping construct.

```go
for j := 7; j <= 9; j++ {
  fmt.Println(j)
}
```

for loop used in a while fashion:

```go
i := 1
for i <= 30 {
  if i%2 == 0 {
    continue
  }
  fmt.Println(i)
  i = i + 1
}
```

while true fashion loop terminates with **break**

```go
for {
  fmt.Println("loop")
  break
}
```

for with range; like a for-each loop but with access to index

```go
var a [10]string
for i, s := range a { // i is index; s is a[i]
  g(i, s) // do something for that values
}
```

<br/>

### Functions

A few things special in golang's **functions**:

- A function can be assigned to a variable or invoked directly.
- A function can return another function
- A function can accept a variable number of arguments of the same type and saved as an array variable in the function body.
    - it has to be the last argument type in the function signature
- There can be **multiple return values** from a function
- If no return values expected, can omit the return type

```go
func(a, b int, z float64) bool { // return value is defined outside parentheses
  return a*b < int(z)
}
f := func(x, y int) (int, int) { return x + y, x - y }
func(s ...string) { // variadic parameter list
  // can be invoked with zero or more arguments for that parameter.
}
```

Function literals are **closures**: they may refer to variables defined in a surrounding function.

```go
func intSeq() func() int { // returns the anonymous function
  i := 0
  return func() int {
    i++
    return i
  } // this function closes over the variable i to form a closure
    // it captures its own i value, which will be updated each time it is called
    // until a new instance of this anonymous function is obtained from calling intSeq()
}
```

<br/>

### Special Statements

A **select statement** chooses which of a set of possible **send** or **receive** operations will proceed. It looks similar to a _switch statement_ but with the cases all referring to **communication** operations. Some rules:

1. For all the cases in the statement, the channel operands of receive operations and the channel and right-hand-side expressions of **send** statements are evaluated **exactly once**
- evaluation will occur irrespective of which (if any) communication operation is selected to proceed.
2. If one or more of the communications can proceed, a single one that can proceed is chosen via a uniform pseudo-random selection.
3. Unless the selected case is the default case, the respective communication operation is executed.
4. If the selected case is a RecvStmt with a short variable declaration or an assignment, the left-hand side expressions are evaluated and the received value (or values) are assigned.
5. The statement list of the selected case is executed.

Go’s `select` lets you wait on multiple channel operations. Combining goroutines and channels with select is a powerful feature of Go.

```go
package main

import (
    "fmt"
    "time"
)

func main() {
  c1 := make(chan string)
  c2 := make(chan string)
  go func() {
    time.Sleep(1 * time.Second)
    c1 <- "one"
  }()
  go func() {
    time.Sleep(2 * time.Second)
    c2 <- "two"
  }()
  for i := 0; i < 2; i++ {
    select { // blocks until either one of the channels got a message
    case msg1 := <-c1:
      fmt.Println("received", msg1)
    case msg2 := <-c2:
      fmt.Println("received", msg2)
    }
  }
}
```

A **defer** statement is used to ensure that a function call is **performed later** at the end of the current function scope, usually for purposes of **cleanup**.

Check for errors in a deferred function, if applicable.

```go
func main() {
  f := createFile("/tmp/defer.txt")
  defer closeFile(f) // will be executed at the end of the enclosing function (main)
  writeFile(f)
}
```

<br/>

### Methods

**Methods** differ from functions in that it takes a receiver type

- The receiver is specified via an **extra** parameter section preceding the method name.
- receiver type can be a single defined type that is either **pointer** or **value** and non-variadic parameter type
    - must be defined in the same package as the method
    - the method is said to be **bound** to its **receiver base type** and the method name is **visible** only within selectors for type T or *T.
    - the non-blank identifier (receiver name) must be unique in the method signature (against other arguments)
- method can still take in arguments like a function does
- Go automatically handles **conversion between values and pointers** for method calls
- The type of a method is the type of a function with the receiver as first argument
    - i.e. `func(r *rect)`

```go
func (r *rect) area() int { // prefered for most cases
    return r.width * r.height
}
func (r rect) perim() int {
    return 2 * (r.width + r.height)
}
r = rect{width: 10, height: 5}
r.area() // auto convert to pointer type and pass in `r`
r.perim()
```

A type may have a method set associated with it.

- In a method set, each method must have a unique non-blank method name.
- The method set of a type determines the interfaces that the type implements and the methods that can be called using a receiver of that type.
    - The method set of an interface type is its interface.
    - The method set of any other type T consists of all methods declared with receiver type T.
    - The method set of the corresponding pointer type *T is the set of all methods declared with receiver *T or T
    - Any other type has an empty method set.

<br/>

### Interfaces

Interfaces are named collections of **method signatures**

```go
type geometry interface {
  area() float64
  perim() float64
}
```

To implement an interface in Go, we just need to implement all the methods in the interface.

```go
type rect struct {
  width, height float64
}
func (r rect) area() float64 {
  return r.width * r.height
}
func (r rect) perim() float64 {
  return 2*r.width + 2*r.height
}
```

If a variable has an interface type, then we can call methods that are in the named interface.

```go
func measure(g geometry) {
  fmt.Println(g)
  fmt.Println(g.area())
  fmt.Println(g.perim())
}
func main() {
  r := rect{width: 3, height: 4}
  measure(r)
}
```

The `interface{}` type is the interface that has no methods. So essentially all types implements this interface.

If you write a function that takes an interface{} value as a parameter, you can supply that function with any value.

<br/>

### Exceptions and Errors

By convention, errors are the last return value and have type `error`, a built-in _interface_.

```go
type error interface {
	Error() string
}
```

Can construct a basic error value with `errors.New("Error Message")`

```go
func foo(arg int) (int, error) {
  if arg < 0 {
    return -1, errors.New("invalid input") // constructs a basic error value with the given error message.
  }
  return arg + 3, nil // A nil value in the error position indicates that there was no error.
}
```

It’s possible to use custom types as errors by implementing the `Error()` _method_ on them.

```go
type argError struct {
    arg  int
    prob string
}
func (e *argError) Error() string {
    return fmt.Sprintf("%d - %s", e.arg, e.prob)
}
func foo2(arg int) (int, error) {
  if arg < 0 {
    return -1, &argError{arg, "can't work with it"} // build a new struct
  }
  return arg + 3, nil
}
// consume the error
if v, e := foo(-5); e != nil {
  fmt.Println("foo failed:", e)
} else {
  fmt.Println("foo worked:", v)
}
// or
v, e := foo2(-5)
if errorInstance, ok := e.(*argError); ok {
  // here used a syntax to dereference the error pointer back to its instance
  fmt.Println(errorInstance.arg)
  fmt.Println(errorInstance.prob)
}
```

**Panics** typically means something went unexpectedly wrong. The program should fail fast when this type of error happens.

When calling `panic(message)` inside a function, it will immediate exit the current function, then waits for all other deferred functions in the callstack to run, then the program is terminated and error condition reported.

A **recover** function allows a program to manage behavior of a panicking goroutine.

```go
func protect(g func()) {
	defer func() {
		log.Println("done")  // Println executes normally even if there is a panic
		if x := recover(); x != nil {
			log.Printf("run time panic: %v", x)
		}
	}()
	log.Println("start")
	g() // run-time panics raised will be protected by the recover() in the deferred function
}
```

The return value of `recover` is `nil` if any of the following conditions holds:

- panic's argument was `nil`
- the goroutine is not panicking
- recover was not called directly by a deferred function.

Note that unlike some languages which use exceptions for handling of many errors, in Go it is idiomatic to use **error-indicating return values** wherever possible.

**Run-time panics**

Execution errors such as attempting to index an array out of bounds trigger a run-time panic equivalent to a call of the built-in function `panic` with a value of the implementation-defined interface type `runtime.Error`.

That type satisfies the predeclared interface type `error`. The exact error values that represent distinct run-time error conditions are unspecified.

```go
package runtime

type Error interface {
	error
	// and perhaps other methods
}
```

Read more https://blog.golang.org/error-handling-and-go

<br/>

### Threading and Goroutines

A `go` statement starts the execution of a _function call_ as an **independent concurrent thread/process** of control, or **goroutine**, within the same _address space_.

Unlike with a regular function call, program execution does not wait for the invoked function to complete (**non-blocking**) by the goroutine.

The expression must be a function or method call; it cannot be parenthesized.

Cannot start goroutine on _built-in functions_ and _expression statements_.

```go
f("direct") // invoke a function
go f("goroutine") // start a goroutine calling a function
go func(msg string) { // start a goroutine calling an anonymous function
  fmt.Println(msg)
}("going")
```

<br/>

### Pipes and Channels

**Channels** are the **pipe-equivalent** in golang that connect **concurrent goroutines**.

You can _send_ values into channels from one goroutine and _receive_ those values into another goroutine, of a specified element type for the values passed.

```go
chan T          // can be used to send and receive values of type T
chan<- float64  // can only be used to send float64s
<-chan int      // can only be used to receive ints
```

The optional `<-` operator specifies the channel direction, _send_ or _receive_. If no direction is given, the channel is _bidirectional_. A channel may be constrained only to send or only to receive by **assignment** or **explicit conversion**.

A new, initialized channel value can be made using the built-in function `make`, which takes the _channel type_ and an optional _capacity_ as arguments

- The capacity, in number of elements, sets the size of the **buffer** in the channel (**non-blocking** unless the buffer is full).
- If the capacity is zero or absent, the channel is unbuffered and communication succeeds ONLY when both a sender and receiver are ready (**blocking**).
- A nil channel is never ready for communication and blocks forever.
- Channels act as first-in-first-out queues.
- A channel may be closed with the built-in function `close`.
- `cap` and `len` can be called on a channel anywhere without additional synchronization
- A receive operation on a closed channel can always proceed **immediately**, yielding the element type's _zero value_ after any previously sent values have been received.

```go
make(chan int, 100) // creates a non-blocking channel with buffer size of 100 int values
messages := make(chan string) // creates a blocking channel of type string for values

go func() { messages <- "ping" }() // sends a value to the channel

msg := <-messages // receives a value to the channel
msg, more := <-messages // more is a boolean specify whether the buffer is empty

close(messages) // close a channel; then the `more` value will be false if the channel `messages` has been closed and all values in the channel have already been received
```

Simple synchronization using blocking channel

```go
package main

import (
    "fmt"
    "time"
)

func worker(done chan bool) {
  fmt.Print("working...")
  time.Sleep(time.Second)
  fmt.Println("done")
  done <- true
}

func main() {
  done := make(chan bool, 1)
  go worker(done)
  <-done // blocks until a value is received
}
```

Use a `range` loop to drain the elements in a buffered channel

```go
queue := make(chan string, 2)
queue <- "one"
queue <- "two"
close(queue) // it’s possible to close a non-empty channel but still have the remaining values be received from its buffer
for elem := range queue {
  fmt.Println(elem)
}
```

<br/>

### Reference/Pointers

A pointer type denotes the set of all pointers to variables of a given type, called the base type of the pointer.

- The value of an uninitialized pointer is nil.
- Pass a pointer to a function will ensure the changes on the variable referenced by the pointer will be reflected everywhere that variable is used.

```go
func zeroptr(iptr *int) {
    *iptr = 0 // dereference the pointer and change its value
}
z := 100
zeroptr(&z) // pass in the pointer of variable 'z'
```

<br/>

### Recursion

Nothing big regarding writing recursive functions in golang

```go
func fact(n int) int {
  if n == 0 {
    return 1
  }
  return n * fact(n-1)
}
```
