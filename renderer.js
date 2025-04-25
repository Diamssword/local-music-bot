setTimeout(() => {
  window.app.send("refreshFiles")  
}, 1000);
document.getElementById("reloadF").onclick=()=>window.app.send("refreshFiles")  
document.getElementById("pause").onclick=()=>window.app.send("pauseFile") 
const labelVolume=document.getElementById("volumeValue");
const slider= document.getElementById("volumeSlider");
const toast =document.getElementById("toast")
slider.addEventListener('input', () => {
  labelVolume.textContent = `Volume : ${((slider.value/slider.max)*100).toFixed(0)}%`;
  window.app.send("changeVolume",slider.value)
});
window.app.on("playing",(file)=>{
 setToast("Lecture en cours: "+file,"success");
})
window.app.on("error",(msg)=>{
  setToast(msg,"error");
 })
window.app.on("listFiles",(response) => {
  var list=document.getElementById('fileList');
  list.innerHTML="";
  response.forEach((v,i)=>{
    const item = document.createElement('div');
    item.className = 'file-item';
    item.textContent = v;
    item.onclick = () => window.app.send("playFile",{user:document.getElementById('user').value,index:i});
    list.appendChild(item);
  })
});

function setToast(msg,type)
{
  toast.innerText=msg;
  toast.classList.remove("success","info","error")
  toast.classList.add(type);
}