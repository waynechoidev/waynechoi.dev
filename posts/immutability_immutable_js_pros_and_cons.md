---
title: "Immutability (2) - Immutable.js, pros and cons"
date: "Oct 14, 2021"
category: "web"
tags: ["javascript", "immutability"]
excerpt: "How Immutable.js works with persistent data structures, and its pros and cons..."
---

We need to keep original data to avoid side effects. If it is primitive data type, there is nothing to care about. If it is an object, we normally copy and manipulate it to keep the original data immutable. In this way, we might get problem when we deal with large data.

To keep the original object, we need to deep copy it. It means we need to allocate the space in memory for the entire object, even all of the stuff that didn't change. The both time and space complexity will be so bad. The code runs slow.

There are many of libraries to solve this problem, and I picked Immutable.js. It is a library to support immutable data structure, supported by Facebook. I would explain how it deal with immutability efficiently, and its disadvantages.

## How Immutable.js works

```js
const { Map } = require("immutable");

const map1 = Map({ a: 1, b: 2, c: 3 });
const map2 = map1.set("b", 50);

console.log(map1.get("b")); // 2
console.log(map2.get("b")); // 50
console.log(map1 == map2); // false
```

I made map1 object, then executed map1.set to change a value with key "b". It did not change a value of key "b" in map1, but returned new object, map2, with new value of key "b".

It looks like copying whole object and change one value, but worked totally different inside. Map1 and map2 objects are sharing values just except the changed value to minimize consuming memory. It is implemented by persistent data structures.

---

```js
const { fromJS } = require("immutable");

const nested = fromJS({ a: { b: { c: [3, 4, 5] } } });
const nested2 = nested.mergeDeep({ a: { b: { d: 6 } } });
// Map { a: Map { b: Map { c: List [ 3, 4, 5 ], d: 6 } } }

console.log(nested);
// Map { a: Map { b: Map { c: List [ 3, 4, 5 ] } } }
console.log(nested2);
// Map { a: Map { b: Map { c: List [ 3, 4, 5 ], d: 6 } } }
console.log(nested == nested2); // false
```

The collections in Immutable.js are intended to be nested, allowing for deep trees of data, similar to JSON.

## Persistent data structures

In computing, a persistent data structure is a data structure that always preserves the previous version of itself when it is modified. Such data structures are effectively immutable, as their operations do not (visibly) update the structure in-place, but instead always yield a new updated structure.

It is commonly used in functional programming to enforce immutability. Many of languages with functional programming paradigm has implementations of persistent data structures, but JavaScript does not. Immutable.js is a library to support this to JavaScript.

It is optimized with trie data structure. I will provide an example below to understand easily.

---

```js
const data = {
  to: 7,
  tea: 3,
  ted: 4,
  ten: 12,
  A: 15,
  i: 11,
  in: 5,
  inn: 9,
};
```

<img src="/img/immutability_immutable_js_pros_and_cons-1.png" class="post-pic">

I made an JS object, and created a trie with same keys and values. A trie is a type of tree where the leaves hold the values, and the paths from the root to the values represent the keys. So I can access a value by traversing the tree to get one letter at a time.

---

<img src="/img/immutability_immutable_js_pros_and_cons-2.png" class="post-pic">

For example, if I want to get a value with a key, 'ted', I can start from root, and follow the paths represented 't', 'e', and 'd'. I arrived at a node that contains 4.

---

<img src="/img/immutability_immutable_js_pros_and_cons-3.png" class="post-pic">

I changed the value at the key 'ted' from 4 to 8. Other nodes are still used. With this structures, only few nodes are recreated when we change a single item,

## Disadvantages of Immutable.js

All the data structure implemented with Immutable.js are custom object. It means it is not JSON format. JSON is widely used format to communicate. If we use custom objects like data structures of Immutable.js, we need to convert them to JSON format first. It consumes time and memory, and it is a huge consumption when data is large.

In addition, we cannot use methods of Object and Array object in Immutable.js data structures. It raises the running curve, and dependency to a specific library.

---

- [Immutability (1) - Object.freeze() doesn't always freeze](/posts/immutability_object_freeze_doesnt_always_freeze)
- **Immutability (2) - Immutable.js, pros and cons**

## References

- [Anjana Vakil: Immutable data structures for functional JS | JSConf EU](https://youtu.be/Wo0qiGPSV-s)
- [Wikipedia](https://en.wikipedia.org/wiki/Persistent_data_structure#Trees)
- [Immutable.js](https://immutable-js.com/)
- [How Immutable Data Structures (E.g. Immutable.js) are Optimized](https://hackernoon.com/how-immutable-data-structures-e-g-immutable-js-are-optimized-using-structural-sharing-e4424a866d56)
- 함수형 자바스크립트 프로그래밍 - 유인동
