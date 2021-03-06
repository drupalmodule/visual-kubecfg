#!/usr/bin/env node

// ========================================================================
// Copyright 2014 Microsoft Corporation

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var httpServer = http.Server(app);
var io = require('socket.io')(httpServer);
var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require("flavored-path");
var cli = require("cli").enable('status');

// microsoft libs to eliminate
var queuedConnection = require('QueuedConnection');
var portmanager = require("PortManager");
var getlists = require('get_new.js');
//eval(fs.readFileSync('./lib/get_new.js')+'');
// new replacement libs
var kuberest = require('kuberest');
var kubecfg = require('kubecfg');
var loadfiles = require('loadFiles');

server_root=__dirname;
var appOptions = {
	'KubernetesServer': ['s', 'URL of the Kubernetes Server', 'url'],
	'NumMinions': ['m', 'Number of minions in Kubernetes cluster', 'number'],

	'PodRefreshInterval': ['p', 'Time between requesting the list of pods from the master (in milliseconds)', 'number', 3000],
	'OperationRefreshInterval': ['o', 'Time between checking the status on pending operations (in milliseconds)', 'number', 1000],

	'KubePath': ['k', 'Kubernetes repo path', 'path', '../kubernetes'],
	'KubeAuthPath': ['a', 'Path to the kubernetes authorization file', 'path', '~/.kubernetes_auth'],
	'KubeApiVersion': ['v', 'Version of the Kubernetes api to query against', 'string', 'v1beta1'],
	'ListenPort': ['p', 'The port the server should listen on', 'number', 3000],
	'MaxReplicas': ['r', 'The maximum number of replicas the server will allow a client to create at once', 'number', 300],
	'DefaultImage': ['i', 'The default docker image to use when creating pods', 'string', 'dockerfile/nginx'],
};
var configs_dir='/borg/collective/configs/prod';

var options = process.clioptions = cli.parse(appOptions);

var environmentVariables = [ "AZ_CS", "KUBERNETES_PATH", "NUM_MINIONS" ];
for (var option in appOptions) {
	var type = typeof appOptions[option][2] !== 'undefined' ? appOptions[option][2] : 'string';
	if (type !== 'number' && type !== 'bool') {
		type = 'string';
	}

	var required = typeof appOptions[option][3] === 'undefined';

	if (required && typeof options[option] !== type) {
		cli.error("Required \"" + option + "\" parameter not set. Use the -h or --help args to see help information.");
		cli.getUsage();
		process.exit(1);
	}
}

var listenPort = options.ListenPort;

var sockets = [];
minions=[];
pods = [];
rControllers = [];
services= [];

var createMode = 'pods';
var MaxReplicas = options.MaxReplicas;
var KnownImages = [
	'dockerfile/nginx',
	'brendanburns/redis-slave',
	'dockerfile/redis',
];

if (typeof options.DefaultImage !== 'undefined' && KnownImages[0] != options.DefaultImage) {
	if (KnownImages.indexOf(options.DefaultImage) !== -1) {
		delete KnownImages[KnownImages.indexOf(options.DefaultImage)];
	}

	KnownImages.splice(0, 0, options.DefaultImage);
}

var activeOperations = {
	// "id": {}
};

var podRefreshInterval = options.PodRefreshInterval;
var operationRefreshInterval = options.operationRefreshInterval;

// Load kubernetes auth info
var kubernetes_auth_file = path.get("~/.kubernetes_auth");
if (!fs.existsSync(kubernetes_auth_file)) {
	cli.fatal("Error: Could not find kubrenetes auth file: " + kubernetes_auth_file);
}

var kubernetesAuth = JSON.parse(fs.readFileSync(kubernetes_auth_file).toString());
var kubeServer = options.KubernetesServer;
var kubeApiVersion = options.KubeApiVersion;
var kubeAllowedApiVersions = [ "v1beta1", "v1beta2" ];

if (kubeAllowedApiVersions.indexOf(kubeApiVersion) === -1) {
	kubeAllowedApiVersions.push(kubeApiVersion);
}

var PortManager = new portmanager.PortManager(options.NumMinions);

// the old port settings for QuedeConnectionManager
var QueuedConnectionManager = new queuedConnection.QueuedConnectionManager({
	'host': kubeServer,
	'apiVersion': kubeApiVersion,
	'user': kubernetesAuth['User'],
	'password': kubernetesAuth['Password'],
});

// new port settings for rest
var restOptions = {
               'hostip': kubeServer,
               'port': 443,
               'rejectUnauthorized': false,
               'requestCert': true,
               'agent': false,
               'username': kubernetesAuth['User'],
               'password': kubernetesAuth['Password'],
                };

cli.info("Using kubernetes server: " + kubeServer);
cli.info("Using kubernetes default API version: " + kubeApiVersion);
cli.info("Using " + options.DefaultImage + " as the default image when creating pods");
cli.info("Expected number of kubernetes minions: " + options.NumMinions);
console.log();

//TODO Move to periodic checking (see section below)
configs=loadfiles.loadconfigs(configs_dir); 

// Setup tasks that need to occur on an intervat=require('kuberest');


