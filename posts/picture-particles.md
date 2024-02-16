---
title: "Picture particles"
date: "Feb 16, 2024"
category: "graphics"
tags: ["toyproject", "webgl", "particles"]
excerpt: "I implemented a particle shattering effect using WebGL..."
---

I tried implementing an effect where an image shatters into particles using only WebGL, without relying on external libraries like Three.js.

First, I drew points corresponding to each pixel in the image and assigned appropriate texture coordinates to each point. After rendering the image, I performed GPU computations using Transform Feedback in a separate vertex shader from the rendering pipeline to update the positions of the points.

You can check out the code in the shared repository below, and I've also included a link to a live sample.

---

[Repository](https://github.com/waynechoidev/picture-particles/) / [Sample](https://waynechoidev.github.io/picture-particles/)
