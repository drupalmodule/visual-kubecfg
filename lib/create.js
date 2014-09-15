function HandlePodCreateRequest(podCreateRequest) {
        cli.debug("Create mode is " +  createMode);

        switch (createMode) {
                case 'replicas':
                        CreateReplicatedPod(podCreateRequest);
                        break;

                case 'pods':
                        CreateIndividualPodsFromReplicatedPodRequest(podCreateRequest);
                        break;

                default:
                        cli.error("Error: unknown create mode: " + createMode)
        }
}

function GetPodConfigObject(podCreateRequest, hostPort, mode, i) {
        var useI = typeof i != 'undefined';
        var id = podCreateRequest.Labels['Id'] + (useI ? '-' + i : '');
        var nameSlug = podCreateRequest.Name.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();

        switch (typeof mode === 'string' ? mode : createMode) {
                case 'replicas':
                        return {
                                "id": id,
                                "kind": "ReplicationController",
                                "apiVersion": "v1beta2",
                                "desiredState": {
                                        "replicas": podCreateRequest.Replicas,
                                        "replicaSelector": podCreateRequest.Labels,
                                        "podTemplate": {
                                                "desiredState": {
                                                        "manifest": {
                                                                "version": 'v1beta2',
                                                                "id": id,
                                                                "volumes": [],
                                                                "containers": [{
                                                                        "name": nameSlug,
                                                                        "image": podCreateRequest.Image,
                                                                        "ports": [{"containerPort": 80, "hostPort": hostPort, 'protocol': 'TCP'}]
                                                                }]
                                                        },
                                                        'restartPolicy': {},
                                                },
                                                "labels": podCreateRequest.Labels
                                        }},
                                "labels": podCreateRequest.Labels
                        };
                        break;

                case 'pods':
                        return {
                                "kind": "Pod",
                                "id": id,
                                "apiVersion": kubeApiVersion,
                                "desiredState": {
                                        "manifest": {
                                                "id": id,
                                                "version": kubeApiVersion,
                                                "containers": [{
                                                        "name": nameSlug + (useI ? i: ''),
                                                        "version": kubeApiVersion,
                                                        "image": podCreateRequest.Image,
                                                        "ports": [{"containerPort": 80, "hostPort": hostPort, 'protocol': 'TCP'}]
                                                }]
                                        },
                                },
                                "labels": podCreateRequest.Labels
                        };
                        break;

                default:
                        return null;
        }
}
function CreateReplicatedPod(podCreateRequest) {
        if (podCreateRequest.Name == "") return;

        cli.debug("Executing podCreateRequest: " + podCreateRequest);

        // Compute a port for this pod
        var hostPort = PortManager.NextPort(podCreateRequest.Replicas);

        if (hostPort == null) {
                // We goofed
                cli.error("Error: Could not get hostPort for podCreateRequest");
                return;
        }

        var podConfig = GetPodConfigObject(podCreateRequest, hostPort, createMode);

        cli.debug("About to create replication controller request for pod: " + JSON.stringify(podConfig));

        var requestOptions = QueuedConnectionManager.GetRequestOptionsForApi("replicationControllers", "POST");

        var resultHandler = function(error, result) {
                if (error !== null || typeof result !== 'object') {
                        cli.error("Error creating replication controller: " + error + " " + result);
                        return;
                }

                if (typeof result.kind !== 'undefined' && result.kind === "Status") {
                        cli.ok("Adding replicationController " + podConfig.id + " to active operations");
                        ParseOperationStatus(podConfig.id, result);
                }
        }

        QueuedConnectionManager.GetJSONQueryResultConnection(requestOptions, resultHandler, podConfig);
}
function CreateIndividualPodsFromReplicatedPodRequest(podCreateRequest) {
        if (podCreateRequest.Name == "") return;

        cli.debug("Executing podCreateRequest: " + JSON.stringify(podCreateRequest));
        var id = null;

        for (var i = 0; i < podCreateRequest.Replicas; i++) {
                var isRaw = typeof podCreateRequest.RawRequest != 'undefined' && podCreateRequest.RawRequest != null;

                if (isRaw && !podCreateRequest.ValidateRawRequest(1)) {
                        cli.error("podCreateRequest validation failed. Cannot continue creating pod");
                        return;
                }

                var hostPort = null;
                var config = null;

                if (isRaw) {
                        cli.debug("Creating individual pods from RawRequest");

                        // Do this the lazy way
                        config = JSON.parse(JSON.stringify(podCreateRequest.RawRequest));

                        // edit the id
                        if (id == null) {
                                id = config.id;
                        }

                        config.id = id + "-" + i;
                        config.desiredState.manifest.id = id + "-" + i;
                } else {
                        hostPort = PortManager.NextPort();
                        if (hostPort == null) {
                                // We goofed
                                cli.error("Error: Could not get hostPort for podCreateRequest");
                                return;
                        }

                        cli.debug("Trying port " + hostPort);

                        var config = GetPodConfigObject(podCreateRequest, hostPort, createMode, i)

                        if (config == null) {
                                cli.error("An error occured retrieving the config");
                        }
                }

                (function (podConfig) {
                        var t = 1;
                        cli.debug("About to create pod " + i + ": " + JSON.stringify(podConfig));

                        var requestOptions = QueuedConnectionManager.GetRequestOptionsForApi("pods", "POST");

                        var resultHandler = function(error, result) {
                                if (error !== null || typeof result !== 'object') {
                                        cli.error("Error querying operation status: " + error + " " + result);
                                        if (t === 1) {
                                                // Try once more
                                                t ++;
                                                QueuedConnectionManager.GetJSONQueryResultConnection(requestOptions, resultHandler, podConfig);
                                        }
                                        return;
                                }

                                if (typeof result.kind !== 'undefined' && result.kind === "Status") {
                                        cli.ok("Adding " + podConfig.id + " to active operations");
                                        ParseOperationStatus(podConfig.id, result);

                                        var pod = new Pod(podConfig.labels.name, [], '', podConfig.labels, podConfig);
                                        pod.CreateStatus = result;
                                        pods.push(pod);
                                        PushPodsToSockets(pods, sockets);
                                }
                        }

                        QueuedConnectionManager.GetJSONQueryResultConnection(requestOptions, resultHandler, podConfig);
                })(config);
        }
}
var PodCreateRequest = (function(){
        function PodCreateRequest(fromObj) {
                if (typeof fromObj.RawRequest !== 'undefined' && fromObj.RawRequest != null) {
                        if (typeof fromObj.RawRequest !== 'object') {
                                cli.error("Error: RawRequest is an invalid type: " + typeof fromObj.RawRequest);
                                return null;
                        }

                        this.Name = typeof fromObj.RawRequest.labels.name === 'string' ? fromObj.RawRequest.labels.name : '';
                        this.Image = '';
                        this.Labels = typeof fromObj.RawRequest.labels === 'object' ? fromObj.RawRequest.labels : {};
                        this.RawRequest = fromObj.RawRequest;
                } else {
                        this.Name = typeof fromObj.Name === 'string' ? fromObj.Name : '';
                        this.Image = typeof fromObj.Image === 'object' ? fromObj.Image : '';
                        this.Labels = typeof fromObj.Labels === 'object' ? fromObj.Labels : {};
                        this.RawRequest = null;
                }

                this.Replicas = typeof fromObj.Replicas !== 'undefined' ? fromObj.Replicas : 1;

                if (typeof this.Replicas === 'string') {
                        this.Replicas = parseInt(this.Replicas);
                }

                if (this.Replicas > MaxReplicas) {
                        this.Replicas = MaxReplicas;
                }

                if (typeof this.Labels['name'] !== 'string') {
                        this.Labels['name'] = this.Name;
                }

                if (typeof this.Labels['Id'] === 'number') {
                        this.Labels['Id'] = "" + this.Labels['Id'];
                }

                if (typeof this.Labels['Id'] !== 'string') {
                        cli.error("No id found for podcreaterequest");
                        return null;
                }

                if (this.Name.length === 0) {
                        return null;
                }

                if (KnownImages.indexOf(this.Image) === -1) {
                        cli.info("Unkown image " + this.Image + ". using default: " + KnownImages[0]);
                        this.Image = KnownImages[0];
                }
        }

        function validateField(obj, field, type, allowed, defaultValue, message) {
                if (!!defaultValue && typeof obj[field] === 'undefined') {
                        obj[field] = defaultValue;
                } else if (typeof obj[field] === 'undefined') {
                        cli.error("Field is undefined");
                        cli.error(message + obj[field]);
                        return false;
                }

                if (typeof obj[field] !== type) {
                        cli.error("Field type does not match: " + typeof obj[field]);
                        cli.error(message + obj[field]);
                        return false;
                }

                if (!!allowed && allowed.indexOf(obj[field]) === -1) {
                        cli.error("Field value is not allowed" + obj[field]);
                        cli.error(message, obj[field]);
                        return false;
                }

                return true;
        }

        PodCreateRequest.prototype.ValidateRawRequest = function(forNumContainers) {
                if (this.RawRequest == null || typeof this.RawRequest == 'undefined') {
                        return false;
                }

                if (typeof forNumContainers === 'undefined') {
                        forNumContainers = this.Replicas;
                }

                // Validate base object
                if (!validateField(this.RawRequest, 'apiVersion', 'string', kubeAllowedApiVersions, kubeApiVersion, "PodCreateRequest validation failed: Invalid api version '%s'")) {
                        return false;
                }

                if (!validateField(this.RawRequest, 'kind', 'string', ['Pod'], 'Pod', "PodCreateRequest validation failed: Invalid object kind '%s'")) {
                        return false;
                }

                if (!validateField(this.RawRequest, 'id', 'string', null, null, "PodCreateRequest validation failed: Bad pod id specified")) {
                        return false;
                }

                if (!validateField(this.RawRequest, 'labels', 'object', null, null, "PodCreateRequest validation failed: Bad labels specified")) {
                        return false;
                }

                if (!validateField(this.RawRequest.labels, 'name', 'string', null, null, "PodCreateRequest validation failed: No name label specified")) {
                        return false;
                }

                if (!validateField(this.RawRequest.labels, 'Id', 'string', null, null, "PodCreateRequest validation failed: No id label specified")) {
                        return false;
                }

                // Validate desired state
                if (!validateField(this.RawRequest, 'desiredState', 'object', null, null, "PodCreateRequest validation failed: No desiredState specified")) {
                        return false;
                }

                if (!validateField(this.RawRequest.desiredState, 'manifest', 'object', null, null, "PodCreateRequest validation failed: No manifest specified")) {
                        return false;
                }

                if (!validateField(this.RawRequest.desiredState.manifest, 'id', 'string', null, null, "PodCreateRequest validation failed: No manifest id specified")) {
                        return false;
                }

                if (!validateField(this.RawRequest.desiredState.manifest, 'version', 'string', kubeAllowedApiVersions, kubeApiVersion, "PodCreateRequest validation failed: Bad manifest version specified")) {
                        return false;
                }

                if (!validateField(this.RawRequest.desiredState.manifest, 'containers', 'object', null, null, "PodCreateRequest validation failed: No manifest containers specified")) {
                        return false;
                }

                if (this.RawRequest.desiredState.manifest.containers.length === 0) {
                        cli.error("PodCreateRequest validation failed: No containers specified");
                        return false;
                }

                var usedPorts = [];
                for (var c in this.RawRequest.desiredState.manifest.containers) {
                        var container = this.RawRequest.desiredState.manifest.containers[c];

                        if (!validateField(container, 'name', 'string', null, null, "PodCreateRequest validation failed: No container name specified %s")) {
                                return false;
                        }

                        if (!validateField(container, 'version', 'string', kubeAllowedApiVersions, kubeApiVersion, "PodCreateRequest validation failed: No container name specified %s")) {
                                return false;
                        }

                        if (!validateField(container, 'image', 'string', KnownImages, 'dockerfile/nginx', "PodCreateRequest validation failed: Invalid container image %s")) {
                                return false;
                        }

                        if (typeof container.ports !== 'undefined') {
                                for (var p in container.ports) {
                                        var port = container.ports[p];

                                        if (!validateField(port, 'containerPort', 'number', null, null, "PodCreateRequest validation failed: No containerPort specified")) {
                                                return false;
                                        }

                                        if (!validateField(port, 'hostPort', 'number', null, null, "PodCreateRequest validation failed: No hostPort specified")) {
                                                return false;
                                        }

                                        if (usedPorts.indexOf(port.hostPort) != -1) {
                                                cli.error("PodCreateRequest validation failed: Two containers may not have the same host port " + port.hostPort);
                                                return false;
                                        }

                                        usedPorts.push(port.hostPort);

                                        if (typeof port.protocol !== 'undefined' && !validateField(port, 'protocol', 'string', ['TCP', 'UDP'], 'TCP', "PodCreateRequest validation failed: Invalid container port protocol %s")) {
                                                return false;
                                        }


                                        if (PortManager.PortAvailable(port.hostPort, forNumContainers)) {
                                                PortManager.AddUsedPort(port.hostPort);
                                        } else {
                                                var newPort = PortManager.NextPort(forNumContainers);
                                                cli.info("PodCreateRequest validation: Notification: Changing port from " + port.hostPort + " to " + newPort);
                                                port.hostPort = newPort;
                                        }
                                }
                        }
                }

                return true;
        }

        return PodCreateRequest;
})();

