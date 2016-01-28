$(function(){
	$('#tblSensor').tablesorter();

	$('#tblEvent').tablesorter({
		sortList: [[0,0]],
		widgets: ['saveSort', 'filter', 'stickyHeaders'],
		widgetOptions: {
			stickyHeaders_filteredToTop: true,
			filter_hideEmpty : true,
			filter_liveSearch : true,
			filter_saveFilters : true,
			filter_reset : '.reset',
			filter_functions: {
				'.filter-name' : true,
				'.filter-time' : {
					"3 days"   : function(e, n, f, i, $r, c, data) {
						return ($.now() - n <= 259200000); }, //3*24*60*60 3 days
					"1 week"   : function(e, n, f, i, $r, c, data) {
						return ($.now() - n <= 604800000); }, //7*24*60*60 1 week
					"2 weeks"  : function(e, n, f, i, $r, c, data) {
						return ($.now() - n <= 1209600000); }, //14*24*60*60 2 weeks
					"1 month"  : function(e, n, f, i, $r, c, data) {
						return ($.now() - n <= 2592000000); }, //30*24*60*60 1 month
					"6 months" : function(e, n, f, i, $r, c, data) {
						return ($.now() - n <= 15724800000); }, //26*7*24*60*60 6 months
					"1 year"   : function(e, n, f, i, $r, c, data) {
						return ($.now() - n <= 31449600000); } //52*7*24*60*60 1 year
					}
			}
		}
	})
	.tablesorterPager({
		container: $(".pager"),
		fixedHeight: false,
		size: 10
	});

	sensorArray(false);
	eventArray();

	//advanced view switch
	$('.advancedview').switchButton({
		labels_placement: "left",
		on_label: 'Advanced View',
  		off_label: 'Basic View',
  		checked: $.cookie('ipmitool_sensor_mode') == 'advanced'
	});

	//set cookie and toggle advanced columns	
	$('.advancedview').change(function () {
		$('.advanced').toggle('slow');
		$.cookie('ipmitool_sensor_mode', $('.advancedview').prop('checked') ? 'advanced' : 'basic', { expires: 3650 });
	});

	sensorRefresh();
});

//sensor refresh
function sensorRefresh() {
  sensorArray(true);
   setTimeout(sensorRefresh, 3000);
};

