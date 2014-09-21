// this uses json-gate for validation.  kube uses jsonv3 when they support v4 need other package see http://json-schema.org/implementations.html

var schemaCheck = (function(){
        check = function (data) {
            //this._data = data; //this.Reset();
var fs = require('fs');
            var createSchema = require('json-gate').createSchema;
            var rawPodSchema = eval(fs.readFileSync('./schema/podSchema.js')+'');
//          var rawPodSchema = require ('../schema/podSchema.js');
            var rawRcSchema = eval(fs.readFileSync('./schema/rcSchema.js')+'');
//          var rawRcSchema = require ('../schema/rcSchema.js');
            var rawServiceSchema = eval(fs.readFileSync('./schema/serviceSchema.js')+'');
//          var rawServiceSchema = require ('../schema/serviceSchema.js');
            var rawManifestSchema = eval(fs.readFileSync('./schema/manifestSchema.js')+'');

            var podSchema = createSchema(rawPodSchema);
            var rcSchema = createSchema(rawRcSchema);
            var serviceSchema = createSchema(rawServiceSchema);
            var manifestSchema = createSchema(rawManifestSchema);
            var ret;
            switch (data.kind){
                case 'Pod':
                      ret=checkSchema(podSchema, data); 
                      return ret;
                      break;
                case 'ReplicationController':
                      ret=checkSchema(rcSchema, data);
                      //if (ret) { return ret; }
                      ret=checkSchema(manifestSchema, data.desiredState.podTemplate.desiredState.manifest);
                      return ret;
                      break;
                case 'Service':
                      ret=checkSchema(serviceSchema, data);
                      return ret;
                      break;

                case 'Manifest':
                      ret=checkSchema(manifestSchema, data);
                      return ret;
                      break;
                default:
                      return ('FAILED TO GET TYPE');
                      break;
                } 

            function checkSchema(schema, data){
                try {
                    schema.validate(data);
                    return;
                } catch(err) {
                    //console.info(400, err);
                    return err;
                }  
            }  
        }
    return;
})();
module.exports = { 'check': check };
