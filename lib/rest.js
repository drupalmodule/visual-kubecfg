var cli=require('cli');
var rest=require('needle');

function k8create(restOptions, api, type, data){
    url="https://" + restOptions.hostip +"/api/" + api + "/" + type;
    cli.info ("k8create " + url );   

    rest.post(url,data,restOptions, function(err, resp, body){
        handleRestReturn(err, resp, body, type, "create" );
    });
}


function k8delete(restOptions, api, type, id){
    url="https://" + restOptions.hostip +"/api/" + api + "/" + type + "/" + id;
    cli.info ("k8delete " + url );   

    rest.delete(url," ",restOptions, function(err, resp, body){
        handleRestReturn(err, resp, body, type, "delete", id);
    });
}

function k8update(restOptions, api, type, id, data){
    url="https://" + restOptions.hostip +"/api/" + api + "/" + type + "/" + id;
    cli.info ("k8update " + url );

    rest.put(url, data, restOptions, function(err, resp, body){
        handleRestReturn(err, resp, body, type, "update", id);
    });
}

function handleRestReturn(err, resp, body, type, operation, id){
    if (err){
        cli.error("err");
        console.log(err);
           cli.info (body);
           cli.error("Failed: " + type + " NO " + operation + "  on k8s");
           cli.error("HTTP Code: " + resp.statusCode);
           cli.error("K8s Code: " + body.code);
           cli.error(body.message);
    }else{
        if (resp.statusCode === 200 ){
            cli.info ("Success: " + type + " " + operation + " on k8s");
            cli.info (body);
        }else{
           cli.error("Failed: " + type + " NO " + operation + " on k8s");
           cli.error("HTTP Code: " + resp.statusCode);
           cli.error("K8s Code: " + body.code);
           cli.error(body.message);
        }
    }
}
