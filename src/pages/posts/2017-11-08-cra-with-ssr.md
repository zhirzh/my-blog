---
layout: '@/layouts/Post.astro'
title: Making CRA apps work with SSR
date: 2017-11-08
---

> I have updated the articles in this series for React v16. The code for older versions of react is now [here on github](https://github.com/zhirzh/cra-with-ssr-old).

This series of posts is all about rendering react apps on the [server](https://hackernoon.com/tagged/server) that were built using [create-react-app](https://github.com/facebook/create-react-app). The code is [here on github](https://github.com/zhirzh/cra-with-ssr).

## [Part 1: Off to a simple start](https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-1-1e23d6b1603d)

A simple start with a barebones app that can't even deal with CSS. It does help explain the process involved though.

## [Part 2: Adding support for static assets](https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-2-ff5f644e9d24)

Once the base system is up and running, it's time to make it work with CSS (and other assets).

## [Part 3: Integrating Redux](https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-3-c981adb8bdab)

It's no surprise that [_redux_](https://hackernoon.com/tagged/redux) is a popular choice for data management and it's a must to have strong support for it in the server rendering pipeline.

## [Part 4: Routing with react-router](https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-4-2954d04ea67c)

We'll explore static and dynamic routing with react-router, along with handling route params and redux integration.

## The "why" and The "how" Part

Ever since I came across [React](https://reactjs.org/) back in 2015, I have loved working with it. The experience was a massive paradigm shift. From cluttered, spaghetti jQuery to something more refined.

Eventually, I started feeling effects of ["the" fatigue](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4). Starting each new project required a ton of manual labour which **always** seemed tiny at first, but grew in size rapidly.

I started looking for a solution. Templates, boilerplates and fair chunk of generators later, I found [create-react-app](https://github.com/facebookincubator/create-react-app).

### create-react-app

CRA was the solution I was looking for. In time, it became my goto starting point. Best of all, it plays _pretty_ well with other projects from react ecosystem.

But by no means is it _be all end all_ solution as CRA doesn't support server rendering. Yet.🤞

### Server rendering

I took all the bits and pieces I found and tried to put glue together into _something_ that just works. This series is my way of documenting the process.
