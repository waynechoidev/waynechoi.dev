---
title: "SPH Water"
date: "June 28, 2024"
category: "graphics"
tags: ["toyproject", "webgpu", "particles", "sph"]
excerpt: "simulated SPH water simulation with WebGPU compute shader..."
---

<img src="/img/sph-water.jpg" class="post-pic">

[Sample](https://waynechoidev.github.io/sph-water/) / [Repository](https://github.com/waynechoidev/sph-water)

Recently, I attempted to implement Smoothed Particle Hydrodynamics(SPH) simulation using WebGPU. I implemented based on the paper "Particle-Based Fluid Simulation for Interactive Applications".

To cut to the chase, I wasn't satisfied with the results. On my laptop with an AMD integrated graphics card, performance severely degraded beyond about 2,000 particles, and on Android mobile, it struggled beyond about 1,000 particles. SPH simulations are known for their high computational cost, but I still found it disappointing.

I'm unsure if this is due to the performance limitations of the web browser platform or issues in my implementation. If the latter, I suspect it might be related to the logic for finding neighboring particles.

For now, I don't plan to further refine this code here. Instead, I plan to implement it first in a native environment, not on the web. I've started learning Vulkan API for this purpose. I believe learning Vulkan will help me understand WebGPU, as both are low-level, modern APIs. Additionally, I'm a bit tired of the ambiguous OpenGL API, which relies on global state. Initially, as I become acquainted with Vulkan's API and gain proficiency through simpler tasks, it seems like revisiting the implementation of SPH will be postponed for quite some time.

### References

- [Particle-Based Fluid Simulation for Interactive Applications](https://matthias-research.github.io/pages/publications/sca03.pdf)
