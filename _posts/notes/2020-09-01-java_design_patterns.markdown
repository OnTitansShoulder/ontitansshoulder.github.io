---
layout: note_page
title: Java Design Patterns
title_short: java_design_patterns
dateStr: 2020-09-01
category: Reading-Notes
tags: notes check
---
Notes taken from the book _Head First Design Patterns_. Examples and source code http://www.headfirstlabs.com/books/hfdp/
<br/>

Design patterns don’t go directly into your code, they fi rst go into your BRAIN. Once you’ve loaded your brain with a good working knowledge of patterns, you can then start to apply them to your new designs, and rework your old code when you fi nd it’s degrading into an infl exible mess of jungle spaghetti code.

One of the advantages of knowing design patterns is recognizing and quickly understanding the design movitation in your favorite libraries.

<br/>

## The Strategy Pattern

### Separating what changes from what stays the same

> Identify the aspects of your application that vary and separate them from what stays the same. Take what varies and "encapsulate" it so it won't affect the rest of the code.

This principle stays true for all the design patterns, to let some part of a system vary independently from all other parts.

> Program to an interface (supertype, a set of behaviors), not to a concrete implementation.

The declared type of the variables should be a supertype, usually an abstract class or interface, so that the objects assigned to those variables can be of any concrete implementation of the supertype, which means the class declaring them doesn’t have to know about the actual object types.

**The Strategy Pattern** defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

Start thinking the behaviors to implement are actually a family of different algorithms to express those behaviors. Encapsulate what varies and favor composition over inheritance.

```java
// programming to an implementation
Dog d = new Dog(); // locking ourselves to a concrete type
d.bark();
// programming to an interface/supertype
Animal animal = new Dog();
animal.makeSound();
// assign concrete implementation at runtime
Animal animal = getAnimal();
animal.makeSound();
```

> Has-A can be better than Is-A relationship (Favor composition over inheritance.)

When you put two classes together like this you’re using _composition_. Instead of inheriting the behaviors, the first class get its behavior by being composed with the right behavior object.

<br/>

## The Observer Pattern

The Observer Pattern allow objects to be notified for specific events. Publishers (Subject) + Subscribers (Observer) = Observer Pattern. This pattern provides an object design where subjects and observers are lossely coupled.

> Strive for loosely coupled designs between objects that interact.

When two objects are _loosely coupled_, they can interact with each other but have very little knowledge of each other.

**The Observer Pattern** defines a one-to-many dependency between objects so that when one object changes state, all of its dependents are notified and updated automatically.

The Observer Pattern achieves loose coupling by:
- the only thing the subject knows about an observer is that it implements a certain interface
- separating what varies: the complete state of the subject and the number and types of observers
- can add/remove observers at any time
- never need to modify the subject to add new types of observers

You can push or pull data from the Subject when using the pattern (pulling by the observers is considered more “correct”).

<br/>

## The Decorator Pattern

> Classes should be open for extension, but closed for modification.

Be careful when choosing the areas of code that need to be extended; applying the Open-Closed Principle EVERYWHERE is wasteful and unnecessary, and can lead to complex, hard-to-understand code.

**The Decorator Pattern** attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.

Composition and delegation can often be used to add new behaviors at runtime. Decorators are typically transparent to the client of the component; that is, unless the client is relying on the component’s concrete type.

Decorating objects gives objects new responsibilities without making code changes to the underlying classes. The decorator adds its own behavior either before and/or after delegating to the component object it decorates to do the rest of the job.

Java's io package heavily uses the decorator pattern. i.e. To read contents from a zipped file, you might do `FileInputStream` wrapped with `BufferedInputStream` wrapped with `ZipInputStream`. The `FileInputStream` is the abstract component and the others are the concrete decorator implementations.

One drawback of the Decorator Pattern is that it often result in a large number of small classes that can be overwhelming to a developer trying to use the Decorator-based API. Overuse of this pattern will make the system more complex.

If some code logic is dependent on specific types, think twice before introducing decorators, as it hides the underlying types.

Use of the Factory and Builder patterns can help reduce the complexity of instantiate a component with many decorators.

<br/>

## The Factory Patterns

When you use the new operator you are certainly instantiating a concrete class, and certainly an implementation rather than an interface. This is against the principle that to program against interface, not implementation. Tying your code to a concrete class can make it more fragile and less flexible.

**The Factory Method Pattern** defines an interface for creating an object, but lets subclasses decide which class to instantiate. Factory Method lets a class defer instantiation to subclasses.

The Factory Patterns are really about encapsulating object creation. By encapsulating the object creation details in a separate and focused class, we have only one place to make modifications and everywhere that uses it stays untouched.

> The Dependency Inversion Principle: depend upon abstractions. Do not depend upon concrete classes. 

