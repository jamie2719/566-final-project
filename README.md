# Final Project
**Jamie Schwartz and Kathryn Miller** 

## Final Submission
## Demo: https://jamie2719.github.io/566-final-project/

**Jamie**

This week, I added L-system trees to the scene. I had a lot of trouble getting the rotations and turtles to work completely correctly- for a while I had a bug where the turtles' rotations were not being reset properly after being popped off the stack. When I finally got the L-system to work on the simple broccoli grammar, I tried to make the grammar more complex by adding an element of randomness. Now, at each iteration, there are different probabilities for the character "F" (move forward and draw a branch) to be replaced by different combinations of sub-branches with different angles. This randomness added some more variability to the trees. I generated 5 trees in the scene overall, each with random positions. Because of the randomness in the positions and in the generation of the trees themselves, each of these trees will be slightly different from the others, and the trees will be slightly different each time the scene is reloaded. I also adjusted the colors of the terrain so they would fit more with the rest of the scene. I added a condition in the terrain generator that scaled the height of the terrain based on the z coordinate of the position; this way, the terrain in the far background would be taller mountains, and the terrain would get progressively flatter as it got closer to the frame in the foreground, which added more variation to the scene.

**Kathryn**

This week I added the other features to the scene, like the frame, wall, and sky. I bought the frame for a whopping $1.60 and extended placed it on a plane to occlude the rest of the scene from the viewer's initial standpoint. The sky is raycasted to whatever points on the screen are not covered by a mesh and has fbm noise to give a bit of offset to the subtle color gradient (although this is less visible with the mountains and clouds now). I then extended the ground of the "painting" and applied a distance fog in the color of the sky clouds to make it seem more infinite. The last thing I did was add instanced clouds to the scene. Each cloud is an ellipsoid obj that I combined with some of the base code from the particles homework to get multiple without completely killing my computer. They are then deformed in the standard-vert shader with some noise that takes into account their translation such that if you look closely, each cloud is slowly morphing over time. I used Verlet integration to give each cloud a random (within some range) velocity in the x direction so they move in and out of frame before looping back. I also fixed a bug we had that only enabled us to apply the paint filter to the ground of our scene.



## Milestone 1
Images are below


**Jamie**

This week I implemented 3D Perlin noise to procedurally generate the terrain of our scene. I used summed Perlin noise to achieve a smoother effect. Once I calculated the summed Perlin noise for each point, I used it as an offset to add to the y component of that point. I also increased the amplitude of the peaks of the terrain to make it seem more hilly. All of this was done in the vertex shader terrain-vert.glsl. In the fragment shader (terrain-frag.glsl), I colored the terrain based on its height and then combined that color with a light intensity calculated using Lambert shading. I tried to use a color pallette that was similar to many of Van Gogh's landscape paintings. I also added different noise to each color so that there would be more variation in the appearance of the terrain. I had trouble getting the border between each "level" of the terrain to be more blurred, and this is something I will continue to work on next week in order to make the transitions in the terrain look more natural. I also might try to change the coloring of the terrain to use textures instead of just colors if we have time. 

Next week, my main focus will be on creating L-System trees and integrating them into the rest of the project so that they look like they belong in the terrain that I've created this week. I will create procedural textures for some components of the scene (maybe the trees or terrain) if I have time using Substance Designer. I will also continue to tweak the parameters of the terrain as the rest of the project comes together, if needed.

Also, after we merged our two branches, the terrain started disappearing sometimes when we zoomed out. We are not sure why this is happening, and it did not happen at all in the earlier versions of our separate branches before the merge. We will also figure this bug out next week.





**Kathryn**

This week I tried my very hardest to do shadow mapping and if not for the grace of Jin would I have anything. He showed me I needed to use an orthogonal matrix instead of perspective projection matrix and also showed me not to use the depth attachment for a shadow map. Most of my issues happened in OpenGLRenderer from lack of my lack of understanding of opengl. Jamie and I had trouble merging though and need to redesign our pipelines such that the shadows show up on the terrain she created. I also did a post processing paint effect (which looks better on the terrain than the alpaca). Next week I'll first try to smooth the shadows and then work on other post processing effects as well as textures, and backdrops for the "painting".


**Images**

![](milestone_1/terrain1.png)

![](milestone_1/terrain_above.png)

![](milestone_1/merged_front.png)

![](milestone_1/merged_behind.png)

![](milestone_1/alpaca_close.png)



# Building-Generator-
