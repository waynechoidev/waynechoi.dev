---
title: "Fast fluid dynamics simulation"
date: "Sep 4, 2024"
category: "graphics"
tags: ["simulation", "webgpu", "math"]
excerpt: "implemented a fluid simulation by solving the Navier-Stokes equations using the Stable Fluids method..."
---

<img src="/img/fast-fluid-dynamics-simulation-01.jpg" class="post-pic"/>

[Sample](https://waynechoidev.github.io/stable-fluids/) / [Repository](https://github.com/waynechoidev/stable-fluids/)

I implemented a fast fluid dynamics simulation based on [Jos Stam's Stable Fluids](http://graphics.cs.cmu.edu/nsp/course/15-464/Fall09/papers/StamFluidforGames.pdf) with using WebGPU api. This post will briefly cover the mathematical aspects and primarily focus on the implementation. However, please note that all the code presented here has been simplified for explanation purposes, and the detailed implementation can be found in the repository linked above.

## 0. Mathematics

Before diving into the implementation of fluid simulation, it's important to briefly explore the mathematical foundations that underpin fluid dynamics. The primary equation that governs the motion of fluids is the Navier-Stokes equation.

### Navier-Stokes Equation

The Navier-Stokes equation is a partial differential equation that describes the conservation of momentum for fluid flow. In the case of incompressible fluids, it can be expressed as:

<img src="/img/fast-fluid-dynamics-simulation-01.svg" class="latex-long"/>

- **𝑢** represents the velocity field of the fluid.
- **𝑡** represents time.
- **𝜌** is the density of the fluid.
- **𝑝** represents pressure.
- **𝜈** is the kinematic viscosity (a measure of the fluid's resistance to flow).
- **F** represents external forces (such as gravity).

In this context, the term **𝑓** representing external forces is included in the equation but will be omitted in the subsequent discussion for simplicity. This equation serves as the core mathematical tool for describing the motion and behavior of fluids. By solving the Navier-Stokes equation, we can compute the fluid's velocity, pressure, and other properties, which are then used to simulate fluid motion.

To solve this, partial differential equations need to be numerically solved. The methods for this were explained in [a previous post](https://waynechoi.dev/post/heat-equation/) where the heat equation was implemented, which can be reviewed for more details.

## 1. Add impulse

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x:f32 = f32(id.x);
    let y:f32 = f32(id.y);
    let idx = getIdx(id.xy, size.width);

    if (constant.is_tracking == 1.0 ) {
        let dist = length(vec2f(f32(x), f32(y)) - constant.pos) / SRC_RADIUS;
        let scale = smootherstep(1.0 - dist, 0.0, 1.0);

        let velocity = velocity_buffer[idx] + constant.velocity * scale;
        let density = density_buffer[idx] + constant.density * scale;

        velocity_buffer[idx] = clampVelocity(velocity);
        density_buffer[idx] = density;
    }
}
```

Define the starting point and initial conditions for the fluid. Set the initial state of the fluid to establish the starting point of the simulation. At this stage, a smootherstep function was used to provide a more natural impulse.

## 2. Solve Navier-Stokes

### 2.1 Projection

The projection step involves calculating the pressure field and adjusting the velocity field to ensure the fluid flow is accurately simulated. This process aims to make the divergence of the velocity zero and uses the Poisson equation and Jacobi iteration to iteratively update the pressure field.

#### 2.1.1 Divergence

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy, size.width);

    let N:Neighbors = getNeighbors(x, y, size);

    divergence_buffer[idx] = 0.25 *
    (velocity_buffer[getIdx(N.right, size.width)].x - velocity_buffer[getIdx(N.left, size.width)].x +
    velocity_buffer[getIdx(N.up, size.width)].y - velocity_buffer[getIdx(N.down, size.width)].y);

    pressure_buffer[idx] = 0;
    temp_pressure_buffer[idx] = 0;
}
```

Calculating the divergence of the velocity field is a crucial step for pressure calculation. If there is divergence, the velocity field may not converge or may exhibit divergence, which requires pressure to correct.

In this case, since we are calculating the divergence on the vector field of velocity, the formula differs from that used in the heat equation. In the heat equation, the divergence was calculated from the vector field of pressure, which required the use of the Laplacian. However, since we are dealing with a vector field (velocity) that is already in gradient form, we can directly calculate the divergence without needing the Laplacian.

To prepare for the next step, the pressure buffers were initialized here.

#### 2.1.2 pressure disturbance

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy, size.width);

    let N:Neighbors = getNeighbors(x, y, size);

    pressure_output[idx] = (pressure_input[getIdx(N.right, size.width)] + pressure_input[getIdx(N.left, size.width)]
    + pressure_input[getIdx(N.up, size.width)] + pressure_input[getIdx(N.down, size.width)] - divergence[idx] * 4.0) * 0.25;
}
```

Pressure disturbance refers to small fluctuations or imbalances in the pressure field within fluid simulations. These disturbances can arise from changes in fluid velocity or external forces. To address pressure imbalances, the Poisson equation is used and numerically solved through Jacobi iteration. Jacobi iteration repeatedly updates the pressure field to minimize pressure disturbances, thereby adjusting the velocity field to accurately simulate the fluid's flow.

#### 2.1.3 Apply Pressure

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy, size.width);

    let N:Neighbors = getNeighbors(x, y, size);

    let gradient:vec2f = vec2f(
    (pressure_buffer[getIdx(N.right, size.width)] - pressure_buffer[getIdx(N.left, size.width)]),
    (pressure_buffer[getIdx(N.up, size.width)] - pressure_buffer[getIdx(N.down, size.width)])
    ) * 0.25;

    let velocity = velocity_buffer[idx] - gradient;

    velocity_buffer[idx] = clampVelocity(velocity);
}
```

The calculated pressure field is used to adjust the velocity field. In this process, the velocity field is modified according to the pressure differences, allowing the fluid flow to converge and the pressure distribution to be appropriately applied.

## 3. Viscous Diffusion

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy, size.width);

    let N:Neighbors = getNeighbors(x, y, size);

    let velocity = (velocity_input[idx]
    + constant.viscosity * constant.dt * (
    velocity_input[getIdx(N.right, size.width)] + velocity_input[getIdx(N.left, size.width)]
    + velocity_input[getIdx(N.up, size.width)] + velocity_input[getIdx(N.down, size.width)]
    )) / (1.0 + 4 * constant.viscosity * constant.dt);

    velocity_output[idx] = clampVelocity(velocity);
}
```

Viscosity diffusion is applied to smooth out the fluid's velocity and simulate the effects of viscosity. This step models the viscous term in the Navier-Stokes equation.

## 4. Post process

While not directly related to solving the Navier-Stokes equations, it plays a crucial role in making the simulation results more realistic and stable.

### 4.1 Density diffusion

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy, size.width);

    let N:Neighbors = getNeighbors(x, y, size);

    let density = (density_input[idx]
    + constant.viscosity * constant.dt * (
    density_input[getIdx(N.right, size.width)] + density_input[getIdx(N.left, size.width)]
    + density_input[getIdx(N.up, size.width)] + density_input[getIdx(N.down, size.width)]
    )) / (1.0 + 4 * constant.viscosity * constant.dt);

    density_output[idx] = density;
}
```

