This site is built with Jekyll for my ease of adding the most recent stories and projects.

* Exp - 285x150 (19:10)
* Proj - 375x245 (75:49)
* Carousel - 16x9 (908x511)
* Vertical - N/A?

post layout parameter functions:
* title - displayed on experience card title (and as h1 in article)
  * ptitle - used on project type post
* short - used for card id
* long - displayed on experience shortcut title
* dateStr - displayed as date range
* thumbUrl - displayed on experience card as image
* pthumbUrl - displayed on project card as image
* categories - life-experience vs. project vs. shared
* summary - displayed on both experience & project as summary

- brief - if set, displays a button to expand for more info. no need to write articlle for this type of experiences.
- ext-web - if set, displays a button leads to external web pages
- video-link - if set, displays a button leads to youtube video

- hasContent - if is set, then card title rendered as click-able and leads to article.
- imgUrls - if hasContent, then need array of img urls for display carousel
