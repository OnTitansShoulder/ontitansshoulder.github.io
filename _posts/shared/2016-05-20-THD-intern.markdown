---
layout: post
title:  Internship at The Home Depot IT
short: THDIntern16
long: THD Internship 2016
dateStr: During Summer 2016
thumbUrl: 'https://i.imgur.com/yIvWT15.png'
hasContent: true
imgUrls: ['https://i.imgur.com/1b834G3.png', 'https://i.imgur.com/YSUCwqB.png']
categories: [shared, work, internship, project]
summary: Worked on a backend RESTful service, built with spring-boot, to intercept purchase orders and add another security level.
---
### The business need:
THD had some procurement systems that passes credit card numbers (CC#) on to their partners without encryption.

The purposes of the Interceptor:
* serve as a middleman between the procurement systems and THD partners
* add a encryption layer and make this process PCI compliant
* collectively encrypt the credit card info and replace it in the original context, and send the requests to ecommerce.

My partner and I used Java Springboot to create the RESTful service endpoints as well as the logic of parsing, encrypting, replacing original, and pass on, all in the combination of xml or json formats. We also deployed the application to Google Cloud Platform.


![Java Logo](/assets/logos/java.png) -- ![Springboot Logo](/assets/logos/spring-boot.png) -- ![Google Cloud Platform Logo](/assets/logos/GCP.png)
