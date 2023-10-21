---
title: "Phong shading"
date: "Oct 9, 2023"
category: "graphics"
tags: ["toyproject", "opengl", "phongshading", "cpp"]
excerpt: "Implemented the phong shading with OpenGL..."
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/r_5rToXmMso?si=lpXZsbQGmN2RKfhb" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

I implemented the Phong shading, a very classic and fundamental shading technique, with OpenGL. Although it wasn't my first time implementing Phong shading, this time I created an interactive simulation using ImGui, allowing me to adjust various parameters on the fly. Additionally, I made use of Uniform Buffer Objects (UBOs) in OpenGL for the first time.

Unlike DirectX's Constant Buffer, UBOs in OpenGL cannot directly include structures. It's not possible to bundle data using structures and easily manage them. So I have to store data individually and set index manually within UBOs. This stands as one of the key distinctions when defining and using UBOs in OpenGL.

In my experience, when implementing Phong shading, one of the most crucial concepts is Normal Transformation. Normal vectors are essential not only for Phong shading but for various rendering effects I may work on in the future. They play a central role in calculations involving ray vectors and dot products to determine incident and reflection angles. However, problems arise when transforming these normals alongside the model.

If non-uniform scaling is part of the transformation, the transformed normal vectors no longer correspond to the model's normals. In such cases, it's essential to multiply the normal vector by the inverse transpose of the model matrix to ignore the scaling while preserving the correct normals.

[Repository](https://github.com/waynechoidev/OpenGL-Lighting/)
