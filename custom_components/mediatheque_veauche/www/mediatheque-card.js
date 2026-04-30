/* mediatheque-card — built artefact, ne pas éditer directement. Sources : frontend/src/ */
var Ve=Object.defineProperty;var Fe=Object.getOwnPropertyDescriptor;var $=(i,e,t,r)=>{for(var s=r>1?void 0:r?Fe(e,t):e,o=i.length-1,n;o>=0;o--)(n=i[o])&&(s=(r?n(e,t,s):n(s))||s);return r&&s&&Ve(e,t,s),s};var X=globalThis,Y=X.ShadowRoot&&(X.ShadyCSS===void 0||X.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ae=Symbol(),be=new WeakMap,B=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==ae)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(Y&&e===void 0){let r=t!==void 0&&t.length===1;r&&(e=be.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&be.set(t,e))}return e}toString(){return this.cssText}},ye=i=>new B(typeof i=="string"?i:i+"",void 0,ae),N=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((r,s,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new B(t,i,ae)},$e=(i,e)=>{if(Y)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let r=document.createElement("style"),s=X.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=t.cssText,i.appendChild(r)}},ce=Y?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let r of e.cssRules)t+=r.cssText;return ye(t)})(i):i;var{is:Ge,defineProperty:We,getOwnPropertyDescriptor:Ke,getOwnPropertyNames:Qe,getOwnPropertySymbols:Je,getPrototypeOf:Xe}=Object,E=globalThis,xe=E.trustedTypes,Ye=xe?xe.emptyScript:"",Ze=E.reactiveElementPolyfillSupport,q=(i,e)=>i,j={toAttribute(i,e){switch(e){case Boolean:i=i?Ye:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},Z=(i,e)=>!Ge(i,e),Ae={attribute:!0,type:String,converter:j,reflect:!1,useDefault:!1,hasChanged:Z};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),E.litPropertyMetadata??(E.litPropertyMetadata=new WeakMap);var x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Ae){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let r=Symbol(),s=this.getPropertyDescriptor(e,r,t);s!==void 0&&We(this.prototype,e,s)}}static getPropertyDescriptor(e,t,r){let{get:s,set:o}=Ke(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){let d=s?.call(this);o?.call(this,n),this.requestUpdate(e,d,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ae}static _$Ei(){if(this.hasOwnProperty(q("elementProperties")))return;let e=Xe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(q("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(q("properties"))){let t=this.properties,r=[...Qe(t),...Je(t)];for(let s of r)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[r,s]of t)this.elementProperties.set(r,s)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let s=this._$Eu(t,r);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let s of r)t.unshift(ce(s))}else e!==void 0&&t.push(ce(e));return t}static _$Eu(e,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return $e(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){let r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){let o=(r.converter?.toAttribute!==void 0?r.converter:j).toAttribute(t,r.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){let r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let o=r.getPropertyOptions(s),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:j;this._$Em=s;let d=n.fromAttribute(t,o.type);this[s]=d??this._$Ej?.get(s)??d,this._$Em=null}}requestUpdate(e,t,r,s=!1,o){if(e!==void 0){let n=this.constructor;if(s===!1&&(o=this[e]),r??(r=n.getPropertyOptions(e)),!((r.hasChanged??Z)(o,t)||r.useDefault&&r.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:s,wrapped:o},n){r&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[s,o]of r){let{wrapped:n}=o,d=this[s];n!==!0||this._$AL.has(s)||d===void 0||this.C(s,void 0,o,d)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[q("elementProperties")]=new Map,x[q("finalized")]=new Map,Ze?.({ReactiveElement:x}),(E.reactiveElementVersions??(E.reactiveElementVersions=[])).push("2.1.2");var I=globalThis,Ee=i=>i,ee=I.trustedTypes,we=ee?ee.createPolicy("lit-html",{createHTML:i=>i}):void 0,Me="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,Le="?"+w,et=`<${Le}>`,k=document,V=()=>k.createComment(""),F=i=>i===null||typeof i!="object"&&typeof i!="function",fe=Array.isArray,tt=i=>fe(i)||typeof i?.[Symbol.iterator]=="function",de=`[ 	
\f\r]`,z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Se=/-->/g,Ce=/>/g,S=RegExp(`>|${de}(?:([^\\s"'>=/]+)(${de}*=${de}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ke=/'/g,Te=/"/g,Pe=/^(?:script|style|textarea|title)$/i,ge=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),u=ge(1),_t=ge(2),bt=ge(3),_=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),Re=new WeakMap,C=k.createTreeWalker(k,129);function Oe(i,e){if(!fe(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return we!==void 0?we.createHTML(e):e}var rt=(i,e)=>{let t=i.length-1,r=[],s,o=e===2?"<svg>":e===3?"<math>":"",n=z;for(let d=0;d<t;d++){let a=i[d],c,p,l=-1,m=0;for(;m<a.length&&(n.lastIndex=m,p=n.exec(a),p!==null);)m=n.lastIndex,n===z?p[1]==="!--"?n=Se:p[1]!==void 0?n=Ce:p[2]!==void 0?(Pe.test(p[2])&&(s=RegExp("</"+p[2],"g")),n=S):p[3]!==void 0&&(n=S):n===S?p[0]===">"?(n=s??z,l=-1):p[1]===void 0?l=-2:(l=n.lastIndex-p[2].length,c=p[1],n=p[3]===void 0?S:p[3]==='"'?Te:ke):n===Te||n===ke?n=S:n===Se||n===Ce?n=z:(n=S,s=void 0);let g=n===S&&i[d+1].startsWith("/>")?" ":"";o+=n===z?a+et:l>=0?(r.push(c),a.slice(0,l)+Me+a.slice(l)+w+g):a+w+(l===-2?d:g)}return[Oe(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},G=class i{constructor({strings:e,_$litType$:t},r){let s;this.parts=[];let o=0,n=0,d=e.length-1,a=this.parts,[c,p]=rt(e,t);if(this.el=i.createElement(c,r),C.currentNode=this.el.content,t===2||t===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(s=C.nextNode())!==null&&a.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(let l of s.getAttributeNames())if(l.endsWith(Me)){let m=p[n++],g=s.getAttribute(l).split(w),y=/([.?@])?(.*)/.exec(m);a.push({type:1,index:o,name:y[2],strings:g,ctor:y[1]==="."?he:y[1]==="?"?pe:y[1]==="@"?ue:L}),s.removeAttribute(l)}else l.startsWith(w)&&(a.push({type:6,index:o}),s.removeAttribute(l));if(Pe.test(s.tagName)){let l=s.textContent.split(w),m=l.length-1;if(m>0){s.textContent=ee?ee.emptyScript:"";for(let g=0;g<m;g++)s.append(l[g],V()),C.nextNode(),a.push({type:2,index:++o});s.append(l[m],V())}}}else if(s.nodeType===8)if(s.data===Le)a.push({type:2,index:o});else{let l=-1;for(;(l=s.data.indexOf(w,l+1))!==-1;)a.push({type:7,index:o}),l+=w.length-1}o++}}static createElement(e,t){let r=k.createElement("template");return r.innerHTML=e,r}};function M(i,e,t=i,r){if(e===_)return e;let s=r!==void 0?t._$Co?.[r]:t._$Cl,o=F(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,t,r)),r!==void 0?(t._$Co??(t._$Co=[]))[r]=s:t._$Cl=s),s!==void 0&&(e=M(i,s._$AS(i,e.values),s,r)),e}var le=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:r}=this._$AD,s=(e?.creationScope??k).importNode(t,!0);C.currentNode=s;let o=C.nextNode(),n=0,d=0,a=r[0];for(;a!==void 0;){if(n===a.index){let c;a.type===2?c=new W(o,o.nextSibling,this,e):a.type===1?c=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(c=new me(o,this,e)),this._$AV.push(c),a=r[++d]}n!==a?.index&&(o=C.nextNode(),n++)}return C.currentNode=k,s}p(e){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}},W=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=M(this,e,t),F(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==_&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):tt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&F(this._$AH)?this._$AA.nextSibling.data=e:this.T(k.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=G.createElement(Oe(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===s)this._$AH.p(t);else{let o=new le(s,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=Re.get(e.strings);return t===void 0&&Re.set(e.strings,t=new G(e)),t}k(e){fe(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,s=0;for(let o of e)s===t.length?t.push(r=new i(this.O(V()),this.O(V()),this,this.options)):r=t[s],r._$AI(o),s++;s<t.length&&(this._$AR(r&&r._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let r=Ee(e).nextSibling;Ee(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},L=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,s,o){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=h}_$AI(e,t=this,r,s){let o=this.strings,n=!1;if(o===void 0)e=M(this,e,t,0),n=!F(e)||e!==this._$AH&&e!==_,n&&(this._$AH=e);else{let d=e,a,c;for(e=o[0],a=0;a<o.length-1;a++)c=M(this,d[r+a],t,a),c===_&&(c=this._$AH[a]),n||(n=!F(c)||c!==this._$AH[a]),c===h?e=h:e!==h&&(e+=(c??"")+o[a+1]),this._$AH[a]=c}n&&!s&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},he=class extends L{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}},pe=class extends L{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}},ue=class extends L{constructor(e,t,r,s,o){super(e,t,r,s,o),this.type=5}_$AI(e,t=this){if((e=M(this,e,t,0)??h)===_)return;let r=this._$AH,s=e===h&&r!==h||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==h&&(r===h||s);s&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},me=class{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){M(this,e)}};var st=I.litHtmlPolyfillSupport;st?.(G,W),(I.litHtmlVersions??(I.litHtmlVersions=[])).push("3.3.2");var He=(i,e,t)=>{let r=t?.renderBefore??e,s=r._$litPart$;if(s===void 0){let o=t?.renderBefore??null;r._$litPart$=s=new W(e.insertBefore(V(),o),o,void 0,t??{})}return s._$AI(i),s};var K=globalThis,b=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;let e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=He(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _}};b._$litElement$=!0,b.finalized=!0,K.litElementHydrateSupport?.({LitElement:b});var it=K.litElementPolyfillSupport;it?.({LitElement:b});(K.litElementVersions??(K.litElementVersions=[])).push("4.2.2");var ot={attribute:!0,type:String,converter:j,reflect:!1,hasChanged:Z},nt=(i=ot,e,t)=>{let{kind:r,metadata:s}=t,o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),r==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(t.name,i),r==="accessor"){let{name:n}=t;return{set(d){let a=e.get.call(this);e.set.call(this,d),this.requestUpdate(n,a,i,!0,d)},init(d){return d!==void 0&&this.C(n,void 0,i,d),d}}}if(r==="setter"){let{name:n}=t;return function(d){let a=this[n];e.call(this,d),this.requestUpdate(n,a,i,!0,d)}}throw Error("Unsupported decorator location: "+r)};function P(i){return(e,t)=>typeof t=="object"?nt(i,e,t):((r,s,o)=>{let n=s.hasOwnProperty(o);return s.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(s,o):void 0})(i,e,t)}function T(i){return P({...i,state:!0,attribute:!1})}var re={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},H=i=>(...e)=>({_$litDirective$:i,values:e}),O=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,r){this._$Ct=e,this._$AM=t,this._$Ci=r}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var R=class extends O{constructor(e){if(super(e),this.it=h,e.type!==re.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===h||e==null)return this._t=void 0,this.it=e;if(e===_)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;let t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};R.directiveName="unsafeHTML",R.resultType=1;var cr=H(R);var Q=class extends R{};Q.directiveName="unsafeSVG",Q.resultType=2;var De=H(Q);var Ue=H(class extends O{constructor(i){if(super(i),i.type!==re.ATTRIBUTE||i.name!=="class"||i.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(e=>i[e]).join(" ")+" "}update(i,[e]){if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(let r in e)e[r]&&!this.nt?.has(r)&&this.st.add(r);return this.render(e)}let t=i.element.classList;for(let r of this.st)r in e||(t.remove(r),this.st.delete(r));for(let r in e){let s=!!e[r];s===this.st.has(r)||this.nt?.has(r)||(s?(t.add(r),this.st.add(r)):(t.remove(r),this.st.delete(r)))}return _}});var D=["overdue","today","urgent","soon","ok","not_extendable"];function ve(i){return i<0?{type:"overdue",text:`\u2717 ${Math.abs(i)}j de retard`,color:"#b71c1c",bg:"#ffcdd2"}:i===0?{type:"today",text:"\u26A0 Aujourd'hui",color:"#d84315",bg:"#ffe0b2"}:i<=3?{type:"urgent",text:`\u26A0 ${i}j restants`,color:"#d84315",bg:"#ffe0b2"}:i<=7?{type:"soon",text:`\u26A1 ${i}j restants`,color:"#f57f17",bg:"#fff9c4"}:{type:"ok",text:`\u2713 ${i}j restants`,color:"#2e7d32",bg:"#c8e6c9"}}var Be=["11011001100","11001101100","11001100110","10010011000","10010001100","10001001100","10011001000","10011000100","10001100100","11001001000","11001000100","11000100100","10110011100","10011011100","10011001110","10111001100","10011101100","10011100110","11001110010","11001011100","11001001110","11011100100","11001110100","11100101100","11100100110","10110001100","10001101100","10001100110","11010001100","11000101100","11000100110","10110001000","10001101000","10001100010","11010001000","11000101000","11000100010","10110111000","10110001110","10001101110","10111011000","10111000110","10001110110","11101011000","11101000110","11100010110","11011101000","11011100010","11000111010","11101101000","11101100010","11100011010","11101111010","11001000010","11110001010","10100110000","10100001100","10010110000","10010000110","10000101100","10000100110","10110010000","10110000100","10011010000","10011000010","10000110100","10000110010","11000010010","11001010000","11110111010","11000010100","10001111010","10100111100","10010111100","10010011110","10111100100","10011110100","10011110010","11110100100","11110010100","11110010010","11011011110","11011110110","11110110110","10101111000","10100011110","10001011110","10111101000","10111100010","11110101000","11110100010","10111011110","10111101110","11101011110","11110101110","11010000100","11010010000","11010011100","1100011101011"];function Ne(i,e=80){if(!i)return"";let t=[],r=104;t.push(r);let s=r;for(let c=0;c<i.length;c++){let p=i.charCodeAt(c);if(p<32||p>126)continue;let l=p-32;t.push(l),s+=l*(c+1)}t.push(s%103),t.push(106);let o="";for(let c of t)c>=0&&c<Be.length&&(o+=Be[c]);if(!o)return"";let n=2,d=o.length*n,a=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d} ${e}" width="${d}" height="${e}">`;for(let c=0;c<o.length;c++)o[c]==="1"&&(a+=`<rect x="${c*n}" y="0" width="${n}" height="${e}" fill="#000"/>`);return a+="</svg>",a}var at="3.0.4";function qe(){console.info(`%c MEDIATHEQUE-CARD %c ${at} IS INSTALLED `,"color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; background: #c8e6c9; font-weight: bold;")}function se(i,e,t,...r){let s=`%c MEDIATHEQUE-CARD %c [${e}]`,o=["color: white; background: #2e7d32; font-weight: bold;","color: #2e7d32; font-weight: bold;"];console[i](s+" "+t,...o,...r)}var ct=10,dt=2e3,lt=15e3,ie=class{constructor(e,t){this.cardName=e;this.fire=t;this.timer=null;this.count=0}schedule(){if(this.timer||(this.count++,this.count>ct))return;let e=Math.min(dt*this.count,lt);se("info",this.cardName,"Retry %d dans %dms\u2026",this.count,e),this.timer=setTimeout(()=>{this.timer=null,this.fire()},e)}reset(){this.count=0,this.cancel()}cancel(){this.timer&&(clearTimeout(this.timer),this.timer=null)}};var je=N`
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
`;var ze=N`
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
`;var ht={overdue:"En retard",today:"\xC0 rendre aujourd'hui",urgent:"1 \xE0 3 jours restants",soon:"4 \xE0 7 jours restants",ok:"Plus de 7 jours",not_extendable:"D\xE9j\xE0 prolong\xE9"},pt={entity:"Entit\xE9 (sensor)",title:"Titre personnalis\xE9",mode:"Mode",badges:"Filtres par badge",total_entity:'Entit\xE9 du total (mode "due")',card_id:"Identifiant carte"},J=class extends b{constructor(){super(...arguments);this._config={entity:""}}setConfig(t){this._config=t??{entity:""}}createRenderRoot(){return this}render(){if(!this.hass)return u``;let t=[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"title",selector:{text:{}}},{name:"mode",selector:{select:{mode:"dropdown",options:[{value:"all",label:"Tous les emprunts (par membre)"},{value:"due",label:"\xC0 rendre cette semaine"}]}}},{name:"badges",selector:{select:{multiple:!0,options:D.map(r=>({value:r,label:ht[r]??r}))}}},{name:"total_entity",selector:{entity:{domain:"sensor",integration:"mediatheque_veauche"}}},{name:"card_id",selector:{text:{}}}];return u`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${t}
        .computeLabel=${r=>pt[r.name]??r.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_valueChanged(t){let r={...t.detail.value};for(let s of Object.keys(r)){let o=r[s];(o===""||o===void 0||o===null)&&delete r[s],Array.isArray(o)&&o.length===0&&delete r[s]}this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:r},bubbles:!0,composed:!0}))}};$([P({attribute:!1})],J.prototype,"hass",2),$([T()],J.prototype,"_config",2);customElements.get("mediatheque-card-editor")||customElements.define("mediatheque-card-editor",J);var _e="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2252%22 height=%2276%22 viewBox=%220 0 52 76%22%3E%3Crect width=%2252%22 height=%2276%22 fill=%22%23e0e0e0%22 rx=%224%22/%3E%3Ctext x=%2226%22 y=%2242%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%239e9e9e%22%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E",A=class extends b{constructor(){super(...arguments);this._detailLoan=null;this._confirmExtend=null;this._barcodeOpen=!1;this._retry=new ie("card",()=>this.requestUpdate());this._hasRendered=!1;this._openDetail=t=>{this._detailLoan=t};this._closeDetail=()=>{this._detailLoan=null};this._askExtend=t=>{t.extend_url&&(this._confirmExtend={loan:t})};this._closeConfirm=()=>{this._confirmExtend=null};this._confirmExtendNow=()=>{let t=this._confirmExtend?.loan.extend_url;t&&this._hass&&this._hass.callService("mediatheque_veauche","extend_loan",{extend_url:t}),this._confirmExtend=null,this._detailLoan=null};this._openBarcode=()=>{this._barcodeOpen=!0};this._closeBarcode=()=>{this._barcodeOpen=!1};this._onOverlayClick=t=>{t.target===t.currentTarget&&this._closeDetail()};this._onConfirmOverlayClick=t=>{t.target===t.currentTarget&&this._closeConfirm()};this._onBarcodeOverlayClick=t=>{t.target===t.currentTarget&&this._closeBarcode()}}set hass(t){if(this._hass=t,!t||!this._config?.entity)return;let r=t.states[this._config.entity];this._entityState!==r&&(this._entityState=r,this._config.mode==="due"&&this._config.total_entity&&(this._totalEntityState=t.states[this._config.total_entity]),this.requestUpdate())}get hass(){return this._hass}setConfig(t){if(!t||typeof t!="object")throw new Error("Configuration manquante ou invalide");if(!t.entity||typeof t.entity!="string")throw new Error("Vous devez d\xE9finir une entit\xE9 (entity)");if(t.mode!==void 0&&!["all","due"].includes(t.mode))throw new Error("Le champ 'mode' doit valoir 'all' ou 'due'");if(t.badges!==void 0&&!Array.isArray(t.badges))throw new Error("Le champ 'badges' doit \xEAtre une liste");if(Array.isArray(t.badges)){let r=t.badges.filter(s=>!D.includes(s));if(r.length)throw new Error(`Badges inconnus : ${r.join(", ")}. Valides : ${D.join(", ")}`)}this._config={...t,badges:t.badges?.slice()}}static getStubConfig(){return{entity:"",mode:"all"}}static getConfigElement(){return document.createElement("mediatheque-card-editor")}getCardSize(){return this._config?.mode==="due"?3:4}getGridOptions(){return{columns:12,min_columns:6,rows:this._config?.mode==="due"?3:4,min_rows:2}}disconnectedCallback(){super.disconnectedCallback(),this._retry.cancel()}updated(){this._hasRendered&&this.dispatchEvent(new CustomEvent("mediatheque-card-update",{bubbles:!0,composed:!0}))}shouldUpdate(){return!(this._detailLoan||this._confirmExtend||this._barcodeOpen)||!this._hasRendered}render(){let t=this._config?.mode??"all",r=this._config?.title??(t==="due"?"A rendre cette semaine":"M\xE9diath\xE8que de Veauche");if(!this._config)return this._renderLoader(r,"En attente de configuration\u2026");if(!this._hass)return this._renderLoader(r,"Connexion \xE0 Home Assistant\u2026");let s=this._config.entity,o=this._hass.states[s];if(!o||o.state==="unavailable"||o.state==="unknown"){let c=o?`state=${o.state}`:"entity not found";return se("warn","card","%s \u2014 %s %s",s,c,this._hasRendered?"(keeping last render)":"(showing loader)"),this._retry.schedule(),this._hasRendered?this._lastTemplate??this._renderLoader(r):(this._lastTemplate=this._renderLoader(r,"En attente des donn\xE9es\u2026"),this._lastTemplate)}this._retry.reset();let n=this._config.badges??[...D],d=!!this._config.badges,a=t==="due"?this._renderDue(o,n,d,r):this._renderAll(o,n,d,r);return this._lastTemplate=a,this._hasRendered=!0,a}_renderLoader(t,r="Chargement\u2026"){return u`
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
    `}_matchesBadgeFilter(t,r){return r.includes(ve(t.days_left).type)}_renderDue(t,r,s,o){let d=(t.attributes??{}).livres??[],a=s?d.filter(f=>this._matchesBadgeFilter(f,r)):d,c=this._totalEntityState??this._hass?.states[this._config.entity.replace("_due_week","_total")],p=c?parseInt(c.state,10)||0:null,l=(c?.attributes?.card_id??this._config?.card_id??"")||"",m=p!==null?`${a.length} / ${p}`:`${a.length}`,g=a.length>0,y=[...a].sort((f,v)=>(f.days_left??0)-(v.days_left??0));return u`
      <ha-card>
        ${this._renderHeader(o,m,g,l)}
        ${y.length===0?u`<div class="empty-state">Aucun livre à rendre cette semaine</div>`:y.map(f=>this._renderBookRow(f,!0))}
        ${this._renderModals(l)}
      </ha-card>
    `}_renderAll(t,r,s,o){let n=t.attributes??{},d=n.membres??{},a=n.compte??"",c=n.card_id??this._config?.card_id??"",p={},l=0;for(let[f,v]of Object.entries(d)){let U=s?v.filter(oe=>this._matchesBadgeFilter(oe,r)):v;U.length>0&&(p[f]=U,l+=U.length)}let m=Object.keys(p).sort((f,v)=>f===a?-1:v===a?1:f.localeCompare(v)),g=`${l} emprunt${l>1?"s":""}`,y=s&&l>0;return u`
      <ha-card>
        ${this._renderHeader(o,g,y,c)}
        ${m.length===0?u`<div class="empty-state">Aucun emprunt en cours</div>`:m.map(f=>{let v=p[f];if(!v)return h;let U=f===a?"\u{1F464}":"\u{1F466}",oe=[...v].sort((ne,Ie)=>(ne.days_left??0)-(Ie.days_left??0));return u`
                <div class="member-section">
                  <div class="member-header">
                    <span class="member-icon">${U}</span>
                    <span class="member-name">${f}</span>
                    <span class="member-count">${v.length}</span>
                  </div>
                  ${oe.map(ne=>this._renderBookRow(ne,!1))}
                </div>
              `})}
        ${this._renderModals(c)}
      </ha-card>
    `}_renderHeader(t,r,s,o){return u`
      <div class="mediatheque-header">
        <span class="mediatheque-title">${t}</span>
        <span class="header-right">
          <span class=${Ue({"mediatheque-total":!0,highlight:s})}>${r}</span>
          ${o?u`<button
                class="mc-barcode-btn"
                title="Ma carte"
                @click=${this._openBarcode}
              >
                |||
              </button>`:h}
        </span>
      </div>
    `}_renderBookRow(t,r){let s=ve(t.days_left),o=t.cover_url||_e;return u`
      <div class="book-row">
        <div class="book-cover-wrapper" @click=${()=>this._openDetail(t)}>
          <img
            class="book-cover"
            src=${o}
            alt=""
            loading="lazy"
            @error=${n=>{n.target.src=_e}}
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
    `}_renderDetailModal(t){let r=t.cover_url||_e;return u`
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
    `}_renderBarcodeModal(t){let r=Ne(t);return u`
      <div class="mc-barcode-overlay active" @click=${this._onBarcodeOverlayClick}>
        <div class="mc-barcode-dialog">
          <h3>Ma carte</h3>
          <div class="mc-barcode-id">${t}</div>
          <div class="mc-barcode-svg">${De(r)}</div>
          <button class="mc-barcode-close" @click=${this._closeBarcode}>Fermer</button>
        </div>
      </div>
    `}};A.styles=[je,ze],$([P({attribute:!1})],A.prototype,"hass",1),$([T()],A.prototype,"_config",2),$([T()],A.prototype,"_detailLoan",2),$([T()],A.prototype,"_confirmExtend",2),$([T()],A.prototype,"_barcodeOpen",2);qe();window.loadCardHelpers?.();customElements.get("mediatheque-card")||customElements.define("mediatheque-card",A);window.customCards=window.customCards??[];window.customCards.some(i=>i.type==="mediatheque-card")||window.customCards.push({type:"mediatheque-card",name:"M\xE9diath\xE8que de Veauche",description:"Affiche les emprunts de la m\xE9diath\xE8que de Veauche"});export{A as MediathequeCard};
