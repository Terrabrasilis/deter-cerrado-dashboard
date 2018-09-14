var utils = {
	config:{},
	printWindow:null,
	statusPrint:false,
	cssDefault:true,
	BAR_PADDING: .1, // percentage the padding will take from the bar
    RANGE_BAND_PADDING: .2, // padding between 'groups'
    OUTER_RANGE_BAND_PADDING: 0.01, // padding from each side of the chart

    barPadding:undefined,
    scaleSubChartBarWidth: chart => {
        let subs = chart.selectAll(".sub");

        if (typeof utils.barPadding === 'undefined') { // first draw only
            // to percentage
            utils.barPadding = utils.BAR_PADDING / subs.size() * 100;
            // each bar gets half the padding
            utils.barPadding = utils.barPadding / 2;
        }

        let startAt, endAt,
            subScale = d3.scale.linear().domain([0, subs.size()]).range([0, 100]);

        subs.each(function (d, i) {

            startAt = subScale(i + 1) - subScale(1);
            endAt = subScale(i + 1);

            startAt += utils.barPadding;
			endAt -= utils.barPadding;
            d3.select(this)
				.selectAll('rect')
				.attr("clip-path", `polygon(${startAt}% 0, ${endAt}% 0, ${endAt}% 100%, ${startAt}% 100%)`);
        });
    },
	setConfig: function(config) {
		utils.config=config;
	},
	onResize:function(event) {
		clearTimeout(utils.config.resizeTimeout);
		utils.config.resizeTimeout = setTimeout(utils.rebuildAll, 200);
	},
	updateDimensions: function() {
		var d={ w: window.innerWidth,
				h: window.innerHeight};
		graph.setDimensions(d);
	},
	setDinamicTexts: function() {
		var startYear=graph.yearDimension.bottom(1),
		endYear=graph.yearDimension.top(1);
		var yearRange = document.getElementById('year-range');
		yearRange.innerText=startYear[0].year+" - "+endYear[0].year;
	},
	totalRateCalculator: function() {
		var itens=graph.ufRateGroup.top(Infinity);
		var t=0;
		itens.forEach(function(d){
			t+=d.value;
		});
		return t;
	},
	/*
	 * Remove numeric values less than 1e-6
	 */
	snapToZero:function(sourceGroup) {
		return {
			all:function () {
				return sourceGroup.all().map(function(d) {
					return {key:d.key,value:( (Math.abs(d.value)<1e-6) ? 0 : d.value )};
				});
			},
			top: function(n) {
				return sourceGroup.top(Infinity)
					.filter(function(d){
						return (Math.abs(d.value)>1e-6);
						})
					.slice(0, n);
			}
		};
	},
	/**
	 * Using to format values for display aver charts
	 */
	labelFormat:function(value) {
		value=( (Math.abs(value)<1e-6) ? 0 : value );
		var t=value;
		if(value>1000) {// quilo (k)
			t=Math.abs((value/1000).toFixed(1));
			t=localeBR.numberFormat(',1f')(t)+"k";
		}else if(value>100) {// hecto (h)
			t=Math.abs((value).toFixed(1));
			t=localeBR.numberFormat(',1f')(t);//+"h";
		}else if(value>10) {//deca	(da)
			t=Math.abs((value).toFixed(1));
			t=localeBR.numberFormat(',1f')(t);//+"da";
		}else if(value>1) {// without suffix
			t=Math.abs((value).toFixed(1));
			t=localeBR.numberFormat(',1f')(t);
		}else{
			t=Math.abs((value).toFixed(2));
			t=localeBR.numberFormat(',1f')(parseFloat(t));
		}

		return t;
	},
	/**
	 * anArray contains the array of objects gathering from crossfilter group.
	 * substring is string that you want
	 */
	findInArray:function(anArray,substring) {
		substring=substring.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
		var found = $.grep( anArray, function ( value, i) {
			return (value.key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").indexOf(substring) >= 0)
		});
		return found;
	},
	findUsingStates:function(anArray, states) {
		var found=[];
		states.forEach(state => {
			found=found.concat($.grep( anArray, function ( value, i) {
				return (value.key.split('/')[1]===state)
			}));
		})
		return found;
	},
	searchCountyByEnterKey: function(key){
		if(key.keyCode==13){
			utils.searchCounty();
		}
		return key;
	},
	searchCounty:function(){
		var r=utils.findInArray(graph.munGroup.all(), $('#search-county')[0].value);
		// filter with previously selected states.
		if(r.length>0 && graph.pieTotalizedByState.hasFilter()){
			r=utils.findUsingStates(r, graph.pieTotalizedByState.filters());
		}
		// display results, if find only one result then hide modal and apply result directly
		if(r.length==1) {
			utils.selectedItem(r[0].key,r[0].value);
		}else{
			this.showFilteredItems(r);
		}
	},
	showFilteredItems: function(r) {
		(r.length==0)?($('#txt1h').hide()):($('#txt1h').show());
		document.getElementById("filtered-list").innerHTML=(r.length==0)?(Translation[Lang.language].not_found):("");
		r.forEach(function(o){
			var m=o.key.replace("'","´");
			document.getElementById("filtered-list").innerHTML+="<li><a href=\"javascript:utils.selectedItem('"+m+"',"+o.value+");\">"+m+"</a></li>";
		});
		$('#modal-container-filtered').modal('show');
	},
	selectedItem: function(key,value) {
		$('#modal-container-filtered').modal('hide');
		graph.applyCountyFilter([{key:key.replace("´","'"),value:value}]);
	},
	getMunOrder: function() {
		var allTop=graph.munAreaMunGroup.top(Infinity);
		var ar={};
		allTop.forEach(function(k,i){ar["\""+k.key+"\""]=(i+1);});
		return ar;
	},
	rebuildAll: function() {
		utils.updateDimensions();
		graph.updateChartsDimensions();
	},
	addGenerationDate: function() {
		var footer_page=document.getElementById("footer_page");
		var footer_print=document.getElementById("footer_print");
		if(!footer_page || !footer_print) {
			return;
		}
		var h=( (window.document.body.clientHeight>window.innerHeight)?(window.document.body.clientHeight):(window.innerHeight - 20) );
		footer_print.style.width=window.innerWidth+"px";
		var now=new Date();
		var footer=Translation[Lang.language].footer1+' '+now.toLocaleString()+' '+Translation[Lang.language].footer2;
		footer_page.innerHTML=footer;
		footer_print.innerHTML=footer;
	},
	changeCss: function(bt) {
		utils.cssDefault=!utils.cssDefault;
		document.getElementById('stylesheet_dark').href=((utils.cssDefault)?(''):('./css/dashboard-cerrado-rates-dark.css'));
		bt.style.display='none';
		setTimeout(function(){bt.style.display='';},200);
	},
	collapsePanel: function() {
		var selectIds = $('#collapse1, #collapse2');
		// occurs when the collapsible element is about to be shown or to be hidden
		$(function() { // the page is in a state where it's ready to be manipulated ($(document).ready)
			selectIds.on('show.bs.collapse hidden.bs.collapse', function () {
				// alternate between plus and minus
				$(this).prev('.panel-heading').find('.glyphicon').toggleClass('glyphicon-chevron-right glyphicon-chevron-down'); 
			});
		});
	},
	attachEventListeners: function(){
		// hack to an issue in composite bar chart
		$('#modal-container-filtered').on('shown.bs.modal hidden.bs.modal',function(){dc.redrawAll();});
	},
	loadingShow: function(ctl) {
		d3.select('#panel_container').style('display', (ctl)?('none'):(''));
		d3.select('#display_loading').style('display',(ctl)?('block'):('none'));
		document.getElementById("inner_display_loading").innerHTML=(ctl)?
		('<span id="animateIcon" class="glyphicon glyphicon-refresh glyphicon-refresh-animate" aria-hidden="true"></span>'):('');
	},
	displayError:function(error) {
		d3.select('#panel_container').style('display','none');
		d3.select('#display_error').style('display','block');
		document.getElementById("inner_display_error").innerHTML=Translation[Lang.language].failure_load_data+
		'<span id="dtn_refresh" class="glyphicon glyphicon-refresh" aria-hidden="true" title="'+Translation[Lang.language].refresh_data+'"></span>';
		setTimeout(function(){
			d3.select('#dtn_refresh').on('click', function() {
				window.location.reload();
		    });
		}, 300);
	},
	displayNoData:function() {
		this.displayError(Translation[Lang.language].no_data);
	},
	displayGraphContainer:function() {
		d3.select('#panel_container').style('display','block');
	},
	displayDisclaimer: function(){
		$('#modal-container-general-info').modal('show');
	}
};

var graph={

	lineRateByYear: null,
	lineRateByYearState: null,
	pieTotalizedByState: null,
	rowTop10ByMun: null,
	barChart1: null,
	barChart2: null,
	compositeChart: null,
	ratesDataTable: null,
	relativeRatesDataTable: null,

	yearDimension: null,
	ufDimension: null,
	munDimension: null,
	ufYearDimension: null,
	stateYearDimension: null,
	countyYearDimension: null,
	countyDimension: null,
	compositeDimension: null,
	munAreaMunGroup: null,
	munGroup: null,
	compositeGroup: null,

	yearRateGroup: null,
	ufRateGroup: null,
	stateYearRateGroup: null,
	countyYearRateGroup: null,

	data:null,
	data_all:null,

	winWidth: window.innerWidth,
	winHeight: window.innerHeight,

	histogramColor: ["#0000FF","#57B4F0"],
	darkHistogramColor: ["#ffd700","#fc9700"],
	pallet: ["#FF0000","#FF6A00","#FF8C00","#FFA500","#FFD700","#FFFF00","#DA70D6","#BA55D3","#7B68EE"],
	darkPallet: ["#FF0000","#FF6A00","#FF8C00","#FFA500","#FFD700","#FFFF00","#DA70D6","#BA55D3","#7B68EE"],
	barTop10Color: "#b8b8b8",
	darkBarTop10Color: "#232323",
	displayInfo: false,
	displaySwapPanelButton: false,

	/**
	 * Load configuration file before loading data.
	 */
	loadConfigurations: function(callback) {
		
		d3.json("config/config-rates.json", function(error, conf) {
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
					graph.displayInfo=conf.displayInfo?conf.displayInfo:graph.displayInfo;
					graph.displaySwapPanelButton=conf.displaySwapPanelButton?conf.displaySwapPanelButton:graph.displaySwapPanelButton;
				}
			}
			callback();
		});
		
	},
	setDimensions: function(dim) {
		this.winWidth=dim.w;
		this.winHeight=dim.h;
	},
	updateChartsDimensions: function() {
		var w=parseInt(this.winWidth - (this.winWidth * 0.05)),
		h=parseInt(this.winHeight * 0.3),
		fw=parseInt(w),
		fh=parseInt((this.winHeight - h) * 0.6),
		fw34 = parseInt( (fw/4) * 3),
		fw14 = parseInt(fw/4);

		// to single column in main container
		var chartByState=document.getElementById('chart-by-state')
		if((chartByState.clientWidth*4) > window.document.body.clientWidth) {
			fw = chartByState.clientWidth;
			fw34 = fw;
			fw14 = fw;
		}

		this.lineRateByYear
			.width(fw34)
			.height(fh)
			.margins({top: 0, right: 10, bottom: 50, left: 65})
			.legend(dc.legend().x(fw34-180));
			//.legend(dc.legend().x(fw34 - 380).y(5).itemHeight(13).gap(7).horizontal(1).legendWidth(380).itemWidth(40));
		this.lineRateByYearState
			.width(fw34)
			.height(fh)
			.margins({top: 0, right: 10, bottom: 50, left: 65})
			.legend(dc.legend().x(fw34-180));
		this.pieTotalizedByState
			.width(fw14)
			.height(fh)
			.legend(dc.legend().x(0).y(0).itemHeight(13).gap(7).horizontal(1).legendWidth((fw14>=400)?(400):(200)).itemWidth(40));
		this.rowTop10ByMun
			.width(fw14)
			.height(fh)
			.margins({top: 0, right: 10, bottom: 50, left: 65});
		
		this.compositeChart
			.width(fw34)
			.height(fh)
			.margins({top: 0, right: 10, bottom: 50, left: 65})
			.legend(
				dc.legend()
				.x(fw34 - 380)
				.y(5)
				.itemHeight(13)
				//.gap(7)
				.horizontal(1)
				.legendWidth(380)
				.itemWidth(120)
				.legendText(function (d) {
					return (d.color==graph.histogramColor[0] || d.color==graph.darkHistogramColor[0])?(Translation[Lang.language].without_filter):(Translation[Lang.language].with_filter)
				})
			);
		this.barChart1
			.margins({top: 0, right: 10, bottom: 50, left: 65});
		this.barChart2
			.margins({top: 0, right: 10, bottom: 50, left: 65});
		
		dc.renderAll();
	},
	setChartReferencies: function() {

		this.pieTotalizedByState = dc.pieChart("#chart-by-state");
		this.rowTop10ByMun = dc.rowChart("#chart-by-mun");
		this.compositeChart = dc.compositeChart("#chart-bar-by-year-625");
		this.barChart1 = dc.barChart(this.compositeChart);
		this.barChart2 = dc.barChart(this.compositeChart)
		this.ratesDataTable = dataTable("rates-data-table");
		this.relativeRatesDataTable = dataTable("relative-rates-data-table");
	},
	loadData: function() {
		utils.loadingShow(true);
		// load data from CSV file
		//d3.csv("data/cerrado_rates_d.csv", graph.processData);
		
		// download data in JSON format from TerraBrasilis API service.
		var url="http://terrabrasilis.info/data-api/api/v1/increase-cerrado/all";
		d3.json(url, graph.processData);
		
		// load data from JSON file
		//var url="data/cerrado.json";
		//d3.json(url, graph.processData);
	},
	processData: function(error, data) {
		utils.loadingShow(false);
		if (error) {
			utils.displayError( error );
			return;
		}else if(!data) {
			utils.displayNoData();
			return;
		}else {
			utils.displayGraphContainer();
			// normalize all data
			var o=[],t=[],len=data[0].totalElements,data=data[0].properties, cerrado=[];
			for (var j = 0, n = len; j < n; ++j) {
				var y=data[j].a;
				var obj={
					uf:data[j].d,
					year:y,
					rate:+data[j].b,
					ufYear:data[j].d + "/" + y,
					county:data[j].c + '/' + data[j].d,
					key:y,
					value:{
						aream: +data[j].b,
						areat: ((data[j].g)?(+data[j].g):(0))
					}
				};
				o.push(obj);

				if(cerrado[y]===undefined){
					cerrado[y]=0;
				}
				cerrado[y]+=data[j].b;
			}
			// to prepare the general sum for "cerrado" column
			cerrado.forEach(function(v,k){
				var obj={
					uf:'CERRADO',
					year:k,
					rate:+v,
					ufYear:"CERRADO/" + k
				};
				t.push(obj);
			});
			
			data = o;
			graph.data_all = t;
			graph.registerDataOnCrossfilter(data);
			graph.setChartReferencies();
			graph.build();
		}
	},
	registerDataOnCrossfilter: function(data) {
		graph.data=data;

		let ndx = crossfilter(data), ndx1 = crossfilter(data);
		
		this.yearDimension = ndx.dimension(function(d) {
			return d.year;
		});
		this.ufDimension = ndx.dimension(function(d) {
			return d.uf;
		});
		this.munDimension = ndx.dimension(function(d) {
			return d.county;
		});
		this.ufYearDimension = ndx.dimension(function(d) {
			return d.ufYear;
		});
		this.stateYearDimension = ndx.dimension(function(d) {
			return [d.uf, +d.year];
		});
		this.compositeDimension = ndx.dimension(function(d) {
			return d.key;
		});

		this.countyYearDimension = ndx1.dimension(function(d) {
			return [d.county, +d.year];
		});
		this.countyDimension = ndx1.dimension(function(d) {
			return d.county;
		});


		this.yearRateGroup = this.yearDimension.group().reduceSum(function(d) {
			return +d.rate;
		});
		this.yearGroup = this.yearDimension.group().reduceSum(function(d) {
			return +d.year;
		});
		this.ufRateGroup = this.ufDimension.group().reduceSum(function(d) {
			return +d.rate;
		});
		this.stateYearRateGroup = this.stateYearDimension.group().reduceSum(function(d) {
			return +d.rate;
		});
		this.countyYearRateGroup = this.countyYearDimension.group().reduceSum(function(d) {
			return +d.rate;
		});
		this.munAreaMunGroup = this.munDimension.group().reduceSum(function(d) {
			return +d.rate;
		});

		this.munGroup = this.munDimension.group().reduceCount(function(d) {return d;});

		this.rateSumGroup = this.yearDimension.group().reduce(
			function(p, v) {
				p[v.uf] = (p[v.uf] || 0) + v.rate;
				return p;
			}, function(p, v) {
				p[v.uf] = (p[v.uf] || 0) - v.rate;
				return p;
			}, function() {
				return {};
			}
		);
		this.compositeGroup = this.compositeDimension.group().reduce(
			function(p, v) {
                p.aream = (p.aream || 0) + v.value.aream;
                p.areat = (p.areat || 0) + v.value.areat;
				return p;
			}, function(p, v) {
                p.aream = (p.aream || 0) - v.value.aream;
                p.areat = (p.areat || 0) - v.value.areat;
				return p;
			}, function() {
				return {};
			}
		);
	},
	applyCountyFilter: function(d){
		if(!d || !d.length) {
			this.rowTop10ByMun.data(function (group) {
				var fakeGroup=[];
				fakeGroup.push({key:Translation[Lang.language].no_value,value:0});
				return (group.all().length>0)?(group.top(10)):(fakeGroup);
			});
		}else{
			this.rowTop10ByMun.data(function (group) {
				var filteredGroup=[], index,allItems=group.top(Infinity);
				allItems.findIndex(function(item,i){
					if(item.key==d[0].key){
						index=i;
						filteredGroup.push({key:item.key,value:item.value});
					}
				});
				var ctl=1,max=[],min=[];
				while (ctl<=5) {
					var item=allItems[index+ctl];
					if(item) min.push({key:item.key,value:item.value});
					item=allItems[index-ctl];
					if(item) max.push({key:item.key,value:item.value});
					++ctl;
				}
				filteredGroup=filteredGroup.concat(max);
				min.reverse();
				filteredGroup=min.concat(filteredGroup);
				filteredGroup.reverse();
				return filteredGroup;
			});
			// -----------------------------------------------------------------
			// enable this line if you want to clean municipalities of the previous selections.
			//this.rowTop10ByMun.filterAll();
			// -----------------------------------------------------------------
			this.rowTop10ByMun.filter(d[0].key);
			dc.redrawAll();
		}
		//dc.redrawAll();
	},
	buildDataTable: function() {
		var data2Table=[], yearFilter=[], yearForUf=[], total=[], ufList=[];
		graph.stateYearRateGroup.all().forEach(
			
			function (y) {
				if(total[y.key[0]]==undefined) {
					total[y.key[0]]=0;
					yearForUf[y.key[0]]=[];
					ufList.push(y.key[0]);
				}
				yearForUf[y.key[0]].push(y.key[1]);// year list for each UF
				total[y.key[0]]+=y.value;
				data2Table.push({
					uf:y.key[0],
					year:y.key[1],
					rate:localeBR.numberFormat(',1f')(Math.abs(+(y.value.toFixed(1)))),
					originalRate:y.value
				});
				if(yearFilter.indexOf(y.key[1]) < 0) {
					yearFilter.push(y.key[1]);
				}
			}
		);
		// to complete with all years for states when year series is incomplete
		ufList.forEach(function(uf){

			if(yearForUf[uf] && yearForUf[uf].length<yearFilter.length){
				hasYears=[];
				data2Table.forEach(function(d){
					if(uf==d.uf){
						hasYears.push(d.year);
					}
				});
				yearFilter.forEach(function(y){
					if(hasYears.indexOf(y)<0) {
						data2Table.push({
							uf:uf,
							year:y,
							rate:'0',
							originalRate:0
						});
					}
				});
			}
		});
		var reA = /[^a-zA-Z]/g;
		var reN = /[^0-9]/g;
		function sortAlphaNum(a,b) {
			a=a.uf+a.year,b=b.uf+b.year;

			var aA = a.replace(reA, "");
			var bA = b.replace(reA, "");
			if(aA === bA) {
				var aN = parseInt(a.replace(reN, ""), 10);
				var bN = parseInt(b.replace(reN, ""), 10);
				return aN === bN ? 0 : aN > bN ? 1 : -1;
			} else {
				return aA > bA ? 1 : -1;
			}
		}
		data2Table.sort(sortAlphaNum);
		// to include grouped data into table represented by "cerrado" column.
		graph.data_all.forEach(function(da){
			if(yearFilter.indexOf(da.year) >= 0) {
				if(!total[da.uf]) {
					total[da.uf]=0;
					ufList.push(da.uf);
				}
				total[da.uf]+=da.rate;
				data2Table.push({
					uf:da.uf,
					year:da.year,
					rate:localeBR.numberFormat(',1f')(Math.abs(+(da.rate.toFixed(1)))),
					originalRate:da.rate
				});
			}
		});

		graph.data2csv=jQuery.extend(true, [], data2Table);
		graph.buildVariationRatesDataTable(data2Table);
		ufList.forEach(function(uf){

			data2Table.push({
				uf:uf,
				year:Translation[Lang.language].cumulate,
				rate:localeBR.numberFormat(',1f')(Math.abs(+(total[uf].toFixed(1))))
			});
		});
		graph.ratesDataTable.init(data2Table);
		graph.ratesDataTable.redraw();
		utils.addGenerationDate();
	},
	buildVariationRatesDataTable: function(d) {
		var data2Table=[], l=d.length;
		for(var i=0;i<l;i++) {
			if(d[i+1] && d[i].uf==d[i+1].uf) {
				var rr=(d[i].originalRate>=0.1)?( ( (100 - (d[i+1].originalRate*100/d[i].originalRate)) * (-1) ).toFixed(0) ):(0);
				if(rr=='-0') rr='0';
				rr=rr+'%';
				data2Table.push({
					uf:d[i].uf,
					year:d[i].year+'-'+d[i+1].year,
					rate:rr
				});
			}
		}
		graph.relativeRatesDataTable.init(data2Table);
		graph.relativeRatesDataTable.redraw();
	},
	/**
	 * Starting the lines chart by States for rates per years or
	 * the line chart for counties by year
	 */
	buildLineChartMun: function(dataDimension, dataGroup) {

		var chartType='Municípios';

		this.lineRateByYear = dc.seriesChart("#chart-line-rates-by-year");
		var chartTitle = (chartType=='Municípios')?(Translation[Lang.language].county):(Translation[Lang.language].state);
		d3.select('#title-chart-lines-p2').html( chartTitle );

		var auxYears=[],auxRates=[];
		graph.yearGroup.all().forEach(function(y){
			auxYears.push(+y.key);
			auxRates.push(y.value);
		});
		var xScale = d3.scale.linear()
			.domain([auxYears[0] -1,auxYears[auxYears.length-1]+1])
			.range([auxRates[0],auxRates[auxRates.length-1]]);
		
		this.lineRateByYear
			.chart(function(c) { return dc.lineChart(c).interpolate('monotone').renderDataPoints({radius: 4}).evadeDomainFilter(true); })
			.x(xScale)
			.brushOn(false)
			.yAxisLabel(Translation[Lang.language].lineYAxis)
			//.xAxisLabel(Translation[Lang.language].lineXAxis + years[0].key + " - " + years[years.length-1].key)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.title(function(d) {
				return chartTitle + ': ' + d.key[0] + "\n" +
				Translation[Lang.language].year + d.key[1] + "\n" +
				Translation[Lang.language].area + localeBR.numberFormat(',1f')(Math.abs(+(d.value.toFixed(2)))) + " km²";
			})
			.elasticY(true)
			.yAxisPadding('10%')
			.dimension(dataDimension)
			.group(utils.snapToZero(dataGroup))
			.mouseZoomable(false)
			.seriesAccessor(function(d) {
				return d.key[0];
			})
			.keyAccessor(function(d) {
				return +d.key[1];
			})
			.valueAccessor(function(d) {
				return +d.value;
			})
			.ordinalColors((utils.cssDefault)?(graph.pallet):(graph.darkPallet));

		// if(chartType=='Municípios') {
		// 	this.lineRateByYear
		// 	.data(function (group) {
		// 		var fakeGroup=[],k=[];
		// 		k.push(Translation[Lang.language].no_value);
		// 		k.push(0);
		// 		fakeGroup.push({key:k,value:0});
		// 		if(graph.rowTop10ByMun.hasFilter()){
		// 			graph.lineRateByYear.filter(graph.rowTop10ByMun.filters());
		// 			fakeGroup = graph.lineRateByYear.group().top(Infinity);
		// 		}
		// 		return fakeGroup;
		// 	});
		// }

		this.lineRateByYear.xAxis().ticks(auxYears.length);
		this.lineRateByYear.xAxis().tickFormat(function(d) {
			return d+"";
		});
		this.lineRateByYear.yAxis().tickFormat(function(d) {
			return localeBR.numberFormat(',1f')(d);
		});
		
		this.lineRateByYear.on("renderlet.a",function (chart) {
			// rotate x-axis labels
			chart.selectAll('g.x text')
				.attr('transform', 'translate(-15,7) rotate(315)');
		});
		
		this.lineRateByYear.addFilterHandler(function(filters, filter) {
			filters.push(filter);
			//dc.redrawAll();
			return filters;
		});

		//graph.updateChartsDimensions();
	},

	// chart-line-rates-by-year-state
	/**
	 * Starting the lines chart by States for rates per years or
	 * the line chart for counties by year
	 */
	buildLineChartState: function(dataDimension, dataGroup) {
		
		var chartType='Estados';

		this.lineRateByYearState = dc.seriesChart("#chart-line-rates-by-year-state");
		var chartTitle = (chartType=='Municípios')?(Translation[Lang.language].county):(Translation[Lang.language].state);
		d3.select('#title-chart-lines-p2').html( chartTitle );

		var auxYears=[],auxRates=[];
		graph.yearGroup.all().forEach(function(y){
			auxYears.push(+y.key);
			auxRates.push(y.value);
		});
		var xScale = d3.scale.linear()
			.domain([auxYears[0] -1,auxYears[auxYears.length-1]+1])
			.range([auxRates[0],auxRates[auxRates.length-1]]);
		
		this.lineRateByYearState
			.chart(function(c) { return dc.lineChart(c).interpolate('monotone').renderDataPoints({radius: 4}).evadeDomainFilter(true); })
			.x(xScale)
			.brushOn(false)
			.yAxisLabel(Translation[Lang.language].lineYAxis)
			//.xAxisLabel(Translation[Lang.language].lineXAxis + years[0].key + " - " + years[years.length-1].key)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.title(function(d) {
				return chartTitle + ': ' + d.key[0] + "\n" +
				Translation[Lang.language].year + d.key[1] + "\n" +
				Translation[Lang.language].area + localeBR.numberFormat(',1f')(Math.abs(+(d.value.toFixed(2)))) + " km²";
			})
			.elasticY(true)
			.yAxisPadding('10%')
			.dimension(dataDimension)
			.group(utils.snapToZero(dataGroup))
			.mouseZoomable(false)
			.seriesAccessor(function(d) {
				return d.key[0];
			})
			.keyAccessor(function(d) {
				return +d.key[1];
			})
			.valueAccessor(function(d) {
				return +d.value;
			})
			.ordinalColors((utils.cssDefault)?(graph.pallet):(graph.darkPallet));

		this.lineRateByYearState.xAxis().ticks(auxYears.length);
		this.lineRateByYearState.xAxis().tickFormat(function(d) {
			return d+"";
		});
		this.lineRateByYearState.yAxis().tickFormat(function(d) {
			return localeBR.numberFormat(',1f')(d);
		});
		
		this.lineRateByYearState.on("renderlet.a",function (chart) {
			// rotate x-axis labels
			chart.selectAll('g.x text')
				.attr('transform', 'translate(-15,7) rotate(315)');
		});
		
		this.lineRateByYearState.addFilterHandler(function(filters, filter) {
			filters.push(filter);
			//dc.redrawAll();
			return filters;
		});

		//graph.updateChartsDimensions();
	},

	build: function() {

		utils.setDinamicTexts();

		/**
		 * Starting the pie chart of the States by rates.
		 */
		this.pieTotalizedByState
			.innerRadius(10)
			.externalRadiusPadding(30)
			.dimension(this.ufDimension)
			.group(utils.snapToZero(this.ufRateGroup))
			.title(function(d) {
				var t=utils.totalRateCalculator();
				t = Translation[Lang.language].percent + localeBR.numberFormat(',1f')((d.value * 100 / t).toFixed(1)) + " %";
				t = Translation[Lang.language].state + ': ' + d.key + "\n" + t + "\n";
				return t + Translation[Lang.language].area + localeBR.numberFormat(',1f')(Math.abs(+(d.value.toFixed(2)))) + " km²";
			})			
			.label(function(d) {
				var filters = graph.pieTotalizedByState.filters();
				var localized = false;
				
				for(var f = 0; f < filters.length; f++){
					if(filters[f] === d.key) localized = true; 
				}
				
				var t = utils.totalRateCalculator();

				if(filters.length == 0){
					return d.key + ":" + localeBR.numberFormat(',1f')((d.value * 100 / t).toFixed(1)) + " %";
				} else {
					return localized === true ? d.key + ":" + localeBR.numberFormat(',1f')((d.value * 100 / t).toFixed(1)) + " %" : "";
				}
			})
			.ordering(dc.pluck('key'))
			.ordinalColors((utils.cssDefault)?(graph.pallet):(graph.darkPallet));
		
		this.pieTotalizedByState.on("postRedraw", this.buildDataTable);

		/**
		 * Starting the bar chart of the States by years.
		 */
		function sel_stack(i) {
			return function(d) {
				return +d.value[i];
			};
		}

		var ufs=graph.ufDimension.group().all(),ufList=[];
		ufs.forEach(function(d){
			ufList.push(d.key);
		});

		/**
		 * Starting the top 10 chart of the Counties by rates.
		 */
		var barHeightAdjust=function (chart) {
			if(chart.data().length > 5){
				chart.fixedBarHeight(false);
			}else{
				chart.fixedBarHeight( parseInt((chart.effectiveHeight()*0.7)/10) );
			}
		};

		this.rowTop10ByMun
			.dimension(this.munDimension)
			.group(utils.snapToZero(this.munAreaMunGroup))
			.title(function(d) {
				return Translation[Lang.language].county + "/" + Translation[Lang.language].state + ': ' + d.key + "\n" +
				Translation[Lang.language].area + localeBR.numberFormat(',1f')(d.value.toFixed(2)) + " km²";
			})
			.label(function(d) {
				return d.key + ": " + localeBR.numberFormat(',1f')(d.value.toFixed(2)) + " km²";;
			})
			.elasticX(true)
			.ordinalColors([(utils.cssDefault)?(graph.barTop10Color):(graph.darkBarTop10Color)])
			.ordering(function(d) {
				return d.value;
			})
			.controlsUseVisibility(true);
		
		this.rowTop10ByMun.data(function (group) {
			var fakeGroup=[];
			fakeGroup.push({key:Translation[Lang.language].no_value,value:0});
			return (group.all().length>0)?(group.top(10)):(fakeGroup);
		});

		this.rowTop10ByMun.xAxis().tickFormat(function(d) {
			return d;
		}).ticks(5);

		this.rowTop10ByMun.on("preRedraw", barHeightAdjust);

		this.rowTop10ByMun.removeFilterHandler(function(filters, filter) {
			var pos=filters.indexOf(filter);
			filters.splice(pos,1);
			if(!filters.length) {
				graph.applyCountyFilter(null);
			}
			return filters;
		});

		this.rowTop10ByMun.addFilterHandler(function(filters, filter) {
			filters.push(filter);
			if(filters.length) {
				graph.countyDimension.filter(filter);
			}
			return filters;
		});

		this.rowTop10ByMun.on("renderlet.a",function (chart) {
			var texts=chart.selectAll('g.row text');
			var rankMun=utils.getMunOrder();
			texts[0].forEach(function(t){
				var p=(rankMun["\""+t.innerHTML.split(":")[0]+"\""])?(rankMun["\""+t.innerHTML.split(":")[0]+"\""]+'º - '):('');
				t.innerHTML=p+t.innerHTML;
			});
		});


		/**
		 * Composite bar chart to display the sum area by year with and without filter by 6.25 ha
		 */
		this.barChart1
			// .label(function(d) {
			// 	return utils.labelFormat(d.data.value.aream);
			// })
			.clipPadding(0)
	        .barPadding(0.3)
			.valueAccessor(
				d => ( (Math.abs(d.value.aream)<1e-6) ? 0 : d.value.aream )
			)
			.title(
				d => Translation[Lang.language].year + d.key + "\n" +
				Translation[Lang.language].area + localeBR.numberFormat(',1f')(Math.abs(+(d.value.aream.toFixed(2)))) + " km²\n" +
				Translation[Lang.language].filter + ": " + Translation[Lang.language].without_filter
			)
			.colors([(utils.cssDefault)?(graph.histogramColor[0]):(graph.darkHistogramColor[0])])
			.addFilterHandler(function(filters, filter) {
				filters.push(filter);
				if(!graph.barChart2.hasFilter() || graph.barChart2.filters().indexOf(filter)<0){
					graph.barChart2.filter(filter);
				}
				return filters;
			})
			.removeFilterHandler(function(filters, filter) {
				var pos=filters.indexOf(filter);
				filters.splice(pos,1);
				graph.barChart2.filter(null);
				filters.forEach(f => {
					graph.barChart2.filter(f);
				});
				return filters;
			});


		this.barChart2
			// .label(function(d) {
			// 	return utils.labelFormat(d.data.value.areat);
			// })
			.clipPadding(0)
	        .barPadding(0.3)
			.valueAccessor(
				d => ( (Math.abs(d.value.areat)<1e-6) ? 0 : d.value.areat )
			)
			.title(
				d => Translation[Lang.language].year + d.key + "\n" +
				Translation[Lang.language].area + localeBR.numberFormat(',1f')(Math.abs(+(d.value.areat.toFixed(2)))) + " km²\n" +
				Translation[Lang.language].filter + ": " + Translation[Lang.language].with_filter
			)
			.colors([(utils.cssDefault)?(graph.histogramColor[1]):(graph.darkHistogramColor[1])])
			.addFilterHandler(function(filters, filter) {
				filters.push(filter);
				if(!graph.barChart1.hasFilter() || graph.barChart1.filters().indexOf(filter)<0){
					graph.barChart1.filter(filter);
				}
				return filters;
			})
			.removeFilterHandler(function(filters, filter) {
				var pos=filters.indexOf(filter);
				filters.splice(pos,1);
				graph.barChart1.filter(null);
				filters.forEach(f => {
					graph.barChart1.filter(f);
				});
				return filters;
			});

		this.compositeChart
			.shareTitle(false)
			.yAxisLabel(Translation[Lang.language].barYAxis)
			//.xAxisLabel(Translation[Lang.language].barXAxis + years[0].key + " - " + years[years.length-1].key)
			.dimension(this.compositeDimension)
			.group(utils.snapToZero(this.compositeGroup))
			.title(function(d) {
				return Translation[Lang.language].state + ': ' + d.key[0] + "\n" +
				Translation[Lang.language].year + d.key[1] + "\n" +
				Translation[Lang.language].area + localeBR.numberFormat(',1f')(Math.abs(+(d.value.toFixed(2)))) + " km²";
			})
			._rangeBandPadding(utils.RANGE_BAND_PADDING)
			//._outerRangeBandPadding(utils.OUTER_RANGE_BAND_PADDING)
			.x(d3.scale.ordinal())
			.xUnits(dc.units.ordinal)
			.renderHorizontalGridLines(true)
			.elasticY(true)
			.yAxisPadding('10%')
			.compose([this.barChart1, this.barChart2])
			.on("pretransition", chart => {
				var bars = chart.selectAll("rect.bar");
				if(graph.barChart1.hasFilter() || graph.barChart2.hasFilter()){
					bars.classed(dc.constants.DESELECTED_CLASS, true);
					bars[0].forEach( bar => {
						if(graph.barChart1.filters().indexOf(bar.__data__.x)>=0 || graph.barChart2.filters().indexOf(bar.__data__.x)>=0){
							bar.setAttribute('class', 'bar selected');
						}
					});
				}else{
					bars.classed(dc.constants.SELECTED_CLASS, true);
				}
			})
			.on("preRedraw", chart => {
				chart.rescale();
			})
			.on("preRender", chart => {
				chart.rescale();
			});
		
		this.compositeChart
			.on("renderlet.a",function (chart) {
				// rotate x-axis labels
				chart.selectAll('g.x text')
					.attr('transform', 'translate(-15,7) rotate(315)');
				// adjust top bar labels
				var bars = chart.selectAll("rect.bar");
				var widthBar=bars[0][0].getAttribute('width');

				var texts = d3.selectAll(chart.select('g.sub._0').selectAll('text'));
				texts = texts[0][0];
				texts.forEach(
					function(text) {
						var x=widthBar*0.22;
						d3.select(text).attr('transform','translate(-'+x+',0)');
					});

				texts = d3.selectAll(chart.select('g.sub._1').selectAll('text'));
				texts = texts[0][0];
				texts.forEach(
					function(text) {
						var x=widthBar*0.22;
						d3.select(text).attr('transform','translate('+x+',0)');
					});
				
				utils.scaleSubChartBarWidth(chart);
			});
		
		
		// Initialize line chart with States by default.
		//graph.buildLineChart(graph.stateYearDimension, graph.stateYearRateGroup, 'Estado');

		this.buildLineChartState(this.stateYearDimension, this.stateYearRateGroup);
		this.buildLineChartMun(this.countyYearDimension, this.countyYearRateGroup);

		this.updateChartsDimensions();

		this.buildDataTable();
		this.prepareTools();
	},
	init: function() {
		window.onresize=utils.onResize;
		this.loadConfigurations(function(){
			graph.loadData();
			utils.collapsePanel();
			utils.attachEventListeners();
		});
	},
	/*
	 * Called from the UI controls to clear one specific filter.
	 */
	resetFilter: function(who) {
		if(who=='state'){
			graph.pieTotalizedByState.filterAll();
		}else if(who=='mun'){
			graph.rowTop10ByMun.filterAll();
			graph.lineRateByYear.filterAll();
			graph.applyCountyFilter(null);
		}else if(who=='compositebar') {
			graph.barChart1.filterAll();
			graph.barChart2.filterAll();
			graph.compositeChart.filterAll();
		}

		dc.redrawAll();
	},
	chartLineSwitcher: function(btn) {
		var btnValue='';
		if(btn.innerText=='Estados'){
			btnValue='Municípios';
			graph.buildLineChart(graph.countyYearDimension, graph.countyYearRateGroup, btnValue);
		}else{
			btnValue='Estados';
			graph.buildLineChart(graph.stateYearDimension, graph.stateYearRateGroup, btnValue);
		}
		btn.innerText=btnValue;
	},
	prepareTools: function() {
		var downloadCSVWithFilter=function() {

			if(graph.pieTotalizedByState.hasFilter()) {

				var ufs=[],years=[],rates=[];
				
				graph.data2csv.forEach(function(d) {
					if(d.uf!='CERRADO' && graph.pieTotalizedByState.filters().indexOf(d.uf)>=0) {
						if(ufs.indexOf(d.uf)<0){
							ufs.push(d.uf);
							rates[d.uf]=[]
						}
						if(years.indexOf(d.year)<0){
							years.push(d.year);
						}
						rates[d.uf][d.year]=d.originalRate;
					}
				});
				var csv=[],aux={};
				ufs.forEach(function(u) {
					years.forEach(function(y) {
						if(aux[y]) {
							c=aux[y];
						}else{
							var c={};
							c['year']=y;
							aux[y]=c;
						}
						c[u]=rates[u][y];
					});
				});
				for(var c in aux){if (aux.hasOwnProperty(c)) {csv.push(aux[c]);} }

				var blob = new Blob([d3.dsv(";").format(csv)], {type: "text/csv;charset=utf-8"});
				var dt=new Date();
				dt=dt.getDate() + "_" + dt.getMonth() + "_" + dt.getFullYear() + "_" + dt.getTime();
				saveAs(blob, 'cerrado_rates_filtered_'+dt+'.csv');
			}else{
				downloadCSVWithoutFilter();
			}
		};

		var downloadCSVWithoutFilter=function() {

			var ufs=[],years=[],rates=[];
			
			graph.data.forEach(function(d) {
				if(ufs.indexOf(d.uf)<0){
					ufs.push(d.uf);
					rates[d.uf]=[]
				}
				if(years.indexOf(d.year)<0){
					years.push(d.year);
				}
				
				rates[d.uf][d.year]=d.rate;
			});
			graph.data_all.forEach(function(d) {
				if(ufs.indexOf(d.uf)<0){
					ufs.push(d.uf);
					rates[d.uf]=[]
				}
				if(years.indexOf(d.year)<0){
					years.push(d.year);
				}
				
				rates[d.uf][d.year]=d.rate;
			});
			var csv=[],aux={};
			ufs.forEach(function(u) {
				years.forEach(function(y) {
					if(aux[y]) {
						c=aux[y];
					}else{
						var c={};
						c['year']=y;
						aux[y]=c;
					}
					c[u]=rates[u][y];
				});
			});
			
			for(var c in aux){if (aux.hasOwnProperty(c)) {csv.push(aux[c]);} }
			
			var blob = new Blob([d3.dsv(";").format(csv)], {type: "text/csv;charset=utf-8"});
			var dt=new Date();
			dt=dt.getDate() + "_" + dt.getMonth() + "_" + dt.getFullYear() + "_" + dt.getTime();
			saveAs(blob, 'cerrado_rates_'+dt+'.csv');
		};
		// build download data
		d3.select('#downloadTableBtn')
		.on('click', downloadCSVWithFilter);

		d3.select('#download-csv-all')
		.on('click', downloadCSVWithoutFilter);
		
		d3.select('#download-csv-filtered')
	    .on('click', downloadCSVWithFilter);
		
		d3.select('#prepare_print')
	    .on('click', function() {
	    	graph.preparePrint();
	    });
		
		d3.select('#change_style')
	    .on('click', function() {
			utils.changeCss(this);
	    	graph.build();
	    });
		
		d3.select('#panel_swap')
	    .on('click', function() {
	    	window.location='?type=default';
		});

		d3.select('#line-chart-toggle')
		.on('click', function() {
	    	graph.chartLineSwitcher(this);
		});

		this.jsLanguageChange();
	},
	preparePrint: function() {
		d3.select('#print_information').style('display','block');
		d3.select('#print_page')
	    .on('click', function() {
	    	d3.select('#print_information').style('display','none');
	    	window.print();
	    });
	},
	jsLanguageChange: function() {
		var callback = function() {
			$("#iframe-about").attr("src", "dashboard-about.html");
			graph.build();
		};
		d3.select('#flag-pt-br')
	    .on('click', function() {
	    	Lang.change('pt-br', callback);
	    });
		d3.select('#flag-en')
	    .on('click', function() {
	    	Lang.change('en', callback);
	    });
		d3.select('#flag-es')
	    .on('click', function() {
	    	Lang.change('es', callback);
	    });
	}
};

window.init=function(){
	Mousetrap.bind(['command+p', 'ctrl+p'], function() {
        console.log('command p or control p');
        // return false to prevent default browser behavior
        // and stop event from bubbling
        return false;
    });
	$(function() {
		$('#chart1').hover(function() {
			$('#txt10').fadeIn();
		}, function() {
			$('#txt10').fadeOut();
		});
		$('#chart2').hover(function() {
			$('#txt13').fadeIn();
		}, function() {
			$('#txt13').fadeOut();
		});
		$('#chart3').hover(function() {
			$('#txt14').fadeIn();
		}, function() {
			$('#txt14').fadeOut();
		});
	});
};

window.onload=function(){
	window.init();
	Lang.init();
	graph.init();
	Lang.apply();// apply from previous selection
	utils.displayDisclaimer();
};
