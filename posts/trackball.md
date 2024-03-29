---
title: "Trackball"
date: "Nov 10, 2023"
category: "graphics"
tags: ["opengl", "trackball", "picking", "raycasting"]
excerpt: "implemented a trackball to rotate an object with ray casting..."
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/KQhOrAeFm8A?si=n0SRJXAz3kiEg2eL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

I have implemented a trackball feature using OpenGL. A trackball enables users to interactively rotate objects within a 3D space, offering an intuitive and engaging user experience. This feature enhances the overall interactivity of the application, allowing for dynamic and visually appealing manipulation of 3D objects.

---

## Picking with ray casting

Before delving into trackball implementation, it is essential to select the object using the mouse. This process involves detecting collisions between the mouse and the object through ray tracing and determining the point of collision. The initial step is to calculate the ray cast originating from the mouse in world coordinates. To achieve this, I employ ray casting to identify collisions between the mouse and the object, ultimately obtaining the intersection point. The crucial starting point is determining the ray cast originating from the mouse in world coordinates.

---

Transformed the mouse cursor's position from screen space coordinates to normalized device coordinates.

```cpp
// screen space (viewport coordinates)
glm::vec2 cursor...

// normalised device space
GLfloat x = cursor.x * 2.0f / WIDTH - 1.0f;
GLfloat y = 1.0f - cursor.y * 2.0f / HEIGHT;
GLfloat z = 1.0f;
glm::vec3 ray_nds = glm::vec3(x, y, z);
```

---

Transformed a ray from clip space to eye space. The ray_clip vector is constructed with adjusted z and w components to ensure the ray points into the screen. The transformation to ray_eye involves multiplying by the inverse of the projection matrix. The resulting vector is then modified to fit the eye space representation. Overall, this process prepares the ray for subsequent rendering pipeline stages.

```cpp
// clip space
glm::vec4 ray_clip = glm::vec4(ray_nds[0], ray_nds[1], -1.0, 1.0);
// eye space
glm::vec4 ray_eye = glm::inverse(projection) * ray_clip;
ray_eye = glm::vec4(ray_eye[0], ray_eye[1], -1.0, 0.0);
```

---

Transformed the ray from eye space to world space. The ray_eye vector is multiplied by the inverse of the view matrix to achieve this transformation. The resulting vector, ray_wor, represents the ray in world space coordinates. Finally, the vector is normalized to ensure accurate directional information.

```cpp
// world space
glm::vec3 ray_wor = glm::vec3(inverse(view) * ray_eye);
ray_wor = glm::normalize(ray_wor);
```

---

