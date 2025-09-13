---
layout: '@/layouts/Post.astro'
title: Calculating browser support for the web
date: 2018-04-03
---

As time moves forward, the web evolves, and brings new APIs with it. When working on a _product_, including one or two bleeding-edge APIs might throw some red flags in the user's browser.

There are some preventive measures we, the developers, can take to ensure that our product doesn't falter but it's better said than done.

## Preventive Measures

### Disclaimer

Adding a disclaimer notice to warn the user about the product's possible unstable or undefined behaviour on some platforms should be the first line of defense.

Most hacks, and even some polyfills, for some older / incompatible browsers cannot guarantee identical behaviour to native APIs. It is a good practice to inform the user of such possibilities.

### Can I Use

If you ever wanted to use an emerging technology but weren't sure if user's machines support it then you should know about [caniuse](https://github.com/Fyrd/caniuse).

> "Can I use" provides up-to-date browser support tables for support of front-end web technologies on desktop and mobile web browsers.

If this is something new to you, be sure to visit [caniuse.com](https://caniuse.com) the next time you work with modern web APIs to compare.

### Patching the Build Process

This babel preset `babel-preset-env` automatically determines the Babel plugins you need based on the browsers you want support for. It does so by comparing the versions you want to support with a [plugins list](https://github.com/babel/babel-preset-env/blob/master/data/plugins.json) and only pulls in polyfills if necessary.

I am fairly certain there may be some equivalent for other build pipelines that I don't know of. If you know some, list them out in the comments.

## The missing piece

When using babel preset, the [developer](https://hackernoon.com/tagged/developer) must consciously provide the browser versions. This is a burden on the developer's end and it's relatively easy to miss out on a [browser](https://hackernoon.com/tagged/browser) or include the wrong versions.

On the other hand, "can i use" only shows one feature at a time. It is rather difficult to decide on the common versions if you have more than a few bottleneck technologies.

Here's something to try. Can you tell minimum versions of each browser that support [service workers](https://www.caniuse.com/#feat=serviceworkers) and [CSS display contents](https://www.caniuse.com/#feat=css-display-contents)?

## browser-support

I made a simple website to address this issue, that I ever so smartly named "browser-support" ([website](https://zhirzh.github.io/browser-support/build), [source](https://github.com/zhirzh/browser-support)).

This is pretty much the same as "can i use" with some extra features. You can load up multiple technologies and share the "checklist" via URL. Once you have the versions, you can just plug them in your build pipeline or put up a relevant notice at the top of the website, should that become necessary.

[**Browser Support**  
*Calculate browser versions supported by your cutting-tech stack*zhirzh.github.io](https://zhirzh.github.io/browser-support/build 'https://zhirzh.github.io/browser-support/build')[](https://zhirzh.github.io/browser-support/build)

**PS**: If you're wondering about the exercise at the end of the previous section, you can have the answer [here](https://zhirzh.github.io/browser-support/build/?checklist=serviceworkers%2Ccss-display-contents).

## The End

That's it for today - just wanted to share something I made the other day that might save a developer some time.

In case someone missed it:

- Source code: [zhirzh/browser-support](https://github.com/zhirzh/browser-support)
- Website: [browser-support/](https://zhirzh.github.io/browser-support/build/?checklist=serviceworkers%2Ccss-display-contents)
- Demo: [browser-support?checklist=serviceworkers,css-display-contents](https://zhirzh.github.io/browser-support/build/?checklist=serviceworkers%2Ccss-display-contents)
