---
title: "Earth animation"
date: "Nov 6, 2023"
category: "graphics"
tags: ["toyproject", "webgl", "texture"]
excerpt: "compared the speed of Gaussian blur implementation using canvas 2D and WebGL2..."
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/HBzNSw5VZJQ?si=DRgBviwTez3F0jac" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

[Repository](https://github.com/waynechoidev/earth-animation/) / [Sample](https://waynechoidev.github.io/earth-animation/)

I've tried implementing a Earth animation using WebGL with video textures. In conventional native applications, this endeavor typically involves laboriously extracting individual frames from the video, mapping each frame as a texture, and meticulously calculating timing and synchronization. However, to my pleasant surprise, WebGL offers a far more straightforward and efficient approach, all thanks to the humble 'video' tag. This fact inspired me to experiment with a fun and straightforward idea.

---

The technique I employed is refreshingly uncomplicated. All you need to do is create a 'video' tag as demonstrated below, and within an iterative loop, continually update the video tag for each frame. Please note that this example is intentionally simplified for clarity and illustrative purposes. In practice, the actual implementation may necessitate taking various other factors into account. For a more intricate and comprehensive implementation, you can explore the detailed code provided in the repository link mentioned above.

```ts
const video = document.getElementById("video") as HTMLVideoElement;
const playButton = document.getElementById("playButton") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// Create a WebGL context
const gl = canvas.getContext("webgl");

// Add a click event listener to the play button
playButton.addEventListener("click", () => video.play());

// Create a WebGL texture
const videoTexture = gl.createTexture();

// Set up shaders, programs, and attributes

// Set up your WebGL rendering loop
function animate() {
  // Update the video frame
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Render your scene
  // (You'd need to handle shaders, buffers, and rendering manually here)

  // Request the next frame
  requestAnimationFrame(animate);
}

// Start the animation loop
animate();
```

---

The source of the texture used in this project is the [European Organisation for the Exploitation of Meteorological Satellites (EUMETSAT)](https://www.eumetsat.int/), and it is content that is allowed for non-commercial purposes. Upon closer examination, you may notice visible seams at the texture boundaries. These seams are a result of distortions in the source video itself and are often unavoidable.
