---
layout: post
title:  Internship at The Home Depot IT
ptitle: Payment Requests Interceptor
short: THDIntern16
long: THD Internship 2016
dateStr: During Summer 2016
thumbUrl: '/assets/img/media/homedepot.jpg'
pthumbUrl: 'https://i.imgur.com/toitItR.jpg'
hasContent: true
imgUrls: ['https://i.imgur.com/8t3FEEE.jpg', 'https://i.imgur.com/PWNS6Im.jpg']
categories: [shared, work, internship, project]
summary: Worked on a backend RESTful service, built with spring-boot, to intercept purchase orders and add another security level.
---
### The business need:
THD had some procurement systems that passes credit card numbers (CC#) on to their partners without encryption.

The purposes of the Interceptor:
* serve as a middleman between the procurement systems and THD partners
* add a encryption layer and make this process PCI (Payment Card Industry) compliant
* collectively encrypt the credit card info and replace it in the original context, and send the requests to ecommerce.

My partner and I used Java Springboot to create the RESTful service endpoints as well as the logic of parsing, encrypting, replacing original, and pass on, all in the combination of xml or json formats. We also deployed the application to Google Cloud Platform.

This project is valuable as it is configurable and ready to be deployed for any new THD partner that need PCI compliant enforced.

![Java Logo](/assets/logos/java.png) -- ![Springboot Logo](/assets/logos/spring-boot.png) -- ![Google Cloud Platform Logo](/assets/logos/GCP.png)
