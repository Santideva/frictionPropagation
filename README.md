# frictionPropagation
An interactive, animated pixel propagation effect on an HTML5 canvas

## User initiated, animated pixel effect for a dynamic visual representation of the spread and fading of colorful pixels.

The key features of this program are - Pixel Drawing, Interactive Propagation, Animation, Color Interpolation and Fade Out Effect.
The program has event-driven, procedural and functional aspects.

JavaScript Methods and APIs:
Canvas API, fillRect, and clearRect.
Event Handling: addEventListener('click', ...) to trigger propagation on user interaction.
Animation: requestAnimationFrame(callback) 

Mathematical Concepts:
Color Interpolation: Uses linear interpolation to blend colors.
Distance Calculation: Computes Euclidean distance for fade-out effect.
Randomization: Generates random colors and propagation directions.

Algorithms:
Deque Data Structure: Custom implementation to manage the queue of pixels for propagation.
Propagation Algorithm: Spreads pixels to adjacent positions with a probability factor that decreases over time.
Color Fading: Adjusts pixel colors over iterations to create a fading effect.

Possible Real-World Applications:
Digital Art: Can be used for creating dynamic, generative art pieces.
Visual Effects: Suitable for simulations of growth patterns or diffusion processes in educational tools.
Interactive Installations: Can be integrated into interactive displays or art installations.

