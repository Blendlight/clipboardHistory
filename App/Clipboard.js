
const {clipboard} = require('electron');


const events = require('events');
const eventEmitter = new events.EventEmitter();
let monitorHandle = null;
function init(clipboardData = [], win){
    let self = Object.assign(eventEmitter, {
        Clipboard:this,
        add,
        get,
        isEmitSet:false,
        getAll,
        data:{},
        ind: 0,
        end: function () {
            console.log(end);
        }
    });
    
    //copy data from param
    for(let cd of clipboardData)
    {
        self.add(cd);
    }
    //set this to true emit
    self.isEmitSet = true;
    
    let clipboardTextOld = clipboard.readText();
    
    //start capturing 
    let monitorHandle = setInterval(function(){
        let clipboardTextNew =  clipboard.readText();

        if(clipboardTextOld != clipboardTextNew)
        {
            self.add(clipboardTextNew);
            clipboardTextOld = clipboardTextNew;
        }

    }, 1000);
    
    
    return self;
}

// init.prototype.add = add;

function add(str)
{
    let ind = this.ind++;
    if(this.data[str]){
        this.data[str].c += 1;
        this.data[str].ind = ind++;
    }else{
        this.data[str] = {ind,c:1};
    }
    
    //only emit if isEmitSet is true
    if(this.isEmitSet){
        eventEmitter.emit('add', str);
    }
}

function pasteToActiveWindow(str)
{
    
}

function get(ind)
{
    for(str in this.data)
    {
        let info = this.data[str];
        if(info.ind == ind)
        {
            return {str, info};
        }
    }
}

function getAll()
{
    return this.data;
}

module.exports = init;