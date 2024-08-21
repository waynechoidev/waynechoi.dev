---
title: "Heat equation with WebGPU"
date: "Aug 21, 2024"
category: "graphics"
tags: ["simulation", "webgpu", "math"]
excerpt: "simulated heat equation with WebGPU compute shader..."
---

<img src="/img/heat-equation-01.jpg" class="post-pic"/>

[Sample](https://waynechoidev.github.io/heat_equation/) / [Repository](https://github.com/waynechoidev/heat_equation/)

The Heat Equation is an important partial differential equation that models the phenomenon of heat conduction. I have implemented it using Compute Shaders in WebGPU. In this post, I will introduce the theoretical background of the Heat Equation, the method of solving it numerically, and how I implemented it in WGSL shader code.

## Heat Equation

The Heat Equation is a partial differential equation of the following form:

<img src="/img/heat-equation-01.svg" class="latex"/>

Here, u(i, j, t) represents the temperature distribution, and α is the thermal conductivity. This equation describes how the distribution of heat changes over time.

## Gradient

The gradient represents both the direction and magnitude of the rate of change of a vector field. In 2D, the gradient is defined as follows:

<img src="/img/heat-equation-02.svg" class="latex"/>

The gradient indicates the rate of change of the temperature distribution 𝑢 and provides the direction of the maximum temperature change at a specific point.

## Divergence

Divergence provides a scalar value that indicates the extent of expansion or contraction in a vector field. In 2D, divergence is defined as follows:

<img src="/img/heat-equation-03.svg" class="latex"/>

Here, F is the vector field. Divergence measures how much the vector field spreads out or converges at a given point.

## Laplacian

The Laplacian is defined as the divergence of the gradient and represents the curvature of a scalar field. In 2D, the Laplacian is defined as follows:

<img src="/img/heat-equation-04.svg" class="latex"/>

The Laplacian measures the rate of temperature change at a given point and is a crucial component of the Heat Equation.

## Analytical Methods vs. Numerical Methods

Analytical methods involve solving mathematical equations exactly. These methods can provide precise solutions for specific equations, but they may not be practical for complex or multidimensional problems. Partial differential equations, such as the Heat Equation, are often difficult to solve analytically, which is why numerical methods are used to obtain approximate solutions.

Numerical methods involve using computers to approximate solutions to equations. This approach discretizes the equations and uses iterative calculations to find approximate solutions. The advantage of numerical methods is that they are practical and efficient for finding solutions to complex problems.

## Finite Difference Method

The Finite Difference Method is a prominent technique for numerically solving partial differential equations such as the Heat Equation. Here’s a general overview of the method:

1. Grid Setup: Divide the problem domain into a grid. For a 2D space, this involves dividing the area into a lattice of square grid points where the temperature will be computed.

2. Laplacian Calculation: Update the temperature values at each grid point. To approximate the Laplacian at each grid point, the method uses finite differences to estimate spatial changes in temperature. Below is a table showing the definitions of various differential operators used in mathematical analysis and their finite difference forms.

|  Operator  |               Definition                |         Finite Difference Form          |
| :--------: | :-------------------------------------: | :-------------------------------------: |
|  Gradient  | <img src="/img/heat-equation-02.svg" /> | <img src="/img/heat-equation-05.svg" /> |
| Divergence | <img src="/img/heat-equation-03.svg" /> | <img src="/img/heat-equation-06.svg" /> |
| Laplacian  | <img src="/img/heat-equation-04.svg" /> | <img src="/img/heat-equation-07.svg" /> |

Given that the values at neighboring grid points differ by 1 unit and the grid spacing Δx and Δ𝑦 are both 2, I simplified the finite difference formula accordingly. Here’s how I implemented it in WGSL:

```js
#include "common.wgsl"
@group(0) @binding(0) var<storage, read_write> srcBuffer: array<f32>;
@group(0) @binding(1) var<storage, read_write> divergence: array<f32>;

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy);

    let left = vec2u(clamp(x-1, 0, TEX_SIZE), y);
    let right = vec2u(clamp(x+1, 0, TEX_SIZE), y);
    let up = vec2u(x, clamp(y+1, 0, TEX_SIZE));
    let down = vec2u(x, clamp(y-1, 0, TEX_SIZE));

    divergence[idx] = (srcBuffer[getIdx(right)] + srcBuffer[getIdx(left)]
    + srcBuffer[getIdx(up)] + srcBuffer[getIdx(down)] - 4 * srcBuffer[idx]) * 0.25;
}
```

## Jacobi Method

The Jacobi Method is an iterative technique used to solve systems of linear equations, and it is applied to solve the discretized Heat Equation through finite difference methods. This method typically produces smoother results for temperature distributions. The basic procedure for the Jacobi Method is as follows:

1. Compute Divergence: Before updating temperatures, calculate the divergence (or Laplacian) of the temperature field. This step involves precomputing the divergence values which will be used in the temperature update formula.

2. Update Formula: Use the precomputed divergence to iteratively update the temperature values at each grid point. Here's how it can be expressed in a simplified equation through the following derivation:

<img src="/img/heat-equation-08.svg" class="latex-long"/>

<img src="/img/heat-equation-09.svg" class="latex-long"/>

<img src="/img/heat-equation-10.svg" class="latex-long"/>

Here's how it was implemented in WGSL using the simplified formula. Two buffers were used and alternated for computation, and a small constant was applied to adjust the scale due to some error in the simulation.

```js
#include "common.wgsl"
@group(0) @binding(0) var<storage, read_write> targetBuffer: array<f32>;
@group(0) @binding(1) var<storage, read_write> tempBuffer: array<f32>;
@group(0) @binding(2) var<storage, read_write> divergence: array<f32>;

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy);

    let left = vec2u(clamp(x-1, 0, TEX_SIZE), y);
    let right = vec2u(clamp(x+1, 0, TEX_SIZE), y);
    let up = vec2u(x, clamp(y+1, 0, TEX_SIZE));
    let down = vec2u(x, clamp(y-1, 0, TEX_SIZE));

    let divergetmzpdlfnceScale = 0.25;

    targetBuffer[idx] = (tempBuffer[getIdx(right)] + tempBuffer[getIdx(left)]
    + tempBuffer[getIdx(up)] + tempBuffer[getIdx(down)] - divergence[idx] * 4.0 * divergenceScale) * 0.25;
}
```

## Conclusion

The numerical approach to the Heat Equation is an effective method for solving complex problems where analytical solutions are difficult to obtain. By approximating spatial changes through finite difference methods and employing iterative techniques such as the Jacobi Method to solve linear equations, the Heat Equation can be approached practically. These numerical approaches can be applied not only to fluid simulations but also to various physical phenomena such as heat conduction and electric field calculations.

### References

- [Introduction to Computer Graphics with DirectX 11 - Part 4. Computer Animation](https://honglab.co.kr/courses/graphicspt4)
- [GPU Gems](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu)
- [Wikipedia](<https://en.wikipedia.org/wiki/Projection_method_(fluid_dynamics)>)
- [Real-Time Fluid Dynamics for Games - Jos Stam](http://graphics.cs.cmu.edu/nsp/course/15-464/Fall09/papers/StamFluidforGames.pdf)
