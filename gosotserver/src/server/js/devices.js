//TODO: comment this code!!
var lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
};
  
$(function() {
	deviceInfo();
	var deviceBoxes = [];
	var deviceType = $( "#deviceType" ),
		deviceName = $( "#deviceName" ),
      	deviceId = $( "#deviceId" );
		allFields = $( [] ).add( deviceType ).add( deviceId ).add( deviceName );
	function checkRegexp( o, regexp, n ) {
		  if ( !( regexp.test( o.val() ) ) ) {
			o.addClass( "ui-state-error" );
			updateTips( n );
			return false;
		  } else {
			return true;
		  }
		}
 		
		$( "#dialog-form" ).dialog({
		  autoOpen: false,
		  height: 430,
		  width: 450,
		  modal: true,
		  buttons: {
			"Add New Device": function() {
			  var bValid = true;
			  allFields.removeClass( "ui-state-error" );
			  $.ajax({
				  url:"/newDevice",
				  type: "POST",
				  data: { 
					deviceType: deviceType.val(),
					deviceId: deviceId.val(),
					deviceName: deviceName.val(),
				  }
			  }).done(function(response) {
				alert(response);
				$("#dialog-form").dialog("close");
				location.reload();
			  });
			},
			Cancel: function() {
			  $( this ).dialog( "close" );
			}
		  },
		  close: function() {
			deviceName.val("");
			deviceId.val("");
			deviceType.prop('checked', false);
			allFields.removeClass( "ui-state-error" );
		  }
		});
 
		$( "#newDeviceButton" )
		  .click(function() {
			$( "#dialog-form" ).dialog( "open" );
		});
		$("input:radio[name=deviceType]").click(function() {
    		deviceType = $(this);
		});

		function deviceInfo() {
			$.ajax({
				url: "/getDeviceInfo",
				type: "GET",
				success: function(response) {
					if(response != null) {
						//alert(JSON.stringify(response[2]['Name']));
						for(i = 0; i < response.length; i++) {
							//alert(JSON.stringify(response[i]));
							var box = createDeviceBox(response[i]['Name'], response[i]['ID'], response[i]['IsStolen'], response[i]['TraceRouteList'], response[i]['KeylogData'], response[i]['Coordinates']);
							deviceBoxes.push(box);
							$("#deviceMenu").append($("<li>", {class: "divider", style: "margin:0px;"}));
							var deviceButton = $("<li>", {id: response[i]['Name'], style: "padding: 9px;", value:i});
							deviceButton.text(response[i]['Name']);
							deviceButton.click(function() {
								for(j = 0; j < deviceBoxes.length; j++) {
									if(j != $(this).val()) {
										deviceBoxes[j].hide();
									}
								}
								deviceBoxes[$(this).val()].toggle();
							});
							$("#deviceBoxRow").append(deviceBoxes[i]);
							$("#deviceMenu").append(deviceButton);
						}
					} 
					$("#deviceMenu").append($("<li>", {class: "divider", style: "margin:0px;"}));
					var addDeviceButton = $("<li>", {id: "newDeviceButton", style: "padding: 9px;"});
					addDeviceButton.text("Add Device");
					addDeviceButton.click(function() {
						$( "#dialog-form" ).dialog( "open" );
					});
					$("#deviceMenu").append(addDeviceButton);
					$("#deviceBoxRow").append($("<div>", {class: "col-md-1"}));
					//alert(JSON.stringify(response[0]['Name']));	
				},
				error: function(err) {
					alert("ERROR:" + JSON.stringify(err));
				}
			});
			
		}
		
		function createDeviceBox(deviceNameIn, deviceId, deviceStatusIn, ipIn, keylogIn, coordsIn) {
			var deviceDiv = $("<div>", {id: deviceNameIn, class: "col-md-3 deviceInfo"});
			var row = $("<div>", {class: "row"});
			var colmd12 = $("<div>", {class: "col-md-12"});
			var nav = $("<nav>", {class: "navbar-default navbar-static-side", role:"navigation"});
			var side = $("<div>", {class: "sidebar-collapse"});
			var ul = $("<ul>", {class: "nav", id: "side-menu"});
			var row2 = $("<div>", {class: "row"});
			var colmd1 = $("<div>", {class: "col-md-1"});
			var colmd10 = $("<div>", {class: "col-md-10"});
			var li = $("<li>");
			var deviceName = $("<h3>");
			deviceName.text(deviceNameIn);
			var li2 = $("<li>");
					
			var deviceType;
			if(deviceId.length < 12) {
				deviceType = "gps";
			} else {
				deviceType = "laptop";	
			}
			
			if(deviceType == "laptop") {
			
				var showKeylogButton = $("<li>", {"data-toggle": "modal", "data-target": "#modalKeylogger"});
				var showKeylogLink = $("<a>").text("Show Keylog");
				
				
				showKeylogButton.click(function(){
					//alert(keylogIn[0].substring(keylogIn[0].indexOf("&") + 1));
					// Clear text
					$("#modalKeylogger").find(".modal-footer").text("");
					for(i = 0; i < keylogIn.length; i++) {
							$("#modalKeylogger").find(".modal-footer").append($("<h4>").text(keylogIn[i].substring(0, keylogIn[i].indexOf("&"))));
							$("#modalKeylogger").find(".modal-footer").append(keylogIn[i].substring(keylogIn[i].indexOf("&") + 1));
							$("#modalKeylogger").find(".modal-footer").append("<br>");
						
					}
					$("#modalKeylogger").find(".modal-footer").append("<br>");
				});
				
				showKeylogButton.append(showKeylogLink);
				// Parse ipIn into timestamp and multiple ip addresses
				
				var showIPListButton = $("<li>", {"data-toggle": "modal", "data-target": "#modalIPList"});
				var showIPListLink = $("<a>").text("Show IPs");
				
				/* NOTE: possible usage of ipinfo.io to get ip geolocation
				*		most likely handle it on server, because making requests each time on webview
				*		is too costly	OR http://ipinfodb.com/ 	
				*/
				
				showIPListLink.click(function() {
					// Clear text
					$("#modalIPList").find(".modal-footer").text("");
					for(i = 0; i < ipIn.length; i++) {
						//alert(ipIn[i]);
						$("#modalIPList").find(".modal-footer").append($("<h4>").text(ipIn[i].substring(0, ipIn[i].indexOf("&"))));
						var ipList = ipIn[i].substring(ipIn[i].indexOf("&") + 1).split("~");
						for(j = 0; j < ipList.length; j++) {
							$("#modalIPList").find(".modal-footer").append(ipList[j]);
							$("#modalIPList").find(".modal-footer").append("<br>");
						}
						$("#modalIPList").find(".modal-footer").append("<br>");
					}
					
				});
				showIPListButton.append(showIPListLink);
			} // END if(deviceType == "laptop")
			if(deviceType == "gps") {
				var showCoordListButton = $("<li>", {"data-toggle": "modal", "data-target": "#modalCoordList"});
				var showCoordListLink = $("<a>").text("Show Coords");
				var deviceCoords = [];
				var deviceCoordDirections = [];
				for(k = 0; k < coordsIn.length; k++) {
						var coordList = coordsIn[k].substring(coordsIn[k].indexOf("&") + 1).split(String.fromCharCode(27));
						var markerPos = new google.maps.LatLng(parseFloat(coordList[0]), parseFloat(coordList[1]));
						var marker = new google.maps.Marker({
	            			position: markerPos,
							icon: markerIcons[gpsDevices.length % 7],
	            			map: map,
	            			title: coordsIn[k].substring(0, coordsIn[k].indexOf("&"))
	    				});
						deviceCoords.push(marker);
						if(k > 0) {
							var line = new google.maps.Polyline({
								path: [deviceCoords[k - 1].position, deviceCoords[k].position],
								icons: [{
									icon: lineSymbol,
									offset: '100%'
								}],
								map: map
							});
							deviceCoordDirections.push(line);
						}
				}
				gpsDevices.push(deviceId);
				gpsDevicePins.push(deviceCoords);
				gpsDevicePinsDirections.push(deviceCoordDirections);
				var showPreviousLocationsButton = $("<div>", {id: deviceId, class: "showPrevLocButton"});
				showPreviousLocationsButton.text("toggle locs");
				showPreviousLocationsButton.click(function() {
					var deviceIndex = gpsDevices.indexOf($(this).attr("id"));
					for(i = 0; i < gpsDevicePins[deviceIndex].length; i++) {
						//alert(gpsDevicePinsDirections[deviceIndex]);
						if(i < (gpsDevicePins[deviceIndex].length - 1)) {
							if(gpsDevicePins[deviceIndex][i].getVisible()) {
								gpsDevicePinsDirections[deviceIndex][i].setMap(null);
							} else {
								gpsDevicePinsDirections[deviceIndex][i].setMap(map);
							}
						}
						gpsDevicePins[deviceIndex][i].setVisible(!gpsDevicePins[deviceIndex][i].getVisible());
						//alert(gpsDevicePins[deviceIndex].length);
							
					}
				});
				showCoordListLink.click(function() {
					// Clear text
					$("#modalCoordList").find(".modal-footer").text("");
					for(i = 0; i < coordsIn.length; i++) {
						//alert(ipIn[i]);
						$("#modalCoordList").find(".modal-footer").append($("<h4>").text(coordsIn[i].substring(0, coordsIn[i].indexOf("&"))));
						var coordList = coordsIn[i].substring(coordsIn[i].indexOf("&") + 1).split(String.fromCharCode(27));
						$("#modalCoordList").find(".modal-footer").append("Latitude: ");
						$("#modalCoordList").find(".modal-footer").append(coordList[0]);
						$("#modalCoordList").find(".modal-footer").append("&nbsp;&nbsp;");
						$("#modalCoordList").find(".modal-footer").append("Longitude: ");
						$("#modalCoordList").find(".modal-footer").append(coordList[1]);
						$("#modalCoordList").find(".modal-footer").append("<br>");
					}
					
				});
				showCoordListButton.append(showCoordListLink);
				
				var pingDeviceButton = $("<div>", {id: deviceId, class: "pingButton"});
				pingDeviceButton.text("Ping");
				pingDeviceButton.click(function() {
					$.ajax({
						url: "/pingDevice",
						type: "POST",
						data: {
							/*//FOR TESTING
							deviceId: "2567978990",
							deviceType: "gps"*/
							deviceId: $(this).attr("id"),
							deviceType: "gps",
							deviceCommand: "ping"
						}
					}).done(function(e) {
						//alert(e);
					});
				});
			}
			var activateDeviceButton = $("<div>", {id: deviceId, class: "activateButton"});
			var deviceStatus = $("<h5>");
			var command;
			if(deviceStatusIn == "49") {
				deviceStatus.text("Stolen");
				activateDeviceButton.text("Deactivate");
				command = 0;
			} else {
				deviceStatus.text("Not Stolen");	
				activateDeviceButton.text("Activate");
				command = 1;
			}
			
			activateDeviceButton.click(function() {
					$.ajax({
						url: "/toggleDevice",
						type: "POST",
						data: {
							/*//FOR TESTING
							deviceId: "2567978990",
							deviceType: "gps"*/
							deviceId: $(this).attr("id"),
							deviceType: deviceType,
							deviceCommand: command
						}
					}).done(function(e) {
						//alert(e);
						location.reload();
					});
				});	
			
			
			
			li2.append(deviceStatus);
			li.append(deviceName);
			colmd10.append(li);
			colmd10.append(li2);
			if(deviceType == "laptop") {
				colmd10.append(showIPListButton);
				colmd10.append(showKeylogButton);
			}
			if(deviceType == "gps") {
				colmd10.append(showCoordListButton);	
				colmd10.append(showPreviousLocationsButton);
				colmd10.append(pingDeviceButton);
			}
			colmd10.append(activateDeviceButton);
			row2.append(colmd1);
			row2.append(colmd10);
			ul.append(row2);
			side.append(ul);
			nav.append(side);
			colmd12.append(nav);
			row.append(colmd12);
			deviceDiv.append(row);
			return deviceDiv;
		}
		
		

			
		
		
});


function showKeylog(){
	
	Downloadify.create('downloadify',{
		
		filename: function(){
			return document.getElementById('filename').value;
		},
		
		data: function(){ 
			return document.getElementById('data').value;
		},
		
		onComplete: function(){ alert('Your File Has Been Saved!'); },
		onCancel: function(){ alert('You have cancelled the saving of this file.'); },
		onError: function(){ alert('You must put something in the File Contents or there will be nothing to save!'); },
		
		swf: 'media/downloadify.swf',
		downloadImage: 'images/download.png',
		width: 100,
		height: 30,
		transparent: true,
		append: false
		
	});
	
}

