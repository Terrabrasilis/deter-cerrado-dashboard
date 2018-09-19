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
	btnChangePanel:function() {
		d3.select('#aggregate_daily')
	    .on('click', function() {
	    	var layerName = (window.layer_config_global && window.layer_config_global!="")?("&internal_layer="+window.layer_config_global):("");
	    	window.location='?type=default'+layerName;
	    });
	},
	btnDownload:function() {
		d3.select('#download-csv-monthly')
	    .on('click', function() {
	        var blob = new Blob([d3.csv.format(dashBoard.data)], {type: "text/csv;charset=utf-8"});
	        saveAs(blob, 'deter-b-agregado-mensal.csv');
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
	appendEventOnButtons:function() {
		utils.btnPrintPage();
		//utils.btnDownload();
		utils.btnChangePanel();
	},
	onResize:function(event) {
		clearTimeout(utils.config.resizeTimeout);
		utils.config.resizeTimeout = setTimeout(utils.rebuildAll, 200);
	},
	updateDimensions: function() {
		var d={w: window.innerWidth,
				h: window.innerHeight};
		dashBoard.setDimensions(d);
	},
	rebuildAll: function() {
		utils.updateDimensions();
		dashBoard.build();
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
		utils.addGenerationDate();
	},
	// Used to update the footer position and date.
	addGenerationDate: function() {
		var footer_page=document.getElementById("footer_page");
		var footer_print=document.getElementById("footer_print");
		if(!footer_page || !footer_print) {
			return;
		}
		var h=( (window.document.body.clientHeight>window.innerHeight)?(window.document.body.clientHeight):(window.innerHeight - 20) );
		footer_page.style.top=h+"px";
		footer_print.style.width=window.innerWidth+"px";
		var now=new Date();
		var footer=Translation[Lang.language].footer1+' '+now.toLocaleString()+' '+Translation[Lang.language].footer2;
		footer_page.innerHTML=footer;
		footer_print.innerHTML=footer;
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
    setLayerConfiguration: function(cfg) {
		utils.config.layerConfig=cfg;
	},
	mappingClassNames: function(cl) {
		if(utils.config.layerConfig===undefined) {
			return cl;
		}
		var l = utils.config.layerConfig.legendOriginal.length;
		for (var i = 0; i < l; i++) {
			if(utils.config.layerConfig.legendOriginal[i]===cl) {
				cl=utils.config.layerConfig.legendOverlay[Lang.language][i];
				break;
			}
		}
		return cl;
	},
	xaxis:function(d) {
		var list=Translation[Lang.language].months_of_prodes_year;
		return list[d-8];

	},
	fakeMonths: function(d) {
		var list=[13,14,15,16,17,18,19,8,9,10,11,12];
		return list[d-1];
	},
	
	displayWarning: function(enable) {
		if(enable===undefined) enable=true;
		d3.select('#no-filter-warning').style('display',((enable)?(''):('none')));
	},
	displayError:function(info) {
		d3.select('#panel_container').style('display','none');
		d3.select('#display_error').style('display','block');
		document.getElementById("inner_display_error").innerHTML=info+
		'<span id="dtn_refresh" class="glyphicon glyphicon-refresh" aria-hidden="true" title="'+Translation[Lang.language].refresh_data+'"></span>';
		setTimeout(function(){
			d3.select('#dtn_refresh').on('click', function() {
				window.location.href='?type=aggregated';
		    });
		}, 300);
	},
	displayNoData:function() {
		this.displayError(Translation[Lang.language].txt7);
	},
	displayGraphContainer:function() {
		d3.select('#panel_container').style('display','block');
	},
	changeCss: function(bt) {
		utils.cssDefault=!utils.cssDefault;
		document.getElementById('stylesheet_dash').href='../theme/css/dashboard-aggregated'+((utils.cssDefault)?(''):('-dark'))+'.css';
		bt.style.display='none';
		setTimeout(bt.style.display='',200);
	}
};

var dashBoard={
	
	focusChart: null,
	overviewChart: null,
	ringTotalizedByState: null,
	rowTotalizedByClass: null,
	barAreaByYear: null,
	
	monthDimension: null,
	temporalDimension: null,
	areaGroup: null,
	yearDimension0: null,
	classDimension0: null,
	ufDimension0: null,
	yearDimension: null,
	yearGroup: null,
	ufDimension: null,
	ufGroup: null,
	classDimension: null,
	classGroup: null,
	
	data:null,
	
	winWidth: window.innerWidth,
	winHeight: window.innerHeight,
	
	setDimensions: function(dim) {
		this.winWidth=dim.w;
		this.winHeight=dim.h;
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
		this.focusChart = dc.seriesChart("#agreg", "agrega");
		this.overviewChart = dc.seriesChart("#agreg-overview", "agrega");
		this.ringTotalizedByState = dc.pieChart("#chart-by-state", "filtra");
		this.rowTotalizedByClass = dc.rowChart("#chart-by-class", "filtra");
		this.barAreaByYear = dc.barChart("#chart-by-year", "filtra");
	},
	loadData: function(url) {
		d3.json(url, dashBoard.processData);
	},
	processData: function(error, data) {
		if (error) {
			utils.displayError( Translation[Lang.language].failure_load_data );
			return;
		}else if(!data || !data.totalFeatures || data.totalFeatures<=0) {
			utils.displayNoData();
			return;
		}
		utils.displayGraphContainer();
		
		var o=[];
		
		for (var j = 0, n = data.totalFeatures; j < n; ++j) {
			var fet=data.features[j];
			var month=+fet.properties.m;
			var year=+fet.properties.y;
			if(month >=1 && month<=7) {
				year = "20"+(year-1)+"/20"+year;
			}
			if(month >=8 && month<=12) {
				year = "20"+year+"/20"+(year+1);
			}
			o.push({Year:year,Month:month,Area:+((fet.properties.ar).toFixed(1)),uf:fet.properties.uf,ocl:fet.properties.cl,cl:utils.mappingClassNames(fet.properties.cl)});
		}
		data = o;
		dashBoard.registerDataOnCrossfilter(data);
		dashBoard.build();
	},
	translateClassNames:function() {
		return;
		/*this.data.forEach(function(d) {
			d.cl=utils.mappingClassNames(d.ocl);
		});*/
	},
	registerDataOnCrossfilter: function(data) {
		dashBoard.data=data;
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
		this.classDimension0 = ndx0.dimension(function(d) {
			return d.ocl;
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
		this.classDimension = ndx1.dimension(function(d) {
			return d.ocl;
		});
		this.classGroup = this.classDimension.group().reduceSum(function(d) {
			return d.Area;
		});
	},
	build: function() {
		var w=parseInt(this.winWidth - (this.winWidth * 0.08)),
		h=parseInt(this.winHeight * 0.3),
		barColors = this.getOrdinalColorsToYears();
		
		this.setChartReferencies();
		
		this.focusChart
			.width(w)
			.height(h)
			.chart(function(c) { return dc.lineChart(c).interpolate('cardinal').renderDataPoints(true).evadeDomainFilter(true); })
			.x(d3.scale.linear().domain([8,19]))
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.brushOn(false)
			.yAxisLabel(Translation[Lang.language].focus_y_label)
			.xAxisLabel(Translation[Lang.language].focus_x_label)
			.elasticY(true)
			.yAxisPadding('10%')
			.clipPadding(10)
			.dimension(this.temporalDimension)
			.group(this.areaGroup)
			.rangeChart(this.overviewChart)
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
				return Math.abs(+(d.value.toFixed(2)));
			})
			.legend(dc.legend().x(100).y(30).itemHeight(15).gap(5).horizontal(1).legendWidth(600).itemWidth(80));

		this.focusChart.yAxis().tickFormat(function(d) {
			//return d3.format(',d')(d);
			return localeBR.numberFormat(',1f')(d);
		});
		this.focusChart.xAxis().tickFormat(function(d) {
			return utils.xaxis(d);
		});

		this.focusChart.margins().right = 5; 
		this.focusChart.margins().left += 30;
		this.focusChart.margins().top += 30;
		
		this.focusChart.on('filtered', function(chart) {
			if(chart.filter()) {
				dashBoard.monthDimension.filterRange([chart.filter()[0], (chart.filter()[1]+1) ]);
				dc.redrawAll("filtra");
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

		this.focusChart.filterPrinter(function(filters) {
			var fp=utils.xaxis(filters[0][0])+" - "+utils.xaxis(filters[0][1]);
			return fp;
		});
		
		this.overviewChart
			.width(w)
		    .height(70)
		    .chart(function(c,_,_,i) {
			    var chart = dc.lineChart(c);
			    if(i===0) {
			    	chart.on('filtered', function (chart) {
			            if (!chart.filter()) {
			                dc.events.trigger(function () {
			                    dashBoard.overviewChart.focusChart().x().domain(dashBoard.overviewChart.focusChart().xOriginalDomain());
			                    dashBoard.overviewChart.focusChart().redraw();
			                    dashBoard.focusChart.filterAll();
			                    dashBoard.overviewChart.filterAll()
			                    dashBoard.monthDimension.filterAll();
			                    dc.redrawAll("filtra");
			                });
			            } else if (!utils.rangesEqual(chart.filter(), dashBoard.overviewChart.focusChart().filter())) {
			                dc.events.trigger(function () {
			                	dashBoard.overviewChart.focusChart().focus(chart.filter());
			                });
			            }
			        });
			    }
			    return chart;
		    })
		    .x(d3.scale.linear().domain([8,19]))
		    .renderVerticalGridLines(true)
		    .brushOn(true)
		    .xAxisLabel(Translation[Lang.language].overview_x_label)
		    .yAxisPadding('10%')
		    .clipPadding(10)
		    .dimension(this.temporalDimension)
			.group(this.areaGroup)
			.ordinalColors(["rgba(0,0,0,0)"])
		    .seriesAccessor(function(d) {
				return d.key[0];
			})
			.keyAccessor(function(d) {
				return d.key[1];
			})
			.valueAccessor(function(d) {
				return Math.abs(+(d.value.toFixed(2)));
			});
		
		this.overviewChart.margins().right = 5; 
		this.overviewChart.margins().left += 40;
		this.overviewChart.margins().top = 0;
		
		this.overviewChart.yAxis().ticks(0);
		this.overviewChart.yAxis().tickFormat(function(d) {
			return d3.format(',d')(d);
		});
		this.overviewChart.xAxis().tickFormat(function(d) {
			return utils.xaxis(d);
		});

		this.overviewChart.round(
			function round(v) {
				return parseInt(v);
	    	}
		);
		
		var minWidth=250, maxWidth=600, fw=parseInt((w)/3),
		fh=parseInt((this.winHeight - h) * 0.5);
		// define min width to filter graphs
		fw=((fw<minWidth)?(minWidth):(fw));
		// define max width to filter graphs
		fw=((fw>maxWidth)?(maxWidth):(fw));

		this.ringTotalizedByState
			.height(fh)
			.width(fw)
			.innerRadius(10)
			.externalRadiusPadding(30)
			.dimension(this.ufDimension)
			.group(this.ufGroup)
			.title(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
				v=localeBR.numberFormat(',1f')(v);
				return Translation[Lang.language].area+": " + v + " "+Translation[Lang.language].unit;
			})
			.label(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(0)));
				v=localeBR.numberFormat(',1f')(v);
				return d.key + ":" + v + " "+Translation[Lang.language].unit;
			})
			.ordinalColors(["#FF0000","#FFFF00","#FF00FF","#F8B700","#78CC00","#00FFFF","#56B2EA","#0000FF","#00FF00"])
			.legend(dc.legend());
		
		this.ringTotalizedByState.valueAccessor(function(d) {
			return Math.abs(+(d.value.toFixed(2)));
		});

		this.rowTotalizedByClass
			.height(fh)
			.width(fw)
			.dimension(this.classDimension)
			.group(utils.snapToZero(this.classGroup))
			.title(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
				v=localeBR.numberFormat(',1f')(v);
				var t=Translation[Lang.language].area+": " + v + " " + Translation[Lang.language].unit;
				if(d.key==="CORTE_SELETIVO") {
					t=Translation[Lang.language].area+": " + v + " " + Translation[Lang.language].unit + " ("+Translation[Lang.language].warning_class+")";
				}
				return t;
			})
			.label(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(1)));
				v=localeBR.numberFormat(',1f')(v);
				var t=utils.mappingClassNames(d.key) + ": " + v + " " + Translation[Lang.language].unit;
				if(d.key==="CORTE_SELETIVO") {
					t=utils.mappingClassNames(d.key) + "*: " + v + " " + Translation[Lang.language].unit + " ("+Translation[Lang.language].warning_class+")";
				}
				return t;
			})
			.elasticX(true)
			.ordinalColors(["#FF0000","#FFFF00","#FF00FF","#F8B700","#78CC00","#00FFFF","#56B2EA","#0000FF","#00FF00"])
			.ordering(function(d) {
				return -d.value;
			})
			.controlsUseVisibility(true);

		this.rowTotalizedByClass.xAxis().tickFormat(function(d) {
			var t=parseInt(d/1000);
			t=(t<1?parseInt(d):t+"k");
			return t;
		}).ticks(5);
		
		this.rowTotalizedByClass
		.filterPrinter(function(f) {
			var l=[];
			f.forEach(function(cl){
				l.push(utils.mappingClassNames(cl));
			});
			return l.join(",");
		});

		this.barAreaByYear
			.height(fh)
			.width(fw)
			.yAxisLabel(Translation[Lang.language].area+" ("+Translation[Lang.language].unit+")")
			.xAxisLabel(Translation[Lang.language].barArea_x_label)
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
			});

		this.barAreaByYear.margins().left += 30;
		
		dc.chartRegistry.list("filtra").forEach(function(c,i){
			c.on('filtered', function(chart, filter) {
				var filters = chart.filters();

				if(chart.anchorName()=="chart-by-year"){
					if(!filters.length) {
						dashBoard.yearDimension0.filterAll();
					}else {
						dashBoard.yearDimension0.filterFunction(function (d) {
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
				if(chart.anchorName()=="chart-by-class"){
					if(!filters.length) {
						dashBoard.classDimension0.filterAll();
					}else {
						dashBoard.classDimension0.filterFunction(function (d) {
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
						dashBoard.ufDimension0.filterAll();
					}else {
						dashBoard.ufDimension0.filterFunction(function (d) {
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
				utils.addGenerationDate();
			});
		});
		utils.renderAll();
	},
	init: function() {
		window.onresize=utils.onResize;
		utils.appendEventOnButtons();
	},
	/*
	 * Called from the UI controls to clear one specific filter.
	 */
	resetFilter: function(who,group) {
		var g=(typeof group === 'undefined')?("filtra"):(group);
		if(who=='state'){
			dashBoard.ringTotalizedByState.filterAll();
		}else if(who=='class'){
			dashBoard.rowTotalizedByClass.filterAll();
		}else if(who=='year'){
			dashBoard.barAreaByYear.filterAll();
		}else if(who=='agreg'){
			dashBoard.overviewChart.filterAll();
			dashBoard.focusChart.filterAll();
			dashBoard.monthDimension.filterAll();
			dc.redrawAll("filtra");
		}
		dc.redrawAll(g);
	},
	resetFilters: function() {
		dashBoard.ringTotalizedByState.filterAll();
		dashBoard.rowTotalizedByClass.filterAll();
		dashBoard.barAreaByYear.filterAll();
		dashBoard.overviewChart.filterAll();
		dashBoard.focusChart.filterAll();
		dashBoard.monthDimension.filterAll();
	}
};

window.onload=function(){
	Mousetrap.bind(['command+p', 'ctrl+p'], function() {
        console.log('command p or control p');
        // return false to prevent default browser behavior
        // and stop event from bubbling
        return false;
    });
	$(function() {
		$('#col-chart-class').hover(function() {
		    $('#modal-718053').fadeIn(); 
		}, function() { 
		    $('#modal-718053').fadeOut(); 
		});
	});
	Lang.init();
	var afterLoadConfiguration=function(cfg) {
		Lang.apply();
		utils.setLayerConfiguration(cfg);
		if(window.parent.gxp) {
			// show it when into TerraBrasilis DETER-B profile
			utils.displayWarning();
		}
		var layerName=((layer_config_global && layer_config_global!="")?(layer_config_global+"_month"):("deter_month"));
		var dataUrl = "http://terrabrasilis.info/files/deterb/"+layerName+"_d.json";
		dashBoard.init();
		dashBoard.loadData(dataUrl);
	}
	d3.json("/config/layerConfigDETER-B.json", afterLoadConfiguration);
};