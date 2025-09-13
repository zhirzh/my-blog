---
layout: '@/layouts/Post.astro'
title: FizzBuzz test using RxJS
date: 2020-01-01
---

What is this **FizzBuzz** test?

> Write a program that prints the numbers from 1 to 100. But for multiples of three print "**Fizz**" instead of the number and for the multiples of five print "**Buzz**". For numbers which are multiples of both three and five print "**FizzBuzz**".
>
> - [wiki.c2.com](http://wiki.c2.com/?FizzBuzzTest)

The problem itself isn't very hard and can be solved with a simple loop iterating over numbers 1 through 100 that prints values matching one of the conditions. The only obvious gotcha is to check for "_multiples of both three and five_" after checking for multiples of either one.

```js
for (let i = 1; i <= 100; i++) {
  if (i % 3 === 0 && i % 5 === 0) console.log('FizzBuzz')
  else if (i % 3 === 0) console.log('Fizz')
  else if (i % 5 === 0) console.log('Buzz')
  else console.log(i)
}

//> 1 2 Fizz 4 Buzz Fizz 7 8 ... 13 14 FizzBuzz 16 17 ...
```

## FizzBuzz test using RxJS

One obvious solution using RxJS is to convert the loop into an observable and map over it. You can try this [**here**](https://rxviz.com/v/QJVnvZvJ).

```js
const { range } = Rx
const { map } = RxOperators

range(1, 100).pipe(
  map((i) => {
    if (i % 3 === 0 && i % 5 === 0) console.log('FizzBuzz')
    else if (i % 3 === 0) console.log('Fizz')
    else if (i % 5 === 0) console.log('Buzz')
    else console.log(i)
  }),
)

//> 1 2 Fizz 4 Buzz Fizz 7 8 ... 13 14 FizzBuzz 16 17 ...
```

But there's another way to do this. Let's consider the output values as a single stream.

```
Output$ : 1 2 F 4 B F 7 8 ... 13 14 FB 16 17 ...
```

We can split this stream into 4 different streams, each emitting a single kind of value.

```
Output$   : 1 2 F 4 B F 7 8 F B  ... 13 14 FB 16 17 ...

Number$   : 1 2 3 4 5 6 7 8 9 10 ... 13 14 15 16 17 ...
Fizz$     : _ _ F _ _ F _ _ F __ ... __ __ F  __ __ ...
Buzz$     : _ _ _ _ B _ _ _ _ B  ... __ __ B  __ __ ...
FizzBuzz$ : _ _ _ _ _ _ _ _ _ __ ... __ __ FB __ __ ...
```

The `Fizz$` stream emits values once every 3 terms and the `Buzz$` stream emits once every 5 terms. Naturally, `FizzBuzz$` stream emits once every 15 terms. We can now zip together these streams and pick values in decreasing precedence:

- `FizzBuzz$`
- `Fizz$` or `Buzz$`
- `Number$`

You can try this [**here**](https://rxviz.com/v/7JXEv6z8).

```js
const { range } = Rx
const { map, tap, zip } = RxOperators

const Number$ = range(1, 100)

const Fizz$ = Number$.pipe(map((i) => (i % 3 === 0 ? 'Fizz' : null)))

const Buzz$ = Number$.pipe(map((i) => (i % 5 === 0 ? 'Buzz' : null)))

const FizzBuzz$ = Fizz$.pipe(
  zip(Buzz$),
  map(([f, b]) => (f === null || b === null ? null : 'FizzBuzz')),
)

const Output$ = FizzBuzz$.pipe(
  zip(Buzz$, Fizz$, Number$),
  map((xs) => xs.find((x) => x !== null)),
)

Output$.pipe(tap(console.log))

//> 1 2 Fizz 4 Buzz Fizz 7 8 ... 13 14 FizzBuzz 16 17 ...
```

## Simple is better than complex

This was rather intense for such a simple problem. Can we do better?

If we look at `Fizz$` and `Buzz$` streams, we can see that they emit a repeating set of values and really don't depend on `Number$` stream. So let's write them that way.

```js
const { from } = Rx

const Fizz$ = from([null, null, 'fizz']).pipe(repeat())
const Buzz$ = from([null, null, null, null, 'buzz']).pipe(repeat())
```

We can also eliminate the `FizzBuzz$` stream since it is just a combination of the `Fizz$` and `Buzz$` streams and instead construct the "FizzBuzz" values inside a `map()` operator. Then we repeat the final step from the previous setup and get our `Output$` stream.

```js
const { from, range } = Rx
const { map, repeat, tap, zip } = RxOperators

const Number$ = range(1, 100)

const Fizz$ = from([null, null, 'fizz']).pipe(repeat())
const Buzz$ = from([null, null, null, null, 'buzz']).pipe(repeat())

const Output$ = Fizz$.pipe(
  zip(Buzz$),
  map((fb) => fb.join('')), // construct "FizzBuzz"
  zip(Number$),
  map((xs) => xs.find((x) => !!x)),
)

Output$.pipe(tap(console.log))

//> 1 2 Fizz 4 Buzz Fizz 7 8 ... 13 14 FizzBuzz 16 17 ...
```

You can try this [**here**](https://rxviz.com/v/2ORzve2O).
