---
layout: note_page
title: Go library modules and usecases examples
title_short: go_libs_usecases
dateStr: 2020-04-01
category: Language
tags: notes reference check
---

This is set of notes is taking from https://golang.org/ref/spec and https://gobyexample.com/

This set of notes will show some use cases simple implementations using go's library modules.

All golang packages: https://golang.org/pkg/

Good source of golang updates: https://blog.golang.org/

<br/>

### `time` package

When requesting external resources or doing work that need to bound to an **execution time limit**, we can achieve it using the `<-time.After` function from the `"time"` package.

This function awaits a value to be sent after the specified timeout.

```go
c1 := make(chan string, 1)
go func() {
  time.Sleep(2 * time.Second)
  c1 <- "result 1"
}()
select {
case res := <-c1:
  fmt.Println(res)
case <-time.After(1 * time.Second):
  fmt.Println("timeout 1")
}
```

When trying to schedule a goroutine in a future time, or to schedule a function at some interval, use the built-in `timer` and `ticker` from the `"time"` package

**Timers** represent a single _event_ in the future. You tell the timer how long you want to wait, and it provides a **channel** that will be notified at that time.

```go
timer1 := time.NewTimer(2 * time.Second)
<-timer1.C // blocks until the timer event is received
fmt.Println("Timer 1 fired") // will print after 2 seconds

time.Sleep(2 * time.Second) // achieves the same thing above timer does
```

**Tickers** can schedule a function repeatedly at regular intervals

```go
package main

import (
  "fmt"
  "time"
)

func main() {
  ticker := time.NewTicker(500 * time.Millisecond)
  done := make(chan bool)
  go func() {
    for {
      select {
      case <-done:
        return
      case t := <-ticker.C:
        fmt.Println("Tick at", t)
      }
    }
  }()

  time.Sleep(1600 * time.Millisecond)
  ticker.Stop()
  done <- true
  fmt.Println("Ticker stopped")
}
```

**Rate limit** is a common requirement to consider when designing a service. In go this can be achieved using the **tickers** as a source of creating "gaps" between processing requests.

```go
package main

import (
  "fmt"
  "time"
)

func main() {
  requests := make(chan int, 5)
  for i := 1; i <= 5; i++ {
    requests <- i
  }
  close(requests)
  limiter := time.Tick(200 * time.Millisecond)

  for req := range requests {
    <-limiter
    fmt.Println("request", req, time.Now())
  }

  burstyLimiter := make(chan time.Time, 3)
  for i := 0; i < 3; i++ {
    burstyLimiter <- time.Now()
  }
  go func() {
    for t := range time.Tick(200 * time.Millisecond) {
      burstyLimiter <- t
    }
  }()
  burstyRequests := make(chan int, 5)
  for i := 1; i <= 5; i++ {
    burstyRequests <- i
  }
  close(burstyRequests)
  for req := range burstyRequests {
    <-burstyLimiter
    fmt.Println("request", req, time.Now())
  }
}
```

<br/>

### Channel and goroutine with `sync` package

A simple worker pool implementation using channels

```go
package main

import (
  "fmt"
  "time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
  for j := range jobs {
    fmt.Println("worker", id, "started  job", j)
    time.Sleep(time.Second)
    fmt.Println("worker", id, "finished job", j)
    results <- j * 2
  }
}

func main() {
  const numJobs = 5
  jobs := make(chan int, numJobs)
  results := make(chan int, numJobs)
  for w := 1; w <= 3; w++ {
    go worker(w, jobs, results)
  }
  for j := 1; j <= numJobs; j++ {
    jobs <- j
  }
  close(jobs)
  for a := 1; a <= numJobs; a++ {
    <-results
  }
}
```

To wait for **multiple** goroutines to finish, can use wait group from `"sync"` package

```go
package main

import (
  "fmt"
  "sync"
  "time"
)

func worker(id int, wg *sync.WaitGroup) {
  defer wg.Done()
  fmt.Printf("Worker %d starting\n", id)
  time.Sleep(time.Second)
  fmt.Printf("Worker %d done\n", id)
}

func main() {
  var wg sync.WaitGroup
  for i := 1; i <= 5; i++ {
    wg.Add(1) // increment wg's counter
    go worker(i, &wg)
  }
  wg.Wait() // wait until all works returned
}
```

`"sync/atomic"` package provides atomic counters that is thread-safe and can be accessed by multiple concurrent goroutines.

