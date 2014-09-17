



function ReplicationControllerDisplayManager($rControllersContainer){
        var obj = {};
        var rControllerColors = {};

        obj.Update = function(rControllers) {
                // Sort the pods so they don't jump around randomly
                rControllers.sort(function (a, b) { return a.id < b.id; });

                // Empty the current view
                $rControllersContainer.empty();
                $('#nohost').empty();

                for (var i in rControllers) {
                    var r = rControllers[i];
                    var rgb="rgb(86,122,243)";
                    var selectors = "";
                    var labels = "";
                    var param=[];
                    param=[r.Id,"replicationControllers"];
                    for (var x in r.Selectors){
                        selectors += '<br/>&nbsp;&nbsp;' + r.Selectors[x];
                    }
                    for (var y in r.Labels){
                        labels += '<br/>&nbsp;&nbsp;' + r.Labels[y];
                    }
                    $rControllersContainer.append(
                            '<div id="rcontroller-' + r.Id + '"' + ' class="rcontroller ' + r.Id + '"' + ' style="background-color: ' + rgb + '; data-toggle="modal" data-target="#rcontrollermodal">' +
                            '<div class="container rcontroller-' + r.Id + ' loaded">' + 'rController<br/>' + r.Id + '</div>' + 
                            '<div class="rcontrollerText" onclick=showDetails("'+ param + '") >Replicas: ' + r.Replicas  + '<br/>selectors:' + selectors + '<br/>Labels:' + labels + '</div>' +
                            '<div id="config-' + r.Id + '" style="height: 0px; visibility: hidden;"><pre class="pre-scrollable">' + JSON.stringify(r.BaseObject.desiredState,null, 7) + '</pre></div>' +
                            '</div>');
                }
}
        return obj;

}
