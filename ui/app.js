import { clean, getStats, loadManifest, normalize } from './core-data.js';
import { loadCore } from './article.js';
import { homeView, coreView } from './views.js';

const app=document.getElementById('app');
const RECENT_KEY='coreWikiRecent';
function getRecentNames(){try{return JSON.parse(localStorage.getItem(RECENT_KEY)||'[]');}catch{return[];}}
function remember(title){const next=[title,...getRecentNames().filter((item)=>normalize(item)!==normalize(title))].slice(0,5);localStorage.setItem(RECENT_KEY,JSON.stringify(next));}
async function recentRecords(){const manifest=await loadManifest();return getRecentNames().map((name)=>{const record=manifest.get(normalize(name));return record?{name:record.name,count:record.paths.length,path:record.paths[0]||''}:null;}).filter(Boolean);}
function goHome(){history.pushState({},'',location.pathname);renderHome().catch(renderError);}
function navigate(title){const value=clean(title);if(!value)return;const url=new URL(location.href);url.search='';url.searchParams.set('core',value);history.pushState({core:value},'',url);renderCore(value).catch(renderError);}
function wireCommon(){document.querySelectorAll('[data-home]').forEach((button)=>button.addEventListener('click',goHome));const form=document.getElementById('searchForm');const input=document.getElementById('searchInput');const clear=document.getElementById('clearButton');const refreshClear=()=>clear?.classList.toggle('hidden',!input?.value);refreshClear();input?.addEventListener('input',()=>{refreshClear();const needle=input.value.toLowerCase().trim();document.querySelectorAll('[data-core-card]').forEach((card)=>{const title=(card.dataset.title||'').toLowerCase();card.classList.toggle('hidden',Boolean(needle)&&!title.includes(needle));});});clear?.addEventListener('click',()=>{input.value='';input.dispatchEvent(new Event('input'));input.focus();});form?.addEventListener('submit',(event)=>{event.preventDefault();navigate(input?.value);});document.querySelectorAll('img').forEach((image)=>image.addEventListener('error',()=>image.remove(),{once:true}));}
function wireArticle(){const card=document.getElementById('articleCard');const body=document.getElementById('articleBody');const button=document.getElementById('articleToggle');if(!card||!body||!button)return;requestAnimationFrame(()=>{if(body.scrollHeight<=body.clientHeight+8)button.classList.add('hidden');});button.addEventListener('click',()=>{const expanded=body.classList.toggle('is-expanded');card.classList.toggle('is-expanded',expanded);button.textContent=expanded?'Show less':'Read full article';});}
async function renderHome(){document.title='Core Wiki';const [stats,recent]=await Promise.all([getStats(),recentRecords()]);app.innerHTML=homeView(stats,recent);wireCommon();document.getElementById('browseAll')?.addEventListener('click',(event)=>{document.querySelectorAll('[data-core-card]').forEach((card)=>card.classList.remove('hidden'));event.currentTarget.classList.add('hidden');});}
async function renderCore(title){const core=await loadCore(title);remember(core.title);document.title=`${core.title} - Core Wiki`;const recent=await recentRecords();app.innerHTML=coreView(core,recent);wireCommon();wireArticle();}
function renderError(error){app.innerHTML=`<div class="error-wrap"><div><h2>Page unavailable</h2><p>${String(error?.message||'The page could not be loaded.')}</p><p><a href="./">Return home</a></p></div></div>`;}
window.addEventListener('popstate',()=>{const title=new URL(location.href).searchParams.get('core');title?renderCore(title).catch(renderError):renderHome().catch(renderError);});
app.innerHTML='<div class="loading-wrap">Loading Core Wiki...</div>';
const initial=new URL(location.href).searchParams.get('core');
initial?renderCore(initial).catch(renderError):renderHome().catch(renderError);
