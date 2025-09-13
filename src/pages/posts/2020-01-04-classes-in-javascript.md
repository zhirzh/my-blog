---
layout: '@/layouts/Post.astro'
title: Classes in JavaScript, then and now
date: 2020-01-04
---

Looking at how JavaScript's classes has changed over the years — and how TypeScript layers on its own twists.

## Constructors and prototypes

The earliest versions of JavaScript didn't have classes. If we wanted to model data as _values-and-behaviors_ like in any other OOP language, we would create [**constructor functions**](https://javascript.info/constructor-new) for creating the object with the assigned values and add behaviors to the constructor's **prototype** that would serve as the "blueprint" for the model.

```js
function Human(name, age) {
  this.name = name

  if (age) {
    this.age = age
  }
}

Human.prototype.age = 0 // default value

Human.prototype.speak = function () {
  console.log(`Human: ${this.name} | ${this.age}`)
}

const me = new Human('Shirsh Zibbu')
me.speak()
//> Human: Shirsh Zibbu | 0
```

![](/media/2020-01-04-classes-in-javascript-then-and-now/constructor.png)

The next we wanted was [**classical inheritance**](https://crockford.com/javascript/inheritance.html) and it was achieved by simply creating an instance of baseclass and connecting it with the subclass constructor &amp;prototype.

```js
function Person(name, age, address) {
  // call parent constructor
  Human.call(this, name, age)

  this.address = address
}

// enable lookup delegation to `Human.prototype`
Person.prototype = new Human()

// fix `instanceof` operator
Person.prototype.constructor = Person

// method override
Person.prototype.speak = function () {
  // call parent method
  Human.prototype.speak.call(this)

  console.log(`Person: ${this.address}`)
}

// new method
Person.prototype.greet = function () {
  console.log('hello world')
}

const me = new Person('Shirsh Zibbu', 25, 'India')
me.speak()
//> Human: Shirsh Zibbu | 25
//> Person: India
```

![](/media/2020-01-04-classes-in-javascript-then-and-now/prototypal%20inheritance.png)

This works perfectly except for a few cases where the baseclass constructors need arguments to create an instance and might not work otherwise.

This problem was fixed when `Object.create()` was introduced. Instead of creating a new instance of the baseclass, we can now create a dummy object that delegates to baseclass-prototype and use it as the prototype for our subclass.

```js
...

// enable lookup delegation to `Human.prototype`
Person.prototype = Object.create(Human.prototype)

...
```

![](/media/2020-01-04-classes-in-javascript-then-and-now/prototype.png)

There is yet another way to set up the prototype for the subclass by using `Object.setPrototypeOf()` but it is not as popular. We don't need to create a baseclass instance or even a dummy object to enable lookup delegation.

We can just set the `[[Prototype]]` of subclass-protype to baseclass-protype.

```js
...

// enable lookup delegation to `Human.prototype`
Object.setProtypeOf(Person.prototype, Human.prototype)

...
```

## A slight detour from OOP

It is not necessary to create constructors and prototypes to model data in a more OOP like fashion. The idea here is to create a single blueprint object that holds default values and all the methods for a "model" and create a simple function that builds new "model instances" (simple objects that delegate to the blueprint).

```js
function Human(name, age) {
  // compatibility with `new` operator usage
  if (new.target) {
    return Human(name, age)
  }

  const extensions = { name }
  if (age) {
    extensions.age = age
  }

  return Object.assign(Object.create(__Human__), extensions)
}

// blueprint for "Human"
const __Human__ = {
  age: 0,
  speak() {
    console.log(`Human: ${this.name} | ${this.age}`)
  },
}

function Person(name, age, address) {
  // compatibility with `new` operator usage
  if (new.target) {
    return Person(name, age, address)
  }

  return Object.assign(Object.create(__Person__), new Human(name, age), {
    address,
  })
}

// blueprint for "Person" class
const __Person__ = Object.assign(
  // enable lookup delegation to `Human.prototype`
  Object.create(__Human__),
  {
    speak() {
      __Human__.speak.call(this)
      console.log(`Person: ${this.address}`)
    },
  },
)

const me = Person('Shirsh Zibbu', 25, 'India')
me.speak()
//> Human: Shirsh Zibbu | 25
//> Person: India
```

This style of modeling relies only on native JavaScript constructs - objects, functions, and prototype delegation. Too bad it never caught up.

![](/media/2020-01-04-classes-in-javascript-then-and-now/functional%20inheritance.png)

There was some movement towards this unorthodox pattern but it never became popular. Instead, we got the new ES6 class syntax.

## ES6 class syntax

The class syntax is the defacto way to work in OOP languages. It was only a matter of time that JavaScript received the same.

```js
class Human {
  age = 0 // default value but NOT on prototype

  constructor(name, age) {
    this.name = name

    if (age) {
      this.age = age
    }
  }

  speak() {
    console.log(`Human: ${this.name} | ${this.age}`)
  }
}

class Person extends Human {
  constructor(name, age, address) {
    super(name, age)

    // can't use `this` before calling `super()`
    this.address = address
  }

  speak() {
    // call parent method
    super.speak()

    console.log(`Person: ${this.address}`)
  }

  greet() {
    console.log('hello world')
  }
}

const me = new Person('Shirsh Zibbu', 25, 'India')
me.speak()
//> Human: Shirsh Zibbu | 25
//> Person: India
```

It is important to know that all of this is just syntactic sugar on the existing system with a few differences:

- Class properties (like `age`) are assigned directly on the instance and not on its `[[Prototype]]`
- `CLASS.prototype` cannot be re-assigned, re-defined or deleted
- A subclass inherits static members of its baseclass

```js
function Human(name, age) {
  this.age = 0 // default value but NOT on prototype

  this.name = name

  if (age) {
    this.age = age
  }
}

Human.prototype.speak = function () {
  console.log(`Human: ${this.name} | ${this.age}`)
}

// lock prototype
Object.defineProperty(Human, 'prototype', {
  value: Human.prototype,
  writable: false,
  enumerable: false,
  configurable: false,
})

function Person(name, age, address) {
  Human.call(this, name, age, address)

  // can't use `this` before calling `super()`
  this.address = address
}

// enable lookup delegation to `Human.prototype`
Person.prototype = Object.create(Human.prototype)

// fix `instanceof` operator
Person.prototype.constructor = Person

// method override
Person.prototype.speak = function () {
  // call parent method
  Human.prototype.speak.call(this)

  console.log(`Person: ${this.address}`)
}

Person.prototype.greet = function () {
  console.log('hello world')
}

Object.defineProperty(Person, 'prototype', {
  value: Person.prototype,
  writable: false,
  enumerable: false,
  configurable: false,
})

Object.setPrototypeOf(Person, Human) // static inheritance
```

![](/media/2020-01-04-classes-in-javascript-then-and-now/class%20prototype.png)

## Static analysis

Since TypeScript is a static extension of JavaScript, it doesn't modify or remove any existing runtime behaviors but adds a few which are *compile-time* - types, interfaces, generics, abstract classes, and more.

One major difference in how interfaces work in TypeScript compared to Java is that **interfaces describe the structure of an instance, not a class**. That is why interfaces in TypeScript can't have static members.

> **TypeScript interfaces describe the structure of an** instance**, not a class**

When we create a class in TypeScript, we also get an implicit interface that describes the shape of an instance of that class (and any other object if we use it as a declaration type or as a cast/assertion).

```ts
interface Animal { ... }

class Human implements Animal { ... }

// equivalent to
class Human implements Human, Animal { ... }
```

![](/media/2020-01-04-classes-in-javascript-then-and-now/interface.png)

### Implements extras

In cases of inheritance, the **implicit interface** of the subclass will also extend the **combined interface** of the base class.

```ts
interface Animal { ... }

class Human implements Animal { ... }

class Person extends Human { ... }

// equivalent to
class Human implements Human, Animal { ... }

class Person extends Person, Human { ... }
```

![](/media/2020-01-04-classes-in-javascript-then-and-now/implements.png)

### Static types for classes

Even though I said that _interfaces describe the structure of an object and not a class_, we can still enforce static members on a class if we want to. But it won't be pretty.

We need to define our `Person` class using class expressions rather than declaring it. This allows us to use the `Developer` interface to describe the shape of the class itself. However, class expressions don't get a "free" implicit interface. And to _add insult to injury_, we can't directly instantiate our `Person` class because the interface describing its shape (i.e., `Developer`) doesn't contain a **construct signature**.

After fixing all these issues, here's what we get:

```ts
interface Developer {
  new (name: string, age: number, address: string): Person

  langs: string[]
}

class Human {
  name: string

  age = 0

  constructor(name: string, age: number) {
    this.name = name

    if (age) {
      this.age = age
    }
  }

  speak() {
    console.log(`Human: ${this.name} | ${this.age}`)
  }
}

interface Person extends Human {
  address: string
}

const Person: Developer = class extends Human implements Person {
  static langs = ['JavaScript', 'TypeScript']

  address: string

  constructor(name: string, age: number, address: string) {
    super(name, age)

    this.address = address
  }

  speak() {
    console.log(`Person: ${this.address}`)

    super.speak()
  }
}

const me = new Person('Shirsh Zibbu', 25, 'India')
me.speak()
me.address
//> Person: India
//> Human: Shirsh Zibbu | 25
```

You can check everything works on [here TypeScript playground](https://www.typescriptlang.org/play/?ssl=1&ssc=1&pln=2&pc=22#code/JYOwLgpgTgZghgYwgAgCIQG4QDYHsAO0yA3gFDIXIgQDuyAFCHALYQBcyAzmFKAOYAaZHD7sqAV2YAjaELgATeVAidOHbrxB8AlBwAK0TrhABuUuUrY4WtVx78A2gF0zAX3MIrq5AAlJ1kgsKJlZ1ey0zIOFRZABeZAAGSMpkBGMNcQQwXChGFjENfjlRDhBJGShtQJSUsAALYE4AOhCUeNazGspgGAYRCCqyLq76xqb+uOiITuH3FPcozkI4AGt6QaiUtJAjbAgmvD56AAM-ZmsOABJiUebW12QAH2Rr2-HRV2PtGYp3BdBILBECgDFAjCBkBAAB6QEDyTi+fwQoaUBRKFS2QoRUgLbbcZCg8EcdBYPCEKCTTxwbzQ2HwxHnCHAZj4PascAIwnGaqUbhwMDABDIKw2SYOADkACk4Bg4ABlBC8fBgcVCcUAFQAnoQFUqVU5zCk0cpVGFNHxkpQ8TxMtlcq0zUUpqVyrJhIoTZjwjoeV1OOJyXlWMUBj8am9jRjJpHVGGFiklhBVutfTU8bg9gdcEdjlyQFcbg1mjHOJ9vpteQHoE1E8ny-McR50mBkKxJtQ6Hn6OK5Q0wXVkAAtYBSKTiVXIABMAFY1QBJOHAODi7SkVg15ZrVfrkukAD0e4AfATDMYOAv5Ev90eGRdkL3gP2hyOx08p9PSEA).

## Bonus

Here's a _not-so-simple_ setup for you to admire that uses everything listed in this article and a few more things. The code for this setup is [**here**](https://www.typescriptlang.org/play/#code/JYOwLgpgTgZghgYwgAgBrIN7IB4C5lwgCeyAvgFDlhEAOKAmsgLybJECM+hJpyAZKyIAmfOyEBmMpUqhIsRCgAKmcsjXIQEAO4AKAJT4AgqvU1OBYuQrlZ0eEmTKsNERZ4zwdhcgCKAHgAVAD4VdQ1tHQA6aLgoAHMAZy5iA2QAkzUAR2SiK2kbT3kHQ2QIbEgQABMEtFD1OHxNADdoPPIEAHsQBLBkQ3xlFgQAGzgEmuAAWxphiEmIcBqSjAzkHrgwYARkM2ZkMXFV9c3tlz2AcgALCGHhjuQtDqhhyvPKMLw3d-q9gFcqiAwUAQSoEGrNVrWDxyewoABCpXKC2qfQANMhGCswgAjfD-ADWIA6WhAbU63V6cPw-jhISGo3GiIqKJKUxmcwWYBqCKx6mOW2QmT2IF+t2+ag4e3gwwSEFWwgAhKIJOLkLiNL9JtjoHsAAxtSjknoEYXaPr6SiGSJmchWlyUOCRbDkR1wfJG3rY01aZBwi3kOGRTKUbFO8ihjjhyLCEORN2h7HkIA) ✌

![](/media/2020-01-04-classes-in-javascript-then-and-now/everything.png)