Density diffusion is the process of smoothing out density variations in fluid simulation to enhance both stability and realism. By gradually adjusting density changes, it helps prevent instability in the simulation. For computational efficiency, it was implemented in the same shader program used for viscous diffusion.

### 4.2 Vorticity

Calculate the vorticity of the fluid to achieve a more realistic flow. By adding the rotation (or vortices) of the fluid, the physical accuracy of the simulation is enhanced.

#### 4.2.1 Compute vorticity

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy, size.width);

    let N:Neighbors = getNeighbors(x, y, size);

    vorticity_buffer[idx] = 0.25 *
    (velocity_buffer[getIdx(N.right, size.width)].x - velocity_buffer[getIdx(N.left, size.width)].x +
    velocity_buffer[getIdx(N.up, size.width)].y - velocity_buffer[getIdx(N.down, size.width)].y);
}
```

#### 4.2.2 Confine vorticity

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy, size.width);

    let N:Neighbors = getNeighbors(x, y, size);

    let dx = vec2f(1.0 / f32(size.width), 1.0 / f32(size.height));

    let eta = vec2f((abs(vorticity_buffer[getIdx(N.right, size.width)]) - abs(vorticity_buffer[getIdx(N.left, size.width)])) / (2.0 * f32(x)),
                    (abs(vorticity_buffer[getIdx(N.up, size.width)]) - abs(vorticity_buffer[getIdx(N.down, size.width)])) / (2.0 * f32(y)));

    if (length(eta) < 1e-5){
        return;
    }

    let psi = vec3f(normalize(eta).xy, 0.0);
    let omega = vec3f(0, 0, vorticity_buffer[idx]);

    let velocity = velocity_buffer[idx] + 0.2 * cross(psi, omega).xy * dx;

    velocity_buffer[idx] = clampVelocity(velocity);
}
```

