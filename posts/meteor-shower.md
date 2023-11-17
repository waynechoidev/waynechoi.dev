---
title: "Meteor shower"
date: "Nov 17, 2023"
category: "graphics"
tags: ["toyproject", "opengl", "transformfeedback", "geometryshader"]
excerpt: "Implemented meteor shower with GPGPU via Transform Feedback in OpenGL..."
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/V2BDsedF-BY?si=pH9mWDPtk-olyTXg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

This post provides an overview of the overall concept and key implementation points behind creating a meteor shower simulation using OpenGL. It highlights important concepts and crucial implementation details without providing a step-by-step tutorial. So it might be challenging to reconstruct this project with the provided code. The complete code can be found at the repository link provided at the end.

---

## GPGPU with Transform Feedback

Transform Feedback is a feature in OpenGL that allows retrieving computed data from the GPU back into buffers. This enables updating vertex positions or computing other data and writing it to buffers. By swapping buffers, the GPU computes the data and writes it into a buffer without retrieving it to the CPU.

In this context, rather than fetching buffer data to the CPU, the approach involves swapping between two buffers. Within a single frame, one buffer undergoes GPGPU operations, updating vertex positions via the vertex shader, utilizing transform feedback to update that buffer. Meanwhile, the other buffer handles rendering those updated vertices onto the screen.

---

First, I created Vertex Buffer Objects (VBOs) and Vertex Array Objects (VAOs), initializing both VBOs with the same initial values. The position vertices included here represent individual entities, using points as the primitive type. I bound the respective VBOs to the VAO according to their indices. In reality, there are more STATIC_DRAW VBOs required for computations or rendering. However, for brevity, I omitted them in this explanation.

```c++
// std::vector<GLfloat> positions...

// Generate VBOs
GLuint positionVBO[2];
glGenBuffers(2, positionVBO);
for (GLint i = 0; i < 2; ++i)
{
	glBindBuffer(GL_ARRAY_BUFFER, positionVBO[i]);
	glBufferData(GL_ARRAY_BUFFER, sizeof(GLfloat) * positions.size(), positions.data(), GL_DYNAMIC_DRAW);

	glBindBuffer(GL_ARRAY_BUFFER, 0);
}

// Generate VAOs
GLuint drawPositionVAO[2];
glGenVertexArrays(2, drawPositionVAO);
for (GLint i = 0; i < 2; ++i) {
	glBindVertexArray(drawPositionVAO[i]);

	glBindBuffer(GL_ARRAY_BUFFER, positionVBO[i]);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(GLfloat), (GLvoid*)0);

	glBindVertexArray(0);
}

GLuint computePositionVAO[2];
glGenVertexArrays(2, computePositionVAO);
for (GLint i = 0; i < 2; ++i) {
	glBindVertexArray(computePositionVAO[i]);

	glBindBuffer(GL_ARRAY_BUFFER, positionVBO[i]);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(GLfloat), (GLvoid*)0);

	glBindVertexArray(0);
}
```

---

This section sets up and generates Transform Feedback. Unlike WebGL, in OpenGL, it's necessary to explicitly specify which variables from the shader will be recorded in the Transform Feedback. Here, we're using the "newPosition" variable. Then, we generate objects for Transform Feedback and bind buffers (previously created VBOs) to these objects to enable recording data into them.

```c++
// GLuint ProgramID...
const GLchar* feedbackVaryings[] = { "newPosition" };
glTransformFeedbackVaryings(programID, 1, feedbackVaryings, GL_INTERLEAVED_ATTRIBS);
glLinkProgram(programID);

// Generate Transform feedbacks
GLuint transformFeedback[2];
glGenTransformFeedbacks(2, transformFeedback);
for (int i = 0; i < 2; ++i) {
	glBindTransformFeedback(GL_TRANSFORM_FEEDBACK, transformFeedback[i]);
	glBindBufferBase(GL_TRANSFORM_FEEDBACK_BUFFER, 0, positionVBO[i]);
}
```

---

In the main loop, two steps are executed. In the 'Compute Position' step, the position is calculated and stored via Transform Feedback. During this process, rasterization is turned off (for Transform Feedback), and the results are recorded into the corresponding buffer. Then, in the 'Draw' step, the updated positions are retrieved from another buffer and displayed on the screen. To achieve this, the flag variable is toggled every loop iteration to swap the buffers used for updating and rendering.

```c++
GLint swapFlag = 0;
while (!mainWindow.getShouldClose())
{
	swapFlag = swapFlag ? 0 : 1;

	// Compute position
	computeProgram.use();
	glUniform1f(deltaTimeLoc, deltaTime);

	glBindVertexArray(computePositionVAO[swapFlag ? 0 : 1]);
	glEnable(GL_RASTERIZER_DISCARD);

	glBindTransformFeedback(GL_TRANSFORM_FEEDBACK, transformFeedback[swapFlag]);
	glBeginTransformFeedback(GL_POINTS);
	glDrawArrays(GL_POINTS, 0, NUM_OF_PARTICLES);
	glEndTransformFeedback();

	glDisable(GL_RASTERIZER_DISCARD);
	glBindTransformFeedback(GL_TRANSFORM_FEEDBACK, 0);

	// Draw
	drawProgram.use();
	glUniform1f(currentTimeLoc, currentFrameTime);

	glBindVertexArray(drawPositionVAO[swapFlag]);
	glDrawArrays(GL_POINTS, 0, NUM_OF_PARTICLES);
	glBindVertexArray(0);
}
```

