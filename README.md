ecr-repo-list
=============
This is a quick web interface I threw together to list the repositories, and the images they contain in an [Amazon ECR] registry. It consists of a server side proxy, written in go and a mixture of [Bootstrap] and [JQuery] for the web interface.

It was primarily written to allow people in the organisation to view the list of different types of containers we hold in our registry and what tags we have for a given container. It lacks any form of authentication, so you should make appropriate considerations around security of the data shown. We run this behind our firewall but with no other authentication.

Screenshots
===========

index
-----
![Example of the homepage](https://raw.githubusercontent.com/rk295/ecr-repo-list/master/screenshots/index.png "Example of the homepage")

Repo listing
------------
![Example of a repository list](https://raw.githubusercontent.com/rk295/ecr-repo-list/master/screenshots/repo-list.png "Example of a repository list")

Code
====

The app is split into two parts, a Go API and a JS/Html UI.

API
---

The API is a simple [Gin] web app, mostly it is a proxy to the Go AWS SDK methods `DescribeRepositories` and `DescribeImages`. Unlike the GO SDK methods this API does not support pagination, before sending the response to the client all pages of the response are collated together. This design decision was based around my current `$work` only having a hundred or so repositories, and only very few of the repos have more than a few hundred containers in them. I felt this produced a simpler UX for the intended users, simply showing all the responses on one page. At a later date I might support pagination in the UI, if it becomes apparent it really needs it. PR's welcome!

UI
--

The UI is built using [Bootstrap] V4 with [Handlebars] used for templating, [JQuery] is used to fetch the JSON from the API.

Config
======

There is only really one thing to configure, in the file `static/js/config.js` the first line reads:

```js
var registryID = 'REPLACE_ME';
```

You should replace `REPLACE_ME` with the [Amazon ECR] registry id of your registry. *Note*: if using the docker, you can pass an environment variable named `REGISTRY_ID` via the docker `-e` option.

Running
=======

Standalone
----------

You should be able to simply run `go run main.go` in this directory:

```
% go run main.go
[GIN-debug] [WARNING] Now Gin requires Go 1.6 or later and Go 1.7 will be required soon.

[GIN-debug] [WARNING] Creating an Engine instance with the Logger and Recovery middleware already attached.

[GIN-debug] [WARNING] Running in "debug" mode. Switch to "release" mode in production.
 - using env:	export GIN_MODE=release
 - using code:	gin.SetMode(gin.ReleaseMode)

[GIN-debug] GET    /ping                     --> main.main.func1 (3 handlers)
[GIN-debug] GET    /api/v1.0/:registryID/repositories --> main.getRepoList (3 handlers)
[GIN-debug] GET    /api/v1.0/:registryID/repository/:repositoryName --> main.getContainterList (3 handlers)
[GIN-debug] GET    /                         --> github.com/gin-gonic/gin.(*RouterGroup).StaticFile.func1 (3 handlers)
[GIN-debug] HEAD   /                         --> github.com/gin-gonic/gin.(*RouterGroup).StaticFile.func1 (3 handlers)
[GIN-debug] GET    /favicon.ico              --> github.com/gin-gonic/gin.(*RouterGroup).StaticFile.func1 (3 handlers)
[GIN-debug] HEAD   /favicon.ico              --> github.com/gin-gonic/gin.(*RouterGroup).StaticFile.func1 (3 handlers)
[GIN-debug] GET    /static/*filepath         --> github.com/gin-gonic/gin.(*RouterGroup).createStaticHandler.func1 (3 handlers)
[GIN-debug] HEAD   /static/*filepath         --> github.com/gin-gonic/gin.(*RouterGroup).createStaticHandler.func1 (3 handlers)
[GIN-debug] Environment variable PORT is undefined. Using port :8080 by default
[GIN-debug] Listening and serving HTTP on :8080
```

A simple bash script is provided in the root of this repo to run the API. The API hosts the UI, so browsing to `http://localhost:8080` after running `run` will show the UI.

Docker
------

A `Dockerfile` is included in the root of the repo, this is the way I run the server. It is the file used to create [this](https://hub.docker.com/r/rk295/ecr-repo-list/) container.

A few variables are required to be parsed to the container:

*  `AWS_ACCESS_KEY_ID` - AWS Access key 
*  `AWS_SECRET_ACCESS_KEY` - AWS Secret key
*  `AWS_DEFAULT_REGION` - Default AWS region
*  `REGISTRY_ID` - ID of the registry to browse

If this code is executing on an EC2 instance in some way (either directly, or under Docker/Kubernetes/ECS) then don't set the first two and rely on an IAM Role, its much better!

### Example Docker usage

Running the following command, will run up the latest container and open up port `8080`.
```
docker run \
    -e AWS_ACCESS_KEY_ID="ABCDEFG..." \
    -e AWS_SECRET_ACCESS_KEY="ABCDEFG......" \
    -e AWS_DEFAULT_REGION="eu-west-1" \
    -e REGISTRY_ID="111111111111" \
    -p 8080:8080 \
    rk295/ecr-repo-list

```

[Amazon ECR]: https://aws.amazon.com/ecr/
[Bootstrap]: https://getbootstrap.com/
[JQuery]: https://jquery.com/
[HandleBars]: https://handlebarsjs.com/
[Gin]: https://github.com/gin-gonic/gin