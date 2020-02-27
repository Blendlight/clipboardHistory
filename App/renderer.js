const ipc = require('electron').ipcRenderer;
const clipBoardElements = document.querySelector(".clipBoardElements");

ipc.send("console.log", "hello world");

let filterValue = 'all';

let activeElement = -1;

ipc.on("alert", function(event, msg){
    alert(msg);
});

ipc.on("clipBoardData", function(event, clipBoardData){
    activeElement = -1;
    updateClipBoard(clipBoardData);
});

window.onkeydown = function(evt)
{
    evt.preventDefault();
    let all = document.querySelectorAll(".clipBoardElement");
    
    if(evt.key == 'ArrowDown')
    {
        activeElement += 1;
    }else if(evt.key == 'ArrowUp')
    {
        activeElement -= 1;   
    }else if(evt.key == 'Enter')
    {
        if(all[activeElement])
        {
            ipc.send("select", all[activeElement].getAttribute("data-ind"));
        }
    }
    
    //remove from all
    while(a = document.querySelector(".clipBoardElement.active"))
    {
        a.classList.remove('active');
    }
    
    
    if(activeElement == -1)
    {
        activeElement = all.length-1;
    }else if(activeElement >= all.length)
    {
        activeElement = 0;
    }
    
    if(all[activeElement])
    {
        all[activeElement].classList.add('active');
    }else{
        activeElement  = -1;
    }
    
    console.log(activeElement);
    
}

function updateClipBoard(dataD)
{
    window.d = dataD;
    clipBoardElements.innerHTML = "";
    for(let data of dataD)
    {
        let str = data.data;
        if(data.info.type == 'text'){
            str = str.replace(/\</gim, "&lt;")
            clipBoardElements.innerHTML += "<li class='text' tabindex='-1'><a class='clipBoardElement' data-ind='"+data.info.ind+"'>"+str+ " <span class='ch-count'>(length "+data.info.length+")</span> <button class='remove' data-ind='"+data.info.ind+"'>&times;</button> </a></li>";        
        }else{
            clipBoardElements.innerHTML += "<li class='image' tabindex='-1'><a class='clipBoardElement' data-ind='"+data.info.ind+"'><img src='"+str+"'/> <span class='ch-count'>(Size "+data.info.size.width+"x"+data.info.size.height+")</span>  <button class='remove' data-ind='"+data.info.ind+"'>&times;</button> </a></li>";        
        }
    }
    
    clipBoardElements.querySelectorAll("a.clipBoardElement").forEach(function(e){
        e.onclick = function(event){
            console.log("CLICKED");
            event.preventDefault();
            ipc.send("select", e.getAttribute("data-ind"));
        }
    });
    
    clipBoardElements.querySelectorAll(".remove").forEach(function(e){
        
        console.log('added to ');
        e.onclick = function(event){
            console.log("CLICKED remove");
            ipc.send("remove", e.getAttribute("data-ind"));
            event.stopPropagation();
            event.preventDefault();
        }
    });

    // Right after the line where you changed the document.location
    ipc.send('resize-window', {w:document.body.clientWidth, h:document.body.clientHeight});
    filterClipboard();
}

let typeSelect = document.querySelectorAll("[name='filter']");
typeSelect.forEach(e=>e.onchange=function(){
    filterValue = this.value;
    filterClipboard();
})

function filterClipboard(){
    if(document.querySelectorAll('li').length == 0)
    {
        document.getElementById('none').style.display = 'block';
        return;
    }
    let t = 0;
    if(filterValue == 'all'){
        t = 1;
        document.querySelectorAll('li').forEach(e=>e.style.display='block');
    }else{
        document.querySelectorAll('li').forEach(e=>{e.style.display='none';});
        document.querySelectorAll('li.'+filterValue).forEach(e=>{e.style.display='block';t++;});
    }
    if(t == 0)
    {
        document.getElementById('none').style.display = 'block';
    }else{
        document.getElementById('none').style.display = 'none';
    }
    ipc.send('resize-window', {w:document.body.clientWidth, h:document.body.clientHeight});
}