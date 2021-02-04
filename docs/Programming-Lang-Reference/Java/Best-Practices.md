---
layout: note_page
title: Java - Effective Java
title_short: effective_java
dateStr: 2015-09-01
category: Reading-Notes
tags: notes reference check
---
## Chapter 2. Creating and Destroying Objects

> 1. Consider static factory methods instead of constructors

A class can provide a public static factory method, which is simply a static method that returns an instance of the class.

A static factory method is not the same as the Factory Method pattern from Design Patterns

**Advantages**:

- can use well-chosen name to make code easier to read
- not required to create a new object each time invoked
    - save resource on expensive-to-create objects
- can return an object of any subtype of their return type
    -  requires the client to refer to the returned object by interface rather than implementation class
    - an API can return objects without making their classes public, hiding implementation classes
- the class of the returned object can vary from call to call as a function of the input parameters
- the class of the returned object need not exist when the class containing the method is written

**Disadvantages**:

- classes without public or protected constructors cannot be subclassed
- static factory methods are hard for programmers to find
    - do not stand out in API documentation

### Side note about service provider framework

There are three essential components in a service provider framework: a service interface, which represents an implementation; a provider registration API, which providers use to register implementations; and a service access API, which clients use to obtain instances of the service.

The service access API may allow clients to specify criteria for choosing an implementation. In the absence of such criteria, the API returns an instance of a default implementation, or allows the client to cycle through all available implementations. The service access API is the flexible static factory that forms the basis of the service provider framework.

An optional fourth component of a service provider framework is a service provider interface, which describes a factory object that produces instances of the service interface. In the absence of a service provider interface, implementations must be instantiated reflectively.

In the case of JDBC, Connection plays the part of the service interface, DriverManager.registerDriver is the provider registration API, DriverManager.getConnection is the service access API, and Driver is the service provider interface.

### Some common names for static factory methods

- from — A type-conversion method that takes a single parameter and returns a corresponding instance of this type. i.e. `Date.from(instant)`
- of — An aggregation method that takes multiple parameters and returns an instance of this type that incorporates them, i.e. `EnumSet.of(JACK, QUEEN, KING)`
- valueOf — A more verbose alternative to `from` and `of`, i.e. `BigInteger.valueOf(Integer.MAX_VALUE)`
- instance or getInstance — Returns an instance that is described by its parameters (if any) but cannot be said to have the same value. i.e. `StackWalker.getInstance(options)`
- create or newInstance — Like `instance` or `getInstance`, except that the method guarantees that each call returns a new instance, i.e. `Array.newInstance(classObject, arrayLen)`
- getType — Like `getInstance`, but used if the factory method is in a different class. Type is the type of object returned by the factory method. i.e. `Files.getFileStore(path)`
- newType — Like newInstance, but used if the factory method is in a different class. Type is the type of object returned by the factory method. i.e. `Files.newBufferedReader(path)`
- type — A concise alternative to getType and newType. i.e. `Collections.list(legacyLitany)`

<br/>

> 2. Consider a builder when faced with many constructor parameters

Instead of making the desired object directly, the client calls a constructor (or static factory) with all of the required parameters and gets a builder object.

Then the client calls setter-like methods on the builder object to set each optional parameter of interest.

Finally, the client calls a parameterless build method to generate the object, which is typically immutable.

To detect invalid parameters as soon as possible, check parameter validity in the builder’s constructor and methods. Check invariants involving multiple parameters in the constructor invoked by the build method. To ensure these invariants against attack, do the checks on object fields after copying parameters from the builder. If a check fails, throw an `IllegalArgumentException`.

The Builder pattern is well suited to class hierarchies. Use a parallel hierarchy of builders, each nested in the corresponding class.

```java
public abstract class Pizza {
   public enum Topping { HAM, MUSHROOM, ONION, PEPPER, SAUSAGE }

   final Set<Topping> toppings;

   abstract static class Builder<T extends Builder<T>> { // generic type with a recursive type parameter
      EnumSet<Topping> toppings = EnumSet.noneOf(Topping.class);
      public T addTopping(Topping topping) {
         toppings.add(Objects.requireNonNull(topping));
         return self();
      }
      abstract Pizza build();
      // Subclasses must override this method to return "this"
      protected abstract T self();
   }

   Pizza(Builder<?> builder) {
      toppings = builder.toppings.clone(); // See Item  50
   }
}
public class NyPizza extends Pizza {
    public enum Size { SMALL, MEDIUM, LARGE }
    private final Size size;

    public static class Builder extends Pizza.Builder<Builder> {
        private final Size size;
        public Builder(Size size) {
            this.size = Objects.requireNonNull(size);
        }
        @Override public NyPizza build() {
            return new NyPizza(this);
        }
        @Override protected Builder self() { return this; }
    }

    private NyPizza(Builder builder) {
        super(builder);
        size = builder.size;
    }
}
NyPizza pizza = new NyPizza.Builder(SMALL).addTopping(SAUSAGE).addTopping(ONION).build();
```

the Builder pattern is a good choice when designing classes whose constructors or static factories would have more than a handful of parameters, especially if many of the parameters are optional or of identical type.

<br/>

> 3. Enforce the singleton property with a private constructor or an enum type

Making a class a singleton can make it difficult to test its clients because it’s impossible to substitute a mock implementation for a singleton unless it implements an interface that serves as its type.

```java
public class Elvis {
  // exactly one Elvis instance will exist once the Elvis class is initialized—no more, no less
  public static final Elvis INSTANCE = new Elvis();
  private Elvis() { ... }
  ...
}
```

The above approach is simple and guarantees a singleton instance.

```java
// another approach
public class Elvis {
  private static final Elvis INSTANCE = new Elvis();
  private Elvis() { ... }
  // All calls to Elvis.getInstance return the same object reference, and no other Elvis instance will ever be created
  public static Elvis getInstance() { return INSTANCE; }
}
```

The above approach gives the flexibility to change mind for singleton, allows us write generic singleton factory, and a method reference can be used as a supplier i.e. Elvis::instance

```java
// a third way
public enum Elvis {
  INSTANCE;
  ...
}
```

The above approach is very concise, with serialization.

To make sure even after the object is deserialized still a singleton,

```java
public class Elvis implements Serializable {
  private static final transient Elvis INSTANCE = new Elvis();
  ...
  private Object readResolve() { return INSTANCE; }
}
```

A single-element enum type is often the best way to implement a singleton. Note that you can’t use this approach if your singleton must extend a superclass.

<br/>

> 4. Enforce noninstantiability with a private constructor

a class can be made noninstantiable by including a private constructor.

<br/>

> 5. Prefer dependency injection to hardwiring resources

Static utility classes and singletons are inappropriate for classes whose behavior is parameterized by an underlying resource.

Dependency Injection: Pass the resource into the constructor when creating a new instance.

It preserves immutability, and is equally applicable to constructors, static factories, and builders.

A useful variant of the pattern is to pass a resource factory to the constructor. *The Supplier<T>* interface, introduced in Java 8, is perfect for representing factories.

Methods that take a Supplier<T> on input should typically constrain the factory’s type parameter using a bounded wildcard type to allow the client to pass in a factory that creates any subtype of a specified type. i.e. `Mosaic create(Supplier<? extends Tile> tileFactory) { ... }`

In summary, do not use a singleton or static utility class to implement a class that depends on one or more underlying resources whose behavior affects that of the class, and do not have the class create these resources directly.

Instead, pass the resources, or factories to create them, into the constructor (or static factory or builder).

<br/>

> 6. Avoid creating unnecessary objects

Reuse can be both faster and more stylish. An object can always be reused if it is immutable.

Some object creations are much more expensive than others. If you’re going to need such an "expensive object" repeatedly, it may be advisable to cache it for reuse.

One good example:

```java
static boolean isRomanNumeral(String s) {
    return s.matches("^(?=.)M*(C[MD]|D?C{0,3})" + "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$");
}
```

is expensive to create a Pattern Object. As the method is called repeatedly, more Pattern Objects are created. Better:

```java
public class RomanNumerals {
    private static final Pattern ROMAN = Pattern.compile("^(?=.)M*(C[MD]|D?C{0,3})" + "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$");
    static boolean isRomanNumeral(String s) {
        return ROMAN.matcher(s).matches();
    }
}
```

Aside from the performance improvement, making a static final field for the otherwise invisible Pattern instance allows us to give it a name, which is far more readable than the regular expression itself.

Prefer primitives to boxed primitives, and watch out for unintentional autoboxing.

Avoiding object creation by maintaining your own object pool is a bad idea unless the objects in the pool are extremely heavyweight.

Generally speaking, however, maintaining your own object pools clutters your code, increases memory footprint, and harms performance. Modern JVM implementations have highly optimized garbage collectors that easily outperform such object pools on lightweight objects.

<br/>

> 7. Eliminate obsolete object references

A prog. lang with garbage collector does not mean you don't need to worry about memory management.

The best way to eliminate an obsolete reference is to let the variable that contained the reference fall out of scope. This occurs naturally if you define each variable in the narrowest possible scope.

Generally speaking, whenever a class manages its own memory, the programmer should be alert for memory leaks. Whenever an element is freed, any object references contained in the element should be nulled out.

Another common source of memory leaks is caches.

A third common source of memory leaks is listeners and other callbacks, which happens when clients register callbacks but don’t deregister them explicitly. One way to ensure that callbacks are garbage collected promptly is to store only weak references to them, for instance, by storing them only as keys in a WeakHashMap.

<br/>

> 8. Avoid finalizers and cleaners

Finalizers are unpredictable, often dangerous, and generally unnecessary.

Cleaners are less dangerous than finalizers, but still unpredictable, slow, and generally unnecessary.

It can take arbitrarily long between the time that an object becomes unreachable and the time its finalizer or cleaner runs. This means that you should never do anything time-critical in a finalizer or cleaner. And you should never depend on a finalizer or cleaner to update persistent state.

Just have your class implement AutoCloseable, and require its clients to invoke the close method on each instance when it is no longer needed, typically using try-with-resources to ensure termination even in the face of exceptions.

One detail worth mentioning is that the instance must keep track of whether it has been closed: the close method must record in a field that the object is no longer valid, and other methods must check this field and throw an IllegalStateException if they are called after the object has been closed.

So what, if anything, are cleaners and finalizers good for? They have perhaps two legitimate uses.

One is to act as a safety net in case the owner of a resource neglects to call its close method.

A second legitimate use of cleaners concerns objects with native peers. A native peer is a native (non-Java) object to which a normal object delegates via native methods. Because a native peer is not a normal object, the garbage collector doesn’t know about it and can’t reclaim it when its Java peer is reclaimed. A cleaner or finalizer may be an appropriate vehicle for this task.

How to write a cleaner

```java
public class Room implements AutoCloseable {
    private static final Cleaner cleaner = Cleaner.create();
    // Resource that requires cleaning. Must not refer to Room!
    private static class State implements Runnable {
        int numJunkPiles; // Number of junk piles in this room
        State(int numJunkPiles) {
            this.numJunkPiles = numJunkPiles;
        }
        // Invoked by close method or cleaner
        @Override
        public void run() {
            System.out.println("Cleaning room");
            numJunkPiles = 0;
        }
    }
    // The state of this room, shared with our cleanable
    private final State state;
    // Our cleanable. Cleans the room when it’s eligible for gc
    private final Cleaner.Cleanable cleanable;
    public Room(int numJunkPiles) {
        state = new State(numJunkPiles);
        cleanable = cleaner.register(this, state);
    }
    @Override
    public void close() {
        cleanable.clean();
    }
}
```

State implements Runnable, and its run method is called at most once, by the Cleanable that we get when we register our State instance with our cleaner in the Room constructor.

The call to the run method will be triggered by one of two things: Usually it is triggered by a call to Room’s close method calling Cleanable’s clean method. If the client fails to call the close method by the time a Room instance is eligible for garbage collection, the cleaner will (hopefully) call State’s run method.

It is critical that a State instance does not refer to its Room instance. If it did, it would create a circularity that would prevent the Room instance from becoming eligible for garbage collection.

If clients surround all Room instantiations in try-with-resource blocks, automatic cleaning will never be required.

```java
public class Adult {
    public static void main ( String[] args ) {}
        try (Room myRoom = new Room(7)) {
            System.out.println("Goodbye");
        } catch () {

        }
    }
}
```

In summary, don’t use cleaners, or in releases prior to Java 9, finalizers, except as a safety net or to terminate noncritical native resources. Even then, beware the indeterminacy and performance consequences.

<br/>

> 9. Prefer try-with-resources to try-finally

Historically, a try-finally statement was the best way to guarantee that a resource would be closed properly, even in the face of an exception or return.

```java
// try-finally - No longer the best way to close resources!
static String firstLineOfFile(String path) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(path));
    try {
        return br.readLine();
    } finally {
        br.close();
    }
}
```

However, the code in both the try block and the finally block is capable of throwing exceptions.

Java 7 introduced the try-with-resources statement. To be usable with this construct, a resource must implement the AutoCloseable interface, which consists of a single void-returning close method.

```
static String firstLineOfFile(String path) throws IOException {
    try (BufferedReader br = new BufferedReader(new FileReader(path))) {
       return br.readLine();
    }
}
```

Not only are the try-with-resources versions shorter and more readable than the originals, but they provide far better diagnostics. Multiple exceptions may be suppressed in order to preserve the exception that you actually want to see.

## Chapter 3. Methods Common to All Objects

ALTHOUGH Object is a concrete class, it is designed primarily for extension. All of its nonfinal methods (equals, hashCode, toString, clone, and finalize) have explicit general contracts because they are designed to be overridden.

<br/>

> 10. Obey the general contract when overriding EQUALS

The easiest way to avoid problems is not to override the equals method, in which case each instance of the class is equal only to itself. This applies when:

- Each instance of the class is inherently unique.
- There is no need for the class to provide a "logical equality" test.
- A superclass has already overridden equals, and the superclass behavior is appropriate for this class.
- The class is private or package-private, and you are certain that its equals method will never be invoked.

It is appropriate to override equals when a class has a notion of logical equality that differs from mere object identity and a superclass has not already overridden equals, generally the case for value classes.

A value class is simply a class that represents a value, such as Integer or String.

Overriding equals enables instances to serve as map keys or set elements with predictable, desirable behavior.

One kind of value class that does not require the equals method to be overridden is a class that uses instance control to ensure that at most one object exists with each value. Enum types fall into this category. For these classes, logical equality is the same as object identity, so Object’s equals method functions as a logical equals method.

equals implements an equivalence relation. It has following properties:

- Reflexive: For any non-null reference value x, x.equals(x) must return true.
- Symmetric: For any non-null reference values x and y, x.equals(y) must return true if and only if y.equals(x) returns true.
- Transitive: For any non-null reference values x, y, z, if x.equals(y) returns true and y.equals(z) returns true, then x.equals(z) must return true.
- Consistent: For any non-null reference values x and y, multiple invocations of x.equals(y) must consistently return true or consistently return false, provided no information used in equals comparisons is modified.
- For any non-null reference value x, x.equals(null) must return false.

Once you’ve violated the equals contract, you simply don’t know how other objects will behave when confronted with your object.

There is no way to extend an instantiable class and add a value component while preserving the equals contract, unless you’re willing to forgo the benefits of object-oriented abstraction.

While there is no satisfactory way to extend an instantiable class and add a value component, there is a fine workaround:

"Favor composition over inheritance." Instead of having ColorPoint extend Point, give ColorPoint a private Point field and a public view method that returns the point at the same position as this color point.

```java
// Adds a value component without violating the equals contract

public class ColorPoint {
   private final Point point;
   private final Color color;
   public ColorPoint(int x, int y, Color color) {
      point = new Point(x, y);
      this.color = Objects.requireNonNull(color);
   }
   public Point asPoint() {
      return point;
   }
   @Override public boolean equals(Object o) {
      if (!(o instanceof ColorPoint))
         return false;
      ColorPoint cp = (ColorPoint) o;
      return cp.point.equals(point) && cp.color.equals(color);
   }
   ...    // Remainder omitted
}
```

There are some classes in the Java platform libraries that do extend an instantiable class and add a value component. For example, java.sql.Timestamp extends java.util.Date and adds a nanoseconds field. The equals implementation for Timestamp does violate symmetry and can cause erratic behavior if Timestamp and Date objects are used in the same collection or are otherwise intermixed.

Here is the recipe for a high-quality equals method:

1. Use the == operator to check if the argument is a reference to this object
2. Use the instanceof operator to check if the argument has the correct type
3. Cast the argument to the correct type
4. For each "significant" field in the class, check if that field of the argument matches the corresponding field of this object.
5. For primitive fields whose type is not float or double, use the == operator for comparisons; for object reference fields, call the equals method recursively; for float fields, use the static Float.compare(float, float) method; and for double fields, use Double.compare(double, double). The special treatment of float and double fields is made necessary by the existence of Float.NaN, -0.0f and the analogous double values
6. Some object reference fields may legitimately contain null. To avoid the possibility of a NullPointerException, check such fields for equality using the static method Objects.equals(Object, Object)
7. For best performance, you should first compare fields that are more likely to differ, less expensive to compare, or, ideally, both.
8. When you are finished writing your equals method, ask yourself three questions: Is it symmetric? Is it transitive? Is it consistent?
9. Consistent use of the @Override annotation

An excellent alternative to writing and testing these methods manually is to use Google’s open source **AutoValue** framework, which automatically generates these methods for you, triggered by a single annotation on the class.

<br/>

> 11. Always override HASHCODE when you override EQUALS

If you fail to do so, your class will violate the general contract for hashCode, which will prevent it from functioning properly in collections such as HashMap and HashSet:

- When the hashCode method is invoked on an object repeatedly during an execution of an application, it must consistently return the same value
- If two objects are equal according to the equals(Object) method, then calling hashCode on the two objects must produce the same integer result
- If two objects are unequal according to the equals(Object) method, it is not required that calling hashCode on each of the objects must produce distinct results (although it helps improve performance of hash tables)

