Name: Daniyal Abed
Date:March/2026


Vector math: for this part i made a custom ve3 class that handles fundamental linear algebra, such as normalization, vector subtraction, and dot products
Ray generation:A view plane is used to cast rays from a virtual camera origin (0, 0, 0)
Ray-Sphere intersection:I calculated the discriminant using the quadratic equation to see if a ray strikes a sphere which is d = b(squared) - 4ac
Ambience: A steady base light intensity to prevent total darkness in the shadows
Diffusion: Lambert's Cosine Law is used to calculate the spread of light across the surface.
Specular: calculated to produce sparkling highlights based on the viewer's position and the reflection vector
Shadows: A shadow ray is directed toward the light source at each hit point. The point is displayed using solely ambient light if an intersection is discovered.

How to run::
Ensure that index.html and raytracer.js are in the same directory (folder)
Open the index.html in any browser of your choice 
Then click the start render button 

