---
layout: '@/layouts/Post.astro'
title: Making CRA apps work with SSR - Part 2
date: 2017-11-07
---

> This article is now part of a much longer series of posts titled [Making CRA apps work with SSR](https://hackernoon.com/making-cra-apps-work-with-ssr-b45f7c23d8db). You can find the the code [here on github](https://github.com/zhirzh/cra-with-ssr).

In [part 1](https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-1-1e23d6b1603d), we started working on a more wholesome way of implementing server-side rendering in a react app made using [_create-react-app_](https://github.com/facebook/create-react-app). As of now, asset imports that are not working.

I avoided the problem in the previous post by removing the imports. Let's add them back in.

```js
// client/src/App.js

import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'

// ...
```

This is a problem that [webpack](https://webpack.js.org/) (and many other bundlers) have already solved for us. At this point, it seems like an obvious choice to use it. And there's a babel plugin that does exactly that - [_babel-plugin-webpack-loaders_](https://www.npmjs.com/package/babel-plugin-webpack-loaders).

The plugin BPWL works by running webpack externally and allows us to use webpack loaders as part of babel transformations.

However, BPWL does **not** support babel@v7 and is a _dead end_. It still works if you're using babel@v6.

## Solution

We will use the babel plugin [_babel-plugin-transform-assets_](https://www.npmjs.com/package/babel-plugin-transform-assets) for dealing with asset imports.

It transforms asset imports into slugs similar to webpack. This is crucial for maintaining import sanity between our server rendered app and our client build output.

To make it work, install the plugin ...

```sh
# client/

npm i babel-plugin-transform-assets
```

... and add the config.

```json
// client/package.json

{
  "babel": {
    "plugins": [
      "@babel/plugin-transform-modules-commonjs",
      [
        "transform-assets",
        {
          "extensions": [
            "css",
            "svg"
          ],
          "name": "static/media/[name].[hash:8].[ext]"
        }
      ]
    ],
  }
  ...
}
```

Everything should work now.

```sh
# client/

> my-app--client@0.1.0 build /my-app/client
> react-scripts build && npm run lib

Creating an optimized production build...
Compiled successfully.

...

> my-app--client@0.1.0 lib /my-app/client
> rm -rf lib/ && NODE_ENV=production babel src/ -d lib/ && npm run lib:esm

Successfully compiled 4 files with Babel.

> my-app--client@0.1.0 lib:esm /my-app/client
> find lib/ -type f -name *.js -exec sed -i'' -e 's|@babel/runtime/helpers/esm|@babel/runtime/helpers|g' {} +

# server/

npm start

> my-app--server@0.0.0 start /home/shirsh.zibbu/my-app/server
> npm run lib && node ./bin/www

> my-app--server@0.0.0 lib /home/shirsh.zibbu/my-app/server
> rm -rf lib/ && babel src/ -d lib/

Successfully compiled 5 files with Babel.
```

![](/media/2017-11-07-cra-with-ssr-part-2/static.png)

## The End

All we did was fill the blanks that we left. You can get the code [here on github](https://github.com/zhirzh/cra-with-ssr/tree/1b8703a75910cb56beddb3fe2c82cf398f34273f). Next up is data management with redux.

_PS: Although I dropped BPWL, it might work for you. You can find that code_ [_here_](https://github.com/zhirzh/cra-with-ssr-old/tree/BPWL)_._
