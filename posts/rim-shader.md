---
title: "Rim shader"
date: "Oct 24, 2023"
category: "graphics"
tags: ["opengl", "shader", "cpp"]
excerpt: "Texture mapping an Earth-like texture onto a sphere model using OpenGL..."
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/jXfSsuYIk5o?si=SE_r_RnXtOvLG6n3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

I implemented a simple rim shader using 'The Stanford Dragon' model.

I considered it one of the most suitable examples to illustrate the usage of the normal vector. Implementing a rim shader and utilizing normal vectors is an excellent way to enhance understanding of lighting and reflections. Normal vectors represent surface directions in the rendering pipeline, and rim lighting effects are used to cast light along the edges of the surface.

Two normal vectors will yield a dot product of 0 when the angle between them is 90 degrees, and a dot product of 1 when the angle is 0 degrees. So, when you take the dot product of the normalized light vector and the normal vector, it allows you to calculate the angle between the light and the normal.

---

In the illustration below, you can see that the surface at the edge of the ellipse has a normal vector with a 90-degree angle to the light vector, resulting in a dot product of 0. In the center, the angle is 0 degrees, leading to a dot product of 1. The arrows in the middle represent dot product values somewhere between 0 and 1.

<img src="/img/rim-shader-1.jpg" class="post-pic">

We can use the reciprocal of the dot product value to determine the intensity of the rim lighting effect. Using the reciprocal, as we move from the edges, the rim's intensity increases, and as we approach the center, the rim's intensity decreases.

---

The following is part of a GLSL code that implements rim lighting. When you look at the section where the 'rim' variable is initialized, you can see that it calculates the reciprocal of the previously explained dot product result.

```glsl
// Combined with result with other lighting effects
// vec3 res = ...;

float rim = (1.0 - dot(normalWorld, toEye));

if (useSmoothstep) rim = smoothstep(0.0, 1.0, rim);

rim = pow(abs(rim), rimPower);

res += rim * rimColor * rimStrength;

colour = vec4(res, 1.0);
```

Then the calculated initial value of 'rim' is multiplied by 'power' and 'strength.' 'Power' is typically used to square or raise a value to a certain exponent and is primarily used to adjust shape and sharpness. 'Strength' is a parameter used for multiplication, generally to control intensity. So, 'Power' is mainly used to control the shape and sharpness, while 'Strength' is used to adjust the intensity.

---

<img src="/img/rim-shader-2.jpg" class="post-pic">

Smoothstep" is one of the functions used in computer graphics and shading to generate smoothly transitioning values. Primarily employed in shader programming, it takes two boundary values as input and generates a smoothly transitioning value between them. Applying "smoothstep" to the "rim" value generally results in a more pronounced transition, particularly in dark and bright areas, which, in turn, enhances the rim effect.

---

[Repository](https://github.com/waynechoidev/Rim-Shader/)
