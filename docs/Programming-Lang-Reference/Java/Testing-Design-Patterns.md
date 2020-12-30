---
layout: note_page
title: Java Testing Design Patterns
title_short: java_test_patterns
dateStr: 2020-09-01
category: Reading-Notes
tags: notes check
---

Two simple rules that helps software development:

- Write a failing automated test before you write any code
- Remove duplication

## Intro to TDD

1. Quickly add a test
2. Run all tests and see the new one fail
3. Make a little change
4. Run all tests and see them all succeed
5. Refactor to remove duplication

Introduce a red, then make it green fast. Then make it good and green fast. Prefer not to write a test when there is red.

A good habit is to **maintain a to-do list** for tests and features, and make the items in-progress as bold and completed items as crossed off. When the list is empty is a good time to review the design.

First, put on the list examples of every operation that you know you need to implement. Next, for those operations that don't already exist, put the null version of that operation on the list. Finally, list all of the refactorings that you think you will have to do in order to have clean code at the end of this session.

If you don't find any test on the list that represents one step, then add some new tests that would represent progress toward the items there.

Always **start a test small**. TDD is not about taking teeny-tiny steps, it's about being able to take teeny-tiny steps. It is okay if the test doesn't even compile. Then work to fix the compile errors (can start with stubs), then fix the test so the outcome matches the expected. In the end, it is expected to have roughly as many lines and functions in the test and functional code.

It is important to get through steps 1-4 quickly, then spend time to make step 5 right. Keep in mind while refactoring in the good direction, try not to introduce more design until you had a better motivation to do so.

It is okay if the code that made the test pass is **not perfect** yet. Because the next step will be adding more tests to cover general cases and edge cases, then going through the TDD cycle.

It is possible that after a few iterations, the code you initially wrote had been changed drastically, and you will find the initial dumb code has become more sophisticated and clean, and there is a nice set of tests that guards you with more refacotring aginst breaking existing functionalities.

If dependency is the problem, **duplication** is the symptom. Duplication most often takes the form of duplicate logic -- the same expression appearing in multiple places in the code. This can be code snippets or constants.

Another goal is to be able to write another test that “makes sense” to us, without having to change the code. By eliminating duplication before we go on to the next test, we maximize our chance of being able to get the next test running with one and only one change.

You will often be implementing TDD in code that doesn't have **adequate tests**. You could make a refactoring mistake and the tests would all still run. Write the tests you wish you had. If you don't, you will eventually break something while refactoring.

If you have a big system, then the parts that you touch all the time should be absolutely rock solid, so you can make daily changes confidently.

TDD followed religiously should result in 100 percent statement coverage. You can also do defect insertion to evaluate test quality: change the meaning of a line of code and a test should break.

The three approaches to making a **test work cleanly**: fake it, triangulation, and obvious implementation. Removing duplication between test and code as a way to drive the design. The ability to control the gap between tests to increase traction when the road gets slippery and cruise faster when conditions are clear.

The running of tests should not affect one another at all times. Tests should be independent.

Include expected and actual results in the test itself, and try to make their relationship apparent. You are writing tests for a reader, not just the computer. Later on when someone needs to maintain or update the test, it is easy to spot what you are trying to test.

## Best practices for TDD

You should test: conditionals, loops, operations, polymorphism.

Some common signs that code needs improvements:

- long test setup code - objects probably are too big and need to be split
- setup duplication - too many objects tightly coupled that it is hard to have a common setup
- long running tests - long running tests won't be run often and is bad for TDD, and indicates design flaws
- fragile tests - tests break unexpectedly suggest that one part of application is affecting another

When you have a bunch of code that more or less works and you want to add tests to it, and the biggest problem is that code that isn't written with tests in mind typically isn't very testable. What you don't do is go write tests for the whole thing and refactor the whole thing, which would take months. Start adding tests and refactor the code parts that most likely would change all the time, then repeat on untested code.

> I think the reason for this is that working in a test-driven development style gives you this sense of keeping just one ball in the air at once, so you can concentrate on that ball properly and do a really good job with it. When I'm trying to add some new functionality, I'm not worried about what really makes a good design for this piece of function, I'm just trying to get a test to pass as easily as I can. When I switch to refactoring mode, I'm not worried about adding some new function, I'm just worried about getting the right design. With both of these I'm just focused on one thing at a time, and as a result I can concentrate better on that one thing.

Patterns are always half baked, and need to be adapted in the oven of your own project. But a good way to do this is to first copy the pattern fairly blindly, and then use some mix of refactoring or test-first, to perform the adaptation.

### Starter Test

Pick a Starter Test that will teach you something but that you are certain you can quickly get to work.

Start by testing a variant of an operation that doesn't do anything. Then start asking the questions:

- Where does the operation belong
- What are the correct inputs
- What is the correct output given those inputs

You will have a realistic test after answering all of the three questions with test code. Taking one question at a time helps with maintaining a fast Red/green/refactor loop.

### Explanation Test

Attempt to alter existing tests, ask yourself for explanations of those tests and come up with new test cases.

### Learning Test

Before using and coding with a new external library, attempt to write tests to verify its API works as expected.

This way, if your application critically depends on some features or API provided by that library, then it is safe to verify those functionalities didn't change when upgrading to a newer version by running the existing learning tests.

### Regression Test

When something fails, a code bug was caught during production, write the smallest possible test that fails and that, once run, will be repaired.

Every time you have to write a regression test, think about how you could have known to write the test in the first place.

### Child Test

When there is apparently a test case that turns out to be too big and requires multiple code changes to work, write a smaller test case that represents the broken part of the bigger test case. Then get the test passing and reintroduce a larger test case, repeat until you gets the complete large test case.

### Mock Object

To test an object that relies on an expensive or complicated resource, create a fake version of the resource that answers constants.

Mock Objects encourage you down the path of carefully considering the visibility of every object, reducing the coupling in your designs.

http://www.mockobjects.com/

### Crash Test Dummy

Test error code or exceptions logic by running tests with a special object that throws the exception intead of doing real work.

## Refactoring

### Reconcile Differences

When there are two similar looking pieces of code, gradually bring them closer and unify them when they are identical.

- Two loop structures are similar. By making them identical, you can merge them.
- Two branches of a conditional are similar. By making them identical, you can eliminate the conditional.
- Two methods are similar. By making them identical, you can eliminate one.
- Two classes are similar. By making them identical, you can eliminate one.

### Isolate Change

Isolate the part that has to change when working on a multi-part method or object.

### Migrate Data

When moving data from one representation to another, temporarily duplicate the data.

- Add an instance variable in the new format.
- Set the new format variable everywhere you set the old format.
- Use the new format variable everywhere you use the old format.
- Delete the old format.
- Change the external interface to reflect the new format.

If changing API:

- Add a parameter in the new format.
- Translate from the new format parameter to the old format internal representation.
- Delete the old format parameter.
- Replace uses of the old format with the new format.
- Delete the old format.

### Extract Method

Make long and complicated method easier to read by turnning a small part of it into a separate method and call the new method.

1. Find a region of the method that would make sense as its own method. Bodies of loop, whole loops, and branches of conditionals are common candidates for extraction.
2. Make sure that there are no assignments to temporary variables declared outside the scope of the region to be extracted.
3. Copy the code from the old method to the new method. Compile it.
4. For each temporary variable or parameter of the original method used in the new method, add a parameter to the new method.
5. Call the new method from the original method.

However, don't break methods too far that the code is not readable.

