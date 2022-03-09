---
layout: note_page
title: Java Style Guide
title_short: java_style
dateStr: 2022-03-01
category: StyleGuide
tags: notes check reference
---

This notes is taken from [google.github.io/styleguide](https://google.github.io/styleguide/javaguide.html){target=_blank}

## Source files

### File name

Use the case-sensitive name of the top-level class it contains, plus the `.java` extension.

### Structure

From top down:

- License or copyright information, if present or needed (IDEs have settings to create this automatically)
- `package` statement
    - must never be wrapped
- `import` statements
    - do NOT use wildcard imports (turn OFF auto wildcard in IDE setting)
    - group all static imports together
    - group all non-static imports together
    - import names are sorted in ASCII sort order
    - NO static import for static nested classes
- Exactly ONE top-level class
    - members and initializers should follow some logical order that helps as if the maintainer to explain the code logic
    - group overloaded methods or constructors together

Exactly ONE blank line separates each section that is present.

Example license or copyright header:

```java
/*
 * Copyright (C) <year> <project/org name> 
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at 
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and 
 * limitations under the License.
 */
```

## Formatting

### Braces

Always use braces with `if else` and `for do while` loop statements.

Lambda braces are optional.

Non-empty blocks should follow the rules:

- NO line break before the opening brace
    - exception is when using a nested block to create a local closure for limiting local variable scopes.
- Line break after the opening brace
- Line break before the closing brace
- Line break after the closing brace when terminating a statement or the body of a method, constructor, or named class.

Empty blocks should be closed immediately after it is opened, or add a line break in between if it is part of a multi-block statment `try catch`, `if else`.

### Lines

Block indentation should be 2 spaces.

Each statement should be followed by a line break.

Each line should have a column limit of 100 characters, except:

- long URLs in Javadoc
- `package import` statements
- commands in comment that can be copy-pasted to a shell
- very long identifiers

The primary goal for line wrapping is to have clear code, not necessarily code that fits in the smallest number of lines. Line wrapping rules:

- break after an assignment operator, `= :`
- break before non-assignment operator, `. :: | <>`
- a method or constructor name stays attached to the open parenthesis `(` that follows it
- a comma `,` stays attached to the token precedes it
- no immediate line breaks after the arrow operator, except when there is only one statement follows it
- indentation of continuation lines by adding +2 spaces for each level of parallism

### Whitespace

A single blank line appears:

- always between consecutive members or initializers of a class: constructors, methods, nested classes, static initializers, and instance initializers
- optionally between fields to create logical groupings of fields
- anywhere when it improves readability

A single whitespace appears:

- separating a reserved word such as `if for catch` from an open parenthesis `(`
- separating a reserved word such as `else catch` from a closing curly brace `}`
- before open curly brace `{`
    - except on annotations
    - or except on initializing array with constants using array initializer syntax, i.e. `String[][] x = {{"foo"}};`
- on both sides of any binary or ternary operator `+ - * / % & | : :: . ->`
- after `, : ;` or closing `)` after casting
- before and after `//` for single comment. Multiple spaces also allowed
- between a type and variable declaration
- optionally inside both braces of an array initializer
- between type annotation and `[]` or `...`

### Grouping parentheses

Adding grouping parentheses to emphasize precedence makes arithematic code logic more readable

### Enum class

An enum class with no methods and no documentation on its constants may optionally be formatted as if it were an array initializer.

After each comma that follows an enum constant, a line break is optional.

### Variable declarations

One variable per declaration, do NOT do `int a, b;` declaration except in a for loop header.

Local variables are declared close to the point they are first used to minimize their scope. They should be initizalized immediately after declaration.

### Arrays

Any array initializer may optionally be formatted as if it were a "block-like construct."

Square brackets form a part of the array type, not the variable: `String args[]` should not be used.

### Switch statement

Add comment when there is a non-empty case fall-through i.e.

```java
switch (input) {
  case 1:
  case 2:
    prepareOneOrTwo();
    // fall through
  case 3:
    handleOneTwoOrThree();
    break;
  default:
    handleLargeNumber(input);
}
```

Always include a default label statement group even if it is empty, except when all cases are covered exhaustively, for example, when switching on a Enum value.

### Annotations

Type-use annotations (i.e. meta-annotated with `@Target(ElementType.TYPE_USE)`) appear immediately before the annotated type.

Annotations applying to a class, method, or constructor appear immediately after the documentation block one on each line, except when the signature can fit on one line such as method declarations in an Interface class.

Annotations applying to a field also appear immediately after the documentation block, but multiple annotations (possibly parameterized) may be listed on the same line.

There are no specific rules for formatting annotations on parameters or local variables.

### Modifiers ordering

Java Language Specification recommended order:

`public protected private abstract default static final transient volatile synchronized native strictfp`

### Numeric Literals

`long`-valued integer literals use an uppercase `L` suffix

## Naming

All identifiers use ASCII letters and digits, with some cases using underscores.

### Package names

Only lowercase letters and digits (no underscores), and consecutive words are simply concatenated together.

### Class names

Class names are written in UpperCamelCase.

Class names are typically nouns or noun phrases i.e. `HashMap`. Additionally, Interfaces may sometimes be adjectives or adjective phrases instead i.e. `Runnable`.

A test class has a name that ends with Test, i.e. `HashIntegrationTest`.

### Method names

Method names are written in lowerCamelCase.

Method names are typically verbs or verb phrases i.e. `sendMail`.

Underscores may appear in test method names to separate logical components of the name, with each component written in lowerCamelCase i.e. `transferMoney_deductsFromSource`.

### Field names

Constant names use UPPER_SNAKE_CASE: all uppercase letters, with each word separated from the next by a single underscore. And are typically nouns or noun phrases.

Note that NOT all static final fields are deemed constants.

??? note "What is a constant"
    Constants are static final fields whose contents are deeply immutable and whose methods have no detectable side effects. Examples include primitives, strings, immutable value classes, and anything set to null. If any of the instance's observable state can change, it is not a constant. Merely intending to never mutate the object is not enough.

    ```java
    // Constants
    static final int NUMBER = 5;
    static final ImmutableList<String> NAMES = ImmutableList.of("Ed", "Ann");
    static final Map<String, Integer> AGES = ImmutableMap.of("Ed", 35, "Ann", 32);
    static final Joiner COMMA_JOINER = Joiner.on(','); // because Joiner is immutable
    static final SomeMutableType[] EMPTY_ARRAY = {};

    // Not constants
    static String nonFinal = "non-final";
    final String nonStatic = "non-static";
    static final Set<String> mutableCollection = new HashSet<String>();
    static final ImmutableSet<SomeMutableType> mutableElements = ImmutableSet.of(mutable);
    static final ImmutableMap<String, SomeMutableType> mutableValues =
        ImmutableMap.of("Ed", mutableInstance, "Ann", mutableInstance2);
    static final Logger logger = Logger.getLogger(MyClass.getName());
    static final String[] nonEmptyArray = {"these", "can", "change"};
    ```

Non-constant field names (static or otherwise) are written in lowerCamelCase and are typically nouns or noun phrases.

Parameter names are written in lowerCamelCase and are typically nouns or noun phrases. One-character parameter names in public methods should be avoided.

Local variable names are written in lowerCamelCase and are typically nouns or noun phrases. Even when final and immutable, local variables are not considered to be constants

Type variable names are usually one single capital letter optionally followed by a single numeral, i.e. `E, T, X, T2`, or a name in the form used for classes and followed by the capital letter `T`, i.e. `RequestT`

## Programming Practices

### @Override

Always use `@Override` annotation when applicable, except when parent method is `@Deprecated`.

### Caught exceptions

Do NOT ignore an caught exception even when it is logically impossible for the exception to be thrown. Typical responses are to log it or rethrow it as an `AssertionError`.

When it is safe to do nothing, be sure to leave a comment for why that is okay, rather than leaving the catch block empty.

In tests, you may leave an empty catch block if naming the exception variable `expected`.

### Static members

Always access a static class member qualified with that class's name, do NOT access with a reference or expression which yields a reference of that class's type.

## Commenting

### Block comments

Block comments are indented at the same level as the surrounding code.

For multi-line `/* ... */` comments, subsequent lines must start with `*` aligned with the `*` on the previous line.

Comments should NOT be enclosed in boxes drawn with asterisks or other characters.

### JavaDoc

The general form can span multiple lines or use up a single line (when there is no parameters or return value). Rules covers block comments also applies.

A blank line should appear between paragraphs. Each paragraph except the first has `<p>` immediately before the first word, with no space after it, and end the last word in paragraph with `</p>`. Other HTML tags can be used rather than `<p>`, such as `<ul> <table>`

Any of the standard "block tags" that are used appear in the order `@param, @return, @throws, @deprecated` and should always be followed with descriptions.

When a block tag doesn't fit on a single line, continuation lines are indented four (or more) spaces from the position of the `@`.

Each Javadoc block begins with a brief **summary fragment**, which should be a noun phrase or verb phrase, NOT a complete sentence.. It is the only part of the text that appears in certain contexts such as class and method indexes.

At the minimum, Javadoc is present for every public class, and every public or protected member of such a class, except:

- some self-explanatory members such as fields, getter and setter methods.
- method that overrides a supertype method
