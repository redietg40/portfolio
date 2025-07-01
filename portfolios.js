const tabs=document.querySelectorAll('[data-tab-target]');
const tabContents=document.querySelectorAll('[data-tab-content]');
tabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    const target=document.querySelector(tab.dataset.tabTarget);
    //const tabContents=document.querySelectorAll('[data-tab-content]');
    tabContents.forEach(content=>{
        content.classList.remove('active');
      
    })
      target.classList.add('active');
  })
})
 const textElement=document.getElementById('typewriter-title');
  const text='Front-end Software Developer';
  let index=0;
function typewriter(){
if(index<text.length){
 textElement.textContent+=text.charAt(index);
 index++;
 setTimeout(typewriter,100);

}


}
typewriter();
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('about-typewriter').classList.add('visible');
});
const Skills=[
 {
  name: 'HTML',
  percentage: 90,
  font: 'fa-html5',
},
{
  name:'css',
  percentage: 80,
  font: 'fa-css3-alt',
},
{
  name: 'JavaScript',
  percentage: 80,
  font:'fa-brands fa-js',
},
{
  name: 'React',
  percentage: 75,
  font: 'fa-brands fa-react',


},
{
  name: 'Git',
  percentage: 50,
  font: 'fa-brands fa-git-alt',
},
{
  name: 'GitHub',
  percentage: 75,
  font: 'fa-brands fa-github',
},
{
  name:'nodejs',
  percentage:75,
  font: 'fa-brands fa-node-js',
}];
const 
function createskill(){
  Skills.forEach(skill=>{
    
  });
}
