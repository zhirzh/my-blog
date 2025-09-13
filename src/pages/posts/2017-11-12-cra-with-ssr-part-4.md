---
layout: '@/layouts/Post.astro'
title: Making CRA apps work with SSR - Part 4
date: 2017-11-12
---

## Routing with react-router

> This article is now part of a much longer series of posts titled [Making CRA apps work with SSR](https://hackernoon.com/making-cra-apps-work-with-ssr-b45f7c23d8db). You can find the the code [here on github](https://github.com/zhirzh/cra-with-ssr).

This is the fourth entry in my [CRA apps with SSR](https://medium.com/@zhirzh/making-cra-apps-work-with-ssr-b45f7c23d8db) series. This time we'll work on routing for our app.

We'll look at two types of routing with *react-router* - static routes and dynamic routes. There's also route params and redux integration.

### Add routing to client

We'll use [_react-router_](https://github.com/ReactTraining/react-router) for routing in our client app. But first, we need to do some housekeeping. We'll use the _App_ component as an entry point for our routing logic. This means that we must find a new home for our app code

Let's call it the _Home_ component. We'll just rename the files ...

```sh
# client/

mv src/{App,Home}.js
mv src/{App,Home}.css
```

... and make some small changes in the new _Home_ component ...

```js
// client/src/Home.js

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addTodo, updateTodo, removeTodo } from './logic/todos'
import logo from './logo.svg'
import './Home.css'

class Home extends Component {
  state = {
    newTask: '',
  }
  ...
}

export default connect(
  (state) => ({
    todos: state.todos,
  }),

  {
    addTodo,
    updateTodo,
    removeTodo,
  },
)(Home)
```

and the old (now renovated) _App_ component.

```js
// client/src/App.js

import React, { Component } from 'react'
import Home from './Home'

class App extends Component {
  render() {
    return <Home />
  }
}

export default App
```

We will now add the router package ...

```sh
# client/

npm i react-router-dom
```

... write our routing logic inside _App_ component ...

```js
// client/src/App.js

import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './Home'

const NoMatch = () => (
  <div>
    <h1>404</h1>
    Page Not Found
  </div>
)

class App extends Component {
  render() {
    return (
      <Switch>
        <Route path='/' component={Home} exact />
        <Route render={NoMatch} />
      </Switch>
    )
  }
}

export default App
```

... and wrap everything up in a _BrowserRouter_ component.

```js
// client/src/index.js

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

...

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,

  document.getElementById('root'),
)

...
```

**_Note_: There's some perpetuating confusion about the** Provider _and_ Router _components and who should wrap whom._ [_The redux docs are pretty clear on this_](https://redux.js.org/advanced/usagewithreactrouter#connecting-react-router-with-redux-app)_. We will wrap_ Router _component in_ Provider _component so that route handlers can get access to the store._

![](/media/2017-11-12-cra-with-ssr-part-4/home.png)

![](/media/2017-11-12-cra-with-ssr-part-4/lost.png)

### Add routing to server

We can now build our react app and move to the server side. We'll start by installing the packages.

```sh
# server/

npm i react-router
```

The official [react-router SSR guide](https://reacttraining.com/react-router/web/guides/server-rendering) gives us some tips on how to add routing to the server side. The idea is that using a browser-first piece of tech in a server environment requires some tricky wiring in the react app itself.

First off, rewire _reactRenderer_ as an express middleware (and not a router) to selectively render the routes that it catches.

```js
// server/src/app.js

app.use(cookieParser())

app.use(reactRenderer)

app.use(express.static(BUILD_DIR))
```

In _reactRenderer_, we match the request URL to a list of URLs that the client uses. If we get a match, render the react app. If not, pass control to the next middleware in the chain.

We have to pass a location (which is the the request url) to _StaticRouter_ since it has no other way of knowing which route to render.

We also pass a mystical object called _context_ that serves as a data holder for any routing logic that executes at runtime. The [docs talk about it](https://reacttraining.com/react-router/web/guides/server-rendering/adding-app-specific-context-information) and how to use it to handle internal redirects.

```js
// react-renderer.js

var React = require('react')
var { renderToString } = require('react-dom/server')
var { Provider } = require('react-redux')
var { matchPath, StaticRouter } = require('react-router')

...

var routes = ['/']

function reactRenderer(req, res, next) {
  var match = routes.find((route) =>
    matchPath(req.path, {
      path: route,
      exact: true,
    }),
  )

  // bail
  if (!match) {
    next()

    return
  }

  var location = req.url
  var context = {}

  ...

  var app = renderToString(
    <Provider store={store}>
      <StaticRouter location={location} context={context}>
        <App />
      </StaticRouter>
    </Provider>,
  )

  ...
}
```

And with just that, we have our minimal routing config.

## Parametric routing

To explore parametric routes, we'll add a new react component _ParaPage_ that simply renders the props generated by _react-router_.

```js
// client/src/ParaPage.js

import React, { Component } from 'react'

class ParaPage extends Component {
  render() {
    return (
      <div>
        <h1>ParaPage</h1>

        <pre>{JSON.stringify(this.props.match.params, null, 2)}</pre>
      </div>
    )
  }
}

export default ParaPage
```

Since, the _react-router_ website [doesn't talk about](https://reacttraining.com/react-router/web/example/url-params) the possible route patterns, here's a list of possibilities. I did my best to complete it, but I missed out a few, list them in the comments below.

Parametric route patterns:

- glob: `/path-1/*`
- named: `/path-1/:foo`
- named-glob: `/path-1/:foo*`
- named-glob-one: `/path-1/:foo+`
- named-optional: `/path-1/:foo?`
- named-regex: `/path-1/:foo(\d+)`
- unnamed: `/path-1/(.*)`
- nested: `/path-1/:foo/bar`

**_Note_: When mixing different different patterns, it is really important to lay them out in order of decreasing selectivity. For instance, _glob_ has highest specificity and will match anything that looks like** `/path-1/*`*, whereas *named-regex* will only ever match the given the regex.*

```js
// client/src/App.js

<Switch>
  <Route path='/' component={Home} exact />

  <Route path='/para/:numer_regex(\d+)' component={ParaPage} />
  <Route path='/para/:text_regex([a-zA-Z]+)' component={ParaPage} />

  <Route path='/para/:any' component={ParaPage} />
  <Route path='/para/:any_regex(.*)' component={ParaPage} />
  <Route path='/para/(.*)' component={ParaPage} />
  <Route path='/para/*' component={ParaPage} />
  <Route path='/para/:any_optional?' component={ParaPage} />

  <Route path='/para' exact component={ParaPage} />

  <Route render={NoMatch} />
</Switch>
```

I suggest taking some time out to try out all these routes. One thing that is of special interest is the presence of trailing slash, the use of _exact_ prop and the position of "/para" route.

We also need to to add these routes in reactRenderer **in the same order** so the server can handle requests from any one of these.

```js
// server/src/react-renderer.js

var routes = [
  '/',

  '/para/:number_regex(\\d+)',
  '/para/:text_regex([a-zA-Z]+)',

  '/para/:any',
  '/para/:any_regex(.*)',
  '/para/(.*)',
  '/para/*',
  '/para/:any_optional?',

  '/para',
]
```

### Dynamic routing on client

Thus far, everything was done in a _static_ fashion. But loading everything ahead of time is a slow process. We can speed things up by loading parts of the app as and when required. This where [code splitting](https://webpack.js.org/guides/code-splitting/) comes in.

The official [react-router code-splitting guide](https://reacttraining.com/react-router/web/guides/code-splitting) provides a super easy way to go about it using the [_react-loadable_](https://github.com/jamiebuilds/react-loadable#introducing-react-loadable) package.

Start by installing the packages ...

```sh
# client/

npm i react-loadable
```

... then add a new component that will be loaded dynamically ...

```js
// client/src/DynaPage.js

import React, { Component } from 'react'

class DynaPage extends Component {
  render() {
    return (
      <div>
        <h1>DynaPage</h1>
      </div>
    )
  }
}

export default DynaPage
```

... wrap it inside _Loadble_ HOC ...

```js
// client/src/App.js

import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import Loadable from 'react-loadable'
import Home from './Home'
import ParaPage from './ParaPage'

...

const DynaPageAsync = Loadable({
  loading: () => <h1>Loading...</h1>,
  loader: () => import('./DynaPage'),
})

class App extends Component { ... }
export default App
```

... and connect it to a _Route._

```js
// client/src/App.js

...

class App extends Component {
  render() {
    return (
      <Switch>
        <Route path='/' component={Home} exact />

        ...

        <Route path='/dyna' component={DynaPageAsync} />

        <Route render={NoMatch} />
      </Switch>
    )
  }
}
```

### Dynamic routing on server

Rendering dynamic routes on the server is a simple task. Just load all modules **before mounting** the root component.

We will use _the_ [_preloadAll()_](https://github.com/thejameskyle/react-loadable/#loadablepreloadall) _method_ that loads the dynamic modules recursively and returns a promise and we must wait for this promise to resolve before we can render our app.

```js
// server/src/react-renderer.js

var React = require('react')
var { renderToString } = require('react-dom/server')
var { Provider } = require('react-redux')
var { matchPath, StaticRouter } = require('react-router')
var Loadable = require('../../client/node_modules/react-loadable')

...

function reactRenderer(req, res, next) {
  ...

  Lodable.preloadAll().then(() => {
    var app = renderToString(
      <Provider store={store}>
        <StaticRouter location={location} context={context}>
          <App />
        </StaticRouter>
      </Provider>,
    )

    var html = fs
      .readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8')
      .replace('__ROOT__', app)
      .replace('__REDUX__', JSON.stringify(store.getState()))

    res.send(html)
  })
}

module.exports = reactRenderer
```

**_Note_: I am importing** react-loadable _from the_ client/ _folder because the package maintains an internal list of promises and_ [_calling preloadAll() flushes that list_](https://github.com/jamiebuilds/react-loadable/blob/4a3e74ffdf380d189c5aac13bb9526da974ac2e8/src/index.js#L305-L309)_._

_This can be avoided by using the same_ node*modules/ \_folder for client &amp; server or by writing client &amp; server code in a shared repo.*

*Personally, I would *never* use either of the "hacks".*

```sh
# client/

npm run build
...

# server/

npm start
...
```

![](/media/2017-11-12-cra-with-ssr-part-4/dynamic.png)

## The End

With _react-router_ and _react-loadable_ packages, we added static, parametric and dynamic routing to both - the client and the server code. That's a lot for one post! The code is [here on github](https://github.com/zhirzh/cra-with-ssr/tree/fb811e8985587c8801697b8dd68438ba575cde45).