Receipe for fair good hashcode:

1. Declare an int variable named result, and initialize it to the hash code *c* for the first significant field in your object
2. For every remaining significant field f in your object, computer an int hash code *c*:
  1. if the field is a primitive type, compute Type.hashCode(f)
  2. if the field is an Object and this class’s equals method compares the field by recursively invoking equals, recursively invoke hashCode on the field; if a more complex comparison is required, compute a "canonical representation" for this field and invoke hashCode on the canonical representation; if the value of the field is null, use 0
  3. If the field is an array, treat it as if each significant element were a separate field.
3. Do this for each hashcode *c* computed `result = 31 * result + c;`
4. `return result;`

Some other advices:

- If a class is immutable and the cost of computing the hash code is significant, you might consider caching the hash code in the object rather than recalculating it each time it is requested.
- Do not be tempted to exclude significant fields from the hash code computation to improve performance.
- Don’t provide a detailed specification for the value returned by hashCode, so clients can’t reasonably depend on it; this gives you the flexibility to change it.
- The AutoValue framework provides a fine alternative to writing equals and hashCode methods manually

<br/>

> 12. Always override TOSTRING

The returned string of *toString* should be "a concise but informative representation that is easy for a person to read." Providing a good toString implementation makes your class much more pleasant to use and makes systems using the class easier to debug.

When practical, the toString method should return all of the interesting information contained in the object.

It is recommended to specify the format of the return value for value classes. If you specify the format, it’s usually a good idea to also provide a matching static factory or constructor so programmers can easily translate back and forth between the object and its string representation.

Whether or not you decide to specify the format, you should clearly document your intentions.

Whether or not you specify the format, provide programmatic access to the information contained in the value returned by toString.

It makes no sense to write a toString method in a static utility class. Nor should you write a toString method in most enum types because Java provides a perfectly good one for you. You should, however, write a toString method in any abstract class whose subclasses share a common string representation.

<br/>

> 13. Override CLONE with Causion

The Cloneable interface determines the behavior of Object’s protected clone implementation: if a class implements Cloneable, Object’s clone method returns a field-by-field copy of the object; otherwise it throws CloneNotSupportedException.

Normally, implementing an interface says something about what a class can do for its clients. In this case, it modifies the behavior of a protected method on a superclass, which is very rare.

A class implementing Cloneable is expected to provide a properly functioning public clone method.

Note that immutable classes should never provide a clone method because it would merely encourage wasteful copying.

```java
@Override
public PhoneNumber clone() {
    try {
        return (PhoneNumber) super.clone();
    } catch (CloneNotSupportedException e) {
        throw new AssertionError();  // Can't happen
    }
}
```

In effect, the clone method functions as a constructor; you must ensure that it does no harm to the original object and that it properly establishes invariants on the clone.

```java
@Override public Stack clone() {
    try {
        Stack result = (Stack) super.clone();
        result.elements = elements.clone();
        return result;
    } catch (CloneNotSupportedException e) {
        throw new AssertionError();
    }
}
```

In order to make a class cloneable, it may be necessary to remove final modifiers from some fields.

Java supports covariant return types. In other words, an overriding method’s return type can be a subclass of the overridden method’s return type.

In effect, the clone method functions as a constructor; you must ensure that it does no harm to the original object and that it properly establishes invariants on the clone.

Public clone methods should omit the throws clause, as methods that don’t throw checked exceptions are easier to use.

To prevent a subclass from implementing a working clone method,

```java
@Override
protected final Object clone() throws CloneNotSupportedException {
  throw new CloneNotSupportedException();
}
```

If you write a thread-safe class that implements Cloneable, remember that its clone method must be properly synchronized, just like any other method.

A better approach to object copying is to provide a copy constructor or copy factory. A copy constructor is simply a constructor (or static method) that takes a single argument whose type is the class containing the constructor.

<br/>

> 14. Consider Implementing COMPARABLE

It is the sole method in the Comparable interface but it permits order comparisons in addition to simple equality comparisons, and it is generic. By implementing Comparable, a class indicates that its instances have a natural ordering. Sorting an array of objects that implement Comparable is as simple as this: `Arrays.sort(a);`

Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object. Throws ClassCastException if the specified object’s type prevents it from being compared to this object.

- The implementor must ensure that sgn(x.compareTo(y)) == -sgn(y. compareTo(x)) for all x and y. (This implies that x.compareTo(y) must throw an exception if and only if y.compareTo(x) throws an exception.)
- The implementor must also ensure that the relation is transitive: (x. compareTo(y) > 0 && y.compareTo(z) > 0) implies x.compareTo(z) > 0.
- Finally, the implementor must ensure that x.compareTo(y) == 0 implies that sgn(x.compareTo(z)) == sgn(y.compareTo(z)), for all z.
- It is strongly recommended, but not required, that (x.compareTo(y) == 0) == (x.equals(y))

In *Java 7*, static compare methods were added to all of Java’s boxed primitive classes. Use of the relational operators < and > in compareTo methods is verbose and error-prone and no longer recommended.

If a class has multiple significant fields, the order in which you compare them is critical. Start with the most significant field and work your way down. If a comparison results in anything other than zero (which represents equality), you’re done.

```java
public int compareTo(PhoneNumber pn) {
    int result = Short.compare(areaCode, pn.areaCode);
    if (result == 0)  {
        result = Short.compare(prefix, pn.prefix);
        if (result == 0)
            result = Short.compare(lineNum, pn.lineNum);
    }
    return result;
}
```

In *Java 8*, the Comparator interface was outfitted with a set of comparator construction methods, which enable fluent construction of comparators. These comparators can then be used to implement a compareTo method

```java
private static final Comparator<PhoneNumber> COMPARATOR =
    comparingInt((PhoneNumber pn) -> pn.areaCode)
      .thenComparingInt(pn -> pn.prefix)
      .thenComparingInt(pn -> pn.lineNum);
public int compareTo(PhoneNumber pn) {
    return COMPARATOR.compare(this, pn);
}
// alternative
static Comparator<PhoneNumber> hashCodeOrder = new Comparator<>() {
    public int compare(PhoneNumber o1, PhoneNumber o2) {
        int result =  Short.compare(areaCode, o2.areaCode);
        if (result == 0)  {
            result = Short.compare(prefix, pn.prefix);
            if (result == 0)
                result = Short.compare(lineNum, pn.lineNum);
        }
        return result;
    }
};
```

The method *comparingInt* is a static method that takes a key extractor function that maps an object reference to a key of type int and returns a comparator that orders instances according to that key.

The method *thenComparingInt* is an instance method on Comparator that takes an int key extractor function, and returns a comparator that first applies the original comparator and then uses the extracted key to break ties.

Classes implement the Comparable interface produce instances that can be easily sorted, searched, and used in comparison-based collections. When comparing field values in the implementations of the compareTo methods, avoid the use of the < and > operators. Instead, use the static compare methods in the boxed primitive classes or the comparator construction methods in the Comparator interface.

## Chapter 4 Classes and Interfaces

CLASSES and interfaces lie at the heart of the Java programming language. They are its basic units of abstraction.

<br/>

> 15: Minimize the accessibility of classes and members

A well-designed component hides all its implementation details, cleanly separating its API from its implementation. This concept, known as *information hiding or encapsulation*, is a fundamental tenet of software design that it decouples the components that comprise a system, allowing them to be developed, tested, optimized, used, understood, and modified in isolation.

The rule of thumb is simple: make each class or member as inaccessible as possible.

For top-level (non-nested) classes and interfaces, there are only two possible access levels: package-private and public.
- By making it package-private, you make it part of the implementation rather than the exported API, and you can modify it, replace it, or eliminate it in a subsequent release without fear of harming existing clients.
- If you make it public, you are obligated to support it forever to maintain compatibility.
- If a package-private top-level class or interface is used by only one class, consider making the top-level class a private static nested class of the sole class that uses it.
- If a method overrides a superclass method, it cannot have a more restrictive access level in the subclass than in the superclass.
- Instance fields of public classes should rarely be public; classes with public mutable fields are not generally thread-safe.
- It is wrong for a class to have a public static final array field, or an accessor that returns such a field, since clients will be able to modify the contents of the array.

Access levels:

- private—The member is accessible only from the top-level class where it is declared.
- package-private—The member is accessible from any class in the package where it is declared. Technically known as default access, this is the access level you get if no access modifier is specified (except for interface members, which are public by default).
- protected—The member is accessible from subclasses of the class where it is declared (subject to a few restrictions [JLS, 6.6.2]) and from any class in the package where it is declared.
- public—The member is accessible from anywhere.

As of *Java 9*, there are two additional, implicit access levels introduced as part of the module system.

- A module is a grouping of packages, like a package is a grouping of classes.
- A module may explicitly export some of its packages via export declarations in its module declaration.
- A module may explicitly export some of its packages via export declarations in its module declaration (which is by convention contained in a source file named module-info.java).
- Public and protected members of unexported packages in a module are inaccessible outside the module; within the module, accessibility is unaffected by export declarations.
- Using the module system allows you to share classes among packages within a module without making them visible to the entire world.

After carefully designing a minimal public API, you should prevent any stray classes, interfaces, or members from becoming part of the API. With the exception of public static final fields, which serve as constants, public classes should have no public fields. Ensure that objects referenced by public static final fields are immutable.

<br/>

> 16: In public classes, use accessor methods, not public fields

if a class is accessible outside its package, provide accessor methods to preserve the flexibility to change the class’s internal representation.

if a class is package-private or is a private nested class, there is nothing inherently wrong with exposing its data fields, assuming they do an adequate job of describing the abstraction provided by the class.

Public classes should never expose mutable fields. It is less harmful, though still questionable, for public classes to expose immutable fields. It is, however, sometimes desirable for package-private or private nested classes to expose fields, whether mutable or immutable.

<br/>

> 17: Minimize mutability

Immutable classes are easier to design, implement, and use than mutable classes. They are less prone to error and are more secure.

Five rules of thumb to make a class immutable:

1. Don’t provide methods that modify the object’s state (known as mutators).
2. Ensure that the class can’t be extended by making the class final.
3. Make all fields final.
4. Make all fields private.
5. Ensure exclusive access to any mutable components.

Immutable objects are simple and inherently thread-safe; they require no synchronization and can be shared freely. Immutable objects provide failure atomicity for free; their state never changes, so there is no possibility of a temporary inconsistency.

The major disadvantage of immutable classes is that they require a separate object for each distinct value.

```java
public class Complex {
    private final double re;
    private final double im;
    private Complex(double re, double im) {
        this.re = re;
        this.im = im;
    }
    public static Complex valueOf(double re, double im) {
      // sanity checks here
        return new Complex(re, im);
    }
    ... // Remainder unchanged
}
```

If you choose to have your immutable class implement Serializable and it contains one or more fields that refer to mutable objects, you must provide an explicit readObject or readResolve method, or use the ObjectOutputStream.writeUnshared and ObjectInputStream.readUnshared methods.

Constructors should create fully initialized objects with all of their invariants established.

<br/>

> 18: Favor composition over inheritance

Unlike method invocation, inheritance violates encapsulation. A subclass depends on the implementation details of its superclass for its proper function. The superclass’s implementation may change from release to release, and if it does, the subclass may break, even though its code has not been touched.

One caveat is that wrapper classes are not suited for use in callback frameworks, wherein objects pass self-references to other objects for subsequent invocations ("callbacks").

Because a wrapped object doesn’t know of its wrapper, it passes a reference to itself (this) and callbacks elude the wrapper. This is known as the SELF problem.

Inheritance is appropriate only when a genuine subtype relationship exists between the subclass and the superclass.

Even then, inheritance may lead to fragility if the subclass is in a different package from the superclass and the superclass is not designed for inheritance.

Use composition and forwarding instead of inheritance, especially if an appropriate interface to implement a wrapper class exists.

<br/>

> 19: Design and document for inheritance or else prohibit it

What does it mean for a class to be designed and documented for inheritance?

- A class must document its self-use of overridable methods.
- A class may have to provide hooks into its internal workings in the form of judiciously chosen protected methods or, in rare instances, protected fields.
- Constructors must not invoke overridable methods
- Designing a class for inheritance requires great effort and places substantial limitations on the class.

<br/>

> 20: Prefer interfaces to abstract classes

Here is why:

- To implement the type defined by an abstract class, a class must be a subclass of the abstract class. Not for interfaces.
- Existing classes can easily be retrofitted to implement a new interface.
- Interfaces are ideal for defining mixins. A mixin is a type that a class can implement in addition to its "primary type," to declare that it provides some optional behavior. It is called a mixin because it allows the optional functionality to be "mixed in" to the type’s primary functionality.
- Interfaces allow for the construction of nonhierarchical type frameworks. Type hierarchies are great for organizing some things, but other things don’t fall neatly into a rigid hierarchy.
    - i.e. class Singer and class SongWriter. A singer can also be a songwriter. A class can implement both Singer and SongWriter, but not extending both if they are abstract classes.
- Interfaces enable safe, powerful functionality enhancements via the wrapper class idiom

An interface is generally the best way to define a type that permits multiple implementations. If you export a nontrivial interface, you should strongly consider providing a skeletal implementation to go with it. To the extent possible, you should provide the skeletal implementation via default method.

<br/>

> 21: Design interfaces for posterity

In Java 8, the default method construct was added, with the intent of allowing the addition of methods to existing interfaces. Default methods are "injected" into existing implementations without the knowledge or consent of their implementors.

It is not always possible to write a default method that maintains all invariants of every conceivable implementation.

<br/>

> 22: Use interfaces only to define types

When a class implements an interface, the interface serves as a type that can be used to refer to instances of the class.

The constant interface pattern is a poor use of interfaces. Avoid making interfaces for the sake of defining constants.

<br/>

> 23: Prefer class hierarchies to tagged classes

Occasionally you may run across a class whose instances come in two or more flavors and contain a tag field indicating the flavor of the instance.

In short, tagged classes are verbose, error-prone, and inefficient.

A tagged class is just a pallid imitation of a class hierarchy.

If you’re tempted to write a class with an explicit tag field, think about whether the tag could be eliminated and the class replaced by a hierarchy.

<br/>

> 24: Favor static member classes over nonstatic

A nested class should exist only to serve its enclosing class. If a nested class would be useful in some other context, then it should be a top-level class.

There are four kinds of nested classes: static member classes, nonstatic member classes, anonymous classes, and local classes. All but the first kind are known as inner classes.

One common use of a static member class is as a public helper class, useful only in conjunction with its outer class.

Despite the syntactic similarity, static member classes and nonstatic member classes are very different. Each instance of a nonstatic member class is implicitly associated with an enclosing instance of its containing class.

If an instance of a nested class can exist in isolation from an instance of its enclosing class, then the nested class must be a static member class: it is impossible to create an instance of a nonstatic member class without an enclosing instance.

If you declare a member class that does not require access to an enclosing instance, always put the static modifier in its declaration

A common use of private static member classes is to represent components of the object represented by their enclosing class. i.e. many Map implementations have an internal Entry object for each key-value pair in the map.

There are many limitations on the applicability of anonymous classes. You can’t instantiate them except at the point they’re declared. You can’t perform instanceof tests or do anything else that requires you to name the class. You can’t declare an anonymous class to implement multiple interfaces or to extend a class and implement an interface at the same time. Clients of an anonymous class can’t invoke any members except those it inherits from its supertype. Because anonymous classes occur in the midst of expressions, they must be kept short—about ten lines or fewer—or readability will suffer.

If a nested class needs to be visible outside of a single method or is too long to fit comfortably inside a method, use a member class. If each instance of a member class needs a reference to its enclosing instance, make it nonstatic; otherwise, make it static. Assuming the class belongs inside a method, if you need to create instances from only one location and there is a preexisting type that characterizes the class, make it an anonymous class; otherwise, make it a local class.

<br/>

> 25: Limit source files to a single top-level class

Never put multiple top-level classes or interfaces in a single source file. Keep each source file one class (nested classes are okay to have).

## Chapter 5. Generics

With generics, you tell the compiler what types of objects are permitted in each collection. This results in programs that are both safer and clearer, but these benefits, which are not limited to collections, come at a price.

<br/>

> 26: Don’t use raw types

A class or interface whose declaration has one or more type parameters is a generic class or interface. Generic classes and interfaces are collectively known as generic types.

Each generic type defines a set of parameterized types, i.e. E in List<E>.

Each generic type defines a raw type, which is the name of the generic type used without any accompanying type parameters. i.e. List is a raw type for List<E>.

If you use raw types, you lose all the safety and expressiveness benefits of generics. But it is fine to use types that are parameterized to allow insertion of arbitrary objects, such as List<Object>.

If you want to use a generic type but you don’t know or care what the actual type parameter is, you can use a question mark instead (unbounded wildcard type). It is the most general parameterized type, capable of holding anything.

You can put any element into a collection with a raw type, easily corrupting the collection’s type invariant; you can’t put any element (other than null) into a Collection<?>.

You must use raw types in class literals. i.e. List.class, String[].class, and int.class are all legal, but List<String>.class and List<?>.class are not.

This is the preferred way to use the instanceof operator with generic types:

```java
if (o instanceof Set) {       // Raw type
    Set<?> s = (Set<?>) o;    // Wildcard type
    ...
}
```

<br/>

> 27: Eliminate unchecked warnings

When you program with generics, you will see many compiler warnings: unchecked cast warnings, unchecked method invocation warnings, unchecked parameterized vararg type warnings, and unchecked conversion warnings.

Many unchecked warnings are easy to eliminate. Eliminate every unchecked warning that you can. Unchecked warnings are important. Don’t ignore them. Every unchecked warning represents the potential for a ClassCastException at runtime.

If you can’t eliminate a warning, but you can prove that the code that provoked the warning is typesafe, then (and only then) suppress the warning with an @SuppressWarnings("unchecked") annotation.

