---
title: "Galton board"
date: "April 24, 2024"
category: "graphics"
tags: ["toyproject", "webgpu", "particles", "collision"]
excerpt: "implemented a Galton Board using WebGPU..."
---

<img src="/img/galton-board.jpg" class="post-pic">

[Sample](https://waynechoidev.github.io/galton-board/) / [Repository](https://github.com/waynechoidev/galton-board/)

I implemented a Galton Board using WebGPU. The Galton Board is a machine that visually represents the standard normal distribution. I had wanted to implement the Galton Board using a particle system in the past, but it was difficult to compute particle collisions using the WebGL API without compute shaders. However, with WebGPU, I was able to use compute shaders to implement it.

First, I randomly generated the central position values of each particle and stored them in a Storage Buffer. In a compute shader, I handled collisions between particles and obstacles, updating their positions and velocities. In another compute shader, I updated the Result Buffer with the x-coordinates of particles that fell to the bottom of the screen and reset their positions and velocities.

In yet another compute shader, I generated billboard vertices from the Storage Buffer containing just the particle center coordinates, similar to how a geometry shader works. These vertices were then passed to the graphics pipeline for rendering on the screen, with the fragment shader performing calculations to render them as circles.

Finally, I copied the values from the Result Buffer to a read-only buffer and brought it to the CPU, then updated the UI. This completed the implementation process.

In the past, performing GPGPU with textures in the fragment shader using WebGL was very difficult to understand and complex. However, with WebGPU, I could easily move between compute shaders and the graphics pipeline using Storage Buffers. Now that I understand the overall process, I feel like I could even implement this using WebGL if I had to. Ultimately, what's important isn't the API or tool itself.
