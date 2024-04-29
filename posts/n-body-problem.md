---
title: "N-body problem"
date: "April 29, 2024"
category: "graphics"
tags: ["toyproject", "webgpu", "particles", "collision"]
excerpt: "simulated n-body problem with WebGPU compute shader..."
---

<img src="/img/n-body-problem.jpg" class="post-pic">

[Sample](https://waynechoidev.github.io/n-body-problem/) / [Repository](https://github.com/waynechoidev/n-body-problem/)

Recently, I heard that the Netflix series "3 Body Problem" is popular, so I decided to try implementing an N-body simulation using WebGPU.

I found that the largest observed multiple star system to date consists of 7 stars, so I constructed the simulation as a 7-body problem. Since I compute accelerations for all objects considering their distances and masses using a compute shader, I could increase the number of bodies as long as the GPU performance allows it, but I didn't increase it further because it didn't look aesthetically pleasing with too many bodies.

I followed Newton's equations as is but adjusted the gravitational constant to fit the screen size and speed. Collisions are not implemented separately, so stars can pass through each other.

Initially, there was an issue where position coordinates became NaN on Android mobile devices, which was due to floating-point precision. To use the f16 data type in WebGPU, a separate extension is required, which is not yet supported in Chrome for Android. So, for mobile devices, f32 data type needs to be used, but due to hardware limitations, computations are done with precision even lower than f16.

When the distance between objects became excessively close, on desktops, computations were precise enough to avoid such issues. However, on mobile devices, when that distance was recognized as 0, it caused problems in the formulas of the law of gravitation where the distance squared is divided and in normalizing distance vectors to obtain direction vectors, resulting in NaN values. So, I resolved this by clamping the distance values to small decimals recognizable on mobile devices to prevent them from reaching 0.

Below is the compute shader code for calculating the positions of objects.

```js
struct Vertex {
  @location(0) position: vec3f,
  @location(1) velocity: vec3f,
  @location(2) color: vec3f,
  @location(3) texCoord: vec2f,
  @location(4) radius: f32,
  @location(5) mass: f32,
};

@group(0) @binding(0) var<storage, read_write> objects: array<Vertex>;
@group(0) @binding(1) var<uniform> numOfObject: u32;
@group(0) @binding(2) var<uniform> delta: f32;

const MIN_DISTANCE: f32 = 0.0001;

@compute @workgroup_size(256) fn computeSomething(
    @builtin(global_invocation_id) global_invocation_id : vec3u,
) {
    let index = global_invocation_id.x;
    var body : Vertex = objects[index];
    var acceleration = vec3f(0.0, 0.0, 0.0);

    for (var i = 0u; i < numOfObject; i++) {
        if (i != index) {
            let other : Vertex = objects[i];
            let distance_vec = other.position - body.position;
            var distance = length(distance_vec);
            if (distance < MIN_DISTANCE) {
                distance = MIN_DISTANCE;
            }
            let force = (0.0006673 * body.mass * other.mass) / distance * distance;
            var direction = vec3(0.0, 0.0, 0.0);
            if (distance > MIN_DISTANCE) {
                direction = normalize(distance_vec);
            }
            acceleration += vec3(direction * force / body.mass);
        }
    }

    body.velocity += acceleration;
    body.position += body.velocity * delta;
    objects[index] = body;
}
```

For the graphics pipeline, I generated billboards from those positions in the compute shader, rotated them according to the camera direction, and then drew stars in the fragment shader. I referenced an [example made by "flight404" on ShaderToy](https://www.shadertoy.com/view/4dXGR4) for the fragment shader code but simplified it significantly.
