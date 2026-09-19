/* mediatheque-card — built artefact, ne pas éditer directement. Sources : frontend/src/ */
var bt=Object.defineProperty;var vt=Object.getOwnPropertyDescriptor;var w=(r,e,t,o)=>{for(var i=o>1?void 0:o?vt(e,t):e,s=r.length-1,n;s>=0;s--)(n=r[s])&&(i=(o?n(e,t,i):n(i))||i);return o&&i&&bt(e,t,i),i};var re=globalThis,oe=re.ShadowRoot&&(re.ShadyCSS===void 0||re.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,be=Symbol(),Me=new WeakMap,I=class{constructor(e,t,o){if(this._$cssResult$=!0,o!==be)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(oe&&e===void 0){let o=t!==void 0&&t.length===1;o&&(e=Me.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),o&&Me.set(t,e))}return e}toString(){return this.cssText}},Oe=r=>new I(typeof r=="string"?r:r+"",void 0,be),z=(r,...e)=>{let t=r.length===1?r[0]:e.reduce((o,i,s)=>o+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[s+1],r[0]);return new I(t,r,be)},He=(r,e)=>{if(oe)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let o=document.createElement("style"),i=re.litNonce;i!==void 0&&o.setAttribute("nonce",i),o.textContent=t.cssText,r.appendChild(o)}},ve=oe?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(let o of e.cssRules)t+=o.cssText;return Oe(t)})(r):r;var{is:_t,defineProperty:yt,getOwnPropertyDescriptor:xt,getOwnPropertyNames:$t,getOwnPropertySymbols:Et,getPrototypeOf:wt}=Object,k=globalThis,De=k.trustedTypes,At=De?De.emptyScript:"",kt=k.reactiveElementPolyfillSupport,F=(r,e)=>r,V={toAttribute(r,e){switch(e){case Boolean:r=r?At:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},ie=(r,e)=>!_t(r,e),Be={attribute:!0,type:String,converter:V,reflect:!1,useDefault:!1,hasChanged:ie};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),k.litPropertyMetadata??(k.litPropertyMetadata=new WeakMap);var A=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Be){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let o=Symbol(),i=this.getPropertyDescriptor(e,o,t);i!==void 0&&yt(this.prototype,e,i)}}static getPropertyDescriptor(e,t,o){let{get:i,set:s}=xt(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:i,set(n){let c=i?.call(this);s?.call(this,n),this.requestUpdate(e,c,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Be}static _$Ei(){if(this.hasOwnProperty(F("elementProperties")))return;let e=wt(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(F("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(F("properties"))){let t=this.properties,o=[...$t(t),...Et(t)];for(let i of o)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[o,i]of t)this.elementProperties.set(o,i)}this._$Eh=new Map;for(let[t,o]of this.elementProperties){let i=this._$Eu(t,o);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let o=new Set(e.flat(1/0).reverse());for(let i of o)t.unshift(ve(i))}else e!==void 0&&t.push(ve(e));return t}static _$Eu(e,t){let o=t.attribute;return o===!1?void 0:typeof o=="string"?o:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let o of t.keys())this.hasOwnProperty(o)&&(e.set(o,this[o]),delete this[o]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return He(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,o){this._$AK(e,o)}_$ET(e,t){let o=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,o);if(i!==void 0&&o.reflect===!0){let s=(o.converter?.toAttribute!==void 0?o.converter:V).toAttribute(t,o.type);this._$Em=e,s==null?this.removeAttribute(i):this.setAttribute(i,s),this._$Em=null}}_$AK(e,t){let o=this.constructor,i=o._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let s=o.getPropertyOptions(i),n=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:V;this._$Em=i;let c=n.fromAttribute(t,s.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(e,t,o,i=!1,s){if(e!==void 0){let n=this.constructor;if(i===!1&&(s=this[e]),o??(o=n.getPropertyOptions(e)),!((o.hasChanged??ie)(s,t)||o.useDefault&&o.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,o))))return;this.C(e,t,o)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:o,reflect:i,wrapped:s},n){o&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??t??this[e]),s!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||o||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[i,s]of this._$Ep)this[i]=s;this._$Ep=void 0}let o=this.constructor.elementProperties;if(o.size>0)for(let[i,s]of o){let{wrapped:n}=s,c=this[i];n!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,s,c)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(o=>o.hostUpdate?.()),this.update(t)):this._$EM()}catch(o){throw e=!1,this._$EM(),o}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[F("elementProperties")]=new Map,A[F("finalized")]=new Map,kt?.({ReactiveElement:A}),(k.reactiveElementVersions??(k.reactiveElementVersions=[])).push("2.1.2");var W=globalThis,Ne=r=>r,se=W.trustedTypes,Pe=se?se.createPolicy("lit-html",{createHTML:r=>r}):void 0,Fe="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,Ve="?"+C,Ct=`<${Ve}>`,R=document,X=()=>R.createComment(""),K=r=>r===null||typeof r!="object"&&typeof r!="function",Ae=Array.isArray,St=r=>Ae(r)||typeof r?.[Symbol.iterator]=="function",_e=`[ 	
\f\r]`,G=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,je=/-->/g,Ue=/>/g,S=RegExp(`>|${_e}(?:([^\\s"'>=/]+)(${_e}*=${_e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),qe=/'/g,Ie=/"/g,Ge=/^(?:script|style|textarea|title)$/i,ke=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),p=ke(1),nr=ke(2),ar=ke(3),v=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),ze=new WeakMap,T=R.createTreeWalker(R,129);function We(r,e){if(!Ae(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return Pe!==void 0?Pe.createHTML(e):e}var Tt=(r,e)=>{let t=r.length-1,o=[],i,s=e===2?"<svg>":e===3?"<math>":"",n=G;for(let c=0;c<t;c++){let a=r[c],d,h,u=-1,f=0;for(;f<a.length&&(n.lastIndex=f,h=n.exec(a),h!==null);)f=n.lastIndex,n===G?h[1]==="!--"?n=je:h[1]!==void 0?n=Ue:h[2]!==void 0?(Ge.test(h[2])&&(i=RegExp("</"+h[2],"g")),n=S):h[3]!==void 0&&(n=S):n===S?h[0]===">"?(n=i??G,u=-1):h[1]===void 0?u=-2:(u=n.lastIndex-h[2].length,d=h[1],n=h[3]===void 0?S:h[3]==='"'?Ie:qe):n===Ie||n===qe?n=S:n===je||n===Ue?n=G:(n=S,i=void 0);let b=n===S&&r[c+1].startsWith("/>")?" ":"";s+=n===G?a+Ct:u>=0?(o.push(d),a.slice(0,u)+Fe+a.slice(u)+C+b):a+C+(u===-2?c:b)}return[We(r,s+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),o]},Q=class r{constructor({strings:e,_$litType$:t},o){let i;this.parts=[];let s=0,n=0,c=e.length-1,a=this.parts,[d,h]=Tt(e,t);if(this.el=r.createElement(d,o),T.currentNode=this.el.content,t===2||t===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=T.nextNode())!==null&&a.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(let u of i.getAttributeNames())if(u.endsWith(Fe)){let f=h[n++],b=i.getAttribute(u).split(C),g=/([.?@])?(.*)/.exec(f);a.push({type:1,index:s,name:g[2],strings:b,ctor:g[1]==="."?xe:g[1]==="?"?$e:g[1]==="@"?Ee:B}),i.removeAttribute(u)}else u.startsWith(C)&&(a.push({type:6,index:s}),i.removeAttribute(u));if(Ge.test(i.tagName)){let u=i.textContent.split(C),f=u.length-1;if(f>0){i.textContent=se?se.emptyScript:"";for(let b=0;b<f;b++)i.append(u[b],X()),T.nextNode(),a.push({type:2,index:++s});i.append(u[f],X())}}}else if(i.nodeType===8)if(i.data===Ve)a.push({type:2,index:s});else{let u=-1;for(;(u=i.data.indexOf(C,u+1))!==-1;)a.push({type:7,index:s}),u+=C.length-1}s++}}static createElement(e,t){let o=R.createElement("template");return o.innerHTML=e,o}};function D(r,e,t=r,o){if(e===v)return e;let i=o!==void 0?t._$Co?.[o]:t._$Cl,s=K(e)?void 0:e._$litDirective$;return i?.constructor!==s&&(i?._$AO?.(!1),s===void 0?i=void 0:(i=new s(r),i._$AT(r,t,o)),o!==void 0?(t._$Co??(t._$Co=[]))[o]=i:t._$Cl=i),i!==void 0&&(e=D(r,i._$AS(r,e.values),i,o)),e}var ye=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:o}=this._$AD,i=(e?.creationScope??R).importNode(t,!0);T.currentNode=i;let s=T.nextNode(),n=0,c=0,a=o[0];for(;a!==void 0;){if(n===a.index){let d;a.type===2?d=new J(s,s.nextSibling,this,e):a.type===1?d=new a.ctor(s,a.name,a.strings,this,e):a.type===6&&(d=new we(s,this,e)),this._$AV.push(d),a=o[++c]}n!==a?.index&&(s=T.nextNode(),n++)}return T.currentNode=R,i}p(e){let t=0;for(let o of this._$AV)o!==void 0&&(o.strings!==void 0?(o._$AI(e,o,t),t+=o.strings.length-2):o._$AI(e[t])),t++}},J=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,o,i){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=D(this,e,t),K(e)?e===l||e==null||e===""?(this._$AH!==l&&this._$AR(),this._$AH=l):e!==this._$AH&&e!==v&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):St(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==l&&K(this._$AH)?this._$AA.nextSibling.data=e:this.T(R.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:o}=e,i=typeof o=="number"?this._$AC(e):(o.el===void 0&&(o.el=Q.createElement(We(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(t);else{let s=new ye(i,this),n=s.u(this.options);s.p(t),this.T(n),this._$AH=s}}_$AC(e){let t=ze.get(e.strings);return t===void 0&&ze.set(e.strings,t=new Q(e)),t}k(e){Ae(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,o,i=0;for(let s of e)i===t.length?t.push(o=new r(this.O(X()),this.O(X()),this,this.options)):o=t[i],o._$AI(s),i++;i<t.length&&(this._$AR(o&&o._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let o=Ne(e).nextSibling;Ne(e).remove(),e=o}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},B=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,o,i,s){this.type=1,this._$AH=l,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=s,o.length>2||o[0]!==""||o[1]!==""?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=l}_$AI(e,t=this,o,i){let s=this.strings,n=!1;if(s===void 0)e=D(this,e,t,0),n=!K(e)||e!==this._$AH&&e!==v,n&&(this._$AH=e);else{let c=e,a,d;for(e=s[0],a=0;a<s.length-1;a++)d=D(this,c[o+a],t,a),d===v&&(d=this._$AH[a]),n||(n=!K(d)||d!==this._$AH[a]),d===l?e=l:e!==l&&(e+=(d??"")+s[a+1]),this._$AH[a]=d}n&&!i&&this.j(e)}j(e){e===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},xe=class extends B{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===l?void 0:e}},$e=class extends B{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==l)}},Ee=class extends B{constructor(e,t,o,i,s){super(e,t,o,i,s),this.type=5}_$AI(e,t=this){if((e=D(this,e,t,0)??l)===v)return;let o=this._$AH,i=e===l&&o!==l||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,s=e!==l&&(o===l||i);i&&this.element.removeEventListener(this.name,this,o),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},we=class{constructor(e,t,o){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(e){D(this,e)}};var Rt=W.litHtmlPolyfillSupport;Rt?.(Q,J),(W.litHtmlVersions??(W.litHtmlVersions=[])).push("3.3.2");var Xe=(r,e,t)=>{let o=t?.renderBefore??e,i=o._$litPart$;if(i===void 0){let s=t?.renderBefore??null;o._$litPart$=i=new J(e.insertBefore(X(),s),s,void 0,t??{})}return i._$AI(r),i};var Z=globalThis,x=class extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;let e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Xe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}};x._$litElement$=!0,x.finalized=!0,Z.litElementHydrateSupport?.({LitElement:x});var Lt=Z.litElementPolyfillSupport;Lt?.({LitElement:x});(Z.litElementVersions??(Z.litElementVersions=[])).push("4.2.2");var Mt={attribute:!0,type:String,converter:V,reflect:!1,hasChanged:ie},Ot=(r=Mt,e,t)=>{let{kind:o,metadata:i}=t,s=globalThis.litPropertyMetadata.get(i);if(s===void 0&&globalThis.litPropertyMetadata.set(i,s=new Map),o==="setter"&&((r=Object.create(r)).wrapped=!0),s.set(t.name,r),o==="accessor"){let{name:n}=t;return{set(c){let a=e.get.call(this);e.set.call(this,c),this.requestUpdate(n,a,r,!0,c)},init(c){return c!==void 0&&this.C(n,void 0,r,c),c}}}if(o==="setter"){let{name:n}=t;return function(c){let a=this[n];e.call(this,c),this.requestUpdate(n,a,r,!0,c)}}throw Error("Unsupported decorator location: "+o)};function N(r){return(e,t)=>typeof t=="object"?Ot(r,e,t):((o,i,s)=>{let n=i.hasOwnProperty(s);return i.constructor.createProperty(s,o),n?Object.getOwnPropertyDescriptor(i,s):void 0})(r,e,t)}function L(r){return N({...r,state:!0,attribute:!1})}var M=["overdue","today","urgent","soon","ok","not_extendable","unknown"],Ke={all:"list",grid:"covers",due:"covers"},Ce=["list","covers","carousel"];function O(r){return typeof r!="number"||!Number.isFinite(r)?{type:"unknown",text:"? Date inconnue",color:"#37474f",bg:"#cfd8dc"}:r<0?{type:"overdue",text:`\u2717 ${Math.abs(r)}j de retard`,color:"#b71c1c",bg:"#ffcdd2"}:r===0?{type:"today",text:"\u26A0 Aujourd'hui",color:"#d84315",bg:"#ffe0b2"}:r<=3?{type:"urgent",text:`\u26A0 ${r}j restants`,color:"#d84315",bg:"#ffe0b2"}:r<=7?{type:"soon",text:`\u26A1 ${r}j restants`,color:"#f57f17",bg:"#fff9c4"}:{type:"ok",text:`\u2713 ${r}j restants`,color:"#2e7d32",bg:"#c8e6c9"}}var ae="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2252%22 height=%2276%22 viewBox=%220 0 52 76%22%3E%3Crect width=%2252%22 height=%2276%22 fill=%22%23e0e0e0%22 rx=%224%22/%3E%3Ctext x=%2226%22 y=%2242%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%239e9e9e%22%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E",Se=r=>{r.target.src=ae};function Y(r,e){return p`<img
    class=${e}
    src=${r||ae}
    alt=""
    loading="lazy"
    @error=${Se}
  />`}var Ht=.68,Qe=76,Te=56,Re=120;function Dt(r){return Math.round(r*Ht)}var Bt={overdue:{bg:"#d32f2f",fg:"#ffffff"},today:{bg:"#e65100",fg:"#ffffff"},urgent:{bg:"#e65100",fg:"#ffffff"},soon:{bg:"#f9a825",fg:"#1c1c1c"},ok:{bg:"#2e7d32",fg:"#ffffff"},not_extendable:{bg:"#6a1b9a",fg:"#ffffff"},unknown:{bg:"#3a3a3a",fg:"#e0e0e0"}};function Nt(r){let e=O(r.days_left).type;return e==="ok"&&(r.extended||r.extend_disabled)?"not_extendable":e}function Pt(r,e){let t=r.days_left;return e==="unknown"||typeof t!="number"||!Number.isFinite(t)?"?":e==="overdue"?"Retard":e==="today"?"Auj.":`${t} j`}function jt(r,e){let t=Nt(r);return e&&t==="ok"?null:{text:Pt(r,t),...Bt[t]}}function Ut(r){let e=t=>typeof t.days_left=="number"&&Number.isFinite(t.days_left)?t.days_left:Number.MAX_SAFE_INTEGER;return[...r].sort((t,o)=>e(t)-e(o)||(t.emprunteur??"").localeCompare(o.emprunteur??"")||(t.titre??"").localeCompare(o.titre??""))}function qt(r){let e="Afficher la carte de biblioth\xE8que";return r<=0?e:`${e} \u2014 ${r} livre${r>1?"s":""}`}function It(r,e,t,o){let i=jt(r,t),s=[r.titre,r.emprunteur,r.due_date_display].filter(n=>typeof n=="string"&&n.length>0).join(" \u2014 ");return p`
    <button
      class="mc-car-tile ${r.read?"is-read":""}"
      style="width:${Dt(e)}px;height:${e}px"
      aria-label=${s}
      @click=${()=>o(r)}
    >
      ${Y(r.cover_url,"mc-car-cover")}
      ${i?p`<span
            class="mc-car-badge"
            style="background:${i.bg};color:${i.fg}"
            aria-hidden="true"
            >${i.text}</span
          >`:l}
    </button>
  `}function Je({loans:r,cardId:e,coverHeight:t,hideOkBadges:o,onDetail:i,onBarcode:s}){let n=Ut(r);return p`
    <div class="mc-car-row" style="padding:12px;gap:12px">
      ${n.length===0?p`<div class="mc-car-empty">Aucun livre à afficher</div>`:p`<div class="mc-car-strip" style="height:${t}px">
            ${n.map(c=>It(c,t,o,i))}
          </div>`}
      ${e?p`<button
            class="mc-car-barcode"
            style="height:${t}px"
            aria-label=${qt(n.length)}
            @click=${s}
          >
            <ha-icon icon="mdi:barcode"></ha-icon>
            ${n.length>0?p`<span class="mc-car-count" aria-hidden="true">${n.length}</span>`:l}
          </button>`:l}
    </div>
  `}function Ze(r){return r==="carousel"?{columns:"full",rows:"auto",min_rows:2}:{columns:12,min_columns:r==="covers"?4:6,rows:"auto",min_rows:2}}function Ye(r){return r==="covers"||r==="carousel"?2:4}var zt="4.2.0";function et(){console.info(`%c MEDIATHEQUE-CARD %c ${zt} IS INSTALLED `,"color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; background: #c8e6c9; font-weight: bold;")}function m(r,e,t,...o){let i=`%c MEDIATHEQUE-CARD %c [${e}]`,s=["color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; font-weight: bold;"];console[r](i+" "+t,...s,...o)}var tt=10,Ft=2e3,Vt=15e3,de=class{constructor(e,t){this.cardName=e;this.fire=t;this.timer=null;this.count=0}schedule(){if(this.timer||(this.count++,this.count>tt))return;let e=Math.min(Ft*this.count,Vt);m("info",this.cardName,"Retry %d dans %dms\u2026",this.count,e),this.timer=setTimeout(()=>{this.timer=null,this.fire()},e)}get exhausted(){return this.count>tt}reset(){this.count=0,this.cancel()}cancel(){this.timer&&(clearTimeout(this.timer),this.timer=null)}};function ce(r){return r.read?"Marquer non lu":"Marquer comme lu"}function le(r){return!!r.read_key}function rt(r){return e=>{e.stopPropagation(),r()}}function Gt(r,e){return p`<span
    class="book-tile-read ${r.read?"is-read":""}"
    role="button"
    tabindex="0"
    aria-pressed=${r.read?"true":"false"}
    title=${ce(r)}
    @click=${rt(e)}
    >${r.read?"\u2713":"+"}</span
  >`}function ot({loan:r,onClick:e,onToggleRead:t}){let o=O(r.days_left),i=r.days_left,s=i==null?"?":i<0?`${Math.abs(i)}j`:i===0?"!":`${i}j`;return p`
    <button
      class="book-tile ${r.read?"is-read":""}"
      title="${r.titre}${r.emprunteur?` \u2014 ${r.emprunteur}`:""}"
      @click=${e}
    >
      ${Y(r.cover_url,"book-tile-cover")}
      <span
        class="book-tile-badge"
        style="color:${o.color};background:${o.bg}"
        aria-label=${o.text}
        >${s}</span
      >
      ${r.extend_disabled||r.extended?p`<span
            class="book-tile-corner"
            style=${r.extend_disabled?"background:#b71c1c":"background:#6a1b9a"}
            title=${r.extend_disabled?"D\xE9sactiv\xE9":"Non prolongeable"}
            >✗</span
          >`:l}
      ${le(r)?Gt(r,t):l}
    </button>
  `}function it({loan:r,onClick:e,onToggleRead:t}){let o=O(r.days_left);return p`
    <div class="book-row">
      <div class="book-cover-wrapper" @click=${e}>
        ${Y(r.cover_url,"book-cover")}
      </div>
      <div class="book-info">
        <div class="book-title" title=${r.titre}>${r.titre}</div>
        <div class="book-date">Retour : ${r.due_date_display}</div>
        <div class="book-badges">
          <span class="badge-days" style="color:${o.color};background:${o.bg}">
            ${o.text}
          </span>
          ${r.extend_disabled?p`<span class="badge-days" style="color:#b71c1c;background:#ffcdd2"
                >✗ Désactivé</span
              >`:r.extended?p`<span class="badge-days" style="color:#6a1b9a;background:#e1bee7"
                  >✗ Non prolongeable</span
                >`:l}
          ${r.read?p`<span class="badge-days badge-read" style="color:#1b5e20;background:#c8e6c9"
                >✓ Lu</span
              >`:l}
        </div>
      </div>
      ${le(r)?p`<button
            class="book-row-read ${r.read?"is-read":""}"
            aria-pressed=${r.read?"true":"false"}
            title=${ce(r)}
            @click=${rt(t)}
          >
            ${r.read?"\u2713":"+"}
          </button>`:l}
    </div>
  `}var pe={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},j=r=>(...e)=>({_$litDirective$:r,values:e}),P=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,o){this._$Ct=e,this._$AM=t,this._$Ci=o}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var st=j(class extends P{constructor(r){if(super(r),r.type!==pe.ATTRIBUTE||r.name!=="class"||r.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(r){return" "+Object.keys(r).filter(e=>r[e]).join(" ")+" "}update(r,[e]){if(this.st===void 0){this.st=new Set,r.strings!==void 0&&(this.nt=new Set(r.strings.join(" ").split(/\s/).filter(o=>o!=="")));for(let o in e)e[o]&&!this.nt?.has(o)&&this.st.add(o);return this.render(e)}let t=r.element.classList;for(let o of this.st)o in e||(t.remove(o),this.st.delete(o));for(let o in e){let i=!!e[o];i===this.st.has(o)||this.nt?.has(o)||(i?(t.add(o),this.st.add(o)):(t.remove(o),this.st.delete(o)))}return v}});function _({title:r,message:e="Chargement\u2026"}){return p`
    <ha-card>
      <div class="mediatheque-header">
        <span class="mediatheque-title">${r}</span>
      </div>
      <div style="padding:32px 16px;text-align:center">
        <div class="mediatheque-loader"></div>
        <div style="margin-top:12px;color:var(--secondary-text-color);font-size:0.9em">
          ${e}
        </div>
      </div>
    </ha-card>
  `}var Wt=720*60*1e3;function ue(r){if(r.fetch_ok!==!1)return l;let e=r.last_success?new Date(r.last_success):null,t=e?.getTime();if(t!==void 0&&!Number.isNaN(t)&&Date.now()-t<Wt)return l;let o=t===void 0||Number.isNaN(t)?"date inconnue":e.toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});return p`
    <div class="mc-stale" role="status">
      <span>⚠</span>
      <span>Synchronisation en échec — liste des emprunts du ${o}</span>
    </div>
  `}function Le({title:r,badgeText:e,highlight:t,cardId:o,onBarcodeClick:i}){return p`
    <div class="mediatheque-header">
      <span class="mediatheque-title">${r}</span>
      <span class="header-right">
        <span class=${st({"mediatheque-total":!0,highlight:t})}>${e}</span>
        ${o?p`<button class="mc-barcode-btn" title="Ma carte" @click=${i}>
              |||
            </button>`:l}
      </span>
    </div>
  `}var H=class extends P{constructor(e){if(super(e),this.it=l,e.type!==pe.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===l||e==null)return this._t=void 0,this.it=e;if(e===v)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;let t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};H.directiveName="unsafeHTML",H.resultType=1;var $o=j(H);var ee=class extends H{};ee.directiveName="unsafeSVG",ee.resultType=2;var nt=j(ee);var at={0:"000110100",1:"100100001",2:"001100001",3:"101100000",4:"000110001",5:"100110000",6:"001110000",7:"000100101",8:"100100100",9:"001100100",A:"100001001",B:"001001001",C:"101001000",D:"000011001",E:"100011000",F:"001011000",G:"000001101",H:"100001100",I:"001001100",J:"000011100",K:"100000011",L:"001000011",M:"101000010",N:"000010011",O:"100010010",P:"001010010",Q:"000000111",R:"100000110",S:"001000110",T:"000010110",U:"110000001",V:"011000001",W:"111000000",X:"010010001",Y:"110010000",Z:"011010000","-":"010000101",".":"110000100"," ":"011000100",$:"010101000","/":"010100010","+":"010001010","%":"000101010","*":"010010100"},he=2,Xt=he*3,dt=he*10;function ct(r,e=80){if(!r)return"";let t=r.toUpperCase(),o=["*"];for(let d of t)d!=="*"&&at[d]&&o.push(d);if(o.push("*"),o.length<=2)return"";let i=[];for(let d=0;d<o.length;d++){let h=at[o[d]];if(h){for(let u=0;u<9;u++)i.push({width:h[u]==="1"?Xt:he,isBar:u%2===0});d<o.length-1&&i.push({width:he,isBar:!1})}}let n=i.reduce((d,h)=>d+h.width,0)+dt*2,c=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${e}" width="${n}" height="${e}"><rect x="0" y="0" width="${n}" height="${e}" fill="#fff"/>`,a=dt;for(let d of i)d.isBar&&(c+=`<rect x="${a}" y="0" width="${d.width}" height="${e}" fill="#000"/>`),a+=d.width;return c+="</svg>",c}function lt({loan:r,onOverlayClick:e,onClose:t,onExtend:o,onToggleRead:i}){let s=r.cover_url||ae;return p`
    <div class="mc-modal-overlay active" @click=${e}>
      <div class="mc-modal">
        <div class="mc-modal-body mc-modal-body-top">
          <div class="mc-modal-title">${r.titre}</div>
        </div>
        <img class="mc-modal-cover" src=${s} alt="" @error=${Se} />
        <div class="mc-modal-body">
          ${r.isbn?p`<div class="mc-modal-isbn">ISBN : ${r.isbn}</div>`:l}
          ${r.read?p`<div class="mc-modal-read">✓ Lu</div>`:l}
          <div class="mc-modal-actions">
            <button class="mc-modal-btn mc-modal-btn-close" @click=${t}>Fermer</button>
            ${le(r)?p`<button
                  class="mc-modal-btn mc-modal-btn-read ${r.read?"is-read":""}"
                  aria-pressed=${r.read?"true":"false"}
                  @click=${i}
                >
                  ${ce(r)}
                </button>`:l}
            ${r.can_extend?p`<button class="mc-modal-btn mc-modal-btn-extend" @click=${o}>
                  Prolonger
                </button>`:l}
          </div>
        </div>
      </div>
    </div>
  `}function pt({loan:r,onOverlayClick:e,onCancel:t,onConfirm:o}){return p`
    <div class="mc-confirm-overlay active" @click=${e}>
      <div class="mc-confirm-dialog">
        <div class="mc-confirm-icon">↻</div>
        <div class="mc-confirm-title">Prolonger cet emprunt ?</div>
        <div class="mc-confirm-text">${r.titre}</div>
        <div class="mc-confirm-actions">
          <button class="mc-modal-btn-cancel" @click=${t}>Annuler</button>
          <button class="mc-modal-btn-confirm" @click=${o}>Confirmer</button>
        </div>
      </div>
    </div>
  `}function ut({cardId:r,onOverlayClick:e,onClose:t}){let o=ct(r);return p`
    <div class="mc-barcode-overlay active" @click=${e}>
      <div class="mc-barcode-dialog">
        <h3>Ma carte</h3>
        <div class="mc-barcode-id">${r}</div>
        <div class="mc-barcode-svg">${nt(o)}</div>
        <button class="mc-barcode-close" @click=${t}>Fermer</button>
      </div>
    </div>
  `}var ht=z`
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
  /* --- Mode carousel ------------------------------------------------- */
  .mc-car-row {
    display: flex;
    align-items: center;
  }
  .mc-car-strip {
    flex: 1 1 auto;
    /* Sans min-width:0, un enfant flex refuse de rétrécir sous sa taille de
       contenu : la bande pousserait la tuile code-barres hors de la carte au
       lieu de défiler. */
    min-width: 0;
    display: flex;
    gap: 10px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .mc-car-strip::-webkit-scrollbar {
    display: none;
  }
  .mc-car-tile {
    flex: 0 0 auto;
    padding: 0;
    border: 0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    scroll-snap-align: start;
    /* Visible tant que la couverture n'est pas chargée, et sous une image qui
       ne couvre pas tout à fait. Pas d'ombre portée ici : overflow-x:auto
       force overflow-y à auto, et tout dépassement créerait une barre de
       défilement verticale parasite dans une bande de 76 px. */
    background: #2b3a4f;
  }
  .mc-car-tile.is-read {
    /* Le liseré est intérieur : l'image se retire de 2 px et le fond vert
       forme le cadre. Une bordure extérieure décalerait les tuiles voisines,
       et un outline déborderait dans la zone de défilement. */
    padding: 2px;
    background: var(--success-color, #4caf50);
  }
  .mc-car-tile.is-read .mc-car-cover {
    border-radius: 2px;
  }
  .mc-car-cover {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mc-car-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    padding: 1px 5px;
    border-radius: 999px;
    font-size: 10px;
    line-height: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .mc-car-barcode {
    flex: 0 0 auto;
    /* Ancre la bulle du compteur, qui déborde volontairement du bouton. Le
       débordement tient dans le padding de 12 px de la rangée : rien ne le
       rogne. */
    position: relative;
    width: 44px;
    padding: 0;
    border: 0;
    border-radius: 10px;
    background: var(--secondary-background-color, #2e2e2e);
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .mc-car-barcode ha-icon {
    --mdc-icon-size: 24px;
  }
  .mc-car-count {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    box-sizing: border-box;
    border-radius: 999px;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    font-size: 11px;
    line-height: 18px;
    font-weight: 700;
    text-align: center;
    /* Détache la bulle du bouton quand les deux fonds sont proches — un thème
       clair peut donner un secondary-background presque aussi vif que
       l'accent. */
    box-shadow: 0 0 0 2px var(--ha-card-background, var(--card-background-color, #1c1c1c));
  }
  .mc-car-empty {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 13px;
    color: var(--secondary-text-color);
  }
  .mc-car-tile:focus-visible,
  .mc-car-barcode:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
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
`;var mt=z`
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
`;var Kt={overdue:"En retard",today:"\xC0 rendre aujourd'hui",urgent:"1 \xE0 3 jours restants",soon:"4 \xE0 7 jours restants",ok:"Plus de 7 jours",not_extendable:"Non prolongeable",unknown:"Date illisible"},Qt={entity:"Entit\xE9 (sensor)",title:"Titre personnalis\xE9",mode:"Mode",badges:"Filtres par badge",total_entity:'Entit\xE9 du total (mode "couvertures")',card_id:"Identifiant carte",cover_height:'Hauteur des couvertures (mode "carousel", 56\u2013120 px)',hide_ok_badges:'Masquer les badges au-del\xE0 de 7 jours (mode "carousel")'},Jt=[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"title",selector:{text:{}}},{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"list",label:"Liste (group\xE9e par membre)"},{value:"covers",label:"Couvertures (grille \xE0 rendre)"},{value:"carousel",label:"Carousel (bande basse, sans en-t\xEAte)"}]}}},{name:"badges",selector:{select:{multiple:!0,options:M.map(r=>({value:r,label:Kt[r]??r}))}}},{name:"total_entity",selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"card_id",selector:{text:{}}},{name:"cover_height",selector:{number:{min:56,max:120,step:1,mode:"slider"}}},{name:"hide_ok_badges",selector:{boolean:{}}}],te=class extends x{constructor(){super(...arguments);this._config={entity:""};this._computeLabel=t=>{let o=Qt[t.name]??t.name;return t.name==="title"&&this._config?.mode==="carousel"?`${o} (sans effet en mode carousel)`:o}}setConfig(t){this._config=t??{entity:""}}createRenderRoot(){return this}render(){return this.hass?p`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Jt}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:p``}_valueChanged(t){let o={...t.detail.value};for(let i of Object.keys(o)){if(i==="entity"){typeof o[i]!="string"&&(o[i]="");continue}let s=o[i];(s===""||s===void 0||s===null)&&delete o[i],Array.isArray(s)&&s.length===0&&delete o[i]}this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:o},bubbles:!0,composed:!0}))}};w([N({attribute:!1})],te.prototype,"hass",2),w([L()],te.prototype,"_config",2);customElements.get("mediatheque-card-editor")||customElements.define("mediatheque-card-editor",te);var $=class $ extends x{constructor(){super(...arguments);this._detailLoan=null;this._confirmExtend=null;this._barcodeOpen=!1;this._id=++$._instances;this._retry=new de("card",()=>this.requestUpdate());this._hasRendered=!1;this._firstUpdateLogged=!1;this._openDetail=t=>{this._detailLoan=t};this._closeDetail=()=>{this._detailLoan=null};this._toggleRead=t=>{let o=t.read_key;if(!o||!this._hass)return;let i=!t.read;this._detailLoan&&this._detailLoan.read_key===o&&(this._detailLoan={...this._detailLoan,read:i}),this._hass.callService("mediatheque_veauche","set_read",{read_key:o,read:i}).catch(s=>{console.error("[mediatheque-card] set_read a \xE9chou\xE9",s)})};this._askExtend=t=>{t.extend_url&&(this._confirmExtend={loan:t})};this._closeConfirm=()=>{this._confirmExtend=null};this._confirmExtendNow=()=>{let t=this._confirmExtend?.loan.extend_url;t&&this._hass&&this._hass.callService("mediatheque_veauche","extend_loan",{extend_url:t}).catch(o=>{m("warn","card","la prolongation a \xE9chou\xE9 : %o",o)}),this._confirmExtend=null,this._detailLoan=null};this._openBarcode=()=>{this._barcodeOpen=!0};this._closeBarcode=()=>{this._barcodeOpen=!1};this._onOverlayClick=t=>{t.target===t.currentTarget&&this._closeDetail()};this._onConfirmOverlayClick=t=>{t.target===t.currentTarget&&this._closeConfirm()};this._onBarcodeOverlayClick=t=>{t.target===t.currentTarget&&this._closeBarcode()}}set hass(t){this._hass=t,this._syncEntityStates()}get hass(){return this._hass}setConfig(t){if(!t||typeof t!="object")throw m("error","card","setConfig rejet\xE9, config non-objet : %o",t),new Error("Configuration manquante ou invalide");let o="";typeof t.entity=="string"?o=t.entity:t.entity!==void 0&&t.entity!==null&&m("error","card","'entity' doit \xEAtre une cha\xEEne, re\xE7u %o \u2014 carte en attente de configuration",t.entity);let i;if(t.mode!==void 0){let d=Ke[t.mode]??t.mode;Ce.includes(d)?i=d:m("warn","card","Mode '%s' inconnu, fallback sur 'list'. Modes valides : %s",t.mode,Ce.join(", "))}let s;if(t.badges!==void 0)if(!Array.isArray(t.badges))m("warn","card","'badges' doit \xEAtre une liste, ignor\xE9 (re\xE7u : %o)",t.badges);else{let d=t.badges.filter(u=>M.includes(u)),h=t.badges.filter(u=>!M.includes(u));h.length&&m("warn","card","Badges inconnus ignor\xE9s : %s. Valides : %s",h.join(", "),M.join(", ")),d.length===0?m("warn","card","Filtre de badges vide, filtre ignor\xE9"):s=d}let n;if(t.cover_height!==void 0){let d=t.cover_height;typeof d!="number"||!Number.isInteger(d)||d<Te||d>Re?m("warn","card","'cover_height' doit \xEAtre un entier entre %d et %d, ignor\xE9 (re\xE7u : %o)",Te,Re,d):n=d}let c;t.hide_ok_badges!==void 0&&(typeof t.hide_ok_badges!="boolean"?m("warn","card","'hide_ok_badges' doit \xEAtre un bool\xE9en, ignor\xE9 (re\xE7u : %o)",t.hide_ok_badges):c=t.hide_ok_badges),m("info","card","#%d setConfig accept\xE9 (entity=%s, mode=%s) \xE0 t=%dms",this._id,o||"(vide)",i??"list",Math.round(performance.now()));let a=this._config;this._config={...t,entity:o,mode:i,badges:s,cover_height:n,hide_ok_badges:c},(a?.entity!==this._config.entity||a?.total_entity!==this._config.total_entity)&&(this._hasRendered=!1,this._lastTemplate=void 0,this._renderedEntityState=void 0,this._renderedTotalState=void 0,this._retry.reset()),this._syncEntityStates()}_syncEntityStates(){let t=this._hass?.states;if(!t||!this._config?.entity){this._entityState=void 0,this._totalEntityState=void 0;return}this._entityState=t[this._config.entity],this._totalEntityState=this._config.total_entity?t[this._config.total_entity]:void 0}static getStubConfig(t,o,i){let s=t?.states??{},n=[...o??[],...i??[],...Object.keys(s)].filter(a=>a.startsWith("sensor."));return{entity:n.find(a=>s[a]?.attributes?.membres)??n.find(a=>a.includes("mediatheque"))??"",mode:"list"}}static getConfigElement(){return document.createElement("mediatheque-card-editor")}getCardSize(){return Ye(this._config?.mode)}getGridOptions(){return Ze(this._config?.mode)}connectedCallback(){super.connectedCallback(),this._retry.reset(),customElements.get("ha-card")||customElements.whenDefined("ha-card").then(()=>{m("info","card","ha-card d\xE9fini apr\xE8s le premier rendu, re-render"),this.requestUpdate()})}disconnectedCallback(){super.disconnectedCallback(),this._retry.cancel()}updated(){this._firstUpdateLogged||(this._firstUpdateLogged=!0,m("info","card","#%d premier rendu effectu\xE9 \xE0 t=%dms (donn\xE9es=%s)",this._id,Math.round(performance.now()),this._hasRendered?"oui":"non, loader")),this._renderedEntityState=this._entityState,this._renderedTotalState=this._totalEntityState,this._hasRendered&&this.dispatchEvent(new CustomEvent("mediatheque-card-update",{bubbles:!0,composed:!0}))}shouldUpdate(t){return t.has("_detailLoan")||t.has("_confirmExtend")||t.has("_barcodeOpen")||t.has("_config")||!this._hasRendered?!0:this._detailLoan||this._confirmExtend||this._barcodeOpen?!1:t.has("hass")?this._entityState!==this._renderedEntityState||this._totalEntityState!==this._renderedTotalState:!0}render(){try{return this._render()}catch(t){return m("error","card","render() a throw, fallback loader : %o",t),this._retry.schedule(),_({title:"M\xE9diath\xE8que",message:"Erreur \u2014 voir console"})}}_render(){let t=this._config?.mode??"list",o=this._config?.title??(t==="covers"?"A rendre bient\xF4t":"M\xE9diath\xE8que de Veauche");if(!this._config)return _({title:o,message:"En attente de configuration\u2026"});if(!this._hass)return _({title:o,message:"Connexion \xE0 Home Assistant\u2026"});let i=this._config.entity;if(!i)return _({title:o,message:"S\xE9lectionnez une entit\xE9"});let s=this._hass.states;if(!s)return m("warn","card","hass.states absent, rendu du loader"),this._retry.schedule(),this._retry.exhausted?_({title:o,message:"Donn\xE9es Home Assistant indisponibles"}):this._lastTemplate??_({title:o,message:"En attente de Home Assistant\u2026"});let n=s[i];if(!n||n.state==="unavailable"||n.state==="unknown"){let u=n?`state=${n.state}`:"entity not found";return m("warn","card","%s \u2014 %s %s",i,u,this._hasRendered?"(keeping last render)":"(showing loader)"),this._retry.schedule(),this._hasRendered&&!this._retry.exhausted?this._lastTemplate??_({title:o}):this._hasRendered?_({title:o,message:`${i} indisponible`}):(this._lastTemplate=_({title:o,message:this._retry.exhausted?`Donn\xE9es indisponibles pour ${i}`:"En attente des donn\xE9es\u2026"}),this._lastTemplate)}let c=n.attributes??{};if(!("membres"in c)&&!("livres"in c))return m("error","card","%s ne porte ni \xAB membres \xBB ni \xAB livres \xBB : ce n'est pas un capteur de cette int\xE9gration",i),_({title:o,message:`${i} n'est pas un capteur M\xE9diath\xE8que`});this._retry.reset();let a=this._config.badges??[...M],d=!!this._config.badges,h=t==="carousel"?this._renderCarousel(n,a,d):t==="covers"?this._renderCovers(n,a,d,o):this._renderList(n,a,d,o);return this._lastTemplate=h,this._hasRendered=!0,h}_matchesBadgeFilter(t,o){return o.includes("not_extendable")&&(t.extended||t.extend_disabled)?!0:o.includes(O(t.days_left).type)}_renderCarousel(t,o,i){let s=t.attributes??{},n=s.livres??Object.values(s.membres??{}).flat(),c=i?n.filter(h=>this._matchesBadgeFilter(h,o)):n,a=this._totalEntityState,d=s.card_id||a?.attributes?.card_id||this._config?.card_id||"";return p`
      <ha-card>
        ${ue(s)}
        ${Je({loans:c,cardId:d,coverHeight:this._config?.cover_height??Qe,hideOkBadges:this._config?.hide_ok_badges??!1,onDetail:this._openDetail,onBarcode:this._openBarcode})}
        ${this._renderModals(d)}
      </ha-card>
    `}_renderCovers(t,o,i,s){let n=t.attributes??{},c=n.livres??Object.values(n.membres??{}).flat(),a=i?c.filter(g=>this._matchesBadgeFilter(g,o)):c,d=this._totalEntityState,h=n.card_id||d?.attributes?.card_id||this._config?.card_id||"",u=`${a.length}`,f=a.length>0,b=[...a].sort((g,y)=>(g.days_left??Number.MAX_SAFE_INTEGER)-(y.days_left??Number.MAX_SAFE_INTEGER));return p`
      <ha-card>
        ${Le({title:s,badgeText:u,highlight:f,cardId:h,onBarcodeClick:this._openBarcode})}
        ${ue(n)}
        ${b.length===0?p`<div class="empty-state">Aucun livre à rendre</div>`:p`<div class="book-grid">
              ${b.map(g=>ot({loan:g,onClick:()=>this._openDetail(g),onToggleRead:()=>this._toggleRead(g)}))}
            </div>`}
        ${this._renderModals(h)}
      </ha-card>
    `}_renderList(t,o,i,s){let n=t.attributes??{},c=n.membres??{},a=n.compte??"",d=n.card_id??this._config?.card_id??"",h={},u=0;for(let[y,E]of Object.entries(c)){let U=i?E.filter(ge=>this._matchesBadgeFilter(ge,o)):E;U.length>0&&(h[y]=U,u+=U.length)}let f=Object.keys(h).sort((y,E)=>y===a?-1:E===a?1:y.localeCompare(E)),b=`${u} emprunt${u>1?"s":""}`,g=i&&u>0;return p`
      <ha-card>
        ${Le({title:s,badgeText:b,highlight:g,cardId:d,onBarcodeClick:this._openBarcode})}
        ${ue(n)}
        ${f.length===0?p`<div class="empty-state">Aucun emprunt en cours</div>`:f.map(y=>{let E=h[y];if(!E)return l;let U=y===a?"\u{1F464}":"\u{1F466}",ge=[...E].sort((q,gt)=>(q.days_left??Number.MAX_SAFE_INTEGER)-(gt.days_left??Number.MAX_SAFE_INTEGER));return p`
                <div class="member-section">
                  <div class="member-header">
                    <span class="member-icon">${U}</span>
                    <span class="member-name">${y}</span>
                    <span class="member-count">${E.length}</span>
                  </div>
                  ${ge.map(q=>it({loan:q,onClick:()=>this._openDetail(q),onToggleRead:()=>this._toggleRead(q)}))}
                </div>
              `})}
        ${this._renderModals(d)}
      </ha-card>
    `}_renderModals(t){return p`
      ${this._detailLoan?lt({loan:this._detailLoan,onOverlayClick:this._onOverlayClick,onClose:this._closeDetail,onExtend:()=>this._askExtend(this._detailLoan),onToggleRead:()=>this._toggleRead(this._detailLoan)}):l}
      ${this._confirmExtend?pt({loan:this._confirmExtend.loan,onOverlayClick:this._onConfirmOverlayClick,onCancel:this._closeConfirm,onConfirm:this._confirmExtendNow}):l}
      ${this._barcodeOpen&&t?ut({cardId:t,onOverlayClick:this._onBarcodeOverlayClick,onClose:this._closeBarcode}):l}
    `}};$.styles=[ht,mt],$._instances=0,w([N({attribute:!1})],$.prototype,"hass",1),w([L()],$.prototype,"_config",2),w([L()],$.prototype,"_detailLoan",2),w([L()],$.prototype,"_confirmExtend",2),w([L()],$.prototype,"_barcodeOpen",2);var me=$;et();window.loadCardHelpers?.().catch(r=>{m("warn","card","loadCardHelpers() a \xE9chou\xE9 : %o",r)});var fe="mediatheque-card",Zt=5,ft=0;function Yt(){if(customElements.get(fe)||ft>=Zt)return!1;ft++;try{return customElements.define(fe,class extends me{}),m("warn","card","r\xE9-enregistr\xE9 \xE0 t=%dms : le registre d'\xE9l\xE9ments personnalis\xE9s avait \xE9t\xE9 remplac\xE9 depuis le premier enregistrement",Math.round(performance.now())),!0}catch(r){return m("error","card","r\xE9-enregistrement impossible : %o",r),!1}}customElements.get(fe)?m("info","card","module d\xE9j\xE0 enregistr\xE9, ce chargement est ignor\xE9"):(customElements.define(fe,me),m("info","card","\xE9l\xE9ment enregistr\xE9 \xE0 t=%dms apr\xE8s le d\xE9but du chargement de la page",Math.round(performance.now())));function er(){let r=0,e=t=>{if(t.localName==="hui-error-card"){let o=t;((o._config??o.config)?.message??"").includes("mediatheque-card")&&(t.dispatchEvent(new CustomEvent("ll-rebuild",{bubbles:!0,composed:!0})),r++);return}for(let o of[...t.shadowRoot?.children??[],...t.children])e(o)};return document.body&&e(document.body),r}for(let r of[0,50,150,400,1e3,2e3,4e3])window.setTimeout(()=>{try{Yt();let e=er();e>0&&m("warn","card","%d carte(s) d'erreur reconstruite(s) apr\xE8s %dms \u2014 la vue a \xE9t\xE9 b\xE2tie avant l'enregistrement de l'\xE9l\xE9ment",e,r)}catch(e){m("error","card","r\xE9paration des cartes d'erreur impossible : %o",e)}},r);window.customCards=window.customCards??[];window.customCards.some(r=>r.type==="mediatheque-card")||window.customCards.push({type:"mediatheque-card",name:"M\xE9diath\xE8que de Veauche",description:"Affiche les emprunts de la m\xE9diath\xE8que de Veauche"});export{me as MediathequeCard};
