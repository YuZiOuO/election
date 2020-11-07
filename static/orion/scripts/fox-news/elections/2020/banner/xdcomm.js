/*! updated; 11-06-2020 01:18 AM **/


!function(Cookie,Events){Events.addHandler(setId("set"),function(payload){try{if(!payload)return;var info=JSON.parse(payload.info),curr=JSON.parse(Cookie.get(info.id));(!!Array.isArray(curr)||!(!curr||"object"!=typeof curr||curr.ver===info.ver))&&Cookie.remove(info.id),Cookie.set(info.id,JSON.stringify({data:info.data,ver:info.ver}),{path:"/",expires:365,samesite:"none"})}catch(err){console.log("error parsing my races payload:",err)}}),Events.addHandler(setId("reload"),function(){window.location.reload()});var cookieVal=Cookie.get("FXN_e2020_mr");try{!function(){if(-1<window.location.search.indexOf("_log=1")&&window.console){var args=Array.prototype.slice.call(arguments);args.unshift("[elections.banner.xdcomm]");try{console.log.apply(console,args)}catch(err){console.log(args)}}}("sending cookie:",cookieVal)}catch(err){}function setId(val){return"xdcomm_banner_elec2020."+val}Events.sendMessage("parent",setId("cookie_return"),{data:cookieVal}),Events.sendMessage("parent",setId("ready"),{loc:window.location.href})}(function(){function Cookie(name,value,options){if(void 0===value){var cookieValue=null;if(document.cookie&&""!==document.cookie)for(var cookies=document.cookie.split(";"),i=0;i<cookies.length;i++){var cookie=(cookies[i]||"").replace(/^\s+|\s+$/g,"");if(cookie.substring(0,name.length+1)===name+"="){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break}}return cookieValue}options=options||{},null===value&&(value="",options.expires=-1);var date,expires="";options.expires&&("number"==typeof options.expires||options.expires.toUTCString)&&("number"==typeof options.expires?(date=new Date).setTime(date.getTime()+24*options.expires*60*60*1e3):date=options.expires,expires="; expires="+date.toUTCString());var path=options.path?"; path="+options.path:"",domain=options.domain?"; domain="+options.domain:"",secure=options.secure?"; secure":"",samesite=options.samesite?"; samesite="+options.samesite+"; secure":"";return document.cookie=[name,"=",encodeURIComponent(value),expires,path,domain,secure||samesite].join(""),""}function storagePrefix(id){return"fxn_cstore__"+id}return Cookie.isAvailable=function(){if(navigator.cookieEnabled)return!0;var ret=!1;try{document.cookie="cookietest=1",ret=-1!==document.cookie.indexOf("cookietest="),document.cookie="cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT"}catch(err){ret=!1}return ret},Cookie.set=function(name,value,options){Cookie.isAvailable()&&"string"==typeof name&&Cookie(storagePrefix(name),value,options)},Cookie.get=function(name){return Cookie.isAvailable()&&"string"==typeof name?Cookie(storagePrefix(name)):null},Cookie.remove=function(name){Cookie.isAvailable()&&"string"==typeof name&&Cookie(storagePrefix(name),null)},Cookie}(),function(){var CONST={};CONST.stringify=function(){var ver=!1;if(navigator&&"Microsoft Internet Explorer"===navigator.appName){var ua=navigator.userAgent;null!=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})").exec(ua)&&(ver=parseFloat(RegExp.$1)),ver&&ver<=9&&(ver=!0)}return ver}();function App(){(this.__v={})._handlers={},this.init()}function log(){if(!!(window.location.search&&-1<window.location.search.indexOf("_log=y"))&&window.console)try{return console.log.apply(console,arguments)}catch(err){console.log(arguments)}}return App.prototype.init=function(){var vars=this.__v;vars._messageHandler=function(event){var message=event.data,hasErr=!1;if(CONST.stringify){if(!window.JSON)return log("[EventMessageHandler.send] Requires JSON"),!1;try{message=JSON.parse(message)}catch(err){log("[EventMessageHandler.send] error:"),log(err),hasErr=!0}}if(!hasErr){log("[EventMessageHandler.receive]",message);var type=!(!message||!message.type)&&message.type,data=!(!message||!message.data)&&message.data;type&&data&&vars._handlers[type]&&"function"==typeof vars._handlers[type]&&vars._handlers[type](data)}};try{window.addEventListener("message",vars._messageHandler,!1)}catch(error){window.attachEvent("onmessage",vars._messageHandler)}this.init=function(){}},App.prototype.addHandler=function(type,callback){var vars=this.__v,prefix=vars.config&&"string"==typeof vars.config.prefix?vars.config.prefix:"";if("string"!=typeof type)return!1;type=prefix+type,vars._handlers[type]=callback},App.prototype.sendMessage=function(element,type,data){var vars=this.__v,prefix=vars.config&&"string"==typeof vars.config.prefix?vars.config.prefix:"";if("string"!=typeof type)return!1;var info={type:type=prefix+type,data:data};if(CONST.stringify){if(!window.JSON)return log("[EventMessageHandler.send] Requires JSON"),!1;info=JSON.stringify(info)}if(element&&"string"==typeof element&&"parent"===element)try{window.parent.postMessage(info,"*"),log("[EventMessageHandler] send to parent:",info)}catch(err){log("[EventMessageHandler.send] ERROR:",err)}else if(element&&"string"==typeof element&&"self"===element)try{window.postMessage(info,"*"),log("[EventMessageHandler] send to iframe",info)}catch(err){log("[EventMessageHandler] ERROR:",err)}else if(element&&element.contentWindow)try{element.contentWindow.postMessage(info,"*"),log("[EventMessageHandler] send to iframe",info)}catch(err){log("[EventMessageHandler] ERROR:",err)}},new App}());