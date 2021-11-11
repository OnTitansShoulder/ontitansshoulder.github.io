---
layout: note_page
title: How Netflix Work
title_short: how_netflix_work
dateStr: 2020-07-01
category: Case-Study
tags: notes case-study check
---

This notes it taken from an article on [High Scalability](http://highscalability.com/blog/2017/12/11/netflix-what-happens-when-you-press-play.html)

It's far more complicated and interesting than you might imagine, when you press play on a Netflix video (or _press start on a Netflix title_).

<br/>

## Control the entire stack

The three parts of Netflix: _client_, _backend_, _content delivery network (CDN)_; Netflix controls all of the three and achieved vertical integration and scaling and ensures the users get the contents reliably.
- The _client_ is the user interface on any device used to browse and play Netflix videos.
- Everything that happens before you hit play happens in the _backend_, which runs in AWS.
- Everything that happens after you hit play is handled by Open Connect, Netflix's _CDN_.

<br/>

## Focus on what they do the best

Netflix started online-streaming service with building their own data centers and failed and experienced all the problems that can happen when building data centers. It just doesn't work when you are growing rapidly.

> _Undifferentiated heavy lifting_ are those things that have to be done, but don't provide any advantage to the core business of providing a quality video watching experience.

Netflix then move to AWS for taking away the headache of building reliable infrastructure for their service and remove any single point of failure (SPF); and AWS offered highly reliable databases, storage and redundant datacenters. To Netflix they just **avoided the undifferentiated heavy lifting** and focus on providing business value that **they are good at**.

<br/>

## Ensure the service can be always served

Netflix operates out of _three_ AWS regions: one in North Virginia, one in Portland Oregon, and one in Dublin Ireland. Having three regions, you get reliable service that when any one region fails, the other regions will step in handle all the service traffic in the failed region. Plus, serving traffic from the region closest to where the user is provides faster content delivery.

This is referred as **business continuity plan** (BCP) for some companies. And Netflix calls this their _global services model_. Any customer can be served out of any region. And it doesn't happen automatically; Netflix did their work to guarantee the automatic fail-over happens. Netflix even intentionally takes down one of their regions every month to ensure the system work reliably; they calls it the **chaos testing**.

<br/>

## Netflix's server-side heavy lifting

Netflix takes advantage of the _elasticity_ of the cloud service that AWS offered. Rather than have a lot of extra computers hanging around doing nothing and wait for the peak load, Netflix only had to **pay for _what_ was needed, _when_ it was needed**, by _scaling_ up and down for their service instances.

Plus, anything that doesn't involve serving video is handled in AWS. This includes scalable computing, scalable storage, business logic, scalable distributed databases, big data processing and analytics, recommendations, transcoding, and hundreds of other functions.

**Scalable computing** is EC2 and **scalable storage** is S3. The client devices from users --Smart phones, TV, Tablet, PC, etc-- each request talks to a Netflix service running in EC2.

Netflix uses both DynamoDB and Cassandra for their **scalable distributed databases** so they can just scale up when more data storage is necessary on all their regions, and have enough redundancy to rest assure that the data are safe.

Netflix knows what everyone has watched when they watched it and where they were when they watched and lots more information. Netflix uses machine learning to power **big data processing** and generates **analytics** to improve their products and suggest more relevant contents to its users. Their ultimate goal is to keep users subscribed and attract new users.

Netflix is known for being a data-driven company. One interesting fact is that a movie title image users see might be different for the same movie among some users, and this is because the image displayed is based on analyzing your watch behavior and choosing the one that data suggests can attract you the most. Netflix also use the analytics to choose the best movie images to display from time to time.

<br/>

## The work done to prepare the contents

Netflix gets its contents from the production houses and studios, aka the source media. The videos produced come in a high definition format that's many terabytes in size and need to go through a process of _source media -> video validation -> accept/reject -> media pipeline -> validation -> encoded files_

Validation is a rigorous process to make sure the video is in good quality in terms of color, digital artifacts, frames, etc. And video is rejected if defects are found.

The media pipeline runs as many as 70+ pieces of software operations to produce the result files. And the giant video must be break into much smaller chunks first then the chunks are processed in _parallel_. This consumes lots of CPU power on AWS. Netflix says a source media file can be encoded and pushed to their CDN in as little as 30 minutes.

The result is a pile of files. Netflix need a video in each format that works best for _every_ internet-connected device; to name a few, Windows, Roku, LG, Samsung Blu-ray, Mac, Xbox 360, LG DTV, Sony PS3, Nintendo Wii, iPad, iPhone, Apple TV, Android, Kindle Fire, Comcast X1, etc. And Netflix supports 2200+ different devices.

Netflix also creates files optimized for different network speeds. There are also files for different audio formats. Audio is encoded into different levels of quality and in different languages. There are also files included for subtitles. A video may have subtitles in a number of different languages. Just for the movie _The Crown_, Netflix stores around 1,200 files.

<br/>

## The strategies for serving the contents

Netflix uses CDN to put video as close as possible to users by spreading computers throughout the world. The biggest benefits of a CDN are _speed_ and _reliability_.

Each location with a computer storing video content is called a _PoP_ or point of presence. It houses servers, routers, and other telecommunications equipment.

Netflix has tried three different video streaming strategies: its own small CDN; third-party CDNs; and Open Connect. They started with their own CDN when the video catalog was small enough that each location contained all of its content, and that soon become not enough as more users subscribed and more contents were added. Then Netflix contracted with companies like Akamai, Limelight, and Level 3 to provide CDN services and focused on other higher priority projects. However, 3rd-party CDN solutions are not easily scalable as how Netflix wanted; and they are not utilized well enough. So they built Open Connect.

**Open Connect** is less expensive, delivers better quality video, and more scalable. Netflix developed special hardware for delivering large videos for Open Connect, called _OCAs_. OCAs use the FreeBSD operating system and NGINX for the web server.

Netflix delivers huge amounts of video traffic from thousands of servers in more than 1,000 locations around the world. Unlike Netflix, YouTube and Amazon built their own backbone network to deliver video around the globe, which is very complicated and expensive. So Netflix borrowed the major internet service providers' (ISPs) network by asking them to put OCAs in their datacenters, or put OCAs close to internet exchange locations (IXPs).

This is a brilliant idea and big deal. First, Netflix placed their content very _close to their users_; so when a user ask for a video, the stream traffic never left their ISP's network and therefore is the fastest and the most reliable than any 3rd-party CDNs. Second, it is because the streaming traffics are (for most of the cases) _within the ISP's network_, the ISPs don't need to add more infrastructure to handle the massive video streaming traffic on the Internet. It is a win-win.

Netflix has all this video sitting in S3, and Netflix uses a process called _proactive caching_ to efficiently copy videos to OCAs. It basically means they cache the videos on each OCA based on the data prediction of the most likely watched videos around that location. This list at each OCA is refreshed every night and so is the video cache. The more popular a video, the more OCAs it will be copied to.

Netflix operates what is called a _tiered caching system_: _OCA units -> Small Peering Location -> Large Peering Location (Origin) -> AWS S3_. The OCAs at ISPs and close to IXPs are small ones that won't fit in the entire video catalog. They always ask videos from the closest available video cache of equivalent or larger in size.

For Netflix, a video isn't considered live when it's copied to just one OCA. Only when there are a sufficient number of OCAs with enough copies of the video to serve it appropriately, will the video be considered live and ready for members to watch.

There's never a cache miss in Open Connect. Since Netflix knows where a video is cached at any time, if a small OCA doesn't have a video, one of the larger OCA location guarantees to have it. Netflix also do load-balancing on the OCAs so to prevent some OCAs from being overwhelmed by unusually high traffic.

Open Connect is a very reliable and resilient system.

<br/>

## Netflix controls the client

Netflix handles failures gracefully because it _controls the client_ on every device running Netflix. They do so from the apps they developed and through the SDK they offered to consume their services. From there, Netflix can adapt consistently and transparently to slow networks, failed OCAs, and any other problems that might arise.

Netflix uses the client's IP address and information from ISPs to identify which OCA clusters are the best to use. The client then tests the quality of the network connection to each OCA and select the fastest and most reliable OCA and determine the best way to receive content from that OCA considering the network quality. The client keeps running these tests throughout the video streaming process.
