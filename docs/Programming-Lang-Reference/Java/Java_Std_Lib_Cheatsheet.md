---
layout: note_page
title: Java Standard Libaray Cheatsheet
title_short: java_std_lib
dateStr: 2022-04-01
category: Language
tags: notes reference
---

Notes taken from [Java 8 Standard API](https://docs.oracle.com/javase/8/docs/api/index.html){target=_blank}

<!-- === "" -->

## Commonly used Data Structures

### Data Objects

member | Integer | Double
------ | ------- | ------
constants | MAX_VALUE, MIN_VALUE | MAX_VALUE, MIN_VALUE, NaN, POSITIVE_INFINITY, NEGATIVE_INFINITY
methods | parseInt, valueOf | parseDouble, valueOf, intValue, isNaN, isInfinite

#### String

`charAt, contains, startsWith, endsWith, format, indexOf, join, split, substring, toCharArray, toLowerCase, toUpperCase, valueOf`

### Collection Subinterfaces

member | List | Set | Map | Queue | Stack | Deque (has Queue, Stack behaviors)
------ | ---- | --- | --- | ----- | ----- | ----------------------------------
insert | add | add | put, computeIfAbsent | add, offer | push | addFirst, addLast, offerFirst, offerLast
lookup | contains, get, indexOf | contains | containsKey, get, 	getOrDefault, entrySet | peek | peek, search | getFirst, getLast, peekFirst, peekLast
update | set | - | put, replace | - | -
delete | remove, clear | remove, clear | remove, clear | poll | pop | pollFirst, pollLast, removeFirst, removeLast

#### Collections methods

`addAll, clear, contains, containsAll, equals, hashCode, isEmpty, iterator, parallelStream, remove, removeAll, removeIf, retainAll, size, spliterator, stream, toArray, toArray`

#### Iterable methods

`forEach`

#### Comparable methods

`compareTo`

### List

member | ArrayList | LinkedList (has Deque behavior) | ArrayBlockingQueue | ArrayDeque
------ | --------- | ------------------------------- | ------------------ | ----------
constructor | default, copy, capacity | default, copy | capacity | default, copy, capacity
additional methods | clone, ensureCapacity, sort | - | take, drainTo | -

### Hash

member | HashSet | HashMap | HashTable
------ | ------- | ------- | ---------
constructor | default, copy, capacity | default, copy, capacity | default, copy, capacity
additional methods | - | clone | clone, rehash

### Tree

member | PriorityQueue (has Deque behavior) | TreeSet (has Set behavior)
------ | ---------------------------------- | --------------------------
constructor | default, copy, capacity, comparator | default, copy, comparator
additional methods | - | ceiling, floor, first, last, pollFirst, pollLast, higher, lower

### Utility

#### StringBuilder

`append, delete, deleteCharAt, reverse, setLength`
