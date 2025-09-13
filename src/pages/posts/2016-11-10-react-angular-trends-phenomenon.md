---
layout: '@/layouts/Post.astro'
title: Weird phenomenon in Google Trends for ReactJS and AngularJS
date: 2016-11-10
---

[Google Trends] shows and compares how frequent particular terms were searched for in google.
So like, it tells you how _popular_ something is.

Being a JS enthusiast, I wanted to see how [ReactJS] fairs against [AngularJS].
This is the trends chart:

<script type="text/javascript" src="https://ssl.gstatic.com/trends_nrtr/4215_RC01/embed_loader.js"></script>
<script type="text/javascript">
trends.embed.renderExploreWidget("TIMESERIES", {"comparisonItem":[{"keyword":"/m/012l1vxv","geo":"","time":"2015-01-01 2018-12-31"},{"keyword":"/m/0j45p7w","geo":"","time":"2015-01-01 2018-12-31"}],"category":0,"property":""}, {"exploreQuery":"date=2015-01-01%202018-12-31&q=%2Fm%2F012l1vxv,%2Fm%2F0j45p7w","guestPath":"https://trends.google.com:443/trends/embed/"});
</script>

Each year since 2013, somewhere around 28th December, AngularJS falls quite a bit.
And React goes up by a small, yet increasing, percentage.

As a simple google search didn't yield any results, I now turn to the community.

[google trends]: https://www.google.com/trends/
[reactjs]: https://facebook.github.io/react/
[angularjs]: https://angularjs.org/