The SuppressWarnings annotation can be used on any declaration, from an individual local variable declaration to an entire class. Always use the SuppressWarnings annotation on the smallest scope possible.

If you find yourself using the SuppressWarnings annotation on a method or constructor that’s more than one line long, you may be able to move it onto a local variable declaration.

Every time you use a @SuppressWarnings("unchecked") annotation, add a comment saying why it is safe to do so.

<br/>

> 28: Prefer lists to arrays

Arrays differ from generic types in two important ways.

First, arrays are covariant. This scary-sounding word means simply that if Sub is a subtype of Super, then the array type Sub[] is a subtype of the array type Super[]. Generics, by contrast, are invariant: for any two distinct types Type1 and Type2, List<Type1> is neither a subtype nor a supertype of List<Type2>.

```java
// Fails at runtime
Object[] objectArray = new Long[1];
objectArray[0] = "I don't fit in"; // Throws ArrayStoreException
// Fails at compile time
List<Object> ol = new ArrayList<Long>(); // Incompatible types
ol.add("I don't fit in");
```

Second major difference between arrays and generics is that arrays are reified. Means arrays know and enforce their element type at runtime. Generics, by contrast, are implemented by erasure, means that they enforce their type constraints only at compile time and discard (or erase) their element type information at runtime.

Because of these fundamental differences, arrays and generics do not mix well. For example, it is illegal to create an array of a generic type, a parameterized type, or a type parameter.

<br/>

> 29: Favor generic types

Writing your own generic types is a bit more difficult, but it’s worth the effort to learn how.

The first step in generifying a class is to add one or more type parameters to its declaration.

The next step is to replace all the uses of the type Object with the appropriate type parameter and then try to compile.

```java
public class Stack<E> {
    private E[] elements; // you can’t create an array of a non-reifiable type, such as E
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;
    @SuppressWarnings("unchecked")
    public Stack() {
        elements = (E[]) new Object[DEFAULT_INITIAL_CAPACITY];
    }
    public void push(E e) {
        ensureCapacity();
        elements[size++] = e;
    }
    public E pop() {
        if (size == 0)
            throw new EmptyStackException();
        E result = elements[--size];
        elements[size] = null; // Eliminate obsolete reference
        return result;
    }
    ... // no changes in isEmpty or ensureCapacity
}
```

Generic types are safer and easier to use than types that require casts in client code. When you design new types, make sure that they can be used without such casts. This will often mean making the types generic.

<br/>

> 30: Favor generic methods

Just as classes can be generic, so can methods. Static utility methods that operate on parameterized types are usually generic. All of the "algorithm" methods in Collections (such as binarySearch and sort) are generic.

```java
// Uses raw types - unacceptable! Compiles with warnings: unchecked call
public static Set union(Set s1, Set s2) {
    Set result = new HashSet(s1);
    result.addAll(s2);
    return result;
}
```

To fix these warnings and make the method typesafe, modify its declaration to declare a type parameter representing the element type for the three sets. The type parameter list, which declares the type parameters, goes between a method’s modifiers and its return type.

```java
public static <E> Set<E> union(Set<E> s1, Set<E> s2) {
    Set<E> result = new HashSet<>(s1);
    result.addAll(s2);
    return result;
}
```

On occasion, you will need to create an object that is immutable but applicable to many different types. Because generics are implemented by erasure, you can use a single object for all required type parameterizations, but you need to write a static factory method to repeatedly dole out the object for each requested type parameterization.

```java
// Generic singleton factory pattern
private static UnaryOperator<Object> IDENTITY_FN = (t) -> t;
@SuppressWarnings("unchecked")
public static <T> UnaryOperator<T> identityFunction() {
    return (UnaryOperator<T>) IDENTITY_FN;
}
```

The cast of IDENTITY_FN to (UnaryFunction<T>) generates an unchecked cast warning, as UnaryOperator<Object> is not a UnaryOperator<T> for every T. But the identity function is special: it returns its argument unmodified, so we know that it is typesafe to use it as a UnaryFunction<T>, whatever the value of T.

```java
// Sample program to exercise generic singleton
public static void main(String[] args) {
    String[] strings = { "jute", "hemp", "nylon" };
    UnaryOperator<String> sameString = identityFunction();
    for (String s : strings)
        System.out.println(sameString.apply(s));
    Number[] numbers = { 1, 2.0, 3L };
    UnaryOperator<Number> sameNumber = identityFunction();
    for (Number n : numbers)
        System.out.println(sameNumber.apply(n));
}
```

It is permissible, though relatively rare, for a type parameter to be bounded by some expression involving that type parameter itself. This is what’s known as a recursive type bound. A common use of recursive type bounds is in connection with the Comparable interface, which defines a type’s natural ordering.

Many methods take a collection of elements implementing Comparable to sort it, search within it, calculate its minimum or maximum, and the like. To do these things, it is required that every element in the collection be comparable to every other element in it.

```java
// Using a recursive type bound to express mutual comparability
public static <E extends Comparable<E>> E max(Collection<E> c);
```

The type bound <E extends Comparable<E>> may be read as "any type E that can be compared to itself".

In summary, generic methods, like generic types, are safer and easier to use than methods requiring their clients to put explicit casts on input parameters and return values.

<br/>

> 31: Use bounded wildcards to increase API flexibility

Sometimes you need more flexibility than invariant typing can provide.

```java
// Wildcard type for a parameter that serves as an E producer
public void pushAll(Iterable<? extends E> src) {
    for (E e : src)
        push(e);
}
// Two possible declarations for the swap method
public static <E> void swap(List<E> list, int i, int j);
public static void swap(List<?> list, int i, int j);
```

For maximum flexibility, use wildcard types on input parameters that represent producers or consumers.

If an input parameter is both a producer and a consumer, then wildcard types will do you no good: you need an exact type match, which is what you get without any wildcards.

As a rule, if a type parameter appears only once in a method declaration, replace it with a wildcard.

It doesn’t seem right that we can’t put an element back into the list that we just took it out of. The problem is that the type of list is List<?>, and you can’t put any value except null into a List<?>.

```java
public static void swap(List<?> list, int i, int j) {
    swapHelper(list, i, j);
}
// Private helper method for wildcard capture
private static <E> void swapHelper(List<E> list, int i, int j) {
    list.set(i, list.set(j, list.get(i)));
}
```

In summary, using wildcard types in your APIs, while tricky, makes the APIs far more flexible. If you write a library that will be widely used, the proper use of wildcard types should be considered mandatory. Remember the basic rule: producer-extends, consumer-super (PECS).

In other words, if a parameterized type represents a T producer, use <? extends T>; if it represents a T consumer, use <? super T>. In our Stack example, pushAll’s src parameter produces E instances for use by the Stack, so the appropriate type for src is Iterable<? extends E>; popAll’s dst parameter consumes E instances from the Stack, so the appropriate type for dst is Collection<? super E>.

<br/>

> 32: Combine generics and varargs judiciously

The purpose of varargs is to allow clients to pass a variable number of arguments to a method, but it is a leaky abstraction: when you invoke a varargs method, an array is created to hold the varargs parameters; that array, which should be an implementation detail, is visible. As a consequence, you get confusing compiler warnings when varargs parameters have generic or parameterized types.

If a method declares its varargs parameter to be of a non-reifiable type, the compiler generates a warning on the declaration. If the method is invoked on varargs parameters whose inferred type is non-reifiable, the compiler generates a warning on the invocation too.

Recall that non-reifiable type is one whose runtime representation has less information than its compile-time representation, and that nearly all generic and parameterized types are non-reifiable.

Heap pollution occurs when a variable of a parameterized type refers to an object that is not of that type.
```java
// Mixing generics and varargs can violate type safety!
static void dangerous(List<String>... stringLists) {
    List<Integer> intList = List.of(42);
    Object[] objects = stringLists;
    objects[0] = intList;             // Heap pollution
    String s = stringLists[0].get(0); // ClassCastException
}
```
It is unsafe to store a value in a generic varargs array parameter

The SafeVarargs annotation constitutes a promise by the author of a method that it is typesafe.

It is critical that you do not annotate a method with @SafeVarargs unless it actually is safe.

It is unsafe to give another method access to a generic varargs parameter array, with two exceptions: it is safe to pass the array to another varargs method that is correctly annotated with @SafeVarargs, and it is safe to pass the array to a non-varargs method that merely computes some function of the contents of the array.

<br/>

> 33: Consider typesafe heterogeneous containers

Common uses of generics include collections, such as Set<E> and Map<K,V>, and single-element containers, such as ThreadLocal<T> and AtomicReference<T>.
In all of these uses, it is the container that is parameterized. This limits you to a fixed number of type parameters per container.
```java
// Typesafe heterogeneous container pattern - API
public class Favorites {
    public <T> void putFavorite(Class<T> type, T instance);
    public <T> T getFavorite(Class<T> type);
}
// Typesafe heterogeneous container pattern - client
public static void main(String[] args) {
    Favorites f = new Favorites();
    f.putFavorite(String.class, "Java");
    f.putFavorite(Integer.class, 0xcafebabe);
    f.putFavorite(Class.class, Favorites.class);
    String favoriteString = f.getFavorite(String.class);
    int favoriteInteger = f.getFavorite(Integer.class);
    Class<?> favoriteClass = f.getFavorite(Class.class);
    System.out.printf("%s %x %s%n", favoriteString,
        favoriteInteger, favoriteClass.getName());
        // prints "Java cafebabe Favorites"
}
```

A Favorites instance is typesafe: it will never return an Integer when you ask it for a String. It is also heterogeneous: unlike an ordinary map, all the keys are of different types. Therefore, we call Favorites a *typesafe heterogeneous container*.
```java
// Typesafe heterogeneous container pattern - implementation
public class Favorites {
    private Map<Class<?>, Object> favorites = new HashMap<>();
    public <T> void putFavorite(Class<T> type, T instance) {
        favorites.put(Objects.requireNonNull(type), instance);
    }
    public <T> T getFavorite(Class<T> type) {
        return type.cast(favorites.get(type));
    }
}
```

Each Favorites instance is backed by a private Map<Class<?>, Object> called favorites. The thing to notice is that the wildcard type is nested: it’s not the type of the map that’s a wildcard type but the type of its key. This means that every key can have a different parameterized type: one can be Class<String>, the next Class<Integer>, and so on. That’s where the heterogeneity comes from.

The next thing to notice is that the value type of the favorites Map is simply Object. In other words, the Map does not guarantee the type relationship between keys and values, which is that every value is of the type represented by its key.

The cast method is the dynamic analogue of Java’s cast operator. It simply checks that its argument is an instance of the type represented by the Class object. If so, it returns the argument; otherwise it throws a ClassCastException.

In summary, the normal use of generics, exemplified by the collections APIs, restricts you to a fixed number of type parameters per container. You can get around this restriction by placing the type parameter on the key rather than the container. You can use Class objects as keys for such typesafe heterogeneous containers. A Class object used in this fashion is called a type token. You can also use a custom key type.

## Chapter 6. Enums and Annotations

JAVA supports two special-purpose families of reference types: a kind of class called an enum type, and a kind of interface called an annotation type.

<br/>

> 34: Use enums instead of int constants

An enumerated type is a type whose legal values consist of a fixed set of constants.

Java’s enum types are full-fledged classes, far more powerful than their counterparts in these other languages, where enums are essentially int values.

They are classes that export one instance for each enumeration constant via a public static final field. Enum types are effectively final, by virtue of having no accessible constructors. Because clients can neither create instances of an enum type nor extend it, there can be no instances but the declared enum constants.

They are a generalization of singletons (Item 3), which are essentially single-element enums.

Enums provide compile-time type safety. If you declare a parameter to be of type Apple, you are guaranteed that any non-null object reference passed to the parameter is one of the three valid Apple values.

Enum types with identically named constants coexist peacefully because each type has its own namespace. You can translate enums into printable strings by calling their toString method.

Enum types let you add arbitrary methods and fields and implement arbitrary interfaces. They provide high-quality implementations of all the Object methods, they implement Comparable and Serializable, and their serialized form is designed to withstand most changes to the enum type.

You should add methods or fields to an enum type when you need to associate data with its constants.
An enum type can start life as a simple collection of enum constants and evolve over time into a full-featured abstraction.
```java
// Enum type with data and behavior
public enum Planet {
    MERCURY(3.302e+23, 2.439e6),
    VENUS  (4.869e+24, 6.052e6),
    EARTH  (5.975e+24, 6.378e6),
    MARS   (6.419e+23, 3.393e6),
    JUPITER(1.899e+27, 7.149e7),
    SATURN (5.685e+26, 6.027e7),
    URANUS (8.683e+25, 2.556e7),
    NEPTUNE(1.024e+26, 2.477e7);
    private final double mass;           // In kilograms
    private final double radius;         // In meters
    private final double surfaceGravity; // In m / s^2
    // Universal gravitational constant in m^3 / kg s^2
    private static final double G = 6.67300E-11;
    // Constructor
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
        surfaceGravity = G * mass / (radius * radius);
    }
    public double mass()           { return mass; }
    public double radius()         { return radius; }
    public double surfaceGravity() { return surfaceGravity; }
    public double surfaceWeight(double mass) {
        return mass * surfaceGravity;  // F = ma
    }
}
public class WeightTable {
   public static void main(String[] args) {
      double earthWeight = Double.parseDouble(args[0]);
      double mass = earthWeight / Planet.EARTH.surfaceGravity();
      for (Planet p : Planet.values())
          System.out.printf("Weight on %s is %f%n",
                            p, p.surfaceWeight(mass));
      }
}
```

To associate data with enum constants, declare instance fields and write a constructor that takes the data and stores it in the fields.

Enums are by their nature immutable, so all fields should be final. Fields can be public, but it is better to make them private and provide public accessors.

If an enum is generally useful, it should be a top-level class; if its use is tied to a specific top-level class, it should be a member class of that top-level class.
```java
// Enum type that switches on its own value - questionable
public enum Operation {
    PLUS, MINUS, TIMES, DIVIDE;
    // Do the arithmetic operation represented by this constant
    public double apply(double x, double y) {
        switch(this) {
            case PLUS:   return x + y;
            case MINUS:  return x - y;
            case TIMES:  return x * y;
            case DIVIDE: return x / y;
        }
        throw new AssertionError("Unknown op: " + this);
    }
}
// Enum type with constant-specific method implementations
public enum Operation {
  PLUS  {public double apply(double x, double y){return x + y;}},
  MINUS {public double apply(double x, double y){return x - y;}},
  TIMES {public double apply(double x, double y){return x * y;}},
  DIVIDE{public double apply(double x, double y){return x / y;}};
  public abstract double apply(double x, double y);
}
```

It is better to declare an abstract apply method in the enum type, and override it with a concrete method for each constant in a constant-specific class body. Such methods are known as constant-specific method implementations.

Enum types have an automatically generated valueOf(String) method that translates a constant’s name into the constant itself.

If you override the toString method in an enum type, consider writing a fromString method to translate the custom string representation back to the corresponding enum. The following code (with the type name changed appropriately) will do the trick for any enum, so long as each constant has a unique string representation:
```java
// Implementing a fromString method on an enum type
private static final Map<String, Operation> stringToEnum =
        Stream.of(values()).collect(
            toMap(Object::toString, e -> e));
// Returns Operation for string, if any
public static Optional<Operation> fromString(String symbol) {
    return Optional.ofNullable(stringToEnum.get(symbol));
}
```

Note that the Operation constants are put into the stringToEnum map from a static field initialization that runs after the enum constants have been created.

Also note that the fromString method returns an Optional<Operation>. This allows the method to indicate that the string that was passed in does not represent a valid operation, and it forces the client to confront this possibility.

A disadvantage of constant-specific method implementations is that they make it harder to share code among enum constants.

Switches on enums are good for augmenting enum types with constant-specific behavior.

Enums are, generally speaking, comparable in performance to int constants. A minor performance disadvantage of enums is that there is a space and time cost to load and initialize enum types, but it is unlikely to be noticeable in practice.

Use enums any time you need a set of constants whose members are known at compile time.

It is not necessary that the set of constants in an enum type stay fixed for all time.

<br/>

> 35: Use instance fields instead of ordinals

All enums have an *ordinal* method, which returns the numerical position of each enum constant in its type.
Never derive a value associated with an enum from its ordinal; store it in an instance field instead.
```java
public enum Ensemble {
    SOLO(1), DUET(2), TRIO(3), QUARTET(4), QUINTET(5),
    SEXTET(6), SEPTET(7), OCTET(8), DOUBLE_QUARTET(8),
    NONET(9), DECTET(10), TRIPLE_QUARTET(12);
    private final int numberOfMusicians;
    Ensemble(int size) { this.numberOfMusicians = size; }
    public int numberOfMusicians() { return numberOfMusicians; }
}
```

<br/>

> 36: Use ENUMSET instead of bit fields

If the elements of an enumerated type are used primarily in sets, it is traditional to use the int enum pattern.

This representation lets you use the bitwise OR operation to combine several constants into a set, known as a bit field. This is called Bit Field enumeration constants. Obsolete!

The java.util package provides the EnumSet class to efficiently represent sets of values drawn from a single enum type. This class implements the Set interface, providing all of the richness, type safety, and interoperability you get with any other Set implementation.
```java
// EnumSet - a modern replacement for bit fields
public class Text {
    public enum Style { BOLD, ITALIC, UNDERLINE, STRIKETHROUGH }
    // Any Set could be passed in, but EnumSet is clearly best
    public void applyStyles(Set<Style> styles) { ... }
}
text.applyStyles(EnumSet.of(Style.BOLD, Style.ITALIC));
```

Just because an enumerated type will be used in sets, there is no reason to represent it with bit fields. The EnumSet class combines the conciseness and performance of bit fields with all the many advantages of enum types.

<br/>

> 37: Use ENUMMAP instead of ordinal indexing

