function ServiceDisplayManager($servicesContainer){
        var obj = {};
        var serviceColors = {};

        obj.Update = function(services) {
                // Sort the pods so they don't jump around randomly
                services.sort(function (a, b) { return a.Id < b.Id; });
                // Empty the current view
                $servicesContainer.empty();

                for (var i in services) {
                    var s = services[i];
                    var rgb="rgb(86,122,243)";
                    var selectors = "";
                    var labels = "";
                    var type="services";
                    var param = s.Id + ',' + type;
                    //param=[s.Id,type];

                    for (var x in s.Selectors){
                        selectors += '<br/>&nbsp;&nbsp;' + s.Selectors[x];
                    }
                    for (var y in s.Labels){
                        labels += '<br/>&nbsp;&nbsp;' + s.Labels[y];
                    }
                    $servicesContainer.append(
                            '<div id="service-' + s.Id + '"' + ' class="service ' + s.Id + '"' + ' style="background-color: ' + rgb + ';">' +
                            '<div class="container service-' + s.Id + ' loaded">' + s.Id + '<br/>' + s.Port + '</div>' +
                            '<div class="serviceText" onclick=showDetails("' + param + '")>cPort: ' + s.ContainerPort +'<br/>ExLB: ' + s.ExternalLoadBalancer + '<br/>selectors:' + selectors + '</div>' +
                            '<div id="config-' + s.Id + '" style="height: 0px; visibility: hidden;">' + JSON.stringify(s.BaseObject,null, 7) + '</div>' +
                            '</div>');
                }
        }
        return obj;

}