---

The following code is a vertex shader responsible for computing updates to vertices. It takes a scalar value for speed instead of vector, and forcing vertices to move unilaterally at a 45-degree angle towards the bottom left. When vertices exceed the screen boundaries, they reset to their original positions. While currently displayed as points, their rendering generates length, thus requiring the screen width to be expanded to accommodate this effect.

```glsl
#version 420

in vec2 position;
in float speed;

uniform float deltaTime;
uniform vec2 windowSize;

out vec2 newPosition;

void main()
{
    float expansionRatio = 1.2;

    vec2 newPositionTemp = position + vec2(-speed) * deltaTime;

    vec2 expandedWindowSize = windowSize * expansionRatio;
    vec2 adjustedPosition = mod(newPositionTemp, expandedWindowSize);

    // Wrap around if position is outside the window bounds
    adjustedPosition = mix(adjustedPosition, adjustedPosition - expandedWindowSize, step(windowSize, adjustedPosition));

    newPosition = adjustedPosition;
}
```

---

## Geometry Shader

I decided to handle operations using points for convenience and delegate details for drawing to the geometry shader. Initially, I intended to draw lines for simplicity, but that seemed too uniform. Consequently, I opted to draw billboards in the geometry shader and manage intricate details in the fragment shader.

Similar to before, I didn't take directional input but received a scalar float value named 'distance.' Based on this, I decided to draw smaller billboards as the distance increased. However, to maintain compatibility with the movement at a 45-degree angle, regardless of the screen's aspect ratio, I received the resolution as a uniform to adjust the proportions and draw billboards as perfect squares.

```glsl
#version 420

layout(points) in;
layout(triangle_strip, max_vertices = 4) out;

in float distanceVal[];
in vec3 color[];

out vec2 texCoord;
out vec3 colorValue;
out float distanceValue;

uniform vec2 resolution;

void main() {
    vec4 bottomLeftVertex = gl_in[0].gl_Position;;
    vec4 topRightVertex = bottomLeftVertex + vec4(-1.0 * resolution.y / resolution.x, -1.0, 0.0, 0.0) * distanceVal[0];

    // Bottom Left
    gl_Position = bottomLeftVertex;
    texCoord = vec2(0.0,0.0);
    colorValue = color[0];
    distanceValue = distanceVal[0];
    EmitVertex();

    // Bottom Right
    gl_Position = vec4(topRightVertex.x, bottomLeftVertex.y, 0.0, 1.0);
    texCoord = vec2(1.0,0.0);
    colorValue = color[0];
    distanceValue = distanceVal[0];
    EmitVertex();

    // Top Left
    gl_Position = vec4(bottomLeftVertex.x, topRightVertex.y, 0.0, 1.0);
    texCoord = vec2(0.0,1.0);
    colorValue = color[0];
    distanceValue = distanceVal[0];
    EmitVertex();

    // Top Right
    gl_Position = topRightVertex;
    texCoord = vec2(1.0,1.0);
    colorValue = color[0];
    distanceValue = distanceVal[0];
    EmitVertex();

    EndPrimitive();
}
```

---

## Fragment Shader

In the fragment shader, I implemented the rendering of meteors with distinct components: the central meteor, its glow, and the tail. I didn't just receive positions but also randomly generated color values to create a variety of colored meteors. To achieve a flickering effect, I used the time value as a uniform and applied a sine function to modulate brightness. However, I encountered uniform flickering across all meteors, which seemed odd. To address this, I applied the sine function to the distance variable as well, introducing variation and diversifying the flickering effect.

```glsl
#version 420

in vec3 colorValue;
in vec2 texCoord;
in float distanceValue;

uniform float currentTime;
uniform vec2 resolution;

out vec4 color;



float circle(vec2 st, vec2 center, float radius) {
    float distance = length(st - center);

    if (distance > radius*0.9) return 0.0;

    return 1.0;
}

float glow(vec2 st, vec2 center, float radius) {
    float distance = length(st - center);
    return 1.0 - smoothstep(radius * 0.5, radius * 3.0, distance);
}

float tail(vec2 st, vec2 center, float radius) {
    if (st.x + st.y < center.x + center.y) return 0.0;
    return smoothstep(radius * 0.5, 0.0, abs(st.y - st.x) * (st.x + radius * 10.0));
}

void main() {
	vec2 st = texCoord;
    st.x = 1.0 - st.x;
    st.y = 1.0 - st.y;

    vec2 center = vec2(0.05, 0.05);
    float radius = 0.02;

    float pct = circle(st, center, radius) + glow(st, center, radius) + tail(st, center, radius);
    float brightness = 0.7 + 0.3 * sin(currentTime * distanceValue * 10.0);

    color = vec4(pct * colorValue * brightness, 1.0);

    if (dot(color.rgb, vec3(1.0)) - 0.1 < 0.0) {
    discard;
    }

}
```

---

## Conclusion

I've had an experience implementing transform feedback in WebGL, but its API usage differs significantly. Moreover, finding examples using transform feedback was challenging, possibly due to the prevalence of compute shaders. During the initial setup, I struggled a bit due to the scarcity of examples.

Often, I found myself amazed by the incredible implementations showcased on shader toy. Observing those mesmerizing examples, I couldn't help but wonder how they achieved such effects. Finally, getting the chance to implement something simple on my own felt rewarding.

---

[Repository](https://github.com/waynechoidev/meteor-shower/)