```go
package main

import (
  "fmt"
  "sync"
  "sync/atomic"
)

func main() {
  var ops uint64
  var wg sync.WaitGroup
  for i := 0; i < 50; i++ {
    wg.Add(1)
    go func() {
      for c := 0; c < 1000; c++ {
        atomic.AddUint64(&ops, 1)
      }
      wg.Done()
    }()
  }
  wg.Wait()
  fmt.Println("ops:", ops) // yields 50000
}
```

`mutex` from the package `"sync"` provides a safe way for multiple goroutines to access the same data

```go
package main

import (
  "fmt"
  "math/rand"
  "sync"
  "sync/atomic"
  "time"
)

func main() {
  var state = make(map[int]int)
  var mutex = &sync.Mutex{}
  var readOps uint64
  var writeOps uint64

  for r := 0; r < 100; r++ {
    go func() {
      total := 0
      for {
        key := rand.Intn(5)
        mutex.Lock()
        total += state[key]
        mutex.Unlock()
        atomic.AddUint64(&readOps, 1)
        time.Sleep(time.Millisecond)
      }
    }()
  }
  for w := 0; w < 10; w++ {
    go func() {
      for {
        key := rand.Intn(5)
        val := rand.Intn(100)
        mutex.Lock()
        state[key] = val
        mutex.Unlock()
        atomic.AddUint64(&writeOps, 1)
        time.Sleep(time.Millisecond)
      }
    }()
  }

  time.Sleep(time.Second)
  readOpsFinal := atomic.LoadUint64(&readOps)
  fmt.Println("readOps:", readOpsFinal)
  writeOpsFinal := atomic.LoadUint64(&writeOps)
  fmt.Println("writeOps:", writeOpsFinal)
}
```

<br/>

### Stateful goroutines

To have shared states owned by a single goroutine and use channel communications to coordinate read/write to the states.

This will guarantee that the data is never corrupted with concurrent access.

```go
package main

import (
  "fmt"
  "math/rand"
  "sync/atomic"
  "time"
)

type readOp struct {
  key  int
  resp chan int
}
type writeOp struct {
  key  int
  val  int
  resp chan bool
}

func main() {
  var readOps uint64
  var writeOps uint64
  reads := make(chan readOp)
  writes := make(chan writeOp)
  go func() {
    var state = make(map[int]int) // shared state owned by this goroutine
    for {
      select { // act like a worker to process access requests
      case read := <-reads:
        read.resp <- state[read.key]
      case write := <-writes:
        state[write.key] = write.val
        write.resp <- true
      }
    }
  }()

  for r := 0; r < 100; r++ {
    go func() {
      for {
        read := readOp{
          key:  rand.Intn(5),
          resp: make(chan int)}
        reads <- read
        <-read.resp
        atomic.AddUint64(&readOps, 1)
        time.Sleep(time.Millisecond)
      }
    }()
  }
  for w := 0; w < 10; w++ {
    go func() {
      for {
        write := writeOp{
          key:  rand.Intn(5),
          val:  rand.Intn(100),
          resp: make(chan bool)}
        writes <- write
        <-write.resp
        atomic.AddUint64(&writeOps, 1)
        time.Sleep(time.Millisecond)
      }
    }()
  }

  time.Sleep(time.Second)
  readOpsFinal := atomic.LoadUint64(&readOps)
  fmt.Println("readOps:", readOpsFinal)
  writeOpsFinal := atomic.LoadUint64(&writeOps)
  fmt.Println("writeOps:", writeOpsFinal)
}
```

<br/>

### Sorting

Go’s `"sort"` package implements sorting for built-ins and user-defined types.

Note that sorting is **in-place**, so it changes the given slice and doesn't return a new one.

We can also use sort to check if a slice is already in sorted order.

```go
strs := []string{"c", "a", "b"}
sort.Strings(strs)
ints := []int{7, 2, 4}
sort.Ints(ints)
```

**Sorting by Functions** allows sort something other than its natural order, by implementing the `sort.Interface` and provide methods for `Len()`, `Less(i, j)` and `Swap(i, j)` so that `sort.Sort` can be used on

```go
package main

import (
  "fmt"
  "sort"
)

type byLength []string // an alias for []string; alias creates a type that can implement an interface
func (s byLength) Len() int {
  return len(s)
}
func (s byLength) Swap(i, j int) {
  s[i], s[j] = s[j], s[i]
}
func (s byLength) Less(i, j int) bool {
  return len(s[i]) < len(s[j])
}
func main() {
  fruits := []string{"peach", "banana", "kiwi"}
  sort.Sort(byLength(fruits)) // converting the slice into "byLength" type
  fmt.Println(fruits)
}
```