It is rarely appropriate to use ordinals to index into arrays: use EnumMap instead. If the relationship you are representing is multidimensional, use EnumMap<..., EnumMap<...>>.
```java
// Using an EnumMap to associate data with an enum
Map<Plant.LifeCycle, Set<Plant>>  plantsByLifeCycle =
    new EnumMap<>(Plant.LifeCycle.class);
for (Plant.LifeCycle lc : Plant.LifeCycle.values())
    plantsByLifeCycle.put(lc, new HashSet<>());
for (Plant p : garden)
    plantsByLifeCycle.get(p.lifeCycle).add(p);
System.out.println(plantsByLifeCycle);
// Using a stream and an EnumMap to associate data with an enum
System.out.println(Arrays.stream(garden)
        .collect(groupingBy(p -> p.lifeCycle,
            () -> new EnumMap<>(LifeCycle.class), toSet())));
```

<br/>

> 38: Emulate extensible enums with interfaces

Enum types can implement arbitrary interfaces by defining an interface for the opcode type and an enum that is the standard implementation of the interface.
In summary, while you cannot write an extensible enum type, you can emulate it by writing an interface to accompany a basic enum type that implements the interface.

<br/>

> 39: Prefer annotations to naming patterns

Historically, it was common to use naming patterns to indicate that some program elements demanded special treatment by a tool or framework.
```java
// Marker annotation type declaration
import java.lang.annotation.*;
/**
 * Indicates that the annotated method is a test method.
 * Use only on parameterless static methods.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Test { ... }
// annotation type with a parameter
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
    Class<? extends Throwable> value();
}
// Program containing marker annotations
/**
 * Indicates that the annotated method is a test method that
 * must throw the designated exception to succeed.
 */
public class Sample {
    @Test public static void m1() { }  // Test should pass
    public static void m2() { }
    @Test public static void m3() {     // Test should fail
        throw new RuntimeException("Boom");
    }
    public static void m4() { }
    @Test public void m5() { } // INVALID USE: nonstatic method
    public static void m6() { }
    @Test public static void m7() {    // Test should fail
        throw new RuntimeException("Crash");
    }
    public static void m8() { }
}
```

The declaration for the Test annotation type is itself annotated with Retention and Target annotations. Such annotations on annotation type declarations are known as meta-annotations.

More generally, annotations don’t change the semantics of the annotated code but enable it for special treatment by tools.

As of Java 8, you can annotate the declaration of an annotation with the @Repeatable meta-annotation, to indicate that the annotation may be applied repeatedly to a single element.
```java
// Repeatable annotation type
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Repeatable(ExceptionTestContainer.class)
public @interface ExceptionTest {
    Class<? extends Exception> value();
}
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTestContainer {
    ExceptionTest[] value();
}
// Code containing a repeated annotation
@ExceptionTest(IndexOutOfBoundsException.class)
@ExceptionTest(NullPointerException.class)
public static void doublyBad() { ... }
```
All programmers should use the predefined annotation types that Java provides.

Also, consider using the annotations provided by your IDE or static analysis tools. Such annotations can improve the quality of the diagnostic information provided by these tools.

<br/>

> 40: Consistently use the OVERRIDE annotation

@Override indicates that the annotated method declaration overrides a declaration in a supertype.

Use the Override annotation on every method declaration that you believe to override a superclass declaration.

<br/>

> 41: Use marker interfaces to define types

A marker interface is an interface that contains no method declarations but merely designates (or "marks") a class that implements the interface as having some property.

Marker interfaces have two advantages over marker annotations.

First and foremost, marker interfaces define a type that is implemented by instances of the marked class; marker annotations do not.

Another advantage of marker interfaces over marker annotations is that they can be targeted more precisely.

The chief advantage of marker annotations over marker interfaces is that they are part of the larger annotation facility. Therefore, marker annotations allow for consistency in annotation-based frameworks.

Ask yourself the question "Might I want to write one or more methods that accept only objects that have this marking?" If so, you should use a marker interface in preference to an annotation. This will make it possible for you to use the interface as a parameter type for the methods in question, which will result in the benefit of compile-time type checking. If you can convince yourself that you’ll never want to write a method that accepts only objects with the marking, then you’re probably better off using a marker annotation. If, additionally, the marking is part of a framework that makes heavy use of annotations, then a marker annotation is the clear choice.

If you want to define a type that does not have any new methods associated with it, a marker interface is the way to go. If you want to mark program elements other than classes and interfaces or to fit the marker into a framework that already makes heavy use of annotation types, then a marker annotation is the correct choice.

If you find yourself writing a marker annotation type whose target is ElementType.TYPE, take the time to figure out whether it really should be an annotation type or whether a marker interface would be more appropriate.

## Chapter 7. Lambdas and Streams

<br/>

> 42: Prefer lambdas to anonymous classes

Historically, interfaces (or, rarely, abstract classes) with a single abstract method were used as function types. Their instances, known as function objects, represent functions or actions.
```java
// Anonymous class instance as a function object - obsolete!
Collections.sort(words, new Comparator<String>() {
    public int compare(String s1, String s2) {
        return Integer.compare(s1.length(), s2.length());
    }
});
```
Anonymous classes were adequate for the classic objected-oriented design patterns requiring function objects, notably the Strategy pattern.

The Comparator interface represents an abstract strategy for sorting; the anonymous class above is a concrete strategy for sorting strings.

In Java 8, the language formalized the notion that interfaces with a single abstract method are special and deserve special treatment.

These interfaces are now known as functional interfaces, and the language allows you to create instances of these interfaces using *lambda expressions*, or lambdas for short.
```java
// Lambda expression as function object (replaces anonymous class)
Collections.sort(words,
        (s1, s2) -> Integer.compare(s1.length(), s2.length()));
```
Note that the types of the lambda (Comparator<String>), of its parameters (s1 and s2, both String), and of its return value (int) are not present in the code.

The compiler deduces these types from context, using a process known as type inference.

Omit the types of all lambda parameters unless their presence makes your program clearer. If the compiler generates an error telling you it can’t infer the type of a lambda parameter, then specify it.

The addition of lambdas to the language makes it practical to use function objects where it would not previously have made sense.

Lambdas make it easy to implement constant-specific behavior using the former instead of the latter.

Lambdas lack names and documentation; if a computation isn’t self-explanatory, or exceeds a few lines, don’t put it in a lambda. One line is ideal for a lambda, and three lines is a reasonable maximum.

There are a few things you can do with anonymous classes that you can’t do with lambdas. Lambdas are limited to functional interfaces. If you want to create an instance of an abstract class, you can do it with an anonymous class, but not a lambda.

Finally, a lambda cannot obtain a reference to itself. In a lambda, the this keyword refers to the enclosing instance, which is typically what you want. In an anonymous class, the this keyword refers to the anonymous class instance.

<br/>

> 43: Prefer method references to lambdas

Java provides a way to generate function objects even more succinct than lambdas: method references.
```java
map.merge(key, 1, (count, incr) -> count + incr);
map.merge(key, 1, Integer::sum);
```

The parameters count and incr don’t add much value, and they take up a fair amount of space. Really, all the lambda tells you is that the function returns the sum of its two arguments.
```java
service.execute(GoshThisClassNameIsHumongous::action);
service.execute(() -> action());
```

Along similar lines, the Function interface provides a generic static factory method to return the identity function, Function.identity(). It’s typically shorter and cleaner not to use this method but to code the equivalent lambda inline: x -> x.

In summary, method references often provide a more succinct alternative to lambdas. Where method references are shorter and clearer, use them; where they aren’t, stick with lambdas.

<br/>

> 44: Favor the use of standard functional interfaces

If one of the standard functional interfaces does the job, you should generally use it in preference to a purpose-built functional interface.

There are forty-three interfaces in java.util.Function. Remember six basic interfaces, you can derive the rest.

The basic interfaces operate on object reference types.

- The Operator interfaces represent functions whose result and argument types are the same.
- The Predicate interface represents a function that takes an argument and returns a boolean.
- The Function interface represents a function whose argument and return types differ.
- The Supplier interface represents a function that takes no arguments and returns (or "supplies") a value.
- Finally, Consumer represents a function that takes an argument and returns nothing, essentially consuming its argument.

Interface|Function Signature|Example
---------|------------------|-------
UnaryOperator<T>|T apply(T t)|String::toLowerCase
BinaryOperator<T>|T apply(T t1, T t2)|BigInteger::add
Predicate<T>|boolean test(T t)|Collection::isEmpty
Function<T,R>|R apply(T t)|Arrays::asList
Supplier<T>|T get()|Instant::now
Consumer<T>|void accept(T t)|System.out::println

Don’t be tempted to use basic functional interfaces with boxed primitives instead of primitive functional interfaces. The performance consequences of using boxed primitives for bulk operations can be deadly.

You should seriously consider writing a purpose-built functional interface in preference to using a standard one if you need a functional interface that shares one or more of the following characteristics with Comparator:
- It will be commonly used and could benefit from a descriptive name.
- It has a strong contract associated with it.
- It would benefit from custom default methods.

Notice that the EldestEntryRemovalFunction interface is labeled with the @FunctionalInterface annotation. It is a statement of programmer intent that serves three purposes:

- it tells readers of the class and its documentation that the interface was designed to enable lambdas;
- it keeps you honest because the interface won’t compile unless it has exactly one abstract method;
- and it prevents maintainers from accidentally adding abstract methods to the interface as it evolves.

Always annotate your functional interfaces with the @FunctionalInterface annotation.

Do not provide a method with multiple overloadings that take different functional interfaces in the same argument position if it could create a possible ambiguity in the client.
The submit method of ExecutorService can take either a Callable<T> or a Runnable, and it is possible to write a client program that requires a cast to indicate the correct overloading.

The easiest way to avoid this problem is not to write overloadings that take different functional interfaces in the same argument position.

Now that Java has lambdas, it is imperative that you design your APIs with lambdas in mind. Accept functional interface types on input and return them on output. It is generally best to use the standard interfaces provided in java.util.function.Function, but keep your eyes open for the relatively rare cases where you would be better off writing your own functional interface.

<br/>

> 45: Use STREAMS judiciously

The streams API was added in Java 8 to ease the task of performing bulk operations, sequentially or in parallel.

This API provides two key abstractions: the stream, which represents a finite or infinite sequence of data elements, and the stream pipeline, which represents a multistage computation on these elements.

The elements in a stream can come from anywhere. Common sources include collections, arrays, files, regular expression pattern matchers, pseudorandom number generators, and other streams.

The data elements in a stream can be object references or primitive values. Three primitive types are supported: int, long, and double.

A stream pipeline consists of a source stream followed by zero or more intermediate operations and one terminal operation.

- Each intermediate operation transforms the stream in some way, such as mapping each element to a function of that element or filtering out all elements that do not satisfy some condition.
- Intermediate operations all transform one stream into another, whose element type may be the same as the input stream or different from it.

The terminal operation performs a final computation on the stream resulting from the last intermediate operation, such as storing its elements into a collection, returning a certain element, or printing all of its elements.

Stream pipelines are evaluated lazily: evaluation doesn’t start until the terminal operation is invoked, and data elements that aren’t required in order to complete the terminal operation are never computed.

This lazy evaluation is what makes it possible to work with infinite streams. Note that a stream pipeline without a terminal operation is a silent no-op.

The streams API is fluent: it is designed to allow all of the calls that comprise a pipeline to be chained into a single expression. In fact, multiple pipelines can be chained together into a single expression.

By default, stream pipelines run sequentially. Making a pipeline execute in parallel is as simple as invoking the parallel method on any stream in the pipeline, but it is seldom appropriate to do so.

The streams API is sufficiently versatile that practically any computation can be performed using streams, but just because you can doesn’t mean you should. When used inappropriately, they can make programs difficult to read and maintain.
```
// Prints all large anagram groups in a dictionary iteratively
public class Anagrams {
    public static void main(String[] args) throws IOException {
        File dictionary = new File(args[0]);
        int minGroupSize = Integer.parseInt(args[1]);
        Map<String, Set<String>> groups = new HashMap<>();
        try (Scanner s = new Scanner(dictionary)) {
            while (s.hasNext()) {
                String word = s.next();
                groups.computeIfAbsent(alphabetize(word),
                    (unused) -> new TreeSet<>()).add(word);
            }
        }
        for (Set<String> group : groups.values())
            if (group.size() >= minGroupSize)
                System.out.println(group.size() + ": " + group);
    }
    private static String alphabetize(String s) {
        char[] a = s.toCharArray();
        Arrays.sort(a);
        return new String(a);
    }
}

// Overuse of streams - don't do this!
public class Anagrams {
  public static void main(String[] args) throws IOException {
    Path dictionary = Paths.get(args[0]);
    int minGroupSize = Integer.parseInt(args[1]);
      try (Stream<String> words = Files.lines(dictionary)) {
        words.collect(
          groupingBy(word -> word.chars().sorted()
                      .collect(StringBuilder::new,
                        (sb, c) -> sb.append((char) c),
                        StringBuilder::append).toString()))
          .values().stream()
            .filter(group -> group.size() >= minGroupSize)
            .map(group -> group.size() + ": " + group)
            .forEach(System.out::println);
        }
    }
}
```

Overusing streams makes programs hard to read and maintain.
```
// Tasteful use of streams enhances clarity and conciseness
public class Anagrams {
   public static void main(String[] args) throws IOException {
      Path dictionary = Paths.get(args[0]);
      int minGroupSize = Integer.parseInt(args[1]);
      try (Stream<String> words = Files.lines(dictionary)) {
         words.collect(groupingBy(word -> alphabetize(word)))
           .values().stream()
           .filter(group -> group.size() >= minGroupSize)
           .forEach(g -> System.out.println(g.size() + ": " + g));
      }
   }
   // alphabetize method is the same as in original version
}
```

In the absence of explicit types, careful naming of lambda parameters is essential to the readability of stream pipelines.

Using helper methods is even more important for readability in stream pipelines than in iterative code because pipelines lack explicit type information and named temporary variables.

Refactor existing code to use streams and use them in new code only where it makes sense to do so.

Stream pipelines express repeated computation using function objects (typically lambdas or method references), while iterative code expresses repeated computation using code blocks.

There are some things you can do from code blocks that you can’t do from function objects:

- From a code block, you can read or modify any local variable in scope; from a lambda, you can only read final or effectively final variables
- From a code block, you can return from the enclosing method, break or continue an enclosing loop, or throw any checked exception that this method is declared to throw; from a lambda you can do none of these things.

Conversely, streams make it very easy to do some things:

Uniformly transform sequences of elements

- Filter sequences of elements
- Combine sequences of elements using a single operation (for example to add them, concatenate them, or compute their minimum)
- Accumulate sequences of elements into a collection, perhaps grouping them by some common attribute
- Search a sequence of elements for an element satisfying some criterion

```java
static Stream<BigInteger> primes() {
    return Stream.iterate(TWO, BigInteger::nextProbablePrime);
}
public static void main(String[] args) {
    primes().map(p -> TWO.pow(p.intValueExact()).subtract(ONE))
        .filter(mersenne -> mersenne.isProbablePrime(50))
        .limit(20)
        .forEach(System.out::println);
}
```

This program starts with the primes, computes the corresponding Mersenne numbers, filters out all but the primes (the magic number 50 controls the probabilistic primality test), limits the resulting stream to twenty elements, and prints them out.
```java
// Iterative Cartesian product computation
private static List<Card> newDeck() {
    List<Card> result = new ArrayList<>();
    for (Suit suit : Suit.values())
        for (Rank rank : Rank.values())
            result.add(new Card(suit, rank));
    return result;
}
// Stream-based Cartesian product computation
private static List<Card> newDeck() {
    return Stream.of(Suit.values())
        .flatMap(suit ->
            Stream.of(Rank.values())
                .map(rank -> new Card(suit, rank)))
        .collect(toList());
}
```

And here is a stream-based implementation that makes use of the intermediate operation flatMap. This operation maps each element in a stream to a stream and then concatenates all of these new streams into a single stream.

If you’re not sure whether a task is better served by streams or iteration, try both and see which works better.

<br/>

> 46: Prefer side-effect-free functions in streams

Streams isn’t just an API, it’s a paradigm based on functional programming. In order to obtain the expressiveness, speed, and in some cases parallelizability that streams have to offer, you have to adopt the paradigm as well as the API.

The most important part of the streams paradigm is to structure your computation as a sequence of transformations where the result of each stage is as close as possible to a pure function of the result of the previous stage.

A pure function is one whose result depends only on its input: it does not depend on any mutable state, nor does it update any state. In order to achieve this, any function objects that you pass into stream operations, both intermediate and terminal, should be free of side-effects.
```
// Uses the streams API but not the paradigm--Don't do this!
Map<String, Long> freq = new HashMap<>();
try (Stream<String> words = new Scanner(file).tokens()) {
    words.forEach(word -> {
        freq.merge(word.toLowerCase(), 1L, Long::sum);
    });
}
```

Simply put, it’s not streams code at all; it’s iterative code masquerading as streams code.

This code is doing all its work in a terminal forEach operation, using a lambda that mutates external state (the frequency table). A forEach operation that does anything more than present the result of the computation performed by a stream is a "bad smell in code," as is a lambda that mutates state.
```
// Proper use of streams to initialize a frequency table
Map<String, Long> freq;
try (Stream<String> words = new Scanner(file).tokens()) {
    freq = words
        .collect(groupingBy(String::toLowerCase, counting()));
}
```
This snippet does the same thing as the previous one but makes proper use of the streams API. It’s shorter and clearer. So why would anyone write it the other way? Because it uses tools they’re already familiar with.

The forEach operation should be used only to report the result of a stream computation, not to perform the computation.

You can ignore the Collector interface and think of a collector as an opaque object that encapsulates a reduction strategy. Reduction means combining the elements of a stream into a single object. The object produced by a collector is typically a collection.

There are three such collectors: toList(), toSet(), and toCollection(collectionFactory). They return, respectively, a set, a list, and a programmer-specified collection type.
```java
// Pipeline to get a top-ten list of words from a frequency table
List<String> topTen = freq.keySet().stream()
    .sorted(comparing(freq::get).reversed())
    .limit(10)
    .collect(toList());
```
It is customary and wise to statically import all members of Collectors because it makes stream pipelines more readable.

