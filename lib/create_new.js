function kubecfg(socket, startParams) {

        var s=startParams;
        cli.debug();
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

        switch (s.Operation) {
                case 'run':
                        // TODO not implement yet 
                        break;

                case 'resize':
                        for (var r in rControllers){
                            if ( rControllers[r].Id === s.Id ){
                                var cfile = rControllers[r].BaseObject;
                                cfile.desiredState.replicas = parseInt(s.Replicas);
                                var jsonfile = JSON.stringify(cfile);
                                cli.debug(jsonfile);
                                k8update(socket, restOptions, "v1beta1", s.Type, s.Id, jsonfile);
                                break;
                             }
                         cli.error("rController " + s.Id + " notfound!");
                         }
                        break;

                case 'stop':
                        // TODO not implement yet 
                        break;
                   
                case 'rm':
                        // TODO not implement yet 
                        break;

                case 'list':
                        // TODO not implement yet 
                        break;

                case 'get':
                        // TODO not implement yet 
                        break;

                case 'create':
                        var cfile=getFile(s.AbsFileName,configs);
                        var jsonfile=JSON.stringify(cfile.ConfigJSON);
                        k8create(socket, restOptions, "v1beta1", s.Type, jsonfile);

                        break;

                case 'update':
                        // TODO not implement yet 
                        break;

                case 'delete':
                        // TODO not implement yet 
                        k8delete(socket, restOptions, "v1beta1", s.Type, s.Id);
                        break;

                default:
                        cli.error("Error: unknown Operation: " + s.Operation)
        }
}
/*
function GetPodConfigObject(podCreateRequest, hostPort, mode, i) {
        var useI = typeof i != 'undefined';
        var id = podCreateRequest.Labels['Id'] + (useI ? '-' + i : '');
        var nameSlug = podCreateRequest.Name.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();

        switch (typeof mode === 'string' ? mode : createMode) {
                case 'rcontroller':
                        return -need to lookup file
                        break;

                case 'pods':
                        return -need to lookup file
                        break;

                default:
                        return null;
        }
}
*/
/*
function CreateReplicatedController(podCreateRequest) {
        if (podCreateRequest.Name == "") return;

        cli.debug("Executing CreateReplicationController: " + podCreateRequest);

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
*/
/*
function CreatePod(podCreateRequest) {
        if (podCreateRequest.Name == "") return;
        cli.debug("Executing podCreateRequest: " + JSON.stringify(podCreateRequest));
        var id = null;
                var isRaw = typeof podCreateRequest.RawRequest != 'undefined' && podCreateRequest.RawRequest != null;

                if (isRaw && !podCreateRequest.ValidateRawRequest(1)) {
                        cli.error("podCreateRequest validation failed. Cannot continue creating pod");
                        return;
                }
                var config = null;
                if (isRaw) {
                        cli.debug("Creating individual pods from RawRequest");
                        // Do this the lazy way
                        config = JSON.parse(JSON.stringify(podCreateRequest.RawRequest));
                        // edit the id
                        if (id == null) {
                                id = config.id;
                        }
                } else {
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
*/
/*
var PodCreateRequest = (function(){
        function PodCreateRequest(fromObj) {

                // RawRequest = user input (web editor) of jason config
                if (typeof fromObj.RawRequest !== 'undefined' && fromObj.RawRequest != null) {
                        if (typeof fromObj.RawRequest !== 'object') {
                                cli.error("Error: RawRequest is an invalid type: " + typeof fromObj.RawRequest);
                                return null;
                        }
                        this.Name = typeof fromObj.RawRequest.labels.name === 'string' ? fromObj.RawRequest.labels.name : '';
                        this.Image = '';
                        this.Labels = typeof fromObj.RawRequest.labels === 'object' ? fromObj.RawRequest.labels : {};
                        this.RawRequest = fromObj.RawRequest;

                // else get json config from configs object (from filesystem)
                } else {
                        for (var i in configs){
                        if (this.Name === configs[i].AbsFileName ){

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
*/