<br/>

### Work with Collection Functions

Go does not support generics like other languages does; in Go it’s common to provide **collection functions** when they are specifically needed for your program and data types.

Note that in some cases it may be clearest to just **inline** the functions directly instead of creating and calling a helper function.

```go
func Index(vs []string, t string) int {
  for i, v := range vs {
    if v == t {
      return i
    }
  }
  return -1
}
func Include(vs []string, t string) bool {
  return Index(vs, t) >= 0
}
func Any(vs []string, f func(string) bool) bool {
  for _, v := range vs {
    if f(v) {
      return true
    }
  }
  return false
}
func All(vs []string, f func(string) bool) bool {
  for _, v := range vs {
    if !f(v) {
      return false
    }
  }
  return true
}
func Filter(vs []string, f func(string) bool) []string {
  vsf := make([]string, 0)
  for _, v := range vs {
    if f(v) {
      vsf = append(vsf, v)
    }
  }
  return vsf
}
func Map(vs []string, f func(string) string) []string {
  vsm := make([]string, len(vs))
  for i, v := range vs {
    vsm[i] = f(v)
  }
  return vsm
}
```

<br/>

### Regex

Go offers built-in support for regular expressions from the `"regexp"` package

```go
package main

import (
  "bytes"
  "fmt"
  "regexp"
)

func main() {
  match, _ := regexp.MatchString("p([a-z]+)ch", "peach")
  fmt.Println(match)
  r, _ := regexp.Compile("p([a-z]+)ch") // cache the pattern struct

  fmt.Println(r.MatchString("peach"))
  fmt.Println(r.FindString("peach punch"))
  fmt.Println(r.FindStringIndex("peach punch"))
  fmt.Println(r.FindStringSubmatch("peach punch"))
  fmt.Println(r.FindStringSubmatchIndex("peach punch"))
  fmt.Println(r.FindAllString("peach punch pinch", -1))
  fmt.Println(r.FindAllStringSubmatchIndex(
      "peach punch pinch", -1))
  fmt.Println(r.Match([]byte("peach")))
  fmt.Println(r.ReplaceAllString("a peach", "<fruit>"))

  in := []byte("a peach")
  fmt.Println(r.ReplaceAllFunc(in, bytes.ToUpper))
}
```

<br/>

### JSON

Go offers built-in support for JSON encoding and decoding through the package `"encoding/json"`, including conversion to and from built-in and custom data types.

```go
package main

import (
  "encoding/json"
  "fmt"
  "os"
)

type response1 struct {
  Page   int
  Fruits []string
}
// field tags contain directives for the encoder and decoder
type response2 struct {
  Page   int      `json:"page"`
  Fruits []string `json:"fruits"`
}

func main() {
  slcD := []string{"apple", "peach", "pear"}
  slcB, _ := json.Marshal(slcD) // produces a json list string

  mapD := map[string]int{"apple": 5, "lettuce": 7}
  mapB, _ := json.Marshal(mapD) // produces a json object string

  res1D := &response1{
      Page:   1,
      Fruits: []string{"apple", "peach", "pear"}}
  res1B, _ := json.Marshal(res1D) // produces a json object string with keys as-is

  res2D := &response2{
      Page:   1,
      Fruits: []string{"apple", "peach", "pear"}}
  res2B, _ := json.Marshal(res2D) // produces a json object string with keys specified in the struct

  byt := []byte(`{"num":6.13,"strs":["a","b"]}`)
  var dat map[string]interface{} // will hold a map of strings to arbitrary data types.
  if err := json.Unmarshal(byt, &dat); err != nil {
      panic(err)
  }
  num := dat["num"].(float64) // cast values to the appropriate type
  strs := dat["strs"].([]interface{})
  str1 := strs[0].(string)

  str := `{"page": 1, "fruits": ["apple", "peach"]}`
  res := response2{} // creates a shell object
  json.Unmarshal([]byte(str), &res) // decode JSON string and save data into object

  enc := json.NewEncoder(os.Stdout) // stream JSON encoding to other things directly
  d := map[string]int{"apple": 5, "lettuce": 7}
  enc.Encode(d)
}
```

https://golang.org/pkg/encoding/json/

<br/>

### XML

`"encoding.xml"` package offers built-in support for XML