The comparing method is a comparator construction method (Item 14) that takes a key extraction function. The function takes a word, and the "extraction" is actually a table lookup: the bound method reference freq::get looks up the word in the frequency table and returns the number of times the word appears in the file.

Finally, we call reversed on the comparator, so we’re sorting the words from most frequent to least frequent.

The simplest map collector is toMap(keyMapper, valueMapper), which takes two functions, one of which maps a stream element to a key, the other, to a value. The more complicated forms of toMap, as well as the groupingBy method, give you various ways to provide strategies for dealing with such collisions.

One way is to provide the toMap method with a merge function in addition to its key and value mappers. The merge function is a BinaryOperator<V>, where V is the value type of the map. Any additional values associated with a key are combined with the existing value using the merge function.
```java
// Collector to generate a map from key to chosen element for key
Map<Artist, Album> topHits = albums.collect(
  // convert the stream of albums to a map, mapping each artist to the album
  // that has the best album by sales
   toMap(Album::artist, a->a, maxBy(comparing(Album::sales))));
```

In addition to the toMap method, the Collectors API provides the groupingBy method, which returns collectors to produce maps that group elements into categories based on a classifier function.

The classifier function takes an element and returns the category into which it falls. This category serves as the element’s map key.

If you want groupingBy to return a collector that produces a map with values other than lists, you can specify a downstream collector in addition to a classifier. A downstream collector produces a value from a stream containing all the elements in a category.

Alternatively, you can pass toCollection(collectionFactory), which lets you create the collections into which each category of elements is placed.

Another simple use of the two-argument form of groupingBy is to pass counting() as the downstream collector. This results in a map that associates each category with the number of elements in the category.
```java
List<String> words = words
        .collect(groupingBy(word -> alphabetize(word)));
Map<String, Long> freq = words
        .collect(groupingBy(String::toLowerCase, counting()));
```

The collectors returned by the counting method are intended only for use as downstream collectors. The same functionality is available directly on Stream, via the count method, so there is never a reason to say collect(counting()).

In summary, the essence of programming stream pipelines is side-effect-free function objects. This applies to all of the many function objects passed to streams and related objects. The terminal operation forEach should only be used to report the result of a computation performed by a stream, not to perform the computation. In order to use streams properly, you have to know about collectors. The most important collector factories are toList, toSet, toMap, groupingBy, and joining.

<br/>

> 47: Prefer COLLECTION to STREAM as a return type

Streams do not make iteration obsolete: writing good code requires combining streams and iteration judiciously.

Stream fails to extend the iterator method. But it is easy to write an adapter method to enable stream iterators.
```java
// Adapter from  Stream<E> to Iterable<E>
public static <E> Iterable<E> iterableOf(Stream<E> stream) {
    return stream::iterator;
}
// Adapter from Iterable<E> to Stream<E>
public static <E> Stream<E> streamOf(Iterable<E> iterable) {
    return StreamSupport.stream(iterable.spliterator(), false);
}
for (ProcessHandle p : iterableOf(ProcessHandle.allProcesses())) {
    // Process the process
}
```
The Collection interface is a subtype of Iterable and has a stream method, so it provides for both iteration and stream access. Therefore, Collection or an appropriate subtype is generally the best return type for a public, sequence-returning method.

Arrays also provide for easy iteration and stream access with the Arrays.asList and Stream.of methods. If the sequence you’re returning is small enough to fit easily in memory, you’re probably best off returning one of the standard collection implementations, such as ArrayList or HashSet. But do not store a large sequence in memory just to return it as a collection.

In summary, when writing a method that returns a sequence of elements, remember that some of your users may want to process them as a stream while others may want to iterate over them. Try to accommodate both groups.

If it’s feasible to return a collection, do so. If you already have the elements in a collection or the number of elements in the sequence is small enough to justify creating a new one, return a standard collection such as ArrayList. Otherwise, consider implementing a custom collection.

<br/>

> 48: Use caution when making STREAMs parallel

Safety and liveness violations are a fact of life in concurrent programming, and parallel stream pipelines are no exception.

Even under the best of circumstances, parallelizing a pipeline is unlikely to increase its performance if the source is from Stream.iterate, or the intermediate operation limit is used.

As a rule, performance gains from parallelism are best on streams over ArrayList, HashMap, HashSet, and ConcurrentHashMap instances; arrays; int ranges; and long ranges.

What these data structures have in common is that they can all be accurately and cheaply split into subranges of any desired sizes, which makes it easy to divide work among parallel threads.

Another important factor that all of these data structures have in common is that they provide good-to-excellent locality of reference when processed sequentially: sequential element references are stored together in memory.

Not only can parallelizing a stream lead to poor performance, including liveness failures; it can lead to incorrect results and unpredictable behavior.

Under the right circumstances, it is possible to achieve near-linear speedup in the number of processor cores simply by adding a parallel call to a stream pipeline.

## Chapter 8. Methods

<br/>

> 49: Check parameters for validity

You should clearly document all restrictions and enforce them with checks at the beginning of the method body.

For public and protected methods, use the Javadoc @throws tag to document the exception that will be thrown if a restriction on parameter values is violated.

The *Objects.requireNonNull* method, added in Java 7, is flexible and convenient, so there’s no reason to perform null checks manually anymore.

In Java 9, a range-checking facility was added to java.util.Objects. This facility consists of three methods: *checkFromIndexSize, checkFromToIndex, and checkIndex*.

Nonpublic methods can check their parameters using assertions, as shown below:
```java
// Private helper function for a recursive sort
private static void sort(long a[], int offset, int length) {
    assert a != null;
    assert offset >= 0 && offset <= a.length;
    assert length >= 0 && length <= a.length - offset;
    ... // Do the computation
}
```

Assertions throw AssertionError if they fail. They have no effect and essentially no cost unless you enable them, which you do by passing the -ea (or -enableassertions) flag to the java command.

<br/>

> 50: Make defensive copies when needed

Even java is a safe language, you must program defensively, with the assumption that clients of your class will do their best to destroy its invariants. i.e. Date is a mutable class. If you implement something using Date that is intended to be immutable, it is still vulnerable.
```java
// Attack the internals of a Period instance
Date start = new Date();
Date end = new Date();
Period p = new Period(start, end);
end.setYear(78);  // Modifies internals of p!
```

As of Java 8, the obvious way to fix this problem is to use Instant (or Local-DateTime or ZonedDateTime) in place of a Date because Instant (and the other java.time classes) are immutable. Date is obsolete and should no longer be used in new code.

It is essential to make a defensive copy of each mutable parameter to the constructor and to use the copies as components of the Period instance in place of the originals:
```java
// Repaired constructor - makes defensive copies of parameters

public Period(Date start, Date end) {
    this.start = new Date(start.getTime());
    this.end   = new Date(end.getTime());
    if (this.start.compareTo(this.end) > 0)
      throw new IllegalArgumentException(
          this.start + " after " + this.end);
}
```

Note that defensive copies are made before checking the validity of the parameters, and the validity check is performed on the copies rather than on the originals.

It protects the class against changes to the parameters from another thread during the window of vulnerability between the time the parameters are checked and the time they are copied. This is known as a *time-of-check/time-of-use or TOCTOU attack*.

Do not use the clone method to make a defensive copy of a parameter whose type is subclassable by untrusted parties.

While the replacement constructor successfully defends against the previous attack, it is still possible to mutate a Period instance, because its accessors offer access to its mutable internals:
```java
// Second attack on the internals of a Period instance
Date start = new Date();
Date end = new Date();
Period p = new Period(start, end);
p.end().setYear(78);  // Modifies internals of p!
```

To defend against the second attack, merely modify the accessors to return defensive copies of mutable internal fields.
```java
// Repaired accessors - make defensive copies of internal fields
public Date start() {
    return new Date(start.getTime());
}
public Date end() {
    return new Date(end.getTime());
}
```

In the accessors, unlike the constructor, it would be permissible to use the clone method to make the defensive copies. This is so because we know that the class of Period’s internal Date objects is java.util.Date, and not some untrusted subclass.

That said, you are generally better off using a constructor or static factory to copy an instance.

Arguably, the real lesson in all of this is that you should, where possible, use immutable objects as components of your objects so that you that don’t have to worry about defensive copying.

In summary, if a class has mutable components that it gets from or returns to its clients, the class must defensively copy these components. If the cost of the copy would be prohibitive and the class trusts its clients not to modify the components inappropriately, then the defensive copy may be replaced by documentation outlining the client’s responsibility not to modify the affected components.

<br/>

> 51: Design method signatures carefully

Choose method names carefully. Choose names that are understandable and consistent with other names in the same package. Avoid long method names.

Don’t go overboard in providing convenience methods. Too many methods make a class difficult to learn, use, document, test, and maintain.

Avoid long parameter lists. Long sequences of identically typed parameters are especially harmful.

Some techniques for shortening overly long parameter lists:

1. break the method up into multiple methods, each of which requires only a subset of the parameters
2. create helper classes to hold groups of parameters, typically static member classes
3. adapt the Builder pattern

For parameter types, favor interfaces over classes. i.e. there is no reason to ever write a method that takes HashMap on input—use Map instead.

Prefer two-element enum types to boolean parameters, unless the meaning of the boolean is clear from the method name. Enums make your code easier to read and to write. Also, they make it easy to add more options later.
```java
public enum TemperatureScale { FAHRENHEIT, CELSIUS }
Thermometer.newInstance(TemperatureScale.CELSIUS)
```

<br/>

> 52: Use overloading judiciously

Because the following classify method is overloaded, and the choice of which overloading to invoke is made at compile time, it prints "Unknown Collection" three times.
```java
// Broken!
public class CollectionClassifier {
    public static String classify(Set<?> s) { return "Set"; }
    public static String classify(List<?> lst) { return "List"; }
    public static String classify(Collection<?> c) { return "Unknown Collection"; }
    public static void main(String[] args) {
        Collection<?>[] collections = {
            new HashSet<String>(),
            new ArrayList<BigInteger>(),
            new HashMap<String, String>().values()
        };
        for (Collection<?> c : collections)
            System.out.println(classify(c));
    }
}
```

For all three iterations of the loop, the compile-time type of the parameter is the same: Collection<?>. The runtime type is different in each iteration, but this does not affect the choice of overloading.

The best way to fix the CollectionClassifier program is to replace all three overloadings of classify with a single method that does explicit *instanceof* tests.

Selection among overloaded methods is static, while selection among overridden methods is dynamic.

A safe, conservative policy is never to export two overloadings with the same number of parameters.

You can always give methods different names instead of overloading them.

Do not overload methods to take different functional interfaces in the same argument position.

<br/>

> 53: Use varargs judiciously

Varargs methods, formally known as variable arity methods, accept zero or more arguments of a specified type.

The varargs facility works by first creating an array whose size is the number of arguments passed at the call site, then putting the argument values into the array, and finally passing the array to the method.
```java
// The WRONG way to use varargs to pass one or more arguments!
static int min(int... args) {
    if (args.length == 0)
        throw new IllegalArgumentException("Too few arguments");
    int min = args[0];
    for (int i = 1; i < args.length; i++)
        if (args[i] < min)
            min = args[i];
    return min;
}
// The right way to use varargs to pass one or more arguments
static int min(int firstArg, int... remainingArgs) {
    int min = firstArg;
    for (int arg : remainingArgs)
        if (arg < min)
            min = arg;
    return min;
}
```

Exercise care when using varargs in performance-critical situations. Every invocation of a varargs method causes an array allocation and initialization.

Suppose you’ve determined that 95 percent of the calls to a method have three or fewer parameters.
```java
public void foo() { }
public void foo(int a1) { }
public void foo(int a1, int a2) { }
public void foo(int a1, int a2, int a3) { }
public void foo(int a1, int a2, int a3, int... rest) { }
```

Like most performance optimizations, this technique usually isn’t appropriate, but when it is, it’s a lifesaver.

In summary, varargs are invaluable when you need to define methods with a variable number of arguments. Precede the varargs parameter with any required parameters, and be aware of the performance consequences of using varargs.

<br/>

> 54:  Return empty COLLECTIONs or ARRAYs, not nulls

In the unlikely event that you have evidence suggesting that allocating empty collections is harming performance, you can avoid the allocations by returning the same immutable empty collection repeatedly, as immutable objects may be shared freely.
```java
//The right way to return a possibly empty collection
public List<Cheese> getCheeses() {
    return new ArrayList<>(cheesesInStock);
}
// Optimization - avoids allocating empty collections
public List<Cheese> getCheeses() {
    return cheesesInStock.isEmpty() ? Collections.emptyList()
        : new ArrayList<>(cheesesInStock);
}
//The right way to return a possibly empty array
public Cheese[] getCheeses() {
    return cheesesInStock.toArray(new Cheese[0]);
}
// Optimization - avoids allocating empty arrays
private static final Cheese[] EMPTY_CHEESE_ARRAY = new Cheese[0];
public Cheese[] getCheeses() {
    return cheesesInStock.toArray(EMPTY_CHEESE_ARRAY);
}
// Don’t do this - preallocating the array harms performance!
return cheesesInStock.toArray(new Cheese[cheesesInStock.size()]);
```

In summary, never return null in place of an empty array or collection. It makes your API more difficult to use and more prone to error, and it has no performance advantages.

<br/>

> 55: Return OPTIONALs judiciously

Prior to Java 8, there were two approaches you could take when writing a method that was unable to return a value under certain circumstances. Either you could throw an exception, or you could return null.

Exceptions should be reserved for exceptional conditions (Item 69), and throwing an exception is expensive because the entire stack trace is captured when an exception is created.

If a method returns null, clients must contain special-case code to deal with the possibility of a null return.

In Java 8, the Optional<T> class represents an immutable container that can hold either a single non-null T reference or nothing at all. An optional that contains nothing is said to be empty. A value is said to be present in an optional that is not empty.

An optional is essentially an immutable collection that can hold at most one element. Optional<T> does not implement Collection<T>, but it could in principle.

A method that conceptually returns a T but may be unable to do so under certain circumstances can instead be declared to return an Optional<T>. This allows the method to return an empty result to indicate that it couldn’t return a valid result. An Optional-returning method is more flexible and easier to use than one that throws an exception, and it is less error-prone than one that returns null.
```java
// Returns maximum value in collection - throws exception if empty
public static <E extends Comparable<E>> E max(Collection<E> c) {
    if (c.isEmpty())
        throw new IllegalArgumentException("Empty collection");
    E result = null;
    for (E e : c)
        if (result == null || e.compareTo(result) > 0)
            result = Objects.requireNonNull(e);
    return result;
}
// Returns maximum value in collection as an Optional<E>
public static <E extends Comparable<E>> Optional<E> max(Collection<E> c) {
    if (c.isEmpty())
        return Optional.empty();
    E result = null;
    for (E e : c)
        if (result == null || e.compareTo(result) > 0)
            result = Objects.requireNonNull(e);
    return Optional.of(result);
}
```

If a method returns an optional, the client gets to choose what action to take if the method can’t return a value. You can specify a default value.
```java
// Using an optional to provide a chosen default value
String lastWordInLexicon = max(words).orElse("No words...");
// Using an optional to throw a chosen exception
Toy myToy = max(toys).orElseThrow(TemperTantrumException::new);
// Using optional when you know there’s a return value
Element lastNobleGas = max(Elements.NOBLE_GASES).get();
```

Occasionally you may be faced with a situation where it’s expensive to get the default value, and you want to avoid that cost unless it’s necessary. For these situations, Optional provides a method that takes a Supplier<T> and invokes it only when necessary.
```java
Optional<ProcessHandle> parentProcess = ph.parent();
System.out.println("Parent PID: " + (parentProcess.isPresent() ?
    String.valueOf(parentProcess.get().pid()) : "N/A"));
// can be replaced by this one, which uses Optional’s map function\
System.out.println("Parent PID: " +
  ph.parent().map(h -> String.valueOf(h.pid())).orElse("N/A"));
```

Container types, including collections, maps, streams, arrays, and optionals should not be wrapped in optionals. Rather than returning an empty Optional<List<T>>, you should simply return an empty List<T>.

As a rule, you should declare a method to return Optional<T> if it might not be able to return a result and clients will have to perform special processing if no result is returned.

You should never return an optional of a boxed primitive type, with the possible exception of the "minor primitive types," Boolean, Byte, Character, Short, and Float. There are OptionalInt, OptionalLong, and OptionalDouble available for use.

It is almost never appropriate to use an optional as a key, value, or element in a collection or array.

In summary, if you find yourself writing a method that can’t always return a value and you believe it is important that users of the method consider this possibility every time they call it, then you should probably return an optional. You should, however, be aware that there are real performance consequences associated with returning optionals; for performance-critical methods, it may be better to return a null or throw an exception. Finally, you should rarely use an optional in any other capacity than as a return value.

<br/>

> 56: Write doc comments for all exposed API elements

Javadoc generates API documentation automatically from source code with specially formatted documentation comments, more commonly known as doc comments.

To document your API properly, you must precede every exported class, interface, constructor, method, and field declaration with a doc comment.

The doc comment for a method should describe succinctly the contract between the method and its client. The contract should say what the method does rather than how it does its job. The doc comment should enumerate all of the method’s preconditions.

Methods should document any side effects. A side effect is an observable change in the state of the system that is not obviously required in order to achieve the postcondition. i.e. if a method starts new threads, it should be documented.

To describe a method’s contract fully, the doc comment should have an @param tag for every parameter, an @return tag unless the method has a void return type, and an @throws tag for every exception thrown by the method.

- By convention, the text following an @param tag or @return tag should be a noun phrase describing the value represented by the parameter or return value.
- The text following an @throws tag should consist of the word "if," followed by a clause describing the conditions under which the exception is thrown.

