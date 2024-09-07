---
title: "PBR Rendering"
date: "1 April, 2024"
category: "graphics"
tags: ["opengl", "pbr", "glsl"]
excerpt: "Implemented PBR rendering using OpenGL..."
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/XrfiBfOx1LE?si=N0abz-D93HKovMzM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

- [WebGL Sample](https://waynechoidev.github.io/web-pbr/)
- [WebGPU Sample](https://waynechoidev.github.io/webgpu-pbr/)

I've implemented PBR rendering using OpenGL, and WebGL. Primarily, this project was developed with reference to the content available at [Learn OpenGL](https://learnopengl.com/). The ideas presented on that website served as inspiration for this implementation. Additionally, the code from [IBL Baker](https://www.derkreature.com/iblbaker) was also consulted for further enhancements. I'll focus more on implementation rather than delving into mathematical and physical theories on this post.

The following code snippets are intended to supplement the concepts explained as needed and may not represent exact implementations. The complete implementation can be found in the repository link below.

- [OpenGL App Repo](https://github.com/waynechoidev/pbr)
- [IBL Maker Repo](https://github.com/waynechoidev/ibl-maker)
- [WebGL App Repo](https://github.com/waynechoidev/web-pbr)

## 1. PBR Textures

PBR (Physically Based Rendering) textures are used to describe the physical properties of materials. Typically, a combination of various texture maps is used to compose a single PBR material. There are several types of textures commonly used, primarily including:

- Albedo Map

  It represents the base color of the surface, indicating the material's actual color.

- Normal Map

  It manipulates the surface's normal vectors to add three-dimensional detail, simulating irregular shapes or textures.

- Metallic Map

  It indicates whether the surface is metallic or non-metallic. It ranges from black (non-metallic) to white (metallic).

- Roughness Map

  It represents the roughness or smoothness of the surface. It ranges from black (smooth) to white (rough).

- Ambient Occlusion Map (AO Map)

  It simulates indirect lighting by considering occlusion of the surface. Darker areas in the texture typically represent surface occlusion or concavities.

- Height Map

  It represents the three-dimensional detail of a surface. It is mainly employed to provide finer details on the surface of objects. Although not covered in [Learn OpenGL](https://learnopengl.com/) (presumably because it is unrelated to lighting), it is included in most PBR textures.

To use these textures, a normal vector is required. The normal vector indicates the direction of the surface and plays a crucial role in determining the surface's lighting reflection properties based on the lighting and viewpoint between the light source and observer.

Normal vectors are primarily represented through normal maps, with each pixel of the texture representing the local direction of the surface. This information is used in lighting models considering the directions of the light source and observer. For instance, normal vectors provide the angle between the surface and light, allowing for the simulation of highlights and shadows.

Normal maps are commonly used in tangent space. Tangent space defines the local coordinate space of the surface, with basis vectors representing the normal, tangent, and binormal at each point on the surface. Normal maps are stored in this tangent space, facilitating the easy transformation of normals from texture space.

Therefore, to use a normal map, tangent vectors and normal vectors associated with the surface's local coordinate space are required. This information enables the mapping of normals stored in the normal map to the actual normals of the surface.

While the LearnOpenGL example attempted to calculate tangent vectors using gradients of WorldPos and TexCoords, this method is an inaccurate estimation. Typically, tangent vectors are provided along with the model, so I passed tangent vectors from the CPU to the vertices.

```glsl
// the code used in [Learn OpenGL](https://learnopengl.com/) to calculate tangents

vec3 Q1  = dFdx(WorldPos);
vec3 Q2  = dFdy(WorldPos);
vec2 st1 = dFdx(TexCoords);
vec2 st2 = dFdy(TexCoords);

vec3 T  = normalize(Q1*st2.t - Q2*st1.t);
```

The normal and tangent vectors calculated in the vertex shader exist in the local coordinate space of the model. When passing these vectors to the fragment shader, they need to be transformed into world coordinates. To achieve this, the vectors should be transformed using the model transformation matrix to convert them into world coordinates.

Typically, the transformation of the tangent vector involves only the model transformation matrix. However, for the normal vector, relying solely on the model transformation may not yield correct results when the normal is defined in a non-standard texture coordinate space. This is because the normal vector represents direction, and transformation matrices only preserve length and rotation, not direction.

Therefore, for the normal vector, it's necessary to use the transpose and inverse of the model transformation matrix for the correct transformation into world coordinates. This ensures that the normal vector is accurately transformed into world coordinates. The reason for using transpose and inverse is to ensure preservation of direction during the transformation, as these operations are used to perform transformations that preserve direction. You can find more detailed explanations at this [link](https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html).

```glsl
// the code for calculating the normal world and tangent world vectors in the vertex shader

vec3 normalWorld = normalize(mat3(transpose(inverse(model))) * norm);
vec3 tangentWorld = normalize(model * vec4(tangent, 1.0)).xyz;
```

First, we apply the height map in the Vertex shader. This texture directly manipulates texture coordinates to implement the three-dimensional shape of the surface, rather than affecting lighting or shadows.

```glsl
uniform sampler2D heightTex;

float height = texture(heightTex, tex).r;
height = height * 2.0 - 1.0; // 0~1 -> -1~1
vec3 newPos = position + vec3(normalWorld * height);
```

All remaining textures are related to lighting, and we'll cover them from the next chapter onward.

---

## 2. Direct Lighting

Direct Lighting is one of the crucial concepts in Physically Based Rendering (PBR). It deals with scenarios where light directly reflects off an object's surface. In other words, it models the process where light travels in a straight line from the light source to the object, determining aspects like the object's color and shadows. Typically, the Bidirectional Reflectance Distribution Function (BRDF) is used for these calculations. Here, we'll implement it using the widely adopted Cook-Torrance model. This model considers the microstructure of the object's surface and the angle of incidence of light to provide realistic lighting effects. In this explanation, rather than delving into the microfacet theory that deals with fine surface structures, we'll focus on implementing the function. You can find more detailed theoretical information on this topic in this [link](https://blog.selfshadow.com/publications/s2013-shading-course/hoffman/s2013_pbs_physics_math_slides.pdf).

> #### Microfacet BRDF
>
> f(l,v) = F(l, h) G(l, v, h) D(h) / 4(n · l)(n · v)

The equation represents the general form of the BRDF (Bidirectional Reflectance Distribution Function). I'll provide explanations and implementations for each component.

### F (Fresnel Reflectance)

> F(Cspec, l, h) = Cspec + (1 - Cspec)(1 - (l · h)) ^ 5

Fresnel Reflectance represents the optical properties when light reaches and reflects off the surface.

```glsl
uniform sampler2D albedoMap;
uniform sampler2D metallicMap;

// Apply gamma correction to the sampled albedo texture to convert it from sRGB space to linear space
vec3 albedo = pow(texture(albedoMap, TexCoord).rgb, vec3(2.2));
float metallic  = texture(metallicMap, TexCoord).r;

vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Initialize the surface reflectance coefficient F0 with a default value
vec3 F0 = vec3(0.04);

// Linearly interpolate between the surface reflectance coefficient F0 and the albedo (surface color) based on metallic value
F0 = mix(F0, albedo, metallic);

vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
```

### G (Geometry Factor)

> GSchlickGGX(n, v, k) = n ⋅ v ( n ⋅ v) (1 − k) + k
>
> G(l, v, h) = Gs1(l, h) Gs2(v, h)

Geometry Factor indicates the portions occluded between the light and the observer, modeling effects such as occluded shadows. it takes a material's roughness parameter as input with rougher surfaces having a higher probability of overshadowing microfacets. The geometry function we will use is a combination of the GGX and Schlick-Beckmann approximation known as Schlick-GGX.

```glsl
uniform sampler2D roughnessMap;
uniform sampler2D normalMap;

uniform vec3 camPos;

float roughness = texture(roughnessMap, TexCoord).r;

vec3 N = normalize(normalWorld);
// Adjust the tangent vector to ensure it is perpendicular to the surface
// by removing the component parallel to the normal vector.
vec3 T = normalize(tangentWorld - dot(tangentWorld, N) * N);
vec3 B = cross(N, T);

// Create a TBN matrix containing the tangent, binormal, and normal vectors.
mat3 TBN = mat3(T, B, N);

// Sample the normal map from the texture and map it to the [-1, 1] range to update the normal vector.
N = normalize(TBN * (texture(normalMap, TexCoord).xyz * 2.0 - 1.0));

// Compute the view vector.
vec3 V = normalize(camPos - posWorld);

// Compute the light direction vector
vec3 L = normalize(lightPos - posWorld);

float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

float G = GeometrySmith(N, V, L, roughness);
```

### D (Normal Distribution Function)

> NDF(n, h, α) = α ^ 2 / π((n ⋅ h) ^ 2 (α ^ 2 − 1) + 1) ^ 2

Normal Distribution Function denotes the reflection direction due to the microstructure of the surface, considering surface roughness or fine surface characteristics. The NDF function we'll be using is known as the Trowbridge-Reitz GGX.

```glsl
float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a = roughness*roughness;
    float a2 = a*a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}

float NDF = DistributionGGX(N, H, roughness);
```

### BRDF

```glsl
vec3 numerator = NDF * G * F;
// + 0.0001 to prevent divide by zero
float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;

vec3 BRDF = numerator / denominator;
```

Now we can finally calculate this direct light's contribution to the reflectance equation.

In the [Learn OpenGL](https://learnopengl.com/) example, they used point lights coming from four directions, but I only used one point light.

```glsl
// Calculate the specular reflection coefficient.
vec3 kS = F;

// Calculate the diffuse reflection coefficient.
vec3 kD = vec3(1.0) - kS;
kD *= 1.0 - metallic;

// Scale the light intensity by the cosine of the angle between the normal vector and the light direction.
float NdotL = max(dot(N, L), 0.0);

// Calculate the direct lighting contribution, combining diffuse and specular reflections.
vec3 directLight = (kD * albedo / PI + BRDF) * radiance * NdotL;
```

---

## 3. Environment Lighting

Environment Lighting is primarily implemented using the IBL (Image-Based Lighting) technique. This method involves representing the surrounding environment with appropriate maps and using these maps to calculate lighting for objects. To implement Environment Lighting for PBR (Physically Based Rendering), three main textures are required: the Irradiance Map, Specular Map, and BRDF Texture.

### Irradiance Map

Irradiance Map is used to model the lighting of the surrounding environment. It represents the incoming radiance at a specific point, typically captured and generated around the camera's surroundings. Irradiance Map is utilized to simulate indirect lighting on the surface of objects, thus determining their color and brightness.

In [Learn OpenGL](https://learnopengl.com/), the environment map is sampled using point sampling in a spherical coordinate system. As the desired results weren't achieved with this method, I opted for importance sampling to sample the Irradiance Map from the environment map. This approach involves sampling the more important areas of the environment map more frequently to obtain a more accurate Irradiance value. To implement this, I referred to the code of an open-source project called [IBL Baker](https://www.derkreature.com/iblbaker) extensively.

```glsl
#version 420 core

out vec4 FragColor;

in vec3 WorldPos;

uniform samplerCube envCubemap;

const float PI = 3.14159265359;

const int ConvolutionSamplesOffset = 1;
const int ConvolutionSampleCount = 256;
const int ConvolutionMaxSamples = 512;
const float ConvolutionRoughness = 0.2;
const float ConvolutionMip = 3.0;
const float EnvironmentScale = 3.0;
const float IblMaxValue[3] = { 102.0, 85.0, 79.0 };
const vec4 IBLCorrection = vec4(1.0);


vec3 rescaleHDR(vec3 hdrPixel) {
    hdrPixel = hdrPixel / (hdrPixel + vec3(1.0));

    if (hdrPixel.x < 0.0)
        hdrPixel.x = 0.0;
    if (hdrPixel.y < 0.0)
        hdrPixel.y = 0.0;
    if (hdrPixel.z < 0.0)
        hdrPixel.z = 0.0;

    float intensity = dot(hdrPixel, vec3(0.299, 0.587, 0.114));

    // Saturation adjustment
    hdrPixel = mix(intensity.xxx, hdrPixel, IBLCorrection.y);

    // Hue adjustment
    vec3 root3 = vec3(0.57735, 0.57735, 0.57735);
    float half_angle = 0.5 * radians(IBLCorrection.z);
    vec4 rot_quat = vec4(root3 * sin(half_angle), cos(half_angle));
    mat3 rot_Matrix = mat3(
        vec3(1.0 - 2.0 * (rot_quat.y * rot_quat.y + rot_quat.z * rot_quat.z), 2.0 * (rot_quat.x * rot_quat.y - rot_quat.w * rot_quat.z), 2.0 * (rot_quat.x * rot_quat.z + rot_quat.w * rot_quat.y)),
        vec3(2.0 * (rot_quat.x * rot_quat.y + rot_quat.w * rot_quat.z), 1.0 - 2.0 * (rot_quat.x * rot_quat.x + rot_quat.z * rot_quat.z), 2.0 * (rot_quat.y * rot_quat.z - rot_quat.w * rot_quat.x)),
        vec3(2.0 * (rot_quat.x * rot_quat.z - rot_quat.w * rot_quat.y), 2.0 * (rot_quat.y * rot_quat.z + rot_quat.w * rot_quat.x), 1.0 - 2.0 * (rot_quat.x * rot_quat.x + rot_quat.y * rot_quat.y))
    );
    hdrPixel = mat3(rot_Matrix) * hdrPixel;

    hdrPixel *= EnvironmentScale;
    return hdrPixel;
}

vec2 Hammersley(uint i, uint N) {
    uint bits = (i << 16u) | (i >> 16u);
    bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
    bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
    bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
    bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
    float rdi = float(bits) * 2.3283064365386963e-10;
    return vec2(float(i) / float(N), rdi);
}

vec3 importanceSampleGGX(vec2 Xi, float roughness, vec3 N) {
    float a = roughness * roughness;
    float Phi = 2.0 * PI * Xi.x;
    float CosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a * a - 1.0) * Xi.y));
    float SinTheta = sqrt(1.0 - CosTheta * CosTheta);
    vec3 H;
    H.x = SinTheta * cos(Phi);
    H.y = SinTheta * sin(Phi);
    H.z = CosTheta;
    vec3 UpVector = abs(N.z) < 0.999 ? vec3(0, 0, 1) : vec3(1, 0, 0);
    vec3 TangentX = normalize(cross(UpVector, N));
    vec3 TangentY = cross(N, TangentX);
    return TangentX * H.x + TangentY * H.y + N * H.z;
}

float specularD(float roughness, float NoH) {
    float a2 = roughness * roughness;
    float d = (NoH * a2 - NoH) * NoH + 1.0;
    return a2 / (PI * d * d);
}

vec4 sumSpecular(vec3 spec, float NoL, vec4 result) {
    result.xyz += spec;
    result.w += NoL;
    return result;
}

vec3 ImportanceSample(vec3 R) {
    vec3 N = normalize(R);
    vec3 V = normalize(R);
    vec4 result = vec4(0.0);

    float sampleStep = float(ConvolutionMaxSamples) / float(ConvolutionSampleCount);
    uint sampleId = uint(ConvolutionSamplesOffset);

    int cubeWidth = textureSize(envCubemap, 0).x;

    for (int i = 0; i < ConvolutionSampleCount; i++) {
        vec2 Xi = Hammersley(sampleId, uint(ConvolutionMaxSamples));

        vec3 H = importanceSampleGGX(Xi, ConvolutionRoughness, N);
        vec3 L = 2.0 * dot(V, H) * H - V;
        float NoL = max(dot(N, L), 0.0);
        float VoL = max(dot(V, L), 0.0);
        float NoH = max(dot(N, H), 0.0);
        float VoH = max(dot(V, H), 0.0);
        if (NoL > 0.0) {
            float Dh = specularD(ConvolutionRoughness, NoH);
            float pdf = Dh * NoH / (4.0 * VoH);
            float solidAngleTexel = 4.0 * PI / (6.0 * cubeWidth * cubeWidth);
            float solidAngleSample = 1.0 / (ConvolutionSampleCount * pdf);
            float lod = ConvolutionRoughness == 0.0 ? 0.0 : 0.5 * log2(solidAngleSample / solidAngleTexel);

            vec3 hdrPixel = rescaleHDR(textureLod(envCubemap, L, lod).rgb);
            // vec3 hdrPixel = textureLod(envCubemap, L, lod).rgb;
            result = sumSpecular(hdrPixel, NoL, result);
        }
        sampleId += uint(sampleStep);
    }

    if (result.w == 0.0)
        return result.xyz;
    else
        return result.xyz / result.w;
}

void main() {
    vec3 N = normalize(WorldPos);
    vec3 color;

    vec3 importanceSampled = ImportanceSample(N);

    if (ConvolutionSamplesOffset >= 1) {
        vec3 lastResult = textureLod(envCubemap, N, ConvolutionMip).rgb;
        color = mix(lastResult, importanceSampled, 1.0 / float(ConvolutionSamplesOffset));
    } else {
        color = importanceSampled;
    }

    FragColor = vec4(color, 1.0);
}
```

### Specular Map

I decided to just use the environment map as it is. This is because the results from directly applying pre-filtered environment maps to mipmaps, as demonstrated in LearnOpenGL, didn't show significant differences compared to the mipmaps provided by OpenGL.

We are going to implement specular using an environment map, a BRDF texture, and mipmaps.

### BRDF Texture

The BRDF (Bidirectional Reflectance Distribution Function) texture is used to define the surface properties of an object. This texture is composed of a function that represents how light is reflected from the surface of the object, indicating the direction and amount of reflection. In other words, it determines how light coming from a certain direction is reflected in various directions from the surface. The BRDF texture is used to define properties such as surface roughness, glossiness, and reflection characteristics.

In environment lighting, the BRDF texture is primarily used to model the interaction of light reflection on the surface of an object. This texture determines how light is reflected from the surface of the object depending on its properties when the light reaches the surface, thus making the appearance of the object more realistic.

For example, when the surface of an object is rough and lacks glossiness, the BRDF texture can accurately model how light is reflected from the surface of the object. This allows for a more accurate simulation of how light generated from environment lighting is reflected from the surface of the object.

Here, the code for generating the BRDF texture from the Environment Map was directly borrowed from [Learn OpenGL](https://learnopengl.com/).

```glsl
#version 420 core
out vec2 FragColor;
in vec2 TexCoords;

const float PI = 3.14159265359;

// http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
// efficient VanDerCorpus calculation.
float RadicalInverse_VdC(uint bits)
{
     bits = (bits << 16u) | (bits >> 16u);
     bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
     bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
     bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
     bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
     return float(bits) * 2.3283064365386963e-10; // / 0x100000000
}

vec2 Hammersley(uint i, uint N)
{
	return vec2(float(i)/float(N), RadicalInverse_VdC(i));
}

vec3 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness)
{
	float a = roughness*roughness;

	float phi = 2.0 * PI * Xi.x;
	float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));
	float sinTheta = sqrt(1.0 - cosTheta*cosTheta);

	// from spherical coordinates to cartesian coordinates - halfway vector
	vec3 H;
	H.x = cos(phi) * sinTheta;
	H.y = sin(phi) * sinTheta;
	H.z = cosTheta;

	// from tangent-space H vector to world-space sample vector
	vec3 up          = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
	vec3 tangent   = normalize(cross(up, N));
	vec3 bitangent = cross(N, tangent);

	vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;
	return normalize(sampleVec);
}

float GeometrySchlickGGX(float NdotV, float roughness)
{
    // note that we use a different k for IBL
    float a = roughness;
    float k = (a * a) / 2.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

vec2 IntegrateBRDF(float NdotV, float roughness)
{
    vec3 V;
    V.x = sqrt(1.0 - NdotV*NdotV);
    V.y = 0.0;
    V.z = NdotV;

    float A = 0.0;
    float B = 0.0;

    vec3 N = vec3(0.0, 0.0, 1.0);

    const uint SAMPLE_COUNT = 1024u;
    for(uint i = 0u; i < SAMPLE_COUNT; ++i)
    {
        // generates a sample vector that's biased towards the
        // preferred alignment direction (importance sampling).
        vec2 Xi = Hammersley(i, SAMPLE_COUNT);
        vec3 H = ImportanceSampleGGX(Xi, N, roughness);
        vec3 L = normalize(2.0 * dot(V, H) * H - V);

        float NdotL = max(L.z, 0.0);
        float NdotH = max(H.z, 0.0);
        float VdotH = max(dot(V, H), 0.0);

        if(NdotL > 0.0)
        {
            float G = GeometrySmith(N, V, L, roughness);
            float G_Vis = (G * VdotH) / (NdotH * NdotV);
            float Fc = pow(1.0 - VdotH, 5.0);

            A += (1.0 - Fc) * G_Vis;
            B += Fc * G_Vis;
        }
    }
    A /= float(SAMPLE_COUNT);
    B /= float(SAMPLE_COUNT);
    return vec2(A, B);
}

void main()
{
    vec2 integratedBRDF = IntegrateBRDF(TexCoords.x, TexCoords.y);
    FragColor = integratedBRDF;
}
```

### Ambient Lighting

Now we calculate indirect lighting using the given textures. Here, we use Image-Based Lighting (IBL) for this purpose.

First, we compute the Fresnel reflection coefficient on the surface. This coefficient determines the ratio of incident light to reflected light and is used in conjunction with the surface roughness.

```glsl
vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness)
{
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// ambient lighting (we now use IBL as the ambient term)
vec3 F = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, roughness);
```

Based on the Fresnel coefficient, we calculate the Specular and Diffuse coefficients. kS represents the Specular coefficient, while KD represents the Diffuse coefficient. These coefficients are determined based on the surface's metallic property.

```glsl
vec3 kS = F;
vec3 kD = 1.0 - kS;
kD \*= 1.0 - metallic;
```

We calculate the surface's environmental lighting using the Irradiance Cubemap. By sampling the Irradiance Cubemap with the surface's normal vector (N), we obtain the diffuse component by multiplying the result with the surface's albedo.

```glsl
vec3 irradiance = texture(irradianceCubemap, N).rgb;
vec3 diffuse = irradiance \* albedo;
```

We compute the specular component using the Pre-filtered Environment Map and the BRDF Look-Up Table (LUT). The Pre-filtered Environment Map represents the level of reflected environment map details based on the surface's roughness. The BRDF LUT is a precomputed table of BRDF values based on the angle and roughness between the surface's normal vector and the view vector. By combining these, we obtain the specular component.

```glsl
// sample both the pre-filter map and the BRDF lut and combine them together as per the Split-Sum approximation to get the IBL specular part.
const float MAX_REFLECTION_LOD = 4.0;
vec3 prefilteredColor = textureLod(preFilteredEnvmap, R, roughness _ MAX_REFLECTION_LOD).rgb;
vec2 brdf = texture(brdfLUT, vec2(max(dot(N, V), 0.0), roughness)).rg;
specular = prefilteredColor * (F \* brdf.x + brdf.y);
```

We combine the diffuse and specular components to compute the overall indirect lighting. We multiply this by the Ambient Occlusion (AO) value to obtain the final indirect lighting.

```glsl
vec3 ambient = (kD * diffuse + specular) * ao;
```

---

## 4. Post Processing

### HDR Tonemapping

HDR images represent a wide range of luminance values, requiring proper tonemapping to display them accurately on standard display devices. In this code, Reinhard tonemapping is used to compress the brightness and bring the dynamic range of the image into a suitable range.

Reinhard tonemapping is a method used to compress the dynamic range of high dynamic range (HDR) images so that they can be accurately displayed on low dynamic range (LDR) devices, such as computer monitors and TVs. This technique adjusts the brightness of the pixels in the HDR image based on their luminance values, aiming to maintain natural-looking contrast while preventing overexposure or loss of detail in both shadow and highlight areas.

### Gamma Correction

HDR operations are performed entirely in linear space. In linear space, adjustments to brightness and color occur linearly, enabling more accurate and predictable calculations. However, most screens and image storage media use gamma-corrected nonlinear spaces. This helps efficiently represent details in bright areas by considering human visual characteristics.

Therefore, before displaying HDR images, they need to be transformed from linear space to nonlinear space through gamma correction. This preserves details in bright areas better and results in a more natural display on the screen.

```glsl
vec3 color = directLight + ambient;

// HDR tonemapping
color = color / (color + vec3(1.0));

// gamma correct
color = pow(color, vec3(1.0/2.2));
```

---

## 5. WebGL

I've migrated the code implemented in OpenGL to WebGL. However, dynamically implementing IBL textures like in the native environment was cumbersome, and there were difficulties in loading HDRI textures. So, I decided to first create a native texture generation app called "IBL Maker" to generate textures in advance. Then, I used those textures in WebGL to implement PBR.

Since I saved the textures in JPG format, I had to pay attention to gamma correction when saving textures in OpenGL and loading textures in WebGL, unlike in the native environment.

In the native code, tonemapping and gamma correction were done as follows:

```glsl
vec3 color = ...;

// HDR tonemapping
color = color / (color + vec3(1.0));

// prevent clipping
color = min(color, vec3(1.0));

// gamma correct
color = pow(color, vec3(1.0/2.2));
```

In WebGL, I performed gamma correction each time a texture was loaded to linearize it:

```glsl
vec3 envMap = pow(textureLod(envCubemap, R, roughness * MAX_REFLECTION_LOD).rgb, vec3(2.2));

```

### P.S.

While learning the WebGPU API, I rewrote this example using WebGPU. You can check out the process at the link below.

[Introduce to WebGPU](/post/introduce-to-webgpu)

### References

- [Learn OpenGL](https://learnopengl.com/)
- [Normal Transformation](https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html)
- [SIGGRAPH 2013 Course: Physically Based Shading in Theory and Practice](https://blog.selfshadow.com/publications/s2013-shading-course)
- [IBL Baker](https://www.derkreature.com/iblbaker)
- [Tonemapping - 64.github.io](https://64.github.io/tonemapping/)
- [Introduction to Computer Graphics with DirectX 11 - Part 3. Rendering Techniques](https://honglab.co.kr/courses/graphicspt3)
