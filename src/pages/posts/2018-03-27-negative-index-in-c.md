---
layout: '@/layouts/Post.astro'
title: Negative Indexing Multi Arrays in C/++
date: 2018-03-27
---

_Inspired by_ [_"A convenient untruth" by Glennan Carnie_](https://blog.feabhas.com/2016/12/a-convenient-untruth/)_._

When declaring a multi array (multi-dimensional array) in C/++, we end up with is a contiguous chunk of memory. This memory block spans over the size of the product of all the dimensions.

For a 2x3 array `arr[2][3]`,we get a memory block of 6 units. I say units instead of the actual size (in bytes) because the size will be different depending on the data type of the array and the machine architecture.

When we query the array (i.e. access elements), we are performing pointer arithmetic to extract the value from a single 6 unit memory block.

```c
int arr[2][3] = {11,22,33,44,55,66};
cout << arr[1][1]; // 55


int *ptr = &arr[0][0];
cout << *(ptr + 1*3 + 1*1); // 55


data      11  22  33  44  55  66
address  100 104 108 112 116 120
           ↑               ↑
         ptr            ptr+4
```

This made me wonder - can I travel backwards?

## Negative Indexing

Now here's the fun part. In the 2x3 integer array given above, how can we query the number `33`? The obvious answer would be `arr[0][2]`. And that's correct.

In pointers, it becomes `*(ptr + 0*3 + 2*1)` which is just `*(ptr + 2)`. So the next question is: in how many ways can we make `x * 3 + y * 1`equal to `2`? In other words, for what values of `x`, `y` will the equality `3x + y == 2` hold?

Here's a sample of solutions:

```
x  0  1  2 -1 -2 ...
y  1 -1 -4  5  8 ...
```

And we can use any of these `(x, y)` pairs to query the number `33`:

```c
int arr[2][3] = {11,22,33,44,55,66};

cout << arr[0][2];  // 33
cout << arr[1][-1]; // 33
cout << arr[2][-4]; // 33
cout << arr[-1][5]; // 33
cout << arr[-2][8]; // 33


data      11  22  33  44  55  66
address  100 104 108 112 116 120
           ↑       ↑
          ptr    ptr+2
```

This behavior is true for all multi [arrays](https://hackernoon.com/tagged/arrays) of `n` dimensions. The only problem is that it becomes rather cumbersome to visualize this principle in 3D and above arrays. Fortunately, I made a tiny utility that does the job for you :)

This tool helps create a multi array up to 5D array and each "level" can hold up to 4 "cells". After generating an array, you can run a query on it and the tool will highlight the memory cells used to arrive at the [output](https://hackernoon.com/tagged/output) value.

**_Note:_** What I mean by the words "levels" and "cells" is explained later on.

## Show and Tell

To explain things better, I will use the following memory map of a 2x3x2 array. Have a look at it and convince yourself of the following equality `arr[0][2][0] == arr[0][0][4] == arr[1][0][-2]`

```
 _____________________________________________________________
|        | L0 |           0           |          1            |
|        |----|-----------------------------------------------|
| Memory | L1 |   0   |   1   |   2   |   0   |   1   |   2   |
| Levels |----|-----------------------------------------------|
|        | L2 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 1 |
|=============|===============================================|
|  Data Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12|
 ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

Also, I am using functions `PROD()` and `SUM()` that give the product and sum of an array range.

```
prod(i, [a..b], arr) = arr_a * arr_(a+1) * ... * arr_(b-1)
prod(arr) = arr_0 * arr_1 * ... * arr_(n-1)

sum(i, [a..b], arr) = arr_a + arr_(a+1) + ... + arr_(b-1)
sum(arr) = arr_0 + arr_1 + ... + arr_(n-1)

where n = size of array
```

### Cells and Levels

Both these terms are made up. These are just notations I use to refer to a specific memory location.

A **Memory Cell** is just a memory location that can be pointed to by a pointer or array index. When we access element `arr[0][2][1]`, we end up with the data value `6`.

But what does `[0][2][1]` represent? I answer this by saying that they are pointers to "memory cells". One way to read it is:

```
* access 0th cell in the block
* access 2nd cell in the 0th cell
* access 1st cell in the 2nd cell
* retrieve the value
```

A **Memory Level** is a collection of memory cells that reside in the same memory dimension.

### Observations

The first observations are the more obvious ones:

- Dimension Count: `N = 3`
- Dimension Sizes: `D = [2, 3, 2]`

If we access `arr[1][2][1]`then Query will be: `Q = [1, 2, 1]`

### Cell Stride (S)

Standing at the `ith` memory level, if I move by 1 cell, the size of jump in the data level is the **Cell Stride** for that memory level.

Cell strides at levels are:

- L0: 6 = 1\*2\*3
- L1: 2 = 1\*2
- L2: 1 = 1

This gives us the relation that for the `ith` memory level, the stride length is product of all dimension sizes above that level.

```
S_i = 1 * prod(j, [i + (1).N], D)
or
S_i = S_(i + 1) * D_(i + 1)
```

### Query Match (M)

When we run a query, we match a memory cell at each level. This forms a chain of jumps **across the levels**, ending in the data level and results in a data value.

This gives us the relation that for the `ith` memory level, the matching cell is:

```
M_i = (1 / S_i) * sum(j, [1..N], S_j * Q_j)
or simply
M_i = (1 / S_i) * sum(S_j * Q_j)
```

Unfortunately, my journey to this relation is pretty unwieldy to explain. So I'll just skip it.

It is this value - the query match - that I use to highlight the memory cells and the final data value that result from the query.

### Misc

**Cell Count**: The number of cells in the `ith` memory level  
`C_i = prod(j, [0..i], D) = C_(i-1) * D_i`

**Data Count**: The total number of data values stored  
`n = prod(i, [0..N], D) = prod(D)`

By comparing relations `C_i`, `S_i` and `n`, get the relation `n = C_i * S_i` because:

- `n = prod(i, [0..N], D)`
- `C_i = prod(j, [0..i], D)`
- `S_i = prod(j, [i+1..N], D)`

## The End

C/++ allows negative indexes in multi arrays since it is just a contiguous chunk of memory and index lookups is just pointer arithmetic on it.  
There. That's a thing you now know.

You can find the code [here](https://gist.github.com/zhirzh/aa02be34407eebe8998d2ff35946cdc9) or on [codepen](https://codepen.io/zhirzh/pen/yKPNjo).

Also, if you're wondering whether it would be possible in some other language, that answer is "it depends". Languages that implement multi arrays as true multi arrays - arrays of arrays - cannot have negative indexes. Languages that implement multi arrays like C/++ does _might_ support it.

## Bonus

Say we have an integer array `arr[3]` and we access the element `arr[1]`, what do we get? Well, we get the 2nd value. That's not interesting.

What _is_ interesting is how the compiler works this out by re-writing the query as `*(arr + 1)`. This is simple pointer addition. And since addition is commutative, we can do ...

```
arr[1]     -> *(arr + 1)
*(arr + 1) -> *(1 + arr)
*(1 + arr) -> 1[arr]
```

... and conclude that `arr[i]` is the same as `i[arr]`. This bit is also true for multi arrays.

```c
int main () {
  int arr[2][3] = {11,22,33,44,55,66};

cout<<arr[0][2]; // good
  cout<<2[0[arr]]; // bad
  cout<<2[arr[0]]; // also bad
  cout<<0[arr][2]; // ???
}
```

There's a whole lot more where that came from. Checkout the article  
["A convenient untruth" by Glennan Carnie](https://blog.feabhas.com/2016/12/a-convenient-untruth/).
