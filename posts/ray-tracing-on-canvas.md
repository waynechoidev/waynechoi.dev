---
title: "Ray tracing on canvas"
date: "Dec 14, 2022"
category: "graphics"
tags: ["toyproject", "webgl", "raytracing", "phongshading"]
excerpt: "Implemented Phong shading with ray tracing in a web environment..."
---

I recreated a simple ray tracing Phong shading example, originally implemented in C++, using 2D canvas in a web environment.

Although I initially wanted to implement more complex ray tracing, I decided to stop at Phong shading cause it was too heavy and slow with javascript.

In C++, I used the "glm" library, but here, I utilized "glmatrix" for matrix operations. The latter has a different interface based on references, which was a bit unfamiliar and challenging at first.

[Repository](https://github.com/waynechoidev/ray-tracing-canvas/) / [Sample](https://waynechoidev.github.io/ray-tracing-canvas/)