It suggests that our high-level components should not depend on our low-level components; rather, they should both depend on abstractions. Instead of starting at the top, start at the low-level concrete components and think about what you can abstract, then move on to design the high level with the abstraction in mind.

A few guidelines for trying to adhere with the principle:
- No variable should hold a reference to a concrete class.
- No class should derive from a concrete class.
- No method should override an implemented method of any of its base classes. Those methods implemented in the base class are meant to be shared by all your subclasses.

**The Abstract Factory Pattern** provides an interface for creating families of related or dependent objects without specifying their concrete classes.

An Abstract Factory gives us an interface for creating a family of products. By writing code that uses this interface, we decouple our code from the actual factory that creates the products. It allows us to implement a variety of factories that produce products meant for different contexts.

The differences between the two:
- how product object is created
  - Factory Method Pattern do it through inheritance
  - Abstract Factory Pattern do it through object composition
- the Factory Method Pattern is good for creating one product, while Abstract Factory Pattern is good for creating a family of products.
- how factory is created
  - Factory Method Pattern do it through implementing the abstract creator method that makes use of the concrete types the subclasses create
  - Abstract Factory Pattern do it through implementing factory methods

Use Factory Method Pattern if the number of concrete classes is foreseeably finite, or you don't know ahead of time all the concrete classes going to need.

Use Abstract Factory Method Pattern when need to create families of products, or those that make sense to belong in the same factory.

<br/>

## Singleton Pattern

Create objects that there is only one instance at run time, and create them only when they are needed.

There are many objects we only need one of: thread pools, caches, dialog boxes, objects that handle preferences and registry settings, objects used for logging, and objects that act as device drivers to devices like printers and graphics cards.

**The Singleton Pattern** ensures a class has only one instance, and provides a global point of access to it.

If the singleton object is accessed by multiple threads, a few options to deal with it:
- Do nothing if the performance of getInstance() isn’t critical to your application.
- Move to an eagerly created instance rather than a lazily created one.
- Use “double-checked locking” to reduce the use of synchronization in getInstance().

Other cases when there can be more than one singleton instances
- when there are multiple versions of class loaders
- reflection, serialization and deserialization

It is also easy to use singleton but violate the loose coupling principle. Singletons are meant to be used sparingly. Enum is also a good way to create singletons

<br/>

## Command Pattern

This pattern is about encapsulating method invocation. It allows you to decouple the requester of an action from the object that actually performs the action.

A command object encapsulates a request to do something on a specific object. The caller doesn’t have any idea what the work is, it just has a command object that knows how to talk to the right object to get the work done.

**The Command Pattern** encapsulates a request as an object, thereby letting you parameterize other objects with different requests, queue or log requests, and support undoable operations.

From the outside, no other objects really know what actions get performed on what receiver; they just know that if they call the execute() method, their request will be serviced. The receiver of the request gets bound to the command it’s encapsulated in. In general, we strive for “dumb” command objects that just invoke an action on a receiver.

The NoCommand object is an example of a null object. A null object is useful when you don’t have a meaningful object to return, and yet you want to remove the responsibility for handling null from the client.

Java's lambda expressions can be used to populate commands. Say, use a function object as a command. You can only do this if your Command interface has one abstract method.

Another flavor of this pattern, the Meta Command Pattern allows you to create macros of commands so that you can execute multiple commands at once. The idea is to create another command that keeps a list of other commands, and execute them when execute() is called

Commands allows packaging a piece of computation and pass it around. The computation itself may be invoked asynchronously or invoked by a different thread. The commands can also be put inside a queue and executed in sequence or saved as a batch, useful for applications like logging or transactional systems.

<br/>

## Adaper and Facade Patterns

The client makes a request to the adapter by calling a method on it using the target interface. The adapter translates the request into one or more calls on the adaptee using the adaptee interface. The client receives the results of the call and never knows there is an adapter doing the translation.

Note that the Client and Adaptee are decoupled – neither knows about the other. You may need to adapt many classes to provide the interface a client is coded to

**The Adapter Pattern** converts the interface of a class into another interface the clients expect. Adapter lets classes work together that couldn’t otherwise because of incompatible interfaces.

With class adapter we subclass the Target and the Adaptee, while with object adapter we use composition to pass requests to an Adaptee.

There will be cases when a behavior is not implemented by the adaptee class, for which clients will have to watch out for potential exceptions (`UnsupportedOperationException`), but as long as the client is careful and the adapter is well documented this is a perfectly reasonable solution.

<br/>

## Facade Pattern

You can take a complex subsystem and make it easier to use by implementing a Facade class that provides one more reasonable interface.

A facade not only simplifies an interface, it decouples a client from a subsystem of components.

Facades and adapters may wrap multiple classes, but a facade’s intent is to simplify, while an adapter’s is to convert the interface to something different.

**The Facade Pattern** provides a unified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use.

