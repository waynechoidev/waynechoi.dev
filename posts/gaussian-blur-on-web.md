---
title: "Gaussian blur on web"
date: "Dec 12, 2022"
category: "graphics"
tags: ["toyproject", "webgl", "imagefilter"]
excerpt: "compared the speed of Gaussian blur implementation using canvas 2D and WebGL2..."
---

I've implemented Gaussian blur on the web, using canvas 2D and WebGL2 shader, and I compared their speeds.

- Sampe image size : 800 \* 600
- Kernel size : 3 \* 3

For the canvas 2D implementation, I used a separable filter to apply horizontal and vertical blurs separately.

On my machine, the canvas 2D version took around 350ms, while the WebGL2 version only took 0.1ms. GPU computation was more than 3,000 times faster.

You can try it out for yourself by following the link below:

[Repository](https://github.com/waynechoidev/gaussian-blur/) / [Sample](https://waynechoidev.github.io/gaussian-blur/)