### 4.3 Density dissipation

```js
density_buffer[idx] = max(
  density_buffer[idx] - vec4f(DISSIPATION_FACTOR),
  vec4f(0.0)
);
```

Energy dissipation is applied to maintain simulation stability and ensure physical accuracy. This process involves adding artificial dissipation of density, which creates the effect of the fluid gradually disappearing naturally, and was applied when adding impulses.

## 5. Textures

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy, size.width);

    let velocity:vec2f = velocity_buffer[idx];
    let density:vec4f = density_buffer[idx];

    textureStore(velocity_texture, vec2<i32>(i32(x), i32(y)), encodeVelocity(velocity));
    textureStore(density_texture, vec2<i32>(i32(x), i32(y)), density);
}
```

Before performing advection, it is necessary to transfer the density buffer and velocity buffer to textures. This is because when advection is performed using a sampler, interpolation is applied, which allows for efficient extraction of density and velocity values from the textures and leads to more accurate fluid flow simulation. If advection is performed directly on storage buffers without interpolation, irregular results such as the staircasing effect shown in the image below may occur.

<img src="/img/fast-fluid-dynamics-simulation-02.jpg" class="post-pic"/>

One additional point to note is that when storing velocity in a texture, it must be normalized to the 0–1 range to handle negative values. Otherwise, due to the texture's limitation in storing negative values, the velocity would always point only to the right or upwards. For more stable encoding and decoding, the velocity is always clamped to the range of -1 to 1. The following set of functions is used for these tasks.

```js
// clamp velocity between -1 and 1
fn clampVelocity(v: vec2f) -> vec2f {
    return clamp(v, vec2f(-1.0), vec2f(1.0));
}

// encode velocity with -1..1 range to texture with 0..1 range
fn encodeVelocity(v: vec2f) -> vec4f {
    return vec4f(v * 0.5 + 0.5, 0, 0);
}

// decode texture with 0..1 range to velocity with -1..1 range
fn decodeVelocity(v: vec4f) -> vec2f {
    return v.xy * 2.0 - 1.0;
}
```

## 6. Advection

```js
@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = f32(id.x);
    let y = f32(id.y);
    let idx = getIdx(id.xy, size.width);
    let pos = vec2<f32>((x + 0.5)/f32(size.width), (y + 0.5)/f32(size.height));

    let velocity = velocity_buffer[idx];

    let dt = constant.dt * 0.0001;
    let pos_back = pos - velocity * dt;

    var back_velocity:vec2f = decodeVelocity(textureSampleLevel(temp_velocity_texture, my_sampler, pos_back, 0));
    back_velocity = clampVelocity(back_velocity);
    let back_density:vec4f = textureSampleLevel(temp_density_texture, my_sampler, pos_back, 0);

    textureStore(velocity_texture, vec2<i32>(i32(x), i32(y)), encodeVelocity(back_velocity));
    textureStore(density_texture, vec2<i32>(i32(x), i32(y)), back_density);

    velocity_buffer[idx] = clampVelocity(back_velocity);
    density_buffer[idx] = back_density;
}
```

Advection describes the process by which fluids or other physical quantities move according to their velocity. Simply put, it deals with how substances move with the flow of the fluid. Here, the Semi-Lagrangian method was used to numerically solve advection. This method involves tracking the movement of material particles according to the velocity field and calculating their values at new positions.

In this process, to handle the movement of the material, the position was adjusted by adding 0.5 to each axis, starting from the center of the grid. Finally, to render the results, the target texture and the velocity and density buffers for the next frame's calculations are updated. To prevent data race conditions, the density texture and render target texture are kept separate.

## Conclusion

By following this sequence in fluid simulation, you can effectively model the physical properties and flow of the fluid. Each step enhances the accuracy of the simulation and helps to accurately represent the dynamic characteristics of the fluid.

### References

- [Introduction to Computer Graphics with DirectX 11 - Part 4. Computer Animation](https://honglab.co.kr/courses/graphicspt4)
- [GPU Gems](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu)
- [Wikipedia](<https://en.wikipedia.org/wiki/Projection_method_(fluid_dynamics)>)
- [Real-Time Fluid Dynamics for Games - Jos Stam](http://graphics.cs.cmu.edu/nsp/course/15-464/Fall09/papers/StamFluidforGames.pdf)
