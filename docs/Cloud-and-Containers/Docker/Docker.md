---
layout: note_page
title: Docker Knowledge
title_short: docker_knowledge
dateStr: 2018-08-05
category: Tool
tags: notes reference check
---

This set of notes is taken from the book _Docker In Action_ by Jeffrey Nickoloff and Stephen Kuenzli, _Docker Deep Dive_ by Nigel Poulton, and from the official [Docker documentation](https://docs.docker.com).

## Docker at High Level

The main difference between a container and a VM is that a running container shares the **kernel** of the host machine it is running on.

On a Windows machine, a Linux container run either inside a lightweight Hyper-V VM or using the Windows Subsystem for Linux (WSL), which offers better performance and compatibility.

There are three things regarding how Docker works:

- The runtime - operates at the lowest level
    - buliding OS constructs, namespaces, cgroups
    - responsible for starting and stopping containers
- The daemon - performs high-level tasks and exposing APIs
- The orchestrator

### Docker runtime

The low-level runtime is called **runc** and is the reference implementation of Open Containers Initiative (**OCI**) runtime-spec.

OCI sets the standards for the low-level fundamental components of container infrastructure (mainly **image-spec** and **runtime-spec**). That's how Kubernetes can support other container runtime technologies that follows the OCI standards to replace Docker's runc as the runtime.

runc is an interface with the underlying OS and start and stop containers. Every running container needs to fork a new instance of runc when it is being created; the runc exits after successful container creation.

The higher-level runtime is called **containerd** which manages the entire lifecycle of a container, pulling images, creating network interfaces, and managing lower-level runc instances.

### Docker daemon

Docker daemon is above containerd and provides a standard interface that abstracts the lower levels for performing top level actions.

### Orchestractor

Docker has native support for managing clusters of nodes running Docker, called Swarm, and managed through Docker Compose.

## Docker Engine

The Docker engine is the core software that runs and manages containers. It is modular in design and built from many small specialised tools.

The earlier versions of Docker Engine relies on LXC, which is a Linux-specific runtime, and the Docker daemon is designed in a monolithic nature which becomes problematic.

Later Docker engine removed container execution and runtime from the daemon and refactoring them into small, modular, and specialized tools. All container executions are refactored into containerd.

The main components of Docker Engine in a Linux environment:

- dockerd
- docker-containerd
- docker-containerd-shim
- docker-runc

### dockerd

Main functionality of the Docker daemon are:

- image management
- image builds
- exposing REST API
- authentication
- security
- core networking
- orchestration (Swarm)

### docker-containerd-shim

Whenever a container’s parent runc process exits, the associated **containerd-shim** process becomes the container’s parent. A shim process is responsible for:

- keeping any STDIN and STDOUT streams open, separate from the daemon
- reports container's exit status back to daemon

## Docker Images

A Docker **image** is a unit of packaging that contains everything required for an application to run. It works like a stopped container.

Docker images are saved to an image **registry**. A Docker daemon must pull an image to local before running containers out of it.

Images are considered **build-time** constructs, whereas containers are run-time constructs. Images are made up of multiple **layers** that are **stacked** on top of each other and represented as a single object. Inside of the image is a cut-down operating system and all of the files and dependencies required to run an application.

The whole purpose of a container is to run a **single** application or service, so an image should be **small** and stripped off all unnecessary files.

## Containers Deep Dive

Historically, UNIX-style operating systems have used the term **jail** to describe a modified runtime environment that limits the scope of **resources** that a jailed program can access.

Containers are not virtualization. Containers and isolation features have existed for decades. Docker uses Linux namespaces and cgroups, which have been part of Linux since 2007.

As a side note: Hyper-V containers run a single container inside of a dedicated lightweight VM. The container leverages the kernel of the OS running inside the VM.

In Linux, programs that run on top of the operating system runs in the **user space memory** which is isolated from the **kernel space memory**. Running Docker means running two programs in user space: the Docker engine and Docker CLI.

Each running container has its own subspace of the user space memory. Programs running inside a container thus can access ONLY their own memory and resources as scoped by the container.

Docker builds containers using **10 major system features**:

- PID namespace - Process identifiers and capabilities
- UTS namespace - Host and domain name
- MNT namespace - Filesystem access and structure
- IPC namespace - Process communication over shared memory
- NET namespace - Network access and structure
- USR namespace - User names and identifiers
- chroot syscall - sets the location of the filesystem root
- cgroups - Resource protection
- CAP drop - Operating system feature restrictions
- security modules - Mandatory access controls

<img src="https://insights.sei.cmu.edu/media/images/Blog_4_-_3_09252017.original.jpg" />