```go
package main

import (
  "encoding/xml"
  "fmt"
)

// field tags contain directives for the encoder and decoder
type Plant struct {
  XMLName xml.Name `xml:"plant"` // the root element
  Id      int      `xml:"id,attr"` // an attribute of this element
  Name    string   `xml:"name"` // an element
  Origin  []string `xml:"origin"` // an element
}

func (p Plant) String() string {
  return fmt.Sprintf("Plant id=%v, name=%v, origin=%v",
    p.Id, p.Name, p.Origin)
}

func main() {
  coffee := &Plant{Id: 27, Name: "Coffee"}
  coffee.Origin = []string{"Ethiopia", "Brazil"}

  out, _ := xml.MarshalIndent(coffee, " ", "  ") // encode into a readable XML string
  fmt.Println(string(out))
  fmt.Println(xml.Header + string(out))

  var p Plant
  if err := xml.Unmarshal(out, &p); err != nil { // decode into a object
    panic(err)
  }
  fmt.Println(p)

  tomato := &Plant{Id: 81, Name: "Tomato"}
  tomato.Origin = []string{"Mexico", "California"}

  type Nesting struct {
      XMLName xml.Name `xml:"nesting"`
      Plants  []*Plant `xml:"parent>plant"` // to nest all <plant>s within <parent>
  }

  nesting := &Nesting{}
  nesting.Plants = []*Plant{coffee, tomato}

  out, _ = xml.MarshalIndent(nesting, " ", "  ")
  fmt.Println(string(out))
}
```

<br/>

### The time-related packages

Go's `"time"` package offers handy functions for basic time operations.

```go
package main

import (
  "fmt"
  "time"
)

func main() {
  p := fmt.Println // alias a function

  now := time.Now()
  secs := now.Unix()
  nanos := now.UnixNano()
  p(now)
  p(time.Unix(secs, 0)) // converts seconds to time string
  p(time.Unix(0, nanos)) // converts nanoseconds to time string

  then := time.Date(
      2009, 11, 17, 20, 34, 58, 651387237, time.UTC)
  p(then)
  p(then.Year())
  p(then.Month())
  p(then.Day())
  p(then.Hour())
  p(then.Minute())
  p(then.Second())
  p(then.Nanosecond())
  p(then.Location())
  p(then.Weekday())
  p(then.Before(now))
  p(then.After(now))
  p(then.Equal(now))

  diff := now.Sub(then)
  p(diff)

  p(then.Add(diff))
  p(then.Add(-diff))

  // formatting time
  t := time.Now()
  p(t.Format(time.RFC3339)) // 2014-04-15T18:00:15-07:00
  t1, e := time.Parse( // parse to get a time object
    time.RFC3339,      // from this format
    "2012-11-01T22:08:41+00:00") // actual time string
  p(t1)
  // given an example of the desired format, then time will do the formatting
  p(t.Format("3:04PM"))
  p(t.Format("Mon Jan _2 15:04:05 2006"))
  p(t.Format("2006-01-02T15:04:05.999999-07:00"))
  form := "3 04 PM"
  t2, e := time.Parse(form, "8 41 PM")
  p(t2)
}
```

<br/>

### Random Numbers

Go’s `"math/rand"` package provides pseudorandom number generation.
Use `"crypto/rand"` for random numbers for security related tasks.

```go
package main

import (
  "fmt"
  "math/rand"
  "time"
)

func main() {
  fmt.Println(rand.Intn(100)) // generates an integer from [0,100)
  fmt.Println(rand.Float64()) // generates a 64-bit floating-point from [0.0, 1.0)

  s1 := rand.NewSource(time.Now().UnixNano()) // get a new seed object
  r1 := rand.New(s1) // get a new generator from the seed
  fmt.Println(r1.Intn(100))
}
```

http://golang.org/pkg/math/rand/

<br/>

### String functions

```go
package main

import (
    "fmt"
    s "strings"
)
var p = fmt.Println

func main() {
  p("Contains:  ", s.Contains("test", "es"))
  p("Count:     ", s.Count("test", "t"))
  p("HasPrefix: ", s.HasPrefix("test", "te"))
  p("HasSuffix: ", s.HasSuffix("test", "st"))
  p("Index:     ", s.Index("test", "e"))
  p("Join:      ", s.Join([]string{"a", "b"}, "-"))
  p("Repeat:    ", s.Repeat("a", 5))
  p("Replace:   ", s.Replace("foo", "o", "0", -1)) // replace all indexes
  p("Replace:   ", s.Replace("foo", "o", "0", 1))
  p("Split:     ", s.Split("a-b-c-d-e", "-"))
  p("ToLower:   ", s.ToLower("TEST"))
  p("ToUpper:   ", s.ToUpper("test"))
  p("Len: ", len("hello"))
  p("Char:", "hello"[1]) // numerical char value is evaluated
}
```

