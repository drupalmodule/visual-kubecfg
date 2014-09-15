function deleteRunningPods() {
        cli.debug('Deleting all pods');
        for (var p in pods) {
                deletePod(pods[p].BaseObject.id);
        }
}

function deletePod(id) {
        var requestOptions = QueuedConnectionManager.GetRequestOptionsForApi("pods/" + id, "DELETE");

        var resultHandler = function(error, result) {
                if (error !== null || typeof result !== 'object') {
                        cli.error("Error deleting running pods: " + " " + error + " " + result);
                        return;
                }

                cli.ok("Pod delete complete");
                for (var p in pods) {
                        if (pods[p].Id === id) {
                                delete pods[p];
                                break;
                        }
                }

                PushPodsToSockets(pods, sockets);
        }

        QueuedConnectionManager.GetJSONQueryResultConnection(requestOptions, resultHandler);
}
