---
title: "Why modern games are hard to optimize"
date: "Dec 20, 2024"
category: "story"
tags: ["game", "gpu"]
excerpt: "The complexity of GPU architectures and optimization challenges..."
---

There's a story going around that games these days have bad optimization because game developers are lazy or not skilled enough. Game developers who hear this must feel hurt and misunderstood. I'm not a game developer, but as an engineer who is interested in low-level GPU programming, I want to stand up for them and explain their side.

## Evolution and Growing Complexity of GPU Architecture

GPUs of the past had simple pipeline structures. They had a straightforward architecture with just vertex shaders and pixel shaders. Texture units were simple, and the memory structure was relatively intuitive. Thanks to this simple structure, high-level graphics APIs like DX11 and OpenGL could easily support various platforms. Developers could achieve sufficient optimization at the API level, and further optimization was neither necessary nor particularly feasible due to limited options.

However, modern GPUs are completely different. They have added various shader stages such as compute shaders, geometry shaders, and mesh shaders, along with specialized hardware like ray tracing units and tensor cores. The cache hierarchy has become much more complex, and both cache and memory structures have grown significantly more sophisticated.

A bigger issue is the diversity of GPU architectures even within the same manufacturer. NVIDIA alone has multiple coexisting architectures like Pascal (10XX), Turing (20XX), Ampere (30XX), and Lovelace (40XX). Each generation has completely different cache structures, core configurations, and memory characteristics. Moreover, even within the same architecture, there are various hardware implementations. Taking the RTX 3080 as an example, there are base models, Ti models, SUPER models, and laptop models - all using the same Ampere architecture but with different core counts, clock speeds, and memory configurations. In this situation, it has become nearly impossible for traditional high-level APIs to effectively support all GPU architectures.

## Shift to Low-Level APIs

In response to increasing complexity, the industry has shifted toward low-level APIs like DirectX 12 and Vulkan. These APIs have opted for a cross-platform implementation approach by minimizing the role of the API itself and delegating many of their previous responsibilities to developers. Tasks such as memory management, resource synchronization, and command buffer management, which were once handled by drivers or the API, are now the developer's responsibility.

Developers must now perform detailed optimizations tailored to each platform and architecture. In the past, a single optimization at the API level could cover all platforms, but today, separate optimizations are required for each architecture, even within different hardware implementations of the same architecture.

Some argue that the lack of optimization stems from the use of third-party engines, but this claim overlooks the reality. Engines like Unreal Engine already provide robust optimizations at the engine level, which is the reason users can experience the level of performance they do today. While optimization has become more challenging, rendering techniques have also advanced significantly. For any game, independently implementing all the latest technologies while simultaneously optimizing for all platforms is a formidable task, even for large game studios.

## Conclusion

The high system requirements of modern games are not due to developers being lazy or incompetent but rather because the complexity and diversity of GPU architectures have significantly increased the cost and effort required for optimization. While the adoption of low-level APIs has enabled higher performance, it has also placed a greater burden on developers by necessitating fine-tuned optimizations for each platform and hardware. These technical challenges have significantly extended the average development time for AAA games over the past decade, as developers now face the intricate task of addressing both creative and design challenges alongside optimization for diverse hardware configurations.