Principle of Least Knowledge: talk only to your immediate friends. When you are designing a system, for any object, be careful of the number of classes it interacts with and also how it comes to interact with those classes. Prevent designing a large number of classes coupled together.

We should only invoke methods that belong to:
- The object itself
- Objects passed in as a parameter to the method
- Any object the method creates or instantiates

Try not to call methods on objects that were returned from calling other methods.

An adapter wraps an object to change its interface, a decorator wraps an object to add new behaviors and responsibilities, and a facade “wraps” a set of objects to simplify.

<br/>

## Templating Pattern

When there are code duplication, it is a good sign to do some clean up, share the common code.

The Templating Pattern basically involves defining a set of methods that should be implemented. The Template Method defines the steps of an algorithm and allows subclasses to provide the implementation for one or more steps.

This pattern makes algorithm live in one place and one place to change. It prevents duplication on more concrete subclasses.

**The Template Method Pattern** defines the skeleton of an algorithm in a method, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm’s structure.

A hook is a method that is declared in the abstract class, but only given an empty or default implementation. This gives subclasses the ability to “hook into” the algorithm at various points, if they wish; a subclass is also free to ignore the hook.

It is good to provide more granular and optional steps as hooks, so it places less burden on the subclass but also provide a flexible functionality.

The Hollywood Principle: Don't call us, we'll call you. This principle is to prevent dependency rot.

Dependency rot happens when you have high-level components depending on low-level components depending on high-level components depending on sideways components depending on low-level components, and so on.

The Hollywood Principle allow low-level components to hook themselves into a system, but the high-level components determine when they are needed, and how.

The Templating Pattern can also appear as having a static method as the templating method, and requires the concrete class to implement an interface. i.e. Java's `Array.sort` requires the object to implement the `Comparable` interface.

To prevent subclasses from changing the algorithm in the template method, declare the template method as final.

<br/>

## Iterator and Composite Patterns

These patterns are about allowing your clients to iterate through your objects without ever getting a peek at how you store your objects.

**The Iterator Pattern** provides a way to access the elements of an aggregate object sequentially without exposing its underlying representation.

It also places the task of traversal on the iterator object, not on the aggregate, which simplifies the aggregate interface and implementation, and places the responsibility where it should be.

External iterator, means that the client controls the iteration by calling next() to get the next element. An internal iterator is controlled by the iterator itself. In that case, because it’s the iterator that’s stepping through the elements, you have to tell the iterator what to do with those elements as it goes through them. 

A class should have only one reason to change, a single responsibility. Every responsibility of a class is an area of potential change. More than one responsibility means more than one area of change.

The only way to succeed is to be diligent in examining your designs and to watch out for signals that a class is changing in more than one way as your system grows.

We say that a module or class has high cohesion when it is designed around a set of related functions, and we say it has low cohesion when it is designed around a set of unrelated functions. Classes that adhere to the principle tend to have high cohesion and are more maintainable than classes that take on multiple responsibilities and have low cohesion.

**The Composite Pattern** allows you to compose objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly.

Using a composite structure, we can apply the same operations over both composites and individual objects. In other words, in most cases we can ignore the differences between compositions of objects and individual objects.

By allowing the Component interface to contain the child management operations and the leaf operations, a client can treat both composites and leaf nodes uniformly; so whether an element is a composite or leaf node becomes transparent to the client. Otherwise, by enforcing that any inappropriate calls on elements would be caught at compile time or runtime, but we’d lose transparency and our code would have to use conditionals and the instanceof operator. There are many design tradeoffs in implementing Composite. You need to balance transparency and safety with your needs.

<br/>

## State Pattern

In a state diagram, all states are in different configurations of the machine that behave in a certain way and need some action to take them to another state. This pattern allows an object to have many different behaviors that are based on its internal state.

By using the state pattern we want
- localize the behavior of each state into its own class
- remove troublesome if-statements on the machine's state variables
- close each state for modification

**The State Pattern** allows an object to alter its behavior when its internal state changes. The object will appear to change its class.

With the State Pattern, we have a set of behaviors encapsulated in state objects; at any time the context is delegating to one of those states. Over time, the current state changes across the set of state objects to reflect the internal state of the context, so the context’s behavior changes over time as well. The client usually knows very little, if anything, about the state objects.

With Strategy, the client usually specifies the strategy object that the context is composed with.

Think of the State Pattern as an alternative to putting lots of conditionals in your context; by encapsulating the behaviors within state objects, you can simply change the state object in context to change its behavior. 

The disadvantage of having state transitions in the state classes is that we create dependencies between the state classes. Also by encapsulating state behavior into separate state classes, you’ll always end up with more classes in your design.

It is the Context’s job to oversee its state, and you don’t usually want a client changing the state of a Context without that Context’s knowledge.

