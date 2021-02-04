---
layout: note_page
title: Image Build & Optimization
title_short: docker_images_optimize
dateStr: 2018-08-05
category: Tool
tags: notes reference check
---

This set of notes is taken from a book _Docker High Performance_ by Allan Espinosa, Russ McKendrick and from the official [Docker documentation](https://docs.docker.com).

<br/>

## Optimizing Docker Images

As you keep building and iterating a Docker image, eventually the small container and fast build time goes away when a docker image becomes huge in the order of gigabytes. Then it is worth a while to seek ways to optimize the image building process.

### Reducing deployment time

If deployments happen within your network, consider a **local registry**.

By setting up a local registry, it saves time and bandwidth when distributing Docker images without relying on external hubs.

```sh
# will set a local registry running at tcp://dockerhost:5000
docker run --network=host -d registry:2
docker tag someimage dockerhost:5000/someimage
docker push dockerhost:5000/someimage
docker pull dockerhost:5000/someimage
```

More details on setting up a managed Docker registry https://docs.docker.com/registry/deploying

### Improving image build time

Using **registry mirrors** saves time when fetching upstream images.

If the `FROM <image>` is quite large, definitely consider using a **local registry mirror** to speed up the fetch within local network.

In this way, a large image will be fetched **only once** into the mirror and distributed fast within local network.

After a managed local registry mirror is set, add the registry mirror host or ip address to the Docker daemon by updating `/etc/docker/daemon.json` and add into `registry-mirrors` and restart the docker service: `systemctl restart docker.service`

```json
{
  "registry-mirrors": [
    "http://127.0.0.1:5000"
  ]
}
```

Read more https://docs.docker.com/registry/recipes/mirror/

**Reusing image layers** helps speed up the image build process, as a Docker image consists of a series of **layers** combined with the _union filesystem_ of a single image, and reused image layers won't need to be build or fetched again.

How Dockerfile instructions are cached https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#leverage-build-cache

Group the tasks of things that won't expect to change often, i.e. dependency installation, and do them early in the Dockerfile will help reuse those layers.

For example, copy a _dependency file_ and run the installation command before copy the _source files_ into the image, since the source files are expected to **change more often**.

### Reducing the build context size 

Try to **avoid copy unnecessary files** into the image.

Use **`.dockerignore`** file in the same directory as the Dockerfile to omit some kind of directories or files from being copied into the image.

More on `.dockerignore` https://docs.docker.com/reference/builder/#dockerignore-file

**Omitting the build context** can be useful in situations where your `Dockerfile` does NOT require files to be copied into the image, and improves the build-speed, as no files are sent to the daemon. It can be done by passing the build context through **STDIN**

```sh
docker build -t myimage:latest -<<EOF
FROM busybox
RUN echo "hello world"
EOF
docker build [OPTIONS] -f- CONTEXT_PATH # read Dockerfile from STDIN
```

### Using caching proxies 

Another common problem that causes long runtimes in building Docker images is **instructions that download dependencies**, such as fetching packages from `yum` repositories or python modules.

A useful technique to reduce the time for these build instructions is to introduce **proxies** that cache such dependency packages, such as

- _apt-cacher-ng_: supports caching _Debian_, _RPM_, and other distribution-specific packages
    - https://www.unix-ag.uni-kl.de/~bloch/acng
- _Sonatype Nexus_: supports _Maven_, _Ruby Gems_, _PyPI_, and _NuGet_ packages out of the box
    - http://www.sonatype.org/nexus
- _Polipo_: a generic caching proxy that is useful for development
    - http://www.pps.univ-paris-diderot.fr/~jch/software/polipo
- _Squid_: another popular caching proxy that can work with other types of network traffic
    - http://www.squid-cache.org/

This technique is useful when we develop **base** Docker images for our team or organization.

> In general, it is recommended that we verify the contents of public Docker images in environments, such as Docker Hub, instead of blindly trusting them.

<br/>

## Reducing Docker image size

While the increase of the image size is inevitable as more changes and features added to the program being containerized, there are some good practices to help _reduce the image size_ or _speed up the build_.

### Avoid unnecessary packages

Avoid installing extra or unnecessary packages just because they might be "nice to have."

Docker images grow big because some instructions are added that are unnecessary to build or run an image.

**Limiting each container to one process** is a good rule of thumb, but it is not a hard and fast rule. Use your best judgment to keep containers as clean and modular as possible.

### Chaining commands 

Packaging **metadata and cache** are the common parts of the code that are usually increased in size. A Docker image's size is basically the **sum of each individual layer image** (more specifically, only `RUN COPY ADD` creates layers, other instructions creates temporary intermediate layers that won't add up image size); this is how **union filesystems** work. That's why installing packages and removing cache in a separate step will not reduce the image size, like following practice:

