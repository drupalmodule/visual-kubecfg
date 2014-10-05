var kuberest = require('kuberest');
var getlists = require('get_new.js');
var restOptions = {
    'hostip': '146.148.35.164',
    'port': 443,
    'rejectUnauthorized': false,
    'requestCert': true,
    'agent': false,
    'username': 'admin',
    'password': 'piXHAr7ksUCz4aTH',
};
kuberest.k8list(restOptions, "v1beta1", "minions",getlists.parseListQueryOutput);
