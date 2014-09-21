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