```sh
FROM debian:stretch

RUN echo deb http://httpredir.debian.org/debian stretch-backports main \
    > /etc/apt/sources.list.d/stretch-backports.list
RUN apt-get update
RUN apt-get --no-install-recommends install -y openjdk-11-jre-headless
RUN rm -rfv /var/lib/apt/lists/* # won't reduce the final image size
```

There is no such thing as _negative layer size_, and so each instruction in a Dockerfile can only keep the image size **constant** or **increase** it. Instead, the **cleaning** steps should be performed in the **same image layer as where those changes were introduced**.

Docker uses `/bin/sh` to run each instruction given to `RUN`, so can use **`&&`** to **chain commands**. Alternatively, (when there are many instructions) put the commands in a **shell script**, copy the script in and run the script.

Whenever possible, ease later changes by **sorting multi-line arguments** alphanumerically. This helps to avoid duplication of packages and make the list much easier to update.

```sh
FROM debian:stretch

RUN echo deb http://httpredir.debian.org/debian stretch-backports main \
    > /etc/apt/sources.list.d/stretch-backports.list && \
    apt-get update && \
    apt-get --no-install-recommends install -y openjdk-11-jre-headless && \
    rm -rfv /var/lib/apt/lists/*
```

### Separating build and deployment images 

**Source libraries**, such as compilers and source header files, are only necessary when **building an application** inside a Docker image. After the application is built, only the compiled binary and related shared libraries are needed to run the application.

For example, use an image with `jdk` installed to build **jar** files then use an image with `jvm` to run the jars; use an image with `golang` installed to build the **binary** from go source and use a small Linux base-image (better, `alpine` or `busybox`) to run the binary.

This build is bad, as the image is used to build the app and also run the app. The go compilers and static libraries for the build are unnecessary when running the app.

```sh
FROM golang:1.11-stretch

ADD hello.go
RUN go build hello.go
EXPOSE 8080
ENTRYPOINT ["./hello"]
```

#### Multi-stage image build

```sh
# this base-image serve as a build stage for the final image
FROM golang:1.11-stretch

ADD hello.go hello.go
RUN go build hello.go

# Good to have a base image that has some debugging tools
FROM busybox

COPY --from=0 /go/hello /app/hello
# The libraries are obtained from running `ldd hello` which prints shared object dependencies on the binary
COPY --from=0 /lib/x86_64-linux-gnu/libpthread.so.0 \
                    /lib/x86_64-linux-gnu/libpthread.so.0
COPY --from=0 /lib/x86_64-linux-gnu/libc.so.6 /lib/x86_64-linux-gnu/libc.so.6
COPY --from=0 /lib64/ld-linux-x86-64.so.2 /lib64/ld-linux-x86-64.so.2
WORKDIR /app
EXPOSE 8080
ENTRYPOINT ["./hello"]
```

**Multi-stage** builds allow you to drastically reduce the size of your final image, without struggling to reduce the number of intermediate layers and files.

- the image is built during the final stage of the build process, you can minimize image layers by leveraging **build cache**
- **order the instructions** from the less frequently changed to the more frequently changed to ensure the build cache is reusable
    - install tools for building the app
    - install or update library dependencies
    - generate the app

