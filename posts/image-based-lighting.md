---
title: "Image based lighting"
date: "Oct 9, 2023"
category: "graphics"
tags: ["opengl", "phongshading", "cpp"]
excerpt: "Implemented a simple Image-Based Lighting (IBL) technique..."
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/qR98uFPMKvo?si=uHEEg5A6C9q1Ofzi" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

I tried to implement a simple Image-Based Lighting (IBL) technique. It's not as complex as the methods used in actual products, but I wanted to explore a straightforward approach. Traditional Phong or Blinn-Phong lighting often falls short when it comes to capturing intricate real-world environments. That's why using cube maps and environment maps as the foundation for lighting can allow for the creation of more complex environments.

---

<img src="/img/image-based-lighting-1.jpg" class="post-pic">

I first implemented an environment map. I positioned a sphere model at the center and used a cube map texture to create a skybox. Initially, I focused on rendering the reflection of the background on the sphere's surface without considering lighting. In this case, I applied the cube map texture using the result of reflecting the toEye vector (normalized vector between the camera and the sphere's surface) with respect to the normal vector of the sphere's surface.

```glsl
vec3 toEye = normalize(viewPosition - posWorld);
    colour = texture(skybox, reflect(-toEye, normalWorld));
```

---

While there are various ways to implement Image-Based Lighting (IBL), it is common to use cube map textures and a technique similar to environment mapping. However, the specific content and usage of cube map textures can vary depending on the project's goals and design. In this example, I used Diffuse and Specular cube maps. The Diffuse cube map contains color information reflecting off objects in the environment, often the base color of the object. On the other hand, the Specular cube map primarily contains data related to the intensity and reflection direction when light interacts with the object's surface, often representing properties like metallicity and glossiness.

---

<img src="/img/image-based-lighting-2.jpg" width="48%">
<img src="/img/image-based-lighting-3.jpg" width="48%">

I got the Specular cubemap texture from [www.humus.name](http://www.humus.name), and I created the Diffuse cubemap texture based on it. I applied the Diffuse cubemap to the normal vectors of the sphere's surface, while I used the same technique as the previously implemented environment map for the Specular cubemap. However, I controlled the Specular cubemap's appearance by powering it with the material's shininess.

```glsl
vec3 toEye = normalize(viewPosition - posWorld);

vec4 diffuse = texture(diffuseCubemap, normalWorld);
vec4 specular = texture(skybox, reflect(-toEye, normalWorld));

specular *= pow((specular.x + specular.y + specular.z) / 3.0, material.shininess);

diffuse.xyz *= material.diffuse;
specular.xyz *= material.specular;

if(useTexture)
{
    diffuse *= texture(theTexture, TexCoord);
}

colour = diffuse + specular;
```

---

[Repository](https://github.com/waynechoidev/image-based-lighting/)
