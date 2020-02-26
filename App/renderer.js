const ipc = require('electron').ipcRenderer;
const clipBoardElements = document.querySelector(".clipBoardElements");

ipc.send("console.log", "hello world");

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
    clipBoardElements.innerHTML = "";
    for(let data of dataD)
    {
        let str = data.data;
        str = str.replace(/\</gim, "&lt;")
        clipBoardElements.innerHTML += "<li tabindex='-1'><a class='clipBoardElement' data-ind='"+data.info.ind+"'>"+str+ " <span class='ch-count'>(length "+data.info.length+")</span>"+"</a></li>";        
    }
    
    clipBoardElements.querySelectorAll("a.clipBoardElement").forEach(function(e){
        e.onclick = function(event){
            console.log("CLICKED");
            event.preventDefault();
            ipc.send("select", e.getAttribute("data-ind"));
        }
    });
    
    // Right after the line where you changed the document.location
    ipc.send('resize-window', {w:document.body.clientWidth, h:document.body.clientHeight});
}