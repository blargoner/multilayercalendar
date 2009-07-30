/**
* The multi-layer calendar provides year and decade navigation layers
* on top of standard month display.
* 
* @module multilayercalendar
* @requires yahoo, dom, event, animation, calendar
*/
(function() {
	var Lang = YAHOO.lang,
		Dom = YAHOO.util.Dom,
		Event = YAHOO.util.Event,
		Anim = YAHOO.util.Anim,
		Easing = YAHOO.util.Easing,
		Calendar = YAHOO.widget.Calendar;
	
	/**
	* The MultiLayerCalendar class implements the multi-layer calendar.
	* @namespace YAHOO.BLARGON.widget
	* @class MultiLayerCalendar
	* @extends YAHOO.widget.Calendar
	* @constructor
	* @param {String | HTMLElement} ctr HTML container element
	* @param {Object} cfg Configuration attributes
	*/
	function MultiLayerCalendar(ctr, cfg) {
		// Disable CalendarNavigator
		cfg = Lang.merge(cfg || {}, { navigator: false });
		
		// Call parent constructor
		MultiLayerCalendar.superclass.constructor.call(this, ctr, cfg);
		
		/**
		* Layer container DOM references
		* @property _layers
		* @private
		* @type Object
		*/
		this._layers = {
			year: null,
			decade: null
		};
		
		/**
		* Current layer
		* @property _layer
		* @private
		* @type Number
		*/
		this._layer = this.cfg.getProperty(_CONFIG.LAYER_INITIAL.key);
		
		/**
		* Temporarily prevents hover state on layer cells (see _onMonthCellClick)
		* @property _nohover
		* @private
		* @type Boolean
		*/
		this._nohover = false;
	}
	
	/**
	* Layer constants
	* @property _LAYERS
	* @private
	* @static
	* @final
	* @type Object
	*/
	MultiLayerCalendar._LAYERS = {
		MONTH: 0,
		YEAR: 1,
		DECADE: 2
	};
	
	/**
	* HTML classes
	* @property _CLASSES
	* @private
	* @static
	* @final
	* @type Object
	*/
	MultiLayerCalendar._CLASSES = {
		UP_LINK: 'uplink',
		TOP_UP_LINK: 'topuplink',
		LAYER: 'layer',
		YEAR_LAYER: 'year',
		YEAR_TABLE: 'year',
		MONTH_CELL: 'month',
		THIS_MONTH_CELL: 'current',
		DECADE_LAYER: 'decade',
		DECADE_TABLE: 'decade',
		YEAR_CELL: 'year',
		THIS_YEAR_CELL: 'current',
		OOD_CELL: 'ood',
		HOVER_CELL: 'hover'
	};
	
	/**
	* Default configuration values
	* @property _CONFIG_DEFAULTS
	* @private
	* @static
	* @final
	* @type Object
	*/
	MultiLayerCalendar._CONFIG_DEFAULTS = {
		LAYER_INITIAL: { key: 'layer_initial', value: MultiLayerCalendar._LAYERS.MONTH },
		LAYER_ZINDEX_BASE: { key: 'layer_zindex_base', value: 10 },
		LAYER_WIDTH_ADJUST: { key: 'layer_width_adjust', value: 1 },
		LAYER_HEIGHT_ADJUST: { key: 'layer_height_adjust', value: 1 },
		LAYER_FADING: { key: 'layer_fading', value: true },
		LAYER_FADE_DURATION: { key: 'layer_fade_duration', value: 0.2 }
	};
	
	var _LAYERS = MultiLayerCalendar._LAYERS,
		_CLASSES = MultiLayerCalendar._CLASSES,
		_CONFIG = MultiLayerCalendar._CONFIG_DEFAULTS;
	
	/**
	* Month layer
	* @property LAYER_MONTH
	* @static
	* @final
	* @type Number
	*/
	MultiLayerCalendar.LAYER_MONTH = _LAYERS.MONTH;
	
	/**
	* Year layer
	* @property LAYER_YEAR
	* @static
	* @final
	* @type Number
	*/
	MultiLayerCalendar.LAYER_YEAR = _LAYERS.YEAR;
	
	/**
	* Decade layer
	* @property LAYER_DECADE
	* @static
	* @final
	* @type Number
	*/
	MultiLayerCalendar.LAYER_DECADE = _LAYERS.DECADE;
	
	/**
	* Validates layer value
	* @method checkLayer
	* @static
	* @param {Number} v Value
	* @return {Boolean} True if valid layer value, false otherwise
	*/
	MultiLayerCalendar.checkLayer = function(v) {
		return ((!isNaN(v)) && _LAYERS.MONTH <= v && v <= _LAYERS.DECADE);
	};
	
	Lang.extend(MultiLayerCalendar, Calendar,
		{
			/**
			* Sets up configuration attributes
			* @method setupConfig
			*/
			setupConfig: function() {
				// Call parent method
				MultiLayerCalendar.superclass.setupConfig.call(this);
				
				var cfg = this.cfg;
				
				/**
				* Initial layer to display on first render
				* @config layer_initial
				* @type Number
				* @default MultiLayerCalendar.LAYER_MONTH
				*/
				cfg.addProperty(_CONFIG.LAYER_INITIAL.key, { value: _CONFIG.LAYER_INITIAL.value, validator: MultiLayerCalendar.checkLayer });
				
				/**
				* Layer base z-index in stacking context of container
				* @config layer_zindex_base
				* @type Number
				* @default 10
				*/
				cfg.addProperty(_CONFIG.LAYER_ZINDEX_BASE.key, { value: _CONFIG.LAYER_ZINDEX_BASE.value, validator: cfg.checkNumber });
				
				/**
				* Layer width adjustment. This increases or decreases the automatically
				* computed layer width by twice the specified number of pixels. Useful
				* for cross-browser adjustments or if stylization of the month table or
				* table cells includes larger borders.
				* @config layer_width_adjust
				* @type Number
				* @default 1
				*/
				cfg.addProperty(_CONFIG.LAYER_WIDTH_ADJUST.key, { value: _CONFIG.LAYER_WIDTH_ADJUST.value, validator: cfg.checkNumber });
				
				/**
				* Layer height adjustment. This increases or decreases the automatically
				* computed layer height by twice the specified number of pixels. Useful
				* for cross-browser adjustments or if stylization of the month table or
				* table cells includes larger borders.
				* @config layer_height_adjust
				* @type Number
				* @default 1
				*/
				cfg.addProperty(_CONFIG.LAYER_HEIGHT_ADJUST.key, { value: _CONFIG.LAYER_HEIGHT_ADJUST.value, validator: cfg.checkNumber });
				
				/**
				* Enables or disables animated fading of layers
				* @config layer_fading
				* @type Boolean
				* @default true
				*/
				cfg.addProperty(_CONFIG.LAYER_FADING.key, { value: _CONFIG.LAYER_FADING.value, validator: cfg.checkBoolean });
				
				/**
				* Layer fade duration in seconds
				* @config layer_fade_duration
				* @type Number
				* @default 0.2
				*/
				cfg.addProperty(_CONFIG.LAYER_FADE_DURATION.key, { value: _CONFIG.LAYER_FADE_DURATION.value, validator: cfg.checkNumber });
			},
			
			/**
			* Sets up custom events
			* @method initEvents
			*/
			initEvents: function() {
				// Call parent method
				MultiLayerCalendar.superclass.initEvents.call(this);
				
				this.renderEvent.subscribe(this._onRender, this, true);
			},
			
			/**
			* Dynamically calculates frame for layer containers
			* @method _getLayerFrame
			* @private
			* @returns {Object} Frame with left, top, width, height values
			*/
			_getLayerFrame: function() {
				var table = Dom.get(this.id),
					header = Dom.getElementsByClassName(Calendar._STYLES.CSS_HEADER_TEXT, 'th', table)[0],
					rgnTable = Dom.getRegion(table),
					rgnHeader = Dom.getRegion(header),
					pyHeader = rgnHeader.bottom - rgnHeader.top,
					cfg = this.cfg,
					pxAdjust = cfg.getProperty(_CONFIG.LAYER_WIDTH_ADJUST.key),
					pyAdjust = cfg.getProperty(_CONFIG.LAYER_HEIGHT_ADJUST.key),
					frame = {};
				
				frame.left = rgnTable.left - pxAdjust;
				frame.top = rgnTable.top + pyHeader - pyAdjust;
				frame.width = rgnTable.right - rgnTable.left + 2 * pxAdjust;
				frame.height = rgnTable.bottom - rgnTable.top - pyHeader + 2 * pyAdjust;
				
				return frame;
			},
			
			/**
			* Creates new layer container
			* @method _createLayer
			* @private
			* @param {String} classname HTML class name
			* @param {Object} frame Layer frame
			* @param {Number} level Layer z-index
			* @returns {HTMLElement} Layer container element
			*/
			_createLayer: function(classname, frame, level) {
				var layer = document.createElement('div'),
					zIndexBase = this.cfg.getProperty(_CONFIG.LAYER_ZINDEX_BASE.key);
				
				Dom.addClass(layer, _CLASSES.LAYER);
				Dom.addClass(layer, classname);
				Dom.setStyle(layer, 'position', 'absolute');
				Dom.setStyle(layer, 'zIndex', zIndexBase + (level - 1));
				Dom.setStyle(layer, 'width', frame.width + 'px');
				Dom.setStyle(layer, 'height', frame.height + 'px');
				Dom.setStyle(layer, 'visibility', (level <= this._layer) ? 'visible' : 'hidden');
				
				return layer;
			},
			
			/**
			* Generates HTML for year layer
			* @method _renderYearLayer
			* @private
			* @returns {String} HTML
			*/
			_renderYearLayer: function() {
				YAHOO.log('_renderYearLayer');
				
				var months = this.cfg.getProperty('MONTHS_SHORT'),
					now = new Date(),
					thisMonth = now.getMonth(),
					thisYear = now.getFullYear(),
					pageYear = this.cfg.getProperty('pagedate').getFullYear(),
					html = [],
					i, j, k, cls;
				
				html[html.length] = '<table class="' + _CLASSES.YEAR_TABLE + '">';
				for(i = 0; i < 3; i++) {
					html[html.length] = '<tr>';
					for(j = 0; j < 4; j++) {
						k = 4 * i + j;
						cls = (k === thisMonth && pageYear === thisYear ? ' ' + _CLASSES.THIS_MONTH_CELL : '');
						html[html.length] = '<td class="' + _CLASSES.MONTH_CELL + ' m' + (k + 1) + cls + '">' + months[k] + '</td>';
					}
					html[html.length] = '</tr>';
				}
				html[html.length] = '</table>';
				
				return html.join('');
			},
			
			/**
			* Synchronizes year layer (without full render)
			* @method _syncYearLayer
			* @private
			*/
			_syncYearLayer: function() {
				YAHOO.log('_syncYearLayer');
				
				var now = new Date(),
					thisMonth = now.getMonth(),
					thisYear = now.getFullYear(),
					pageYear = this.cfg.getProperty('pagedate').getFullYear(),
					cells = Dom.getElementsByClassName(_CLASSES.MONTH_CELL, 'td', this._layers.year),
					i, len, cell;
				
				for(i = 0, len = cells.length; i < len; i++) {
					cell = cells[i];
					if(i === thisMonth && pageYear === thisYear) {
						Dom.addClass(cell, _CLASSES.THIS_MONTH_CELL);
					}
					else {
						Dom.removeClass(cell, _CLASSES.THIS_MONTH_CELL);
					}
				}
			},
			
			/**
			* Generates HTML for decade layer
			* @method _renderDecadeLayer
			* @private
			* @returns {String} HTML
			*/
			_renderDecadeLayer: function() {
				YAHOO.log('_renderDecadeLayer');
				
				var now = new Date(),
					thisYear = now.getFullYear(),
					pageYear = this.cfg.getProperty('pagedate').getFullYear(),
					y = Math.floor(pageYear / 10) * 10 - 1,
					html = [],
					i, j, clsThisYear, clsOOD;
				
				html[html.length] = '<table class="' + _CLASSES.DECADE_TABLE + '">';
				for(i = 0; i < 3; i++) {
					html[html.length] = '<tr>';
					for(j = 0; j < 4; j++) {
						clsThisYear = (y === thisYear ? ' ' + _CLASSES.THIS_YEAR_CELL : '');
						clsOOD = ((i === 0 && j === 0) || (i === 2 && j === 3) ? ' ' + _CLASSES.OOD_CELL : '');
						html[html.length] = '<td class="' + _CLASSES.YEAR_CELL + clsThisYear + clsOOD + '">' + (y++) + '</td>';
					}
					html[html.length] = '</tr>';
				}
				html[html.length] = '</table>';
				
				return html.join('');
			},
			
			/**
			* Synchronizes decade layer (without full render)
			* @method _syncDecadeLayer
			* @private
			*/
			_syncDecadeLayer: function() {
				YAHOO.log('_syncDecadeLayer');
				
				var now = new Date(),
					thisYear = now.getFullYear(),
					pageYear = this.cfg.getProperty('pagedate').getFullYear(),
					y = Math.floor(pageYear / 10) * 10 - 1;
				
				Dom.getElementsByClassName(_CLASSES.YEAR_CELL, 'td', this._layers.decade,
					function(el) {
						if(y === thisYear) {
							Dom.addClass(el, _CLASSES.THIS_YEAR_CELL);
						}
						else {
							Dom.removeClass(el, _CLASSES.THIS_YEAR_CELL);
						}
						
						el.innerHTML = (y++);
					}
				);
			},
			
			/**
			* Attaches layer to document and positions it
			* @method _attachLayer
			* @private
			* @param {HTMLElement} layer Layer container element
			* @param {Object} frame Layer frame
			*/
			_attachLayer: function(layer, frame) {
				var ctr = this.oDomContainer;
				ctr.appendChild(layer);
				Dom.setXY(layer, [frame.left, frame.top]);
			},
			
			/**
			* Shows layer, using animation if so configured
			* @method _showLayer
			* @private
			* @param {HTMLElement} layer Layer container element
			*/
			_showLayer: function(layer) {
				YAHOO.log('_showLayer');
				
				var cfg = this.cfg;
				if(Anim && cfg.getProperty(_CONFIG.LAYER_FADING.key)) {
					Dom.setStyle(layer, 'opacity', 0);
					Dom.setStyle(layer, 'visibility', 'visible');
					
					var duration = cfg.getProperty(_CONFIG.LAYER_FADE_DURATION.key),
						anim = new Anim(layer, { opacity: { to: 1 } }, duration, Easing.easeNone);
					
					anim.animate();
				}
				else {
					Dom.setStyle(layer, 'visibility', 'visible');
				}
			},
			
			/**
			* Hides layer, using animation if so configured
			* @method _hideLayer
			* @private
			* @param {HTMLElement} layer Layer container element
			*/
			_hideLayer: function(layer) {
				YAHOO.log('_hideLayer');
				
				var cfg = this.cfg;
				if(Anim && cfg.getProperty(_CONFIG.LAYER_FADING.key)) {
					var duration = cfg.getProperty(_CONFIG.LAYER_FADE_DURATION.key),
						anim = new Anim(layer, { opacity: { from: 1, to: 0 } }, duration, Easing.easeNone),
						cal = this;
					
					anim.onComplete.subscribe(
						function() {
							Dom.setStyle(layer, 'visibility', 'hidden');
							cal._nohover = false;
						}
					);
					
					anim.animate();
				}
				else {
					Dom.setStyle(layer, 'visibility', 'hidden');
					this._nohover = false;
				}
			},
			
			/**
			* Generates calendar label text
			* @method _renderLabel
			* @private
			* @returns {String} Label text
			*/
			_renderLabel: function() {
				switch(this._layer) {
					case _LAYERS.MONTH:
						return MultiLayerCalendar.superclass.buildMonthLabel.call(this);
						
					case _LAYERS.YEAR:
						var year = this.cfg.getProperty('pagedate').getFullYear(),
							suffix = this.cfg.getProperty('my_label_year_suffix');
						
						return year + suffix;
						
					case _LAYERS.DECADE:
						var year = this.cfg.getProperty('pagedate').getFullYear(),
							lower = Math.floor(year / 10) * 10,
							upper = lower + 9,
							suffix = this.cfg.getProperty('my_label_year_suffix'),
							delim = this.cfg.getProperty('date_range_delimiter');
						
						return lower + suffix + delim + upper + suffix;
				}
			},
			
			/**
			* Synchronizes calendar label text (without full render)
			* @method _syncLabel
			* @private
			*/
			_syncLabel: function() {
				YAHOO.log('_syncLabel');
				
				var cal = this;
				Dom.getElementsByClassName(_CLASSES.UP_LINK, 'a', this.oDomContainer,
					function(el) {
						if(cal._layer === _LAYERS.DECADE) {
							Dom.addClass(el, _CLASSES.TOP_UP_LINK);
						}
						else {
							Dom.removeClass(el, _CLASSES.TOP_UP_LINK);
						}
						
						el.innerHTML = cal._renderLabel();
					}
				);
			},
			
			/**
			* Attaches DOM event listeners for calendar label and layers
			* @method _applyLayerListeners
			* @private
			*/
			_applyLayerListeners: function() {
				var cal = this;
				
				// Header link
				Dom.getElementsByClassName(_CLASSES.UP_LINK, 'a', this.oDomContainer,
					function(el) {
						Event.on(el, 'click', cal._onUpLinkClick, cal, true);
					}
				);
				
				// Year layer cells
				Dom.getElementsByClassName(_CLASSES.MONTH_CELL, 'td', this._layers.year,
					function(el) {
						Event.on(el, 'mouseover', cal._onCellMouseover, cal, true);
						Event.on(el, 'mouseout', cal._onCellMouseout, cal, true);
						Event.on(el, 'click', cal._onMonthCellClick, cal, true);
					}
				);
				
				// Decade layer cells
				Dom.getElementsByClassName(_CLASSES.YEAR_CELL, 'td', this._layers.decade,
					function(el) {
						Event.on(el, 'mouseover', cal._onCellMouseover, cal, true);
						Event.on(el, 'mouseout', cal._onCellMouseout, cal, true);
						Event.on(el, 'click', cal._onYearCellClick, cal, true);
					}
				);
			},
			
			/**
			* Generates HTML for calendar label
			* @method buildMonthLabel
			* @returns {String} HTML
			*/
			buildMonthLabel: function() {
				var html = [],
					clsTop = (this._layer === _LAYERS.DECADE ? ' ' + _CLASSES.TOP_UP_LINK : '');
				
				html[html.length] = '<a class="' + _CLASSES.UP_LINK + clsTop + '" href="javascript:void(0);">';
				html[html.length] = this._renderLabel();
				html[html.length] = '</a>';
				
				return html.join('');
			},
			
			/**
			* Render handler
			* @method _onRender
			* @private
			*/
			_onRender: function() {
				YAHOO.log('_onRender');
				
				// Create layers
				var frame = this._getLayerFrame(),
					yearLayer = this._createLayer(_CLASSES.YEAR_LAYER, frame, _LAYERS.YEAR),
					decadeLayer = this._createLayer(_CLASSES.DECADE_LAYER, frame, _LAYERS.DECADE);
				
				// Render layers
				yearLayer.innerHTML = this._renderYearLayer();
				decadeLayer.innerHTML = this._renderDecadeLayer();
				
				// Attach layers
				this._attachLayer(yearLayer, frame);
				this._attachLayer(decadeLayer, frame);
				
				// Store DOM references
				this._layers.year = yearLayer;
				this._layers.decade = decadeLayer;
				
				// Apply event listeners
				this._applyLayerListeners();
			},
			
			/**
			* Returns current layer
			* @method getCurrentLayer
			* @returns {Number} Current layer
			*/
			getCurrentLayer: function() {
				return this._layer;
			},
			
			/**
			* Moves up one layer
			* @method upLayer
			* @returns {Number} New current layer
			*/
			upLayer: function() {
				YAHOO.log('upLayer');
				
				switch(this._layer) {
					case _LAYERS.MONTH:
						this._layer++;
						this.changePageEvent.fire();
						this._showLayer(this._layers.year);
						break;
					case _LAYERS.YEAR:
						this._layer++;
						this.changePageEvent.fire();
						this._showLayer(this._layers.decade);
						break;
				}
				
				return this._layer;
			},
			
			/**
			* Moves down one layer
			* @method downLayer
			* @returns {Number} New current layer
			*/
			downLayer: function() {
				YAHOO.log('downLayer');
				
				switch(this._layer) {
					case _LAYERS.YEAR:
						/* We need to render the month layer while this layer is still up,
							so render, then fire changePageEvent, then go down */
						this.render();
						this.changePageEvent.fire();
						this._layer--;
						this._syncLabel();
						this._hideLayer(this._layers.year);
						break;
					case _LAYERS.DECADE:
						this._layer--;
						this.changePageEvent.fire();
						this._hideLayer(this._layers.decade);
						break;
				}
				
				return this._layer;
			},
			
			/**
			* Handles page left navigation
			* @method doPreviousMonthNav
			* @param {Object} e Event object
			*/
			doPreviousMonthNav: function(e) {
				switch(this._layer) {
					case _LAYERS.MONTH:
						return MultiLayerCalendar.superclass.doPreviousMonthNav.apply(this, arguments);
					case _LAYERS.YEAR:
						Event.preventDefault(e);
						this.previousYear();
						return;
					case _LAYERS.DECADE:
						Event.preventDefault(e);
						this.subtractYears(10);
						return;
				}
			},
			
			/**
			* Handles page right navigation
			* @method doNextMonthNav
			* @param {Object} e Event object
			*/
			doNextMonthNav: function(e) {
				switch(this._layer) {
					case _LAYERS.MONTH:
						return MultiLayerCalendar.superclass.doNextMonthNav.apply(this, arguments);
					case _LAYERS.YEAR:
						Event.preventDefault(e);
						this.nextYear();
						return;
					case _LAYERS.DECADE:
						Event.preventDefault(e);
						this.addYears(10);
						return;
				}
			},
			
			/**
			* Handles page change event
			* @method onChangePage
			*/
			onChangePage: function() {
				YAHOO.log('onChangePage');
				
				switch(this._layer) {
					case _LAYERS.MONTH:
						return MultiLayerCalendar.superclass.onChangePage.apply(this, arguments);
					case _LAYERS.YEAR:
						this._syncYearLayer();
						this._syncLabel();
						return;
					case _LAYERS.DECADE:
						this._syncDecadeLayer();
						this._syncLabel();
						return;
				}
			},
			
			/**
			* Handles layer table cell mouseover
			* @method _onCellMouseover
			* @private
			* @param {Object} e Event object
			*/
			_onCellMouseover: function(e) {
				if(!this._nohover) {
					Dom.addClass(Event.getTarget(e), _CLASSES.HOVER_CELL);
				}
			},
			
			/**
			* Handles layer table cell mouseout
			* @method _onCellMouseout
			* @private
			* @param {Object} e Event object
			*/
			_onCellMouseout: function(e) {
				Dom.removeClass(Event.getTarget(e), _CLASSES.HOVER_CELL);
			},
			
			/**
			* Handles header link click
			* @method _onUpLinkClick
			* @private
			* @param {Object} e Event object
			*/
			_onUpLinkClick: function(e) {
				Event.preventDefault(e);
				Event.getTarget(e).blur();
				this.upLayer();
			},
			
			/**
			* Handles year layer month cell click
			* @method _onMonthCellClick
			* @private
			* @param {Object} e Event object
			*/
			_onMonthCellClick: function(e) {
				// Determine month clicked from cell HTML class
				var target = Event.getTarget(e),
					match = target.className.match(/m(\d{1,2})/);
				
				if(match) {
					var month = parseInt(match[1], 10) - 1,
						pageDate = this.cfg.getProperty('pagedate'),
						cal = this;
					
					// Change pagedate month
					pageDate.setMonth(month);
					this.cfg.setProperty('pagedate', pageDate);
					
					// Kill hover temporarily to prevent flicker on render
					this._nohover = true;
					Dom.removeClass(target, _CLASSES.HOVER_CELL);
					
					/* Move down to month layer, but do so in a timeout so that the
						current event can bubble up before the render removes the
						event target from DOM. */
					setTimeout(function() { cal.downLayer(); }, 0);
				}
			},
			
			/**
			* Handles decade layer year cell click
			* @method _onYearCellClick
			* @private
			* @param {Object} e Event Object
			*/
			_onYearCellClick: function(e) {
				// Determine year clicked
				var target = Event.getTarget(e),
					targetYear = parseInt(target.innerHTML, 10),
					pageDate = this.cfg.getProperty('pagedate');
				
				// Change pagedate year
				pageDate.setFullYear(targetYear);
				this.cfg.setProperty('pagedate', pageDate);
				
				// Move down to year layer (no render)
				this.downLayer();
			},
			
			configNavigator: function() {
				// Ignore
			}
		}
	);
	
	// Export
	YAHOO.namespace('BLARGON.widget');
	YAHOO.BLARGON.widget.MultiLayerCalendar = MultiLayerCalendar;
	
	// Register
	//YAHOO.register('multilayercalendar', MultiLayerCalendar, { version: '0.2', build: '1' });
})();