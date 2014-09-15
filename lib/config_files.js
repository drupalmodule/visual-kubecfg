var util = require('util');
var fs = require('fs');

// recursive file gatherer
var configs_dir='/borg/collective/configs/prod';
function loadFiles(dir,files_, fileobjs_){
    files_ = files_ || [];
    fileobjs_ = fileobjs_ || [];
    if (typeof files_ === 'undefined') files_=[];
    if (typeof fileobjs_ === 'undefined') fileobjs_=[];
    var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var name = dir+'/'+files[i];
        if (fs.statSync(name).isDirectory()){
           loadFiles(name,files_,fileobjs_);
        } else {
           try {
            var contents = fs.readFileSync(name).toString();
            var cobj = JSON.parse(contents); 
            checkApi(cobj);
            }
           catch(err){ 
               cli.error( 'bad file: ' + name + err); 
               continue;
           }
            fileobjs_.push(
                    new Config(name,
                               files[i],
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
//Called from main program - var configs=loadFiles(configs_dir);

function Config(AbsFileName, RelFileName, Dir, FileKind, Id, API, FileContents, ConfigJSON){
        return {
                'AbsFileName': typeof AbsFileName === 'string' ? AbsFileName : '',
                'RelFileName': typeof RelFileName === 'string' ? RelFileName : '',
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

function getFile(filename,fileobjs){
    for (var i in fileobjs){
        if (filename === fileobjs[i].AbsFileName){
            //console.log(util.inspect(fileobjs[i],true,null,true));
            return fileobjs[i];
        }
     }
} 
