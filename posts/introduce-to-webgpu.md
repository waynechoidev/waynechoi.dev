---
title: "Introduce to WebGPU"
date: "12 April, 2024"
category: "graphics"
tags: ["webgpu", "webgl", "typescript", "pbr"]
excerpt: "Learn WebGPU, and reimplement PBR Renderer with it..."
---

I recently had the opportunity to learn WebGPU and decided to reimplement the PBR renderer I had previously built with WebGL. I want to share my thoughts on encountering this new API and the insights I gained from implementing PBR.

Below are two samples of PBR renderers, implemented respectively in WebGL and WebGPU. The code for the WebGPU implementation can also be found in the repository linked below.

- [WebGPU Sample](https://waynechoidev.github.io/webgpu-pbr/)
- [WebGL Sample](https://waynechoidev.github.io/web-pbr/)
- [WebGPU Repo](https://github.com/waynechoidev/webgpu-pbr/)

My initial impression of WebGPU was extremely positive. A significant frustration with legacy graphics APIs like OpenGL or WebGL was how they operated through global state, making it difficult to write predictable code. However, WebGPU largely eliminates global state and manages all pipelines through immutable objects. This might be slightly inconvenient but provides a far more maintainable interface. Those of us with a web frontend background might find handling immutable objects familiar, though it could be a bit challenging for those who have only worked with the OOP paradigm.

A reminder of WebGPU's lower-level nature compared to WebGL came from having to manually handle tasks like texture mipmap generation, which OpenGL handled automatically. Also, creating a depth buffer in OpenGL involved changing just one global state, but in WebGPU, it requires more extensive setup. Additionally, inefficient matrix inverse operations that GPUs handle are not supported in WGSL, the shader language for WebGPU, necessitating their computation on the CPU and then passing them as uniforms. These tasks are somewhat more cumbersome but undoubtedly offer performance benefits.

I have not yet tried other next-gen APIs like Vulkan, but I am aware of their notorious complexity—rumors say that thousands of lines are needed just to display a single triangle. WebGPU allows detailed configuration of pipelines, but also provides many default values when settings are not specified, which can significantly reduce boilerplate compared to older, higher-level APIs like OpenGL.

The performance benefits are evident, but what really appealed to me was the convenience in development. Although currently the tool support for this API is somewhat lacking, I believe it will improve in the future.

### References

- [PBR Rendering](https://waynechoi.dev/post/pbr-rendering/)
- [WebGPU Fundamentals](https://webgpufundamentals.org/)