//load ipmi sensor table
function sensorArray(Refresh){
  	$.getJSON("/plugins/ipmitool-plugin/include/ipmitool_sensors.php",
   	{ }, function(data) {
   		$.each(data, function (i, val) {
   			if (data[i].Status != "ns") {
   				var Reading = parseFloat(data[i].Reading);
   				//if (data[i].Name == "+5VSB")
   					//Reading = 6.2;
   				var LowerNonRec = parseFloat(data[i].LowerNonRec);
   				var LowerCritical = parseFloat(data[i].LowerCritical);
   				var LowerNonCritical = parseFloat(data[i].LowerNonCritical);
   				var UpperNonCritical = parseFloat(data[i].UpperNonCritical);
   				var UpperCritical = parseFloat(data[i].UpperCritical);
   				var UpperNonRec = parseFloat(data[i].UpperNonRec);
   				var Color = "green";

   				// replace illegal characters
					var Name = data[i].Name.replace('+', 'plus_').replace('-', 'minus_').replace(' ', '_').replace('.', '_');
					
   				if (data[i].Type=="Voltage"){

   					// if voltage is less than lower non-recoverable 
   					// or voltage is greater than upper non-recoverable
   					if (Reading < LowerNonRec || Reading > UpperNonRec)
   						Color = "red";
   					
   					// if voltage is between lower non recoverable and
   					if (Reading > LowerNonRec && Reading < UpperNonRec)
   						Color = "red";
   					if (Reading > LowerCritical && Reading < UpperCritical)
   						Color = "orange";
   					if (Reading > LowerNonCritical && Reading < UpperNonCritical)
   						Color = "green";

   				} else if (data[i].Type=="Fan"){
 
   					// if Fan RPMs are less than lower non-critical
   					if (Reading < LowerNonCritical || Reading < LowerCritical || Reading < LowerNonRec)
   						Color = "red";

   				} else if (data[i].Type=="Temperature"){

   					// if Temperature is greater than upper non-critical
   					if (Reading > UpperNonCritical || Reading > UpperCritical || Reading > UpperNonRec)
   						Color = "red";
   				}
   				
   				if (Refresh) {
						$("#" + Name + " td.reading").html("<font color='" + Color + "'>" + Reading + "</font>");
					} else {
						$("#tblSensor tbody")
						.append("<tr id='"+Name+"'>"+
						"<td title='"+data[i].Status+"'><img src='/plugins/ipmitool-plugin/images/green-on.png'/></td>"+ //status
						"<td>"+data[i].Name+"</td>"+ //sensor name
	   				"<td class='advanced'>"+ data[i].LowerNonRec   +"</td>"+
						"<td class='advanced'>"+ data[i].LowerCritical +"</td>"+
						"<td class='advanced'>"+ data[i].LowerNonCritical  +"</td>"+
						"<td class='reading "+ Color +"-text'>"+ Reading +"</td>"+ //sensor reading
						"<td>"+data[i].Units+"</td>"+ //sensor units
						"<td class='advanced'>"+ data[i].UpperNonCritical  +"</td>"+
						"<td class='advanced'>"+ data[i].UpperCritical +"</td>"+
						"<td class='advanced'>"+ data[i].UpperNonRec   +"</td>"+
						"</tr>");
					}
				}
   		});
		$('#tblSensor').trigger('update'); //update sensor table

		if ($.cookie('ipmitool_sensor_mode') == 'advanced')
			$('.advanced').show();
		else
			$('.advanced').hide();		 

 	});
};

//load ipmi event table
function eventArray(){
  	$.getJSON("/plugins/ipmitool-plugin/include/ipmitool_events.php",{ }, function(data) {
   		$.each(data, function (i, val) {
   			var Status = (data[i].Status == 'Asserted') ? 'red' : 'green';
 				$('#tblEvent tbody')
 				.append("<tr id='"+data[i].Event+"'>"+
				"<td title='"+data[i].Status+"'><img src='/plugins/ipmitool-plugin/images/" + Status + "-on.png'/></td>"+ //status 
				"<td>" + data[i].Event + "</td>"+ //event id
				"<td>" + data[i].Datestamp + " "+data[i].Timestamp+"</td>"+ //time stamp
				"<td>" + data[i].Sensor + "</td>"+ //sensor name
				"<td>" + data[i].Description +"</td>"+ //Description
				"<td><a class='delete'><i class='fa fa-trash' title='delete'></i></a>"+ //delete icon
				"</tr>");

				$('.delete').unbind('click').click(function () {
        			Delete($(this).parent().parent().attr("id"));
    			});
    			
   		});

			//var lastSearch = $("#tblEvent")[0].config.lastSearch;
			$("#tblEvent").trigger("update"); //update table for tablesorter
			//$("#tblEvent").trigger("search", [lastSearch]);
			
			$("#allEvents").click(function() {
  				Delete('all');
			});
 	});
};

function Delete(Row) {
	var Confirm = (Row == "all") ? confirm("Are your sure you want to remove all events!?"): true;
	if (Confirm){
		var Method = (Row == "all") ? "clear " : "delete ";
		var EventId = (Row == "all") ? "" : Row;
		$.getJSON("/plugins/ipmitool-plugin/include/ipmi_event_delete.php", {options: Method + EventId}, function(data) {
				if (Row == "all")
					$("#tblEvent tbody").empty(); // empty table
				else
					$('#'+Row).remove(); //remove table row
				}
		);
	}
};