http://golang.org/pkg/strings/

https://blog.golang.org/strings more on wide multi-byte characters

`"fmt"` offers `Printf` that can help print out formatted results

```go
package main

import (
  "fmt"
  "os"
)

type point struct {
    x, y int
}

func main() {
  p := point{1, 2}
  fmt.Printf("%v\n", p) // p's object values
  fmt.Printf("%+v\n", p) // p's object values and field names if p is a struct
  fmt.Printf("%#v\n", p) // the source code snippet that would produce p
  fmt.Printf("%T\n", p) // the type of p
  fmt.Printf("%t\n", true) // for boolean
  fmt.Printf("%d\n", 123) // for base-10 integer
  fmt.Printf("%b\n", 14) // for binary representation
  fmt.Printf("%c\n", 33) // for char value of the integer
  fmt.Printf("%x\n", 456) // for hex representation
  fmt.Printf("%f\n", 78.9) // for floating-point number
  fmt.Printf("%e\n", 123400000.0) // for scientific notation
  fmt.Printf("%E\n", 123400000.0) // for scientific notation
  fmt.Printf("%s\n", "\"string\"") // for string
  fmt.Printf("%q\n", "string") // add quotes around the string
  fmt.Printf("%x\n", "hex this") // renders string in base-16
  fmt.Printf("%p\n", &p) // for pointer representation
  fmt.Printf("|%6d|%6d|\n", 12, 345)  // control the width of the print
  fmt.Printf("|%6.2f|%6.2f|\n", 1.2, 3.45) // control the precision after '.'
  fmt.Printf("|%-6s|%-6s|\n", "foo", "b") // left-justify the print
  s := fmt.Sprintf("a %s", "string") // saves formatted string as output
  fmt.Fprintf(os.Stderr, "an %s\n", "error") // prints to other io.Writers
}
```

The package `"strconv"` offers functions to parse numbers from strings

```go
package main

import (
  "fmt"
  "strconv"
)

func main() {
  f, _ := strconv.ParseFloat("1.234", 64) // parse a 64-bit precision floating point
  i, _ := strconv.ParseInt("123", 0, 64) // 0 means auto-base, 64-bit integer
  k, _ := strconv.Atoi("135") // parse a base-10 integer
  _, e := strconv.Atoi("wat") // error on bad input
}
```

<br/>

### URL Parsing

The packages `"net"` and `"net/url"` provides functions to parse URLs

```go
package main

import (
  "fmt"
  "net"
  "net/url"
)

func main() {
  s := "postgres://user:pass@host.com:5432/path?k=v#f"

  u, err := url.Parse(s)
  if err != nil {
      panic(err)
  }

  fmt.Println(u.Scheme) // postgres
  fmt.Println(u.User) // user:pass
  fmt.Println(u.User.Username()) // user
  p, _ := u.User.Password() // pass
  fmt.Println(u.Host) // host.com:5432
  host, port, _ := net.SplitHostPort(u.Host)
  fmt.Println(u.Path) // /path
  fmt.Println(u.Fragment) // f

  fmt.Println(u.RawQuery) // k=v everything between '?' and '#'
  m, _ := url.ParseQuery(u.RawQuery)
  fmt.Println(m) // map[k:[v]]
  fmt.Println(m["k"][0]) // v
}
```

<br/>

### Encryption and Hashing Functions

Go implements several hash functions in various `"crypto/*"` packages. Go provides built-in support for base64 encoding/decoding from the `"encoding/base64"` package, which can do URL encoding.

```go
package main

import (
  "crypto/sha1" // others like "crypto/md5" "crypto/sha256" has similar usage
  b64 "encoding/base64"
  "fmt"
)

func main() {
  s := "sha1 this string"
  h := sha1.New()
  h.Write([]byte(s)) // create a byte array from the string and pass in
  bs := h.Sum(nil)  // creates the final hash; the argument will be appended another byte slice to the end of the existing byte slice (such as a salt)
  fmt.Println(s)
  fmt.Printf("%x\n", bs) // sha values usually printed in hex

  data := "abc123!?$*&()'-=@~"
  stdEncode := b64.StdEncoding.EncodeToString([]byte(data))
  stdDecode, _ := b64.StdEncoding.DecodeString(sEnc)

  urlEnc := b64.URLEncoding.EncodeToString([]byte(data))
  urlDec, _ := b64.URLEncoding.DecodeString(uEnc)
}
```

<br/>

### File I/O

