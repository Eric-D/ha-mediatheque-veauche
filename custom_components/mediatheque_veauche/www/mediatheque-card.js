/* mediatheque-card — built artefact, ne pas éditer directement. Sources : frontend/src/ */
var Ge=Object.defineProperty;var We=Object.getOwnPropertyDescriptor;var x=(o,e,t,r)=>{for(var s=r>1?void 0:r?We(e,t):e,i=o.length-1,n;i>=0;i--)(n=o[i])&&(s=(r?n(e,t,s):n(s))||s);return r&&s&&Ge(e,t,s),s};var Y=globalThis,Z=Y.ShadowRoot&&(Y.ShadyCSS===void 0||Y.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ce=Symbol(),ye=new WeakMap,B=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==ce)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(Z&&e===void 0){let r=t!==void 0&&t.length===1;r&&(e=ye.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&ye.set(t,e))}return e}toString(){return this.cssText}},xe=o=>new B(typeof o=="string"?o:o+"",void 0,ce),N=(o,...e)=>{let t=o.length===1?o[0]:e.reduce((r,s,i)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[i+1],o[0]);return new B(t,o,ce)},$e=(o,e)=>{if(Z)o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let r=document.createElement("style"),s=Y.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=t.cssText,o.appendChild(r)}},le=Z?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let r of e.cssRules)t+=r.cssText;return xe(t)})(o):o;var{is:Ke,defineProperty:Qe,getOwnPropertyDescriptor:Je,getOwnPropertyNames:Xe,getOwnPropertySymbols:Ye,getPrototypeOf:Ze}=Object,E=globalThis,Ae=E.trustedTypes,et=Ae?Ae.emptyScript:"",tt=E.reactiveElementPolyfillSupport,j=(o,e)=>o,q={toAttribute(o,e){switch(e){case Boolean:o=o?et:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},ee=(o,e)=>!Ke(o,e),Ee={attribute:!0,type:String,converter:q,reflect:!1,useDefault:!1,hasChanged:ee};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),E.litPropertyMetadata??(E.litPropertyMetadata=new WeakMap);var $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Ee){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let r=Symbol(),s=this.getPropertyDescriptor(e,r,t);s!==void 0&&Qe(this.prototype,e,s)}}static getPropertyDescriptor(e,t,r){let{get:s,set:i}=Je(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){let d=s?.call(this);i?.call(this,n),this.requestUpdate(e,d,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ee}static _$Ei(){if(this.hasOwnProperty(j("elementProperties")))return;let e=Ze(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(j("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(j("properties"))){let t=this.properties,r=[...Xe(t),...Ye(t)];for(let s of r)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[r,s]of t)this.elementProperties.set(r,s)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let s=this._$Eu(t,r);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let s of r)t.unshift(le(s))}else e!==void 0&&t.push(le(e));return t}static _$Eu(e,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return $e(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){let r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){let i=(r.converter?.toAttribute!==void 0?r.converter:q).toAttribute(t,r.type);this._$Em=e,i==null?this.removeAttribute(s):this.setAttribute(s,i),this._$Em=null}}_$AK(e,t){let r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let i=r.getPropertyOptions(s),n=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:q;this._$Em=s;let d=n.fromAttribute(t,i.type);this[s]=d??this._$Ej?.get(s)??d,this._$Em=null}}requestUpdate(e,t,r,s=!1,i){if(e!==void 0){let n=this.constructor;if(s===!1&&(i=this[e]),r??(r=n.getPropertyOptions(e)),!((r.hasChanged??ee)(i,t)||r.useDefault&&r.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:s,wrapped:i},n){r&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??t??this[e]),i!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,i]of this._$Ep)this[s]=i;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[s,i]of r){let{wrapped:n}=i,d=this[s];n!==!0||this._$AL.has(s)||d===void 0||this.C(s,void 0,i,d)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[j("elementProperties")]=new Map,$[j("finalized")]=new Map,tt?.({ReactiveElement:$}),(E.reactiveElementVersions??(E.reactiveElementVersions=[])).push("2.1.2");var I=globalThis,we=o=>o,te=I.trustedTypes,Se=te?te.createPolicy("lit-html",{createHTML:o=>o}):void 0,Re="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,Oe="?"+w,rt=`<${Oe}>`,k=document,V=()=>k.createComment(""),F=o=>o===null||typeof o!="object"&&typeof o!="function",ve=Array.isArray,st=o=>ve(o)||typeof o?.[Symbol.iterator]=="function",he=`[ 	
\f\r]`,z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ce=/-->/g,ke=/>/g,S=RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Te=/'/g,Me=/"/g,Pe=/^(?:script|style|textarea|title)$/i,be=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),u=be(1),yt=be(2),xt=be(3),v=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),Le=new WeakMap,C=k.createTreeWalker(k,129);function He(o,e){if(!ve(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return Se!==void 0?Se.createHTML(e):e}var ot=(o,e)=>{let t=o.length-1,r=[],s,i=e===2?"<svg>":e===3?"<math>":"",n=z;for(let d=0;d<t;d++){let a=o[d],c,p,l=-1,m=0;for(;m<a.length&&(n.lastIndex=m,p=n.exec(a),p!==null);)m=n.lastIndex,n===z?p[1]==="!--"?n=Ce:p[1]!==void 0?n=ke:p[2]!==void 0?(Pe.test(p[2])&&(s=RegExp("</"+p[2],"g")),n=S):p[3]!==void 0&&(n=S):n===S?p[0]===">"?(n=s??z,l=-1):p[1]===void 0?l=-2:(l=n.lastIndex-p[2].length,c=p[1],n=p[3]===void 0?S:p[3]==='"'?Me:Te):n===Me||n===Te?n=S:n===Ce||n===ke?n=z:(n=S,s=void 0);let f=n===S&&o[d+1].startsWith("/>")?" ":"";i+=n===z?a+rt:l>=0?(r.push(c),a.slice(0,l)+Re+a.slice(l)+w+f):a+w+(l===-2?d:f)}return[He(o,i+(o[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},G=class o{constructor({strings:e,_$litType$:t},r){let s;this.parts=[];let i=0,n=0,d=e.length-1,a=this.parts,[c,p]=ot(e,t);if(this.el=o.createElement(c,r),C.currentNode=this.el.content,t===2||t===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(s=C.nextNode())!==null&&a.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(let l of s.getAttributeNames())if(l.endsWith(Re)){let m=p[n++],f=s.getAttribute(l).split(w),g=/([.?@])?(.*)/.exec(m);a.push({type:1,index:i,name:g[2],strings:f,ctor:g[1]==="."?ue:g[1]==="?"?me:g[1]==="@"?fe:R}),s.removeAttribute(l)}else l.startsWith(w)&&(a.push({type:6,index:i}),s.removeAttribute(l));if(Pe.test(s.tagName)){let l=s.textContent.split(w),m=l.length-1;if(m>0){s.textContent=te?te.emptyScript:"";for(let f=0;f<m;f++)s.append(l[f],V()),C.nextNode(),a.push({type:2,index:++i});s.append(l[m],V())}}}else if(s.nodeType===8)if(s.data===Oe)a.push({type:2,index:i});else{let l=-1;for(;(l=s.data.indexOf(w,l+1))!==-1;)a.push({type:7,index:i}),l+=w.length-1}i++}}static createElement(e,t){let r=k.createElement("template");return r.innerHTML=e,r}};function L(o,e,t=o,r){if(e===v)return e;let s=r!==void 0?t._$Co?.[r]:t._$Cl,i=F(e)?void 0:e._$litDirective$;return s?.constructor!==i&&(s?._$AO?.(!1),i===void 0?s=void 0:(s=new i(o),s._$AT(o,t,r)),r!==void 0?(t._$Co??(t._$Co=[]))[r]=s:t._$Cl=s),s!==void 0&&(e=L(o,s._$AS(o,e.values),s,r)),e}var pe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:r}=this._$AD,s=(e?.creationScope??k).importNode(t,!0);C.currentNode=s;let i=C.nextNode(),n=0,d=0,a=r[0];for(;a!==void 0;){if(n===a.index){let c;a.type===2?c=new W(i,i.nextSibling,this,e):a.type===1?c=new a.ctor(i,a.name,a.strings,this,e):a.type===6&&(c=new ge(i,this,e)),this._$AV.push(c),a=r[++d]}n!==a?.index&&(i=C.nextNode(),n++)}return C.currentNode=k,s}p(e){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}},W=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=L(this,e,t),F(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==v&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):st(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&F(this._$AH)?this._$AA.nextSibling.data=e:this.T(k.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=G.createElement(He(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(t);else{let i=new pe(s,this),n=i.u(this.options);i.p(t),this.T(n),this._$AH=i}}_$AC(e){let t=Le.get(e.strings);return t===void 0&&Le.set(e.strings,t=new G(e)),t}k(e){ve(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,s=0;for(let i of e)s===t.length?t.push(r=new o(this.O(V()),this.O(V()),this,this.options)):r=t[s],r._$AI(i),s++;s<t.length&&(this._$AR(r&&r._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let r=we(e).nextSibling;we(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},R=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,s,i){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=h}_$AI(e,t=this,r,s){let i=this.strings,n=!1;if(i===void 0)e=L(this,e,t,0),n=!F(e)||e!==this._$AH&&e!==v,n&&(this._$AH=e);else{let d=e,a,c;for(e=i[0],a=0;a<i.length-1;a++)c=L(this,d[r+a],t,a),c===v&&(c=this._$AH[a]),n||(n=!F(c)||c!==this._$AH[a]),c===h?e=h:e!==h&&(e+=(c??"")+i[a+1]),this._$AH[a]=c}n&&!s&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ue=class extends R{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}},me=class extends R{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}},fe=class extends R{constructor(e,t,r,s,i){super(e,t,r,s,i),this.type=5}_$AI(e,t=this){if((e=L(this,e,t,0)??h)===v)return;let r=this._$AH,s=e===h&&r!==h||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,i=e!==h&&(r===h||s);s&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ge=class{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){L(this,e)}};var it=I.litHtmlPolyfillSupport;it?.(G,W),(I.litHtmlVersions??(I.litHtmlVersions=[])).push("3.3.2");var De=(o,e,t)=>{let r=t?.renderBefore??e,s=r._$litPart$;if(s===void 0){let i=t?.renderBefore??null;r._$litPart$=s=new W(e.insertBefore(V(),i),i,void 0,t??{})}return s._$AI(o),s};var K=globalThis,_=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;let e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=De(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}};_._$litElement$=!0,_.finalized=!0,K.litElementHydrateSupport?.({LitElement:_});var nt=K.litElementPolyfillSupport;nt?.({LitElement:_});(K.litElementVersions??(K.litElementVersions=[])).push("4.2.2");var at={attribute:!0,type:String,converter:q,reflect:!1,hasChanged:ee},dt=(o=at,e,t)=>{let{kind:r,metadata:s}=t,i=globalThis.litPropertyMetadata.get(s);if(i===void 0&&globalThis.litPropertyMetadata.set(s,i=new Map),r==="setter"&&((o=Object.create(o)).wrapped=!0),i.set(t.name,o),r==="accessor"){let{name:n}=t;return{set(d){let a=e.get.call(this);e.set.call(this,d),this.requestUpdate(n,a,o,!0,d)},init(d){return d!==void 0&&this.C(n,void 0,o,d),d}}}if(r==="setter"){let{name:n}=t;return function(d){let a=this[n];e.call(this,d),this.requestUpdate(n,a,o,!0,d)}}throw Error("Unsupported decorator location: "+r)};function O(o){return(e,t)=>typeof t=="object"?dt(o,e,t):((r,s,i)=>{let n=s.hasOwnProperty(i);return s.constructor.createProperty(i,r),n?Object.getOwnPropertyDescriptor(s,i):void 0})(o,e,t)}function T(o){return O({...o,state:!0,attribute:!1})}var se={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},H=o=>(...e)=>({_$litDirective$:o,values:e}),P=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,r){this._$Ct=e,this._$AM=t,this._$Ci=r}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var M=class extends P{constructor(e){if(super(e),this.it=h,e.type!==se.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===h||e==null)return this._t=void 0,this.it=e;if(e===v)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;let t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};M.directiveName="unsafeHTML",M.resultType=1;var lr=H(M);var Q=class extends M{};Q.directiveName="unsafeSVG",Q.resultType=2;var Ue=H(Q);var Be=H(class extends P{constructor(o){if(super(o),o.type!==se.ATTRIBUTE||o.name!=="class"||o.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(o){return" "+Object.keys(o).filter(e=>o[e]).join(" ")+" "}update(o,[e]){if(this.st===void 0){this.st=new Set,o.strings!==void 0&&(this.nt=new Set(o.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(let r in e)e[r]&&!this.nt?.has(r)&&this.st.add(r);return this.render(e)}let t=o.element.classList;for(let r of this.st)r in e||(t.remove(r),this.st.delete(r));for(let r in e){let s=!!e[r];s===this.st.has(r)||this.nt?.has(r)||(s?(t.add(r),this.st.add(r)):(t.remove(r),this.st.delete(r)))}return v}});var D=["overdue","today","urgent","soon","ok","not_extendable"],Ne={all:"list",grid:"covers"},_e=["list","covers"];function oe(o){return o<0?{type:"overdue",text:`\u2717 ${Math.abs(o)}j de retard`,color:"#b71c1c",bg:"#ffcdd2"}:o===0?{type:"today",text:"\u26A0 Aujourd'hui",color:"#d84315",bg:"#ffe0b2"}:o<=3?{type:"urgent",text:`\u26A0 ${o}j restants`,color:"#d84315",bg:"#ffe0b2"}:o<=7?{type:"soon",text:`\u26A1 ${o}j restants`,color:"#f57f17",bg:"#fff9c4"}:{type:"ok",text:`\u2713 ${o}j restants`,color:"#2e7d32",bg:"#c8e6c9"}}var je=["11011001100","11001101100","11001100110","10010011000","10010001100","10001001100","10011001000","10011000100","10001100100","11001001000","11001000100","11000100100","10110011100","10011011100","10011001110","10111001100","10011101100","10011100110","11001110010","11001011100","11001001110","11011100100","11001110100","11100101100","11100100110","10110001100","10001101100","10001100110","11010001100","11000101100","11000100110","10110001000","10001101000","10001100010","11010001000","11000101000","11000100010","10110111000","10110001110","10001101110","10111011000","10111000110","10001110110","11101011000","11101000110","11100010110","11011101000","11011100010","11000111010","11101101000","11101100010","11100011010","11101111010","11001000010","11110001010","10100110000","10100001100","10010110000","10010000110","10000101100","10000100110","10110010000","10110000100","10011010000","10011000010","10000110100","10000110010","11000010010","11001010000","11110111010","11000010100","10001111010","10100111100","10010111100","10010011110","10111100100","10011110100","10011110010","11110100100","11110010100","11110010010","11011011110","11011110110","11110110110","10101111000","10100011110","10001011110","10111101000","10111100010","11110101000","11110100010","10111011110","10111101110","11101011110","11110101110","11010000100","11010010000","11010011100","1100011101011"];function qe(o,e=80){if(!o)return"";let t=[],r=104;t.push(r);let s=r;for(let c=0;c<o.length;c++){let p=o.charCodeAt(c);if(p<32||p>126)continue;let l=p-32;t.push(l),s+=l*(c+1)}t.push(s%103),t.push(106);let i="";for(let c of t)c>=0&&c<je.length&&(i+=je[c]);if(!i)return"";let n=2,d=i.length*n,a=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d} ${e}" width="${d}" height="${e}">`;for(let c=0;c<i.length;c++)i[c]==="1"&&(a+=`<rect x="${c*n}" y="0" width="${n}" height="${e}" fill="#000"/>`);return a+="</svg>",a}var ct="3.1.0";function ze(){console.info(`%c MEDIATHEQUE-CARD %c ${ct} IS INSTALLED `,"color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; background: #c8e6c9; font-weight: bold;")}function ie(o,e,t,...r){let s=`%c MEDIATHEQUE-CARD %c [${e}]`,i=["color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; font-weight: bold;"];console[o](s+" "+t,...i,...r)}var lt=10,ht=2e3,pt=15e3,ne=class{constructor(e,t){this.cardName=e;this.fire=t;this.timer=null;this.count=0}schedule(){if(this.timer||(this.count++,this.count>lt))return;let e=Math.min(ht*this.count,pt);ie("info",this.cardName,"Retry %d dans %dms\u2026",this.count,e),this.timer=setTimeout(()=>{this.timer=null,this.fire()},e)}reset(){this.count=0,this.cancel()}cancel(){this.timer&&(clearTimeout(this.timer),this.timer=null)}};var Ie=N`
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
  .book-emprunteur {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    margin-top: 1px;
  }
  .book-badges {
    display: flex;
    gap: 6px;
    margin-top: 4px;
    flex-wrap: wrap;
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
`;var Ve=N`
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
`;var ut={overdue:"En retard",today:"\xC0 rendre aujourd'hui",urgent:"1 \xE0 3 jours restants",soon:"4 \xE0 7 jours restants",ok:"Plus de 7 jours",not_extendable:"D\xE9j\xE0 prolong\xE9"},mt={entity:"Entit\xE9 (sensor)",title:"Titre personnalis\xE9",mode:"Mode",badges:"Filtres par badge",total_entity:'Entit\xE9 du total (mode "due")',card_id:"Identifiant carte"},J=class extends _{constructor(){super(...arguments);this._config={entity:""}}setConfig(t){this._config=t??{entity:""}}createRenderRoot(){return this}render(){if(!this.hass)return u``;let t=[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"title",selector:{text:{}}},{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"list",label:"Liste (group\xE9e par membre)"},{value:"covers",label:"Couvertures (grille \xE0 rendre)"}]}}},{name:"badges",selector:{select:{multiple:!0,options:D.map(r=>({value:r,label:ut[r]??r}))}}},{name:"total_entity",selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"card_id",selector:{text:{}}}];return u`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${t}
        .computeLabel=${r=>mt[r.name]??r.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_valueChanged(t){let r={...t.detail.value};for(let s of Object.keys(r)){let i=r[s];(i===""||i===void 0||i===null)&&delete r[s],Array.isArray(i)&&i.length===0&&delete r[s]}this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:r},bubbles:!0,composed:!0}))}};x([O({attribute:!1})],J.prototype,"hass",2),x([T()],J.prototype,"_config",2);customElements.get("mediatheque-card-editor")||customElements.define("mediatheque-card-editor",J);var X="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2252%22 height=%2276%22 viewBox=%220 0 52 76%22%3E%3Crect width=%2252%22 height=%2276%22 fill=%22%23e0e0e0%22 rx=%224%22/%3E%3Ctext x=%2226%22 y=%2242%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%239e9e9e%22%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E",A=class extends _{constructor(){super(...arguments);this._detailLoan=null;this._confirmExtend=null;this._barcodeOpen=!1;this._retry=new ne("card",()=>this.requestUpdate());this._hasRendered=!1;this._openDetail=t=>{this._detailLoan=t};this._closeDetail=()=>{this._detailLoan=null};this._askExtend=t=>{t.extend_url&&(this._confirmExtend={loan:t})};this._closeConfirm=()=>{this._confirmExtend=null};this._confirmExtendNow=()=>{let t=this._confirmExtend?.loan.extend_url;t&&this._hass&&this._hass.callService("mediatheque_veauche","extend_loan",{extend_url:t}),this._confirmExtend=null,this._detailLoan=null};this._openBarcode=()=>{this._barcodeOpen=!0};this._closeBarcode=()=>{this._barcodeOpen=!1};this._onOverlayClick=t=>{t.target===t.currentTarget&&this._closeDetail()};this._onConfirmOverlayClick=t=>{t.target===t.currentTarget&&this._closeConfirm()};this._onBarcodeOverlayClick=t=>{t.target===t.currentTarget&&this._closeBarcode()}}set hass(t){if(this._hass=t,!t||!this._config?.entity)return;let r=t.states[this._config.entity];this._entityState!==r&&(this._entityState=r,this._config.mode==="covers"&&this._config.total_entity&&(this._totalEntityState=t.states[this._config.total_entity]),this.requestUpdate())}get hass(){return this._hass}setConfig(t){if(!t||typeof t!="object")throw new Error("Configuration manquante ou invalide");if(!t.entity||typeof t.entity!="string")throw new Error("Vous devez d\xE9finir une entit\xE9 (entity)");let r;if(t.mode!==void 0){let s=Ne[t.mode]??t.mode;if(!_e.includes(s))throw new Error(`Le champ 'mode' doit valoir ${_e.map(i=>`'${i}'`).join(" ou ")}`);r=s}if(t.badges!==void 0&&!Array.isArray(t.badges))throw new Error("Le champ 'badges' doit \xEAtre une liste");if(Array.isArray(t.badges)){let s=t.badges.filter(i=>!D.includes(i));if(s.length)throw new Error(`Badges inconnus : ${s.join(", ")}. Valides : ${D.join(", ")}`)}this._config={...t,mode:r,badges:t.badges?.slice()}}static getStubConfig(){return{entity:"",mode:"list"}}static getConfigElement(){return document.createElement("mediatheque-card-editor")}getCardSize(){return this._config?.mode==="covers"?2:4}getGridOptions(){let t=this._config?.mode==="covers";return{columns:12,min_columns:t?4:6,rows:t?2:4,min_rows:2}}disconnectedCallback(){super.disconnectedCallback(),this._retry.cancel()}updated(){this._hasRendered&&this.dispatchEvent(new CustomEvent("mediatheque-card-update",{bubbles:!0,composed:!0}))}shouldUpdate(){return!(this._detailLoan||this._confirmExtend||this._barcodeOpen)||!this._hasRendered}render(){let t=this._config?.mode??"list",r=this._config?.title??(t==="covers"?"A rendre bient\xF4t":"M\xE9diath\xE8que de Veauche");if(!this._config)return this._renderLoader(r,"En attente de configuration\u2026");if(!this._hass)return this._renderLoader(r,"Connexion \xE0 Home Assistant\u2026");let s=this._config.entity,i=this._hass.states[s];if(!i||i.state==="unavailable"||i.state==="unknown"){let c=i?`state=${i.state}`:"entity not found";return ie("warn","card","%s \u2014 %s %s",s,c,this._hasRendered?"(keeping last render)":"(showing loader)"),this._retry.schedule(),this._hasRendered?this._lastTemplate??this._renderLoader(r):(this._lastTemplate=this._renderLoader(r,"En attente des donn\xE9es\u2026"),this._lastTemplate)}this._retry.reset();let n=this._config.badges??[...D],d=!!this._config.badges,a=t==="covers"?this._renderCovers(i,n,d,r):this._renderList(i,n,d,r);return this._lastTemplate=a,this._hasRendered=!0,a}_renderLoader(t,r="Chargement\u2026"){return u`
      <ha-card>
        <div class="mediatheque-header">
          <span class="mediatheque-title">${t}</span>
        </div>
        <div style="padding:32px 16px;text-align:center">
          <div class="mediatheque-loader"></div>
          <div style="margin-top:12px;color:var(--secondary-text-color);font-size:0.9em">
            ${r}
          </div>
        </div>
      </ha-card>
    `}_matchesBadgeFilter(t,r){return r.includes(oe(t.days_left).type)}_renderCovers(t,r,s,i){let d=(t.attributes??{}).livres??[],a=s?d.filter(g=>this._matchesBadgeFilter(g,r)):d,p=((this._totalEntityState??this._hass?.states[this._config.entity.replace("_due_week","_total")])?.attributes?.card_id??this._config?.card_id??"")||"",l=`${a.length}`,m=a.length>0,f=[...a].sort((g,b)=>(g.days_left??0)-(b.days_left??0));return u`
      <ha-card>
        ${this._renderHeader(i,l,m,p)}
        ${f.length===0?u`<div class="empty-state">Aucun livre à rendre</div>`:u`<div class="book-grid">
              ${f.map(g=>this._renderTile(g))}
            </div>`}
        ${this._renderModals(p)}
      </ha-card>
    `}_renderTile(t){let r=oe(t.days_left),s=t.cover_url||X,i=t.days_left<0?`${Math.abs(t.days_left)}j`:t.days_left===0?"!":`${t.days_left}j`;return u`
      <button
        class="book-tile"
        title="${t.titre}${t.emprunteur?` \u2014 ${t.emprunteur}`:""}"
        @click=${()=>this._openDetail(t)}
      >
        <img
          class="book-tile-cover"
          src=${s}
          alt=""
          loading="lazy"
          @error=${n=>{n.target.src=X}}
        />
        <span
          class="book-tile-badge"
          style="color:${r.color};background:${r.bg}"
          aria-label=${r.text}
          >${i}</span
        >
        ${t.extend_disabled||t.extended?u`<span
              class="book-tile-corner"
              style=${t.extend_disabled?"background:#b71c1c":"background:#6a1b9a"}
              title=${t.extend_disabled?"D\xE9sactiv\xE9":"Non prolongeable"}
              >✗</span
            >`:h}
      </button>
    `}_renderList(t,r,s,i){let n=t.attributes??{},d=n.membres??{},a=n.compte??"",c=n.card_id??this._config?.card_id??"",p={},l=0;for(let[b,y]of Object.entries(d)){let U=s?y.filter(ae=>this._matchesBadgeFilter(ae,r)):y;U.length>0&&(p[b]=U,l+=U.length)}let m=Object.keys(p).sort((b,y)=>b===a?-1:y===a?1:b.localeCompare(y)),f=`${l} emprunt${l>1?"s":""}`,g=s&&l>0;return u`
      <ha-card>
        ${this._renderHeader(i,f,g,c)}
        ${m.length===0?u`<div class="empty-state">Aucun emprunt en cours</div>`:m.map(b=>{let y=p[b];if(!y)return h;let U=b===a?"\u{1F464}":"\u{1F466}",ae=[...y].sort((de,Fe)=>(de.days_left??0)-(Fe.days_left??0));return u`
                <div class="member-section">
                  <div class="member-header">
                    <span class="member-icon">${U}</span>
                    <span class="member-name">${b}</span>
                    <span class="member-count">${y.length}</span>
                  </div>
                  ${ae.map(de=>this._renderBookRow(de,!1))}
                </div>
              `})}
        ${this._renderModals(c)}
      </ha-card>
    `}_renderHeader(t,r,s,i){return u`
      <div class="mediatheque-header">
        <span class="mediatheque-title">${t}</span>
        <span class="header-right">
          <span class=${Be({"mediatheque-total":!0,highlight:s})}>${r}</span>
          ${i?u`<button
                class="mc-barcode-btn"
                title="Ma carte"
                @click=${this._openBarcode}
              >
                |||
              </button>`:h}
        </span>
      </div>
    `}_renderBookRow(t,r){let s=oe(t.days_left),i=t.cover_url||X;return u`
      <div class="book-row">
        <div class="book-cover-wrapper" @click=${()=>this._openDetail(t)}>
          <img
            class="book-cover"
            src=${i}
            alt=""
            loading="lazy"
            @error=${n=>{n.target.src=X}}
          />
        </div>
        <div class="book-info">
          <div class="book-title" title=${t.titre}>${t.titre}</div>
          <div class="book-date">Retour : ${t.due_date_display}</div>
          ${r&&t.emprunteur?u`<div class="book-emprunteur">Emprunteur : ${t.emprunteur}</div>`:h}
          <div class="book-badges">
            <span class="badge-days" style="color:${s.color};background:${s.bg}">
              ${s.text}
            </span>
            ${t.extend_disabled?u`<span class="badge-days" style="color:#b71c1c;background:#ffcdd2"
                  >✗ Désactivé</span
                >`:t.extended?u`<span class="badge-days" style="color:#6a1b9a;background:#e1bee7"
                    >✗ Non prolongeable</span
                  >`:h}
          </div>
        </div>
      </div>
    `}_renderModals(t){return u`
      ${this._detailLoan?this._renderDetailModal(this._detailLoan):h}
      ${this._confirmExtend?this._renderConfirmModal(this._confirmExtend.loan):h}
      ${this._barcodeOpen&&t?this._renderBarcodeModal(t):h}
    `}_renderDetailModal(t){let r=t.cover_url||X;return u`
      <div class="mc-modal-overlay active" @click=${this._onOverlayClick}>
        <div class="mc-modal">
          <div class="mc-modal-body mc-modal-body-top">
            <div class="mc-modal-title">${t.titre}</div>
          </div>
          <img class="mc-modal-cover" src=${r} alt="" />
          <div class="mc-modal-body">
            ${t.isbn?u`<div class="mc-modal-isbn">ISBN : ${t.isbn}</div>`:h}
            <div class="mc-modal-actions">
              <button class="mc-modal-btn mc-modal-btn-close" @click=${this._closeDetail}>
                Fermer
              </button>
              ${t.can_extend?u`<button
                    class="mc-modal-btn mc-modal-btn-extend"
                    @click=${()=>this._askExtend(t)}
                  >
                    Prolonger
                  </button>`:h}
            </div>
          </div>
        </div>
      </div>
    `}_renderConfirmModal(t){return u`
      <div class="mc-confirm-overlay active" @click=${this._onConfirmOverlayClick}>
        <div class="mc-confirm-dialog">
          <div class="mc-confirm-icon">↻</div>
          <div class="mc-confirm-title">Prolonger cet emprunt ?</div>
          <div class="mc-confirm-text">${t.titre}</div>
          <div class="mc-confirm-actions">
            <button class="mc-modal-btn-cancel" @click=${this._closeConfirm}>Annuler</button>
            <button class="mc-modal-btn-confirm" @click=${this._confirmExtendNow}>
              Confirmer
            </button>
          </div>
        </div>
      </div>
    `}_renderBarcodeModal(t){let r=qe(t);return u`
      <div class="mc-barcode-overlay active" @click=${this._onBarcodeOverlayClick}>
        <div class="mc-barcode-dialog">
          <h3>Ma carte</h3>
          <div class="mc-barcode-id">${t}</div>
          <div class="mc-barcode-svg">${Ue(r)}</div>
          <button class="mc-barcode-close" @click=${this._closeBarcode}>Fermer</button>
        </div>
      </div>
    `}};A.styles=[Ie,Ve],x([O({attribute:!1})],A.prototype,"hass",1),x([T()],A.prototype,"_config",2),x([T()],A.prototype,"_detailLoan",2),x([T()],A.prototype,"_confirmExtend",2),x([T()],A.prototype,"_barcodeOpen",2);ze();window.loadCardHelpers?.();customElements.get("mediatheque-card")||customElements.define("mediatheque-card",A);window.customCards=window.customCards??[];window.customCards.some(o=>o.type==="mediatheque-card")||window.customCards.push({type:"mediatheque-card",name:"M\xE9diath\xE8que de Veauche",description:"Affiche les emprunts de la m\xE9diath\xE8que de Veauche"});export{A as MediathequeCard};
