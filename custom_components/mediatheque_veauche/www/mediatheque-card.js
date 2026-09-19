/* mediatheque-card — built artefact, ne pas éditer directement. Sources : frontend/src/ */
var ht=Object.defineProperty;var ut=Object.getOwnPropertyDescriptor;var A=(o,e,t,r)=>{for(var s=r>1?void 0:r?ut(e,t):e,i=o.length-1,n;i>=0;i--)(n=o[i])&&(s=(r?n(e,t,s):n(s))||s);return r&&s&&ht(e,t,s),s};var oe=globalThis,se=oe.ShadowRoot&&(oe.ShadyCSS===void 0||oe.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ge=Symbol(),Te=new WeakMap,z=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==ge)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(se&&e===void 0){let r=t!==void 0&&t.length===1;r&&(e=Te.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&Te.set(t,e))}return e}toString(){return this.cssText}},Re=o=>new z(typeof o=="string"?o:o+"",void 0,ge),I=(o,...e)=>{let t=o.length===1?o[0]:e.reduce((r,s,i)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[i+1],o[0]);return new z(t,o,ge)},Me=(o,e)=>{if(se)o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let r=document.createElement("style"),s=oe.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=t.cssText,o.appendChild(r)}},be=se?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let r of e.cssRules)t+=r.cssText;return Re(t)})(o):o;var{is:mt,defineProperty:ft,getOwnPropertyDescriptor:gt,getOwnPropertyNames:bt,getOwnPropertySymbols:vt,getPrototypeOf:_t}=Object,S=globalThis,Le=S.trustedTypes,yt=Le?Le.emptyScript:"",xt=S.reactiveElementPolyfillSupport,F=(o,e)=>o,V={toAttribute(o,e){switch(e){case Boolean:o=o?yt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},ie=(o,e)=>!mt(o,e),Oe={attribute:!0,type:String,converter:V,reflect:!1,useDefault:!1,hasChanged:ie};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),S.litPropertyMetadata??(S.litPropertyMetadata=new WeakMap);var w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Oe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let r=Symbol(),s=this.getPropertyDescriptor(e,r,t);s!==void 0&&ft(this.prototype,e,s)}}static getPropertyDescriptor(e,t,r){let{get:s,set:i}=gt(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){let d=s?.call(this);i?.call(this,n),this.requestUpdate(e,d,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Oe}static _$Ei(){if(this.hasOwnProperty(F("elementProperties")))return;let e=_t(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(F("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(F("properties"))){let t=this.properties,r=[...bt(t),...vt(t)];for(let s of r)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[r,s]of t)this.elementProperties.set(r,s)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let s=this._$Eu(t,r);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let s of r)t.unshift(be(s))}else e!==void 0&&t.push(be(e));return t}static _$Eu(e,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Me(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){let r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){let i=(r.converter?.toAttribute!==void 0?r.converter:V).toAttribute(t,r.type);this._$Em=e,i==null?this.removeAttribute(s):this.setAttribute(s,i),this._$Em=null}}_$AK(e,t){let r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let i=r.getPropertyOptions(s),n=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:V;this._$Em=s;let d=n.fromAttribute(t,i.type);this[s]=d??this._$Ej?.get(s)??d,this._$Em=null}}requestUpdate(e,t,r,s=!1,i){if(e!==void 0){let n=this.constructor;if(s===!1&&(i=this[e]),r??(r=n.getPropertyOptions(e)),!((r.hasChanged??ie)(i,t)||r.useDefault&&r.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:s,wrapped:i},n){r&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??t??this[e]),i!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,i]of this._$Ep)this[s]=i;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[s,i]of r){let{wrapped:n}=i,d=this[s];n!==!0||this._$AL.has(s)||d===void 0||this.C(s,void 0,i,d)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[F("elementProperties")]=new Map,w[F("finalized")]=new Map,xt?.({ReactiveElement:w}),(S.reactiveElementVersions??(S.reactiveElementVersions=[])).push("2.1.2");var W=globalThis,De=o=>o,ne=W.trustedTypes,He=ne?ne.createPolicy("lit-html",{createHTML:o=>o}):void 0,qe="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,ze="?"+k,$t=`<${ze}>`,R=document,X=()=>R.createComment(""),K=o=>o===null||typeof o!="object"&&typeof o!="function",Ae=Array.isArray,Et=o=>Ae(o)||typeof o?.[Symbol.iterator]=="function",ve=`[ 	
\f\r]`,G=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ne=/-->/g,Pe=/>/g,C=RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Be=/'/g,Ue=/"/g,Ie=/^(?:script|style|textarea|title)$/i,we=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),h=we(1),Wt=we(2),Xt=we(3),v=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),je=new WeakMap,T=R.createTreeWalker(R,129);function Fe(o,e){if(!Ae(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return He!==void 0?He.createHTML(e):e}var At=(o,e)=>{let t=o.length-1,r=[],s,i=e===2?"<svg>":e===3?"<math>":"",n=G;for(let d=0;d<t;d++){let a=o[d],c,u,p=-1,f=0;for(;f<a.length&&(n.lastIndex=f,u=n.exec(a),u!==null);)f=n.lastIndex,n===G?u[1]==="!--"?n=Ne:u[1]!==void 0?n=Pe:u[2]!==void 0?(Ie.test(u[2])&&(s=RegExp("</"+u[2],"g")),n=C):u[3]!==void 0&&(n=C):n===C?u[0]===">"?(n=s??G,p=-1):u[1]===void 0?p=-2:(p=n.lastIndex-u[2].length,c=u[1],n=u[3]===void 0?C:u[3]==='"'?Ue:Be):n===Ue||n===Be?n=C:n===Ne||n===Pe?n=G:(n=C,s=void 0);let b=n===C&&o[d+1].startsWith("/>")?" ":"";i+=n===G?a+$t:p>=0?(r.push(c),a.slice(0,p)+qe+a.slice(p)+k+b):a+k+(p===-2?d:b)}return[Fe(o,i+(o[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},Q=class o{constructor({strings:e,_$litType$:t},r){let s;this.parts=[];let i=0,n=0,d=e.length-1,a=this.parts,[c,u]=At(e,t);if(this.el=o.createElement(c,r),T.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(s=T.nextNode())!==null&&a.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(let p of s.getAttributeNames())if(p.endsWith(qe)){let f=u[n++],b=s.getAttribute(p).split(k),g=/([.?@])?(.*)/.exec(f);a.push({type:1,index:i,name:g[2],strings:b,ctor:g[1]==="."?ye:g[1]==="?"?xe:g[1]==="@"?$e:H}),s.removeAttribute(p)}else p.startsWith(k)&&(a.push({type:6,index:i}),s.removeAttribute(p));if(Ie.test(s.tagName)){let p=s.textContent.split(k),f=p.length-1;if(f>0){s.textContent=ne?ne.emptyScript:"";for(let b=0;b<f;b++)s.append(p[b],X()),T.nextNode(),a.push({type:2,index:++i});s.append(p[f],X())}}}else if(s.nodeType===8)if(s.data===ze)a.push({type:2,index:i});else{let p=-1;for(;(p=s.data.indexOf(k,p+1))!==-1;)a.push({type:7,index:i}),p+=k.length-1}i++}}static createElement(e,t){let r=R.createElement("template");return r.innerHTML=e,r}};function D(o,e,t=o,r){if(e===v)return e;let s=r!==void 0?t._$Co?.[r]:t._$Cl,i=K(e)?void 0:e._$litDirective$;return s?.constructor!==i&&(s?._$AO?.(!1),i===void 0?s=void 0:(s=new i(o),s._$AT(o,t,r)),r!==void 0?(t._$Co??(t._$Co=[]))[r]=s:t._$Cl=s),s!==void 0&&(e=D(o,s._$AS(o,e.values),s,r)),e}var _e=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:r}=this._$AD,s=(e?.creationScope??R).importNode(t,!0);T.currentNode=s;let i=T.nextNode(),n=0,d=0,a=r[0];for(;a!==void 0;){if(n===a.index){let c;a.type===2?c=new J(i,i.nextSibling,this,e):a.type===1?c=new a.ctor(i,a.name,a.strings,this,e):a.type===6&&(c=new Ee(i,this,e)),this._$AV.push(c),a=r[++d]}n!==a?.index&&(i=T.nextNode(),n++)}return T.currentNode=R,s}p(e){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}},J=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,s){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=D(this,e,t),K(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==v&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Et(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&K(this._$AH)?this._$AA.nextSibling.data=e:this.T(R.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=Q.createElement(Fe(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(t);else{let i=new _e(s,this),n=i.u(this.options);i.p(t),this.T(n),this._$AH=i}}_$AC(e){let t=je.get(e.strings);return t===void 0&&je.set(e.strings,t=new Q(e)),t}k(e){Ae(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,s=0;for(let i of e)s===t.length?t.push(r=new o(this.O(X()),this.O(X()),this,this.options)):r=t[s],r._$AI(i),s++;s<t.length&&(this._$AR(r&&r._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let r=De(e).nextSibling;De(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},H=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,s,i){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=l}_$AI(e,t=this,r,s){let i=this.strings,n=!1;if(i===void 0)e=D(this,e,t,0),n=!K(e)||e!==this._$AH&&e!==v,n&&(this._$AH=e);else{let d=e,a,c;for(e=i[0],a=0;a<i.length-1;a++)c=D(this,d[r+a],t,a),c===v&&(c=this._$AH[a]),n||(n=!K(c)||c!==this._$AH[a]),c===l?e=l:e!==l&&(e+=(c??"")+i[a+1]),this._$AH[a]=c}n&&!s&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ye=class extends H{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}},xe=class extends H{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}},$e=class extends H{constructor(e,t,r,s,i){super(e,t,r,s,i),this.type=5}_$AI(e,t=this){if((e=D(this,e,t,0)??l)===v)return;let r=this._$AH,s=e===l&&r!==l||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,i=e!==l&&(r===l||s);s&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ee=class{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){D(this,e)}};var wt=W.litHtmlPolyfillSupport;wt?.(Q,J),(W.litHtmlVersions??(W.litHtmlVersions=[])).push("3.3.2");var Ve=(o,e,t)=>{let r=t?.renderBefore??e,s=r._$litPart$;if(s===void 0){let i=t?.renderBefore??null;r._$litPart$=s=new J(e.insertBefore(X(),i),i,void 0,t??{})}return s._$AI(o),s};var Z=globalThis,x=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;let e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ve(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}};x._$litElement$=!0,x.finalized=!0,Z.litElementHydrateSupport?.({LitElement:x});var St=Z.litElementPolyfillSupport;St?.({LitElement:x});(Z.litElementVersions??(Z.litElementVersions=[])).push("4.2.2");var kt={attribute:!0,type:String,converter:V,reflect:!1,hasChanged:ie},Ct=(o=kt,e,t)=>{let{kind:r,metadata:s}=t,i=globalThis.litPropertyMetadata.get(s);if(i===void 0&&globalThis.litPropertyMetadata.set(s,i=new Map),r==="setter"&&((o=Object.create(o)).wrapped=!0),i.set(t.name,o),r==="accessor"){let{name:n}=t;return{set(d){let a=e.get.call(this);e.set.call(this,d),this.requestUpdate(n,a,o,!0,d)},init(d){return d!==void 0&&this.C(n,void 0,o,d),d}}}if(r==="setter"){let{name:n}=t;return function(d){let a=this[n];e.call(this,d),this.requestUpdate(n,a,o,!0,d)}}throw Error("Unsupported decorator location: "+r)};function N(o){return(e,t)=>typeof t=="object"?Ct(o,e,t):((r,s,i)=>{let n=s.hasOwnProperty(i);return s.constructor.createProperty(i,r),n?Object.getOwnPropertyDescriptor(s,i):void 0})(o,e,t)}function M(o){return N({...o,state:!0,attribute:!1})}var L=["overdue","today","urgent","soon","ok","not_extendable","unknown"],Ge={all:"list",grid:"covers",due:"covers"},Se=["list","covers"];function Y(o){return typeof o!="number"||!Number.isFinite(o)?{type:"unknown",text:"? Date inconnue",color:"#37474f",bg:"#cfd8dc"}:o<0?{type:"overdue",text:`\u2717 ${Math.abs(o)}j de retard`,color:"#b71c1c",bg:"#ffcdd2"}:o===0?{type:"today",text:"\u26A0 Aujourd'hui",color:"#d84315",bg:"#ffe0b2"}:o<=3?{type:"urgent",text:`\u26A0 ${o}j restants`,color:"#d84315",bg:"#ffe0b2"}:o<=7?{type:"soon",text:`\u26A1 ${o}j restants`,color:"#f57f17",bg:"#fff9c4"}:{type:"ok",text:`\u2713 ${o}j restants`,color:"#2e7d32",bg:"#c8e6c9"}}function We(o){return{columns:12,min_columns:o==="covers"?4:6,rows:"auto",min_rows:2}}function Xe(o){return o==="covers"?2:4}var Tt="4.1.1";function Ke(){console.info(`%c MEDIATHEQUE-CARD %c ${Tt} IS INSTALLED `,"color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; background: #c8e6c9; font-weight: bold;")}function m(o,e,t,...r){let s=`%c MEDIATHEQUE-CARD %c [${e}]`,i=["color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; font-weight: bold;"];console[o](s+" "+t,...i,...r)}var Qe=10,Rt=2e3,Mt=15e3,de=class{constructor(e,t){this.cardName=e;this.fire=t;this.timer=null;this.count=0}schedule(){if(this.timer||(this.count++,this.count>Qe))return;let e=Math.min(Rt*this.count,Mt);m("info",this.cardName,"Retry %d dans %dms\u2026",this.count,e),this.timer=setTimeout(()=>{this.timer=null,this.fire()},e)}get exhausted(){return this.count>Qe}reset(){this.count=0,this.cancel()}cancel(){this.timer&&(clearTimeout(this.timer),this.timer=null)}};var P="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2252%22 height=%2276%22 viewBox=%220 0 52 76%22%3E%3Crect width=%2252%22 height=%2276%22 fill=%22%23e0e0e0%22 rx=%224%22/%3E%3Ctext x=%2226%22 y=%2242%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%239e9e9e%22%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E",ee=o=>{o.target.src=P};function ce(o){return o.read?"Marquer non lu":"Marquer comme lu"}function le(o){return!!o.read_key}function Je(o){return e=>{e.stopPropagation(),o()}}function Lt(o,e){return h`<span
    class="book-tile-read ${o.read?"is-read":""}"
    role="button"
    tabindex="0"
    aria-pressed=${o.read?"true":"false"}
    title=${ce(o)}
    @click=${Je(e)}
    >${o.read?"\u2713":"+"}</span
  >`}function Ze({loan:o,onClick:e,onToggleRead:t}){let r=Y(o.days_left),s=o.cover_url||P,i=o.days_left,n=i==null?"?":i<0?`${Math.abs(i)}j`:i===0?"!":`${i}j`;return h`
    <button
      class="book-tile ${o.read?"is-read":""}"
      title="${o.titre}${o.emprunteur?` \u2014 ${o.emprunteur}`:""}"
      @click=${e}
    >
      <img
        class="book-tile-cover"
        src=${s}
        alt=""
        loading="lazy"
        @error=${ee}
      />
      <span
        class="book-tile-badge"
        style="color:${r.color};background:${r.bg}"
        aria-label=${r.text}
        >${n}</span
      >
      ${o.extend_disabled||o.extended?h`<span
            class="book-tile-corner"
            style=${o.extend_disabled?"background:#b71c1c":"background:#6a1b9a"}
            title=${o.extend_disabled?"D\xE9sactiv\xE9":"Non prolongeable"}
            >✗</span
          >`:l}
      ${le(o)?Lt(o,t):l}
    </button>
  `}function Ye({loan:o,onClick:e,onToggleRead:t}){let r=Y(o.days_left),s=o.cover_url||P;return h`
    <div class="book-row">
      <div class="book-cover-wrapper" @click=${e}>
        <img
          class="book-cover"
          src=${s}
          alt=""
          loading="lazy"
          @error=${ee}
        />
      </div>
      <div class="book-info">
        <div class="book-title" title=${o.titre}>${o.titre}</div>
        <div class="book-date">Retour : ${o.due_date_display}</div>
        <div class="book-badges">
          <span class="badge-days" style="color:${r.color};background:${r.bg}">
            ${r.text}
          </span>
          ${o.extend_disabled?h`<span class="badge-days" style="color:#b71c1c;background:#ffcdd2"
                >✗ Désactivé</span
              >`:o.extended?h`<span class="badge-days" style="color:#6a1b9a;background:#e1bee7"
                  >✗ Non prolongeable</span
                >`:l}
          ${o.read?h`<span class="badge-days badge-read" style="color:#1b5e20;background:#c8e6c9"
                >✓ Lu</span
              >`:l}
        </div>
      </div>
      ${le(o)?h`<button
            class="book-row-read ${o.read?"is-read":""}"
            aria-pressed=${o.read?"true":"false"}
            title=${ce(o)}
            @click=${Je(t)}
          >
            ${o.read?"\u2713":"+"}
          </button>`:l}
    </div>
  `}var pe={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},U=o=>(...e)=>({_$litDirective$:o,values:e}),B=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,r){this._$Ct=e,this._$AM=t,this._$Ci=r}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var et=U(class extends B{constructor(o){if(super(o),o.type!==pe.ATTRIBUTE||o.name!=="class"||o.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(o){return" "+Object.keys(o).filter(e=>o[e]).join(" ")+" "}update(o,[e]){if(this.st===void 0){this.st=new Set,o.strings!==void 0&&(this.nt=new Set(o.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(let r in e)e[r]&&!this.nt?.has(r)&&this.st.add(r);return this.render(e)}let t=o.element.classList;for(let r of this.st)r in e||(t.remove(r),this.st.delete(r));for(let r in e){let s=!!e[r];s===this.st.has(r)||this.nt?.has(r)||(s?(t.add(r),this.st.add(r)):(t.remove(r),this.st.delete(r)))}return v}});function _({title:o,message:e="Chargement\u2026"}){return h`
    <ha-card>
      <div class="mediatheque-header">
        <span class="mediatheque-title">${o}</span>
      </div>
      <div style="padding:32px 16px;text-align:center">
        <div class="mediatheque-loader"></div>
        <div style="margin-top:12px;color:var(--secondary-text-color);font-size:0.9em">
          ${e}
        </div>
      </div>
    </ha-card>
  `}var Ot=720*60*1e3;function ke(o){if(o.fetch_ok!==!1)return l;let e=o.last_success?new Date(o.last_success):null,t=e?.getTime();if(t!==void 0&&!Number.isNaN(t)&&Date.now()-t<Ot)return l;let r=t===void 0||Number.isNaN(t)?"date inconnue":e.toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});return h`
    <div class="mc-stale" role="status">
      <span>⚠</span>
      <span>Synchronisation en échec — liste des emprunts du ${r}</span>
    </div>
  `}function Ce({title:o,badgeText:e,highlight:t,cardId:r,onBarcodeClick:s}){return h`
    <div class="mediatheque-header">
      <span class="mediatheque-title">${o}</span>
      <span class="header-right">
        <span class=${et({"mediatheque-total":!0,highlight:t})}>${e}</span>
        ${r?h`<button class="mc-barcode-btn" title="Ma carte" @click=${s}>
              |||
            </button>`:l}
      </span>
    </div>
  `}var O=class extends B{constructor(e){if(super(e),this.it=l,e.type!==pe.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===l||e==null)return this._t=void 0,this.it=e;if(e===v)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;let t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};O.directiveName="unsafeHTML",O.resultType=1;var oo=U(O);var te=class extends O{};te.directiveName="unsafeSVG",te.resultType=2;var tt=U(te);var rt={0:"000110100",1:"100100001",2:"001100001",3:"101100000",4:"000110001",5:"100110000",6:"001110000",7:"000100101",8:"100100100",9:"001100100",A:"100001001",B:"001001001",C:"101001000",D:"000011001",E:"100011000",F:"001011000",G:"000001101",H:"100001100",I:"001001100",J:"000011100",K:"100000011",L:"001000011",M:"101000010",N:"000010011",O:"100010010",P:"001010010",Q:"000000111",R:"100000110",S:"001000110",T:"000010110",U:"110000001",V:"011000001",W:"111000000",X:"010010001",Y:"110010000",Z:"011010000","-":"010000101",".":"110000100"," ":"011000100",$:"010101000","/":"010100010","+":"010001010","%":"000101010","*":"010010100"},he=2,Dt=he*3,ot=he*10;function st(o,e=80){if(!o)return"";let t=o.toUpperCase(),r=["*"];for(let c of t)c!=="*"&&rt[c]&&r.push(c);if(r.push("*"),r.length<=2)return"";let s=[];for(let c=0;c<r.length;c++){let u=rt[r[c]];if(u){for(let p=0;p<9;p++)s.push({width:u[p]==="1"?Dt:he,isBar:p%2===0});c<r.length-1&&s.push({width:he,isBar:!1})}}let n=s.reduce((c,u)=>c+u.width,0)+ot*2,d=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${e}" width="${n}" height="${e}"><rect x="0" y="0" width="${n}" height="${e}" fill="#fff"/>`,a=ot;for(let c of s)c.isBar&&(d+=`<rect x="${a}" y="0" width="${c.width}" height="${e}" fill="#000"/>`),a+=c.width;return d+="</svg>",d}function it({loan:o,onOverlayClick:e,onClose:t,onExtend:r,onToggleRead:s}){let i=o.cover_url||P;return h`
    <div class="mc-modal-overlay active" @click=${e}>
      <div class="mc-modal">
        <div class="mc-modal-body mc-modal-body-top">
          <div class="mc-modal-title">${o.titre}</div>
        </div>
        <img class="mc-modal-cover" src=${i} alt="" @error=${ee} />
        <div class="mc-modal-body">
          ${o.isbn?h`<div class="mc-modal-isbn">ISBN : ${o.isbn}</div>`:l}
          ${o.read?h`<div class="mc-modal-read">✓ Lu</div>`:l}
          <div class="mc-modal-actions">
            <button class="mc-modal-btn mc-modal-btn-close" @click=${t}>Fermer</button>
            ${le(o)?h`<button
                  class="mc-modal-btn mc-modal-btn-read ${o.read?"is-read":""}"
                  aria-pressed=${o.read?"true":"false"}
                  @click=${s}
                >
                  ${ce(o)}
                </button>`:l}
            ${o.can_extend?h`<button class="mc-modal-btn mc-modal-btn-extend" @click=${r}>
                  Prolonger
                </button>`:l}
          </div>
        </div>
      </div>
    </div>
  `}function nt({loan:o,onOverlayClick:e,onCancel:t,onConfirm:r}){return h`
    <div class="mc-confirm-overlay active" @click=${e}>
      <div class="mc-confirm-dialog">
        <div class="mc-confirm-icon">↻</div>
        <div class="mc-confirm-title">Prolonger cet emprunt ?</div>
        <div class="mc-confirm-text">${o.titre}</div>
        <div class="mc-confirm-actions">
          <button class="mc-modal-btn-cancel" @click=${t}>Annuler</button>
          <button class="mc-modal-btn-confirm" @click=${r}>Confirmer</button>
        </div>
      </div>
    </div>
  `}function at({cardId:o,onOverlayClick:e,onClose:t}){let r=st(o);return h`
    <div class="mc-barcode-overlay active" @click=${e}>
      <div class="mc-barcode-dialog">
        <h3>Ma carte</h3>
        <div class="mc-barcode-id">${o}</div>
        <div class="mc-barcode-svg">${tt(r)}</div>
        <button class="mc-barcode-close" @click=${t}>Fermer</button>
      </div>
    </div>
  `}var dt=I`
  :host {
    display: block;
  }
  .mediatheque-header {
    padding: 16px 16px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .mediatheque-title {
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .mediatheque-total {
    border-radius: 12px;
    padding: 2px 10px;
    font-size: 0.85em;
    font-weight: 600;
    color: var(--text-primary-color, #fff);
    background: var(--primary-color);
  }
  .mediatheque-total.highlight {
    background: #f57f17;
    color: #fff;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .member-section {
    padding: 8px 16px;
  }
  .member-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  .member-icon {
    font-size: 1.1em;
  }
  .member-name {
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .member-count {
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 10px;
    padding: 1px 8px;
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }
  .book-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
  }
  .book-row:last-child {
    border-bottom: none;
  }
  .member-section .book-row {
    padding: 8px 0;
  }
  .book-cover {
    width: 52px;
    height: 76px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
    background: var(--secondary-background-color, #f0f0f0);
  }
  .book-cover-wrapper {
    position: relative;
    flex-shrink: 0;
    cursor: pointer;
  }
  .book-info {
    flex: 1;
    min-width: 0;
  }
  .book-title {
    font-size: 0.9em;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .book-date {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }
  .book-badges {
    display: flex;
    gap: 6px;
    margin-top: 4px;
    flex-wrap: wrap;
  }
  .book-row-read {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    background: var(--secondary-background-color, #f0f0f0);
    color: var(--secondary-text-color);
    font-size: 0.85em;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
  }
  .book-row-read.is-read {
    background: #2e7d32;
    border-color: #2e7d32;
    color: #fff;
  }
  .badge-days {
    font-size: 0.75em;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
    white-space: nowrap;
  }
  .empty-state {
    padding: 24px 16px;
    text-align: center;
    color: var(--secondary-text-color);
  }
  .mc-stale {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 16px 8px;
    padding: 6px 10px;
    border-radius: 6px;
    background: var(--warning-color, #ffa726);
    color: #21201f;
    font-size: 0.8em;
    line-height: 1.3;
  }
  .book-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 16px 16px;
    justify-content: flex-start;
  }
  .book-tile {
    position: relative;
    width: 80px;
    height: 120px;
    padding: 0;
    border: none;
    background: var(--secondary-background-color, #f0f0f0);
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    transition: transform 0.12s ease;
  }
  .book-tile:active {
    transform: scale(0.96);
  }
  /* Le liseré vert doit rester lisible sur une couverture claire comme sur
     une sombre : posé en inset, il mord sur l'image plutôt que sur le fond de
     la tuile, que la couverture recouvre entièrement. */
  .book-tile.is-read {
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.15),
      inset 0 0 0 2px #2e7d32;
  }
  .book-tile-read {
    position: absolute;
    bottom: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 0.72em;
    font-weight: 700;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    background: rgba(0, 0, 0, 0.45);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  .book-tile-read.is-read {
    background: #2e7d32;
  }
  .book-tile-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .book-tile-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 22px;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.72em;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  .book-tile-corner {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    color: #fff;
    font-size: 0.7em;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  .mediatheque-loader {
    width: 36px;
    height: 36px;
    border: 3px solid var(--divider-color, #e0e0e0);
    border-top: 3px solid var(--primary-color, #03a9f4);
    border-radius: 50%;
    margin: 0 auto;
    animation: mediatheque-spin 1s linear infinite;
  }
  @keyframes mediatheque-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;var ct=I`
  .mc-modal-overlay,
  .mc-confirm-overlay,
  .mc-barcode-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background: rgba(0, 0, 0, 0.7);
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
  }
  .mc-confirm-overlay {
    z-index: 1000;
    background: rgba(0, 0, 0, 0.75);
  }
  .mc-modal-overlay.active,
  .mc-confirm-overlay.active,
  .mc-barcode-overlay.active {
    display: flex;
  }
  .mc-modal {
    background: var(--card-background-color, #fff);
    border-radius: 12px;
    max-width: 360px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  .mc-modal-cover {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    background: var(--secondary-background-color, #f0f0f0);
  }
  .mc-modal-body {
    padding: 16px;
  }
  .mc-modal-body-top {
    padding-bottom: 0;
  }
  .mc-modal-title {
    font-size: 1.1em;
    font-weight: 600;
    color: var(--primary-text-color);
    margin-bottom: 8px;
  }
  .mc-modal-isbn {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    margin-bottom: 12px;
  }
  .mc-modal-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  .mc-modal-btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.9em;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .mc-modal-btn:active {
    opacity: 0.7;
  }
  .mc-modal-btn-close,
  .mc-modal-btn-cancel {
    background: var(--secondary-background-color, #e0e0e0);
    color: var(--primary-text-color);
  }
  .mc-modal-btn-extend,
  .mc-modal-btn-confirm {
    background: #1565c0;
    color: #fff;
  }
  .mc-modal-btn-read {
    background: var(--secondary-background-color, #e0e0e0);
    color: var(--primary-text-color);
    border: 1px solid #2e7d32;
  }
  .mc-modal-btn-read.is-read {
    background: #2e7d32;
    border-color: #2e7d32;
    color: #fff;
  }
  .mc-modal-read {
    margin-top: 8px;
    font-size: 0.8em;
    font-weight: 600;
    color: #2e7d32;
  }
  .mc-confirm-dialog {
    background: var(--card-background-color, #fff);
    border-radius: 12px;
    max-width: 320px;
    width: 100%;
    padding: 24px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  .mc-confirm-icon {
    font-size: 2.5em;
    margin-bottom: 12px;
  }
  .mc-confirm-title {
    font-size: 1em;
    font-weight: 600;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }
  .mc-confirm-text {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    margin-bottom: 16px;
  }
  .mc-confirm-actions {
    display: flex;
    gap: 8px;
  }
  .mc-modal-btn-cancel,
  .mc-modal-btn-confirm {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.9em;
    font-weight: 600;
    cursor: pointer;
  }
  .mc-barcode-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    font-size: 1.2em;
    color: var(--primary-text-color);
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  .mc-barcode-btn:hover {
    opacity: 1;
  }
  .mc-barcode-dialog {
    background: #fff;
    border-radius: 12px;
    max-width: 360px;
    width: 100%;
    padding: 24px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  .mc-barcode-dialog h3 {
    margin: 0 0 4px;
    font-size: 1em;
    font-weight: 600;
    color: #333;
  }
  .mc-barcode-id {
    font-size: 0.85em;
    color: #666;
    margin-bottom: 16px;
  }
  .mc-barcode-svg svg {
    width: 100%;
    height: auto;
  }
  .mc-barcode-close {
    margin-top: 16px;
    padding: 8px 24px;
    border: none;
    border-radius: 8px;
    background: #e0e0e0;
    color: #333;
    font-weight: 600;
    cursor: pointer;
  }
`;var Ht={overdue:"En retard",today:"\xC0 rendre aujourd'hui",urgent:"1 \xE0 3 jours restants",soon:"4 \xE0 7 jours restants",ok:"Plus de 7 jours",not_extendable:"Non prolongeable",unknown:"Date illisible"},Nt={entity:"Entit\xE9 (sensor)",title:"Titre personnalis\xE9",mode:"Mode",badges:"Filtres par badge",total_entity:'Entit\xE9 du total (mode "couvertures")',card_id:"Identifiant carte"},Pt=[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"title",selector:{text:{}}},{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"list",label:"Liste (group\xE9e par membre)"},{value:"covers",label:"Couvertures (grille \xE0 rendre)"}]}}},{name:"badges",selector:{select:{multiple:!0,options:L.map(o=>({value:o,label:Ht[o]??o}))}}},{name:"total_entity",selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"card_id",selector:{text:{}}}],Bt=o=>Nt[o.name]??o.name,re=class extends x{constructor(){super(...arguments);this._config={entity:""}}setConfig(t){this._config=t??{entity:""}}createRenderRoot(){return this}render(){return this.hass?h`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Pt}
        .computeLabel=${Bt}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:h``}_valueChanged(t){let r={...t.detail.value};for(let s of Object.keys(r)){if(s==="entity"){typeof r[s]!="string"&&(r[s]="");continue}let i=r[s];(i===""||i===void 0||i===null)&&delete r[s],Array.isArray(i)&&i.length===0&&delete r[s]}this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:r},bubbles:!0,composed:!0}))}};A([N({attribute:!1})],re.prototype,"hass",2),A([M()],re.prototype,"_config",2);customElements.get("mediatheque-card-editor")||customElements.define("mediatheque-card-editor",re);var $=class $ extends x{constructor(){super(...arguments);this._detailLoan=null;this._confirmExtend=null;this._barcodeOpen=!1;this._id=++$._instances;this._retry=new de("card",()=>this.requestUpdate());this._hasRendered=!1;this._firstUpdateLogged=!1;this._openDetail=t=>{this._detailLoan=t};this._closeDetail=()=>{this._detailLoan=null};this._toggleRead=t=>{let r=t.read_key;if(!r||!this._hass)return;let s=!t.read;this._detailLoan&&this._detailLoan.read_key===r&&(this._detailLoan={...this._detailLoan,read:s}),this._hass.callService("mediatheque_veauche","set_read",{read_key:r,read:s}).catch(i=>{console.error("[mediatheque-card] set_read a \xE9chou\xE9",i)})};this._askExtend=t=>{t.extend_url&&(this._confirmExtend={loan:t})};this._closeConfirm=()=>{this._confirmExtend=null};this._confirmExtendNow=()=>{let t=this._confirmExtend?.loan.extend_url;t&&this._hass&&this._hass.callService("mediatheque_veauche","extend_loan",{extend_url:t}).catch(r=>{m("warn","card","la prolongation a \xE9chou\xE9 : %o",r)}),this._confirmExtend=null,this._detailLoan=null};this._openBarcode=()=>{this._barcodeOpen=!0};this._closeBarcode=()=>{this._barcodeOpen=!1};this._onOverlayClick=t=>{t.target===t.currentTarget&&this._closeDetail()};this._onConfirmOverlayClick=t=>{t.target===t.currentTarget&&this._closeConfirm()};this._onBarcodeOverlayClick=t=>{t.target===t.currentTarget&&this._closeBarcode()}}set hass(t){this._hass=t,this._syncEntityStates()}get hass(){return this._hass}setConfig(t){if(!t||typeof t!="object")throw m("error","card","setConfig rejet\xE9, config non-objet : %o",t),new Error("Configuration manquante ou invalide");let r="";typeof t.entity=="string"?r=t.entity:t.entity!==void 0&&t.entity!==null&&m("error","card","'entity' doit \xEAtre une cha\xEEne, re\xE7u %o \u2014 carte en attente de configuration",t.entity);let s;if(t.mode!==void 0){let d=Ge[t.mode]??t.mode;Se.includes(d)?s=d:m("warn","card","Mode '%s' inconnu, fallback sur 'list'. Modes valides : %s",t.mode,Se.join(", "))}let i;if(t.badges!==void 0)if(!Array.isArray(t.badges))m("warn","card","'badges' doit \xEAtre une liste, ignor\xE9 (re\xE7u : %o)",t.badges);else{let d=t.badges.filter(c=>L.includes(c)),a=t.badges.filter(c=>!L.includes(c));a.length&&m("warn","card","Badges inconnus ignor\xE9s : %s. Valides : %s",a.join(", "),L.join(", ")),d.length===0?m("warn","card","Filtre de badges vide, filtre ignor\xE9"):i=d}m("info","card","#%d setConfig accept\xE9 (entity=%s, mode=%s) \xE0 t=%dms",this._id,r||"(vide)",s??"list",Math.round(performance.now()));let n=this._config;this._config={...t,entity:r,mode:s,badges:i},(n?.entity!==this._config.entity||n?.total_entity!==this._config.total_entity)&&(this._hasRendered=!1,this._lastTemplate=void 0,this._renderedEntityState=void 0,this._renderedTotalState=void 0,this._retry.reset()),this._syncEntityStates()}_syncEntityStates(){let t=this._hass?.states;if(!t||!this._config?.entity){this._entityState=void 0,this._totalEntityState=void 0;return}this._entityState=t[this._config.entity],this._totalEntityState=this._config.total_entity?t[this._config.total_entity]:void 0}static getStubConfig(t,r,s){let i=t?.states??{},n=[...r??[],...s??[],...Object.keys(i)].filter(a=>a.startsWith("sensor."));return{entity:n.find(a=>i[a]?.attributes?.membres)??n.find(a=>a.includes("mediatheque"))??"",mode:"list"}}static getConfigElement(){return document.createElement("mediatheque-card-editor")}getCardSize(){return Xe(this._config?.mode)}getGridOptions(){return We(this._config?.mode)}connectedCallback(){super.connectedCallback(),this._retry.reset(),customElements.get("ha-card")||customElements.whenDefined("ha-card").then(()=>{m("info","card","ha-card d\xE9fini apr\xE8s le premier rendu, re-render"),this.requestUpdate()})}disconnectedCallback(){super.disconnectedCallback(),this._retry.cancel()}updated(){this._firstUpdateLogged||(this._firstUpdateLogged=!0,m("info","card","#%d premier rendu effectu\xE9 \xE0 t=%dms (donn\xE9es=%s)",this._id,Math.round(performance.now()),this._hasRendered?"oui":"non, loader")),this._renderedEntityState=this._entityState,this._renderedTotalState=this._totalEntityState,this._hasRendered&&this.dispatchEvent(new CustomEvent("mediatheque-card-update",{bubbles:!0,composed:!0}))}shouldUpdate(t){return t.has("_detailLoan")||t.has("_confirmExtend")||t.has("_barcodeOpen")||t.has("_config")||!this._hasRendered?!0:this._detailLoan||this._confirmExtend||this._barcodeOpen?!1:t.has("hass")?this._entityState!==this._renderedEntityState||this._totalEntityState!==this._renderedTotalState:!0}render(){try{return this._render()}catch(t){return m("error","card","render() a throw, fallback loader : %o",t),this._retry.schedule(),_({title:"M\xE9diath\xE8que",message:"Erreur \u2014 voir console"})}}_render(){let t=this._config?.mode??"list",r=this._config?.title??(t==="covers"?"A rendre bient\xF4t":"M\xE9diath\xE8que de Veauche");if(!this._config)return _({title:r,message:"En attente de configuration\u2026"});if(!this._hass)return _({title:r,message:"Connexion \xE0 Home Assistant\u2026"});let s=this._config.entity;if(!s)return _({title:r,message:"S\xE9lectionnez une entit\xE9"});let i=this._hass.states;if(!i)return m("warn","card","hass.states absent, rendu du loader"),this._retry.schedule(),this._retry.exhausted?_({title:r,message:"Donn\xE9es Home Assistant indisponibles"}):this._lastTemplate??_({title:r,message:"En attente de Home Assistant\u2026"});let n=i[s];if(!n||n.state==="unavailable"||n.state==="unknown"){let p=n?`state=${n.state}`:"entity not found";return m("warn","card","%s \u2014 %s %s",s,p,this._hasRendered?"(keeping last render)":"(showing loader)"),this._retry.schedule(),this._hasRendered&&!this._retry.exhausted?this._lastTemplate??_({title:r}):this._hasRendered?_({title:r,message:`${s} indisponible`}):(this._lastTemplate=_({title:r,message:this._retry.exhausted?`Donn\xE9es indisponibles pour ${s}`:"En attente des donn\xE9es\u2026"}),this._lastTemplate)}let d=n.attributes??{};if(!("membres"in d)&&!("livres"in d))return m("error","card","%s ne porte ni \xAB membres \xBB ni \xAB livres \xBB : ce n'est pas un capteur de cette int\xE9gration",s),_({title:r,message:`${s} n'est pas un capteur M\xE9diath\xE8que`});this._retry.reset();let a=this._config.badges??[...L],c=!!this._config.badges,u=t==="covers"?this._renderCovers(n,a,c,r):this._renderList(n,a,c,r);return this._lastTemplate=u,this._hasRendered=!0,u}_matchesBadgeFilter(t,r){return r.includes("not_extendable")&&(t.extended||t.extend_disabled)?!0:r.includes(Y(t.days_left).type)}_renderCovers(t,r,s,i){let n=t.attributes??{},d=n.livres??Object.values(n.membres??{}).flat(),a=s?d.filter(g=>this._matchesBadgeFilter(g,r)):d,c=this._totalEntityState,u=n.card_id||c?.attributes?.card_id||this._config?.card_id||"",p=`${a.length}`,f=a.length>0,b=[...a].sort((g,y)=>(g.days_left??Number.MAX_SAFE_INTEGER)-(y.days_left??Number.MAX_SAFE_INTEGER));return h`
      <ha-card>
        ${Ce({title:i,badgeText:p,highlight:f,cardId:u,onBarcodeClick:this._openBarcode})}
        ${ke(n)}
        ${b.length===0?h`<div class="empty-state">Aucun livre à rendre</div>`:h`<div class="book-grid">
              ${b.map(g=>Ze({loan:g,onClick:()=>this._openDetail(g),onToggleRead:()=>this._toggleRead(g)}))}
            </div>`}
        ${this._renderModals(u)}
      </ha-card>
    `}_renderList(t,r,s,i){let n=t.attributes??{},d=n.membres??{},a=n.compte??"",c=n.card_id??this._config?.card_id??"",u={},p=0;for(let[y,E]of Object.entries(d)){let j=s?E.filter(fe=>this._matchesBadgeFilter(fe,r)):E;j.length>0&&(u[y]=j,p+=j.length)}let f=Object.keys(u).sort((y,E)=>y===a?-1:E===a?1:y.localeCompare(E)),b=`${p} emprunt${p>1?"s":""}`,g=s&&p>0;return h`
      <ha-card>
        ${Ce({title:i,badgeText:b,highlight:g,cardId:c,onBarcodeClick:this._openBarcode})}
        ${ke(n)}
        ${f.length===0?h`<div class="empty-state">Aucun emprunt en cours</div>`:f.map(y=>{let E=u[y];if(!E)return l;let j=y===a?"\u{1F464}":"\u{1F466}",fe=[...E].sort((q,pt)=>(q.days_left??Number.MAX_SAFE_INTEGER)-(pt.days_left??Number.MAX_SAFE_INTEGER));return h`
                <div class="member-section">
                  <div class="member-header">
                    <span class="member-icon">${j}</span>
                    <span class="member-name">${y}</span>
                    <span class="member-count">${E.length}</span>
                  </div>
                  ${fe.map(q=>Ye({loan:q,onClick:()=>this._openDetail(q),onToggleRead:()=>this._toggleRead(q)}))}
                </div>
              `})}
        ${this._renderModals(c)}
      </ha-card>
    `}_renderModals(t){return h`
      ${this._detailLoan?it({loan:this._detailLoan,onOverlayClick:this._onOverlayClick,onClose:this._closeDetail,onExtend:()=>this._askExtend(this._detailLoan),onToggleRead:()=>this._toggleRead(this._detailLoan)}):l}
      ${this._confirmExtend?nt({loan:this._confirmExtend.loan,onOverlayClick:this._onConfirmOverlayClick,onCancel:this._closeConfirm,onConfirm:this._confirmExtendNow}):l}
      ${this._barcodeOpen&&t?at({cardId:t,onOverlayClick:this._onBarcodeOverlayClick,onClose:this._closeBarcode}):l}
    `}};$.styles=[dt,ct],$._instances=0,A([N({attribute:!1})],$.prototype,"hass",1),A([M()],$.prototype,"_config",2),A([M()],$.prototype,"_detailLoan",2),A([M()],$.prototype,"_confirmExtend",2),A([M()],$.prototype,"_barcodeOpen",2);var ue=$;Ke();window.loadCardHelpers?.().catch(o=>{m("warn","card","loadCardHelpers() a \xE9chou\xE9 : %o",o)});var me="mediatheque-card",Ut=5,lt=0;function jt(){if(customElements.get(me)||lt>=Ut)return!1;lt++;try{return customElements.define(me,class extends ue{}),m("warn","card","r\xE9-enregistr\xE9 \xE0 t=%dms : le registre d'\xE9l\xE9ments personnalis\xE9s avait \xE9t\xE9 remplac\xE9 depuis le premier enregistrement",Math.round(performance.now())),!0}catch(o){return m("error","card","r\xE9-enregistrement impossible : %o",o),!1}}customElements.get(me)?m("info","card","module d\xE9j\xE0 enregistr\xE9, ce chargement est ignor\xE9"):(customElements.define(me,ue),m("info","card","\xE9l\xE9ment enregistr\xE9 \xE0 t=%dms apr\xE8s le d\xE9but du chargement de la page",Math.round(performance.now())));function qt(){let o=0,e=t=>{if(t.localName==="hui-error-card"){let r=t;((r._config??r.config)?.message??"").includes("mediatheque-card")&&(t.dispatchEvent(new CustomEvent("ll-rebuild",{bubbles:!0,composed:!0})),o++);return}for(let r of[...t.shadowRoot?.children??[],...t.children])e(r)};return document.body&&e(document.body),o}for(let o of[0,50,150,400,1e3,2e3,4e3])window.setTimeout(()=>{try{jt();let e=qt();e>0&&m("warn","card","%d carte(s) d'erreur reconstruite(s) apr\xE8s %dms \u2014 la vue a \xE9t\xE9 b\xE2tie avant l'enregistrement de l'\xE9l\xE9ment",e,o)}catch(e){m("error","card","r\xE9paration des cartes d'erreur impossible : %o",e)}},o);window.customCards=window.customCards??[];window.customCards.some(o=>o.type==="mediatheque-card")||window.customCards.push({type:"mediatheque-card",name:"M\xE9diath\xE8que de Veauche",description:"Affiche les emprunts de la m\xE9diath\xE8que de Veauche"});export{ue as MediathequeCard};
