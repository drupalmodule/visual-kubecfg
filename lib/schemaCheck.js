// this uses json-gate for validation.  kube uses jsonv3 when they support v4 need other package see http://json-schema.org/implementations.html


var createSchema = require('json-gate').createSchema;
rawPodSchema = require ('../schema/podSchema.js');
rawRcSchema = require ('../schema/rcSchema.js');
rawServiceSchema = require ('../schema/serviceSchema.js');
rawManifestSchema = require ('../schema/manifestSchema.js');


var podSchema = createSchema(rawPodSchema);

var data =
{
  "id": "rxwiki-files",
  "kind": "Pod",
  "apiVersion": "v1beta1",
  "desiredState": {
    "manifest": {
      "version": "v1beta1",
      "containers": [
                    {
                    "name": "nfs", "image": "10.240.249.36:5000/nfs-client",
                            "env": [{"name": "NFS_SERVER", "value": "xxx.xxx.xxx"}, {"name": "NFS_MOUNTS", "value": "/files/rxwiki:/files"} ],
                            "volumes": [{"name": "files-rxw-a"}]
                 }
 
                    ],
       "id": "rxwiki_files"
    },
  },
  "labels": {
    "name": "rxwiki_files"
  }
}
;

switch (data.kind){
    case 'Pod':
         
          break;
    case 'ReplicationController':

          break;
    case 'Service':

          break;

    case 'Manifest':

          break;
    default:
          console.log('FAILED TO GET TYPE');
}
try {
    podSchema.validate(data);
} catch(err) {
    console.info(400, err);
}