Reading and writing files are basic tasks needed for many Go programs. Some related packages: `"bufio" "fmt" "io" "io/ioutil" "os"`

```go
package main

import (
  "bufio"
  "fmt"
  "io"
  "io/ioutil"
  "os"
)

func check(e error) { // always check error for file operations
  if e != nil {
    panic(e)
  }
}

func main() {
  dat, err := ioutil.ReadFile("/tmp/dat") // reads entire file into memory
  check(err)

  f, err := os.Open("/tmp/dat") // open a file to gain more control over various file operations
  check(err)
  b1 := make([]byte, 5) // make a byte array with a fixed size
  n1, err := f.Read(b1) // read bytes in, up to the size of the array; n1 is number of bytes actually read
  check(err)
  fmt.Printf("%d bytes: %s\n", n1, string(b1[:n1]))

  o3, err := f.Seek(6, 0) // start next read from a byte position in the file check(err)
  b3 := make([]byte, 2)
  n3, err := io.ReadAtLeast(f, b3, 2)

  _, err = f.Seek(0, 0) // rewind to the beginning of this file

  r4 := bufio.NewReader(f)
  b4, err := r4.Peek(5) // directly returns the byte array for you
  check(err)
  fmt.Printf("5 bytes: %s\n", string(b4))

  f.Close()

  d1 := []byte("hello\ngo\n")
  err := ioutil.WriteFile("/tmp/dat1", d1, 0644) // write a byte array to a file directly
  check(err)

  f, err := os.Create("/tmp/dat2") // create an empty file
  check(err)
  defer f.Close() // will close the file when out of scope
  d2 := []byte{115, 111, 109, 101, 10}
  n2, err := f.Write(d2) // write some bytes into the file
  check(err)
  n3, err := f.WriteString("writes\n") // write a string into the file
  check(err)
  f.Sync() // flush writes to the disk

  w := bufio.NewWriter(f) // buffered writer
  n4, err := w.WriteString("buffered\n") // write a string to the file
  check(err)
  w.Flush() // flush writes to the disk
}
```

A _line filter_ is a common type of program that reads input on STDIN, processes it, and then prints some derived result to STDOUT. `grep` and `sed` are common line filters.

This is an example line filter written with go.

```go
package main

import (
  "bufio"
  "fmt"
  "os"
  "strings"
)

func main() {
  scanner := bufio.NewScanner(os.Stdin)

  for scanner.Scan() {
    ucl := strings.ToUpper(scanner.Text())
    fmt.Println(ucl)
  }

  if err := scanner.Err(); err != nil {
    fmt.Fprintln(os.Stderr, "error:", err)
    os.Exit(1)
  }
}
```

<br/>

### Files, Directories

The `"path/filepath"` package provides lots of convenient functions to parse and construct **file paths** in a way that is **portable between operating systems**

The `"os"` package offers functions for interacting with **files and directories**

```go
package main

import (
  "fmt"
  "io/ioutil"
  "os"
  "path/filepath"
  "strings"
)

func main() {
  p := filepath.Join("dir1", "dir2", "filename") // prepare a path by concatenate tokens
  fmt.Println(filepath.Join("dir1//", "filename")) // implicitly take care of extra chars
  fmt.Println(filepath.Join("dir1/../dir1", "filename")) // implicitly evaluate '..'
  fmt.Println("Dir(p):", filepath.Dir(p)) // the path to the parent dir of the file
  fmt.Println("Base(p):", filepath.Base(p)) // the base of the path, could be a dir or file
  fmt.Println(filepath.IsAbs("dir/file")) // judge if it is an absolute path or relative path
  fmt.Println(filepath.IsAbs("/dir/file"))

  filename := "config.json"
  ext := filepath.Ext(filename) // gets the extension of the file
  fmt.Println(strings.TrimSuffix(filename, ext)) // rid of extension

  rel, err := filepath.Rel("a/b", "a/b/t/file") // finds relative path between the two dirs (they must share a common root)
  if err != nil {
      panic(err)
  }

  err := os.Mkdir("subdir", 0755) // creates a dir in current working directory
  check(err)
  defer os.RemoveAll("subdir") // remove a dir tree; it is good practice to defer removing temp dirs

  createEmptyFile := func(name string) {
    d := []byte("")
    check(ioutil.WriteFile(name, d, 0644)) // creates an empty file
  }
  createEmptyFile("subdir/file1")

  err = os.MkdirAll("subdir/parent/child", 0755) // create a hierarchy of dirs
  check(err)
  c, err := ioutil.ReadDir("subdir/parent") // lists dir contents, returns a slice of `os.FileInfo` objects
  check(err)
  for _, entry := range c {
    fmt.Println(" ", entry.Name(), entry.IsDir()) // some functions on the os.FileInfo
  }

  err = os.Chdir("subdir/parent/child") // change the current working directory
  check(err)
  c, err = ioutil.ReadDir(".") // list current dir contents
  check(err)

  fmt.Println("Visiting subdir")
  err = filepath.Walk("subdir", visit) // accepts a callback function to handle every file or directory visited

  f, err := ioutil.TempFile("", "sample") // creates and open a temp file for read/write; "" as first arg tells to create the file in OS default temp location
  check(err)
  defer os.Remove(f.Name())

  dname, err := ioutil.TempDir("", "sampledir") // similarly create a temp dir
  check(err)
  defer os.RemoveAll(dname)

  fname := filepath.Join(dname, "file1")
  err = ioutil.WriteFile(fname, []byte{1, 2}, 0666)
  check(err)
}

func visit(p string, info os.FileInfo, err error) error {
  if err != nil {
    return err
  }
  fmt.Println(" ", p, info.IsDir())
  return nil
}
```

