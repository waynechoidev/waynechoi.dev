---
title: "Immutability (1) - Object.freeze() doesn't always freeze"
date: "Sep 23, 2021"
category: "web"
tags: ["javascript", "immutability"]
excerpt: "Explain primitive and reference data type of JavaScript, and immutability of object..."
---

### Immutability series

1. **Object.freeze() doesn't always freeze**
2. [Immutable.js, pros and cons](/post/immutability-immutable-js-pros-and-cons)

---

Immutability in JavaScript is getting more attention, while functional programming paradigm is on the rise. One of the important features of functional programming is that it has no side-effect.

A side effect is any application state change that is observable outside the called function other than its return value. It cause more problems by concurrency in an application. JavaScript is single thread language though, execution environment (browser and node.js) process various task at the same time. To avoid side effects, we need to keep the state outside the function immutable.

We can declare and assign immutable primitive variable with 'const' keyword, and keep properties of an object with 'Object.freeze()' method. The freeze method, however, does not always make objects immutable.

In this post, I would like to explain why 'Object.freeze()' method is not complete way to make an object immutable, and to illustrate this, I need to deal with data type of JavaScript first.

---

## Data type of JavaScript

JavaScript has 2 kinds of data types. One is primitive, and other is reference. Reference type is object which including array and function, and primitive type values are below.

- string
- number
- bigint
- boolean
- undefined
- symbol
- null

---

## Primitive type

```js
let p1; // declare variable
p = 1; // assign 1 (1000)

let p2 = 1; //assign 1 (1000)
console.log(p1 === p2); // true

p = 2; // reassign 2 (1001)
```

| 1000 | 1001 |
| ---- | ---- |
| 1    | 2    |

I declared a variable p1 and assigned number 1 to p1. Number 1 was not assigned to p1 directly, but allocated to memory first, and the memory address of number 1 is assigned to p1. Let's suppose the address of number 1 is '1000'. (All of memory address in this post is hypothetical to help understand memory allocation of JavaScript)

I declared new variable p2, and assigned number 1 to p2. The same memory address, '1000', was assigned to p2. Number 1 is primitive type data, and immutable.

And I reassigned number 2 to p1. At this time, number 1 in the memory '1000' won't be changed. Number 2 is allocated to the other space of memory, and its address '1001' is assigned to p1. (I would not deal with garbage collection to free memory in this post)

---

## Object

```js
let o1 = { name: "choi" }; // 2000
let o2 = { name: "choi" }; // 2001

console.log(o1 === o2); // false
```

| 2000              | 2001              |
| ----------------- | ----------------- |
| { name : 'choi' } | { name : 'choi' } |

Object is basically mutable. If I declare two variables, and assigned objects which have same keys and values to those variables, two different memory addresses are assigned to each ones. Object is reference type data.

---

## Copy

```js
let p1 = 1;
let p2 = p1;

console.log(p1); // 1
console.log(p2); // 1

p1 = 2;

console.log(p1); // 2
console.log(p2); // 1
```

It is simple to copy primitive type data. Primitive type data is immutable, so if I copied then changed one data, it doesn't affect the other one.

---

```js
let o1 = { name: "choi" };
let o2 = o1;

console.log(o1); // { name: "choi" }
console.log(o2); // { name: "choi" }
console.log(o1 === o2); // true

o2.name = "kim";

console.log(o1); // { name: "kim" }
console.log(o2); // { name: "kim" }
console.log(o1 === o2); // true
```

| 2000                        |
| --------------------------- |
| { name : ~~'choi'~~ 'kim' } |

It, however, does work in different way for an object to copy. I assigned one variable, o1, which is assigned an object, to other variable, o2. I changed one of them, then it affects other variables as well. Object is reference type value, so both variable reference same object with same memory address.

---

```js
let o1 = { name: "choi" };
let o2 = Object.assign({}, o1);

console.log(o1); // { name: "choi" }
console.log(o2); // { name: "choi" }
console.log(o1 === o2); // false

o2.name = "kim";

console.log(o1); // { name: "choi" }
console.log(o2); // { name: "kim" }
```

| 2000              | 2001                        |
| ----------------- | --------------------------- |
| { name : 'choi' } | { name : ~~'choi'~~ 'kim' } |

If we did not mean to change the property of the original object, it could cause serious errors of an application. To keep the o1 object immutable, we can use Object.assign() to copy an object. (If it is an array, we can use Array.concat() as well.)

---

## Object.freeze()

```js
let o1 = { name: "choi" };
Object.freeze(o1);

o1.name = "kim";
o1.age = 30; // even cannot add new properties

console.log(o1); // { name: "choi" }
```

Finally we reached the freeze method. It freeze all properties of an object. we can block to change the original object from the very beginning with this method.

---

## Const vs Freeze

```js
let o1 = { name: "choi" };
Object.freeze(o1);

console.log(o1); // { name: "choi" };

o1 = "hello world";

console.log(o1); // hello world

const o2 = { name: "choi" };

o2 = "hello world"; // Uncaught TypeError: Assignment to constant variable.
```

Const keyword is for immutable reference, and the freeze method is for immutable value. I declared variable o1 with let keyword and assigned an object to it. Then I freezed it.
I can still reassign other value to o1.
But if I make same variable o2 but with const keyword, I cannot reassign, even though I wouldn't freeze.

---

## Cannot freeze Nested Object

```js
let o1 = { name: "choi", occupation: { job: "boat builder" } };
Object.freeze(o1);

o1.name = kim;
o1.occupation.job = "software engineer";

console.log(o1); // { name : "choi", occupation : { job : "software engineer"}}
// name hasn't changed, but job has

let o2 = Object.assign({}, o1);
o2.name = "kim";
o2.occupation.job = "chef";

console.log(o1); // { name : "choi", occupation : { job : "chef"}}
console.log(o2); // { name : "kim", occupation : { job : "chef"}}
```

If values of one or multiple properties are reference type, aka nested object, both assign and freeze methods can not keep the original object immutable when cloning. They are called shallow freeze and clone.

---

```js
function deepFreeze(object) {
  var propNames = Object.getOwnPropertyNames(object);

  for (let name of propNames) {
    let value = object[name];
    object[name] =
      value && typeof value === "object" ? deepFreeze(value) : value;
  }

  return Object.freeze(object);
}
```

If an object is nested with only one layer, we can freeze each properties with reference type value. It, however, is not easy to freeze all layers when the object is nested much deeper.

We can implement a function to deep freeze an object with recursion, or can use a library to support immutable data structure like immutable.js.

---

### References

- [Master the JavaScript Interview: What is Functional Programming? - Eric Elliott](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0)
- [Anjana Vakil: Immutable data structures for functional JS | JSConf EU](https://youtu.be/Wo0qiGPSV-s)
- 함수형 자바스크립트 프로그래밍 - 유인동
