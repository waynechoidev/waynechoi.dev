---
title: "Terrain"
date: "Sep 11, 2024"
category: "graphics"
tags: ["simulation", "webgpu", "noise"]
excerpt: "Terrain Generation and Rendering Based on Perlin Noise Using WebGPU..."
---

<img src="/img/terrain.jpg" class="post-pic"/>

[Sample](https://waynechoidev.github.io/terrain/) / [Repository](https://github.com/waynechoidev/terrain/)

I implemented terrain generation based on Perlin noise using WebGPU. Additionally, I added diverse effects such as shadows to enhance the visual richness, and I'll briefly explain the process.

## 1. Perlin noise

```js
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = id.x;
    let y = id.y;
    let idx = getIdx(id.xy);

    let uv = vec2<f32>(f32(x) / f32(TEX_SIZE) + uni.progress, f32(y) / f32(TEX_SIZE));

    var height = noise_sum(uv, mat2x2<f32>(231.1, 283.7, 143.8, 113.3), 14232.34234);
    height = (height + 1.0) * 0.5;

    var color = noise_sum(uv, mat2x2<f32>(423.5, 342.3, 153.7, 342.5), 18473.58352);
    color = (color + 1.0) * 0.5;

    textureStore(noise_texture, vec2<i32>(i32(x), i32(y)), vec4<f32>(height, color, 0, 255));
}

fn hash22(p: vec2<f32>, mat: mat2x2<f32>, scale: f32) -> vec2<f32> {
    let temp_p = p * mat;
    let p_transformed = -1.0 + 2.0 * fract(sin(temp_p) * scale);
    return sin(p_transformed * 6.283);
}

fn perlin_noise(p: vec2<f32>, mat: mat2x2<f32>, scale: f32) -> f32 {
    let pi = floor(p);
    let pf = p - pi;
    let w = pf * pf * (3.0 - 2.0 * pf);

    let f00 = dot(hash22(pi + vec2<f32>(0.0, 0.0), mat, scale), pf - vec2<f32>(0.0, 0.0));
    let f01 = dot(hash22(pi + vec2<f32>(0.0, 1.0), mat, scale), pf - vec2<f32>(0.0, 1.0));
    let f10 = dot(hash22(pi + vec2<f32>(1.0, 0.0), mat, scale), pf - vec2<f32>(1.0, 0.0));
    let f11 = dot(hash22(pi + vec2<f32>(1.0, 1.0), mat, scale), pf - vec2<f32>(1.0, 1.0));

    let xm1 = mix(f00, f10, w.x);
    let xm2 = mix(f01, f11, w.x);
    let ym = mix(xm1, xm2, w.y);

    return ym;
}

fn noise_sum(p: vec2<f32>, mat: mat2x2<f32>, scale: f32) -> f32 {
    var p_scaled = p * 4.0;
    var a = 1.0;
    var r = 0.0;
    var s = 0.0;

    for (var i = 0; i < 5; i = i + 1) {
        r = r + a * perlin_noise(p_scaled, mat, scale);
        s = s + a;
        p_scaled = p_scaled * 2.0;
        a = a * 0.5;
    }

    return r / s;
}
```

Perlin noise is a noise function designed to model randomness as seen in nature. Unlike simple random values, it uses gradient vectors at each point in space to create continuous and smooth noise patterns. This approach allows for more natural and consistent randomness.

In this code, two channels of Perlin noise are generated and stored in a single texture. These channels are used to create the terrain's height and color. By using different constants, the intention is to achieve a more diverse result.

The random function used here is not truly random but pseudorandom. By adding a uniform "progress" value based on the UV coordinates over time, it creates a more natural flow.

## 2. Normal vector generation based on heightmap

```js
fn main(@builtin(global_invocation_id) id: vec3u) {
    let x = f32(id.x);
    let y = f32(id.y);

    let size = f32(TEX_SIZE);

    // Define neighboring coordinates with wrap-around logic
    var left = vec2f((x - 1.0) / size, y / size);
    var right = vec2f((x + 1.0) / size, y / size);
    var down = vec2f(x / size, (y - 1.0) / size);
    var up = vec2f(x / size, (y + 1.0) / size);

    // Wrap around edges to handle boundary conditions
    if (x == 0.0) {
        left.x = (size - 1.0) / size;
    }
    if (x == size - 1.0) {
        right.x = 0.0;
    }
    if (y == size - 1.0) {
        up.y = 0.0;
    }
    if (y == 0.0) {
        down.y = (size - 1.0) / size;
    }

    // Sample height values from the texture
    let left_val:f32 = textureSampleLevel(noise_texture, my_sampler, left, 0).r;
    let right_val:f32 = textureSampleLevel(noise_texture, my_sampler, right, 0).r;
    let up_val:f32 = textureSampleLevel(noise_texture, my_sampler, up, 0).r;
    let down_val:f32 = textureSampleLevel(noise_texture, my_sampler, down, 0).r;

    // Compute gradient vectors
    let dx = vec3f(2.0 / size, 0.0, (right_val - left_val) * uni.height_scale);
    let dy = vec3f(0.0, 2.0 / size, (up_val - down_val) * uni.height_scale);

    // Calculate normal vector using cross product
    let normal = normalize(cross(dx, dy));

    // Store the computed normal vector in the normal texture
    textureStore(normal_texture, vec2<i32>(i32(x), i32(y)), vec4f(normal, 0.0));
}

// Cross product function for vec3f
fn cross(a: vec3f, b: vec3f) -> vec3f {
    return vec3f(
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x
    );
}
```

I calculated the normal vectors using height information from the heightmap. First, I computed the gradient vectors dx and dy through partial derivatives based on the neighboring grid information in the up, down, left, and right directions. Then, I calculated the normal vector by taking the cross product of these two gradient vectors and stored the result in a separate texture.

## 3. Vertex shader: Sampling and Transforming Normals, Height, and Color from Textures

```js
@vertex fn vs(
  input: Vertex,
) -> VSOutput {
  var output: VSOutput;

  let normal = textureSampleLevel(normal_map, my_sampler, input.tex_coord, 0);

  let noise = textureSampleLevel(noise_map, my_sampler, input.tex_coord, 0);
  let height = noise.r;
  let color = noise.g;

  var position = input.position;
  position.z = scale_to_range(height, 0, uni.height_scale);

  output.position = matrix_uni.projection * matrix_uni.view * matrix_uni.model * vec4f(position, 1.0);
  output.pos_world = (matrix_uni.model * vec4f(position, 1.0)).xyz;
  output.normal_world = normalize(matrix_uni.inv_transposed_model * normal).xyz;
  output.height = height;
  output.color = color;

  return output;
}
```

In the vertex shader, I sample the normal vector and height from the normal_map and noise_map textures, respectively. The normal vector is transformed using the inverse transposed model matrix to obtain the world-space normal vector, which is then passed to the fragment shader. The height value is used to adjust the z coordinate of the vertex, thereby modifying the terrain's elevation. Additionally, the color extracted from the noise_map is passed along to the fragment shader for surface coloring.

## 4. Fragment shader: Visual Effects

```js
@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var albedo = mix(uni.color_1, uni.color_2, vec3f(input.color));

    // snow
    if(input.height > uni.snow_height) {
        albedo = vec3f(1.0);
    }

    let ambient_occlusion = pow(vec3f(input.height), vec3f(3.0));

    var material:Material;
    material.ambient = 0.1;
    material.shininess = 1.0;
    material.diffuse = 1.0;
    material.specular = 1.0;

    var light:Light;
    light.direction = normalize(vec3f(-0.5, -0.5, -1.0));
    light.strength = 3.0;

    let cam_pos:vec3f = vec3f(0.0, 0.0, 2.5);
    let to_eye:vec3f = normalize(cam_pos - input.pos_world);
    let global_light = computeDirectionalLight(light, material, input.normal_world, to_eye);

    let color = albedo * ambient_occlusion * global_light;

    return vec4f(color, 1.0);
}


fn blinnPhong(material:Material, light_strength: vec3<f32>, light_vec: vec3<f32>, normal: vec3<f32>, to_eye: vec3<f32>) -> vec3<f32> {
    let halfway = normalize(to_eye + light_vec);
    let hdotn = dot(halfway, normal);
    let specular = material.specular * pow(max(hdotn, 0.0), material.shininess);
    return material.ambient + (material.diffuse + specular) * light_strength;
}

fn computeDirectionalLight(light:Light, material:Material, normal: vec3<f32>, to_eye: vec3<f32>) -> vec3<f32> {
    let light_vec = -light.direction;
    let ndotl = max(dot(light_vec, normal), 0.0);
    let light_strength = vec3f(light.strength) * ndotl;

    return blinnPhong(material, light_strength, light_vec, normal, to_eye);
}
```

Color noise was used to blend two colors, creating a more natural texture. In the Vertex Shader, world-space normals were utilized to add shading with Blinn-Phong shading. Additionally, to account for the fact that lower heights in the terrain indicate valleys where light is less likely to reach, the height value was raised to a power and used for ambient occlusion.

## Conclusion

Through this project, I learned how to generate terrain based on Perlin noise and render it visually appealingly using WebGPU. By utilizing normal vectors and ambient occlusion, I was able to realistically depict the terrain's depth and lighting effects. The powerful performance of WebGPU enabled high-resolution rendering.
