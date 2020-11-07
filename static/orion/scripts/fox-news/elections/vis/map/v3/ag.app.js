/*! updated; 11-06-2020 01:18 AM **/


Modulr.define("fox-news.elections.map.v3:api",["require","models/state.map/index","models/chart/index","models/house.map/index","models/us.map/index"],function(require){var ChartModel=require("models/chart/index"),StateMapModel=require("models/state.map/index"),HouseMapModel=require("models/house.map/index"),USMapModel=require("models/us.map/index");return new function(){this.VERSION="v3",this.createStateMap=function(target,opts,callback){StateMapModel(target,opts,callback)},this.createHouseChart=function(target,opts,callback){ChartModel(target,opts,"house",callback)},this.createHouseMap=function(target,opts,callback){HouseMapModel(target,opts,callback)},this.createSenateChart=function(target,opts,callback){ChartModel(target,opts,"senate",callback)},this.createSenateMap=function(target,opts,callback){USMapModel(target,opts,callback)},this.createGovernorMap=function(target,opts,callback){USMapModel(target,opts,callback)}}});
Modulr.define("fox-news.elections.map.v3:config",["require"],function(require){var config={SPLIT_STATES:["NE","ME"]};return config});
Modulr.define("fox-news.elections.map.v3:helper",["require","lodash","config","modernizr","core.base:utils/detector"],function(require,_,config,Modernizr){var HAS_TOUCH=!!Modernizr.touchevents,CLICK_EVENT=HAS_TOUCH?"touchend":"mouseup",Detector=require("core.base:utils/detector"),Helper={};return Helper.getCurrentView=Detector.current,Helper.tranformDetails=function(bbox,width,height){bbox.width,bbox.height;function getDim(val){return[bbox.width*val,bbox.height*val]}for(var scaleY=height/bbox.height,scaleX=width/bbox.width,scale=bbox.width>bbox.height?scaleX:scaleY,dimScale=getDim(scale);dimScale[0]>width||dimScale[1]>height;)dimScale=getDim(scale-=.02);var dim,vals,diff,translateVal=[bbox.x*scale,bbox.y*scale];return vals=translateVal,diff=[width/2-(dim=dimScale)[0]/2,height/2-dim[1]/2],vals[0]=vals[0]-diff[0],vals[1]=vals[1]-diff[1],(translateVal=vals)[0]=-1*translateVal[0],translateVal[1]=-1*translateVal[1],{translateX:translateVal[0],translateY:translateVal[1],translate:translateVal.join(","),scale:scale}},Helper.log=function(){var args=Array.prototype.slice.call(arguments);args=["[FOX.Maps]"].concat(args);try{return console.log.apply(console,args)}catch(err){console.log(args)}},Helper.throwError=function(){var args=Array.prototype.slice.call(arguments),str=["[FOX.Maps]"].concat(args).join(" ");throw new Error(str)},Helper.randomizeArrayLengthPosition=function(len){for(var arr=[],rand=[],i=0;i<len;i++)arr.push(i);for(;0<arr.length;)if(1===arr.length)rand.push(arr.shift());else{var r=Helper.geenrateRandomNumber(0,arr.length-1),val=arr.splice(r,1)[0];rand.push(val)}return rand},Helper.geenrateRandomNumber=function(min,max){return Math.floor(Math.floor(Math.random()*(max-min)+1)+min)},Helper.hexToRgb=function(hex){hex=hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(m,r,g,b){return r+r+g+g+b+b});var result=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),ret=hex;return result&&(ret="rgb("+[parseInt(result[1],16),parseInt(result[2],16),parseInt(result[3],16)].join(", ")+")"),ret},Helper.isSplitState=function(code){return-1<_.indexOf(config.SPLIT_STATES,code)},Helper.isIESpecial=function(){return!("Microsoft Internet Explorer"!==navigator.appName&&!navigator.userAgent.match(/Trident/)&&!navigator.userAgent.match(/rv 11/))},Helper.isIE=function(){return-1!==navigator.userAgent.indexOf("MSIE")||0<window.navigator.appVersion.indexOf("Trident/")},Helper.isNotAndroid=function(){return-1===navigator.userAgent.toLowerCase().indexOf("android")},Helper.getAspectHeight=function(width,ratio){return ratio=ratio||[4,3],Math.round(width/ratio[0])*ratio[1]},Helper.getChartAspectHeight=function(width,ratio){return ratio=ratio||[2,1],Math.round(width/ratio[0])*ratio[1]},Helper.pointer=function(node,callback){function trigger(self,d){once||(once=!0,setTimeout(function(){once=!1},25),callback(self,d))}var once=!1;node.on("mouseup",function(d){trigger(this,d)}),HAS_TOUCH&&node.on(CLICK_EVENT,function(d){trigger(this,d)})},Helper.triggerEvent=function(type,node){function dispatch(evt){if(document.createEventObject)node.fireEvent(evt);else{var event=document.createEvent("HTMLEvents");event.initEvent(evt,!0,!0),node.dispatchEvent(event)}}"pointer"===type?(dispatch("mouseup"),dispatch(CLICK_EVENT)):dispatch(type)},Helper.getParty=function(code){var type=null;switch(code){case"R":type="rep";break;case"D":type="dem";break;case"I":type="ind";break;default:type="oth"}return type},Helper});
Modulr.define("fox-news.elections.map.v3:main",["require","helper"],function(require,Helper){});
Modulr.define("fox-news.elections.map.v3:models/chart/index",["require","jquery","lodash","config","helper","models/chart/info","core.plugins:ElementResizeListener","core.base:utils/promise"],function(require,$,_,config,Helper){function App(holder,opts,type){holder.html(opts.ChartSVG);var Canvas="house"===type?holder.find("#seating-chart-house"):holder.find("#seating-chart-senate"),SEATS=Canvas.find("g[id*=row-]"),SEATS_INFO=getInfo(SEATS);(opts=_.cloneDeep(opts||{})).selection="boolean"!=typeof opts.selection||opts.selection,opts.hideHover="boolean"==typeof opts.hideHover&&opts.hideHover,opts.eventsDisabled="boolean"==typeof opts.eventsDisabled&&opts.eventsDisabled,opts.chartId=type;var Instance=Canvas,TRIGGER_STACK={},EVENT_TRIGGERS={};opts.chartId,CHART_ID_ITER++;var CHART_ID=" house"===type?"fox-chart-house-"+CHART_ID_ITER:"fox-chart-senate"+CHART_ID_ITER;function addTrigger(type,callback){if("function"!=typeof callback)return!1;TRIGGER_STACK[type]||(TRIGGER_STACK[type]=[]),TRIGGER_STACK[type].push(callback)}function resizeSVG(width){holder.find("svg").css({width:width,height:Helper.getChartAspectHeight(width)})}holder.attr("id",CHART_ID),this.getChartId=function(){return CHART_ID},this.colorize=function(data){return new PromiseUtil(function(resolve,reject){function set(){!function(seatInfo,data){_.isArray(data)?function(){for(var i=0;i<data.length;i++){var val=data[i],s=(i+1).toString(),item=seatInfo[s]||null;item.elem&&item.elem.css("fill",val)}}():_.isObject(data)&&function(){for(var i in data){var val=data[i],item=Instance.ITEMS[i-1]||null;item&&item.attr("class","seat "+val)}}()}(SEATS_INFO,data),resolve()}!(!Instance||!Instance.ready)?set():addTrigger("ready",function(){set()})})},this.event={ready:function(callback){"function"==typeof callback&&(Instance&&Instance.ready?callback(Instance):addTrigger("ready",callback))},trigger:function(type,callback){EVENT_TRIGGERS[type]&&EVENT_TRIGGERS[type](callback)}};var ResizeListener=new ElementResizeListener({elm:holder,min:[200],max:[1900,1080]});Helper.isIESpecial()&&(ResizeListener.API.getCurrentSize(function(dim){resizeSVG(dim[0])}),ResizeListener.API.onWindowResize(function(dim){resizeSVG(dim[0])})),EVENT_TRIGGERS.resize=function(callback){ResizeListener.API.getCurrentSize(function(dim){resizeSVG(dim[0]),"function"==typeof callback&&callback()})}}var PromiseUtil=require("core.base:utils/promise"),ElementResizeListener=require("core.plugins:ElementResizeListener"),getInfo=require("models/chart/info"),CHART_ID_ITER=0;return function(target,opts,type,callback){opts=opts||{},require(["libs/data/"+type+".chart.svg"],function(ChartSVG){var model=new App(target,_.merge(opts,{ChartSVG:ChartSVG}),type);callback(model)})}});
Modulr.define("fox-news.elections.map.v3:models/chart/info",["require","jquery"],function(require,$){return function(Canvas){var info={};return Canvas.find("ellipse").each(function(){var el=$(this),id=el.attr("id").replace("_","").replace(/^00+/,"").replace(/^0+/,"");!function(id){info[id]||(info[id]=function(id){return{seatNum:id,elem:{}}}(id))}(id),info[id].elem=el}),info}});
Modulr.define("fox-news.elections.map.v3:models/house.map/colorize",["require"],function(require){return function(Canvas,STATE_INFO){this.set=function(data){for(var state=data.code,districts=data.districts,i=0;i<districts.length;i++){var distData=districts[i],code=state+"-"+(distData.fips<10?"0"+distData.fips:distData.fips);if(STATE_INFO[code]){var elem=STATE_INFO[code].elem;distData.fill&&elem&&elem.css("fill",distData.fill)}}}}});
Modulr.define("fox-news.elections.map.v3:models/house.map/index",["require","jquery","helper","lodash","models/house.map/info","models/house.map/colorize","core.plugins:ElementResizeListener"],function(require,$,Helper,_){function App(target,opts){target.html(opts.MapSVG);var Canvas=target.find("#house-map");Canvas.attr("preserveAspectRatio","xMidYMid meet");var Event,STATES_INFO=getInfo(Canvas),TRIGGER_STACK={},EVENTS_INFO={},Colorize=new ColorizeModel(Canvas,STATES_INFO);function resizeSVG(width){target.find("svg").css({width:width,height:Helper.getChartAspectHeight(width)})}this.colorize=function(districtData){Colorize.set(districtData)},this.event=((Event={}).ready=function(callback){"function"==typeof callback&&(Canvas&&Canvas.ready?callback(Canvas):function(type,callback){"function"==typeof callback&&(TRIGGER_STACK[type]||(TRIGGER_STACK[type]=[]),TRIGGER_STACK[type].push(callback))}("ready",callback))},Event.trigger=function(type,callback){EVENTS_INFO[type]&&EVENTS_INFO[type](callback)},Event);var ResizeListener=new ElementResizeListener({elm:target,min:[200],max:[1900,1080]});Helper.isIESpecial()&&(ResizeListener.API.getCurrentSize(function(dim){resizeSVG(dim[0])}),ResizeListener.API.onWindowResize(function(dim){resizeSVG(dim[0])})),EVENTS_INFO.resize=function(callback){ResizeListener.API.getCurrentSize(function(dim){resizeSVG(dim[0]),"function"==typeof callback&&callback()})}}var getInfo=require("models/house.map/info"),ColorizeModel=require("models/house.map/colorize"),ElementResizeListener=require("core.plugins:ElementResizeListener");return function(target,opts,callback){opts=opts||{},require(["libs/data/house.map.svg"],function(MapSVG){var model=new App(target,_.merge(opts,{MapSVG:MapSVG}));callback(model)})}});
Modulr.define("fox-news.elections.map.v3:models/house.map/info",["require","jquery"],function(require,$){return function(Canvas){var info={};return Canvas.find("path").each(function(){var el=$(this),fips=el.attr("id");!function(el,key){el.attr("data-uid",key)}(el,fips);!function(id,val){info[id]||(info[id]=function(id,val){return{stateCode:id,elem:val}}(id,val))}(fips,el)}),info}});
Modulr.define("fox-news.elections.map.v3:models/state.map/colorize",["require"],function(require){return function(Canvas,COUNTY_INFO){this.set=function(countyCode,props){if(props=props||{},COUNTY_INFO[countyCode]){var elem=COUNTY_INFO[countyCode].elem;props.fill&&elem.county&&elem.county.css("fill",props.fill)}}}});
Modulr.define("fox-news.elections.map.v3:models/state.map/index",["require","jquery","helper","lodash","models/state.map/info","models/state.map/colorize","models/state.map/tooltip"],function(require,$,Helper,_){function App(target,opts){$(".infographic .state-info");var Canvas=$(opts.StateSVG);Canvas.attr("preserveAspectRatio","xMidYMid meet"),target.prepend(Canvas);var COUNTY_INFO=getInfo(Canvas),EVENTS_INFO={},Colorize=new ColorizeModel(Canvas,COUNTY_INFO),Tooltip=new TooltipModel(Canvas,COUNTY_INFO);!function(){function set(county){var uid=county.countyCode;county.elem.group.forEach(function(el){el.hover(function(){hovering=!0,curr!==uid&&Tooltip.show(uid),curr=uid},function(){hovering=!1,setTimeout(function(){hovering||(Tooltip.hide(),curr=null)},200)})})}var counties=COUNTY_INFO,curr=null,hovering=!1;for(var id in counties)set(counties[id])}(),this.on=function(eventName,callback){if("function"==typeof callback){-1!==["hover","click"].indexOf(eventName)&&function(name,callback){EVENTS_INFO[name]||(EVENTS_INFO[name]={callbacks:[]});EVENTS_INFO[name].callbacks.push(callback)}(eventName,callback)}},this.colorize=function(countyCode,props){Colorize.set(countyCode,props)},this.tooltip=function(data,pollClose,pollData){Tooltip.setData(data,pollClose,pollData)}}var getInfo=require("models/state.map/info"),ColorizeModel=require("models/state.map/colorize"),TooltipModel=require("models/state.map/tooltip");return function(target,opts,callback){(opts=opts||{}).state=opts.stateCode||$("body").data("state-code").toLowerCase(),opts.stateCode&&require(["libs/data/state/"+opts.stateCode.toLowerCase()],function(StateSVG){var model=new App(target,_.merge(opts,{StateSVG:StateSVG}));callback(model)})}});
Modulr.define("fox-news.elections.map.v3:models/state.map/info",["require","jquery"],function(require,$){return function(Canvas){var info={};return Canvas.find("path").each(function(){var el=$(this),id=function(el,key,type){var val=(el.attr(key)||"").replace("FIPS ","");return el.attr("data-uid",val),el.attr("data-elem-type",type),val}(el,"data-name","name");!function(id,val){info[id]||(info[id]=function(id){return{countyCode:id,elem:{}}}(id));info[id].elem.group||(info[id].elem.group=[]);info[id].elem.group.push(val)}(id,el),info[id].elem.county=el}),info}});
Modulr.define("fox-news.elections.map.v3:models/state.map/tooltip",["require","jquery","lodash","helper","core.base:utils/detector","core.plugins:DateTime"],function(require,$,_,Helper){return function(){var COUNTY_DATA,pollsClosed,pollData,Detector=require("core.base:utils/detector"),contain=(require("core.plugins:DateTime"),$(".infographic")),mapHolder=($("body").data("state-code").toLowerCase(),contain.find("#state")),target=contain.find(".state-info");this.setData=function(data,dataMode,polls){COUNTY_DATA=data,pollsClosed=dataMode,pollData=polls},this.show=function(countyCode){if(COUNTY_DATA[countyCode]){var info=COUNTY_DATA[countyCode],table=contain.find(".state-info"),title=table.find(".tip__title"),candidateTarget=table.find(".tip__candidates"),polls=table.find(".tip__polls"),percentIn=(polls.find(".tip__time"),polls.find(".tip__reporting")),countyName=info.details.name,pctReporting=info.precinctsReporting.precinctsReporting.val;pollData.close,pollData.status;percentIn.text("Reporting "+pctReporting+"% in"),title.text(countyName);candidateTarget.html(function(){for(var candidateArr=[],candidates=info.candidateListOrdered,i=0;i<2;i++){var percent,cand=candidates[i],party=cand.candidate.partyCode,votes=pollsClosed?cand.votesDisplay.count:"-",incumbent=cand.isIncumbent?'<span class="icon incumbent">"Incumbent"</span>':"";percent=pollsClosed?cand.votes.percentage<1&&0<cand.votes.percentage?"<1%":"mobile"===Detector.current()?Math.floor(cand.votes.percentage)+"%":cand.votesDisplay.percentage:"-",candidateArr.push('<div class="tip__row" >                    <div class="tip__name" data-party='+party+" data-npid="+cand.candidate.npid+">"+cand.candidateDisplay.opt1+incumbent+'</div>                      <div class="tip__votes">'+votes+'</div>                    <div class="tip__percent">'+percent+"</div>                  </div>")}return candidateArr.join("")}),target.addClass("show")}},this.hide=function(){target.removeClass("show")},contain.mousemove(function(e){var mapPosition=mapHolder.position(),mapWidth=mapHolder.width(),mapHeight=mapHolder.outerHeight(!0),viewport=$(window).width(),tooltipHt=target.height(),top=e.pageY+tooltipHt;1024<viewport?(e.pageY>mapPosition.top+mapHeight/3*2?target.css({top:(e.pageY-mapPosition.top)/2}):target.css({top:top-(mapPosition.top+50)}),mapWidth-e.pageX<mapWidth/2?target.css({left:"auto",right:(mapPosition.left+mapWidth+5-e.pageX)/2}):target.css({right:"auto",left:e.pageX-(mapPosition.left-12)})):viewport<1024&&(e.pageY>mapPosition.top+mapHeight/2?target.css({top:(e.pageY-mapPosition.top)/3-40}):target.css({top:e.pageY-mapPosition.top+40}),mapWidth-e.pageX<mapWidth/2?target.css({left:"auto",right:(mapPosition.left+mapWidth+5-e.pageX)/2}):target.css({right:"auto",left:e.pageX-(mapPosition.left-12)}))}),contain.mouseleave(function(){target.removeClass("show")})}});
Modulr.define("fox-news.elections.map.v3:models/us.map/colorize",["require","jquery"],function(require,$){return function(Canvas,STATES_INFO){this.set=function(state,data){state=state||data.state;var props=data.results?data.results[0]:data;if(STATES_INFO[state]){var elem=STATES_INFO[state].elem,small=elem.small||elem.mobile;if(props.fill&&(elem.state&&elem.state.css("fill",props.fill),small&&small.find("> circle").css("fill",props.fill)),props.textColor&&(elem.name&&elem.name.css("fill",props.textColor),small)){var stateName=small.attr("id").replace("state-","").toUpperCase(),target=$("#state-initials").find(".state-initial[data-state="+stateName+"]");0<props.fill.indexOf("lean")||0<props.fill.indexOf("runoff")?(target.css("fill","#ffffff"),target.css("text-shadow","4px 0px #222, -4px 0px #222, 0px 4px #222, 2px -3px #222, 4px 4px #222, -2px -3px #222, -2px 4px #222, 4px 3px #222")):(target.css("fill",props.textColor),target.css("text-shadow",""))}}}}});
Modulr.define("fox-news.elections.map.v3:models/us.map/index",["require","jquery","helper","lodash","models/us.map/info","models/us.map/colorize","models/us.map/tooltip","core.plugins:ElementResizeListener"],function(require,$,Helper,_){function App(target,opts){$(".infographic .state-info");var str="mobile"===viewport?"-mobile":"";target.html(opts.MapSVG);var Canvas=target.find("#map"+str);Canvas.attr("preserveAspectRatio","xMidYMid meet");var Event,STATES_INFO=getInfo(Canvas),EVENTS_INFO={},TRIGGER_STACK={},Colorize=new ColorizeModel(Canvas,STATES_INFO),Tooltip=new TooltipModel(Canvas,STATES_INFO);function resizeSVG(width){target.find("svg").css({width:width,height:Helper.getChartAspectHeight(width)})}!function(){function set(state){var uid=state.stateCode,elem=state.elem;elem.group.forEach(function(el){el.hover(function(){hovering=!0,curr!==uid&&(Tooltip.show(uid),function(name,data){EVENTS_INFO[name]&&EVENTS_INFO[name].callbacks&&EVENTS_INFO[name].callbacks.forEach(function(cb){cb(data)})}("hover",{stateCode:uid})),curr=uid},function(){hovering=!1,setTimeout(function(){hovering||(Tooltip.hide(uid),curr=null)},200)})}),elem.small&&"DC"!==uid&&(elem.small.hover(function(){elem.state.addClass("hover")},function(){elem.state.removeClass("hover")}),elem.state.hover(function(){elem.small.addClass("hover")},function(){elem.small.removeClass("hover")}))}var states=STATES_INFO,curr=null,hovering=!1;for(var id in states)set(states[id])}(),this.colorize=function(stateCode,props){Colorize.set(stateCode,props)},this.tooltip=function(state,data,admin){Tooltip.setData(state,data,admin)},this.event=((Event={}).ready=function(callback){"function"==typeof callback&&(Canvas&&Canvas.ready?callback(Canvas):function(type,callback){"function"==typeof callback&&(TRIGGER_STACK[type]||(TRIGGER_STACK[type]=[]),TRIGGER_STACK[type].push(callback))}("ready",callback))},Event.trigger=function(type,callback){EVENTS_INFO[type]&&EVENTS_INFO[type](callback)},Event);var ResizeListener=new ElementResizeListener({elm:target,min:[200],max:[1900,1080]});Helper.isIESpecial()&&(ResizeListener.API.getCurrentSize(function(dim){resizeSVG(dim[0])}),ResizeListener.API.onWindowResize(function(dim){resizeSVG(dim[0])})),EVENTS_INFO.resize=function(callback){ResizeListener.API.getCurrentSize(function(dim){resizeSVG(dim[0]),"function"==typeof callback&&callback()})}}var getInfo=require("models/us.map/info"),ColorizeModel=require("models/us.map/colorize"),TooltipModel=require("models/us.map/tooltip"),ElementResizeListener=require("core.plugins:ElementResizeListener"),viewport=Helper.getCurrentView();return function(target,opts,callback){opts=opts||{},require(["libs/data/us"+("mobile"===viewport?".mobile":"")+".map.svg"],function(MapSVG){var model=new App(target,_.merge(opts,{MapSVG:MapSVG}));callback(model)})}});
Modulr.define("fox-news.elections.map.v3:models/us.map/info",["require","jquery"],function(require,$){return function(Canvas){var info={};function group(id,val){info[id]||(info[id]=function(id){return{stateCode:id,elem:{}}}(id)),info[id].elem.group||(info[id].elem.group=[]),info[id].elem.group.push(val)}function setAttr(el,key,type){var normKey="small"===type?"bubble-"+key:key,val=(el.attr(normKey)||"").toUpperCase();return el.attr("data-uid",key),el.attr("data-elem-type",type),val}return Canvas.find("#state-shapes > polygon").each(function(){var el=$(this),id=setAttr(el,"id","state");group(id,el),info[id].elem.state=el}),Canvas.find("#state-shapes > path").each(function(){var el=$(this),id=setAttr(el,"id","state");group(id,el),info[id].elem.state=el}),Canvas.find("#state-names > path").each(function(){var el=$(this),id=setAttr(el,"data-name","name");group(id,el),info[id].elem.name=el}),Canvas.find("#small-states > g").each(function(){var el=$(this),state=el.attr("id").replace("bubble-","").toUpperCase();el.attr("id");group(state,el),info[state].elem.small=el}),Canvas.parent().hasClass("mobile")&&Canvas.find("#bubbles > g").each(function(){var el=$(this),state=el.attr("id").replace("state-","").toUpperCase();el.attr("id");group(state,el),info[state].elem.mobile=el}),info}});
Modulr.define("fox-news.elections.map.v3:models/us.map/tooltip",["require","jquery","lodash","helper","core.base:utils/detector","core.plugins:DateTime"],function(require,$,_,Helper){return function(){var STATE_DATA,FEED_ADMIN_DATA,Proto=this,DateTime=(require("core.base:utils/detector"),require("core.plugins:DateTime")),INIT=!1,contain=$(".infographic"),mapHolder=contain.find("#map"),table=contain.find(".state-info");function renderFlippedData(data){var flipped=data.isFlipped,winner=data.winner,isFlipped=!(!flipped||!winner),flipParty=isFlipped&&winner[0].partyCode,flipClass="D"===flipParty?"icon-flipped-rep-dem":"R"===flipParty&&"icon-flipped-dem-rep";return!(!isFlipped||!flipClass)&&'<div class="icon icon-flipped '+flipClass+'"></div>'}function renderElectionMode(adminInfo,stateInfo){var mode=!1;return"pre"===adminInfo||"pre"!==adminInfo&&"pre"===stateInfo||!stateInfo?mode="pre":"open"===stateInfo?mode="during":"post"===stateInfo&&(mode="closed"),mode}function renderCandidates(mode,table,data){var markup=[],obj=[];table.removeClass().addClass("tip__title");var candData=data.results;return candData=candData.slice(0,2),$.each(candData,function(index,cand){var name=cand.candidateDisplay.opt1,partyS="D"===cand.partyCode||"R"===cand.partyCode||"I"===cand.partyCode?cand.partyCode:"O",partyL=Helper.getParty(cand.partyCode),npid=cand.candidate.npid,incumbent=cand.isIncumbent?'<span class="icon icon-incumbent"><span class="is-short">In</span></span>':"",votes="pre"===mode?"-":cand.votes.count?cand.votesDisplay.count:0,pct="pre"===mode?"-":cand.votes.percentage&&0!==cand.votes.percentage?cand.votesDisplay.percentage:"0%",winner="pre"===mode?"":data.isRunoff&&cand.isWinner?"":cand.isWinner?"tip__winner__"+partyL:"",isRunoff=data.isRunoff&&cand.isWinner?'<span class="icon icon-runoff"><span class="is-short">RO</span></span>':"";obj.candidateName=name,obj.party=partyS,obj.npid=npid,obj.incumbent=incumbent,obj.votes=votes,obj.percent=pct,obj.winner=winner,obj["win-party"]=partyL,obj.runoff=isRunoff,!data.isRunoff&&cand.isWinner&&table.attr("data-winner",partyL).addClass(winner);var newTemplate=_.template('<div class="tip__row <%= winner %>">          <div class="tip__name" data-party=<%= party %> data-npid=<%= npid %>> <%= candidateName %> <%= incumbent %> <%= runoff %></div>            <div class="tip__votes"><%= votes %></div>          <div class="tip__percent"><%= percent %></div>        </div>');markup.push(newTemplate(obj))}),markup=markup.join("")}function renderPollData(target,stateInfo,mode){var pollTimes=stateInfo.stateAdminInfo.pollTimes,polls=("pre"===FEED_ADMIN_DATA.electionMode()||pollTimes.status,target.find(".tip__polls")),time=polls.find(".tip__time"),percentIn=polls.find(".tip__reporting"),pollClass="pre"===mode?"":"during"===mode?"is-open":"is-closed",open=pollTimes.open?DateTime(pollTimes.open,"${hr}:${min} ${ampm} ET"):"TBD",close=pollTimes.close?DateTime(pollTimes.close,"${hr}:${min} ${ampm} ET"):"TBD",pollStatus="pre"===mode?"Polls open at "+open:"during"===mode?"Polls close at "+close:"Polls are closed";"pre"!==mode?percentIn.text("Reporting "+stateInfo.expectedPercentage+"% in").removeClass("hide"):percentIn.text("").addClass("hide"),polls.removeClass("is-open is-closed").addClass(pollClass),time.html(pollStatus)}Proto.setData=function(state,data,adminData){STATE_DATA=data,FEED_ADMIN_DATA=adminData,table.attr("data-state")===state&&Proto.show(state)},Proto.show=function(stateCode){if(STATE_DATA&&STATE_DATA[stateCode]){var specialElection=1<STATE_DATA[stateCode].length,specialData="AZ"===stateCode?1:0;table.attr("data-special",specialData),1<STATE_DATA[stateCode].length&&!INIT&&(Proto.setSpecial(),INIT=!0),Proto.render(stateCode,specialElection)}else table.removeClass("show")},Proto.hide=function(){table.removeClass("show")},Proto.setSpecial=function(){table.append('<div id="tooltip-2" class="tip state-info" data-special=1>             <div class="tip__title">               <div class="tip__state"></div>               <span class="icon icon-special">                  <span class="is-short">*</span>               </span>               <div class="tip__ev"></div>             </div>             <div class="tip__candidates"></div>             <div class="tip__row tip__polls">               <div class="tip__time"></div>               <div class="tip__reporting"></div>             </div>           </div>         </div>')},Proto.render=function(stateCode,special){var cmd=special?"addClass":"removeClass";table.find("#tooltip-2")[cmd]("show");for(var i=0;i<STATE_DATA[stateCode].length;i++){var target=0<i?table.find("#tooltip-2"):table;target.attr("data-state",stateCode);STATE_DATA[stateCode];var info=STATE_DATA[stateCode][i],holder=target.find(".tip__title"),feedMode=FEED_ADMIN_DATA.electionMode(),stateName=info.stateAdminInfo.name,mode=renderElectionMode(feedMode,FEED_ADMIN_DATA.stateInfo(stateCode).pollTimes.status),candMarkup=renderCandidates(mode,holder,info),isFlipped=(renderPollData(target,info,mode),renderFlippedData(info)),candidateTarget=target.find(".tip__candidates");target.find(".tip__state").text(stateName),"1"===target.attr("data-special")&&0===holder.find(".icon-special").length?holder.append('<span class="icon icon-special"><span class="is-short">*</span></span>'):"0"===target.attr("data-special")&&holder.find(".icon-special").remove(),info.isFlipped&&holder.find(".icon-flipped").length<1?holder.append(isFlipped):info.isFlipped||holder.find(".icon-flipped").remove(),candidateTarget.html(candMarkup),target.addClass("show")}},mapHolder.mousemove(function(e){var res,mapPos=mapHolder.position(),mapWidth=contain.width(),viewW=$(window).width(),top=($(window).height(),e.pageX,e.pageY+table.outerHeight(!0)),css={};_.merge(css,{left:(res=e.pageX-(mapPos.left-40),viewW/2<e.pageX&&(res="auto"),res),right:function(){var res=mapPos.left+mapWidth+40-e.pageX;return viewW/2>=e.pageX&&(res="auto"),res}(),top:top-(mapPos.top+100)}),table.css(css)}),mapHolder.mouseleave(function(e){table.removeClass("show")})}});
!function(Modulr,FNC){if(Modulr.getInstance("fox-news.elections.map.v3"))return;var Instance=Modulr.config({instance:"fox-news.elections.map.v3",baseDomain:FNC.CDN.domain,baseUrl:"/static/orion/scripts/fox-news/elections/vis/map/v3/app",masterFile:"/static/orion/scripts/core/utils/modulr/master.js",packages:["core.plugins"],paths:{"@data":"libs/data"},shim:{jquery:{src:"/static/orion/scripts/core/utils/jquery/core.js",exports:"jQuery"},lodash:{src:"/static/orion/scripts/core/utils/lodash.js",exports:"_"},modernizr:{src:"/static/orion/scripts/core/utils/modernizr.js",exports:"Modernizr"},d3:{src:"/static/orion/scripts/fox-news/elections/vis/map/v3/app/libs/d3.js",exports:"d3"}}});Instance.define("ENV.PROD",[],function(){return"prod"===FNC.CDN.env}),Instance.define("ENV",[],function(){return FNC.CDN.env}),Instance.define("ENV_STATIC_DOMAIN",[],function(){return FNC.CDN.domain}),Instance.require(["main"])}(window.Modulr,window.FNC);