```sh
FROM golang:1.11-alpine AS build

# Install tools required for project
# Run `docker build --no-cache .` to update dependencies
RUN apk add --no-cache git
RUN go get github.com/golang/dep/cmd/dep

# List project dependencies with Gopkg.toml and Gopkg.lock
# These layers are only re-built when Gopkg files are updated
COPY Gopkg.lock Gopkg.toml /go/src/project/
WORKDIR /go/src/project/
# Install library dependencies
RUN dep ensure -vendor-only

# Copy the entire project and build it
# This layer is rebuilt when a file changes in the project directory
COPY . /go/src/project/
RUN go build -o /bin/project

# This results in a single layer image
FROM scratch
COPY --from=build /bin/project /bin/project
ENTRYPOINT ["/bin/project"]
CMD ["--help"]
```

<br/>

## Frequently-used Docker CLI commands reference

```sh
docker info # prints a summary of current docker environment
docker help # see a list of docker commands
docker pull <image> # pull down an image
docker images # list local cached docker images
docker run <image> # run a container
docker ps # see running containers
docker kill <container_id>.. # stop containers
docker rm <container_id>.. # remove containers
docker rmi <image>.. # remove docker images
docker build -t <image>:<tag> .  # create image using current directory's Dockerfile

# handy operations
docker rmi $(docker images -f "dangling=true" -q) # remove dangling images
docker run -p 4000:80 nginx # run a container mapping internal port 4000 to external port 80
docker run -d helloworld # run a container detached (in background)
```

<br/>

## Dockerfile Reference

### How a Docker image is built 

A `Dockerfile` is a text document that describes how a Docker image is built.

The `docker build` command builds an image from a `Dockerfile` and a **context**.

#### build context

The build's **context** is the set of files at a specified _location_, _PATH_, or _URL_. The PATH is a directory on your _local filesystem_. The URL is a _Git repository_ location.

The build is run by the **Docker daemon**, not by the `docker` CLI. The first thing a build process does is send the entire context (**recursively**) to the daemon.

It's best to start with an empty directory as context and keep your `Dockerfile` in that directory. Add only the files needed for building the `Dockerfile`. Exclude files and directories by adding a `.dockerignore` file.

By convention a `Dockerfile` is located in the root of the build context. 

- use the `-f <path>` flag with `docker build` to point to a `Dockerfile` _anywhere_ in your file system.
- specify a repository and tag at where to save the new image if the build succeeds, with `-t <tag>`
    - multiple `-t` can be used
- each instruction is run **independently**, and causes a new image (layer) to be created
- whenever possible, Docker will re-use the intermediate images (cache) to accelerate the build process

**Build cache** is only used from images that have a **local parent chain**.

- this means that these images were created by previous builds or the whole chain of images was loaded with `docker load`.
- images specified with `docker build --cache-from <image>` do not need to have a parent chain and may be pulled from other registries.
- once a layer is invalidated by the cache, all subsequent instructions generate new layers

Starting with version _18.09_, Docker supports a new backend for executing your builds, the `BuildKit` which can be enabled by setting an environment variable `DOCKER_BUILDKIT=1` before building an image. The BuildKit backend provides many benefits compared to the old implementation.

Learning about [BuildKit](https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/experimental.md) for new features

### Dockerfile instructions 

#### FROM

???+ note "Code"
    ```sh
    FROM [--platform=<platform>] <image> [AS <name>]
    FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
    FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]

    # example
    ARG VERSION=latest
    FROM busybox:$VERSION
    ARG VERSION
    RUN echo $VERSION > image_version

    FROM extras:${VERSION}
    CMD  /code/run-extras
    ```

**`FROM`** initializes a new build stage and sets the Base Image for subsequent instructions.

