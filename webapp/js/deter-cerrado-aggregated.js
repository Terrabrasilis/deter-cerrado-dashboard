var utils = {
	config:{},
	statusPrint:false,
	cssDefault:true,
	btnPrintPage:function() {
		d3.select('#prepare_print')
	    .on('click', function() {
	    	utils.preparePrint();
	    });
	},
	displayLoginExpiredMessage() {
		if(Token.isExpiredToken()){
			d3.select('#expired_token_box').style('display','');
			Token.removeExpiredToken();
		}else{
			d3.select('#expired_token_box').style('display','none');
		}
	},
	getDefaultHeight:function() {
		return ((window.innerHeight*0.4).toFixed(0))*1;
	},
	btnDownload:function() {
		// without filters
		d3.select('#download-csv-monthly-all')
	    .on('click', function() {
			var blob = new Blob([d3.csv.format(graph.data)], {type: "text/csv;charset=utf-8"});
			saveAs(blob, 'deter-cerrado-aggregated-'+downloadCtrl.getDownloadTime()+'.csv');
		});
		// with filters
		d3.select('#download-csv-monthly')
	    .on('click', function() {
			var filteredData=graph.monthDimension.top(Infinity);
	        var blob = new Blob([d3.csv.format(filteredData)], {type: "text/csv;charset=utf-8"});
	        saveAs(blob, 'deter-cerrado-aggregated-'+downloadCtrl.getDownloadTime()+'.csv');
		});
		// shapefile 
		d3.select('#download-shp')
		.on('click', function() {
			downloadCtrl.startDownload('deter-cerrado');
		});
	},
	preparePrint: function() {
		d3.select('#print_information').style('display','block');
		d3.select('#print_page')
	    .on('click', function() {
	    	d3.select('#print_information').style('display','none');
	    	window.print();
	    });
	},
	btnChangeCalendar: function() {
		$('#change-calendar input').on('change', function() {
			graph.changeCalendar($('input[name=calendars]:checked', '#change-calendar').attr('id'));
		});
	},
	attachEventListeners:function() {
		utils.btnPrintPage();
		utils.btnDownload();
	},
	attachListenersToLegend: function() {
		var legendItems=$('#agreg .dc-legend-item');
		for(var i=0;i<legendItems.length;i++) {
			$(legendItems[i]).on('click', function (ev) {
				graph.barAreaByYear.filter(ev.currentTarget.textContent);
			});
		}
		
	},
	onResize:function(event) {
		clearTimeout(utils.config.resizeTimeout);
		utils.config.resizeTimeout = setTimeout(graph.doResize, 200);
	},
	renderAll:function() {
		dc.renderAll("agrega");
		dc.renderAll("filtra");
		d3.selectAll("circle")
			.attr("r",function(){return 5;})
			.on("mouseout.foo", function(){
				d3.select(this)
				.attr("r", function(){return 5;});
			});
		//utils.addGenerationDate();
	},
	// Used to update the footer position and date.
	// addGenerationDate: function() {
	// 	var footer_page=document.getElementById("footer_page");
	// 	var footer_print=document.getElementById("footer_print");
	// 	if(!footer_page || !footer_print) {
	// 		return;
	// 	}
	// 	var h=( (window.document.body.clientHeight>window.innerHeight)?(window.document.body.clientHeight):(window.innerHeight - 20) );
	// 	footer_page.style.top=h+"px";
	// 	footer_print.style.width=window.innerWidth+"px";
	// 	var now=new Date();
	// 	var footer=Translation[Lang.language].footer1+' '+now.toLocaleString()+' '+Translation[Lang.language].footer2;
	// 	footer_page.innerHTML=footer;
	// 	footer_print.innerHTML=footer;
	// },
	/*
	 * Remove numeric values less than 1e-6
	 */
	snapToZero:function(sourceGroup) {
		return {
			all:function () {
				return sourceGroup.all().map(function(d) {
					return {key:d.key,value:( (Math.abs(d.value)<1e-6) ? 0 : d.value )};
				});
			}
		};
	},
	rangesEqual: function (range1, range2) {
        if (!range1 && !range2) {
            return true;
        } else if (!range1 || !range2) {
            return false;
        } else if (range1.length === 0 && range2.length === 0) {
            return true;
        } else if (range1[0].valueOf() === range2[0].valueOf() &&
            range1[1].valueOf() === range2[1].valueOf()) {
            return true;
        }
        return false;
    },
	xaxis:function(d) {
		var list=[];
		if(graph.calendarConfiguration=='prodes') {
			list=Translation[Lang.language].months_of_prodes_year;
			return list[d-8];
		}else{
			list=Translation[Lang.language].months_of_civil_year;
			return list[d-1];
		}
	},
	monthYearList: function(monthNumber,month,years) {
		var fy=[];
		
		if(graph.calendarConfiguration=='prodes') {
			years.forEach(
			(y) =>
				{
					if(monthNumber >=13 && monthNumber<=19) {
						fy.push(y.split("/")[1]);
					}
					if(monthNumber >=8 && monthNumber<=12) {
						fy.push(y.split("/")[0]);
					}
				}
			);
		}else{
			fy=years;
		}
		fy.sort();
		return month+"/("+fy.join(", ")+")";
	},
	nameMonthsById: function(id) {
		var list={};
		if(graph.calendarConfiguration=='prodes') {
			list[13]='Jan';
			list[14]='Fev';
			list[15]='Mar';
			list[16]='Abr';
			list[17]='Mai';
			list[18]='Jun';
			list[19]='Jul';
			list[8]='Ago';
			list[9]='Set';
			list[10]='Out';
			list[11]='Nov';
			list[12]='Dez';
		}else{
			list[1]='Jan';
			list[2]='Fev';
			list[3]='Mar';
			list[4]='Abr';
			list[5]='Mai';
			list[6]='Jun';
			list[7]='Jul';
			list[8]='Ago';
			list[9]='Set';
			list[10]='Out';
			list[11]='Nov';
			list[12]='Dez';
		}
		
		return list[id];
	},
	fakeMonths: function(d) {
		var list=[],m=1;
		if(graph.calendarConfiguration=='prodes') {
			list=[13,14,15,16,17,18,19,8,9,10,11,12];
			m=list[d-1];
		}else{
			m=d;
		}
		return m;
	},
	displayWarning:function(enable) {
		if(enable===undefined) enable=true;
		document.getElementById("warning_data_info").style.display=((enable)?(''):('none'));
		document.getElementById("warning_data_info").innerHTML='<h3><span id="txt7">'+Translation[Lang.language].txt7+'</span></h3>';
		document.getElementById("loading_data_info").style.display=((enable)?('none'):(''));
	},
	displayGraphContainer:function() {
		d3.select('#panel_container').style('display','block');
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
	changeCss: function(bt) {
		utils.cssDefault=!utils.cssDefault;
		document.getElementById('stylesheet_dash').href='../theme/css/dashboard-aggregated'+((utils.cssDefault)?(''):('-dark'))+'.css';
		bt.style.display='none';
		setTimeout(bt.style.display='',200);
	},

	highlightSelectedMonths: function() {
		let iMin=(graph.calendarConfiguration=='prodes')?(8):(1);
		let iMax=(graph.calendarConfiguration=='prodes')?(20):(13);
		for (var i=iMin;i<iMax;i++) {
			if(graph.monthFilters.includes(i) || !graph.monthFilters.length) {
				d3.select('#month_'+i).style('opacity', '1');
			}else {
				d3.select('#month_'+i).style('opacity', '0.4');
			}
		}
	},

	setMonthNamesFilterBar: function() {
		let iMin=(graph.calendarConfiguration=='prodes')?(8):(1);
		let iMax=(graph.calendarConfiguration=='prodes')?(20):(13);
		for (var i=iMin;i<iMax;i++) {
			d3.select('#month_'+i).html((graph.calendarConfiguration=='prodes')?(Translation[Lang.language].months_of_prodes_year[i-8]):(Translation[Lang.language].months_of_civil_year[i-1]));
		}
	},

	makeMonthsChooserList: function() {
		let template='';
		let iMin=(graph.calendarConfiguration=='prodes')?(8):(1);
		let iMax=(graph.calendarConfiguration=='prodes')?(20):(13);
		for (var i=iMin;i<iMax;i++) {
			template+='<div id="month_'+i+'" class="col-md-1 month_box" onclick="graph.applyMonthFilter('+i+')"></div>';
		}
		$('#months_chooser').html(template);
	}
};

var graph={
	
	totalizedAreaInfoBox:undefined,// totalized area info box
	totalizedAlertsInfoBox:undefined,// totalized alerts info box

	focusChart: null,
	//overviewChart: null,
	ringTotalizedByState: null,
	barAreaByYear: null,

	monthFilters: [],
	
	monthDimension: null,
	temporalDimension: null,
	areaGroup: null,
	yearDimension0: null,
	ufDimension0: null,
	yearDimension: null,
	yearGroup: null,
	ufDimension: null,
	ufGroup: null,
	numPolDimension: null,
	totalAreaGroup: null,
	totalAlertsGroup: null,
	
	data:null,

	pallet: null,
	darkPallet: null,
	histogramColor: null,
	darkHistogramColor: null,
	barTop10Color: null,
	darkBarTop10Color: null,

	defaultHeight: null,

	calendarConfiguration: 'prodes',

	/**
	 * Load configuration file before loading data.
	 */
	loadConfigurations: function(callback) {
		
		d3.json("config/deter-cerrado-aggregated.json", function(error, conf) {
			if (error) {
				console.log("Didn't load config file. Using default options.");
			}else{
				if(conf) {
					graph.pallet=conf.pallet?conf.pallet:graph.pallet;
					graph.darkPallet=conf.darkPallet?conf.darkPallet:graph.darkPallet;
					graph.histogramColor=conf.histogramColor?conf.histogramColor:graph.histogramColor;
					graph.darkHistogramColor=conf.darkHistogramColor?conf.darkHistogramColor:graph.darkHistogramColor;
					graph.barTop10Color=conf.barTop10Color?conf.barTop10Color:graph.barTop10Color;
					graph.darkBarTop10Color=conf.darkBarTop10Color?conf.darkBarTop10Color:graph.darkBarTop10Color;
					graph.defaultHeight=conf.defaultHeight?conf.defaultHeight:graph.defaultHeight;
				}
			}
			callback();
		});
	},
	doResize: function() {
		graph.defaultHeight = utils.getDefaultHeight();
		utils.renderAll();
	},
	getYears: function() {
		return this.yearDimension.group().all();
	},
	getRangeYears: function() {
		var ys=this.getYears(), l=ys.length;
		var y=[];
		for(var i=0;i<l;i++) {
			y.push(ys[i].key);
		}
		return y;
	},
	getOrdinalColorsToYears: function() {
		var c=[];
		var ys=this.getRangeYears();
		var cor=d3.scale.category20();
		for(var i=0;i<ys.length;i++) {
			c.push({key:ys[i],color:cor(i)});
		}
		return c;
	},
	setChartReferencies: function() {
		this.totalizedAlertsInfoBox = dc.numberDisplay("#numpolygons", "agrega");
		this.totalizedAreaInfoBox = dc.numberDisplay("#custom-classes", "agrega");
		this.focusChart = dc.seriesChart("#agreg", "agrega");
		//this.overviewChart = dc.seriesChart("#agreg-overview", "agrega");
		this.ringTotalizedByState = dc.pieChart("#chart-by-state", "filtra");
		this.barAreaByYear = dc.barChart("#chart-by-year", "filtra");
	},
	loadUpdatedDate: function() {
		// to prevent error on localhost developer environment
		if(window.location.host!="terrabrasilis.dpi.inpe.br") return;

		var url="http://terrabrasilis.dpi.inpe.br/geoserver/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=deter-cerrado:updated_date&OUTPUTFORMAT=application%2Fjson";

		if(Token.hasToken()){
			url="http://terrabrasilis.dpi.inpe.br/geoserver/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=deter-cerrado:last_date&OUTPUTFORMAT=application%2Fjson";
		}
		d3.json(url, (json) => {
			var dt=new Date(json.features[0].properties.updated_date+'T21:00:00.000Z');
			d3.select("#updated_date").html(' '+dt.toLocaleDateString());
		});
	},
	loadData: function(url) {
		d3.json(url)
		.header("Authorization", "Bearer "+Token.getToken())
		.get(function(error, root) {
			if(error && error.status==401) {
				Token.logout();
				Token.setExpiredToken(true);
			}else{
				graph.processData(root);
			}
		});
	},
	processData: function(data) {
		// if (error) {
		// 	//utils.displayError( Translation[Lang.language].failure_load_data );
		// 	utils.displayWarning(true);
		// 	return;
		// }else
		if(!data || !data.totalFeatures || data.totalFeatures<=0) {
			utils.displayWarning(true);
			return;
		}
		utils.displayGraphContainer();
		
		var numberFormat = d3.format('.4f');
		var o=[];
		
		for (var j = 0, n = data.totalFeatures; j < n; ++j) {
			var fet=data.features[j];
			var month=+fet.properties.m;
			var year=+fet.properties.y;
			if(graph.calendarConfiguration=='prodes') {
				if(month >=1 && month<=7) {
					year = "20"+(year-1)+"/20"+year;
				}
				if(month >=8 && month<=12) {
					year = "20"+year+"/20"+(year+1);
				}
			}else{
				year = "20"+year;
			}

			o.push({Year:year,Month:month,Area:numberFormat(fet.properties.ar)*1,uf:fet.properties.uf,numPol:fet.properties.np});
		}
		data = o;
		graph.registerDataOnCrossfilter(data);
		utils.displayWaiting(false);
		graph.build();
	},
	registerDataOnCrossfilter: function(data) {
		graph.data=data;
		var ndx0 = crossfilter(data),
		ndx1 = crossfilter(data);
		
		this.monthDimension = ndx1.dimension(function(d) {
			var m=utils.fakeMonths(d.Month);
			return m;
		});
		this.temporalDimension = ndx0.dimension(function(d) {
			var m=utils.fakeMonths(d.Month);
			return [d.Year, m];
		});
		this.areaGroup = this.temporalDimension.group().reduceSum(function(d) {
			return d.Area;
		});
		this.yearDimension0 = ndx0.dimension(function(d) {
			return d.Year;
		});
		this.ufDimension0 = ndx0.dimension(function(d) {
			return d.uf;
		});
		this.yearDimension = ndx1.dimension(function(d) {
			return d.Year;
		});
		this.yearGroup = this.yearDimension.group().reduceSum(function(d) {
			return d.Area;
		});
		this.ufDimension = ndx1.dimension(function(d) {
			return d.uf;
		});
		this.ufGroup = this.ufDimension.group().reduceSum(function(d) {
			return d.Area;
		});
		this.numPolDimension = ndx1.dimension(function(d) {
			return d.numPol;
		});

		this.totalAreaGroup = ndx1.groupAll().reduce(
			function (p, v) {
				++p.n;
				p.tot += v.Area;
				return p;
			},
			function (p, v) {
				--p.n;
				p.tot -= v.Area;
				return p;
			},
			function () { return {n:0,tot:0}; }
		);
		this.totalAlertsGroup = this.numPolDimension.groupAll().reduce(
			function (p, v) {
				p.tot += v.numPol;
				return p;
			},
			function (p, v) {
				p.tot -= v.numPol;
				return p;
			},
			function () { return {tot:0}; }
		);
	},
	build: function() {
		var	barColors = this.getOrdinalColorsToYears();
		
		this.setChartReferencies();

		var htmlBox="<div class='icon-left'><i class='fa fa-leaf fa-2x' aria-hidden='true'></i></div><span class='number-display'>";
		
		this.totalizedAreaInfoBox.formatNumber(localeBR.numberFormat(',1f'));
		this.totalizedAreaInfoBox.valueAccessor(function(d) {return d.n ? d.tot.toFixed(2) : 0;})
	      .html({
			one:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>0 km²</div></span>"
	      })
	      .group(this.totalAreaGroup);
		

		// build totalized Alerts box
		// use format integer see: http://koaning.s3-website-us-west-2.amazonaws.com/html/d3format.html
		this.totalizedAlertsInfoBox.formatNumber(localeBR.numberFormat(','));
		this.totalizedAlertsInfoBox.valueAccessor(function(d) {
				return d.tot ? d.tot : 0;
			})
			.html({
			one:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>%number</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>%number</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>0</div></span>"
			})
			.group(this.totalAlertsGroup);
		
		let fcDomain=d3.scale.linear().domain( (graph.calendarConfiguration=='prodes')?([8,19]):([1,12]) );

		this.focusChart
			.height(this.defaultHeight-70)
			.chart(function(c) { return dc.lineChart(c).renderDataPoints(true).evadeDomainFilter(true); })
			//.chart(function(c) { return dc.lineChart(c).interpolate('cardinal').renderDataPoints(true).evadeDomainFilter(true); })
			.x(fcDomain)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.brushOn(false)
			.yAxisLabel(Translation[Lang.language].focus_y_label)
			//.xAxisLabel(Translation[Lang.language].focus_x_label)
			.elasticY(true)
			.yAxisPadding('10%')
			.clipPadding(10)
			.dimension(this.temporalDimension)
			.group(this.areaGroup)
			//.rangeChart(this.overviewChart)
			.title(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
				v=localeBR.numberFormat(',1f')(v);
				return utils.xaxis(d.key[1]) + " - " + d.key[0]
				+ "\n"+Translation[Lang.language].area+" " + v + " "+Translation[Lang.language].unit;
			})
			.seriesAccessor(function(d) {
				return d.key[0];
			})
			.keyAccessor(function(d) {
				return d.key[1];
			})
			.valueAccessor(function(d) {
				if(!graph.focusChart.hasFilter()) {
					return Math.abs(+(d.value.toFixed(2)));
				}else{
					if(graph.monthFilters.indexOf(d.key[1])>=0) {
						return Math.abs(+(d.value.toFixed(2)));
					}else{
						return 0;
					}
				}
			})
			.legend(dc.legend().x(100).y(30).itemHeight(15).gap(5).horizontal(1).legendWidth(600).itemWidth(80))
			.margins({top: 20, right: 35, bottom: 30, left: 65});

		this.focusChart.yAxis().tickFormat(function(d) {
			//return d3.format(',d')(d);
			return localeBR.numberFormat(',1f')(d);
		});
		this.focusChart.xAxis().tickFormat(function(d) {
			return utils.xaxis(d);
		});

		this.focusChart.on('filtered', function(chart) {
			if(chart.filter()) {
				graph.monthDimension.filterFunction(
					(d) => {
						return graph.monthFilters.includes(d);
					}
				);
				dc.redrawAll("filtra");
			}
		});

		this.focusChart.on('renderlet', function(chart) {
			utils.attachListenersToLegend();
			dc.redrawAll("filtra");
			var years=[];
			if(graph.barAreaByYear.hasFilter()){
				years=graph.barAreaByYear.filters();
			}else{
				graph.barAreaByYear.group().all().forEach((d)=> {years.push(d.key);});
			}

			if(!chart.hasFilter()){
				$('#txt18').css('display','none');// hide filter reset buttom
				$('#txt8b').html(Translation[Lang.language].allTime);
				$('#highlight-time').html("&nbsp;" +  years.join(", ") );
			}else{
				var fp="", allData=chart.group().top(Infinity);
				graph.monthFilters.forEach(
					(monthNumber) => {
						var ys=[];
						allData.some(
							(d)=> {
								years.forEach(
									(year) => {
										if(d.key.includes(monthNumber) && d.key.includes(year)) {
											ys.push(year);
											return true;
										}
									}
								);
							}
						);
						if(ys.length) fp+=(fp==''?'':',')+utils.monthYearList(monthNumber,utils.nameMonthsById(monthNumber),ys);
					}
				);
				$('#txt18').css('display','');// display filter reset buttom
				$('#txt8b').html(Translation[Lang.language].someMonths);
				$('#highlight-time').html("&nbsp;" +  fp );
			}
		});

		this.focusChart.colorAccessor(function(d) {
			var i=0,l=barColors.length;
			while(i<l){
				if(barColors[i].key==d.key){
					return barColors[i].color;
				}
				i++;
			}
		});

		this.ringTotalizedByState
			.height(this.defaultHeight)
			.innerRadius(10)
			.externalRadiusPadding(30)
			.dimension(this.ufDimension)
			.group(this.ufGroup)
			.title(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
				v=localeBR.numberFormat(',1f')(v);
				return d.key+": " + v + " "+Translation[Lang.language].unit;
			})
			.label(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
				v=localeBR.numberFormat(',1f')(v);
				return v + " "+Translation[Lang.language].unit;
			})
			.ordering(dc.pluck('key'))
			.ordinalColors((utils.cssDefault)?(graph.pallet):(graph.darkPallet))
			.legend(dc.legend().x(20).y(10).itemHeight(13).gap(7).horizontal(0).legendWidth(50).itemWidth(35));
			//.legend(dc.legend());
			//.ordinalColors(["#FF0000","#FFFF00","#FF00FF","#F8B700","#78CC00","#00FFFF","#56B2EA","#0000FF","#00FF00"])

	
		this.ringTotalizedByState.valueAccessor(function(d) {
			return Math.abs(+(d.value.toFixed(2)));
		});

		this.barAreaByYear
			.height(this.defaultHeight)
			.yAxisLabel(Translation[Lang.language].area+" ("+Translation[Lang.language].unit+")")
			.xAxisLabel( (graph.calendarConfiguration=='prodes')?(Translation[Lang.language].barArea_x_label_prodes):(Translation[Lang.language].barArea_x_label) )
			.dimension(this.yearDimension)
			.group(utils.snapToZero(this.yearGroup))
			.title(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
				v=localeBR.numberFormat(',1f')(v);
				return Translation[Lang.language].area+": " + v + " "+Translation[Lang.language].unit;
			})
			.label(function(d) {
				var v=Math.abs(+(parseFloat(d.data.value).toFixed(0)));
				v=localeBR.numberFormat(',1f')(v)+ " "+Translation[Lang.language].unit;
				return v;
			})
			.elasticY(true)
			.yAxisPadding('10%')
			.x(d3.scale.ordinal())
	        .xUnits(dc.units.ordinal)
	        .barPadding(0.2)
			.outerPadding(0.1)
			.renderHorizontalGridLines(true)
			.colorAccessor(function(d) {
				var i=0,l=barColors.length;
				while(i<l){
					if(barColors[i].key==d.key){
						return barColors[i].color;
					}
					i++;
				}
			})
			.margins({top: 20, right: 35, bottom: 50, left: 55});

		//this.barAreaByYear.margins().left += 30;
		
		dc.chartRegistry.list("filtra").forEach(function(c,i){
			c.on('filtered', function(chart, filter) {
				var filters = chart.filters();

				if(chart.anchorName()=="chart-by-year"){
					if(!filters.length) {
						graph.yearDimension0.filterAll();
					}else {
						graph.yearDimension0.filterFunction(function (d) {
							for (var i = 0; i < filters.length; i++) {
								var f = filters[i];
								if (f.isFiltered && f.isFiltered(d)) {
									return true;
								} else if (f <= d && f >= d) {
									return true;
								}
							}
							return false;
						});
					}
				}
				if(chart.anchorName()=="chart-by-state"){
					if(!filters.length) {
						graph.ufDimension0.filterAll();
					}else {
						graph.ufDimension0.filterFunction(function (d) {
							for (var i = 0; i < filters.length; i++) {
								var f = filters[i];
								if (f.isFiltered && f.isFiltered(d)) {
									return true;
								} else if (f <= d && f >= d) {
									return true;
								}
							}
							return false;
						});
					}
				}
				dc.redrawAll("agrega");
				//utils.addGenerationDate();
			});
		});
		utils.renderAll();
		utils.attachListenersToLegend();
		utils.setMonthNamesFilterBar();
	},
	init: function() {
		window.onresize=utils.onResize;
		
		utils.displayWaiting();
		utils.displayLoginExpiredMessage();
		this.loadConfigurations(this.startLoadData);
	},

	startLoadData() {
		Lang.apply();
		//var dataUrl = "./data/deter-cerrado-month.json";
		var dataUrl = "http://terrabrasilis.dpi.inpe.br/file-delivery/download/deter-cerrado/monthly";
		graph.loadData(dataUrl);
		graph.loadUpdatedDate();
		utils.attachEventListeners();
	},

	/*
	 * Called from the UI controls to clear one specific filter.
	 */
	resetFilter: function(who,group) {
		var g=(typeof group === 'undefined')?("filtra"):(group);
		if(who=='state'){
			graph.ringTotalizedByState.filterAll();
		}else if(who=='year'){
			graph.barAreaByYear.filterAll();
		}else if(who=='agreg'){
			//graph.overviewChart.filterAll();
			graph.focusChart.filterAll();
			graph.monthDimension.filterAll();
			graph.monthFilters=[];
			utils.highlightSelectedMonths();
			dc.redrawAll("filtra");
		}
		dc.redrawAll(g);
	},
	resetFilters: function() {
		graph.ringTotalizedByState.filterAll();
		graph.barAreaByYear.filterAll();
		//graph.overviewChart.filterAll();
		graph.focusChart.filterAll();
		graph.monthDimension.filterAll();
	},

	/**
	 * Filter by months selected on the month list.
	 * @param {number} aMonth, a fake number of month. To map for real number, see utils.nameMonthsById
	 */
	applyMonthFilter: function(aMonth) {
		if(graph.focusChart.hasFilter()) {
			graph.focusChart.filterAll();
		}
		var pos=graph.monthFilters.indexOf(aMonth);
		if(pos<0) {
			graph.monthFilters.push(aMonth);
		}else{
			graph.monthFilters.splice(pos,1);
		}

		if (graph.monthFilters.length) {
			graph.monthFilters.sort(
				(a,b) => {
					return a>b;
				}
			);
			var min=graph.monthFilters[0],max=graph.monthFilters[graph.monthFilters.length-1];
			graph.focusChart.filter([min,max]);
			graph.focusChart.redraw();
			dc.redrawAll("agrega");
		}else {
			graph.resetFilter('agreg','agrega');
		}

		utils.highlightSelectedMonths();
	},

	changeCalendar(value) {
		graph.calendarConfiguration=(value=='prodes-calendar')?('prodes'):('civil');
		graph.restart();
	},

	restart() {
		graph.monthFilters=[];
		utils.makeMonthsChooserList();
		utils.highlightSelectedMonths();
		graph.startLoadData();
	}
};

window.onload=function(){
	Mousetrap.bind(['command+p', 'ctrl+p'], function() {
        console.log('command p or control p');
        // return false to prevent default browser behavior
        // and stop event from bubbling
        return false;
	});
	utils.makeMonthsChooserList();
	utils.btnChangeCalendar();
	Lang.init();
	loginUI.init();
	graph.init();
};