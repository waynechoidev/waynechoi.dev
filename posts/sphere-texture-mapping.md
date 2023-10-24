---
title: "Sphere texture mapping"
date: "Oct 24, 2023"
category: "graphics"
tags: ["toyproject", "opengl", "texture", "cpp"]
excerpt: "Texture mapping an Earth-like texture onto a sphere model using OpenGL..."
---

## First attempt

At first, I began by generating the vertices of an tetrahedron model and performed multiple stages of triangle subdivision on the CPU to create a sphere model. Then, I attempted texture mapping on it, but it resulted in completely unexpected outcomes.

Upon inspecting the triangles with wireframe rendering, I noticed that starting the subdivision from a very simple model led to uneven triangles. This seemed to be the reason behind the unexpected results. For achieving more precise texturing, a more detailed modeling was necessary.

<img src="/img/sphere-texture-mapping-1.jpg" width="48%">
<img src="/img/sphere-texture-mapping-2.jpg" width="48%">

[Source code](https://github.com/waynechoidev/sphere-texture-mapping/tree/89d79e5aaefb43a9b0ffb79f4e000875797d440e)

---

## More detailed model

This time, I generated the vertices of a Icosahedron and applied subdivision before adding textures. I could confirm that this time, uniform triangles were formed as follows. However, there were still issues with the texture mapping. Strange lines appeared at the points where the texture started and ended.

<img src="/img/sphere-texture-mapping-3.jpg" width="48%">
<img src="/img/sphere-texture-mapping-4.jpg" width="48%">

Let's examine the image below. The long white vertical lines represent points where the texture meets at both the left and right ends. Point 'a' may appear as a single vertex, but it is, in fact, two separate vertices. One vertex is used to draw the left triangle, and the other vertex will be used to draw the right triangle. The texture coordinates will be (1.0, -) and (0.0, -) for each of them, and in this case, there won't be any issues with texturing.

However, for vertices 'b' and 'c,' the texture coordinates used to draw the middle triangle will be close to (1.0, -) and (0.0, -). As a result, the texture coordinate for point 'd' will be interpolated, leading to an entirely unexpected value like (0.5, -).

<img src="/img/sphere-texture-mapping-5.jpg" width="48%">

[Source code](https://github.com/waynechoidev/sphere-texture-mapping/tree/ae35dcc752c384a9a4354c8b2148dc0ca0f43cf7)

---

## Solution 1

If you model the sphere with a vertical-line structure from the beginning, instead of using a subdivision approach, you can avoid the issue of texture coordinates being interpolated as we discussed earlier. This way of modeling ensures consistent texture coordinates, allowing for the expected texture mapping at each point.

<img src="/img/sphere-texture-mapping-6.jpg" width="48%">
<img src="/img/sphere-texture-mapping-7.jpg" width="48%">

[Source code](https://github.com/waynechoidev/sphere-texture-mapping/tree/45a01ae9274993fcfcaf587b687a0da1e248567c)

---

## Solution 2

Another solution is to calculate texcoords at the pixel level in the shader, rather than at the vertex level. This method allows for more precise control over texture coordinates, enabling unique texture coordinates to be assigned to each pixel. It provides a way to accurately control how the texture should appear at specific points, resulting in different outcomes compared to subdivision-based or simple vertex-based texture coordinate allocation.

Using shaders to calculate texture coordinates at the pixel level can be complex, but it is highly beneficial for increasing the accuracy of texture mapping. It can be particularly effective when working with high-resolution textures or implementing special effects.

It is glsl codes to calculate texture coordinates.

```glsl
const float PI = 3.14159265359;

vec2 uv;
uv.x = 1.0 - (atan(posModel.z, posModel.x) / (PI * 2.0));
uv.y = acos(posModel.y / 1.5) / PI;
```

<iframe width="560" height="315" src="https://www.youtube.com/embed/mk4kBj-d8nU?si=CvjjIyaoAhZ_JL1u" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

[Source code](https://github.com/waynechoidev/sphere-texture-mapping)

---

### References

[http://www.songho.ca/opengl/gl_sphere.html](http://www.songho.ca/opengl/gl_sphere.html)

[https://mathworld.wolfram.com/RegularTetrahedron.html](https://mathworld.wolfram.com/RegularTetrahedron.html)

[https://mathworld.wolfram.com/Isohedron.html](https://mathworld.wolfram.com/Isohedron.html)