<br/>

### Testing

The `"testing"` package provides the tools we need to write unit tests and the `go test` command runs tests.

```go
package main

import (
  "fmt"
  "testing"
)

func IntMin(a, b int) int {
  if a < b {
    return a
  }
  return b
}

func TestIntMinTableDriven(t *testing.T) {
  var tests = []struct {
    a, b int
    want int
  }{ // shortcut to initialize anonymous struct
    {0, 1, 0},
    {1, 0, 0},
    {2, -2, -2},
    {0, -1, -1},
    {-1, 0, -1},
  }
  for _, tt := range tests {
    testname := fmt.Sprintf("%d,%d", tt.a, tt.b)
    t.Run(testname, func(t *testing.T) {
      ans := IntMin(tt.a, tt.b)
      if ans != tt.want {
        t.Errorf("got %d, want %d", ans, tt.want) // report test failure and continue
        t.Fail("fail this test") // report test failure and stop this test immediately
      }
    })
  }
}
```

<br/>

### Command, Environment Variables

Use `"os"` package to access command-line args passed in when running the program. Need to build a binary using `go build` command first. It also provides functions to get/set environment variables.

Go provides a `"flag"` package supporting basic command-line flag parsing. Using this package, it is easy to define **subcommands** that expect their own flags.

```go
package main

import (
  "flag"
  "fmt"
  "os"
)

func main() {
  argsWithProg := os.Args // a slice of the arguments
  argsWithoutProg := os.Args[1:] // first value is the path to the program
  os.Setenv("FOO", "1")
  fmt.Println("FOO:", os.Getenv("FOO"))
  for _, e := range os.Environ() { // os.Environ returns a list of env vars and values
    pair := strings.SplitN(e, "=", 2)
  }

  wordPtr := flag.String("word", "foo", "a string") // declare a flag for string with a default value; returns a pointer reference
  numbPtr := flag.Int("numb", 42, "an int")
  boolPtr := flag.Bool("fork", false, "a bool")

  var svar string
  flag.StringVar(&svar, "svar", "bar", "a string var") // declare an option that uses an existing var; pass-by-reference

  flag.Parse() // execute command-line parsing operation

  fmt.Println("word:", *wordPtr)
  fmt.Println("numb:", *numbPtr)
  fmt.Println("fork:", *boolPtr)
  fmt.Println("svar:", svar)
  fmt.Println("tail:", flag.Args()) // get all trailing tokens (flags should be passed before these tokens otherwise won't be picked up)
  // pass in -h/--help for a list of help text for each option supported
  // undefined flag option will also result in help text being printed

  fooCmd := flag.NewFlagSet("foo", flag.ExitOnError) // declare a subcommand
  fooEnable := fooCmd.Bool("enable", false, "enable") // define option for this subcommand
  fooName := fooCmd.String("name", "", "name")
  barCmd := flag.NewFlagSet("bar", flag.ExitOnError)
  barLevel := barCmd.Int("level", 0, "level")

  switch os.Args[1] {
  case "foo":
      fooCmd.Parse(os.Args[2:])
  case "bar":
      barCmd.Parse(os.Args[2:])
  default:
      fmt.Println("expected 'foo' or 'bar' subcommands")
      os.Exit(1)
  }
}
```

<br/>

### Processes and Signals

Sometimes it is useful to spawn other processes to handle work outside of this program using other programs. Then the package `"io/ioutil"` and `"os/exec"` will be helpful.