```java
/**
 * Returns the element at the specified position in this list.
 *
 * <p>This method is <i>not</i> guaranteed to run in constant
 * time. In some implementations it may run in time proportional
 * to the element position.
 *
 * @param  index index of element to return; must be
 *         non-negative and less than the size of this list
 * @return the element at the specified position in this list
 * @throws IndexOutOfBoundsException if the index is out of range
 *         ({@code index < 0 || index >= this.size()})
 */
E get(int index);
```
The Javadoc utility translates doc comments into HTML, and arbitrary HTML elements in doc comments end up in the resulting HTML document.

The Javadoc {@code} tag causes the code fragment to be rendered in code font, and it suppresses processing of HTML markup and nested Javadoc tags in the code fragment. {@literal} tag has similar effect.

When you design a class for inheritance, you must document its self-use patterns, so programmers know the semantics of overriding its methods. Should be documented using the @implSpec tag.

As of Java 9, the Javadoc utility still ignores the @implSpec tag unless you pass the command line switch -tag "implSpec:a:Implementation Requirements:".

Doc comments should be readable both in the source code and in the generated documentation.

To avoid confusion, no two members or constructors in a class or interface should have the same summary description.

Be careful if the intended summary description contains a period, because the period can prematurely terminate the description.

In Java 9, a client-side index was added to the HTML generated by Javadoc. This index, which eases the task of navigating large API documentation sets, takes the form of a search box in the upper-right corner of the page. API elements, such as classes, methods, and fields, are indexed automatically. To add index, use {@index} tag:
```
* This method complies with the {@index IEEE 754} standard.
```

Generics, enums, and annotations require special care in doc comments.

- When documenting a generic type or method, be sure to document all type parameters
- When documenting an enum type, be sure to document the constants as well as the type and any public methods
- When documenting an annotation type, be sure to document any members as well as the type itself.
```java
/**
 * (omitted)
 * @param <K> the type of keys maintained by this map
 * @param <V> the type of mapped values
 */
public interface Map<K, V> { ... }
/**
 * An instrument section of a symphony orchestra.
 */
public enum OrchestraSection {
    /** Woodwinds, such as flute, clarinet, and oboe. */
    WOODWIND,
    /** Brass instruments, such as french horn and trumpet. */
    BRASS,
    /** Percussion instruments, such as timpani and cymbals. */
    PERCUSSION,
    /** Stringed instruments, such as violin and cello. */
    STRING;
}
/**
 * Indicates that the annotated method is a test method that
 * must throw the designated exception to pass.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
     /**
      * The exception that the annotated test method must throw
      * in order to pass. (The test is permitted to throw any
      * subtype of the type described by this class object.)
      */
    Class<? extends Throwable> value();
}
```

Package-level doc comments should be placed in a file named package-info.java and it must contain a package declaration and may contain annotations on this declaration.

Similarly, if you elect to use the module system, module-level comments should be placed in the module-info.java file.

Whether or not a class or static method is thread-safe, you should document its thread-safety level. If a class is serializable, you should document its serialized form.

To summarize, documentation comments are the best, most effective way to document your API. Their use should be considered mandatory for all exported API elements. Adopt a consistent style that adheres to standard conventions. Remember that arbitrary HTML is permissible in documentation comments and that HTML metacharacters must be escaped.

## Chapter 9. General Programming

<br/>

> 57: Minimize the scope of local variables

The most powerful technique for minimizing the scope of a local variable is to declare it where it is first used.

Nearly every local variable declaration should contain an initializer.

A final technique to minimize the scope of local variables is to keep methods small and focused. If you combine two activities in the same method, local variables relevant to one activity may be in the scope of the code performing the other activity.

<br/>

> 58: Prefer for-each loops to traditional for loops

Unfortunately, there are three common situations where you can’t use for-each:
-  Destructive filtering—If you need to traverse a collection removing selected elements, then you need to use an explicit iterator so that you can call its remove method.
    - You can often avoid explicit traversal by using Collection’s removeIf method, added in Java 8.
-  Transforming—If you need to traverse a list or array and replace some or all of the values of its elements, then you need the list iterator or array index in order to replace the value of an element.
- Parallel iteration—If you need to traverse multiple collections in parallel, then you need explicit control over the iterator or index variable so that all iterators or index variables can be advanced in lockstep.

In summary, the for-each loop provides compelling advantages over the traditional for loop in clarity, flexibility, and bug prevention, with no performance penalty. Use for-each loops in preference to for loops wherever you can.

<br/>

> 59: Know and use the libraries

By using a standard library, you take advantage of the knowledge of the experts who wrote it and the experience of those who used it before you.

> As of Java 7, you should no longer use Random. For most uses, the random number generator of choice is now ThreadLocalRandom. It produces higher quality random numbers, and it’s very fast.

A second advantage of using the libraries is that you don’t have to waste your time writing ad hoc solutions to problems that are only marginally related to your work.

A third advantage of using standard libraries is that their performance tends to improve over time, with no effort on your part.

A fourth advantage of using libraries is that they tend to gain functionality over time.

A final advantage of using the standard libraries is that you place your code in the mainstream. Such code is more easily readable, maintainable, and reusable by the multitude of developers.

Numerous features are added to the libraries in every major release, and it pays to keep abreast of these additions.

Each time there is a major release of the Java platform, a web page is published describing its new features. These pages are well worth reading.

The libraries are too big to study all the documentation, but every programmer should be familiar with the basics of java.lang, java.util, and java.io, and their subpackages.

If you can’t find what you need in Java platform libraries, your next choice should be to look in high-quality third-party libraries, such as Google’s excellent, open source Guava library

To summarize, don’t reinvent the wheel. If you need to do something that seems like it should be reasonably common, there may already be a facility in the libraries that does what you want. If there is, use it; if you don’t know, check.

<br/>

> 60: Avoid float and double if exact answers are required

The float and double types are designed primarily for scientific and engineering calculations.

They do not, however, provide exact results and should not be used where exact results are required.

The float and double types are particularly ill-suited for monetary calculations because it is impossible to represent 0.1 (or any other negative power of ten) as a float or double exactly.

The right way to solve this problem is to use BigDecimal, int, or long for monetary calculations. There are, however, two disadvantages to using BigDecimal: it’s a lot less convenient than using a primitive arithmetic type, and it’s a lot slower.

<br/>

> 61: Prefer primitive types to boxed primitives

There are three major differences between primitives and boxed primitives.

1. primitives have only their values, whereas boxed primitives have identities distinct from their values.
2. primitive types have only fully functional values, whereas each boxed primitive type has one nonfunctional value, which is null.
3. primitives are more time- and space-efficient than boxed primitives.

Applying the == operator to boxed primitives is almost always wrong.

In practice, if you need a comparator to describe a type’s natural order, you should simply call Comparator.naturalOrder(), and if you write a comparator yourself, you should use the comparator construction methods, or the static compare methods on primitive types.

In nearly every case when you mix primitives and boxed primitives in an operation, the boxed primitive is auto-unboxed.

In summary, use primitives in preference to boxed primitives whenever you have the choice. Primitive types are simpler and faster. Autoboxing reduces the verbosity, but not the danger, of using boxed primitives.

When your program compares two boxed primitives with the == operator, it does an identity comparison, which is almost certainly not what you want. When your program does mixed-type computations involving boxed and unboxed primitives, it does unboxing, and when your program does unboxing, it can throw a NullPointerException. Finally, when your program boxes primitive values, it can result in costly and unnecessary object creations.

<br/>

> 62: Avoid STRINGs where other types are more appropriate

Strings are poor substitutes for other value types.

When a piece of data comes into a program from a file, from the network, or from keyboard input, it is often in string form. If there’s an appropriate value type, whether primitive or object reference, you should use it; if there isn’t, you should write one.

Strings are poor substitutes for enum types.

Strings are poor substitutes for aggregate types. If an entity has multiple components, it is usually a bad idea to represent it as a single string.

Strings are poor substitutes for capabilities.

To summarize, avoid the natural tendency to represent objects as strings when better data types exist or can be written. Used inappropriately, strings are more cumbersome, less flexible, slower, and more error-prone than other types. Types for which strings are commonly misused include primitive types, enums, and aggregate types.

<br/>

> 63: Beware the performance of STRING concatenation

The string concatenation operator (+) is a convenient way to combine a few strings into one.

It is fine for generating a single line of output or constructing the string representation of a small, fixed-size object, but it does not scale. Using the string concatenation operator repeatedly to concatenate n strings requires time quadratic in n.

Strings are immutable. When two strings are concatenated, the contents of both are copied.

To achieve acceptable performance, use a StringBuilder in place of a String.

<br/>

> 64: Refer to objects by their interfaces

If appropriate interface types exist, then parameters, return values, variables, and fields should all be declared using interface types. It will make your program much more flexible. The only time you really need to refer to an object’s class is when you’re creating it with a constructor.
```java
// Good - uses interface as type
Set<Son> sonSet = new LinkedHashSet<>();
// Bad - uses class as type!
LinkedHashSet<Son> sonSet = new LinkedHashSet<>();
```

If you decide that you want to switch implementations, all you have to do is change the class name in the constructor (or use a different static factory).

It is entirely appropriate to refer to an object by a class rather than an interface if no appropriate interface exists.

- Value classes are rarely written with multiple implementations in mind.
- Objects belonging to a framework whose fundamental types are classes rather than interfaces.
- Classes that implement an interface but also provide extra methods not found in the interface.

If there is no appropriate interface, just use the least specific class in the class hierarchy that provides the required functionality.

<br/>

> 65: Prefer interfaces to reflection

The core reflection facility, java.lang.reflect, offers programmatic access to arbitrary classes.

Given a Class object, you can obtain Constructor, Method, and Field instances representing the constructors, methods, and fields of the class represented by the Class instance. These objects provide programmatic access to the class’s member names, field types, method signatures, and so on.

Moreover, Constructor, Method, and Field instances let you manipulate their underlying counterparts reflectively: you can construct instances, invoke methods, and access fields of the underlying class by invoking methods on the Constructor, Method, and Field instances.

Reflection allows one class to use another, even if the latter class did not exist when the former was compiled. This power, however, comes at a price:

- You lose all the benefits of compile-time type checking, including exception checking.
- The code required to perform reflective access is clumsy and verbose.
- Performance suffers.

You can obtain many of the benefits of reflection while incurring few of its costs by using it only in a very limited form.

For many programs that must use a class that is unavailable at compile time, there exists at compile time an appropriate interface or superclass by which to refer to the class. If this is the case, you can create instances reflectively and access them normally via their interface or superclass.

i.e. here is a program that creates a Set<String> instance whose class is specified by the first command line argument. The program inserts the remaining command line arguments into the set and prints it.
```java
// Reflective instantiation with interface access
public static void main(String[] args) {
    // Translate the class name into a Class object
    Class<? extends Set<String>> cl = null;
    try {
        cl = (Class<? extends Set<String>>)  // Unchecked cast!
                Class.forName(args[0]);
    } catch (ClassNotFoundException e) {
        fatalError("Class not found.");
    }
    // Get the constructor
    Constructor<? extends Set<String>> cons = null;
    try {
        cons = cl.getDeclaredConstructor();
    } catch (NoSuchMethodException e) {
        fatalError("No parameterless constructor");
    }
    // Instantiate the set
    Set<String> s = null;
    try {
        s = cons.newInstance();
    } catch (IllegalAccessException e) {
        fatalError("Constructor not accessible");
    } catch (InstantiationException e) {
        fatalError("Class not instantiable.");
    } catch (InvocationTargetException e) {
        fatalError("Constructor threw " + e.getCause());
    } catch (ClassCastException e) {
        fatalError("Class doesn't implement Set");
    }
    // Exercise the set
    s.addAll(Arrays.asList(args).subList(1, args.length));
    System.out.println(s);
}
private static void fatalError(String msg) {
    System.err.println(msg);
    System.exit(1);
}
```

Usually, this technique is all that you need in the way of reflection.

This example demonstrates two disadvantages of reflection: the example can generate six different exceptions at runtime, all of which would have been compile-time errors if reflective instantiation were not used; it takes twenty-five lines of tedious code to generate an instance of the class from its name, whereas a constructor invocation would fit neatly on a single line.

If you are writing a program that has to work with classes unknown at compile time, you should, if at all possible, use reflection only to instantiate objects, and access the objects using some interface or superclass that is known at compile time.

<br/>

> 66: Use native methods judiciously

The Java Native Interface (JNI) allows Java programs to call native methods, which are methods written in native programming languages such as C or C++.

Historically, native methods have had three main uses. They provide access to platform-specific facilities such as registries. They provide access to existing libraries of native code, including legacy libraries that provide access to legacy data. Finally, native methods are used to write performance-critical parts of applications in native languages for improved performance.

It is legitimate to use native methods to access platform-specific facilities, but it is seldom necessary; it is also legitimate to use native methods to use native libraries when no equivalent libraries are available in Java.

It is rarely advisable to use native methods for improved performance.

The use of native methods has serious disadvantages. Because native languages are not safe, applications using native methods are no longer immune to memory corruption errors. Native languages are more platform-dependent than Java, programs using native methods are less portable. They are harder to debug too.

<br/>

> 67: Optimize judiciously

There are three aphorisms concerning optimization that everyone should know:

> More computing sins are committed in the name of efficiency (without necessarily achieving it) than for any other single reason—including blind stupidity.
> —William A. Wulf

> We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil.
> —Donald E. Knuth

> We follow two rules in the matter of optimization:
> Rule 1. Don’t do it.
> Rule 2 (for experts only). Don’t do it yet—that is, not until you have a perfectly clear and unoptimized solution.
> Rule 3 (added by us). Measure performance before and after each attempted optimization.
> —M. A. Jackson

It is easy to do more harm than good, especially if you optimize prematurely. In the process, you may produce software that is neither fast nor correct and cannot easily be fixed.

Strive to write good programs rather than fast ones. If a good program is not fast enough, its architecture will allow it to be optimized.

Good programs embody the principle of information hiding: where possible, they localize design decisions within individual components, so individual decisions can be changed without affecting the remainder of the system. Therefore you must think about performance during the design process.

Strive to avoid design decisions that limit performance.

Consider the performance consequences of your API design decisions.

Luckily, it is generally the case that good API design is consistent with good performance. It is a very bad idea to warp an API to achieve good performance.

The performance issue that caused you to warp the API may go away in a future release of the platform or other underlying software, but the warped API and the support headaches that come with it will be with you forever.

Common wisdom says that programs spend 90 percent of their time in 10 percent of their code.

Profiling tools can help you decide where to focus your optimization efforts. These tools give you runtime information, such as roughly how much time each method is consuming and how many times it is invoked. In addition to focusing your tuning efforts, this can alert you to the need for algorithmic changes.

The more code in the system, the more important it is to use a profiler.

The need to measure the effects of attempted optimization is even greater in Java than in more traditional languages such as C and C++, because Java has a weaker performance model: The relative cost of the various primitive operations is less well defined.

To summarize, do not strive to write fast programs—strive to write good ones; speed will follow. But do think about performance while you’re designing systems, especially while you’re designing APIs, wire-level protocols, and persistent data formats. When you’ve finished building the system, measure its performance.

<br/>

> 68: Adhere to generally accepted naming conventions

Loosely speaking, naming conventions fall into two categories: typographical and grammatical. Details can be found in the *The Java Language Specification*.

**Typographical**

Package and module names should be hierarchical with the components separated by periods.

- Components should consist of lowercase alphabetic characters and, rarely, digits.
- The name of any package that will be used outside your organization should begin with your organization’s Internet domain name with the components reversed
- The remainder of a package name should consist of one or more components describing the package.
- Components should be short, generally eight or fewer characters. Meaningful abbreviations are encouraged.
- Components should generally consist of a single word or abbreviation.

Class and interface names, including enum and annotation type names, should consist of one or more words, with the first letter of each word capitalized.

Method and field names follow the same typographical conventions as class and interface names, except that the first letter of a method or field name should be lowercase.

Constant fields names should consist of one or more uppercase words separated by the underscore character. Constant fields constitute the only recommended use of underscores.

Local variable names have similar typographical naming conventions to member names, except that abbreviations are permitted, as are individual characters and short sequences of characters whose meaning depends on the context in which they occur.

Input parameters are a special kind of local variable. They should be named much more carefully than ordinary local variables, as their names are an integral part of their method’s documentation.

Type parameter names usually consist of a single letter. Most commonly it is one of these five: T for an arbitrary type, E for the element type of a collection, K and V for the key and value types of a map, and X for an exception. The return type of a function is usually R. A sequence of arbitrary types can be T, U, V or T1, T2, T3.

**Grammatical**

There are no grammatical naming conventions to speak of for packages.

Instantiable classes, including enum types, are generally named with a singular noun or noun phrase, such as Thread, PriorityQueue, or ChessPiece.

Non-instantiable utility classes are often named with a plural noun, such as Collectors or Collections.

Interfaces are named like classes, for example, Collection or Comparator, or with an adjective ending in able or ible, for example, Runnable, Iterable, or Accessible.

Annotation types have so many uses, no part of speech predominates.

Methods that perform some action are generally named with a verb or verb phrase (including object), for example, append or drawImage.

Methods that return a boolean value usually have names that begin with the word is or, less commonly, has, followed by a noun, noun phrase, or any word or phrase that functions as an adjective, for example, isDigit.

Methods that return a non-boolean function or attribute of the object on which they’re invoked are usually named with a noun, a noun phrase, or a verb phrase beginning with the verb get, for example, size, hashCode, or getTime.

Instance methods that convert the type of an object, returning an independent object of a different type, are often called toType, for example, toString or toArray.

Methods that return a view whose type differs from that of the receiving object are often called asType, for example, asList.

Methods that return a primitive with the same value as the object on which they’re invoked are often called typeValue, for example, intValue.

Common names for static factories include from, of, valueOf, instance, getInstance, newInstance, getType, and newType.

