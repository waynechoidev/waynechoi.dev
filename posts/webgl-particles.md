---
title: "Webgl particles"
date: "Aug 25, 2023"
category: "graphics"
tags: ["toyproject", "webgl", "particles"]
excerpt: "Simple particle system using a web-based approach..."
---

I allocated two position buffers and used one buffer to calculate the positions, while drawing the screen with the other buffer. Whenever a new frame is initiated, I swapped the two buffers.

When utilizing GPGPU, like calculating the positions, in WebGL, there are typically two main methods: using the transform feedback functionality to store output values from the vertex shader into a buffer, or performing computations in the fragment shader using pixel data from textures. I opted for the former method.

While WebGPU supports compute shaders explicitly designed for GPGPU tasks, I chose to stick with WebGL due to my unfamiliarity with the new shader languages associated with WebGPU. (WebGL2 also introduced experimental support for compute shaders, but it seems this feature is no longer available, possibly due to the emergence of WebGPU.)

I referred to the code provided in [this example](https://webgl2fundamentals.org/webgl/lessons/ko/webgl-gpgpu.html). To enhance code clarity and encapsulate the pipeline, I restructured and re-wrote the logic in a type-safe manner.

[Repository](https://github.com/waynechoidev/simple-particles/) / [Sample](https://waynechoidev.github.io/simple-particles//)
