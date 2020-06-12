
# Cloudstate Sample Chat Application

## Prerequisites

First make sure [your local environment is setup appropriately](cloudstate-samples#prerequisites).

## Sample application layout
Grab the sample application from github:
 
[https://github.com/lightbend/cloudstate-chat-sample](https://github.com/lightbend/cloudstate-chat-sample)

The sample application consists of three services:
* A stateless service `chat`
* A stateful Entity based service `friends`
* A stateful CRDT based service `presence`

Additionally:
* A `cloudstate` directory that contains the needed protobuf definitions.
* A `deploy` directory that contains the deployment yaml files.
* An `envoy` directory for running a local envoy proxy instance (local testing only).

## Quick Install

All the latest docker images are available publicly at `lightbend-docker-registry.bintray.io/`.

To deploy the chat application as is, connect to your kubernetes environment and do the following.

```bash
cd deploy
kubectl apply -f . -n <project-name>
# To Verify
kubectl -n <project-name>  get statefulservices
NAME       REPLICAS   STATUS
friends    1          Ready
presence   1          Ready
```

To access the front end chat interface open a web browser and navigate to:

`https://<project-name>.us-east1.apps.lbcs.dev/pages/chat.html`

If you would like to make changes and build the application, please follow the
instructions in the section below.

## Building and deploying the Sample application

### Friends Service
```
cd friends
nvm install
nvm use
npm install
npm run prestart
```

This will compile the protobuf and `user-function.desc` files.

Build a docker image with the right registry and tag
```
docker build . -t <my-registry>/friends:latest
```

Push the docker image to the registry
```
docker push <my-registry>/friends:latest
```

Deploy the image by changing into the deploy folder and editing the `friends.yaml` to point to your docker image that you just pushed.
```
$ cd ../deploy
$ cat friends.yaml
apiVersion: cloudstate.io/v1alpha1
kind: StatefulService
metadata:
  name: friends
spec:
  containers:
  - image: lightbend-docker-registry.bintray.io/cloudstate-samples/friends:latest    # <-- Change this to your image
    name: friends
```

Deploy the service to your project namespace
```
$ kubectl apply -f friends.yaml -n <project_name>
statefulservice.cloudstate.io/friends created
````

### Presence Service
```
cd ../presence
nvm install
nvm use
npm install
npm run prestart
```

This will compile the protobuf and `user-function.desc` files.
Build a docker image with the correct registry and tag
```
docker build . -t <my-registry>/presence:latest
```

Push the docker image to the registry
```
docker push <my-registry>/presence:latest
```

Deploy the image by changing into the deploy folder and editing the `presence.yaml` to point to your docker image that you just pushed.
```
$ cd ../deploy
$ cat presence.yaml
apiVersion: cloudstate.io/v1alpha1
kind: StatefulService
metadata:
  name: presence
spec:
  containers:
  - image: lightbend-docker-registry.bintray.io/cloudstate-samples/presence:latest    # <-- Change this to your image
    name: presence
```

Deploy the service to your project namespace
```
$ kubectl apply -f presence.yaml -n <project-name>
statefulservice.cloudstate.io/presence created
````

### Verify they are running
Check that the services are running
```
$ kubectl get statefulservices -n <project-name>
NAME       REPLICAS   STATUS
friends    1          Ready
presence   1          Ready
```

To redeploy a new image to the cluster you must delete and then redeploy using the yaml file.  
For example if we updated the friends docker image we would do the following.
````
$ kubectl delete statefulservice friends -n <project-name>
statefulservice.cloudstate.io "friends" deleted
$ kubectl apply -f friends.yaml -n <project-name>    
statefulservice.cloudstate.io/friends created
````


### Chat
The chat service is a front end web application written in typescript.  It is backed by a `stateless` service that will serve the compiled javacript, html and images.

This service makes `grpc-web` calls directly to the other services to get the data that it needs.  In order to do this we need to compile the proto definitions from the other two services as well as generate the grpc-web clients.  This is all done with a shell script `protogen.sh`.  Let's first install dependencies, including the cloudstate javascript client library, and then run the protogen script. Next compile the service definition and finally compile our typescript.

```
cd ../chat
nvm install
nvm use
npm install
./protogen.sh
npm run prestart
npm run-script build
```

We now have everything in place to build our docker image
```
docker build . -t <my-registry>/chat:latest
```

Push the docker image to the registry
```
docker push <my-registry>/chat:latest
```

Deploy the image by changing into the deploy folder and editing `chat.yaml` to point to your docker image that you just pushed.
```
$ cd ../deploy
$ cat chat.yaml
apiVersion: cloudstate.io/v1alpha1
kind: StatefulService
metadata:
  name: chat
spec:
  containers:
  - image: ightbend-docker-registry.bintray.io/cloudstate-samples/chat:latest    # <-- Change this to your image
    name: chat
```

Deploy the service to your project namespace
```
$ kubectl apply -f chat.yaml -n <project-name>
statefulservice.cloudstate.io/chat created
```

## Routes
The last thing that is required is to provide the public routes needed for both the front end and grpc-web calls.  These exist in the `routes.yaml` file.

```
cat routes.yaml
apiVersion: cloudstate.io/v1alpha1
kind: Route
metadata:
  name: "chat-routes"
spec:
  http:
  - name: "friends-routes"
    match:
    - uri:
        prefix: "/cloudstate.samples.chat.friends.Friends/"
    route:
      service: friends
  - name: "presence-routes"
    match:
    - uri:
        prefix: "/cloudstate.samples.chat.presence.Presence/"
    route:
      service: presence
  - name: "chat-routes"
    match:
    - uri:
        prefix: "/"
    route:
      service: chat
```

Add these routes by performing
```
kubectl apply -f routes.yaml -n <project-name>
```

Open a web browser and navigate to:

`https://<project-name>.us-east1.apps.lbcs.io/pages/chat.html`

You should now see the front end chat interface.

## Maintenance notes

### License
The license is Apache 2.0, see [LICENSE-2.0.txt](LICENSE-2.0.txt).

### Maintained by
__This project is NOT supported under the Lightbend subscription.__

This project is maintained mostly by @coreyauger and @cloudstateio.

Feel free to ping above maintainers for code review or discussions. Pull requests are very welcome–thanks in advance!


### Disclaimer

[DISCLAIMER.txt](DISCLAIMER.txt)