- can appear multiple times within a single `Dockerfile` to create multiple images or use one build stage as a _dependency_ for another
- a valid `Dockerfile` must start with a `FROM` instruction
- `--platform` flag can be used to specify the platform of the image in case `FROM` references a multi-platform image, i.e. `linux/amd64`
- a name can be given to a new build stage by adding `AS <name>` and used in `COPY --from=<name|index>`
- `tag` or `digest` values are optional, default use `latest` tag
- `FROM` instructions support **variables** that are declared by any `ARG` instructions that occur before the _first_ `FROM`
    - An `ARG` declared before a `FROM` is outside of a _build stage_, so it can’t be used in any instruction after a `FROM`.
    - To use the default value of an `ARG` declared before the first `FROM` use an `ARG` instruction without a value inside a build stage
- **Tip** use `alpine` as the baseimage whenever you can

#### RUN

???+ note "Code"
    ```sh
    # Following both are valid
    RUN /bin/bash -c 'source $HOME/.bashrc; \
                      echo $HOME'
    RUN ["/bin/bash", "-c", "echo hello"]
    ```

**`RUN`** instruction will execute any commands in a _new layer_ on top of the current image and commit the results; the committed image will be used for the next step/instruction

- Docker commits are cheap and containers can be created from any point in an image's history, much like source control.
- the cache for a `RUN` will be reused during the next build.
    - the cache can be invalidated by using the `docker build --no-cache` flag
    - the cache for `RUN` instructions can be invalidated by `ADD` and `COPY` instructions
- two forms of `RUN` instruction
    - `RUN <command/script>` is called the _shell form_
        - implicitly invoking `/bin/sh -c` on the command passed in
        - can do variable substitution
    - `RUN ["executable", "param1", "param2"]` is called the _exec form_
        - pass the _executable_ with full path
        - does NOT invoke a command shell, NO _variable substitution_, more like to concatenate the array into a string command
        - must use **double quotes** as it is parsed as JSON array
        - can run commands using a different shell executable
        - necessary to escape backslashes
- **Tip**
    - split long or complex `RUN` statements on multiple lines separated with `backslashes` to make your `Dockerfile` more readable, understandable, and maintainable. Or better: put them in a script
    - always combine _update_ and _install_ statements in the same `RUN` instruction, as well as steps to clean up the _installation cache_
    - Using `RUN apt-get update && apt-get install -y` ensures your `Dockerfile` installs the _latest_ package versions with no further coding or manual intervention. This technique is known as _cache busting_. You can also achieve cache-busting by specifying a package version. This is known as _version pinning_.
    - if using pipes, prepend `set -o pipefail &&` to ensure that an unexpected error prevents the build from inadvertently succeeding

#### CMD

???+ note "Code"
    ```sh
    CMD ["/usr/bin/wc","--help"]
    CMD echo "This is a test." | wc -
    ```

**`CMD`** instruction provides defaults for an executing container.

- there can only be one `CMD` instruction in a `Dockerfile`, otherwise, only the last `CMD` will be used
- if `CMD` is used to provide default arguments for the `ENTRYPOINT`, then both of them should be specified with the JSON array format
- three forms of `CMD` instruction
    - `CMD ["executable", "param1", "param2"]` is called the **exec form**, and is preferred form
        - pass the _executable_ with full path
        - does NOT invoke a command shell, NO _variable substitution_, more like to concatenate the array into a string command
        - must use **double quotes** as it is parsed as JSON array
    - `CMD ["param1","param2"]` provides default parameters to `ENTRYPOINT` which is necessary to be present
    - `CMD command param1 param2` is called the **shell form**
        - implicitly invoking `/bin/sh -c` on the command passed in

#### LABEL

???+ note "Code"
    ```sh
    LABEL multi.label1="value1" multi.label2="value2" other="value3"
    ```

**`LABEL`** instruction adds metadata to an image.

- it is a _key-value pair_, multiple can be specified on the same instruction, separated with _spaces_
- key can contain periods and dashes
- use _double quotes_ to include spaces in the value or a _backslash_ to span string to multiple lines
- Labels included in base or parent images are inherited
- use `docker image inspect --format='' <image>` to see just the labels

