

function FileSelect($modalcreatedetails, configs){
        var rconfig=[];
        var sconfig=[];
        var pconfig=[]; 
        var rselect="";
        var sselect="";
        var pselect="";
        for (var i in configs){
            switch (configs[i].FileKind){

               case 'ReplicationController':
                     rconfig.push(configs[i]);
                     break;
               case 'Service':
                     sconfig.push(configs[i]);
                     break;
               case 'Pod':
                     pconfig.push(configs[i]);
                     break;
               default:
                     break;
              }
        }

        var rmodalselect=document.getElementById("select-ReplicationController-container");
        rselect = createSelect(rconfig,"ReplicationController");
        rmodalselect.innerHTML = rselect;
 
        var smodalselect=document.getElementById("select-Service-container");
        sselect = createSelect(sconfig,"Service");
        smodalselect.innerHTML = sselect;

        var pmodalselect=document.getElementById("select-Pod-container");
        pselect = createSelect(pconfig,"Pod");
        pmodalselect.innerHTML = pselect;

        //$modalcreatedetails.append('<div class="modalcreateinput">' + rselect + sselect + pselect + '</div>');
}

function createSelect(configsbytype, type) {
        var selectid = "select-" + type;
        var x='<select id=' + selectid +'>';

        for (var i in configsbytype){
            var value=configsbytype[i].AbsFileName;
            var text=configsbytype[i].Id;
            x+='<option value=' + value + '>' + text + '</option>';

        }
        x+= '</select>';
        return(x);
}
