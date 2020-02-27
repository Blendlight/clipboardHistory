const {clipboard} = require('electron');

const events = require('events');
const eventEmitter = new events.EventEmitter();
let monitorHandle = null;
function init(clipboardData = [], win){
    let self = Object.assign(eventEmitter, {
        Clipboard:this,
        add,
        remove,
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
    
    let lastText = clipboard.readText();
    let lastImage = clipboard.readImage();
    
    
    //start capturing 
    let monitorHandle = setInterval(function(){
        let newText =  clipboard.readText();
        let newImage = clipboard.readImage();
        
        if(lastText != newText)
        {
            self.add(newText);
            lastText = newText;
        }
        
        if(!newImage.isEmpty() && lastImage.toDataURL() !== newImage.toDataURL())
        {
            self.add(newImage, 'image');
            lastImage = newImage;
        }
        
    }, 1000);
    
    
    return self;
}

// init.prototype.add = add;

function add(data, type='text')
{
    // let total = Object.keys(this.data).length;
    // let limit = 5;

    // if(total >= limit){
    //     let toRemove = total - limit;
    //     for(i in this.data)
    //     {
    //         delete this.data[i];
    //         toRemove--;
    //         if(toRemove<=0)
    //         {
    //             break;
    //         }
    //     }
    // }
    
    let ind = this.ind++;
    if(type == 'text')
    {
        if(this.data[data]){
            this.data[data].c += 1;
            this.data[data].ind = ind++;
        }else{
            this.data[data] = {ind,c:1, type:'text'};
        }
        
        
        //only emit if isEmitSet is true
        if(this.isEmitSet){
            eventEmitter.emit('add', {str:data, type});
        }
    }else{
        let str = data.toDataURL();
        if(this.data[str]){
            this.data[str].c += 1;
            this.data[str].ind = ind++;
        }else{
            this.data[str] = {ind,c:1,type:'image',image:data, size:data.getSize()};
        }
        
        //only emit if isEmitSet is true
        if(this.isEmitSet){
            eventEmitter.emit('add', {str:str, type});
        }   
    }
}

function pasteToActiveWindow(str)
{
    
}

function remove(ind)
{
    for(str in this.data)
    {
        let info = this.data[str];
        if(info.ind == ind)
        {
            delete this.data[str];
            break;
        }
    }
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