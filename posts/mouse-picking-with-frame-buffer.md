---
title: "Mouse picking with Frame Buffer"
date: "Nov 2, 2023"
category: "graphics"
tags: ["opengl", "framebuffer", "picking", "cpp"]
excerpt: "Implemented mouse picking using OpenGL Frame Buffer Object."
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/9DOjirWzVe4?si=MsVCXpoV4rfBZ4qR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

I have implemented mouse picking using OpenGL. I used the Frame Buffer Object (FBO) to detect collisions for picking. FBO is a powerful feature in OpenGL that allows you to render a scene to a texture rather than the default framebuffer. This capability is crucial for various purposes, including off-screen rendering, post-processing effects, and even General-Purpose computing on Graphics Processing Units (GPGPU). In the context of mouse picking, rendering the scene to an FBO enables us to easily retrieve pixel information, which in turn helps us identify objects under the mouse cursor during mouse picking operations.

---

First, I generated and bound a Frame Buffer (FBO). Then, I created and bound a texture. By attaching the texture to the FBO, the FBO could store rendering results in memory instead of displaying them directly on the screen. This allowed me to perform rendering operations for other purposes, such as off-screen rendering or post-processing, without directly affecting what was visible on the screen. This separation between rendering and displaying provided greater flexibility in graphics and computation tasks.

```cpp
GLuint framebuffer;
glGenFramebuffers(1, &framebuffer);
glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);
GLuint texture;
glGenTextures(1, &texture);
glBindTexture(GL_TEXTURE_2D, texture);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, WIDTH, HEIGHT, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture, 0);
glBindTexture(GL_TEXTURE_2D, 0);
glBindFramebuffer(GL_FRAMEBUFFER, 0);

```

---

At this stage, I ensured that the shader had the necessary information by providing it with two crucial uniforms. The first uniform served the purpose of specifying a distinct index color, specifically assigned to individual objects. This color acted as a means of identification, allowing the shader to differentiate between objects efficiently. The second uniform conveyed a boolean value, serving as an indicator of whether the rendering process was occurring off-screen or within the default frame buffer. This distinction was vital for tailoring the shader's behavior and adapting it to the specific rendering context.

```cpp
// cpp
GLuint useFBOUniform = glGetUniformLocation(programID, "useFBO");
GLuint indexColorUniform = glGetUniformLocation(programID, "indexColor");

glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);
glUniform1i(useFBOUniform, 1);
glUniform3f(indexColorUniform, 1.0f, 0.0f, 0.0f);

object.draw();
```

---

At this point, the behavior in the fragment shader is determined by the value of 'useFBO.' As you can see in the code below, if 'useFBO' is true, indicating off-screen rendering, the shader processes the index color as part of the off-screen rendering workflow. On the other hand, if 'useFBO' is false, indicating direct rendering to the screen, the shader switches to an alternative mode.

```glsl
// glsl
out vec4 color;

uniform bool useFBO;
uniform vec3 indexColor;

// res is result for texture and lighting

if(useFBO) color = vec4(indexColor, 1.0);
else color = vec4(res, 1.0);
```

---

While the FBO is bound, and objects are being rendered within this context, it's important to note that you have the capability to utilize the 'glReadPixels' function. This function enables you to capture and subsequently retrieve the RGB values of a specific pixel. This color data corresponds to the previously assigned index color, and it plays a fundamental role in the process of identifying the selected object. By reading and decoding the pixel's RGB values, you can accurately determine which object was interactively picked during mouse interactions.

```cpp
glm::vec2 cursor = mainWindow.getCursor();
int x = (int)cursor.x;
int y = (int)cursor.y;

unsigned char pickedColor[3];
glReadPixels(x, y, 1, 1, GL_RGB, GL_UNSIGNED_BYTE, pickedColor);

glBindFramebuffer(GL_FRAMEBUFFER, 0);
glUniform1i(useFBOUniform, 0);
```

---

Subsequently, you can perform various operations by comparing the captured color values from the CPU with the object's index color. I accomplished this by sending a comparison boolean value as a uniform to the shader. When the two values match, the object changes color to the index color. The provided code is a simplified version created for the purpose of understanding, and many details have been omitted. The code available at the repository link below may differ significantly from the code in the main text, as it could include texture mapping, materials, lighting, and some additional abstractions. You can find the code at the repository link for a more comprehensive and detailed implementation.

---

[Repository](https://github.com/waynechoidev/mouse-picking-frame-buffer/)
