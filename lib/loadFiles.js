

var loadFiles = (function (){
   var cli = require('cli');
   var util = require('util');
   var fs = require('fs');

    loadconfigs = function(configs_dir){
        var schemacheck = require("schemaCheck");
        var schemas=schemacheck.load();
        var cleanfiles = fLoad(configs_dir);
        return cleanfiles;

        function fLoad (dir, files_, fileobjs_){
            files_ = files_ || [];
            fileobjs_ = fileobjs_ || [];
            if (typeof files_ === 'undefined') files_=[];
            if (typeof fileobjs_ === 'undefined') fileobjs_=[];
            var files = fs.readdirSync(dir);

            for(var i in files){
                if (!files.hasOwnProperty(i)) continue;
                var name = dir+'/'+files[i];
                if (fs.statSync(name).isDirectory()){
                    fLoad(name,files_,fileobjs_);
                } else {
                    try {
                        var contents = fs.readFileSync(name).toString();
                        var cobj = JSON.parse(contents); 
                    }catch(err){ 
                        cli.error( "bad file: " + name + " - " + err); 
                        continue;
                    } 
                    var ret=schemacheck.check(cobj, schemas);
                    if (ret){
                        cli.error("SchemaCheck Failed: " + name + " - " + ret);
                        continue;
                    } 

                    fileobjs_.push(
                        new Config(
                                   name,
                                   files[i],
                                   name.replace(configs_dir + "/", " "),
                                   dir,
                                   cobj.kind,
                                   cobj.id,
                                   cobj.apiVersion,
                                   contents,
                                   cobj
                             ));
                }  
            }  
            return fileobjs_;
        }  
}

////////    return ;

    //Called from main program - var configs=loadFiles(configs_dir);

    function Config(AbsFileName, RelFileName, DispFileName, Dir, FileKind, Id, API, FileContents, ConfigJSON){
            return {
                    'AbsFileName': typeof AbsFileName === 'string' ? AbsFileName : '',
                    'RelFileName': typeof RelFileName === 'string' ? RelFileName : '',
                    'DispFileName': typeof DispFileName === 'string' ? DispFileName : '',
                    'Dir': typeof Dir === 'string' ? Dir : '',
                    'FileKind': typeof FileKind === 'string' ? FileKind : '',
                    'Id': typeof Id === 'string' ? Id : '',
                    'API': typeof API === 'string' ? API : '',
                    'FileContents': typeof FileContents === 'string' ? FileContents : '',
                    'ConfigJSON': typeof ConfigJSON === 'object' ? ConfigJSON : {}

            };
    }   

    function checkApi(file){
        // TODO add api checks here
        return;
    }  

    function htmlFilesList(files){
        // TODO create a  array of filenames, types and full path
    }   

    getFile = function(filename,fileobjs){
            //console.log(util.inspect(fileobjs,true,null,true));
            //console.error("filename= " + filename);
        for (var i in fileobjs){
            if (filename === fileobjs[i].AbsFileName){
                //console.error(util.inspect(fileobjs[i],true,null,true));
                return fileobjs[i];
            } 
         }
    }  

})();

module.exports = { 'loadconfigs': loadconfigs, 'getFile': getFile}; 
