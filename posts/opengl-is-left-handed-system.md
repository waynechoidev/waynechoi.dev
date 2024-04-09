---
title: "OpenGL is left-handed system"
date: "9 April, 2024"
category: "graphics"
tags: ["opengl", "coordinates", "ndc", "left-handed", "right-handed"]
excerpt: "coordinate systems for various graphics APIs..."
---

Starting with the conclusion, OpenGL coordinates use a left-handed system, just like DX. But GLM uses a right-handed coordinate system.

Starting to handle new graphics APIs, I often found myself confused and lost due to different coordinate systems. I believe this is a common issue not only for myself but also for others. So, I aimed to precisely research and share about it this time. I began by seeking the official sources for two key facts I'm most clear about: OpenGL uses a right-handed coordinate system, while DX uses a left-handed one.

However, I couldn't find any official documentation confirming the fact that OpenGL uses a right-handed coordinate system. Instead, I came across various blog posts. Opinions were not unified and were somewhat scattered, but there was some consensus that the coordinate system is right-handed while NDC (Normalized Device Coordinates) is left-handed. The fact that NDC is left-handed could be confirmed officially, but the mention of OpenGL being right-handed remained elusive.

As I progressed with my research, I began to feel confused about what coordinate systems are and how they are handled by graphics APIs. So, I decided to rethink from the beginning. And then I realized. The fact that OpenGL uses a right-handed coordinate system for spaces has nothing to do with the graphics API itself.

Typically, we send the MVP (Model-View-Projection) matrix along with the vertex's local coordinates to the vertex shader. Then, we operate on the local coordinates and MVP matrix in homogeneous space to obtain device coordinates, which are then returned in the vertex shader. The process of obtaining device coordinates before returning them in the vertex shader is entirely the user's logic and has nothing to do with the graphics API. Usually, it involves logic from math libraries like GLM. And the resulting device coordinates computed in this way are left-handed coordinate systems in both OpenGL and DX. It goes against the commonly perceived bias in the community, as they are often considered to be opposite.

To confirm this visually, I made some modifications to the shader code for modeling a sphere to directly verify that OpenGL's NDC space is indeed a left-handed coordinate system. The following code snippet is from the vertex shader where I transformed the z-value of device coordinates, ranging from -1 to 1, into the range of 0 to 1, and then passed it to the fragment shader. I applied this value to the color, and upon observation, I confirmed that as the object gets closer to the screen, the z-value decreases.

```glsl
// vertex shader
#version 420 core

layout (location = 0) in vec3 pos;

out float color;

uniform	mat4 model;
uniform	mat4 view;
uniform	mat4 projection;

void main()
{
	gl_Position = projection * view * model * vec4(pos, 1.0);
	color = (gl_Position.z + 1.0 ) / 2.0;
}

// fragment shader
#version 420 core

out vec4 FragColor;
in float color;

void main()
{
    FragColor = vec4(vec3(color), 1.0);
}
```

Furthermore, I also confirmed that within the same graphics API, depending on the mathematical operation method, the world coordinate system can sometimes become a right-handed coordinate system and sometimes a left-handed coordinate system. When using the math operation library glmatrix with WebGL, it operated in a right-handed coordinate system similar to glm. However, in the [perspective example from WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-3d-perspective.html), where the projection matrix was manually calculated, it was implemented in a left-handed coordinate system.

The conclusion is that the coordinate systems before obtaining device coordinates are not dependent on the graphics API. What we need to be mindful of is which library we are using, or whether we are directly implementing matrix calculations, and also the NDC (Normalized Device Coordinates) space, framebuffer coordinates, and texture coordinates.

Now, below are the coordinate systems of each API that I initially set out to investigate:

## 1. OpenGL / WebGL

- NDC: +Y is up. Point(-1, -1) is at the bottom left corner
- Framebuffer coordinate: +Y is up. Origin(0, 0) is at the bottom left corner
- Texture Coordinates: +Y is up. Origin(0, 0) is at the bottom left corner

## 2. WebGPU / D3D12 / Metal

- NDC: +Y is up. Point(-1, -1) is at the bottom left corner
- Framebuffer coordinate: +Y is down. Origin(0, 0) is at the top left corner
- Texture coordinate: +Y is down. Origin(0, 0) is at the top left corner

## 3. Vulkan

- NDC: +Y is down. Point(-1, -1) is at the top left corner
- Framebuffer coordinate: +Y is down. Origin(0, 0) is at the top left corner
- Texture coordinate: +Y is down. Origin(0, 0) is at the top left corner.

### References

- [WebGPU W3C Working Draft](https://www.w3.org/TR/webgpu)
- [OpenGL 4.6 (Core Profile)](https://registry.khronos.org/OpenGL/specs/gl/glspec46.core.pdf)
- [Vulkan® 1.3.281 - A Specification](https://registry.khronos.org/vulkan/specs/1.3/html/chap24.html)
- [WebGPU Coordinate systems](https://github.com/gpuweb/gpuweb/issues/416)
- [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-3d-perspective.html)