While `"syscall"` package performs deep level process manipulation and allow us to replace current process with a new process.

```go
package main

import (
  "fmt"
  "io/ioutil"
  "os/exec"
  "syscall"
)

func main() {
  dateCmd := exec.Command("date") // creates an object to represent an external process running this command
  dateOut, err := dateCmd.Output() // run the command string and collect its output
  if err != nil {
    panic(err)
  }

  grepCmd := exec.Command("grep", "hello") // build command with arguments
  grepIn, _ := grepCmd.StdinPipe() // the channel for piping in stdin for the command
  grepOut, _ := grepCmd.StdoutPipe() // the channel for piping out stdout from the command
  grepCmd.Start() // run the command in a process
  grepIn.Write([]byte("hello grep\ngoodbye grep"))
  grepIn.Close()
  grepBytes, _ := ioutil.ReadAll(grepOut) // read from the stdout
  grepCmd.Wait() // blocks until command finish execution

  fmt.Println("> grep hello")
  fmt.Println(string(grepBytes))

  lsCmd := exec.Command("bash", "-c", "ls -a -l -h") // allows pass in a full command string
  lsOut, err := lsCmd.Output()
  if err != nil {
      panic(err)
  }

  binary, lookErr := exec.LookPath("ls") // get the absolute path to the binary
  if lookErr != nil {
    panic(lookErr)
  }
  args := []string{"ls", "-a", "-l", "-h"} // has to be in slice form
  env := os.Environ()
  execErr := syscall.Exec(binary, args, env)
  if execErr != nil {
    panic(execErr)
  }
}
```

Note that when spawning commands we need to provide an **explicitly delineated command** and **argument array**, vs. being able to just pass in one command-line string.

Also note that Go does NOT offer a classic Unix `fork` function. Usually this isn't an issue though, since starting goroutines, spawning processes, and exec'ing processes covers most use cases for fork.

It is possible a go program can receive Unix system signals during execution. We need to make sure the signals are handled correctly by using `"os/signal"` package.

```go
package main

import (
  "fmt"
  "os"
  "os/signal"
  "syscall"
)

func main() {
  sigs := make(chan os.Signal, 1)
  done := make(chan bool, 1)
  signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM) // registers the given channel to receive notifications of the specified signals
  go func() {
    sig := <-sigs // blocks this routine until one of the above signals is received
    fmt.Println(sig)
    done <- true
  }()
  fmt.Println("awaiting signal")
  <-done
  fmt.Println("exiting")
  os.Exit(0) // exits the program and returns an exit-code
}
```

Note that `defer` won't run when `os.Exit` is called.

<br/>

### HTTP Server/Client

The `"net/http"` package provides good support for issuing HTTP requests as a client, or serving contents as a simple server.

```go
package main

import (
  "bufio"
  "fmt"
  "net/http"
)

func main() {
  resp, err := http.Get("http://gobyexample.com") // a GET request
  if err != nil {
    panic(err)
  }
  defer resp.Body.Close()
  fmt.Println("Response status:", resp.Status)

  scanner := bufio.NewScanner(resp.Body)
  for scanner.Scan() {
    fmt.Println(scanner.Text())
  }
  if err := scanner.Err(); err != nil {
    panic(err)
  }
}
```

Setting up a simple HTTP server can be simple as defining some **handlers** on some **endpoints** and serve on a **port**.

A handler is an object implementing the `http.Handler` interface.

```go
package main

import (
  "fmt"
  "net/http"
)

func hello(w http.ResponseWriter, req *http.Request) {
  ctx := req.Context() // a `context.Context` is created for each request
  fmt.Println("server: hello handler started")
  defer fmt.Println("server: hello handler ended")

  select {
  case <-time.After(10 * time.Second):
    fmt.Fprintf(w, "hello\n")
  case <-ctx.Done():
    err := ctx.Err() // returns an error that explains why the Done() channel was closed
    fmt.Println("server:", err)
    internalError := http.StatusInternalServerError
    http.Error(w, err.Error(), internalError)
  }
}

func headers(w http.ResponseWriter, req *http.Request) {
  for name, headers := range req.Header {
    for _, h := range headers {
      fmt.Fprintf(w, "%v: %v\n", name, h)
    }
  }
}

func main() {
  http.HandleFunc("/hello", hello) // pass in functions to call for this endpoint
  http.HandleFunc("/headers", headers)
  http.ListenAndServe(":8090", nil) // can specify a different router if desired
}
```
