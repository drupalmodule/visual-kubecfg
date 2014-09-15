/* USE THIS TO VALIDATE JSON DURING LOAD
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
*/
/* USE THIS LATER TO VALIDATE JSON FILES DURING LOAD
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
*/