//queryRunningMinions(restOptions);
kuberest.k8list(restOptions, "v1beta1", "minions", getlists.parseListQueryOutput);
//queryRunningPods();
//queryRunningServices();
//queryRunningReplicationControllers();

cli.debug("Querying running pods every " + options.PodRefreshInterval + " milliseconds");
setInterval(function(){
//        queryRunningMinions(restOptions);
        kuberest.k8list(restOptions, "v1beta1", "minions",getlists.parseListQueryOutput);
//	queryRunningPods();
//        queryRunningServices();
//        queryRunningReplicationControllers();
}, options.PodRefreshInterval);

cli.debug("Querying running operations every " + options.OperationRefreshInterval + " milliseconds");
setInterval(function(){
	CheckActiveOperationStatuses();
}, operationRefreshInterval);

io.on('connection', function(socket){
	cli.debug('a user connected');
	sockets.push(socket);
	
	socket.on('kubecfg', function(startParams) {
		cli.info("Recieved kubecfg signal" );
		kubecfg.command(socket, startParams, restOptions);
	});

	socket.on('get_minions', function() {
		socket.emit('minions', minions);
	});

	socket.on('get_pods', function() {
		socket.emit('pods', pods);
	});

	socket.on('get_rControllers', function() {
		socket.emit('rControllers', rControllers);
	});

	socket.on('get_services', function() {
		socket.emit('services', services);
	});
      
        socket.on('get_configs', function() {
                socket.emit ('configs', configs);
        });

	//socket.on('delete_all_pods', function() {
	//	deleteRunningPods();
	//});

	socket.on('disconnect', function () {
		cli.debug("User disconnected");
		var index = sockets.indexOf(socket);
		delete sockets[index];
	});
});

app.use('/', express.static(__dirname + '/client'));

httpServer.listen(listenPort, function(){
	cli.info('K8s Visualizer server listening on *:' + listenPort);
});


// Define Objects
function Pod(Name, Images, Host, Labels, BaseObject) {
        return {
                'Name': typeof Name === 'string' ? Name : '',
                'Images': typeof Images === 'object' ? Images : [],
                'Host': typeof Host === 'string' ? Host : '',
                'Labels': typeof Labels === 'object' ? Labels : {},
                'CreateStatus': BaseObject.desiredState.manifest.id in activeOperations ? activeOperations[BaseObject.desiredState.manifest.id] : false,
                'BaseObject': typeof BaseObject === 'object' ? BaseObject : {}
        };
}

function RController(Id, Replicas, Labels, Selectors, BaseObject) {
        return {
                'Id': typeof Id === 'string' ? Id : '',
                'Replicas': typeof Replicas === 'number' ? Replicas : '',
                'Labels': typeof Labels === 'object' ? Labels : {},
                'Selectors': typeof Selectors === 'object' ? Selectors : {},
                'BaseObject': typeof BaseObject === 'object' ? BaseObject : {}
        };
}

function Service(Id, Port, ContainerPort, ExternalLoadBalancer, Labels, Selectors, BaseObject) {
        return {
                'Id': typeof Id === 'string' ? Id : '',
                'Port': typeof Port === 'number' ? Port : '',
                'ContainerPort': typeof ContainerPort === 'number' ? ContainerPort : '',
                'ExternalLoadBalancer': typeof ExternalLoadBalancer === 'boolean' ? ExternalLoadBalancer : '',
                'Labels': typeof Labels === 'object' ? Labels : {},
                'Selectors': typeof Selectors === 'object' ? Selectors : {},
                'BaseObject': typeof BaseObject === 'object' ? BaseObject : {}
        };
}

function Minion(Id){
        return {
                'Id': typeof Id === 'string' ? Id : '',
        };
}

// More code below to rework / delete
//======================================================================
var allowOperationStatusChecks = true;
var activeOperationQueries = {};
function CheckActiveOperationStatuses() {
	if (!allowOperationStatusChecks) return;
	for (var o in activeOperations) {
		(function (id, operationNo) {
			if (id in activeOperationQueries) {
				return;
			}

			var requestOptions = QueuedConnectionManager.GetRequestOptionsForApi("operations/" + operationNo, "GET");
			activeOperationQueries[id] = true;
			var resultHandler = function(error, result) {
				if (error !== null || typeof result !== 'object') {
					cli.error("Error querying operation status: " + error + " " + result);

					if (id in activeOperations) {
						delete activeOperations[id];
					}

					return;
				}

				if (id in activeOperationQueries) {
					delete	activeOperationQueries[id];
				}

				ParseOperationStatus(id, result);
			}

			QueuedConnectionManager.GetJSONQueryResultConnection(requestOptions, resultHandler);
		})(o, activeOperations[o].details);
	}
}

function ParseOperationStatus(id, status) {
	if (typeof status.kind !== 'undefined' && status.kind === "Status") {
		activeOperations[id] = status;
	} else if (id in activeOperations) {
		cli.ok("Operation complete for item: " + id);

		delete activeOperations[id];

		for (var p in pods) {
			if (pods[p].BaseObject.desiredState.manifest.id == id) {
				pods[p].CreateStatus = false;
				PushPodsToSockets(pods, sockets);
				break;
			}
		}
	}
};