This function performs a collision test between a ray and an object, referencing code from [https://antongerdelan.net/](https://antongerdelan.net/). The original function returned a boolean indicating collision, but I modified the code to return the intersection point for later use in implementing a trackball. To achieve this, the intersection boolean is now passed by reference, allowing the function to modify its value based on whether a collision occurs. The function is designed to return the intersection point if a collision is detected, facilitating further implementation for trackball functionality.

```cpp
bool intersection = false;
glm::vec3 pickPoint = ray_sphere(camera.getPosition(), ray_wor, translation, SPHERE_SCALE, intersection);
```

```cpp
// https://github.com/capnramses/antons_opengl_tutorials_book/blob/master/07_ray_picking/main.cpp
glm::vec3 ray_sphere(glm::vec3 ray_origin_wor, glm::vec3 ray_direction_wor, glm::vec3 sphere_centre_wor, GLfloat sphere_radius, bool& intersection) {
	// work out components of quadratic
	glm::vec3 dist_to_sphere = ray_origin_wor - sphere_centre_wor;
	GLfloat b = glm::dot(ray_direction_wor, dist_to_sphere);
	GLfloat c = glm::dot(dist_to_sphere, dist_to_sphere) - sphere_radius * sphere_radius;
	GLfloat b_squared_minus_c = b * b - c;

	// check for "imaginary" answer. == ray completely misses sphere
	if (b_squared_minus_c < 0.0f) {
		intersection = false;
		return glm::vec3(0.0f);
	}

	// check for ray hitting twice (in and out of the sphere)
	if (b_squared_minus_c > 0.0f) {
		// get the 2 intersection distances along ray
		GLfloat t_a = -b + sqrt(b_squared_minus_c);
		GLfloat t_b = -b - sqrt(b_squared_minus_c);

		// if behind viewer, throw one or both away
		if (t_a < 0.0) {
			if (t_b < 0.0) {
				intersection = false;
				return glm::vec3(0.0f);
			}
		}
		else if (t_b < 0.0) {
			return ray_origin_wor + ray_direction_wor * t_a;
		}
		else {
			intersection = true;
			return ray_origin_wor + ray_direction_wor * t_b;
		}
	}

	// check for ray hitting once (skimming the surface)
	if (b_squared_minus_c == 0.0f) {
		// if behind viewer, throw away
		GLfloat t = -b + sqrt(b_squared_minus_c);
		if (t < 0.0f) {
			intersection = false;
			return glm::vec3(0.0f);
		}
		intersection = true;
		return ray_origin_wor + ray_direction_wor * t;
	}

	// note: could also check if ray origin is inside sphere radius
	intersection = false;
	return glm::vec3(0.0f);
}
```

---

## Rotation

Now, I'm going to implement a trackball using the picked point obtained through ray casting. Before delving into that, I've opted to use quaternions for rotation instead of Euler angles. There are several reasons for this choice. Firstly, Euler angles involve multiple rotations around each axis, which can be cumbersome. Additionally, they are sensitive to rotation order. On the contrary, quaternions overcome these issues. Moreover, quaternions are more efficient and mathematically stable for representing rotations compared to Euler angles.

---

They also address certain problems associated with rotation representations, such as gimbal lock. Gimbal lock is a phenomenon where a loss of Degrees of Freedom occurs when the y-axis rotation angle approaches π/180 (approximately 1.57). This results in a noticeable occurrence, as demonstrated in the accompanying video. In the flowing video, you can observe the x-axis and z-axis rotations producing the same outcome when the y-axis rotation angle reaches the specified value.

<iframe width="560" height="315" src="https://www.youtube.com/embed/IVYbnSeXclE?si=S3ndvwE02ofkB0eK" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

---

The following code represents a rough implementation of rotating a 3D object through mouse input. Specific implementation details can be found in the repository linked below. The rotation is achieved using quaternions to represent the orientation of the object, and it gets updated based on mouse movements. The code detects mouse input to rotate the 3D object, calculates the rotation angle, and updates the quaternion, thereby achieving smooth and intuitive rotation while avoiding issues associated with Euler angles.

In particular, the glm::normalize(pickPoint - translation) part signifies the process of normalizing the vector obtained by subtracting the current object's position (translation) from the intersection point (pickPoint) where the ray intersects with the sphere. This vector, when normalized, becomes a unit vector pointing from the object's center to the intersection point and is used as the axis of rotation. The resulting rotation axis and angle are then used to calculate the quaternion, accurately representing the object's rotation.

```cpp
bool intersection = false;
if (mainWindow.getMouseLeft())
{
	glm::vec3 ray_wor = get_ray_from_mouse(mainWindow.getCursor(), projection, camera.calculateViewMatrix());
	glm::vec3 pickPoint = ray_sphere(camera.getPosition(), ray_wor, translation, SPHERE_SCALE, intersection);
	if (intersection)
	{
		if (dragStartFlag) {
			dragStartFlag = false;
			prevMouseRayVector = glm::normalize(pickPoint - translation);
		}
		else {
			glm::vec3 currentMouseRayVector = glm::normalize(pickPoint - translation);
			float theta = glm::acos(glm::dot(prevMouseRayVector, currentMouseRayVector));
			if (theta > 0.001f)
			{
				glm::vec3 axis = glm::normalize(glm::cross(prevMouseRayVector, currentMouseRayVector));
				modelQuaternions = glm::angleAxis(theta, axis) * modelQuaternions;
				prevMouseRayVector = glm::normalize(pickPoint - translation);
			}
		}
	}
}
else
{
	dragStartFlag = true;
}
```

---

For detailed implementation, please refer to the following link.

[Source code](https://github.com/waynechoidev/mouse-picking-ray-tracing)

---

### References

- [https://github.com/capnramses/antons_opengl_tutorials_book/blob/master/07_ray_picking/main.cpp](https://github.com/capnramses/antons_opengl_tutorials_book/blob/master/07_ray_picking/main.cpp)
- [https://antongerdelan.net/opengl/raycasting.html](https://antongerdelan.net/opengl/raycasting.html)
- [Introduction to Computer Graphics with DirectX 11 - Part 3. Rendering Techniques](https://honglab.co.kr/courses/graphicspt3)