#### EXPOSE

???+ note "Code"
    ```sh
    EXPOSE <port> [<port>/<protocol>...]
    ```

**`EXPOSE`** instruction informs Docker that the container listens on the specified network ports at runtime.

- specify whether the port listens on TCP or UDP, default is TCP
- it does not actually publish the port but to serve as a **documentation** to tell the user which ports are intended to be published
- to actually map and publish the port when running the container, use `docker run -p <internal-port>:<external-port> <image>`
    - this method takes precedence than what is specified in the `Dockerfile`
- use `docker run -P <image>` to publish all exposed ports and map to high-order ports i.e. `80:80`

#### ENV

???+ note "Code"
    ```sh
    ENV <key> <value>
    ENV <key>=<value> ...
    ENV myName="John Doe" myDog=Rex\ The\ Dog \
        myCat=fluffy
    ENV myDog Rex The Dog
    ```

**`ENV`**  instruction sets the environment variable `<key>` to the value `<value>`

- this value will be in the environment for all **subsequent instructions** in the **build stage**
- to set a value for a **single command**, use `RUN <key>=<value> <command>` (`RUN`'s shell form)
- environment variables set will **persist** when a container is run from the resulting image
- can view the environment variables values using `docker inspect` on an image
- environment variables can also be set when running `docker run --env <key>=<value>`
- **variable expansion** is supported by `ADD COPY ENV EXPOSE FROM LABEL STOPSIGNAL USER VOLUME WORKDIR ONBUILD`
- two forms:
    - `ENV <key> <value>` sets a single variable to a value
        - entire string after the first space will be treated as the value
    - `ENV <key>=<value> ...` sets multiple variables to be set at one time
- **Tip** if you don't want to have an ENV var persist to the container, use the **define, use, unset** approach in a single instruction

#### ADD

???+ note "Code"
    ```sh
    ADD [--chown=<user>:<group>] <src>... <dest>
    ADD [--chown=<user>:<group>] ["<src>",... "<dest>"]
    ```

**`ADD`**  instruction copies **new files**, **directories** or **remote file URLs** from `<src>` and adds them to the filesystem of the image at the path `<dest>`

- `--chown` is for building on Linux system only
    - new files and directories are created with a `UID and GID of 0`, unless specified otherwise
    - providing a username without groupname or a UID without GID will use the _same_ numeric UID as the GID
- source paths are interpreted as **relative** to the **source of the context** of the build
- CANNOT use `..` to leave the context directory
- source paths can contain **wildcards**
- if source path is a **directory**, the **entire contents** of the directory are copied, including filesystem metadata
- if source path is an `URL` and destination path does NOT end with a _backslash_, then the file is downloaded as the **destination path**; otherwise, the filename is inferred from the URL and saved in the destination path directory
- if source path is a **local compressed tarball archive**, it is **unpacked** as a directory in the destination path; `URL` downloaded archive will NOT be auto decompressed
- if multiple source paths are specified, the destination path must be a directory and **ends with a _backslash_**
- destination path is an **absolute path** or **relative path to `WORKDIR`** inside the image and will be created if not exist

You can also pass a compressed archive through STDIN: (`docker build - < archive.tar.gz`), the `Dockerfile` at the _root_ of the archive and the rest of the archive will be used as the **context** of the build.

#### COPY

???+ note "Code"
    ```sh
    COPY [--chown=<user>:<group>] <src>... <dest>
    COPY [--chown=<user>:<group>] ["<src>",... "<dest>"]
    ```

**`COPY`** instruction copies new **files or directories** from `<src>` and adds them to the filesystem of the container at the path `<dest>`

- like `ADD` but work only for **files and directories**
- optionally accepts a flag `--from=<name|index>` that can be used to set the **source location** to a previous **build stage** (created with `FROM .. AS <name>`) that will be used instead of a build **context** sent by the user
- the first encountered `COPY` instruction will **invalidate the cache** for all following instructions if the CONTENTS of one of its source paths have changed
- **Tip**
    - prefer `COPY` over `ADD` unless using the convenience provided by `ADD`
        - use `curl` or `wget` to fetch files allows having the chance to discard unwanted files in the same instruction
    - if you have multiple `Dockerfile` steps that use different files from your context, `COPY` them **individually**, rather than all at once. This ensures that each step's build cache is only invalidated if the specifically required files change.

#### ENTRYPOINT

???+ note "Code"
    ```sh
    ENTRYPOINT ["/script/start.sh"]
    ```

**`ENTRYPOINT`** instruction configures how a container will run as an executable

- two forms
    - `ENTRYPOINT ["executable", "param1", "param2"]` is called the **exec form**
    - `ENTRYPOINT command param1 param2` is called the **shell form**
- _command line arguments_ to `docker run <image>` will be APPENDED after all elements in an _exec form_ `ENTRYPOINT` and will **override** all elements specified using `CMD`
- you can override the `ENTRYPOINT` instruction using the `docker run --entrypoint` flag
- shell form **PREVENTS** any `CMD` or `docker run` command line arguments from being used
- shell form will start the command with `/bin/sh -c` and has some disadvantages
    - executable will **NOT** be the container's `PID 1`
    - executable will **NOT** receive Unix signals and it will **NOT** receive `SIGTERM` signal from `docker stop <container>`
    - to fix the above two issues, make sure to start a command with `exec` which will invoke the command in another shell session, i.e. `ENTRYPOINT exec top -b`
- only the last `ENTRYPOINT` in the `Dockerfile` will be used, if multiple are provided
- if `CMD` is defined from the _base image_, setting `ENTRYPOINT` will RESET `CMD` to an empty value.

#### VOLUME

???+ note "Code"
    ```sh
    VOLUME ["/var/log/"]
    VOLUME /var/log /var/db
    ```

**`VOLUME`** instruction creates a **mount point** with the specified name and marks it as holding externally mounted volumes from native host or other containers.

- if any build steps change the data within the volume after it has been declared, those changes will be discarded
- the host directory (the _mountpoint_) is declared at container **run-time**
- for portability, a given host directory can't be guaranteed to be available on all hosts, thus you can’t mount a host directory from within the Dockerfile
- `VOLUME` does not support specifying a _host-dir_ parameter. You must specify the _mountpoint_ when you **create** or **run** the container
- **Tip** `VOLUME` should be used to expose any database storage area, configuration storage, or files/folders created by your docker container.
    - You are strongly encouraged to use `VOLUME` for any _mutable_ and/or _user-serviceable_ parts of your image.

More on Docker volumes is [here](https://docs.docker.com/storage/volumes/)

#### USER

???+ note "Code"
    ```sh
    USER <user>[:<group>]
    USER <UID>[:<GID>]
    ```

**`USER`** instruction sets the `user` name (or `UID`) and optionally the user `group` (or `GID`) to use when running the image and for any `RUN`, `CMD` and `ENTRYPOINT` instructions follows

- when specifying a group for the user, the user will have ONLY the specified group membership
- when the user doesn’t have a primary group then the image (or the next instructions) will be run with the root group
- **Tip**
    - if a service can run without privileges, use `USER` to change to a **non-root** user
    - avoid installing or using `sudo` as it has unpredictable TTY and signal-forwarding behavior that can cause problems
    - if you absolutely need functionality similar to `sudo`, such as initializing the daemon as root but running it as non-root, consider using `gosu`
    - avoid switching USER back and forth frequently

#### WORKDIR

**`WORKDIR`**  instruction sets the working directory for any `RUN`, `CMD`, `ENTRYPOINT`, `COPY` and `ADD` instructions follows

- if the `WORKDIR` doesn’t exist, it will be **created**
- it can be used multiple times `WORKDIR /path/to/workdir`
- it could be a relative path to previous `WORKDIR`
- it can interpret variables set with `ENV`
- without a `WORKDIR` instruction, the work directory in the image is the root
- **Tip**
    - always use absolute paths for `WORKDIR`
    - use `WORKDIR` instead of proliferating instructions like `RUN cd … && do-something`, which are hard to read, troubleshoot, and maintain

#### ARG

???+ note "Code"
    ```sh
    ARG user1=someuser
    ARG ${user2:-some_user}
    ARG buildno
    ```

**`ARG`** instruction defines a variable that users can pass at _build-time_ to the builder with the `docker build` command using the `--build-arg <varname>=<value>` flag

- a default value can be set with `ARG`
- undefined variable results in empty string
- do not use it to pass secrets; build-time variables are visible in the image with `docker history` command
    - use **BuildKit** instead
- `ARG` instruction goes out of scope at the end of the build stage where it was defined
    - to use an arg in multiple stages, each stage must include the `ARG` instruction
- variables defined using the `ENV` instruction always override an `ARG` instruction of the same name
- some special predefined `ARG` variables can be set and used without an `ARG` instruction: `HTTP_PROXY HTTPS_PROXY FTP_PROXY NO_PROXY` and their lowercase version
    - they won't be saved in `docker history` neither unless they are included with `ARG`
- some predefined platform `ARG` variables are set automatically: `TARGETPLATFORM TARGETOS TARGETARCH TARGETVARIANT BUILDPLATFORM BUILDOS BUILDARCH BUILDVARIANT`
    - they are not automatically included so need to include an `ARG` instruction to make it available
- if an `ARG` value is different from a previous build, then a "cache miss" occurs upon its first usage, not its definition

#### ONBUILD

???+ note "Code"
    ```sh
    ONBUILD ADD . /app/src
    ONBUILD RUN /usr/local/bin/python-build --dir /app/src
    ```

**`ONBUILD`**  instruction adds to the image a **trigger instruction** to be executed at a later time, when the image is used as the **base** for another build

- it won't affect current build and can be viewed by `docker inspect <image>`
- the trigger will be executed in the **context of the downstream** build; if all triggers succeed, the `FROM` instruction completes and the build continues
- any build instruction can be registered as a trigger; an image can have multiple `ONBUILD` instructions
- it will **NOT** be inherited to the downstream build
- **Tip** images built with `ONBUILD` should get a separate tag, for example: `ruby:1.9-onbuild`

#### STOPSIGNAL

**`STOPSIGNAL`** instruction sets the **system call signal** that will be sent to the container to exit

- can be a valid unsigned number that matches a position in the kernel's syscall table

#### HEALTHCHECK

???+ note "Code"
    ```sh
    HEALTHCHECK --interval=5m --timeout=3s \
      CMD curl -f http://localhost/ || exit 1
    ```

**`HEALTHCHECK`** instruction tells Docker how to test a container to check that it is still working

- when a container has a healthcheck specified, it has a _health status_ in addition to its normal status
- can only be one `HEALTHCHECK` instruction in a `Dockerfile`
- `HEALTHCHECK [OPTIONS] CMD command` and _OPTIONS_ can be:
    - `--interval=DURATION` default 30s, time between every other check
    - `--timeout=DURATION` default 30s, fails if a check takes longer than this timeout
    - `--start-period=DURATION` default 0s, initialization time before starting the check
    - `--retries=N` default 3
- command could be a shell command or an exec JSON array
- any output from the check will be stored in the health status and visible in `docker inspect`

#### SHELL

???+ note "Code"
    ```sh
    SHELL ["/bin/bash", "-c"]
    ```

**`SHELL`**  instruction allows overriding the default shell used for the shell form of commands

- default shell on Linux is ["/bin/sh", "-c"]
- it must be written in **exec JSON form**
- it can appear multiple times
- each `SHELL` instruction overrides all previous `SHELL` instructions, and affects all **subsequent** `RUN CMD ENTRYPOINT` instructions
