---
layout: '@/layouts/Post.astro'
title: Making CRA apps work with SSR - Part 3
date: 2017-11-07
---

> This article is now part of a much longer series of posts titled [Making CRA apps work with SSR](https://hackernoon.com/making-cra-apps-work-with-ssr-b45f7c23d8db). You can find the the code [here on github](https://github.com/zhirzh/cra-with-ssr).

In a [part 2](https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-part-1-8f5f813d510b), we added static assets to our barebones CRA + SSR app. In this post we'll add [_redux_](http://redux.js.org/) into the mix.

## Add redux to client

Before we can integrate redux in the server code, we need to add it in the client code. I am using the ubiquitous "todos" app for demonstrating redux integration.

Since the main focus here is server integration, I'll skip the client integration. You can checkout get the starter code [here on github](https://github.com/zhirzh/cra-with-ssr/tree/client-redux).

```sh
# my-app/

git checkout client-redux

npm i
npm start
```

![](/media/2017-11-07-cra-with-ssr-part-3/cra%20ssr.png)

## Add redux to server

Thanks to the official [redux Server Rendering guide](https://redux.js.org/recipes/serverrendering), redux integration is actually pretty easy.

Install the packages ...

```sh
# server/

npm i redux react-redux
```

... and connect redux with `<Provider />`

```js
// server/src/react-renderer.js

var React = require('react')
var { renderToString } = require('react-dom/server')
var { Provider } = require('react-redux')

var { BUILD_DIR } = require('./paths')
var App = require('../../client/lib/App').default
var configureStore = require('../../client/lib/modules/store').default

...

function reactRenderer(req, res) {
  var store = configureStore()

  var app = renderToString(
    <Provider store={store}>
      <App />
    </Provider>,
  )

  var html = fs
    .readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8')
    .replace('__ROOT__', app)

  return res.send(html)
}
```

## Initial render on server

Simply adding a redux store doesn't do much. We also need some data inside. We can get data into the store by declaring it in the renderer, importing from a database or dispatching actions.

```js
// server/src/react-renderer.js

var { BUILD_DIR } = require('./paths')
var App = require('../../client/lib/App').default
var configureStore = require('../../client/lib/modules/store').default
var { addTodo } = require('../../client/lib/logic/todos')

function reactRenderer(req, res) {
  var state = {
    todos: [
      {
        id: 0,
        task: 'task from server',
      },
    ],
  }

  var store = configureStore({
    state,
  })

  store.dispatch(addTodo('also from server'))

  var app = renderToString(...)

  ...
}
```

![](/media/2017-11-07-cra-with-ssr-part-3/broken%20ssr.png)

We can see that the although data is being rendered on the server, it doesn't appear anywhere on the client. That's because the store on client and server are not _in-sync_.

## Initial render on client

We have to _embed_ the server state for the client to use during its first render.

We need to add a render hook in `client/public/index.html` for redux ...

```html
// client/public/index.html

<div id="root">__MY_APP__</div>
<script>
  window.__INITIAL_STATE__ = __REDUX__
</script>
```

... replace it with the server store state ...

```js
// server/src/react-renderer.js

function reactRenderer(req, res) {
  var state = {...}

  var store = configureStore({
    state,
  })

  store.dispatch(addTodo('also from server'))

  var app = ...;

  var html = fs
    .readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8')
    .replace('__ROOT__', app)
    .replace('__REDUX__', JSON.stringify(store.getState()))

  return res.send(html)
}
```

... and tell client redux to get the initial state from `window.__INITIAL_STATE__`

```js
// client/src/index.js

const state = window.__INITIAL_STATE__

const store = configureStore({
  middlewares: [loggerMiddleware],
  state,
})

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,

  document.getElementById('root'),
)
```

## The End

If we now build our client &amp; start our server, everything should work.

```sh
# client/
npm run build
...

# server
npm start
...
```

![](/media/2017-11-07-cra-with-ssr-part-3/hydration.png)

So far, we have created a CRA app with SSR with asset imports and redux. In the next part, I will add routing to the existing setup using [_react-router_](https://reacttraining.com/react-router/web).

Since routing is a major part of any web project, this might take some time. In the meantime, I might add some other niceties, like support for css-modules.

And as always, you can find the code for this part [here on github](https://github.com/zhirzh/cra-with-ssr/tree/bc5b49c49f1cd3398ffac4cdd2c9724aa5189320).
