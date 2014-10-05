var kuberest = (function(){

    var cli=require('cli');
    var rest=require('needle');

    k8create = function(socket, restOptions, api, type, data){
        var url="https://" + restOptions.hostip +"/api/" + api + "/" + type;
        cli.info ("k8create " + url );   

        rest.post(url,data,restOptions, function(err, resp, body){
            handleRestReturn(socket, err, resp, body, type, "create" );
        })
    } ;


    k8delete = function(socket, restOptions, api, type, id){
        var url="https://" + restOptions.hostip +"/api/" + api + "/" + type + "/" + id;
        cli.info ("k8delete " + url );   

        rest.delete(url," ",restOptions, function(err, resp, body){
            handleRestReturn(socket, err, resp, body, type, "delete", id);
        });
    };

    k8update = function(socket, restOptions, api, type, id, data){
        var url="https://" + restOptions.hostip +"/api/" + api + "/" + type + "/" + id;
        cli.info ("k8update " + url );

        rest.put(url, data, restOptions, function(err, resp, body){
            handleRestReturn(socket, err, resp, body, type, "update", id);
        });
    };

    k8list = function(restOptions, api, type, cbfunc){
        var url="https://" + restOptions.hostip +"/api/" + api + "/" + type ;
        cli.info ("k8list " + url );

        rest.get(url, restOptions, function(err, resp, cbfunc){
            //handleRestReturn(socket, err, resp, body, type, "update", id);
            //    var ret={'status': resp.statusCode, 'type': type, 'text': "Failed: " + type +  " NO  on k8s", "responseObj": resp, 'bodyObj': body};
                //cli.error("ret.text: " + ret.text);
                cli.error("HTTP Code: " + resp.statusCode);
                cli.error("K8s Code: " + resp.code);
                cli.error("resp.body: " + resp.body);
var util=require('util');
                cli.error(util.inspect(resp.body, {showHidden: true, depth: null}));
                //cbfunc.apply(resp.body);
                cbfunc(resp.body);

            //return resp.body;
        });
    };
    function handleRestReturn(socket, err, resp, body, type, operation, id){
        if (err){
            cli.error("err");
            console.log(err);
            cli.error (body);
            var ret={'status': resp.statusCode, 'type': type, 'operation': operation, 'text': "Failed: " + type + " " + id + " NO" + operation + " on k8s", "responseObj": resp, 'bodyObj': body};
            cli.error(ret.text);
            cli.error("HTTP Code: " + resp.statusCode);
            cli.error("K8s Code: " + body.code);
            cli.error(body.message);
        }else{
            if (resp.statusCode >= 200 && resp.statusCode < 300){
                ret={'status': resp.statusCode, 'type': type, 'operation': operation, 'text': "Success: " + type + " " + id + " "+ operation + " on k8s", "responseObj": resp, 'bodyObj': body};
                cli.info (ret.text);
                //cli.info ("Success: " + type + " " + operation + " on k8s");
                cli.info (body);
            }else{
                ret={'status': resp.statusCode, 'type': type, 'operation': operation, 'text': "Failed: " + type + " " + id + " NO" + operation + " on k8s", "responseObj": resp, 'bodyObj': body};
                cli.error(ret.text);
                cli.error("HTTP Code: " + resp.statusCode);
                cli.error("K8s Code: " + body.code);
                cli.error(body.message);
            }
        }  
        socket.emit('kubecfgStatus', resp.statusCode);
    }

})();
module.exports = {'k8create': k8create, 'k8delete': k8delete, 'k8update': k8update, 'k8list': k8list};
