---
layout: '@/layouts/Post.astro'
title: The Redux Type Flow (revisited in 2018)
date: 2018-03-03
---

Type safety in [redux](https://hackernoon.com/tagged/redux) code has 3 components:

- Actions
- Action creators
- [Reducer](https://hackernoon.com/tagged/reducer)

**Actions** are just [plain old JS objects](https://wikipedia.org/wiki/Plain_old_Java_object). They are created by action creators.

**Action creators** are functions that create action objects.

**Reducers** are functions that take 2 arguments - `state` and `action`. Amongst the two, adding proper type to `action` is a real challenge. We'll see in a moment why that is the case.

## Our Workbench

To get my points across, I'll use a simple reducer function throughout this article. It stores a string message from an input with the default value of "Hello World". The user can **clear** the input, **update** or **reset** it.

```js
const CLEAR = 'CLEAR'
const RESET = 'RESET'
const UPDATE = 'UPDATE'

function reducer(state: string = '', action) {
  switch (action.type) {
    case CLEAR:
      return ''

    case RESET:
      return action.text

    case UPDATE:
      return action.text

    default:
      return state
  }
}

function clear() {
  return { type: CLEAR }
}

function reset() {
  return { type: RESET, text: 'Hello World' }
}

function update(text: string) {
  return { type: UPDATE, text }
}
```

## Manual types

The "big idea" is that each action creator creates an _action_ of a unique shape - a property `type` with value of type `string`.

We can manually add types to the action objects and use them in the reducer as a [union](https://flow.org/en/docs/types/unions/) type.

```js
type ClearAction = { type: 'CLEAR' }
type ResetAction = { type: 'RESET'; text: 'Hello World' }
type UpdateAction = { type: 'UPDATE'; text: string }

type Action = ClearAction | ResetAction | UpdateAction

function reducer(state: string = '', action: Action) {
  ...
}
```

This simple approach _just works_ and you can see it [here](https://flow.org/try/#0C4TwDgpgBAwgNhAhgJwIIGNgEsD2A7KAXigG8pRIAuKAchgBkBRVAJRqgF8BuAKAuhYQAzhGAZs+IqXLgI1Gi0YBlRgBUaAGnIQAHsHkAJCHDg4oAdRzI4AE3bc+sqAFUwNxMAjjcBYmX7yzgAKACKoqoya2nrUQsDIWHgA5py8jpBQ3pKEPFBQAD6wCChZeLkFUIIiYpg+5YWu7p6laej4cbBMrFJ0XWy8bXgdiiqqPSNqNAPtwC6h4Yw9wWERUzw8AGYArni1ksgQNlvoEMgAFHEeclBxCck9UYh7eNSlAJSk5UIA7ljA6AALKBnJ4SPAAOn4HxI5Ty6EQIk6zBYlFheSgB2AW2QBBoazR8MRE1UqPR6Mx2IIoJ8kN0wDSZMJ0GWC1JZIxokpUGp+FpegZ6JsEA2iC2cH0aLyFJxN2AV14eQ4PCVmx2zyg6GK52h5WlBH8smoDGRqWV622uzBHOqZx1Us5MoNVEqyjUWk8MVoRhMZks1jsppVFvVWzcVzOHv0sruSTtHKxjpkzpZEXddMDPCAA). An added benefit of annotating code this way is that we can also add types to the action creators as well (see [here](https://flow.org/try/#0C4TwDgpgBAwgNhAhgJwIIGNgEsD2A7KAXigG8pRIAuKAchgBkBRVAJRqgF8BuAKAuhYQAzhGAZs+IqXLgI1Gi0YBlRgBUaAGnIQAHsHkAJCHDg4oAdRzI4AE3bc+sqAFUwNxMAjjcBYmX7yzgAKACKoqoya2nrUQsDIWHgA5py8jpBQ3pKEPFBQAD6wCChZeLkFUIIiYpg+5YWu7p6laej4cbBMrFJ0XWy8bXgdiiqqPSNqNAPtwC6h4Yw9wWERUzw8AGYArni1ksgQNlvoEMgAFHEeclBxCck9UYh7eNSlAJSk5UIA7ljA6AALKBnJ4SPAAOn4HxI5Ty6EQIk6zBYlFheSgB2AW2QBBoazR8MRE1UqPR6Mx2IIoJ8kN0wDSZMJ0GWC1JZIxokpUGp+FpegZ6JsEA2iC2cH0aLyFJxN2AV14eQ4PCVmx2zyg6GK5ze1HgSDQ6phUs5Mv8sl1fVSyvW212YI51TOOsqwlEpU+xqxppkVEqyjUWk8MVoRhMZks1jsVpVtvVWzcVzOQf0sruSWdjSu7qNHK9BDNvpZEUDdOjPCAA)).

```js
...

function clear(): ClearAction {
  return { type: CLEAR }
}

function reset(): ResetAction {
  return { type: RESET, text: 'Hello World' }
}

function update(text: string): UpdateAction {
  return { type: UPDATE, text }
}
```

## Inferred comment types

In a small, simple project, this works just fine. But when you have multiple reducers and each reducer has multiple actions where each action object is a different shape, writing everything manually becomes an challenge in itself. We need a better system; one that has some degree of _automation_.

Let's take a look at `ResetAction`:

```js
type ResetAction = { type: 'RESET'; text: 'Hello World' }
```

It is of the same shape as the return value of the `reset()` action creator.

```js
function reset() {
  return { type: RESET, text: 'Hello World' }
}
```

Instead of writing each action object type manually, we can:

1. invoke the action creators
2. convert the returned object into a static type
3. use those type values in the `Action` type.

Luckily, we don't really have to _literally_ invoke the action creators. We can leverage [Flow's comment types](https://flow.org/en/docs/types/comments/) that will execute code blocks at "compile time" and not runtime (see [here](https://flow.org/try/#0PQKgXGBQAE0MYHsB2BnALvANgUwIYCcBBONAS2WgF4s98AKASgG4Z5l1p9sVs1iyK1LjzSMWsRKgwBXAA4ATXGmz9ySKtDmLldAOS7mkEMEiQ0AT1nZoAYRwFVg6BasIAZjQck1LF9YBK3LyO6tR+7pxBfN7IvpbWAKoKSioxoc7xEVopISxm8dAhVKwAPrb2RGml0IEiIdVJ2qkCSHmSHDYAMgCihP4aul29-ros7Rj+3QDK3QAqA5Mzs6OQ49AJAAoAIoSz3QObO3srkG7SSGmR8tJw2PToKWDQ6PikSADmA7oANNC4aU8QgxoABvVgoADupDQcAAFtA6P8WgA6PzAsGwCS4Hi2Hp9KCYzFcNDSfDqfR5QlwbEBaZzAmEyIksl-NKo7AADzQlMx1Jxh123QZhOJpPUSLU7K5PNg8mwblw0kwaGFRN4YueaBS4mgAF9IPrIMBgPBcEgkAhlH9zZaUqyWvAuEoEPgUNAoWh4W83HcuPIMlYUKdzpc4BVGKDWKKWSCA9gnkM+nqWIazhcHcJeBGMUyNbG-E9FnNfsouU9dAAJbCYTAIaAAdRdmHkumTBtMacu2R0pZVmteH3RUfVMbjTwFexLnIwupTkCAA)).

```js
/*::
  // "compile time" execution code
  const clearAction = clear()
  const resetAction = reset()
  const updateAction = update('')
*/

type ClearAction = typeof clearAction
type ResetAction = typeof resetAction
type UpdateAction = typeof updateAction

type Action = ClearAction | ResetAction | UpdateAction

function reducer(state: string = '', action: Action) {
  ...
}
```

Unfortunately, since we're inferring types for action objects by invoking their action creators, we **cannot** annotate the creators with the inferred types. It kind of makes sense since that would create a circular chain of dependence between the inferred types and the type annotations.

**_Note:_ In** line:5*, we pass an empty string to* `update()` *because it requires a string argument and Flow requires that we pass *all* arguments for proper function calls.*

## Extracting return type

One of the most _legit_ looking solutions came from [this github thread](https://github.com/facebook/flow/issues/4002). One of the comments there directed me to [this article](https://hackernoon.com/redux-flow-type-getting-the-maximum-benefit-from-the-fewest-key-strokes-5c006c54ec87) by [Shane Osbourne](https://medium.com/u/6daf98a660a4) and then back to the thread.

The article talks about a type that "extracts" a function's return type and using it on the action creators. A [later comment](https://github.com/facebook/flow/issues/4002#issuecomment-384756198) in the thread distilled the idea behind this down to its essence: _actions are the return type of action creators; not the other way round_. To extract the return type of a function, we use a [generic function type](https://flow.org/en/docs/types/generics/#toc-function-types-with-generics) `ReturnType`.

```js
type ReturnTypeHelper = <T>((...Array<any>) => T) => T
type ReturnType<Fn> =  $Call<ReturnTypeHelper, Fn>
```

This works the same as the previous one (see [here](https://flow.org/try/#0C4TwDgpgBAJAogD2AJwIYGNgCULAK7IB2APAGKEB8UAvLAMKoA2jxxAKhQBScB0fAgsjQhiqQiAoBKGlTbTqsgDRRyFANwAoDaEhQ6jCKmT9MASwD2hGrEQoM2XARI6I5gGZR0Bo+u3hoOADOuCbAFla08EhomDj4RMQu7lDIEMHAvi5QAKpgACaowBCh4dZRdrGOCUkeePmFEL5+uiWWNBpQUAA+et7GZpYd3VBBIQOEQz25BUWthJoa6JaBwHoAMnD8WNYA5HQbWzuaS4QrI3AAynBsu1iX10eLy6vZAAoAIvxscLtvn9+PDRuPCEcYpCB5PDoCDITgrBoALigK2QpkIAHNdjtlPZwki5tIAN5DQIAd1MwHQAAsoJxcZYeC4iUNOuhUMF1pssAiWZ1wfErDtAXzPOyAvc2DyRZ1UgKoPTCIyIEgFiK2Ry-l84FLpbKnPLxkqVVoRXkIG5UHhGMAdSK9URkcAGppOgBfDTujQAei9osIhHMRXl-sDDQNYTa6FShXMyECUHJwBpaLcMNSeSgLkCQJBYK8hlhzJlVSshMz-iR+y5UFdmk9wNBEasqXSnCL-P1ZZcSLuVzYyiKSCROwAEhBmOYoAB1WOMPI7Gt1rQNsF1GYQTiDm2O1EY9v20vlyBIzXfAfK1a1j0aIA)) and also cannot add types to action creators. But look on the bright side - less syntax!

## Make the $Call

Now that we have a better understanding of the process required for adding types, we can further reduce the syntax by directly calling functions by using Flow's [utility type](https://flow.org/en/docs/types/utilities/#toc-call) `$Call` (you already saw it in action above).

> `$Call<F>` is a type that represents the result of calling the given [function type](https://flow.org/en/docs/types/functions) `F`. This is analogous to calling a function at runtime, but at the **type level**; this means that function type calls happens statically, i.e. not at runtime.

This is what we get (see [here](https://flow.org/try/#0C4TwDgpgBAwgNhAhgJwIIGNgEsD2A7KAXigBIZE44AeUSHAMynQRQD4BuAKFugCUIAzhGAZs+IqXKUa4CAyjJBwjt1lQAqmAAmiYBFG4CxMhWo95AV226IAGigDgyLHgDmK1ZCgHxhTlCgAH1gWNExDfyCofiERcPxI4M0dPR88Lk50fEdYABkAUVReCQByGAKikq4svBzefIBlfIAVUvqm5qrM7OANAAUAEVRm-NL1QeH8rs56Czx4gkUtC3QIZAAKRxsALgcnF1dSkvtEBd20gEooAG9IgQB3LGB0AAsoddOxPAA6HivbgIBdCIIR5Qq8baRQEKYQWZAEErTaHA0HtFqQ6EBRTAOEET6GX4QAAewAyyJB0HGQxGGMx2NxUHx+EJJLJgK0EHoiAscGAtOh9PhexsXACAF9OBLOAB6aVMRB4PA4PSMxXKmyMhZMRS6HDIARQR7AN4uehrJZQHgCGZzLXMJAbf6RQUEa6W2S7crgqBirhS2bzL4w2LrJ1Y2FCt08XZo5r2PQk3YlAASEEoOCgAHU9XAtCUfX7ODbA4YoFYUhB1gm+XtnG4wzCcZH3ZBdlTJvHib1fZLOEA)).

```js
type ClearAction = $Call<typeof clear>
type ResetAction = $Call<typeof reset>
type UpdateAction = $Call<typeof update, string> // arguments

type Action = ClearAction | ResetAction | UpdateAction

function reducer(state: string = '', action: Action) {
  ...
}
```

**_Note:_ As per my experience,** `$Call` _has a tendency to just "not work" at times. I am yet to experiment with it to figure out the cause behind this. If you know something, do tell me._

## Final verdict

In the end, it all comes down to your choice. If you want to have explicit types for action creators, you need to manually add type annotations. If not, use inferred types to ease up the process and reduce syntax.

I hope you find this useful in the long run. If you type your redux code in a different, possibly _cool_ way, let me know in the comments section.
