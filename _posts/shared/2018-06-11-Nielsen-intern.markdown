---
layout: post
title:  Software DevOps Intern at Nielsen
ptitle: CI/CD Pipeline for a Golang App
short: Nielsen
long: Nielsen Internship
dateStr: During Summer 2018
thumbUrl: '/assets/img/media/nielsen.jpg'
pthumbUrl: 'https://i.imgur.com/jHRU2rg.jpg'
hasContent: true
imgUrls: ['https://i.imgur.com/ZxuCbs2.jpg', 'https://i.imgur.com/XlfxB8Q.jpg']
tags: life-experience work internship project
summary: Created a CI/CD pipeline by using Jenkins to orchestrate the automated process of test, build, and deploy, which significantly saves time for software quality assurance and deployment into production.
---
As a DevOps intern for Nielsen Engineering, I created a CI/CD pipeline solution that potentially can be used by many other teams for faster integration and delivery.

I used Jenkins to orchestrate:
* running unit tests
* code coverage analysis
* building binaries
* containerizing the application
* running functional tests and regression tests
* create release & deploy to Kubernetes.

Something worth noting is that I was able to minimize the docker container for the Agilemetrics app down to less than 20 MB. I used alpine as the base image (which is a super light-weight linux image with a package-manager!) and statically built the C libraries into the image, which eliminated the dependency of having a full C-library installed on the image. Imagine with an image so small and light-weight, spinning up a container in Docker or a job in Kubernetes can be done almost instantly, as well as the tremendous computing power saved.

I also implemented mechanism to automatically bumping up the app's semantic version before each production release. The idea is simple, to have Jenkins reading next release number from a VERSION file, then increasing the batch version, and checking a commit back into the master branch.

Meanwhile, the most challenging part is having the environment variables configured correctly and securely. I chose to do this with shell scripts to provide default vars for testing purposes as well as the vars that hardly change for this Agilemetrics app. Other vars such as secrets and passwords are injected using Jenkins plug-ins that can be configured for different environment.

I was amazed for how much I can learn and do within only five weeks of my internship. I want to thank my manager, Jason Olmsted, as well as my coworker, Vishwak Tadisina, who provided so much help and guidance during my internship.

![Golang Logo](/assets/logos/golang.png) -- ![Jenkins Logo](/assets/logos/jenkins.png) -- ![Docker Logo](/assets/logos/docker.png) -- ![Kubernetes Logo](/assets/logos/kubernetes.png)
