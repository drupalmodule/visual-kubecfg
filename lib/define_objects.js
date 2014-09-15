//// Define Objects bsFileName
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
                //cli.info("Id: " + Id + " Port: " + Port + " ContainerPort: " + ContainerPort + " ExternalLoadBalancer: " + ExternalLoadBalancer + " Labels: " + Labels + " Selectors: " + Selectors);

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


