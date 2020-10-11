---
layout: note_page
title: Kubernetes Volumes How-to
title_short: k8s_volumes
dateStr: 2019-01-01
category: Kubernetes
tags: notes template
---
## kubernetes volumes

```
Volumes are persistent
Volumes defined at pod level, mounted into container, with multiple pods access
Outside locking required; pod can request specific access mode
  RWO(ReadWriteOnce)
  ROX(ReadOnlyMany)
  RWX(ReadWriteMany)
```

$ kubectl create -f vol.yaml --validate=false

need a yaml file:
```
apiVersion: v1
kind: Pod
metadata:
  name: vol1
spec:
  containers:
  - name: centos
    image: centos:7
    command:
      - sleep
      - "3600"
    volumeMounts:
      - mountPath: /centos
        name: test # matches the volume defined at bottom
    name: centos
  - name: centos
    image: centos:7
    command:
      - sleep
      - "3600"
    volumeMounts:
      - mountPath: /centos2
        name: test # matches the volume defined at bottom
    name: centos2
  volumes:
   - name: test
    emptyDir: {}
```

## Persistent Volumes

Sample yaml file:

```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteMany (ReadOnlyMany) (ReadWriteOnce)
  persistentVolumeReclaimPolicy: Retain (Delete) (Recycle deprecated soon)
  nfs:
    path: /data
    server: myserver
    readOnly: false
```

1. prepare hostPath PV
- minikube ssh
- mkdir /mnt/data
- echo "Kubernetes Storage" > /mnt/data/index.html
2. create a PV
- create pv.yaml
- kubectl create -f pv.yaml
- kubectl get pv pv.yaml, notice it is not currently used by a PVC (PersistentVolumeClaim)
3. create a PVC
- create pvc.yaml
- kubectl create -f pvc.yaml
- kubectl get pv pv-volume
- kubectl get pvc pv-claim
4. create a Pod
- create a pv-pod.yaml
- kubectl create -f pv-pod.yaml
- kubectl get pod pv-pod
- kubectl exec -it pv-pod -- /bin/bash
- apt-get update; apt-get install curl
- curl localhost

```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-volume
spec:
  storageClassName: manual
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteMany
  hostPath:
    path: "/mnt/data"
```
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pv-claim
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```
```
apiVersion: v1
kind: Pod
metadata:
  name: pv-pod
spec:
  volumes:
    - name: pv-storage
    PersistentVolumeClaim:
      claimName: pv-claim
  containers:
    - name: pv-container
      image: nginx
      ports:
        - containerPort: 80
        name: "http-server"
      volumeMounts:
        - mountPath: "/usr/share/nginx/html"
          name: pv-storage
```
