var graph={
		
	rawData:[],
	alertsCrossFilter:{},
	config:{},
	selectedFilters:{},
	dateFilterRange:null,
	dimensions:{},
	ctlFirstLoading:false,
	
	totalizedAreaInfoBox:undefined,// totalized area info box
	totalizedAlertsInfoBox:undefined,// totalized alerts info box
	lineDistributionByMonth:undefined,
	histTopByCounties:undefined,
	ringTotalizedByState:undefined,
	histTopByUCs:undefined,
	
	histogramColor: ["#0000FF","#57B4F0"],
	pallet: ["#FF0000","#FF6A00","#FF8C00","#FFA500","#FFD700","#FFFF00","#DA70D6","#BA55D3","#7B68EE"],
	barTop10Color: "#b8b8b8",

	/**
	 * Load configuration file before loading data.
	 */
	setConfigurations: function(conf) {
		if(conf) {
			graph.pallet=conf.pallet?conf.pallet:graph.pallet;
			graph.histogramColor=conf.histogramColor?conf.histogramColor:graph.histogramColor;
			graph.barTop10Color=conf.barTop10Color?conf.barTop10Color:graph.barTop10Color;
			graph.defaultHeight=conf.defaultHeight?conf.defaultHeight:utils.getDefaultHeight();
		}else{
			console.log("Didn't load config file. Using default options.");
		}
	},

	init:function(config, data) {

		if(data.length==0 || data.exception!==undefined) {
			this.displayWarning(true);
			return;
		}
		
		Lang.apply();
		
		graph.setConfigurations(config.dataConfig);

		if(this.loadData(false, data)) {
			
			this.displayWaiting(false);
			this.config=config;
			
			this.totalizedAlertsInfoBox = dc.numberDisplay("#numpolygons");
			this.totalizedAreaInfoBox = dc.numberDisplay("#custom-classes");

			this.lineDistributionByMonth = dc.barChart("#chart-line-by-month");
			this.histTopByCounties = dc.rowChart("#chart-hist-top-counties");
			this.ringTotalizedByState = dc.pieChart("#chart-ring-by-state");
			this.histTopByUCs = dc.rowChart("#chart-hist-top-ucs");
			
			graph.build();
			SearchEngine.init(this.histTopByCounties, this.ringTotalizedByState ,'modal-search');
		}
	},

	startLoadData: function() {

		var afterLoadConfiguration=function(cfg) {
			utils.displayLoginExpiredMessage();
			graph.displayWaiting();
			var configDashboard={defaultDataDimension:'area', resizeTimeout:0, minWidth:250, dataConfig:cfg};
			var dataUrl = downloadCtrl.getFileDeliveryURL()+"/download/"+downloadCtrl.getProject()+"/all_daily";
			if(downloadCtrl.isLocalhost()) dataUrl = "./data/deter-cerrado-daily.csv";// to use in localhost run the curl_get_json.sh in data dir
			var afterLoadData=function(csv) {
				Lang.apply();
				if(!csv) {
					graph.displayWarning(true);
				}else{
					graph.setUpdatedDate();
					graph.init(configDashboard, csv);
				}
			};
			d3.csv(dataUrl)
			.header("Authorization", "Bearer "+ ((typeof Authentication!='undefined')?(Authentication.getToken()):("")) )
			.get(function(error, root) {
				if(error && error.status==401 && typeof Authentication!='undefined') {
					Authentication.logout();
					Authentication.setExpiredToken(true);
				}else{
					afterLoadData(root);
				}
			});
		};
		d3.json("./config/"+downloadCtrl.getProject()+"-daily.json", afterLoadConfiguration);
	},

	setUpdatedDate: function() {
		let layer_name=(typeof Authentication!="undefined"&&Authentication.hasToken())?("last_date"):("updated_date");
		var geoserverURL = $(location).attr('origin') + "/geoserver/";
		let url=geoserverURL+downloadCtrl.getProject()+"/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME="+layer_name+"&OUTPUTFORMAT=application%2Fjson";
		d3.json(url, function(jsonResponse){
			let dt=((jsonResponse&&jsonResponse.features[0].properties)?( (new Date(jsonResponse.features[0].properties.updated_date+'T21:00:00.000Z')).toLocaleDateString(Lang.language) ):('?') );
			d3.select("#updated_date").html(' '+dt);
		});
	},

	displayWaitingChanges: function(enable) {
		if(enable===undefined) enable=true;
		d3.select('#loading_data_info').style('display',((enable)?(''):('none')));
		d3.select('#info_container').style('display',((enable)?(''):('none')));
	},
	
	displayWaiting: function(enable) {
		if(enable===undefined) enable=true;
		d3.select('#charts-panel').style('display',((enable)?('none'):('')));
		d3.select('#loading_data_info').style('display',((!enable)?('none'):('')));
		d3.select('#info_container').style('display',((!enable)?('none'):('')));
		d3.select('#panel_container').style('display',((enable)?('none'):('')));
		d3.select('#warning_data_info').style('display','none');
		d3.select('#radio-area').style('display',((enable)?('none'):('')));
		d3.select('#radio-alerts').style('display',((enable)?('none'):('')));
	},
	
	displayWarning:function(enable) {
		if(enable===undefined) enable=true;
		document.getElementById("warning_data_info").style.display=((enable)?(''):('none'));
		document.getElementById("warning_data_info").innerHTML='<h3><span id="txt8">'+Translation[Lang.language].txt8+'</span></h3>';
		document.getElementById("loading_data_info").style.display=((enable)?('none'):(''));
	},
	
	loadData: function(error, data) {
		if(error) {
	    	console.log(error);
	    	return false;
		}else{
			graph.rawData = data;
			graph.normalizeData();
			return true;
		}
	},

	onDateRangeChange: function(){
		graph.displayWaitingChanges();
		window.setTimeout(()=>{
			let dt0=new Date((utils.datePicker.getStartDate())._d);
			let dt1=new Date((utils.datePicker.getEndDate())._d);
			if(dt1-dt0<0) {
				alert(Translation[Lang.language].invalidRange);
			}else{
				// apply filter on dataset
				let isOk=graph.setDateRangeOnDataset(dt0, dt1);
				// if do not apply filter, abort and add info to user
				if(!isOk){
					alert(Translation[Lang.language].noData);
					// restore the previous interval
					graph.setDateRangeOnDataset(graph.dateFilterRange[0],graph.dateFilterRange[1]);
				}else{
					graph.build();
				}
			}
		
			graph.displayWaitingChanges(false);
		},100);
	},

	setDateRangeOnDataset(dt0, dt1){
		graph.dimensions["date"].filterAll();

		let dt1_=new Date(dt1);
		dt1_.setDate(dt1_.getDate()+1);
		graph.dimensions["date"].filterRange([Date.parse(dt0),Date.parse(dt1_)]);
		// if selected interval do not result in valid data
		if(graph.dimensions["date"].top(1).length==0){
			return false;
		}
		graph.dateFilterRange=[dt0,dt1];// to use after reset filter
		return true;
	},
	
	setDataDimension: function(d) {
		graph.displayWaitingChanges();
		window.setTimeout(()=>{
			graph.config.defaultDataDimension=d;
			graph.storeSelectedFilter();
			graph.resetFilters();
			graph.onDateRangeChange();
			graph.updateToSelectedFilter();
			graph.displayWaitingChanges(false);
		}, 100);
	},

	storeSelectedFilter: function() {
		graph.selectedFilters={};// reset stored filter
		if(graph.histTopByCounties.hasFilter())
			graph.selectedFilters.byCounty=graph.histTopByCounties.filters();
		if(graph.lineDistributionByMonth.hasFilter())
			graph.selectedFilters.byMonth=graph.lineDistributionByMonth.filters();
		if(graph.ringTotalizedByState.hasFilter())
			graph.selectedFilters.byState=graph.ringTotalizedByState.filters();
		if(graph.histTopByUCs.hasFilter())
			graph.selectedFilters.byUCs=graph.histTopByUCs.filters();
	},

	updateToSelectedFilter: function() {
		if(graph.selectedFilters.byCounty)
			while(graph.selectedFilters.byCounty.length) {graph.histTopByCounties.filter(graph.selectedFilters.byCounty.pop());}
		if(graph.selectedFilters.byState)
			while(graph.selectedFilters.byState.length) {graph.ringTotalizedByState.filter(graph.selectedFilters.byState.pop());}
		if(graph.selectedFilters.byUCs)
			while(graph.selectedFilters.byUCs.length) {graph.histTopByUCs.filter(graph.selectedFilters.byUCs.pop());}
		// if(graph.selectedFilters.byMonth)
		// 	while(graph.selectedFilters.byMonth.length) {graph.lineDistributionByMonth.filter(graph.selectedFilters.byMonth.pop());}
		dc.redrawAll();
	},
	
	resetFilters:function() {
		graph.lineDistributionByMonth.filterAll();
		graph.histTopByCounties.filterAll();
		graph.ringTotalizedByState.filterAll();
		graph.histTopByUCs.filterAll();
		SearchEngine.applyCountyFilter();
	},

	resetLineDistributionByMonthFilter() {
		/** Reset filter from lineDistributionByMonth chart */
		// reset old filters
		if(graph.lineDistributionByMonth && graph.lineDistributionByMonth.hasFilter()){
			graph.lineDistributionByMonth.filterAll();
		}
		graph.onDateRangeChange();
	},

	doResize:function() {
		graph.defaultHeight = utils.getDefaultHeight();
		dc.renderAll();
	},

	// gid as a, geocod_ibge as b, areatotalkm as d, areamunkm as e, areauckm as f, date as g, uf as h, county as i, uc as j 
	normalizeData:function() {
		var numberFormat = d3.format('.2f');
	    var json=[];
        // normalize/parse data
        this.rawData.forEach(function(d) {
            var o={uf:d.h,county:d.i,codIbge:d.b};
            o.uc = (d.j)?(d.j):('null');
            var auxDate = new Date(d.g + 'T04:00:00.000Z');
            o.timestamp = auxDate.getTime();
            o.areaKm = numberFormat(d.e)*1;// area municipio
            o.areaUcKm = ((d.f)?(numberFormat(d.f)*1):(0));
		    json.push(o);
		});
		
		this.rawData=json;
		delete json;
		this.initCrossFilter();
	},

	initCrossFilter:function(){
		// set crossfilter
		this.alertsCrossFilter = crossfilter(this.rawData);
		this.dimensions["area"] = this.alertsCrossFilter.dimension(function(d) {return d.areaKm;});
		this.dimensions["county"] = this.alertsCrossFilter.dimension(function(d) {return d.county+"/"+d.uf;});
		this.dimensions["date"] = this.alertsCrossFilter.dimension(function(d) {return d.timestamp;});
		this.dimensions["uf"] = this.alertsCrossFilter.dimension(function(d) {return d.uf;});
		this.dimensions["uc"] = this.alertsCrossFilter.dimension(function(d) {return d.uc+"/"+d.uf;});

		let endDate=new Date(graph.dimensions["date"].top(1)[0].timestamp),
		startDate=new Date(endDate),
		minDate=new Date(graph.dimensions["date"].bottom(1)[0].timestamp);
		minDate.setHours(minDate.getHours()-1);
		// define initial interval and limits based on dataset date range
		startDate.setDate(startDate.getDate()-365);
		startDate.setHours(startDate.getHours()-6);
		utils.datePicker.setInterval(startDate,endDate);
		utils.datePicker.setStartMaxDate(endDate);
		utils.datePicker.setStartMinDate(minDate);
		utils.datePicker.setEndMaxDate(endDate);
		utils.datePicker.setEndMinDate(minDate);
		// apply filter on dataset
		this.setDateRangeOnDataset(startDate,endDate);
	},
	
	build:function() {
		
		var totalAreaGroup = graph.alertsCrossFilter.groupAll().reduce(
		            function (p, v) {
		                ++p.n;
		                p.tot += v.areaKm;
		                return p;
		            },
		            function (p, v) {
		                --p.n;
		                p.tot -= v.areaKm;
		                return p;
		            },
		            function () { return {n:0,tot:0}; }
		        ),
		    totalAlertsGroup = graph.alertsCrossFilter.groupAll().reduce(
		        function (p, v) {
		            ++p.n;
		            //p.tot += v.k;
		            return p;
		        },
		        function (p, v) {
		            --p.n;
		            //p.tot -= v.k;
		            return p;
		        },
		        function () { return {n:0/*,tot:0*/}; }
		    );
		
		var groups=[];
		if(graph.config.defaultDataDimension=="area") {
			groups["county"] =graph.dimensions["county"].group().reduceSum(function(d) {return +d.areaKm;});
			groups["uf"] =graph.dimensions["uf"].group().reduceSum(function(d) {return +d.areaKm;});
			groups["date"] =graph.dimensions["date"].group().reduceSum(function(d) {return +d.areaKm;});
			groups["uc"] =graph.dimensions["uc"].group().reduceSum(function(d) {return (d.uc!='null')?(+d.areaUcKm):(0);});
		}else{
			groups["county"] =graph.dimensions["county"].group().reduceCount(function(d) {return d.county;});
			groups["uf"] =graph.dimensions["uf"].group().reduceCount(function(d) {return d.uf;});
			groups["date"] =graph.dimensions["date"].group().reduceCount(function(d) {return +d.timestamp;});
			groups["uc"] =graph.dimensions["uc"].group().reduceSum(function(d) {return (d.uc!='null')?(1):(0);});
		}

		var htmlBox="<div class='icon-left'><i class='fa fa-leaf fa-2x' aria-hidden='true'></i></div><span class='number-display'>";
		
		this.totalizedAreaInfoBox.formatNumber(localeBR.numberFormat(',1f'));
		this.totalizedAreaInfoBox.valueAccessor(function(d) {return d.n ? d.tot.toFixed(2) : 0;})
	      .html({
			one:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>0 km²</div></span>"
	      })
	      .group(totalAreaGroup);
		

		// build totalized Alerts box
		// use format integer see: http://koaning.s3-website-us-west-2.amazonaws.com/html/d3format.html
		this.totalizedAlertsInfoBox.formatNumber(localeBR.numberFormat(','));
		this.totalizedAlertsInfoBox.valueAccessor(function(d) {
			return d.n ? d.n : 0;
		})
	      .html({
			one:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>%number</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>%number</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>0</div></span>"
	      })
	      .group(totalAlertsGroup);
		
		this.buildCharts(groups);
	},
	
	buildCharts:function(groups) {
		
		var alertsMaxDate =graph.dimensions["date"].top(1),
		alertsMinDate =graph.dimensions["date"].bottom(1);
		
		// build area or alerts by time
		// -----------------------------------------------------------------------
		utils.setTitle('timeline', Translation[Lang.language].timeline_header);

		var lastDate=new Date(alertsMaxDate[0].timestamp),
		firstDate=new Date(alertsMinDate[0].timestamp);
		// lastDate=new Date(lastDate.setMonth(lastDate.getMonth()+1));
		// lastDate=new Date(lastDate.setDate(lastDate.getDate()+7));
		// firstDate=new Date(firstDate.setDate(firstDate.getDate()-7));
		
		var dateFormat = localeBR.timeFormat('%d/%m/%Y');
		var x = d3.time.scale().domain([firstDate, lastDate]);
		var yLabel = ((graph.config.defaultDataDimension=='area')?
				(utils.wildcardExchange("%Dim%") + " (" + utils.wildcardExchange("%unit%")+")"):
					(utils.wildcardExchange("%Unit%")));
		
		this.lineDistributionByMonth
			.height(310)
			.margins({top: 10, right: 45, bottom: 55, left: 45})
			.yAxisLabel( yLabel )
			//.xAxisLabel( Translation[Lang.language].timeline_desc + " " + dateFormat(new Date(alertsMinDate[0].timestamp)) + " - " + dateFormat(new Date(alertsMaxDate[0].timestamp)) )
			.dimension(graph.dimensions["date"])
			.group(groups["date"])
			.transitionDuration(300)
			.elasticY(true)
			.x(x)
			.brushOn(false)
			.centerBar(true)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.colors(d3.scale.ordinal().range(['black']));

		let customTicks=d3.time.months;
		let numDays=utils.getNumberOfDaysForRangeDate(firstDate,lastDate);
		if(numDays<45) customTicks= d3.time.days;
		else if(numDays<90) customTicks= d3.time.weeks;
		else customTicks= d3.time.months;
		
		this.lineDistributionByMonth
			.on('preRender', function(chart) {
				chart
				.xUnits(d3.time.days)
				.xAxis(d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.ticks(customTicks)
					.tickFormat( function(d) {
						var dt=d.toLocaleDateString();
						var adt=d.toLocaleDateString().split("/");
						if((chart.effectiveWidth()<graph.config.minWidth)) {
							dt=Translation[Lang.language].months_names[d.getMonth()] + "/" + adt[2];
						}else {
							dt=adt[0] + "/" + Translation[Lang.language].months_names[d.getMonth()] + "/" + adt[2];
						}
						// var dt=localeBR.timeFormat( (chart.effectiveWidth()<graph.config.minWidth)?("%b/%Y"):("%d/%b/%Y") )(d);
						return dt;
					})
				);
				chart
				.yAxis()
				//.ticks(5)
				.tickFormat(d3.format('.2s'));
			});

		this.lineDistributionByMonth.on("renderlet.a",function (chart) {
			   // rotate x-axis labels
			chart.selectAll('g.x text')
				.attr('transform', 'translate(-10,20) rotate(315)');
			if(!chart.hasFilter()){
				$('#txt9a').css('display','none');
				$('#highlight-time').css('display','');
				//$('#txt9').html(Translation[Lang.language].allTime);
				$('#highlight-time').html(" " + dateFormat(new Date(alertsMinDate[0].timestamp)) + " - " + dateFormat(new Date(alertsMaxDate[0].timestamp)) );
			}else{
				$('#txt9a').css('display','');
				$('#highlight-time').css('display','none');
				//$('#txt9').html(Translation[Lang.language].txt9);
			}
		});
		
		this.lineDistributionByMonth.filterPrinter(function(f) {
			let dt=new Date(f[0][0]),
			dt0=f[0][0].toDateString(),
			dt1=new Date(f[0][1]).toDateString();
			if(Date.parse(new Date(dt1))>Date.parse(new Date(dt0))){
				dt.setDate(dt.getDate()+1);
				return " " + dateFormat(dt) + " - " + dateFormat(f[0][1]);
			}else{
				return " - ";
			}
		});

		this.lineDistributionByMonth.title(function(d) { 
			return (d.key!='empty')?((new Date(d.key)).toLocaleDateString() + ': ' + utils.numberByUnit(d.value) + utils.wildcardExchange(" %unit%")):(Translation[Lang.language].without);
		});
		// -----------------------------------------------------------------------
		
		// build top areas or alerts by county
		utils.setTitle('counties', Translation[Lang.language].title_top_county);
		
		this.histTopByCounties
			.height(graph.defaultHeight)
			.dimension(graph.dimensions["county"])
			.group(utils.removeLittlestValues(groups["county"]))
			.elasticX(true)
			.ordering(function(d) {return d.county;})
			.controlsUseVisibility(true)
			.ordinalColors([graph.barTop10Color]);

		this.histTopByCounties
			.on('preRender', function(chart) {
				chart.height(graph.defaultHeight);
				chart.xAxis().ticks((chart.width()<graph.config.minWidth)?(5):(6));
			});
		
		this.histTopByCounties
			.on('preRedraw', function (chart) {
				if(chart.data().length > 5){
					chart.fixedBarHeight(false);
				}else{
					chart.fixedBarHeight( parseInt((chart.effectiveHeight()*0.7)/10) );
				}
			});

		this.histTopByCounties
			.on("renderlet.a",function (chart) {
				var texts=chart.selectAll('g.row text');
				var rankMun=function() {
					var allTop=groups["county"].top(Infinity);
					var ar={};
					allTop.forEach(function(k,i){ar["\""+k.key+"\""]=(i+1);});
					return ar;
				};
				texts[0].forEach(function(t){
					var p=(rankMun()["\""+t.innerHTML.split(":")[0]+"\""])?(rankMun()["\""+t.innerHTML.split(":")[0]+"\""]+'º - '):('');
					t.innerHTML=p+t.innerHTML;
				});
			});

		this.histTopByCounties.xAxis()
		.tickFormat(function(d) {return d+utils.wildcardExchange(" %unit%");});

		this.histTopByCounties.data(function (group) {
				var fakeGroup=[];
				fakeGroup.push({key:Translation[Lang.language].without,value:0});
				return (group.all().length>0)?(group.top(10)):(fakeGroup);
			});
		this.histTopByCounties.title(function(d) {return d.key + ': ' + utils.numberByUnit(d.value) + utils.wildcardExchange(" %unit%");});
		this.histTopByCounties.label(function(d) {return d.key + ': ' + utils.numberByUnit(d.value) + utils.wildcardExchange(" %unit%");});

		// build graph areas or alerts by state
		utils.setTitle('state',Translation[Lang.language].title_tot_state);
		
		this.ringTotalizedByState
			.height(graph.defaultHeight)
			.innerRadius(10)
			.externalRadiusPadding(30)
			.dimension(graph.dimensions["uf"])
			.group(utils.removeLittlestValues(groups["uf"]))
			.ordering(dc.pluck('key'))
			.ordinalColors(graph.pallet)
			.legend(dc.legend().x(20).y(10).itemHeight(13).gap(7).horizontal(0).legendWidth(50).itemWidth(35));
		
		this.ringTotalizedByState
			.on('preRender', function(chart) {
				chart.height(graph.defaultHeight);
				chart.legend().legendWidth(window.innerWidth/2);
			});
		
		this.ringTotalizedByState.title(function(d) { 
			return (d.key!='empty')?(d.key + ': ' + utils.numberByUnit(d.value) + utils.wildcardExchange(" %unit%")):(Translation[Lang.language].without);
		});

		this.ringTotalizedByState
			.renderLabel(true)
			.minAngleForLabel(0.5);

		this.ringTotalizedByState.label(function(d) {
			var txtLabel=(d.key!='empty')?(utils.numberByUnit(d.value) + utils.wildcardExchange(" %unit%")):(Translation[Lang.language].without);
			if(graph.ringTotalizedByState.hasFilter()) {
				var f=graph.ringTotalizedByState.filters();
				return (f.indexOf(d.key)>=0)?(txtLabel):('');
			}else{
				return txtLabel;
			}
		});

		if(!graph.ctlFirstLoading) {
			dc.override(this.ringTotalizedByState, 'legendables', function() {
				var legendables = this._legendables();
				return legendables.filter(function(l) {
					return l.data > 0;
				});
			});
		}
		
		// build top areas or alerts by ucs
		utils.setTitle('ucs', Translation[Lang.language].title_top_uc);

		this.histTopByUCs
			.height(graph.defaultHeight)
			.dimension(graph.dimensions["uc"])
			.group(utils.removeLittlestValues(groups["uc"]))
			.elasticX(true)
			.ordering(function(d) { return d.uc; })
			.controlsUseVisibility(true)
			.ordinalColors([graph.barTop10Color]);

		this.histTopByUCs
			.on('preRender', function(chart) {
				chart.height(graph.defaultHeight);
				chart.xAxis().ticks((chart.width()<graph.config.minWidth)?(4):(7));
			});

		this.histTopByUCs
			.on('preRedraw', function (chart) {
				if(chart.data().length > 5){
					chart.fixedBarHeight(false);
				}else{
					chart.fixedBarHeight( parseInt((chart.effectiveHeight()*0.7)/10) );
				}
			});

		this.histTopByUCs
			.on("renderlet.a",function (chart) {
				var texts=chart.selectAll('g.row text');
				var rankMun=function() {
					var allTop=groups["uc"].top(Infinity);
					var ar={};
					allTop.forEach(function(k,i){ar["\""+k.key+"\""]=(i+1);});
					return ar;
				};
				texts[0].forEach(function(t){
					var p=(rankMun()["\""+t.innerHTML.split(":")[0]+"\""])?(rankMun()["\""+t.innerHTML.split(":")[0]+"\""]+'º - '):('');
					t.innerHTML=p+t.innerHTML;
				});
			});
			
		this.histTopByUCs.xAxis().tickFormat(function(d) {return d+utils.wildcardExchange(" %unit%");});
		this.histTopByUCs.data(function (group) {
				var fakeGroup=[];
				fakeGroup.push({key:Translation[Lang.language].without,value:0});
				return (group.all().length>0)?(group.top(10)):(fakeGroup);
			});
		this.histTopByUCs.title(function(d) {return d.key + ': ' + utils.numberByUnit(d.value) + utils.wildcardExchange(" %unit%");});
		this.histTopByUCs.label(function(d) {return d.key + ': ' + utils.numberByUnit(d.value) + utils.wildcardExchange(" %unit%");});

		let downloadCsvFnc=function(inpudata) {
	    	utils.download=function(data) {
				var blob = new Blob([d3.csv.format(data)], {type: "text/csv;charset=utf-8"});
		        saveAs(blob, downloadCtrl.getProject()+'-daily-'+downloadCtrl.getDownloadTime()+'.csv');
	    	};
	    	window.setTimeout(function() {
	    		var data=[];
		    	inpudata.forEach(function(d) {
		    		var o={};
		    		var dt = new Date(d.timestamp);
		    		o.viewDate = dt.toLocaleDateString();
				    o.areaMunKm = d.areaKm;
			    	o.areaUcKm = d.areaUcKm;
				    o.uc = ((d.uc!='null')?(d.uc):(''));
				    o.uf = d.uf;
				    o.municipio = d.county;
					o.geocod = d.codIbge;
				    if(d.areaKm) data.push(o);
				});
		    	utils.download(data);
	    	}, 200);
	    };

		// build download data
		d3.select('#download-csv-daily-all')
		.on('click', function() {let inpudata=graph.rawData; downloadCsvFnc(inpudata);});

		d3.select('#download-csv-daily')
		.on('click', function() {let inpudata=graph.dimensions["uf"].top(Infinity); downloadCsvFnc(inpudata);});
		
		// shapefile 
		d3.select('#download-shp')
		.on('click', function() {
			downloadCtrl.startDownload();
		});

		d3.select('#prepare_print')
	    .on('click', function() {
	    	graph.preparePrint();
	    });
		
		graph.doResize();
		window.onresize=utils.onResize;
		this.ctlFirstLoading=true;// to config for exec only once
	},
	preparePrint: function() {
		d3.select('#print_information').style('display','block');
		d3.select('#print_page')
	    .on('click', function() {
	    	d3.select('#print_information').style('display','none');
	    	window.print();
	    });
	},

	configurePrintKeys:function() {
		Mousetrap.bind(['command+p', 'ctrl+p'], function() {
	        console.log('command p or control p is disabled');
	        // return false to prevent default browser behavior
	        // and stop event from bubbling
	        return false;
	    });
	},
	restart() {
		graph.startLoadData();
	}
	
};

window.onload=function(){
	graph.configurePrintKeys();
	utils.datePicker.initComponent();//For enable datepicker with bootstrap and jquery
	Lang.init();
	graph.startLoadData();
	if(typeof Authentication!='undefined'){
		Authentication.serverURL='/oauth-api/';
		Authentication.init(Lang.language, function(){
			graph.resetFilters();
			graph.restart();
		});
	}
};