/* mediatheque-card — built artefact, ne pas éditer directement. Sources : frontend/src/ */
var Ft=Object.defineProperty;var Gt=Object.getOwnPropertyDescriptor;var _=(i,t,e,r)=>{for(var s=r>1?void 0:r?Gt(t,e):t,o=i.length-1,n;o>=0;o--)(n=i[o])&&(s=(r?n(t,e,s):n(s))||s);return r&&s&&Ft(t,e,s),s};var X=globalThis,Y=X.ShadowRoot&&(X.ShadyCSS===void 0||X.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ct=Symbol(),yt=new WeakMap,N=class{constructor(t,e,r){if(this._$cssResult$=!0,r!==ct)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(Y&&t===void 0){let r=e!==void 0&&e.length===1;r&&(t=yt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&yt.set(e,t))}return t}toString(){return this.cssText}},$t=i=>new N(typeof i=="string"?i:i+"",void 0,ct),j=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((r,s,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new N(e,i,ct)},xt=(i,t)=>{if(Y)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let r=document.createElement("style"),s=X.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=e.cssText,i.appendChild(r)}},dt=Y?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let r of t.cssRules)e+=r.cssText;return $t(e)})(i):i;var{is:Wt,defineProperty:Kt,getOwnPropertyDescriptor:Qt,getOwnPropertyNames:Jt,getOwnPropertySymbols:Xt,getPrototypeOf:Yt}=Object,E=globalThis,At=E.trustedTypes,Zt=At?At.emptyScript:"",te=E.reactiveElementPolyfillSupport,q=(i,t)=>i,z={toAttribute(i,t){switch(t){case Boolean:i=i?Zt:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},Z=(i,t)=>!Wt(i,t),Et={attribute:!0,type:String,converter:z,reflect:!1,useDefault:!1,hasChanged:Z};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),E.litPropertyMetadata??(E.litPropertyMetadata=new WeakMap);var A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Et){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let r=Symbol(),s=this.getPropertyDescriptor(t,r,e);s!==void 0&&Kt(this.prototype,t,s)}}static getPropertyDescriptor(t,e,r){let{get:s,set:o}=Qt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:s,set(n){let d=s?.call(this);o?.call(this,n),this.requestUpdate(t,d,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Et}static _$Ei(){if(this.hasOwnProperty(q("elementProperties")))return;let t=Yt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(q("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(q("properties"))){let e=this.properties,r=[...Jt(e),...Xt(e)];for(let s of r)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[r,s]of e)this.elementProperties.set(r,s)}this._$Eh=new Map;for(let[e,r]of this.elementProperties){let s=this._$Eu(e,r);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let r=new Set(t.flat(1/0).reverse());for(let s of r)e.unshift(dt(s))}else t!==void 0&&e.push(dt(t));return e}static _$Eu(t,e){let r=e.attribute;return r===!1?void 0:typeof r=="string"?r:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let r of e.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return xt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,r){this._$AK(t,r)}_$ET(t,e){let r=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,r);if(s!==void 0&&r.reflect===!0){let o=(r.converter?.toAttribute!==void 0?r.converter:z).toAttribute(e,r.type);this._$Em=t,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){let r=this.constructor,s=r._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let o=r.getPropertyOptions(s),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:z;this._$Em=s;let d=n.fromAttribute(e,o.type);this[s]=d??this._$Ej?.get(s)??d,this._$Em=null}}requestUpdate(t,e,r,s=!1,o){if(t!==void 0){let n=this.constructor;if(s===!1&&(o=this[t]),r??(r=n.getPropertyOptions(t)),!((r.hasChanged??Z)(o,e)||r.useDefault&&r.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,r))))return;this.C(t,e,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:r,reflect:s,wrapped:o},n){r&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||r||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[s,o]of r){let{wrapped:n}=o,d=this[s];n!==!0||this._$AL.has(s)||d===void 0||this.C(s,void 0,o,d)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(e)):this._$EM()}catch(r){throw t=!1,this._$EM(),r}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[q("elementProperties")]=new Map,A[q("finalized")]=new Map,te?.({ReactiveElement:A}),(E.reactiveElementVersions??(E.reactiveElementVersions=[])).push("2.1.2");var V=globalThis,wt=i=>i,tt=V.trustedTypes,St=tt?tt.createPolicy("lit-html",{createHTML:i=>i}):void 0,Mt="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,Pt="?"+w,ee=`<${Pt}>`,k=document,F=()=>k.createComment(""),G=i=>i===null||typeof i!="object"&&typeof i!="function",gt=Array.isArray,re=i=>gt(i)||typeof i?.[Symbol.iterator]=="function",lt=`[ 	
\f\r]`,I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ct=/-->/g,kt=/>/g,S=RegExp(`>|${lt}(?:([^\\s"'>=/]+)(${lt}*=${lt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Tt=/'/g,Rt=/"/g,Ot=/^(?:script|style|textarea|title)$/i,vt=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),u=vt(1),be=vt(2),ye=vt(3),b=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),Lt=new WeakMap,C=k.createTreeWalker(k,129);function Ht(i,t){if(!gt(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return St!==void 0?St.createHTML(t):t}var se=(i,t)=>{let e=i.length-1,r=[],s,o=t===2?"<svg>":t===3?"<math>":"",n=I;for(let d=0;d<e;d++){let a=i[d],c,p,l=-1,m=0;for(;m<a.length&&(n.lastIndex=m,p=n.exec(a),p!==null);)m=n.lastIndex,n===I?p[1]==="!--"?n=Ct:p[1]!==void 0?n=kt:p[2]!==void 0?(Ot.test(p[2])&&(s=RegExp("</"+p[2],"g")),n=S):p[3]!==void 0&&(n=S):n===S?p[0]===">"?(n=s??I,l=-1):p[1]===void 0?l=-2:(l=n.lastIndex-p[2].length,c=p[1],n=p[3]===void 0?S:p[3]==='"'?Rt:Tt):n===Rt||n===Tt?n=S:n===Ct||n===kt?n=I:(n=S,s=void 0);let g=n===S&&i[d+1].startsWith("/>")?" ":"";o+=n===I?a+ee:l>=0?(r.push(c),a.slice(0,l)+Mt+a.slice(l)+w+g):a+w+(l===-2?d:g)}return[Ht(i,o+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),r]},W=class i{constructor({strings:t,_$litType$:e},r){let s;this.parts=[];let o=0,n=0,d=t.length-1,a=this.parts,[c,p]=se(t,e);if(this.el=i.createElement(c,r),C.currentNode=this.el.content,e===2||e===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(s=C.nextNode())!==null&&a.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(let l of s.getAttributeNames())if(l.endsWith(Mt)){let m=p[n++],g=s.getAttribute(l).split(w),x=/([.?@])?(.*)/.exec(m);a.push({type:1,index:o,name:x[2],strings:g,ctor:x[1]==="."?pt:x[1]==="?"?ut:x[1]==="@"?mt:M}),s.removeAttribute(l)}else l.startsWith(w)&&(a.push({type:6,index:o}),s.removeAttribute(l));if(Ot.test(s.tagName)){let l=s.textContent.split(w),m=l.length-1;if(m>0){s.textContent=tt?tt.emptyScript:"";for(let g=0;g<m;g++)s.append(l[g],F()),C.nextNode(),a.push({type:2,index:++o});s.append(l[m],F())}}}else if(s.nodeType===8)if(s.data===Pt)a.push({type:2,index:o});else{let l=-1;for(;(l=s.data.indexOf(w,l+1))!==-1;)a.push({type:7,index:o}),l+=w.length-1}o++}}static createElement(t,e){let r=k.createElement("template");return r.innerHTML=t,r}};function L(i,t,e=i,r){if(t===b)return t;let s=r!==void 0?e._$Co?.[r]:e._$Cl,o=G(t)?void 0:t._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,e,r)),r!==void 0?(e._$Co??(e._$Co=[]))[r]=s:e._$Cl=s),s!==void 0&&(t=L(i,s._$AS(i,t.values),s,r)),t}var ht=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:r}=this._$AD,s=(t?.creationScope??k).importNode(e,!0);C.currentNode=s;let o=C.nextNode(),n=0,d=0,a=r[0];for(;a!==void 0;){if(n===a.index){let c;a.type===2?c=new K(o,o.nextSibling,this,t):a.type===1?c=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(c=new ft(o,this,t)),this._$AV.push(c),a=r[++d]}n!==a?.index&&(o=C.nextNode(),n++)}return C.currentNode=k,s}p(t){let e=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(t,r,e),e+=r.strings.length-2):r._$AI(t[e])),e++}},K=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,r,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=L(this,t,e),G(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==b&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):re(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&G(this._$AH)?this._$AA.nextSibling.data=t:this.T(k.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:r}=t,s=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=W.createElement(Ht(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(e);else{let o=new ht(s,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=Lt.get(t.strings);return e===void 0&&Lt.set(t.strings,e=new W(t)),e}k(t){gt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,r,s=0;for(let o of t)s===e.length?e.push(r=new i(this.O(F()),this.O(F()),this,this.options)):r=e[s],r._$AI(o),s++;s<e.length&&(this._$AR(r&&r._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let r=wt(t).nextSibling;wt(t).remove(),t=r}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,r,s,o){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=h}_$AI(t,e=this,r,s){let o=this.strings,n=!1;if(o===void 0)t=L(this,t,e,0),n=!G(t)||t!==this._$AH&&t!==b,n&&(this._$AH=t);else{let d=t,a,c;for(t=o[0],a=0;a<o.length-1;a++)c=L(this,d[r+a],e,a),c===b&&(c=this._$AH[a]),n||(n=!G(c)||c!==this._$AH[a]),c===h?t=h:t!==h&&(t+=(c??"")+o[a+1]),this._$AH[a]=c}n&&!s&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},pt=class extends M{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},ut=class extends M{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},mt=class extends M{constructor(t,e,r,s,o){super(t,e,r,s,o),this.type=5}_$AI(t,e=this){if((t=L(this,t,e,0)??h)===b)return;let r=this._$AH,s=t===h&&r!==h||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,o=t!==h&&(r===h||s);s&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},ft=class{constructor(t,e,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){L(this,t)}};var ie=V.litHtmlPolyfillSupport;ie?.(W,K),(V.litHtmlVersions??(V.litHtmlVersions=[])).push("3.3.2");var Dt=(i,t,e)=>{let r=e?.renderBefore??t,s=r._$litPart$;if(s===void 0){let o=e?.renderBefore??null;r._$litPart$=s=new K(t.insertBefore(F(),o),o,void 0,e??{})}return s._$AI(i),s};var Q=globalThis,y=class extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Dt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return b}};y._$litElement$=!0,y.finalized=!0,Q.litElementHydrateSupport?.({LitElement:y});var oe=Q.litElementPolyfillSupport;oe?.({LitElement:y});(Q.litElementVersions??(Q.litElementVersions=[])).push("4.2.2");var et=i=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(i,t)}):customElements.define(i,t)};var ne={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:Z},ae=(i=ne,t,e)=>{let{kind:r,metadata:s}=e,o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),r==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(e.name,i),r==="accessor"){let{name:n}=e;return{set(d){let a=t.get.call(this);t.set.call(this,d),this.requestUpdate(n,a,i,!0,d)},init(d){return d!==void 0&&this.C(n,void 0,i,d),d}}}if(r==="setter"){let{name:n}=e;return function(d){let a=this[n];t.call(this,d),this.requestUpdate(n,a,i,!0,d)}}throw Error("Unsupported decorator location: "+r)};function P(i){return(t,e)=>typeof e=="object"?ae(i,t,e):((r,s,o)=>{let n=s.hasOwnProperty(o);return s.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(s,o):void 0})(i,t,e)}function T(i){return P({...i,state:!0,attribute:!1})}var st={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},H=i=>(...t)=>({_$litDirective$:i,values:t}),O=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,r){this._$Ct=t,this._$AM=e,this._$Ci=r}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var R=class extends O{constructor(t){if(super(t),this.it=h,t.type!==st.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===h||t==null)return this._t=void 0,this.it=t;if(t===b)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;let e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}};R.directiveName="unsafeHTML",R.resultType=1;var dr=H(R);var J=class extends R{};J.directiveName="unsafeSVG",J.resultType=2;var Ut=H(J);var Bt=H(class extends O{constructor(i){if(super(i),i.type!==st.ATTRIBUTE||i.name!=="class"||i.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(t=>i[t]).join(" ")+" "}update(i,[t]){if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(let r in t)t[r]&&!this.nt?.has(r)&&this.st.add(r);return this.render(t)}let e=i.element.classList;for(let r of this.st)r in t||(e.remove(r),this.st.delete(r));for(let r in t){let s=!!t[r];s===this.st.has(r)||this.nt?.has(r)||(s?(e.add(r),this.st.add(r)):(e.remove(r),this.st.delete(r)))}return b}});var D=["overdue","today","urgent","soon","ok","not_extendable"];function _t(i){return i<0?{type:"overdue",text:`\u2717 ${Math.abs(i)}j de retard`,color:"#b71c1c",bg:"#ffcdd2"}:i===0?{type:"today",text:"\u26A0 Aujourd'hui",color:"#d84315",bg:"#ffe0b2"}:i<=3?{type:"urgent",text:`\u26A0 ${i}j restants`,color:"#d84315",bg:"#ffe0b2"}:i<=7?{type:"soon",text:`\u26A1 ${i}j restants`,color:"#f57f17",bg:"#fff9c4"}:{type:"ok",text:`\u2713 ${i}j restants`,color:"#2e7d32",bg:"#c8e6c9"}}var Nt=["11011001100","11001101100","11001100110","10010011000","10010001100","10001001100","10011001000","10011000100","10001100100","11001001000","11001000100","11000100100","10110011100","10011011100","10011001110","10111001100","10011101100","10011100110","11001110010","11001011100","11001001110","11011100100","11001110100","11100101100","11100100110","10110001100","10001101100","10001100110","11010001100","11000101100","11000100110","10110001000","10001101000","10001100010","11010001000","11000101000","11000100010","10110111000","10110001110","10001101110","10111011000","10111000110","10001110110","11101011000","11101000110","11100010110","11011101000","11011100010","11000111010","11101101000","11101100010","11100011010","11101111010","11001000010","11110001010","10100110000","10100001100","10010110000","10010000110","10000101100","10000100110","10110010000","10110000100","10011010000","10011000010","10000110100","10000110010","11000010010","11001010000","11110111010","11000010100","10001111010","10100111100","10010111100","10010011110","10111100100","10011110100","10011110010","11110100100","11110010100","11110010010","11011011110","11011110110","11110110110","10101111000","10100011110","10001011110","10111101000","10111100010","11110101000","11110100010","10111011110","10111101110","11101011110","11110101110","11010000100","11010010000","11010011100","1100011101011"];function jt(i,t=80){if(!i)return"";let e=[],r=104;e.push(r);let s=r;for(let c=0;c<i.length;c++){let p=i.charCodeAt(c);if(p<32||p>126)continue;let l=p-32;e.push(l),s+=l*(c+1)}e.push(s%103),e.push(106);let o="";for(let c of e)c>=0&&c<Nt.length&&(o+=Nt[c]);if(!o)return"";let n=2,d=o.length*n,a=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d} ${t}" width="${d}" height="${t}">`;for(let c=0;c<o.length;c++)o[c]==="1"&&(a+=`<rect x="${c*n}" y="0" width="${n}" height="${t}" fill="#000"/>`);return a+="</svg>",a}var ce="3.0.0";function qt(){console.info(`%c MEDIATHEQUE-CARD %c ${ce} IS INSTALLED `,"color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; background: #c8e6c9; font-weight: bold;")}function it(i,t,e,...r){let s=`%c MEDIATHEQUE-CARD %c [${t}]`,o=["color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; font-weight: bold;"];console[i](s+" "+e,...o,...r)}var de=10,le=2e3,he=15e3,ot=class{constructor(t,e){this.cardName=t;this.fire=e;this.timer=null;this.count=0}schedule(){if(this.timer||(this.count++,this.count>de))return;let t=Math.min(le*this.count,he);it("info",this.cardName,"Retry %d dans %dms\u2026",this.count,t),this.timer=setTimeout(()=>{this.timer=null,this.fire()},t)}reset(){this.count=0,this.cancel()}cancel(){this.timer&&(clearTimeout(this.timer),this.timer=null)}};var zt=j`
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
`;var It=j`
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
`;var pe={overdue:"En retard",today:"\xC0 rendre aujourd'hui",urgent:"1 \xE0 3 jours restants",soon:"4 \xE0 7 jours restants",ok:"Plus de 7 jours",not_extendable:"D\xE9j\xE0 prolong\xE9"},ue={entity:"Entit\xE9 (sensor)",title:"Titre personnalis\xE9",mode:"Mode",badges:"Filtres par badge",total_entity:'Entit\xE9 du total (mode "due")',card_id:"Identifiant carte"},U=class extends y{constructor(){super(...arguments);this._config={entity:""}}setConfig(e){this._config=e??{entity:""}}createRenderRoot(){return this}render(){if(!this.hass)return u``;let e=[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"title",selector:{text:{}}},{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"all",label:"Tous les emprunts (par membre)"},{value:"due",label:"\xC0 rendre cette semaine"}]}}},{name:"badges",selector:{select:{multiple:!0,options:D.map(r=>({value:r,label:pe[r]??r}))}}},{name:"total_entity",selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"card_id",selector:{text:{}}}];return u`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${e}
        .computeLabel=${r=>ue[r.name]??r.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_valueChanged(e){let r={...e.detail.value};for(let s of Object.keys(r)){let o=r[s];(o===""||o===void 0||o===null)&&delete r[s],Array.isArray(o)&&o.length===0&&delete r[s]}this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:r},bubbles:!0,composed:!0}))}};_([P({attribute:!1})],U.prototype,"hass",2),_([T()],U.prototype,"_config",2),U=_([et("mediatheque-card-editor")],U);var bt="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2252%22 height=%2276%22 viewBox=%220 0 52 76%22%3E%3Crect width=%2252%22 height=%2276%22 fill=%22%23e0e0e0%22 rx=%224%22/%3E%3Ctext x=%2226%22 y=%2242%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%239e9e9e%22%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E",$=class extends y{constructor(){super(...arguments);this._detailLoan=null;this._confirmExtend=null;this._barcodeOpen=!1;this._retry=new ot("card",()=>this.requestUpdate());this._hasRendered=!1;this._openDetail=e=>{this._detailLoan=e};this._closeDetail=()=>{this._detailLoan=null};this._askExtend=e=>{e.extend_url&&(this._confirmExtend={loan:e})};this._closeConfirm=()=>{this._confirmExtend=null};this._confirmExtendNow=()=>{let e=this._confirmExtend?.loan.extend_url;e&&this._hass&&this._hass.callService("mediatheque_veauche","extend_loan",{extend_url:e}),this._confirmExtend=null,this._detailLoan=null};this._openBarcode=()=>{this._barcodeOpen=!0};this._closeBarcode=()=>{this._barcodeOpen=!1};this._onOverlayClick=e=>{e.target===e.currentTarget&&this._closeDetail()};this._onConfirmOverlayClick=e=>{e.target===e.currentTarget&&this._closeConfirm()};this._onBarcodeOverlayClick=e=>{e.target===e.currentTarget&&this._closeBarcode()}}set hass(e){if(this._hass=e,!e||!this._config?.entity)return;let r=e.states[this._config.entity];this._entityState!==r&&(this._entityState=r,this._config.mode==="due"&&this._config.total_entity&&(this._totalEntityState=e.states[this._config.total_entity]),this.requestUpdate())}get hass(){return this._hass}setConfig(e){if(!e||typeof e!="object")throw new Error("Configuration manquante ou invalide");if(!e.entity||typeof e.entity!="string")throw new Error("Vous devez d\xE9finir une entit\xE9 (entity)");if(e.mode!==void 0&&!["all","due"].includes(e.mode))throw new Error("Le champ 'mode' doit valoir 'all' ou 'due'");if(e.badges!==void 0&&!Array.isArray(e.badges))throw new Error("Le champ 'badges' doit \xEAtre une liste");if(Array.isArray(e.badges)){let r=e.badges.filter(s=>!D.includes(s));if(r.length)throw new Error(`Badges inconnus : ${r.join(", ")}. Valides : ${D.join(", ")}`)}this._config={...e,badges:e.badges?.slice()}}static getStubConfig(){return{entity:"",mode:"all"}}static getConfigElement(){return document.createElement("mediatheque-card-editor")}getCardSize(){return this._config?.mode==="due"?3:4}getGridOptions(){return{columns:12,min_columns:6,rows:this._config?.mode==="due"?3:4,min_rows:2}}disconnectedCallback(){super.disconnectedCallback(),this._retry.cancel()}updated(){this._hasRendered&&this.dispatchEvent(new CustomEvent("mediatheque-card-update",{bubbles:!0,composed:!0}))}shouldUpdate(){return!(this._detailLoan||this._confirmExtend||this._barcodeOpen)||!this._hasRendered}render(){if(!this._config||!this._hass)return u``;let e=this._config.entity,r=this._config.mode??"all",s=this._hass.states[e],o=this._config.title??(r==="due"?"A rendre cette semaine":"M\xE9diath\xE8que de Veauche");if(!s||s.state==="unavailable"||s.state==="unknown"){let c=s?`state=${s.state}`:"entity not found";return it("warn","card","%s \u2014 %s %s",e,c,this._hasRendered?"(keeping last render)":"(showing loader)"),this._retry.schedule(),this._hasRendered?this._lastTemplate??this._renderLoader(o):(this._lastTemplate=this._renderLoader(o),this._lastTemplate)}this._retry.reset();let n=this._config.badges??[...D],d=!!this._config.badges,a=r==="due"?this._renderDue(s,n,d,o):this._renderAll(s,n,d,o);return this._lastTemplate=a,this._hasRendered=!0,a}_renderLoader(e){return u`
      <ha-card>
        <div class="mediatheque-header">
          <span class="mediatheque-title">${e}</span>
        </div>
        <div style="padding:32px 16px;text-align:center">
          <div class="mediatheque-loader"></div>
          <div style="margin-top:12px;color:var(--secondary-text-color);font-size:0.9em">
            Chargement...
          </div>
        </div>
      </ha-card>
    `}_matchesBadgeFilter(e,r){return r.includes(_t(e.days_left).type)}_renderDue(e,r,s,o){let d=(e.attributes??{}).livres??[],a=s?d.filter(f=>this._matchesBadgeFilter(f,r)):d,c=this._totalEntityState??this._hass?.states[this._config.entity.replace("_due_week","_total")],p=c?parseInt(c.state,10)||0:null,l=(c?.attributes?.card_id??this._config?.card_id??"")||"",m=p!==null?`${a.length} / ${p}`:`${a.length}`,g=a.length>0,x=[...a].sort((f,v)=>(f.days_left??0)-(v.days_left??0));return u`
      <ha-card>
        ${this._renderHeader(o,m,g,l)}
        ${x.length===0?u`<div class="empty-state">Aucun livre à rendre cette semaine</div>`:x.map(f=>this._renderBookRow(f,!0))}
        ${this._renderModals(l)}
      </ha-card>
    `}_renderAll(e,r,s,o){let n=e.attributes??{},d=n.membres??{},a=n.compte??"",c=n.card_id??this._config?.card_id??"",p={},l=0;for(let[f,v]of Object.entries(d)){let B=s?v.filter(nt=>this._matchesBadgeFilter(nt,r)):v;B.length>0&&(p[f]=B,l+=B.length)}let m=Object.keys(p).sort((f,v)=>f===a?-1:v===a?1:f.localeCompare(v)),g=`${l} emprunt${l>1?"s":""}`,x=s&&l>0;return u`
      <ha-card>
        ${this._renderHeader(o,g,x,c)}
        ${m.length===0?u`<div class="empty-state">Aucun emprunt en cours</div>`:m.map(f=>{let v=p[f];if(!v)return h;let B=f===a?"\u{1F464}":"\u{1F466}",nt=[...v].sort((at,Vt)=>(at.days_left??0)-(Vt.days_left??0));return u`
                <div class="member-section">
                  <div class="member-header">
                    <span class="member-icon">${B}</span>
                    <span class="member-name">${f}</span>
                    <span class="member-count">${v.length}</span>
                  </div>
                  ${nt.map(at=>this._renderBookRow(at,!1))}
                </div>
              `})}
        ${this._renderModals(c)}
      </ha-card>
    `}_renderHeader(e,r,s,o){return u`
      <div class="mediatheque-header">
        <span class="mediatheque-title">${e}</span>
        <span class="header-right">
          <span class=${Bt({"mediatheque-total":!0,highlight:s})}>${r}</span>
          ${o?u`<button
                class="mc-barcode-btn"
                title="Ma carte"
                @click=${this._openBarcode}
              >
                |||
              </button>`:h}
        </span>
      </div>
    `}_renderBookRow(e,r){let s=_t(e.days_left),o=e.cover_url||bt;return u`
      <div class="book-row">
        <div class="book-cover-wrapper" @click=${()=>this._openDetail(e)}>
          <img
            class="book-cover"
            src=${o}
            alt=""
            loading="lazy"
            @error=${n=>{n.target.src=bt}}
          />
        </div>
        <div class="book-info">
          <div class="book-title" title=${e.titre}>${e.titre}</div>
          <div class="book-date">Retour : ${e.due_date_display}</div>
          ${r&&e.emprunteur?u`<div class="book-emprunteur">Emprunteur : ${e.emprunteur}</div>`:h}
          <div class="book-badges">
            <span class="badge-days" style="color:${s.color};background:${s.bg}">
              ${s.text}
            </span>
            ${e.extend_disabled?u`<span class="badge-days" style="color:#b71c1c;background:#ffcdd2"
                  >✗ Désactivé</span
                >`:e.extended?u`<span class="badge-days" style="color:#6a1b9a;background:#e1bee7"
                    >✗ Non prolongeable</span
                  >`:h}
          </div>
        </div>
      </div>
    `}_renderModals(e){return u`
      ${this._detailLoan?this._renderDetailModal(this._detailLoan):h}
      ${this._confirmExtend?this._renderConfirmModal(this._confirmExtend.loan):h}
      ${this._barcodeOpen&&e?this._renderBarcodeModal(e):h}
    `}_renderDetailModal(e){let r=e.cover_url||bt;return u`
      <div class="mc-modal-overlay active" @click=${this._onOverlayClick}>
        <div class="mc-modal">
          <div class="mc-modal-body mc-modal-body-top">
            <div class="mc-modal-title">${e.titre}</div>
          </div>
          <img class="mc-modal-cover" src=${r} alt="" />
          <div class="mc-modal-body">
            ${e.isbn?u`<div class="mc-modal-isbn">ISBN : ${e.isbn}</div>`:h}
            <div class="mc-modal-actions">
              <button class="mc-modal-btn mc-modal-btn-close" @click=${this._closeDetail}>
                Fermer
              </button>
              ${e.can_extend?u`<button
                    class="mc-modal-btn mc-modal-btn-extend"
                    @click=${()=>this._askExtend(e)}
                  >
                    Prolonger
                  </button>`:h}
            </div>
          </div>
        </div>
      </div>
    `}_renderConfirmModal(e){return u`
      <div class="mc-confirm-overlay active" @click=${this._onConfirmOverlayClick}>
        <div class="mc-confirm-dialog">
          <div class="mc-confirm-icon">↻</div>
          <div class="mc-confirm-title">Prolonger cet emprunt ?</div>
          <div class="mc-confirm-text">${e.titre}</div>
          <div class="mc-confirm-actions">
            <button class="mc-modal-btn-cancel" @click=${this._closeConfirm}>Annuler</button>
            <button class="mc-modal-btn-confirm" @click=${this._confirmExtendNow}>
              Confirmer
            </button>
          </div>
        </div>
      </div>
    `}_renderBarcodeModal(e){let r=jt(e);return u`
      <div class="mc-barcode-overlay active" @click=${this._onBarcodeOverlayClick}>
        <div class="mc-barcode-dialog">
          <h3>Ma carte</h3>
          <div class="mc-barcode-id">${e}</div>
          <div class="mc-barcode-svg">${Ut(r)}</div>
          <button class="mc-barcode-close" @click=${this._closeBarcode}>Fermer</button>
        </div>
      </div>
    `}};$.styles=[zt,It],_([P({attribute:!1})],$.prototype,"hass",1),_([T()],$.prototype,"_config",2),_([T()],$.prototype,"_detailLoan",2),_([T()],$.prototype,"_confirmExtend",2),_([T()],$.prototype,"_barcodeOpen",2),$=_([et("mediatheque-card")],$);qt();window.loadCardHelpers?.();window.customCards=window.customCards??[];window.customCards.push({type:"mediatheque-card",name:"M\xE9diath\xE8que de Veauche",description:"Affiche les emprunts de la m\xE9diath\xE8que de Veauche"});export{$ as MediathequeCard};
