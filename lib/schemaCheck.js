// this uses json-gate for validation.  kube uses jsonv3 when they support v4 need other package see http://json-schema.org/implementations.html
//assumes server_root is set
var schemaCheck = (function(){

        load = function() {
            var fs = require('fs');
            var createSchema = require('json-gate').createSchema;
            try{
                var rawPodSchema = JSON.parse(fs.readFileSync(server_root + '/schema/podSchema.js', 'utf8').toString());
                var rawRcSchema = JSON.parse(fs.readFileSync(server_root + '/schema/rcSchema.js', 'utf8').toString());
                var rawServiceSchema = JSON.parse(fs.readFileSync(server_root + '/schema/serviceSchema.js', 'utf8').toString());
                var rawManifestSchema = JSON.parse(fs.readFileSync(server_root + '/schema/manifestSchema.js', 'utf8').toString());
            } catch (err){
                console.log("error reading schema files: " + err); 
            }

            try{
            var podSchema = createSchema(rawPodSchema);
            var rcSchema = createSchema(rawRcSchema);
            var serviceSchema = createSchema(rawServiceSchema);
            var manifestSchema = createSchema(rawManifestSchema);
            } catch (err){
                console.log("error loading schema files: " + err); 
            }
            var schemas={"podSchema": podSchema, "rcSchema": rcSchema, "serviceSchema": serviceSchema, "mainfestSchema": manifestSchema};
console.log(JSON.stringify(schemas.rcSchema,null, 7));
            return schemas;
        };
            
        check = function (data, schemas) {

            switch (data.kind){
                case 'Pod':
                      ret=checkSchema(schemas.podSchema, data); 
                      return ret;
                      break;
                case 'ReplicationController':
  console.log("1");
                      ret=checkSchema(schemas.rcSchema, data);
  console.log("2");
                      if (ret) { 
                          return ret; 
                      } else {
                          try {
                              ret=checkSchema(schemas.manifestSchema, data.desiredState.podTemplate.desiredState.manifest);
                          } catch(err) {
                              console.log("rc: " + err + ret);
                          }
                          return ret;
                      }
                      break;
                case 'Service':
                      ret=checkSchema(schemas.serviceSchema, data);
                      return ret;
                      break;

                case 'Manifest':
                      ret=checkSchema(schemas.manifestSchema, data);
                      return ret;
                      break;
                default:
                      return ('FAILED TO GET TYPE');
                      break;
                } 

            function checkSchema(schema, data){
console.log(JSON.stringify(schema,null, 7));
                try {
                    schema.validate(data);
                    return;
                } catch(err) {
                    console.info(400, err);
console.info("data: " + data + " schema: " + schema);
                    return err;
                }  
            }  
        };
    return;
})();
module.exports = { 'check': check, 'load': load };
