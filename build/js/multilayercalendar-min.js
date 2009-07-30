(function(){var D=YAHOO.lang,C=YAHOO.util.Dom,I=YAHOO.util.Event,H=YAHOO.util.Anim,G=YAHOO.util.Easing,B=YAHOO.widget.Calendar;function A(L,K){K=D.merge(K||{},{navigator:false});A.superclass.constructor.call(this,L,K);this._layers={year:null,decade:null};this._layer=this.cfg.getProperty(F.LAYER_INITIAL.key);this._nohover=false}A._LAYERS={MONTH:0,YEAR:1,DECADE:2};A._CLASSES={UP_LINK:"uplink",TOP_UP_LINK:"topuplink",LAYER:"layer",YEAR_LAYER:"year",YEAR_TABLE:"year",MONTH_CELL:"month",THIS_MONTH_CELL:"current",DECADE_LAYER:"decade",DECADE_TABLE:"decade",YEAR_CELL:"year",THIS_YEAR_CELL:"current",OOD_CELL:"ood",HOVER_CELL:"hover"};A._CONFIG_DEFAULTS={LAYER_INITIAL:{key:"layer_initial",value:A._LAYERS.MONTH},LAYER_ZINDEX_BASE:{key:"layer_zindex_base",value:10},LAYER_WIDTH_ADJUST:{key:"layer_width_adjust",value:1},LAYER_HEIGHT_ADJUST:{key:"layer_height_adjust",value:1},LAYER_FADING:{key:"layer_fading",value:true},LAYER_FADE_DURATION:{key:"layer_fade_duration",value:0.2}};var J=A._LAYERS,E=A._CLASSES,F=A._CONFIG_DEFAULTS;A.LAYER_MONTH=J.MONTH;A.LAYER_YEAR=J.YEAR;A.LAYER_DECADE=J.DECADE;A.checkLayer=function(K){return((!isNaN(K))&&J.MONTH<=K&&K<=J.DECADE)};D.extend(A,B,{setupConfig:function(){A.superclass.setupConfig.call(this);var K=this.cfg;K.addProperty(F.LAYER_INITIAL.key,{value:F.LAYER_INITIAL.value,validator:A.checkLayer});K.addProperty(F.LAYER_ZINDEX_BASE.key,{value:F.LAYER_ZINDEX_BASE.value,validator:K.checkNumber});K.addProperty(F.LAYER_WIDTH_ADJUST.key,{value:F.LAYER_WIDTH_ADJUST.value,validator:K.checkNumber});K.addProperty(F.LAYER_HEIGHT_ADJUST.key,{value:F.LAYER_HEIGHT_ADJUST.value,validator:K.checkNumber});K.addProperty(F.LAYER_FADING.key,{value:F.LAYER_FADING.value,validator:K.checkBoolean});K.addProperty(F.LAYER_FADE_DURATION.key,{value:F.LAYER_FADE_DURATION.value,validator:K.checkNumber})},initEvents:function(){A.superclass.initEvents.call(this);this.renderEvent.subscribe(this._onRender,this,true)},_getLayerFrame:function(){var R=C.get(this.id),O=C.getElementsByClassName(B._STYLES.CSS_HEADER_TEXT,"th",R)[0],Q=C.getRegion(R),M=C.getRegion(O),K=M.bottom-M.top,P=this.cfg,S=P.getProperty(F.LAYER_WIDTH_ADJUST.key),N=P.getProperty(F.LAYER_HEIGHT_ADJUST.key),L={};L.left=Q.left-S;L.top=Q.top+K-N;L.width=Q.right-Q.left+2*S;L.height=Q.bottom-Q.top-K+2*N;return L},_createLayer:function(M,N,O){var L=document.createElement("div"),K=this.cfg.getProperty(F.LAYER_ZINDEX_BASE.key);C.addClass(L,E.LAYER);C.addClass(L,M);C.setStyle(L,"position","absolute");C.setStyle(L,"zIndex",K+(O-1));C.setStyle(L,"width",N.width+"px");C.setStyle(L,"height",N.height+"px");C.setStyle(L,"visibility",(O<=this._layer)?"visible":"hidden");return L},_renderYearLayer:function(){YAHOO.log("_renderYearLayer");var M=this.cfg.getProperty("MONTHS_SHORT"),L=new Date(),K=L.getMonth(),S=L.getFullYear(),P=this.cfg.getProperty("pagedate").getFullYear(),R=[],Q,O,N,T;R[R.length]='<table class="'+E.YEAR_TABLE+'">';for(Q=0;Q<3;Q++){R[R.length]="<tr>";for(O=0;O<4;O++){N=4*Q+O;T=(N===K&&P===S?" "+E.THIS_MONTH_CELL:"");R[R.length]='<td class="'+E.MONTH_CELL+" m"+(N+1)+T+'">'+M[N]+"</td>"}R[R.length]="</tr>"}R[R.length]="</table>";return R.join("")},_syncYearLayer:function(){YAHOO.log("_syncYearLayer");var Q=new Date(),N=Q.getMonth(),P=Q.getFullYear(),M=this.cfg.getProperty("pagedate").getFullYear(),O=C.getElementsByClassName(E.MONTH_CELL,"td",this._layers.year),R,L,K;for(R=0,L=O.length;R<L;R++){K=O[R];if(R===N&&M===P){C.addClass(K,E.THIS_MONTH_CELL)}else{C.removeClass(K,E.THIS_MONTH_CELL)}}},_renderDecadeLayer:function(){YAHOO.log("_renderDecadeLayer");var K=new Date(),R=K.getFullYear(),M=this.cfg.getProperty("pagedate").getFullYear(),Q=Math.floor(M/10)*10-1,O=[],N,L,S,P;O[O.length]='<table class="'+E.DECADE_TABLE+'">';for(N=0;N<3;N++){O[O.length]="<tr>";for(L=0;L<4;L++){S=(Q===R?" "+E.THIS_YEAR_CELL:"");P=((N===0&&L===0)||(N===2&&L===3)?" "+E.OOD_CELL:"");O[O.length]='<td class="'+E.YEAR_CELL+S+P+'">'+(Q++)+"</td>"}O[O.length]="</tr>"}O[O.length]="</table>";return O.join("")},_syncDecadeLayer:function(){YAHOO.log("_syncDecadeLayer");var M=new Date(),L=M.getFullYear(),K=this.cfg.getProperty("pagedate").getFullYear(),N=Math.floor(K/10)*10-1;C.getElementsByClassName(E.YEAR_CELL,"td",this._layers.decade,function(O){if(N===L){C.addClass(O,E.THIS_YEAR_CELL)}else{C.removeClass(O,E.THIS_YEAR_CELL)}O.innerHTML=(N++)})},_attachLayer:function(K,M){var L=this.oDomContainer;L.appendChild(K);C.setXY(K,[M.left,M.top])},_showLayer:function(L){YAHOO.log("_showLayer");var K=this.cfg;if(H&&K.getProperty(F.LAYER_FADING.key)){C.setStyle(L,"opacity",0);C.setStyle(L,"visibility","visible");var N=K.getProperty(F.LAYER_FADE_DURATION.key),M=new H(L,{opacity:{to:1}},N,G.easeNone);M.animate()}else{C.setStyle(L,"visibility","visible")}},_hideLayer:function(L){YAHOO.log("_hideLayer");var K=this.cfg;if(H&&K.getProperty(F.LAYER_FADING.key)){var O=K.getProperty(F.LAYER_FADE_DURATION.key),M=new H(L,{opacity:{from:1,to:0}},O,G.easeNone),N=this;M.onComplete.subscribe(function(){C.setStyle(L,"visibility","hidden");N._nohover=false});M.animate()}else{C.setStyle(L,"visibility","hidden");this._nohover=false}},_renderLabel:function(){switch(this._layer){case J.MONTH:return A.superclass.buildMonthLabel.call(this);case J.YEAR:var M=this.cfg.getProperty("pagedate").getFullYear(),N=this.cfg.getProperty("my_label_year_suffix");return M+N;case J.DECADE:var M=this.cfg.getProperty("pagedate").getFullYear(),K=Math.floor(M/10)*10,L=K+9,N=this.cfg.getProperty("my_label_year_suffix"),O=this.cfg.getProperty("date_range_delimiter");return K+N+O+L+N}},_syncLabel:function(){YAHOO.log("_syncLabel");var K=this;C.getElementsByClassName(E.UP_LINK,"a",this.oDomContainer,function(L){if(K._layer===J.DECADE){C.addClass(L,E.TOP_UP_LINK)}else{C.removeClass(L,E.TOP_UP_LINK)}L.innerHTML=K._renderLabel()})},_applyLayerListeners:function(){var K=this;C.getElementsByClassName(E.UP_LINK,"a",this.oDomContainer,function(L){I.on(L,"click",K._onUpLinkClick,K,true)});C.getElementsByClassName(E.MONTH_CELL,"td",this._layers.year,function(L){I.on(L,"mouseover",K._onCellMouseover,K,true);I.on(L,"mouseout",K._onCellMouseout,K,true);I.on(L,"click",K._onMonthCellClick,K,true)});C.getElementsByClassName(E.YEAR_CELL,"td",this._layers.decade,function(L){I.on(L,"mouseover",K._onCellMouseover,K,true);I.on(L,"mouseout",K._onCellMouseout,K,true);I.on(L,"click",K._onYearCellClick,K,true)})},buildMonthLabel:function(){var L=[],K=(this._layer===J.DECADE?" "+E.TOP_UP_LINK:"");L[L.length]='<a class="'+E.UP_LINK+K+'" href="javascript:void(0);">';L[L.length]=this._renderLabel();L[L.length]="</a>";return L.join("")},_onRender:function(){YAHOO.log("_onRender");var L=this._getLayerFrame(),K=this._createLayer(E.YEAR_LAYER,L,J.YEAR),M=this._createLayer(E.DECADE_LAYER,L,J.DECADE);K.innerHTML=this._renderYearLayer();M.innerHTML=this._renderDecadeLayer();this._attachLayer(K,L);this._attachLayer(M,L);this._layers.year=K;this._layers.decade=M;this._applyLayerListeners()},getCurrentLayer:function(){return this._layer},upLayer:function(){YAHOO.log("upLayer");switch(this._layer){case J.MONTH:this._layer++;this.changePageEvent.fire();this._showLayer(this._layers.year);break;case J.YEAR:this._layer++;this.changePageEvent.fire();this._showLayer(this._layers.decade);break}return this._layer},downLayer:function(){YAHOO.log("downLayer");switch(this._layer){case J.YEAR:this.render();this.changePageEvent.fire();this._layer--;this._syncLabel();this._hideLayer(this._layers.year);break;case J.DECADE:this._layer--;this.changePageEvent.fire();this._hideLayer(this._layers.decade);break}return this._layer},doPreviousMonthNav:function(K){switch(this._layer){case J.MONTH:return A.superclass.doPreviousMonthNav.apply(this,arguments);case J.YEAR:I.preventDefault(K);this.previousYear();return ;case J.DECADE:I.preventDefault(K);this.subtractYears(10);return }},doNextMonthNav:function(K){switch(this._layer){case J.MONTH:return A.superclass.doNextMonthNav.apply(this,arguments);case J.YEAR:I.preventDefault(K);this.nextYear();return ;case J.DECADE:I.preventDefault(K);this.addYears(10);return }},onChangePage:function(){YAHOO.log("onChangePage");switch(this._layer){case J.MONTH:return A.superclass.onChangePage.apply(this,arguments);case J.YEAR:this._syncYearLayer();this._syncLabel();return ;case J.DECADE:this._syncDecadeLayer();this._syncLabel();return }},_onCellMouseover:function(K){if(!this._nohover){C.addClass(I.getTarget(K),E.HOVER_CELL)}},_onCellMouseout:function(K){C.removeClass(I.getTarget(K),E.HOVER_CELL)},_onUpLinkClick:function(K){I.preventDefault(K);I.getTarget(K).blur();this.upLayer()},_onMonthCellClick:function(P){var O=I.getTarget(P),L=O.className.match(/m(\d{1,2})/);if(L){var N=parseInt(L[1],10)-1,K=this.cfg.getProperty("pagedate"),M=this;K.setMonth(N);this.cfg.setProperty("pagedate",K);this._nohover=true;C.removeClass(O,E.HOVER_CELL);setTimeout(function(){M.downLayer()},0)}},_onYearCellClick:function(N){var M=I.getTarget(N),L=parseInt(M.innerHTML,10),K=this.cfg.getProperty("pagedate");K.setFullYear(L);this.cfg.setProperty("pagedate",K);this.downLayer()},configNavigator:function(){}});YAHOO.namespace("BLARGON.widget");YAHOO.BLARGON.widget.MultiLayerCalendar=A})();