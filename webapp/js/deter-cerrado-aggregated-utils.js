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
		if(Authentication.isExpiredToken()){
			d3.select('#expired_token_box').style('display','');
			Authentication.removeExpiredToken();
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
			saveAs(blob, downloadCtrl.getProject()+'-aggregated-'+downloadCtrl.getDownloadTime()+'.csv');
		});
		// with filters
		d3.select('#download-csv-monthly')
	    .on('click', function() {
			var filteredData=graph.monthDimension.top(Infinity);
	        var blob = new Blob([d3.csv.format(filteredData)], {type: "text/csv;charset=utf-8"});
	        saveAs(blob, downloadCtrl.getProject()+'-aggregated-'+downloadCtrl.getDownloadTime()+'.csv');
		});
		// shapefile 
		d3.select('#download-shp')
		.on('click', function() {
			downloadCtrl.startDownload();
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