To summarize, internalize the standard naming conventions and learn to use them as second nature. The typographical conventions are straightforward and largely unambiguous; the grammatical conventions are more complex and looser. Use common sense.

## Chapter 10. Exceptions

<br/>

> 69: Use EXCEPTIONs only for exceptional conditions

When used to best advantage, exceptions can improve a program’s readability, reliability, and maintainability. When used improperly, they can have the opposite effect.

Exceptions are to be used only for exceptional conditions; they should never be used for ordinary control flow.

A well-designed API must not force its clients to use exceptions for ordinary control flow.

<br/>

> 70: Use checked exceptions for recoverable conditions and runtime exceptions for programming errors

Java provides three kinds of throwables: checked exceptions, runtime exceptions, and errors.

Use checked exceptions for conditions from which the caller can reasonably be expected to recover.

- By throwing a checked exception, you force the caller to handle the exception in a catch clause or to propagate it outward.
- Each checked exception declared to throw indicates to the user that it is a possible outcome.

There are two kinds of unchecked throwables: runtime exceptions and errors. They both are throwables that needn’t, and generally shouldn’t, be caught.

If a program throws an unchecked exception or an error, it is generally the case that recovery is impossible and continued execution would do more harm than good.

Use runtime exceptions to indicate programming errors. The great majority of runtime exceptions indicate precondition violations.

A precondition violation is simply a failure by the client of an API to adhere to the contract established by the API specification. i.e. the contract for array access specifies that the array index must be between zero and the array length minus one, inclusive. ArrayIndexOutOfBoundsException indicates that this precondition was violated.

If you believe a condition is likely to allow for recovery, use a checked exception; if not, use a runtime exception. If it isn’t clear whether recovery is possible, you’re probably better off using an unchecked exception.

All of the unchecked throwables you implement should subclass RuntimeException all of the unchecked throwables you implement should subclass RuntimeException. Not only shouldn’t you define Error subclasses, but with the exception of AssertionError, you shouldn’t throw them either.

To summarize, throw checked exceptions for recoverable conditions and unchecked exceptions for programming errors. When in doubt, throw unchecked exceptions. Don’t define any throwables that are neither checked exceptions nor runtime exceptions. Provide methods on your checked exceptions to aid in recovery.

<br/>

> 71: Avoid unnecessary use of checked exceptions

Used properly, they can improve APIs and programs. Unlike return codes and unchecked exceptions, checked exceptions force programmers to deal with problems, enhancing reliability.

That said, overuse of checked exceptions in APIs can make them far less pleasant to use.

This burden on the user may be justified if the exceptional condition cannot be prevented by proper use of the API and the programmer using the API can take some useful action once confronted with the exception. Unless both of these conditions are met, an unchecked exception is appropriate.

The easiest way to eliminate a checked exception is to return an optional of the desired result type. Instead of throwing a checked exception, the method simply returns an empty optional. The disadvantage of this technique is that the method can’t return any additional information detailing its inability to perform the desired computation.

<br/>

> 72: Favor the use of standard exceptions

The Java libraries provide a set of exceptions that covers most of the exception-throwing needs of most APIs.

Reusing standard exceptions makes your API easier to learn and use because it matches the established conventions that programmers are already familiar with. Programs using your API are easier to read because they aren’t cluttered with unfamiliar exceptions. Fewer exception classes means a smaller memory footprint and less time spent loading classes.

IllegalArgumentException is generally thrown when the caller passes in an argument whose value is inappropriate.

IllegalStateException is generally thrown if the invocation is illegal because of the state of the receiving object.

NullPointerException should be thrown rather than IllegalArgumentException if a null value is passed to a method where an instance is expected. Similarly, if a caller passes an out-of-range value in a parameter representing an index into a sequence, IndexOutOfBoundsException should be thrown rather than IllegalArgumentException.

ConcurrentModificationException should be thrown if an object that was designed for use by a single thread (or with external synchronization) detects that it is being modified concurrently.

UnsupportedOperationException should be thrown if an object does not support an attempted operation. This exception is used by classes that fail to implement one or more optional operations defined by an interface they implement.

Do not reuse Exception, RuntimeException, Throwable, or Error directly. Treat these classes as if they were abstract.

If an exception fits your needs, go ahead and use it, but only if the conditions under which you would throw it are consistent with the exception’s documentation: reuse must be based on documented semantics, not just on name.

Also, feel free to subclass a standard exception if you want to add more detail, but remember that exceptions are serializable. That alone is reason not to write your own exception class without good reason.

<br/>

> 73: Throw exceptions appropriate to the abstraction

Higher layers should catch lower-level exceptions and, in their place, throw exceptions that can be explained in terms of the higher-level abstraction.
```java
// Exception Translation
try {
    ... // Use lower-level abstraction to do our bidding
} catch (LowerLevelException e) {
    throw new HigherLevelException(...);
}
// Exception Chaining
try {
    ... // Use lower-level abstraction to do our bidding
} catch (LowerLevelException cause) {
    throw new HigherLevelException(cause);
}
```

While exception translation is superior to mindless propagation of exceptions from lower layers, it should not be overused.

Where possible, the best way to deal with exceptions from lower layers is to avoid them, by ensuring that lower-level methods succeed. Sometimes you can do this by checking the validity of the higher-level method’s parameters before passing them on to lower layers.

In summary, if it isn’t feasible to prevent or to handle exceptions from lower layers, use exception translation, unless the lower-level method happens to guarantee that all of its exceptions are appropriate to the higher level. Chaining provides the best of both worlds: it allows you to throw an appropriate higher-level exception, while capturing the underlying cause for failure analysis.

<br/>

> 74: Document all exceptions thrown by each method

Always declare checked exceptions individually, and document precisely the conditions under which each one is thrown using the Javadoc @throws tag.

Don’t take the shortcut of declaring that a method throws some superclass of multiple exception classes that it can throw. As an extreme example, don’t declare that a public method throws Exception or, worse, throws Throwable.

It is particularly important that methods in interfaces document the unchecked exceptions they may throw. This documentation forms a part of the interface’s general contract and enables common behavior among multiple implementations of the interface.

Use the Javadoc @throws tag to document each exception that a method can throw, but do not use the throws keyword on unchecked exceptions.

If an exception is thrown by many methods in a class for the same reason, you can document the exception in the class’s documentation comment rather than documenting it individually for each method.

<br/>

> 75: Include failure-capture information in detail messages

To capture a failure, the detail message of an exception should contain the values of all parameters and fields that contributed to the exception.

Do not include passwords, encryption keys, and the like in detail messages.

One way to ensure that exceptions contain adequate failure-capture information in their detail messages is to require this information in their constructors instead of a string detail message. The detail message can then be generated automatically to include the information.

<br/>

> 76: Strive for failure atomicity

Generally speaking, a failed method invocation should leave the object in the state that it was in prior to the invocation. A method with this property is said to be failure-atomic.

There are several ways to achieve this effect. The simplest is to design immutable objects. If an object is immutable, failure atomicity is free.

For methods that operate on mutable objects, the most common way to achieve failure atomicity is to check parameters for validity before performing the operation.  This causes most exceptions to get thrown before object modification commences.
```java
public Object pop() {
    if (size == 0)
        throw new EmptyStackException();
    Object result = elements[--size];
    elements[size] = null; // Eliminate obsolete reference
    return result;
}
```

A third approach to achieving failure atomicity is to perform the operation on a temporary copy of the object and to replace the contents of the object with the temporary copy once the operation is complete.

A last and far less common approach to achieving failure atomicity is to write recovery code that intercepts a failure that occurs in the midst of an operation, and causes the object to roll back its state to the point before the operation began.

In summary, as a rule, any generated exception that is part of a method’s specification should leave the object in the same state it was in prior to the method invocation. Where this rule is violated, the API documentation should clearly indicate what state the object will be left in.

<br/>

> 77: Don’t ignore exceptions

An empty catch block defeats the purpose of exceptions, which is to force you to handle exceptional conditions.

If you choose to ignore an exception, the catch block should contain a comment explaining why it is appropriate to do so, and the variable should be named ignored.

The advice in this item applies equally to checked and unchecked exceptions. Whether an exception represents a predictable exceptional condition or a programming error, ignoring it with an empty catch block will result in a program that continues silently in the face of error.

Properly handling an exception can avert failure entirely. Merely letting an exception propagate outward can at least cause the program to fail swiftly, preserving information to aid in debugging the failure.

## Chapter 11. Concurrency

## Synchronize access to shared mutable data

The *synchronized* keyword ensures that only a single thread can execute a method or block at one time.

Many programmers think of synchronization solely as a means of mutual exclusion, to prevent an object from being seen in an inconsistent state by one thread while it’s being modified by another.

In this view, an object is created in a consistent state and locked by the methods that access it. These methods observe the state and optionally cause a state transition, transforming the object from one consistent state to another.

Not only does synchronization prevent threads from observing an object in an inconsistent state, but it ensures that each thread entering a synchronized method or block sees the effects of all previous modifications that were guarded by the same lock.

The language specification guarantees that reading or writing a variable is atomic unless the variable is of type long or double.

Synchronization is required for reliable communication between threads as well as for mutual exclusion.

The consequences of failing to synchronize access to shared mutable data can be dire even if the data is atomically readable and writable.
```java
// Broken! - How long would you expect this program to run?
public class StopThread {
    private static boolean stopRequested;
    public static void main(String[] args)
            throws InterruptedException {
        Thread backgroundThread = new Thread(() -> {
            int i = 0;
            while (!stopRequested) // ends up running forever
                i++;
        });
        backgroundThread.start();
        TimeUnit.SECONDS.sleep(1);
        stopRequested = true;
    }
}
```

The problem is that in the absence of synchronization, there is no guarantee as to when, if ever, the background thread will see the change in the value of stopRequested made by the main thread.
```java
    // added methods to make it work
    private static synchronized void requestStop() {
        stopRequested = true;
    }
    private static synchronized boolean stopRequested() {
        return stopRequested;
    }
```

Synchronization is not guaranteed to work unless both read and write operations are synchronized.

The above solution works, but the locking in the second version of StopThread can be omitted if stopRequested is declared *volatile*. While the volatile modifier performs no mutual exclusion, it guarantees that any thread that reads the field will see the most recently written value.
```java
// Cooperative thread termination with a volatile field
public class StopThread {
    private static volatile boolean stopRequested;
    public static void main(String[] args)
            throws InterruptedException {
        Thread backgroundThread = new Thread(() -> {
            int i = 0;
            while (!stopRequested)
                i++;
        });
        backgroundThread.start();
        TimeUnit.SECONDS.sleep(1);
        stopRequested = true;
    }
}
```

However you need to be careful when using *volatile*.
```java
// Broken - requires synchronization!
private static volatile int nextSerialNumber = 0;
public static int generateSerialNumber() {
    return nextSerialNumber++;
}
```

The method’s state consists of a single atomically accessible field, nextSerialNumber, and all possible values of this field are legal. Therefore, no synchronization is necessary to protect its invariants. Still, the method won’t work properly without synchronization.

The problem is that the increment operator (++) is not atomic. It performs two operations on the nextSerialNumber field: first it reads the value, and then it writes back a new value.

If a second thread reads the field between the time a thread reads the old value and writes back a new one, the second thread will see the same value as the first and return the same serial number. This is a safety failure: the program computes the wrong results.

One way to fix generateSerialNumber is to add the synchronized modifier to its declaration and remove the volatile modifier from nextSerialNumber.
Finally, the best solution is to use existing package:
```java
// Lock-free synchronization with java.util.concurrent.atomic
private static final AtomicLong nextSerialNum = new AtomicLong();
public static long generateSerialNumber() {
    return nextSerialNum.getAndIncrement();
}
```

It is acceptable for one thread to modify a data object for a while and then to share it with other threads, synchronizing only the act of sharing the object reference. Other threads can then read the object without further synchronization, so long as it isn’t modified again. Such objects are said to be effectively immutable. Transferring such an object reference from one thread to others is called safe publication.

There are many ways to safely publish an object reference: you can store it in a static field as part of class initialization; you can store it in a volatile field, a final field, or a field that is accessed with normal locking; or you can put it into a concurrent collection.

In summary, when multiple threads share mutable data, each thread that reads or writes the data must perform synchronization. If you need only inter-thread communication, and not mutual exclusion, the volatile modifier is an acceptable form of synchronization, but it can be tricky to use correctly.

<br/>

> 79: Avoid excessive synchronization

Excessive synchronization can cause reduced performance, deadlock, or even nondeterministic behavior.

To avoid liveness and safety failures, never cede control to the client within a synchronized method or block. In other words, inside a synchronized region, do not invoke a method that is designed to be overridden, or one provided by a client in the form of a function object.
```java
// Broken - invokes alien method from synchronized block!
public class ObservableSet<E> extends ForwardingSet<E> {
    public ObservableSet(Set<E> set) { super(set); }
    private final List<SetObserver<E>> observers
            = new ArrayList<>();
    public void addObserver(SetObserver<E> observer) {
        synchronized(observers) {
            observers.add(observer);
        }
    }
    public boolean removeObserver(SetObserver<E> observer) {
        synchronized(observers) {
            return observers.remove(observer);
        }
    }
    private void notifyElementAdded(E element) {
        synchronized(observers) {
            for (SetObserver<E> observer : observers)
                observer.added(this, element);
        }
    }
    @Override public boolean add(E element) {
        boolean added = super.add(element);
        if (added)
            notifyElementAdded(element);
        return added;
    }
    @Override public boolean addAll(Collection<? extends E> c) {
        boolean result = false;
        for (E element : c)
            result |= add(element);  // Calls notifyElementAdded
        return result;
    }
}
// runs and prints 0-99
public static void main(String[] args) {
    ObservableSet<Integer> set =
            new ObservableSet<>(new HashSet<>());
    set.addObserver((s, e) -> System.out.println(e));
    for (int i = 0; i < 100; i++)
        set.add(i);
}
```

Observers subscribe to notifications by invoking the addObserver method and unsubscribe by invoking the removeObserver method. In both cases, an instance of this callback interface is passed to the method.
```java
// structurally identical to BiConsumer<ObservableSet<E>,E>
@FunctionalInterface public interface SetObserver<E> {
    // Invoked when an element is added to the observable set
    void added(ObservableSet<E> set, E element);
}
```

Now if we make some changes to addObserver

```java
set.addObserver(new SetObserver<>() {
    public void added(ObservableSet<Integer> s, Integer e) {
        System.out.println(e);
        if (e == 23)
            s.removeObserver(this);
    }
});
```

It throws ConcurrentModificationException after it prints 0-23. We are trying to remove an element from a list in the midst of iterating over it, which is illegal.
```java
// Observer that uses a background thread needlessly
set.addObserver(new SetObserver<>() {
   public void added(ObservableSet<Integer> s, Integer e) {
      System.out.println(e);
      if (e == 23) {
         ExecutorService exec =
               Executors.newSingleThreadExecutor();
         try {
            exec.submit(() -> s.removeObserver(this)).get();
         } catch (ExecutionException | InterruptedException ex) {
            throw new AssertionError(ex);
         } finally {
            exec.shutdown();
         }
      }
   }
});
```

When we run this program now, we don’t get an exception; we get a deadlock. The background thread calls s.removeObserver, which attempts to lock observers, but it can’t acquire the lock, because the main thread already has the lock. All the while, the main thread is waiting for the background thread to finish removing the observer.
```java
// Alien method moved outside of synchronized block - open calls
private void notifyElementAdded(E element) {
    List<SetObserver<E>> snapshot = null;
    synchronized(observers) {
        snapshot = new ArrayList<>(observers);
    }
    for (SetObserver<E> observer : snapshot)
        observer.added(this, element);
}
```

We can fix above two issues by taking a "snapshot" of the observers list that can then be safely traversed without a lock. With this change, both of the previous examples run without exception or deadlock.

There is also a better way to move the alien method invocations out of the synchronized block.

The libraries provide a concurrent collection known as CopyOnWriteArrayList that is tailor-made for this purpose. This List implementation is a variant of ArrayList in which all modification operations are implemented by making a fresh copy of the entire underlying array.

Because the internal array is never modified, iteration requires no locking and is very fast. For most uses, the performance of CopyOnWriteArrayList would be atrocious, but it’s perfect for observer lists, which are rarely modified and often traversed.
```java
// Thread-safe observable set with CopyOnWriteArrayList
private final List<SetObserver<E>> observers =
        new CopyOnWriteArrayList<>();
public void addObserver(SetObserver<E> observer) {
    observers.add(observer);
}
public boolean removeObserver(SetObserver<E> observer) {
    return observers.remove(observer);
}
private void notifyElementAdded(E element) {
    for (SetObserver<E> observer : observers)
        observer.added(this, element);
}
```

An alien method invoked outside of a synchronized region is known as an open call. Besides preventing failures, open calls can greatly increase concurrency.

An alien method might run for an arbitrarily long period. If the alien method were invoked from a synchronized region, other threads would be denied access to the protected resource unnecessarily.

As a rule, you should do as little work as possible inside synchronized regions. Obtain the lock, examine the shared data, transform it as necessary, and drop the lock. If you must perform some time-consuming activity, find a way to move it out of the synchronized region.

In a multicore world, the real cost of excessive synchronization is not the CPU time spent getting locks; it is contention: the lost opportunities for parallelism and the delays imposed by the need to ensure that every core has a consistent view of memory. Another hidden cost of oversynchronization is that it can limit the VM’s ability to optimize code execution.

If you are writing a mutable class, you have two options: you can omit all synchronization and allow the client to synchronize externally if concurrent use is desired, or you can synchronize internally, making the class thread-safe.
- You should choose the latter option only if you can achieve significantly higher concurrency with internal synchronization than you could by having the client lock the entire object externally.
- The collections in java.util (with the exception of the obsolete Vector and Hashtable) take the former approach, while those in java.util.concurrent take the latter.
- When in doubt, do not synchronize your class, but document that it is not thread-safe.
- If you do synchronize your class internally, you can use various techniques to achieve high concurrency, such as lock splitting, lock striping, and nonblocking concurrency control.

