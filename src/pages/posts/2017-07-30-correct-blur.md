---
layout: '@/layouts/Post.astro'
title: The correct blur
date: 2017-07-30
---

In the past week, I learned that the RGB values stored in digital media are not the same as they were recorded.
This isn't some lossy compression algorithm artifact, but rather a clever tactic.
The range of all possible intensity values is reduced.

In the days when storage spaces were tiny and these _adjustments_ helped.
But the same adjustments can hinder photo editing processes.

<!-- preview -->

Here's the full explanation by [Henry Reich (minutephysics)].

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/LKnqECcg6Gw?si=uxDv1NdkDKIqt1qa" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

The gist of the process is to take square-roots of the raw pixels when saving the file and when displaying the stored files, square the stored values (since they were rooted initially).

![](/media/2017-07-30-correct-blur/1.png)

The problem occurs when editing a picture involves direct pixel manipulations.
Any transform can yield bad results if applied incorrectly.

![](/media/2017-07-30-correct-blur/2.png)

Blurring, for instance, is done by replacing each pixel with an _average_ of the pixel and the neighboring pixels.
The averaging must be applied to the raw pixels, not their square-roots.

This means that squaring be done before the kernel convolutions and then take roots before saving the file.

I've made a simple [tool] to visualise the difference that squaring the pixels before transformations makes.
You can use it [here].

### Is it worth it?

Not really.

This is something that you never even knew you _never_ knew.
And now that you do know about it, this might bug you a little.

But the real problem is speed.
A simple 16MP image has more than a million pixels. Each of those pixel must be squared and rooted.
And as image sizes grow, these extra steps will slow things down further down.

[henry reich (minutephysics)]: https://twitter.com/minutephysics
[tool]: https://github.com/zhirzh/correct-blur
[here]: https://zhirzh.github.io/correct-blur/dist
