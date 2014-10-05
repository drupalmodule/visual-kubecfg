var kuberest = require('kuberest');
var getlists = require('get_new.js');

};
kuberest.k8list(restOptions, "v1beta1", "minions",getlists.parseListQueryOutput);