If a method modifies a static field and there is any possibility that the method will be called from multiple threads, you must synchronize access to the field internally. The field is essentially a global variable even if it is private because it can be read and modified by unrelated clients. The nextSerialNumber field used by the method generateSerialNumber exemplifies this situation.

In summary, to avoid deadlock and data corruption, never call an alien method from within a synchronized region. More generally, keep the amount of work that you do from within synchronized regions to a minimum. When you are designing a mutable class, think about whether it should do its own synchronization. In the multicore era, it is more important than ever not to oversynchronize. Synchronize your class internally only if there is a good reason to do so, and document your decision clearly.

<br/>

> 80: Prefer executors, tasks, and streams to threads

The Java Executor Framework in java.util.concurrent  is a flexible interface-based task execution facility.
```java
ExecutorService exec = Executors.newSingleThreadExecutor(); // create
exec.execute(runnable); // submit work
exec.shutdown(); // terminate gracefully
```

You can do many more things with an executor service.

- wait for a particular task to complete (with the get method)
- wait for any or all of a collection of tasks to complete (using the invokeAny or invokeAll methods)
- wait for the executor service to terminate (using the awaitTermination method)
- retrieve the results of tasks one by one as they complete (using an ExecutorCompletionService)
- schedule tasks to run at a particular time or to run periodically (using a ScheduledThreadPoolExecutor)
- create a thread pool with a fixed or variable number of threads
- use the ThreadPoolExecutor class directly to configure nearly every aspect of a thread pool’s operation.

A cached thread pool is not a good choice for a heavily loaded production server. Submitted tasks are not queued but immediately handed off to a thread for execution. If no threads are available, a new one is created. If a server is so heavily loaded that all of its CPUs are fully utilized and more tasks arrive, more threads will be created, which will only make matters worse.

In the executor framework, the unit of work and the execution mechanism are separate. The key abstraction is the unit of work, which is the task. There are two kinds of tasks: Runnable and Callable (which is like Runnable, except that it returns a value and can throw arbitrary exceptions).

In Java 7, the Executor Framework was extended to support fork-join tasks, which are run by a special kind of executor service known as a fork-join pool. A fork-join task, represented by a ForkJoinTask instance, may be split up into smaller subtasks, and the threads comprising a ForkJoinPool not only process these tasks but "steal" tasks from one another to ensure that all threads remain busy, resulting in higher CPU utilization, higher throughput, and lower latency.

Writing and tuning fork-join tasks is tricky. Parallel streams are written atop fork join pools and allow you to take advantage of their performance benefits with little effort, assuming they are appropriate for the task at hand.

<br/>

> 81: Prefer concurrency utilities to wait and notify

Given the difficulty of using wait and notify correctly, you should use the higher-level concurrency utilities instead.

The higher-level utilities in java.util.concurrent fall into three categories: the Executor Framework; concurrent collections; and synchronizers.

The concurrent collections are high-performance concurrent implementations of standard collection interfaces such as List, Queue, and Map, which managing their own synchronization internally. It is impossible to exclude concurrent activity from a concurrent collection; locking it will only slow the program.

Because you can’t exclude concurrent activity on concurrent collections, you can’t atomically compose method invocations on them either. Therefore, concurrent collection interfaces were outfitted with state-dependent modify operations, which combine several primitives into a single atomic operation.
```java
// Concurrent canonicalizing map atop ConcurrentMap - not optimal
private static final ConcurrentMap<String, String> map =
        new ConcurrentHashMap<>();
public static String intern(String s) {
    String previousValue = map.putIfAbsent(s, s);
    return previousValue == null ? s : previousValue;
}
```

ConcurrentHashMap is optimized for retrieval operations, such as get. Therefore, it is worth invoking get initially and calling putIfAbsent only if get indicates that it is necessary.
```java
// Concurrent canonicalizing map atop ConcurrentMap - faster!
public static String intern(String s) {
    String result = map.get(s);
    if (result == null) {
        result = map.putIfAbsent(s, s);
        if (result == null)
            result = s;
    }
    return result;
}
```

Concurrent collections make synchronized collections largely obsolete. For example, use ConcurrentHashMap in preference to Collections.synchronizedMap. Simply replacing synchronized maps with concurrent maps can dramatically increase the performance of concurrent applications.

Synchronizers are objects that enable threads to wait for one another, allowing them to coordinate their activities. The most commonly used synchronizers are CountDownLatch and Semaphore. Less commonly used are CyclicBarrier and Exchanger. The most powerful synchronizer is Phaser.

Countdown latches are single-use barriers that allow one or more threads to wait for one or more other threads to do something. The sole constructor for CountDownLatch takes an int that is the number of times the countDown method must be invoked on the latch before all waiting threads are allowed to proceed.
```java
// Simple framework for timing concurrent execution
public static long time(Executor executor, int concurrency,
            Runnable action) throws InterruptedException {
    CountDownLatch ready = new CountDownLatch(concurrency);
    CountDownLatch start = new CountDownLatch(1);
    CountDownLatch done  = new CountDownLatch(concurrency);
    for (int i = 0; i < concurrency; i++) {
        executor.execute(() -> {
            ready.countDown(); // Tell timer we're ready
            try {
                start.await(); // Wait till peers are ready
                action.run();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                done.countDown();  // Tell timer we're done
            }
        });
    }
    ready.await();     // Wait for all workers to be ready
    long startNanos = System.nanoTime();
    start.countDown(); // And they're off!
    done.await();      // Wait for all workers to finish
    return System.nanoTime() - startNanos;
}
```

The first, ready, is used by worker threads to tell the timer thread when they’re ready. The worker threads then wait on the second latch, which is start.

When the last worker thread invokes ready.countDown, the timer thread records the start time and invokes start.countDown, allowing all of the worker threads to proceed.

Then the timer thread waits on the third latch, done, until the last of the worker threads finishes running the action and calls done.countDown. As soon as this happens, the timer thread awakens and records the end time.

A few more details bear noting.

- The executor passed to the time method must allow for the creation of at least as many threads as the given concurrency level, or the test will never complete. This is known as a thread starvation deadlock.
- For interval timing, always use System.nanoTime rather than System.currentTimeMillis. System.nanoTime is both more accurate and more precise and is unaffected by adjustments to the system’s real-time clock.
- Note that the code in this example won’t yield accurate timings unless action does a fair amount of work.
- Accurate microbenchmarking is notoriously hard and is best done with the aid of a specialized framework such as jmh
- the three countdown latches in the previous example could be replaced by a single CyclicBarrier or Phaser instance. The resulting code would be a bit more concise but perhaps more difficult to understand.

In summary, using wait and notify directly is like programming in "concurrency assembly language," as compared to the higher-level language provided by java.util.concurrent. There is seldom, if ever, a reason to use wait and notify in new code. If you maintain code that uses wait and notify, make sure that it always invokes wait from within a while loop using the standard idiom. The notifyAll method should generally be used in preference to notify. If notify is used, great care must be taken to ensure liveness.

<br/>

> 82: Document thread safety

The presence of the synchronized modifier in a method declaration is an implementation detail, not a part of its API. It does not reliably indicate that a method is thread-safe.

To enable safe concurrent use, a class must clearly document what level of thread safety it supports:

- Immutable—Instances of this class appear constant. No external synchronization is necessary.
- Unconditionally thread-safe—Instances of this class are mutable, but the class has sufficient internal synchronization that its instances can be used concurrently without the need for any external synchronization.
- Conditionally thread-safe—Like unconditionally thread-safe, except that some methods require external synchronization for safe concurrent use.
- Not thread-safe—Instances of this class are mutable. To use them concurrently, clients must surround each method invocation (or invocation sequence) with external synchronization of the clients’ choosing.
- Thread-hostile—This class is unsafe for concurrent use even if every method invocation is surrounded by external synchronization.

Thread hostility usually results from modifying static data without synchronization. When a class or method is found to be thread-hostile, it is typically fixed or deprecated.

There are some thread safety annotations in Java Concurrency in Practice, which are @Immutable, @ThreadSafe, and @NotThreadSafe.

Documenting a conditionally thread-safe class requires care. You must indicate which invocation sequences require external synchronization, and which lock (or in rare cases, locks) must be acquired to execute these sequences.

The description of a class’s thread safety generally belongs in the class’s doc comment, but methods with special thread safety properties should describe these properties in their own documentation comments.

Lock fields should always be declared final. This is true whether you use an ordinary monitor lock (as shown above) or a lock from the java.util.concurrent.locks package.

<br/>

> 83: Use lazy initialization judiciously

Lazy initialization is the act of delaying the initialization of a field until its value is needed. If the value is never needed, the field is never initialized. This technique is applicable to both static and instance fields. While lazy initialization is primarily an optimization, it can also be used to break harmful circularities in class and instance initialization.

The best advice for lazy initialization is "don’t do it unless you need to" because it decreases the cost of initializing a class or creating an instance, at the expense of increasing the cost of accessing the lazily initialized field.

Under most circumstances, normal initialization is preferable to lazy initialization.

If you use lazy initialization to break an initialization circularity, use a synchronized accessor because it is the simplest, clearest alternative.
```java
// Lazy initialization of instance field - synchronized accessor
private FieldType field;
private synchronized FieldType getField() {
    if (field == null)
        field = computeFieldValue();
    return field;
}
```

If you need to use lazy initialization for performance on a static field, use the lazy initialization holder class idiom. This idiom exploits the guarantee that a class will not be initialized until it is used.
```java
// Lazy initialization holder class idiom for static fields
private static class FieldHolder {
    static final FieldType field = computeFieldValue();
}
private static FieldType getField() { return FieldHolder.field; }
```

The beauty of this idiom is that the getField method is not synchronized and performs only a field access, so lazy initialization adds practically nothing to the cost of access. A typical VM will synchronize field access only to initialize the class.
If you need to use lazy initialization for performance on an instance field, use the double-check idiom.
```java
// Double-check idiom for lazy initialization of instance fields
// needs volatile because there is no locking once the field is initialized
private volatile FieldType field;
private FieldType getField() {
    // this local variable declaration is to ensure that field is read only
    // once in the common case where it’s already initialized
    // thus increases performance
    FieldType result = field;
    if (result == null) {  // First check (no locking)
        synchronized(this) {
            if (field == null)  // Second check (with locking)
                field = result = computeFieldValue();
        }
    }
    return result;
}
```

In summary, you should initialize most fields normally, not lazily. If you must initialize a field lazily in order to achieve your performance goals or to break a harmful initialization circularity, then use the appropriate lazy initialization technique. For instance fields, it is the double-check idiom; for static fields, the lazy initialization holder class idiom. For instance fields that can tolerate repeated initialization, you may also consider the single-check idiom.

<br/>

> 84: Don’t depend on the thread scheduler

Any program that relies on the thread scheduler for correctness or performance is likely to be nonportable.

The best way to write a robust, responsive, portable program is to ensure that the average number of runnable threads is not significantly greater than the number of processors.

This leaves the thread scheduler with little choice: it simply runs the runnable threads till they’re no longer runnable. The program’s behavior doesn’t vary too much, even under radically different thread-scheduling policies.

Note that the number of runnable threads isn’t the same as the total number of threads, which can be much higher. Threads that are waiting are not runnable.

The main technique for keeping the number of runnable threads low is to have each thread do some useful work, and then wait for more. Threads should not run if they aren’t doing useful work.

Threads should not busy-wait, repeatedly checking a shared object waiting for its state to change.
```java
// Awful CountDownLatch implementation - busy-waits incessantly!
public class SlowCountDownLatch {
    private int count;
    public SlowCountDownLatch(int count) {
        if (count < 0)
            throw new IllegalArgumentException(count + " < 0");
        this.count = count;
    }
    public void await() {
        while (true) {
            synchronized(this) {
                if (count == 0)
                    return;
            }
        }
    }
    public synchronized void countDown() {
        if (count != 0)
            count--;
    }
}
```

When faced with a program that barely works because some threads aren’t getting enough CPU time relative to others, resist the temptation to "fix" the program by putting in calls to Thread.yield.

A better course of action is to restructure the application to reduce the number of concurrently runnable threads.

Thread priorities are among the least portable features of Java. It is not unreasonable to tune the responsiveness of an application by tweaking a few thread priorities, but it is rarely necessary and is not portable.

In summary, do not depend on the thread scheduler for the correctness of your program. The resulting program will be neither robust nor portable. As a corollary, do not rely on Thread.yield or thread priorities. These facilities are merely hints to the scheduler. Thread priorities may be used sparingly to improve the quality of service of an already working program, but they should never be used to "fix" a program that barely works.

## Chapter 12. Serialization

<br/>

> 85: Prefer alternatives to Java serialization

> Java deserialization is a clear and present danger as it is widely used both directly by applications and indirectly by Java subsystems such as RMI (Remote Method Invocation), JMX (Java Management Extension), and JMS (Java Messaging System). Deserialization of untrusted streams can result in remote code execution (RCE), denial-of-service (DoS), and a range of other exploits. Applications can be vulnerable to these attacks even if they did nothing wrong.
> -- Robert Seacord

You open yourself up to attack whenever you deserialize a byte stream that you don’t trust. The best way to avoid serialization exploits is never to deserialize anything.

<br/>

> 86: Implement Serializable with great caution

A major cost of implementing Serializable is that it decreases the flexibility to change a class’s implementation once it has been released.

When a class implements Serializable, its byte-stream encoding (or serialized form) becomes part of its exported API. Once you distribute a class widely, you are generally required to support the serialized form forever, just as you are required to support all other parts of the exported API.

A second cost of implementing Serializable is that it increases the likelihood of bugs and security holes. Serialization is an extralinguistic mechanism for creating objects. Relying on the default deserialization mechanism can easily leave objects open to invariant corruption and illegal access.

A third cost of implementing Serializable is that it increases the testing burden associated with releasing a new version of a class. You must ensure both that the serialization-deserialization process succeeds and that it results in a faithful replica of the original object.

Classes representing active entities, such as thread pools, should rarely implement Serializable.

Classes designed for inheritance should rarely implement Serializable, and interfaces should rarely extend it.

Inner classes should not implement Serializable.

<br/>

> 87: Consider using a custom serialized form

Do not accept the default serialized form without first considering whether it is appropriate.

The default serialized form is likely to be appropriate if an object’s physical representation is identical to its logical content.

Even if you decide that the default serialized form is appropriate, you often must provide a readObject method to ensure invariants and security.

Using the default serialized form when an object’s physical representation differs substantially from its logical data content has four disadvantages:

- It permanently ties the exported API to the current internal representation.
- It can consume excessive space.
- It can consume excessive time.
- It can cause stack overflows.

Whether or not you use the default serialized form, you must impose any synchronization on object serialization that you would impose on any other method that reads the entire state of the object.

Regardless of what serialized form you choose, declare an explicit serial version UID in every serializable class you write.

Do not change the serial version UID unless you want to break compatibility with all existing serialized instances of a class.

<br/>

> 88: Write readObject methods defensively

Just as a constructor must check its arguments for validity and make defensive copies of parameters where appropriate, so must a readObject method.

Loosely speaking, readObject is a constructor that takes a byte stream as its sole parameter. In normal use, the byte stream is generated by serializing a normally constructed instance.  The problem arises when readObject is presented with a byte stream that is artificially constructed to generate an object that violates the invariants of its class.

To summarize, anytime you write a readObject method, adopt the mind-set that you are writing a public constructor that must produce a valid instance regardless of what byte stream it is given. Do not assume that the byte stream represents an actual serialized instance.

<br/>

> 89: For instance control, prefer enum types to readResolve

To summarize, use enum types to enforce instance control invariants wherever possible. If this is not possible and you need a class to be both serializable and instance-controlled, you must provide a readResolve method and ensure that all of the class’s instance fields are either primitive or transient.

<br/>

> 90: Consider serialization proxies instead of serialized instances

The serialization proxy pattern is reasonably straightforward. First, design a private static nested class that concisely represents the logical state of an instance of the enclosing class.

It should have a single constructor, whose parameter type is the enclosing class. This constructor merely copies the data from its argument: it need not do any consistency checking or defensive copying.

By design, the default serialized form of the serialization proxy is the perfect serialized form of the enclosing class. Both the enclosing class and its serialization proxy must be declared to implement Serializable.
```java
// Serialization proxy for Period class
private static class SerializationProxy implements Serializable {
    private final Date start;
    private final Date end;
    SerializationProxy(Period p) {
        this.start = p.start;
        this.end = p.end;
    }
    private static final long serialVersionUID =
        234098243823485285L; // Any number will do (Item  87)
}
```

Next, add the following writeReplace method to the enclosing class. This method can be copied verbatim into any class with a serialization proxy:
```java
// writeReplace method for the serialization proxy pattern
private Object writeReplace() {
    return new SerializationProxy(this);
}
```

The presence of this method on the enclosing class causes the serialization system to emit a SerializationProxy instance instead of an instance of the enclosing class.

With this writeReplace method in place, the serialization system will never generate a serialized instance of the enclosing class, but an attacker might fabricate one in an attempt to violate the class’s invariants. To guarantee that such an attack would fail, merely add this readObject method to the enclosing class:
```java
// readObject method for the serialization proxy pattern
private void readObject(ObjectInputStream stream)
        throws InvalidObjectException {
    throw new InvalidObjectException("Proxy required");
}
```

Finally, provide a readResolve method on the SerializationProxy class that returns a logically equivalent instance of the enclosing class. The presence of this method causes the serialization system to translate the serialization proxy back into an instance of the enclosing class upon deserialization.
```java
// readResolve method for Period.SerializationProxy
private Object readResolve() {
    return new Period(start, end);    // Uses public constructor
}
```

In summary, consider the serialization proxy pattern whenever you find yourself having to write a readObject or writeObject method on a class that is not extendable by its clients. This pattern is perhaps the easiest way to robustly serialize objects with nontrivial invariants.
