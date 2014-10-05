var foo = (function(){

function queryRunningMinions(restOptions) {
        //var requestOptions = QueuedConnectionManager.GetRequestOptionsForApi("minions", "GET");

        //requestOptions['connectionPriority'] = 'immediate';

        //var resultHandler = function(error, result) {
        //        if (error !== null || typeof result !== 'object') {
        //                cli.error("Error querying running Minions: " + " " + error + " " + result);
        //                return;
        //        }
var kuberest=require('kuberest');
var result=kuberest.k8list(restOptions, "v1beta1", "minions");
var util=require('util');
cli.error("am i undefined"+ util.inspect(result, {showHidden: true, depth: null}));

             //  parseListQueryOutput(result);
       // }

        //QueuedConnectionManager.GetJSONQueryResultConnection(requestOptions, resultHandler);
}
function queryRunningPods() {
        var requestOptions = QueuedConnectionManager.GetRequestOptionsForApi("pods", "GET");

        requestOptions['connectionPriority'] = 'immediate';

        var resultHandler = function(error, result) {
                if (error !== null || typeof result !== 'object') {
                        cli.error("Error querying running pods: " + " " + error + " " + result);
                        return;
                }

                parseListQueryOutput(result);
        }

        QueuedConnectionManager.GetJSONQueryResultConnection(requestOptions, resultHandler);
}
function queryRunningReplicationControllers() {
        var requestOptions = QueuedConnectionManager.GetRequestOptionsForApi("replicationControllers", "GET");

        requestOptions['connectionPriority'] = 'immediate';

        var resultHandler = function(error, result) {
                if (error !== null || typeof result !== 'object') {
                        cli.error("Error querying running replicationControllers: " + " " + error + " " + result);
                        return;
                }

                parseListQueryOutput(result);
        }

        QueuedConnectionManager.GetJSONQueryResultConnection(requestOptions, resultHandler);
}
function queryRunningServices() {
        var requestOptions = QueuedConnectionManager.GetRequestOptionsForApi("services", "GET");

        requestOptions['connectionPriority'] = 'immediate';

        var resultHandler = function(error, result) {
                if (error !== null || typeof result !== 'object') {
                        cli.error("Error querying running services: " + " " + error + " " + result);
                        return;
                }

                parseListQueryOutput(result);
        }

        QueuedConnectionManager.GetJSONQueryResultConnection(requestOptions, resultHandler);
}

parseListQueryOutput = (function (response) {
        switch (response.kind) {
                case "MinionList":
                        parseMinionList(response.items);
                        break;
                case "PodList":
                        parsePodList(response.items);
                        break;
                case "ReplicationControllerList":
                        parseReplicationControllerList(response.items);
                        break;
                case "ServiceList":
                        parseServiceList(response.items);
                        break;
                default:
                        cli.error("Unknown list type received from query: " + response.kind);
        }
});
function parseMinionList(raw_minions){
        var new_minions = [];
        for (var m in raw_minions) {
                var minion = raw_minions[m];
                var id = minion.id;
                new_minions.push(
                        new Minion(
                                id
                                ));
                //cli.info("id: " + id + JSON.stringify(minion));
        }
        cli.debug("parseMinionList: minions OBJ - " + JSON.stringify(raw_minions));
        cli.info("" + new_minions.length + " Minons found");

        Minions = new_minions;
        PushMinionsToSockets(new_minions, sockets);
}


function parsePodList(raw_pods) {
        var new_pods = [];
        usedPorts = [];

        PortManager.Reset();

        for (var p in raw_pods) {
                var pod = raw_pods[p];

                var images = [];
                for (var c in pod.desiredState.manifest.containers) {
                        var container = pod.desiredState.manifest.containers[c];
                        images.push(container.image);

                        for (p in container.ports) {
                                PortManager.AddUsedPort(parseInt(container.ports[p].hostPort))
                        }
                }

                if (pod.id in activeOperations) {
                        var loaded = true;
                        try {
                                if (typeof pod.currentState === 'undefined' || typeof pod.currentState.info === 'undefined') {
                                        loaded = false;
                                } else {
                                        for (var c in pod.desiredState.manifest.containers) {
                                                loaded &= pod.desiredState.manifest.containers[c].name in pod.currentState.info;
                                                if (!loaded) break;
                                        }
                                }
                        } catch (exc) {
                                cli.debug("podcheck error");
                                loaded = false;
                        }

                        if (loaded) {
                                cli.debug("Marking pod complete");
                                delete activeOperations[pod.id];
                        }
                }

                new_pods.push(
                        new Pod(
                                pod.id,
                                images,
                                pod.currentState.host,
                                pod.labels,
                                pod));
        }

        cli.info("" + new_pods.length + " Pods found");

        pods = new_pods;

        PushPodsToSockets(new_pods, sockets);

        if (pods.length === 0) {
                cli.debug("Reset port PortManager")
                PortManager.Reset();
        }
}

function parseReplicationControllerList(raw_controllers){
        var new_rcontrollers = [];
        for (var c in raw_controllers) {
                var controller = raw_controllers[c];
                var id = controller.id;
                var replicas = controller.desiredState.replicas;
                var labels = controller.desiredState.labels;
                var selectors = controller.desiredState.replicaSelector;
                new_rcontrollers.push(
                        new RController(
                                id,
                                replicas,
                                labels,
                                selectors,
                                controller));
                //cli.info("id: " + id + " replicas: " + replicas + " labels: " + labels + " selectors: " + selectors);
        }

        cli.info("" + new_rcontrollers.length + " ReplicationControllers found");

        rControllers = new_rcontrollers;
        PushRControllersToSockets(new_rcontrollers, sockets);
}

function parseServiceList(raw_services){
        var new_services = [];

        for (var i in raw_services) {
                var s = raw_services[i];
                var id = s.id;
                var port = s.port;
                var containerPort = s.containerPort;
                var externalLoadBalancer = s.createExternalLoadBalancer;
                var labels = s.labels;
                var selectors = s.selector;
                new_services.push(
                      new Service(
                                id,
                                port,
                                containerPort,
                                externalLoadBalancer,
                                labels,
                                selectors,
                                s));

                //cli.info("id: " + id + " port: " + port + " containerPort: " + containerPort + " createExternalLoadBalancer: " + externalLoadBalancer + " labels: " + labels + " selectors: " + selectors);
        }

        cli.info("" + new_services.length + " Services found");
        services = new_services;
        //cli.info ( "services: " + JSON.stringify(new_services[0], null, 4));
        PushServicesToSockets(services,sockets);
        //PushServicesToSockets(new_services,sockets); 
}
function ParsePodListOutput(output) {
        var lines = output.split("\n");
        var new_pods = [];

        // Iterate from the third line to the end
        for (var i = 2; i < lines.length; i++) {
                try {
                        var trimmed = lines[i].trim();

                        if (trimmed == "") continue;

                        var cols = lines[i].split(/\s+/g);
                        var Name = cols[0];
                        var Images = cols[1].split(',');
                        var Host = cols[2];
                        var Labels = cols[3].split(',');

                        var labels_obj = {};
                        for (var j = 0; j < Labels.length; j++) {
                                var label_split = Labels[j].split('=');
                                labels_obj[label_split[0]] = label_split[1];
                        }

                        new_pods.push(new Pod(Name, Images, Host, labels_obj));
                } catch (exc) {

                }
        }

        if (new_pods.length !== 0) {
                pods = new_pods;
        }
}

function PushMinionsToSockets(minions, sockets){
        for (var s in sockets){
            sockets[s].emit('minions',minions);
        }
}

function PushPodsToSockets(pods, sockets) {
        for (var s in sockets) {
                sockets[s].emit('pods', pods);
        }
}

function PushRControllersToSockets(rControllers, sockets) {
        for (var s in sockets) {
                sockets[s].emit('rControllers', rControllers);
        }
}

function PushServicesToSockets(services, sockets) {
        for (var s in sockets) {
                sockets[s].emit('services', services);
        }
}
})();
module.exports = {'parseListQueryOutput': parseListQueryOutput};