Given we had no common functionality to put into an abstract class, we went with an interface. In your own implementation, you might want to consider an abstract class. Doing so has the benefit of allowing you to add methods to the abstract class later, without breaking the concrete state implementations.

<br/>

## Proxy Pattern

This pattern controlls object access. Your client object acts like it’s making remote method calls. But what it’s really doing is calling methods on a heap-local ‘proxy’ object that handles all the low-level details of network communication.

Java’s Remote Method Invocation (RMI) gives us a way to find objects in a remote JVM and allows us to invoke their methods. The nice thing about RMI is that you don’t have to write any of the networking or I/O code yourself. With your client, you call remote methods just like normal method calls on objects running in the client’s own local JVM.

RMI Nomenclature: in RMI, the client helper is a ‘stub’ and the service helper is a ‘skeleton’.

To do this, we need:
- remote interface - defines methods that a client can call remotely and both the Stub and actual service will implement this
  - extend `java.rmi.Remote` and declare all methods to throw a `RemoteException`
  - if the methods in an interface declare exceptions, any code calling methods on a reference of that type (the interface type) must handle or declare the exceptions
- remote implementation - the object that client wants to remotely call methods on
  - extend `java.rmi.server.UnicastRemoteObject` and inherit useful methods from that class
  - the methods will handle the remote calls
  - other RemoteObject classes exist
  - register your service using the static `rebind()` method of the `java.rmi.Naming` class
- RMI registry - where the client gets the proxy object (stub/helper object)
  - start `rmiregistry` in the class directory
- start remote service - registers the service with the RMI registry and available for clients
  - start the service

When making remote method calls, the arguments and return types must be serializable.

**The Proxy Pattern** provides a surrogate or placeholder for another object to control access to it.

Use the Proxy Pattern to create a representative object that controls access to another object, which may be remote, expensive to create, or in need of securing.

The Proxy Pattern has many forms. What they all have in common is that they intercept a method invocation that the client is making on the subject. Some of them are:
- A remote proxy controls access to a remote object.
  - the proxy acts as a local representative for an object that lives in a different JVM
- A virtual proxy controls access to a resource that is expensive to create.
  - defers the creation of the object until it is needed and acts as a surrogate for the object before and while it is being created
- A protection proxy controls access to a resource based on access rights.

Java’s got its own proxy support right in the java.lang.reflect package. With this package, Java lets you create a proxy class on the fly that implements one or more interfaces and forwards method invocations to a class that you specify. This is called the **dynamic proxy**.

To do this, we need:
- create `InvocationHandlers` that implement the behavior of the proxy, beacuase Java will create the actual proxy class and object that we don't control.
- write code to create the dynamic proxies and instantiate them.
- wrap the protected object with the appropriate proxy

<br/>

## Compound Pattern

This pattern is in fact pattern of patterns. A compound pattern is a set of a few patterns that are combined to solve a general problem.

The Model-View-Controller pattern is actually a compound pattern.

<br/>

## Collection of all wisdoms

OO Basics
- Abstraction
- Encapsulation
- Polymorphism
- Inheritance

OO Principles
- Encasulate what varies
- Favor composition over inheritance
- Program to interfaces, not implementations
- Strive for loosely coupled designs between objects that interact
- Depend on abstractions. Do not depend on concrete classes
- Principle of Least Knowledge: talk only to your immediate friends
- The Hollywood Principle: Don't call us, we'll call you
- A class should have only one reason to change, a single responzibility

OO Patterns
- **The Strategy Pattern** defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.
- **The Observer Pattern** defines a one-to-many dependency between objects so that when one object changes state, all of its dependents are notified and updated automatically.
- **The Decorator Pattern** attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.
- **The Factory Method Pattern** defines an interface for creating an object, but lets subclasses decide which class to instantiate. Factory Method lets a class defer instantiation to subclasses.
- **The Abstract Factory Pattern** provides an interface for creating families of related or dependent objects without specifying their concrete classes.
- **The Singleton Pattern** ensures a class has only one instance, and provides a global point of access to it.
- **The Command Pattern** encapsulates a request as an object, thereby letting you parameterize other objects with different requests, queue or log requests, and support undoable operations.
- **The Adapter Pattern** converts the interface of a class into another interface the clients expect. Adapter lets classes work together that couldn’t otherwise because of incompatible interfaces.
- **The Facade Pattern** provides a unified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use.
- **The Template Method Pattern** defines the skeleton of an algorithm in a method, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm’s structure.
- **The Iterator Pattern** provides a way to access the elements of an aggregate object sequentially without exposing its underlying representation.
- **The Composite Pattern** allows you to compose objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly
- **The State Pattern** allows an object to alter its behavior when its internal state changes. The object will appear to change its class.
- **The Proxy Pattern** provides a surrogate or placeholder for another object to control access to it.
