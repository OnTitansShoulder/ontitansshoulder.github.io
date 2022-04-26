---
layout: note_page
title: C++ Language Reference
title_short: cpp_language_specs
dateStr: 2022-04-01
category: Language
tags: notes reference check
---

This set of notes is taken from [learncpp.com](https://www.learncpp.com/){target=_balnk}.

C++ language references:

- [cplusplus.com](https://cplusplus.com/reference/){target=_blank}
- [cppreference.com](https://en.cppreference.com/w/){target=_blank}

Continue reading: https://www.learncpp.com/cpp-tutorial/stdvector-capacity-and-stack-behavior/

## Overview

C++ is one of the popular high level languages and requires compiling source code into machine code for computer to run. C++ excels in situations where high performance and precise control over memory and other resources is needed. Some common places where C++ shines:

- Video games
- Real-time systems, i.e. transportation, manufacturing
- Financial applications, i.e. stock exchange
- Graphical applications, simulations
- Productivity applications
- Embedded systems
- Audio and video processing
- AI and neural networks

C++ is designed to allow the programmer a high degree of freedom to do what they want, which is both wonderful and dangerous.

## Basics

### Compiler

#### Preprocessor

Prior to compilation, the code file goes through a phase known as translation. This phase involves the interpretation of **preprocessor**, which can be throught of as a separate program that manipulates the text in each code file.

Preprocessor **directives** are instructions that start with a `#` symbol and end with a _newline_ (no semicolon). Directives tell the preprocessor to perform specific particular text manipulation tasks on normal code text (non-directive lines).

Directives are only valid from the point of definition to the end of the file in which they are defined.

`#include` is one type of directive, which tells preprocessor to replace it with the contents of the included file, which gets preprocessed as well recursively.

Avoid using relative paths in `#include` directives. Instead, pass in `-I` option to specify alternate directory to look for source files. In this way, changing directory structure do not require updating the include paths.

The `#define` directive can be used to create a **macro**, a rule that defines how _input text_ is converted into replacement _output text_. Two basic types of macros: object-like macros, and function-like macros.

Object-like macros are traditionally typed in all capital letters, using underscores to represent spaces. They used to be used as a cheaper alternative to constant variables and is considered a _legacy_ feature.

A speical use case for Object-like macro with no substitution text is to remove occurrance of certain text, or serve as a marker for `#ifdef`.

`#ifdef, #ifndef, and #endif` allows the preprocessor to check whether an identifier has been previously `#defined`, and skip redefining it if that is the case. This is known as the **header guard**.

```c++
#ifndef HEADERFILENAME_H
#define HEADERFILENAME_H
// declarations
#endif
```

`#pragma once` serves as an alternate form of header guards but only supported by modern compilers, not old compilers.

In this way, when this header file is being included by multiple files that end up being merged together, they won't cause repeated declarations error.

`#if 0, #endif` is commonly used to exclude a block of code from being compiled (as if they are commented out).

#### Compilation

During compilation, C++ compiler sequentially goes through each source code (`.h .c .cpp`) file in your program and does two things:

- check the syntax correctness
- translate code into machine language and create the object file (`.o .obj`)

After the object files are created, the linker comes in:

- resolve dependencies
- merge object files into a single executable program
- pull in library files referenced, which are collections of precompiled and prepackaged code for reuse

Compile code with `g++ <source_files> -o <output_program>`. The output program can be run directly with `./<output_program>`.

C++ has evolved and has many language standards. Pass in compiler flags during compilation to change the language standard. i.e. `g++ <language_standard_flag> <source_files> -o <output_program>`, where language_standard_flag can be `-std=c++1/c++14/c++17/c++2a`

### Documenting and Comments

Single-line comment with `//`, multi-line comment with `/* */`

Indent with 4 spaces. Put the opening curly brace on the same line as the statement. Lines should keep a 80-char maximum and wrap to new line at appropriate place.

### Program entry

Every C++ program must have a main function or it will fail to link.

```c++
int main() {
    // main function body
    return 0;
}
```

The main function must have int return type, which will be the exit code. An exit code of 0 typically signals the program execution was successful.

To make the program take command line arguments, write the main function this way:

```c++
int main(int argc, char* argv[]) {
    // main function body
    return 0;
}
```

`argc` is the count of arguments passed to the program and is >= 1, since the first argument is always the absolute path to the program. `argv` is an array of C-style strings and holds the command line arguments.

### Data and Variables

#### Declaration, Initialization

Variable declaration can be one line each or multiple variables of the same type declared in one line:

```c++
int a; // declared but uninitialized
int b, c; // declare multiple vars in one line
double d = 1.0; // inline copy constant initialize
int e( 5 ); // inline initialize
int f{ 10 }; // inline brace initialize (preferred)
int g = { 100 }; // inline copy brace initialize
int h{}; // inline value initialize to 0, aka zero initialization (default is 0 for int)
```

Some rules of thumb:

- initialize your variables upon creation, using one of the inline methods mentioned above
- initialize one variable on each line
- prefer inline brace initialize since in some circumstances it reports error when wrong variable type is being assigned, i.e. double assigned to int
- prefer value initialization when the variable value will be replaced later before use

#### Naming

[Reserved keywords](https://www.learncpp.com/cpp-tutorial/keywords-and-naming-identifiers/){target=_blank} must not be used as variable identifiers.

Some naming rules of thumb for variables and function names:

- compose of letters, numbers, and underscore
- begin with a lower case letter
- use underscore to separate whole words, or use camelCase. Be consistent throught the program

#### Data types

**Foundamental** data types:

- Boolean: `bool`
- Character: `char, wchar_t, char8_t (C++20), char16_t (C++11), char32_t (C++11)`
- Integer: `short, int, long, long long (C++11)`
- Floating Point: `float, double, long double`
- Null Pointer: `std::nullptr_t (C++11)`
- Void: `void`

Booleans are represented internally as integers. When printing you will get 1 and 0. To get true and false, set `std::cout << std::boolalpha;`, and similarly for stdin `std::cin >> std::boolalpha;`.

Integers are signed by default. To declare unsigned integers, prefix variable type with `unsigned` keyword. i.e. `unsigned int num;` However, you should favor signed numbers over unsigned numbers for holding quantities (even quantities that should be non-negative) and mathematical operations. Avoid mixing signed and unsigned numbers.

Use `std::setprecision(<int>)` to set the precision of floating numbers (default is 6). Although be careful changing this, since higher precision may introduce rounding errors.

The `_t` suffix means type.

The `sizeof` operator is a unary operator that takes either a type or a variable, and returns its size in bytes (of type `std::size_t`). The integer types have unguaranteed size on different hardware. There is only a guaranteed minimal size. i.e. an int can be 2 bytes in old architecture but 4 bytes on modern architecture.

**Fixed-width integers** are introduced by including the `<cstdint>` header to solve the issue of unguaranteed integer sizes on different hardware. They can be declared as:

```c++
std::int8_t
std::int16_t
std::int32_t
std::int64_t
// unsigned
std::uint8_t
std::uint16_t
std::uint32_t
std::uint64_t
```

Still, fixed-width integers are not guaranteed to be defined on all architectures. And for some modern architecture, using fixed-width integer might slow down the problem, as the CPU has to do extra work to process the smaller variables. For those cases, consider using **fast and least integers**.

Some ruls of thumb:

- prefer `int` when integer size doesn't matter
- prefer `std::int#_t` when storing a quantity that needs a guaranteed range
- prefer `std::uint#_t` when doing bit manipulation or when some overflow/wrap-around behavior is desired.
- avoid using unsigned types for quantities
- avoid 8-bit fixed-width integer types which often get treated as chars
- avoid fast and least fixed-width types
- avoid compiler-specific fixed-width integers, such as VC++ `__int8`

**Literal constants** are fixed values explicitly specified. Examples:

```c++
5 // int literal
5u // unsigned int literal
30L // long literal
0214 // octal literal
0xF // hexadecimal literal
0b1001'1110 // binary literal, with ' as digit separator
3.0 // double literal
5.0f // float literal
"Helloworld" // C-style string literal
```

C++ will concatenate sequential string literals. The library `<bitset>` allows printing binary numbers. i.e. `std::bitset<8> bin{ 0b1100'0100 };`

**Constant variables**, aka symbolic constants, can be created using the `const` keyword, where the variable value can be determined in compile-time or runtime. Use `constexpr` to enforce compile-time constant evaluation.

Compound types:

- Functions
- Arrays
- Pointers, to object or to function
- Reference, L-value reference or R-value reference
- Enums, scoped or unscoped
- Classes, Structs, Unions

#### Casting and types

A **numeric promotion** is the conversion of smaller numeric types to larger numeric type.

Use **explicit type conversion** to explicitly tell the compiler to convert a value from one type to another type.

The C-style casts is done via the `(<new_type>) variable` operator or with the function-like cast `<new_type>(variable)`. Avoid C-style casts since it risks misuse and not producing expected behavior.

There is also static cast using `static_cast<new_type>(<expression>)` which allows carry out type conversions that may loss precision or cause overflow if done with implicit (automatic) type conversion.

`static_cast` is best used to convert one fundamental type into another.

The `using` or `typedef` keyword can be used to create **type aliases**, which creates an alias for an existing data type. Use a "_t" or "_type" suffix to help decrease the chance of naming collisions with other identifiers. i.e. 

```c++
using distance_t = double; // define distance_t as an alias for type double
typedef double distance_t; // also does the same thing, but discouraged
```

Use type aliases for platform independent coding. Because `char, short, int, and long` give no indication of their size, it is fairly common for cross-platform programs to use type aliases to define aliases that include the type's size in bits.

Also use type aliases to make complex types simple, or help with code documentation and comprehension. i.e. `using pairlist_t = std::vector<std::pair<std::string, int>>;`

**Type deduction**, aka type inference, is a feature that allows the compiler to deduce the type of an object from the object's non-empty **initializer** through the `auto` keyword.

Type deduction can save a lot of typing and typos in some cases, and is generally safe to use for objects, and improves code readability.

`auto` can also be used on function return type to let compiler infer return type from return statements. Favor explicit return types over function return type deduction.

However, you can use the tailing return type syntax with the `auto` return type to make function names line up and improve code readability. i.e. in forward-declarations:

```c++
auto add(int x, int y) -> int;
auto divide(double x, double y) -> double;
auto printSomething() -> void;
```

[Read more about casting](https://anteru.net/blog/2007/c-background-static-reinterpret-and-c-style-casts/){target=_blank}

#### strings

string type is not a fundamental type, but a compound type. strings are double quoted characters. Quoted text separated by nothing but whitespace (spaces, tabs, or newlines) will be concatenated.

`#include` the `<string>` header to bring in the declarations for **std::string**.

A string's length is optained with `str.length()` function call.

The plain quote-surrounded strings are in fact **C-style strings**, not std::string. To specify different types of strings:

C-style string is essentially an array of chars which implicitly adds a null character `\0` to end of the string. The `strlen()` function from `cstring>` returns the length of the C-style string without the null terminator.

Other useful C-style functions:

- strcpy() -- copy a string to another string
- strcpy_s() strlcpy() -- string copy allowing a size parameter
- strcat() -- appends one string to another (dangerous)
- strncat() -- appends one string to another (with buffer length check)
- strcmp() -- compare two strings (returns 0 if equal)
- strncmp() -- compare two strings up to a specific number of characters (returns 0 if equal)

As a rule of thumb, use std::string or std::string_view (next lesson) instead of C-style strings. Prefer std::string_view over std::string for read-only strings

C++17 introduces **std::string_view** which provides a view of a string to avoid unnecessary copies of strings. It also contains functions for shrinking the view of the string which do not reflect on the underlying string.

```c++
#include <string>
#include <string_view>

void foo() {
    auto s1 { "Hello, world" }; // c-style string of type const char*
    auto s2 { "Hello"s }; // std::string
    auto s3 { "hi"sv }; // std::string_view
    auto s4 { s1 }; // std::string
    auto s5 { s4 }; // std::string_view
    auto s6 { static_cast<std::string>(s5) }; // std::string
    auto s7 { s6.c_str() }; // c-style string
}
```

Prefer passing strings using std::string_view (by value) instead of const std::string&, unless your function calls other functions that require C-style strings or std::string parameters.

#### Operators

- Arithematical: `+ - * / % ++ --`
- Bitwise: `& | ^ ~ << >>`
- Logical: `== != < > <= >= && ||`
- sizeof: `sizeof (<type_or_variable>)`
- Type casting: `(<type>) <variable>`

[Precedence of operators](https://www.cplusplus.com/doc/tutorial/operators/){target=_blank}

#### Variable scopes

Variables declared within a function scope is local variable and only visible within the closure of the function.

#### Arrays

An **array** is an aggregate data type that holds many values of the same type through a single identifier.

A **fixed array** is an array where the length is known at compile time. i.e. `int prime[5]{};` or `int array[]{ 0, 1, 2, 3, 4 };`

Copying large arrays can be very expensive, C++ does not copy an array when an array is passed into a function.

A fixed array identifier **decay** (inplicitly convert) to a pointer that points to the first element of the array. This makes `void printSize(int array[]);` and `void printSize(int* array);` declarations identical. In most cases, because the pointer doesn't know how large the array is, you'll need to pass in the array size as a separate parameter anyway.

Favor the pointer syntax (*) over the array syntax ([]) for array function parameters.

When using arrays, ensure that your indices are valid for the range of your array, as compiler does not check this. Array size can be accessed with `std::size(<array>)`.

C++ multi-dimensional array can be declared as `int array[3][5]{};`.

Array indexing:

```c++
int main() {
     int array[]{ 9, 7, 5, 3, 1 };
     std::cout << &array[1] << '\n'; // print memory address of array element 1
     std::cout << array+1 << '\n'; // print memory address of array pointer + 1
     std::cout << array[1] << '\n'; // prints 7
     std::cout << *(array+1) << '\n'; // prints 7
    return 0;
}
```

**`std::array`** from `<array>` works like fixed arrays and makes array management easier. It does auto clean up after going out of scope, and offers convenient functions like `size()`. i.e. `std::array<int, 3> myArray;` creates an integer array of size 3.

std::array allows assigning values to the array using an initializer list. Access std::array values with the subscript operator `[]` or the `at()` function.

Always pass std::array by reference or const reference to avoid unnecessary copies. Favor std::array over built-in fixed arrays for any non-trivial array use.

A **dynamic array** allows choosing an array length at runtime. Use `new[] and delete[]` with dynamic arrays. i.e. `int* array{ new int[length]{} };` and `delete[] array;`.

Dynamic arrays can be initialized using initializer lists, and benefits from `auto` type deduction. i.e. `auto* array{ new int[5]{ 9, 7, 5, 3, 1 } };`

Note that for-each loop do not work with pointer arrays since the array size is unknown.

A pointer to a pointer can be used to create dynamical multi-dimensional arrays. i.e.

```c++
void foo() {
    int** array2d { new int*[10] };
    for (int i = 0; i < 10; ++i) {
        array2d[i] = new int[5];
    }
    array2d[4][3]; // access

    // free up
    for (int i = 0; i < 10; ++i) {
        delete[] array2d[i];
    }
    delete[] array2d;
}
```

**`std::vector`** from `<vector>` makes working with dynamic arrays safer and easier. It does auto clean up after going out of scope, and offers convenient functions like `size(), resize()`. i.e. `std::vector<int> empty {};`

std::vector allows assigning values to the array using an initializer list. Access std::vector values with the subscript operator `[]` or the `at()` function.

An **iterator** is an object designed to traverse through a container (array, string) and provide access to each element along the way.

The simplest kind of iterator is a **pointer**, which works for data stored **sequentially** in memory.

```c++
void foo() {
    std::array a{ 0, 1, 2, 3, 4, 5, 6 };
    auto begin{ &a[0] }; // or { a.data() }, { a.begin() }, { std::begin(a) }
    auto end{ begin + std::size(a) }; // or { a.end() }, { std::end(a) }
    for (auto ptr{ begin }; ptr != end; ++ptr) {
        std::cout << *ptr << ' ';
    }
}
```

### Functions

A function must be either declared or defined before it is being used.

Offically, a **forward declaration** allows us to tell the compiler about the existence of an identifier before actually defining the identifier. This is when **header files** come into play.

```c++
return_type function_name(arg_type arg1, arg_type arg2, ...); // forward declaration; the var names are optional but good to keep as it is self-documenting

return_type function_name(arg_type arg1, arg_type arg2, ...) {
    // function body
}
```

A **default argument** is a default value provided for a function parameter. When making a function call, the caller can optionally provide an argument for any function parameter that has a default argument.

Default arguments can only be provided for the rightmost unspecified parameters, and can be declared in either the forward declaration or the function definition, but not both (best to do it in forward declaration).

#### Overloading

**Function overloading** allows us to create multiple functions with the same name, so long as each identically named function has different **parameters** (including ellipsis parameters i.e. `void foo(int x, ...);`), or function-level qualifiers (const, volatile, ref-qualifiers).

#### Templating

**Template** system was designed to simplify the process of creating functions (or classes) that are able to work with different data types.

A **placeholder** type represents some type that is not known at the time the template is written, but that will be provided later. Use a single capital letter (starting with T) to name the placeholder type.

A **function template** is a function-like definition that is used to generate overloaded functions, each with a different set of actual types. i.e.

```c++
template <typename T> // template parameter declaration
T max(T x, T y) { // function template definition
    return (x > y) ? x : y;
}
int main() {
    std::cout << max<int>(1, 2); // instantiates and calls function max<int>(int, int)
    std::cout << max<>(1, 2); // compiler deduced type from arguments
    std::cout << max(1, 2); // compiler deduced type from arguments
    return 0;
}
```

Favor the normal function call syntax over template argument deduction when using function templates.

#### Inline

**Inline expansion** is a process where a function call is replaced by the code from the called function’s definition. Modern optimizing compilers are typically very good at determining which functions should be made inline to improve final executable performance.

A function that is eligible to have its function calls expanded is called an **inline function**. Functions that are always expanded inline:

- defined inside a class, struct, or union.
- constexpr functions

#### Namespacing

C++ does not allow the same identifier to be defined within the same build context, aka **naming collision**. This can be happening more commonly when a program uses many libraries.

A **namespace** is a region that allows you to declare names inside of it for the purpose of disambiguation. Any name declared inside the namespace won't be mistaken for identical names in other scopes.

`std` is itself a namespace. `::` is called the scope resolution operator.

Any name that is not defined inside a class, function, or a namespace is considered to be part of an implicitly defined **global namespace**.

You can define a namespace by enclosing the identifiers within a namespace block:

```c++
namespace <namespace_name> {
    // namespace body
}
```

The same namespace can be created anywhere, as long as the identifiers within all namespaces of a kind do not clash. namespaces can also be **nested**, by enclosing one in another.

One way to access identifiers inside a namespace is to use a `using` **directive statement**:

```c++
using namespace std; // at top of program after includes

void some_function() {
    cout << "Hello"; // directly access functions without namespace prefix
}
```

However, `using namespace` should be generally avoided since it increases the risk of causing naming collisions, especially for `std` namespace.


You can also create **namespace aliases** and switch to a different namespace for everywhere it is referenced. Like so:

```c++
namespace active = foo;

std::out << active::getMessage();
```

Namespace is designed primarily as a mechanism for preventing naming collisions.

In applications, namespaces can be used to separate application-specific code from code that might be reusable later (e.g. math functions). When writing a library or code that you want to distribute to others, always place your code inside a namespace.

The `using` declaration can also be used to allow using an unqualified name (with no scope) as an alias for a qualified name. i.e.

```c++
using std::cout;

cout << "Hello"; // no qualified scope resolution is needed anymore
```

An **unnamed namespace** (aka anonymous namespace) is a namespace that is defined without a name, which is treated as if it is part of the parent namespace.

It is typically used when you have a lot of content that you want to ensure stays local to a given file. unnamed namespace does this and saves you the trouble to mark all declarations `static`.

An **inline namespace** is one typically used to version content. Its content is also treated as if it is part of the parent namespace. Its advantage is that it preserves the function of existing programs while allowing newer programs to take advantage of newer/better variations by referencing with the newer namespace scope. i.e.

```c++
inline namespace v1 {
    void doSomething() {
        // body
    }
}
namespace v2 {
    void doSomething() {
        // body
    }
}
int main() {
    doSomething(); // calls v1 version
    v1::doSomething(); // calls v1 version
    v2::doSomething(); // calls v2 version
}
```

Now when you decide to make v2 the official version, switch the inline keyword of the two versions.

#### Ellipsis

Ellipsis argument allows passing a variable number of parameters to a function. Ellipsis are potentially dangerous because it does not know how many parameters are actually passed, nor does it do type check for the passed data types.

Functions that use ellipsis must have at least one non-ellipsis parameter. It is conceptually useful to think of the ellipsis as an array that holds any additional parameters beyond those in the argument_list.

```c++
#include <cstdarg> // needed to use ellipsis

int getSum(int count, ...) {
    int sum { 0 };

    // We access the ellipsis through a va_list, so let's declare one
    std::va_list list;

    // We initialize the va_list using va_start.
    va_start(list, count);

    for (int i { 0 }; i < count; ++i) {
        sum += va_arg(list, int); // auto advances the pointer
    }

    // cleanup va_list
    va_end(list);

    return sum;
}
```

In general Ellipsis should be avoided unless there is a compelling reason not to.

#### Lambda

A **lambda expression**, aka function literal, allows us to define an anonymous function inside another function, and take advantage of the closure from naming conflicts. It is stored in the program as a functor object, which overloads the `()` operator. It takes the form:

```c++
// captureClause, parameters, and returnType can be omitted if not required
[ captureClause ] ( parameters ) -> returnType {
    // statements;
}
```

A lambda can be stored in a variable and passed later. These are valid ways:

```c++
int main()
{
  // A regular function pointer. Only works with an empty capture clause.
  double (*addNumbers1)(double, double){
    [](double a, double b) {
      return (a + b);
    }
  };

  // Using std::function. The lambda could have a non-empty capture clause.
  std::function addNumbers2{ // note: pre-C++17, use std::function<double(double, double)> instead
    [](double a, double b) {
      return (a + b);
    }
  };

  // Using auto. Stores the lambda with its real type.
  auto addNumbers3{
    [](double a, double b) {
      return (a + b);
    }
  };

  return 0;
}
```

Use auto when initializing variables with lambdas, and std::function if you can’t initialize the variable with the lambda.

Since C++14 it is allowed to use auto for lambda parameters to define generic lambdas. A unique lambda will be **generated** for each different type that auto resolves to.

The **capture clause** is used to (indirectly) give a lambda access to variables available in the surrounding scope that it normally would not have access to, by enclosing the variable name (comma-separated) within the `[]` syntax.

The captured variables of a lambda are constant **clones** of the outer scope variables, not the actual variables. The cloned variable can be made **mutable** with the `mutable` keyword added after the parameter list. Captured variables are members of the lambda object, their values are persisted across multiple calls to the lambda.

Passing mutable lambdas can be dangerous as the passed lambda can be copies of its functor. To pass it as a reference, wrap it with `std::ref()` function which yields a `std::reference_wrapper` type to ensure the lambda does not make copies while being passed to another function.

You can also capture variables by reference (prepending `&`) to allow it affect the value of the variable within lambda calls. There is a chance for leaving dangling references in lambda so ensure captured variables outlive the lambda.

**Default capture** can be used to capture all variables mentioned in the lambda. To capture by value, pass in `=`; to capture by reference, pass in `&`. Default captures can be mixed with normal captures to capture some variables by value and some by reference, default capture operator must be the first in the list.

You can define new variable from captured variables in the capture brackets using initialization braces. But it is best to do it outside and capture it.

#### Function pointers

C++ implicitly converts a function into a **function pointer** as needed. Functions used as arguments to another function are sometimes called **callback functions**.

Function pointers can be initialized like so `int (*fcnPtr)(int){ &foo };` which makes fcnPtr points to function foo that has return type of int and takes one int parameter. It can also be initialized with `nullptr` value. Calling with function pointer is like so `(*fcnPtr)(10);` or `fcnPtr(10);`.

Make the function pointer type shorter with type alias: `using FooFunction = int(*)(int);`, or use `auto` type deduction.

Alternatively, use `std::function` from `<functional>`, `std::function<int(int)> fcn` to declare a std::function object.

#### Global variables

Global variables are usually declared at the top of a file, below the includes, and have identifiers prefixed with `g_` to help easily differentiate from local variables.

Global variables are created when the program starts, and destroyed when it ends. They are also known as static variables. Non-constant global variables should be avoided.

Global variables by default are visible from other files. You can limit non-constant global variable's visibility internal within a file (called **internal linkage**), by using the `static` keyword, which is a storage class specifier, see also `extern` and `mutable`. Internal objects (and functions) that are defined in different files are considered to be **independent** entities.

To use an external global variable defined in another file, you must do forward declaration of that variable, i.e. `extern int <var_name>;`. However, `constexpr` variables has no effect with `extern` keyword, as its type requires the value to be determined at compile time, so `constexpr` can only be limited to file internal use.

```c++
// External global variable definitions:
int g_x;                       // non-initialized external global variable
extern const int g_x{ 1 };     // initialized const external global variable
extern constexpr int g_x{ 2 }; // initialized constexpr external global variable

// Forward declarations
extern int g_y;                // forward declaration for non-constant global variable
extern const int g_y;          // forward declaration for const global variable
extern constexpr int g_y;      // not allowed: constexpr variables can't be forward declared
```

By default:

- functions have external linkage
- non-constant global variables have external linkage
- constant global variables have internal linkage

**inline variable** is another way to avoid the same variables being copied into multiple files with includes. The linker ensures there is only one copy of each inlined variable that is shared by all files. You must ensure the inline definitions are the same across multiple places where it is defined (which is rare). You can define these variables in header files.

Rule of thumb:

- avoid creating and using non-constant global variables, they can be changed by anything anywhere, making the program state unpredictable
- declare local variables as close to where they are used as possible
- pay attention to the order that global variables are initialized to make sure no variable is referenced before being initialized.
    - avoid dynamic initialization of variables
- better not to directly use a global variable within a function body, pass it as **argument** instead.
- define your shared global constants in one source file, namespaced, and use `extern` to expose them to be accessed from other files. Then define its companion header file, with namespaced forward declarations of these constants
    - this way constants are instantiated only once and you don't have to recompile other source files if only changing the constants values.
    - trade off: the constants are not considered available at compile-time, which we lose some optimization from compiler, and need to worry about variable initialization order
- prefer defining inline constexpr global variables in a header file

#### static local variable

The `static` keyword on local variable changes its duration from automatic duration to static duration, which retain its value after it goes out of scope, and retain its previous value when it is back in scope.

It's common to use "s_" to prefix static local variables.

Do initialize static local variables. Static local variables are only initialized the first time the code is executed, not on subsequent calls.

Static local variables can be made const, when creating or initializing an object is expensive. Avoid static local variables unless the variable never needs to be reset.

#### Header files

A header file contains declarations of functions and variables, which can be `#include`ed by other source files to pull in declarations.

When including a stadnard library header, only the declarations are pulled in for successfuly compilation. During Linking, the standard library gets linked and the definitions are pulled in.

A header file is typically paired with a source file of the same base name. The source file should include its paired header file.

Use double quotes to include header files that you've written or are expected to be found in the current directory. Use angled brackets to include headers that come with your compiler, OS, or third-party libraries you've installed elsewhere on your system.

A header file may `#include` other header files. To maximize the chance that missing includes will be flagged by compiler, order your #includes as follows:

- The paired header file
- Other headers from your project
- 3rd party library headers
- Standard library headers

Header file rule of thumbs:

- always include header guards
- no definitions except global constants
- header files should group declarations for a specific job, no more
- every header should compile on its own and not rely on other headers to pull in required dependency

### Conditionals

Typical **if** statements:

```c++
if (<condition>) {
    // body
} else if (<condition>) {
    // body
} else {
    // body
}
```

**switch** statements, note the variable only allow integral/enumerated types:

```c++
switch (<variable>) {
    case <val_1>:
        // body
        break;
    case <val_1>:
        // body
        [[fallthrough]]; // special attribute to indicate fallthrough is expected, supress warning
    case <val_1>: { // a case can define a block to limit variable scope and supress compile error, in case need to declare and initialize a variable
        // body
        break;
    }
    default:
        //body
        break;
}
```

A **goto** statement is used with its goto **label** to specify which line to jump to. The label must be used within the function where it is defined. However, it is best to avoid using the goto statments, except for some nested loops.

```c++
void utility() {
repeat:
    // do something
repeat_2:
    // do something else
    if (...)
        goto repeat; // jump to after the repeat label
    else if (...)
        goto repeat_2; // jump to after the repeat_2 label
}
```

The shorthand of if statement exists `<condition> ? <true_body> : <false_body>`, which can be seen as an expression.

**loops** statments, favor normal while or for loop over do-while loop:

```c++
while (<condition>) {
    // body
}

do {
    // executes at least once
} while (<condition>);

for (<init>; <condition>; <step>) {
    // body
}

for (<type> <variable> : <array>) {
    // element will be a copy of the current array element
}
for (<type>& <variable> : <array>) {
    // reference avoids copying array element
}
```

Use `continue` and `break` in loops when it simplifies the logic.

## Reference types

Prior to C++11, there were only two possible value categories: `lvalue` and `rvalue`. In C++11, three additional value categories (`glvalue, prvalue, and xvalue`) were added to support a new feature called `move semantics`.

### lvalue and rvalue

**lvalue** is an expression that evaluates to a function or object that has an **identity** (identifier such as variable or function name, or identifiable memory address). Identifiable objects persist beyond the scope of the expression.

It also has two subtypes: modifiable and non-modifiable lvalue

**rvalue** is an expression that is not an lvalue. Commonly non-string literals and return by value of functions or operators, and only exist within the scope of the expression where they are used.

lvalues can implicitly convert to rvalues, so an lvalue can be used wherever an rvalue is required.

**Dangling reference** can be created when an object being referenced is destroyed before a reference to it is destroyed. Accessing a dangling reference leads to **undefined** behavior.

```c++
int main()
{
    int x{ 5 }; // 5 is an rvalue expression
    const double d{ 1.2 }; // 1.2 is an rvalue expression
    std::cout << x << '\n'; // x is a modifiable lvalue expression
    std::cout << d << '\n'; // d is a non-modifiable lvalue expression
    std::cout << return5(); // return5() is an rvalue expression (since the result is returned by value)
    std::cout << x + 1 << '\n'; // x + 1 is a rvalue
    std::cout << static_cast<int>(d) << '\n'; // the result of static casting d to an int is an rvalue
    return 0;
}
```

### References

An **lvalue reference** acts as an alias for an existing **modifiable lvalue**.

Use `&` to declare an lvalue reference type; the type of the reference must match the type of the referent. i.e. `int& ref { x ];` where ref is an lvalue reference to the non-reference variable x. You can use a reference to modify the value of the variable/object being referenced.

References are not objects.

When creating reference to a constant variable, the reference must be declared with `const` so it can be used to access but not to modify the referent. Favor const lvalue references when possible.

When a const lvalue reference is bound to a temporary object (rvalue), the lifetime of the temporary object is extended to match the lifetime of the reference.

To **pass by reference**, declare a function parameter as a reference type. When the function is called, lvalue reference parameter is bound to the argument passed in. Binding a reference is always inexpensive, and no copy of variable needs to be made.

Passing values by non-const reference allows functions modify the value of arguments passed in, and can only accept modifiable lvalue arguments.

Generally, prefer pass by value for objects that are cheap to copy, and pass by const reference for objects that are expensive to copy.

Common types that are cheap to copy include all of the fundamental types, enumerated types, and std::string_view. Common types that are expensive to copy include std::array, std::string, std::vector, and std::ostream.

Note that type deduction using `auto` drops the `const` qualifier and the reference.

### Pointers

Variable memory addresses aren't exposed, but use the **address-of** operator `&` can access the memory address of the operand. i.e. `&x` gets variable x's mem address.

The **dereference operator** `*` returns the value at a given memory address as an **lvalue**. i.e. `*ref` gets you the lvalue reference from the memory address ref.

A **pointer** is an object that holds a memory address as its value. Pointer types are declared using an asterisk (*). i.e. `int* ptr;`. Always initialize your pointers.

Pointers behave much like lvalue references. Some main differences between the two:

- References must be initialized, pointers are not required to (but should be)
- References are not objects, pointers are
- References can not be reseated, pointers can
- References must always point at an object, pointers can point to nothing
- References are safe from dangling references, pointers are not

**Favor references over pointers whenever possible**.

A **dangling pointers** is a pointer that is holding the address of an object that is no longer valid.

A **null pointer** can be initialized with empty initializer or the `nullptr` keyword. Always verify non-null pointer before dereferencing it. Further, pointers implicitly convert to Boolean values, with null pointer a value of false. It is also acceptable to use `assert(ptr);`.

However, there is NO convenient way to determine whether a non-null pointer is pointing to a valid object or dangling (pointing to an invalid object). Thus, ensure that any pointer that is not pointing at a valid object is set to `nullptr`.

A **pointer to a `const` value** is a non-const pointer that points to a constant value. i.e. `const int* ptr { &x };` given x is a const int.

A **const pointer** is a pointer whose address cannot be changed after initialization. i.e. `int* const ptr { &x };`

Now it is possible to combine the two to have a const pointer to a const value.

Three ways to pass data to functions:

```c++
using string = std:string;
void passByValue(string val);
void passByReference(string& val);
void passByAddress(string* val);
int main() {
    string str{ "Hello" };
    passByValue(str);
    passByReference(str);
    passByAddress(&str);
}
```

### Return references

It is allowed to **return by reference or by address**.

Objects returned by reference must live beyond the scope of the function returning the reference, or a dangling reference will result.

Never return a local variable by reference. Avoid returning references to non-const local static variables.

Prefer return by reference over return by address unless the ability to return “no object” (using `nullptr`) is important.

### Memory allocation

**Static** memory allocation happens for static and global variables which is allocated once at program start and persists throughout program life time.

**Automatic** memory allocation happens for function parameters and local variables which is allocated when the relevant block is entered, and freed when the block is exited.

**Dynamic** memory allocation allows requesting **heap memory** from the os when needed, using the `new` operator. i.e. `int* ptr{ new int { 6 } };`

Dynamically allocated memory stays allocated until it is explicitly deallocated or until the program ends. **Memory leaks** happen when your program loses the address of some bit of dynamically allocated memory before giving it back to the operating system.

The memory bing dynamically allocated to variable can be freed up when not needed, through the `delete <ptr>;` operator. Deleting a null pointer has no effect. Do delete the pointer before reassigning it a new value.

Avoid having multiple pointers point at the same piece of dynamic memory. When deleting a pointer, set it to **nullptr** if it is not going out of scope immediately.

## Program-defined types

Consider Enums, Structs, Classes as program-defined types to distinguish from standard C++ defined types.

Whenever you create a new program-defined type, name it starting with a capital letter.

A program-defined type used in only one code file should be defined in that code file as close to the first point of use as possible.

A program-defined type used in multiple code files should be defined in a header file with the same name as the program-defined type and then `#include` into each code file as needed.

### Enumerations

An **enumeration** (`enum`) is a compound data type where every possible value is defined as a symbolic constant. Enumerated types are considered part of the integer family of types. You can `static_cast` integers to a defined enumerator.

```c++
enum Color {
    color_red,
    color_green,
    color_blue,
};
```

An enumeration or enumerated type is the program-defined type itself. An enumerator is a symbolic constant that is a possible value for a given enumeration.

Name your enumerated types starting with a capital letter. Name your enumerators starting with a lower case letter. Avoid assigning explicit values to your enumerators unless you have a compelling reason to do so.

**Unscoped enumerations** are named such because they put their enumerator names into the same scope as the enumeration definition itself. If an unscoped enum is defined in the global scope, it pollutes the global scope and significantly raises the chance of naming collisions.

One common way to reduce chances of naming collision is to prefix each enumerator with the name of the enumeration itself. A better way is to put the enumerated type definition in a namespace. It is also common to put enumerated types related to a class inside the scope region of the class.

**Scoped enumeration** are strongly typed (no implicit integer convertion) and strongly scoped (enumerators scoped within the enumeration region). 

```c++
enum class Color {
    red,
    green,
    blue,
};
```

Enumerators must be accessed with prefixing the enumeration type. i.e. `Color c { Color::blue };`. `static_cast` can still be used to cast enumerators into integers. It is acceptable to use **operator overloading** to reduce the typing in conversions of scoped enumerators.

### Structs

A `struct` allows bundling multiple variables together into a single type. The variables that are part of the struct are called data **members** (or member variables).

```c++
struct Employee {
    int id {};
    int age {};
    double wage { 0 }; // explicit default value
};
```

To access a specific member variable, use the **member selection operator** `.` on normal variables or references of structs. For pointers, use the **pointer/arrow operator** `->` which does an implicit dereference of the pointer object before selecting the member.

An **aggregate** data type is any type that can contain multiple data members. `structs` with only data members are aggregates.

Aggregates use a form of initialization called **aggregate initialization** which is just a list of comma-separated initialization values. Each member in the struct is initialized in the order of declaration.

When adding a new member to an aggregate, it's safest to add it to the bottom of the definition list so the initializers for other members don't shift.

```c++
int main() {
    Employee frank = { 1, 32, 60000.0 }; // copy-list initialization
    Employee robert ( 3, 45, 62500.0 );  // direct initialization (C++20)
    Employee joe { 2, 28, 45000.0 };     // list initialization
    return 0;
}
```

Variables of a struct type can be const and must be initialized. Structs are generally passed by (const) reference to functions to avoid making copies.

### Classes

By convention, class names should begin with an upper-case letter. The class name effectively acts like a namespace for the nested type.

Type alias members make code easier to maintain and can reduce typing. Generally, nested types should only be used when the nested type is used exclusively within that class.

```c++
class DateClass {
private:
    // private members
    int m_year {}; // m_ prefix helps distinguish from local variables
    int m_month {};
    int m_day {};
public:
    // public members
    // constructor
    DateClass () = default; // tells compiler to create a default constructor
    DateClass () : m_year{ 1999 }, m_month{ 1 }, m_day{ 1 } { // member initializer list
    }
    DateClass (int year, int month, int day) {
        m_year = year;
        m_month = month;
        m_day = day;
    }
    DateClass (int year, int month, int day) // preferred, same form with initializer which can also initialize const variables
        : m_year{ year }, m_month{ month }, m_day{ day } {

    }
protected:
    // protected members
};
```

When not specify any access specifiers, members are private by default. Member functions can be defined inside or outside of a class.

When all members variables of a class (or struct) are public, we can use aggregate initialization to initialize the class (or struct) directly using list-initialization. Otherwise specify a constructor.

Initialize variables in the initializer list in the same order in which they are declared in your class.

Delegating constructors allows calling another constructor from one constructor. It is aka constructor chaining. To do so, put the other constructor call inside the initilization list, not in the body of the constructor.

A class exposes the **`this` pointer** to its active instance to refer to its own object for accessing member variables and functions. It can also be reassigned to overwrite the implicit object. Like so: `*this = Foo(); // Foo is the constructor`. It can also be returned by functions to allow chaining calls.

Destructors are like default constructors but has its name preceded by a `~`. Only one destructor per is class allowed. Destructors are called automatically when the object is destroyed.

Note that if you use the `exit()` function, your program will terminate and no destructors will be called. Be wary if you’re relying on your destructors to do necessary cleanup work.

#### Class templates


## STD Libraries

### `<algorithm>`

Includes functions like sort, fill, find, binary_search, reverse, shuffle, min/max, count_if.

`std::find(start_iterator, end_iterator, target)` searches for the first occurrence of a value in a container. `std::find_if` works similarly but allows passing in a callable object (function pointer or lambda) that checks to see if a match is found.

`std::count, std::count_if` works similarly and count all occurrences of element or elements fulfilling the condition.

`std::sort` sorts an array to ascending with an optional custom comparing function.

`std::for_each` applies a custom function to every element in an array, which is an alternative to writing a loop. It can also be parallelized for faster processing.

Favor using functions from the algorithms library over writing your own functionality to do the same thing.

### `<iostream>`

`std::cout`, allows print text to program STDOUT. Similarily for `std::cerr` for print text to STDERR. Put a line break and flushes output with `std::endl`. Prefer to use `\n` for adding line breaks to avoid high frequency in flush.

Use insertion operator `<<` along with `cout/cerr/endl`, or extraction operator `>>` for `cin`.

There is also `std::getline` for reading a full ine of text into a variable. i.e. `std::getline(std::cin >> std::ws, input);` The `std::ws` is a type of input manipulator to tell std::in ignore leading whitespace, which is necessary to continuously read user inputs in an interactive program.

When doing extraction with `std::cin`, an extraction of user input can fail for many reasons, common one is the input causes an overflow, which leave `cin` in a failed state and cause any future extraction to be skipped.

What to do in this case where bad user input can be anticipated is to use `std::cin.fail()` to check if the extraction failed, then `std::cin.clear()` to reset the failure flag and something like `std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');` to skip what user entered (before hitting the enter key), any probably ask the user to enter again and tell them why it failed.

### `<iterator>`

Contains functions like `begin, end` on arrays.

### `<random>`

Provides PRNG (Pseudo Random Number Generator) function that generates fairly evenly distributed random numbers.

`std::mt19937` is a 32-bit Mersenne Twister random number generator function; `std::mt19937_64` is the 64-bit version.

Also to make sure it is truely random everytime the program is run, seed the PRNG with system clock (`<chrono>` is needed).

Use `std::uniform_int_distribution<> die{ 1, 6 };` to limit the random number range. Like so:

```c++
int rand_gen() {
    std::mt19937 mt{ static_cast<unsigned int>(
		std::chrono::steady_clock::now().time_since_epoch().count()
		) };
    // alternatively seed with the os implemented random_device
    std::mt19937 mt{ std::random_device{}() };

    std::uniform_int_distribution<> die6{ 1, 6 };

    int rand = die6(mt);
    return rand;
}
```

Make a singleton of PRNG, and only seed a PRNG once, and use it throughout your program. Do so with a namespace and define a global PRNG, like so:

```c++
namespace Random { // capital R to avoid conflicts with functions named random()
	std::mt19937 mt{ std::random_device{}() };

	int get(int min, int max) {
		std::uniform_int_distribution die{ min, max }; 
		return die(mt);
	}
}
```

### `<utility>`

Provides useful types like Pairs, generic swap function

### `<cassert>`

An assertion tests if an expression evaluates to true. If not, the program terminates with an error message. This is useful to do precondition check anywhere fits.

It is best to use this format `assert(<condition> && "error message");` so when this condition expression is false, the informative message is also printed.

Generally use assertions to document cases that should be logically impossible; for other cases use proper exception handling methods. Asserts should never be encountered in production code. Asserts should be used only in cases where corruption isn't likely to occur if the program terminates unexpectedly.

If the macro `NDEBUG` is defined, the assert macro gets disabled.

`static_assert(<condition>, "diagnostic_message");` to evaluate something at compile time.

### `<cstdint>`

For defining fixed-width integers.

### `<cstdlib>`

Halt functions:

`std::exit()` can be used to explicitly exit the program.

Do note that it does not clean up any local variables (either in the current function, or in functions up the call stack). Avoid using it unless you know how to properly clean up your program.

`std::atexit()` can be used to pass in a cleanup function when `exit()` is called.

In a multi-threaded program, it is better to use `std::quick_exit()` to exit the program (which does not immediately clean up static objects that may still be accessed by other threads), paired with `std::at_quick_exit()` for cleanup.

Furthermore, `std::abort()` function causes your program to terminate abnormally. There is also `std::terminate()` which is typically used in conjunction with exceptions. Both does not do propery cleanups. Generally use exceptions for error handling.

### `<cmath>`

Handy math functions. i.e. `pow, abs, max, min`