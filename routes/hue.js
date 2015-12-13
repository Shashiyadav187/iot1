var express = require('express');
var router = express.Router();
var Cylon = require('cylon');
var host = '10.0.1.71';
var username = '215c4296227a3247159acafa1258e75b';
var redAlert = null;
/* GET home page. */
router.get('/', function(req, res, next) {

	Cylon.robot({
		connections: {
			hue: {
				adaptor: 'hue',
				host: host,
				username: username
			}
		},

		devices: {
			bridge: {
				driver: 'hue-bridge'
			}
		},

		work: function(my) {
			my.bridge.getFullState(function(err, config) {

				if (err) {
					var result = {
						success: false,
						error: err
					}
				} else {
					var lights = [];
					for (var i in config.lights) {
						lights.push({
							'id': i,
							'state': config.lights[i].state.on,
							'reachable': config.lights[i].state.reachable,
							'name': config.lights[i].name
						});
					}
					var result = {
						success: true,
						lights: lights,
						config: config.config
					}
				}
				res.writeHead(200, {
					"Content-Type": "application/json"
				});
				res.write(JSON.stringify(result));
				res.end();
			});
		}
	}).start();
});

// toggle state
router.put('/', function(req, res) {

	var lightId = req.body.id;
	var turnOn = (req.body.turnOn == 'true');

	console.log(host, username);

	Cylon.robot({
		connections: {
			hue: {
				adaptor: 'hue',
				host: host,
				username: username
			}
		},

		devices: {
			bulb: {
				driver: 'hue-light',
				lightId: lightId
			}
		},

		work: function(my) {

			// console.log(my.bulb);

			// my.bulb.rgb(78,242,100);
			console.log(lightId, turnOn);
			if (turnOn) {
				console.log('turning on...');
				my.bulb.turnOn();
				my.bulb.rgb(0, 102, 51);
			} else {
				console.log('turning off...');
				if (global.redAlert) {		
					clearInterval(global.redAlert);
					global.redAlert = null;
				}
				console.log('now turnoff...');

				my.bulb.turnOff();
				
			}


			var result = {
				success: true
			};
			res.writeHead(200, {
				"Content-Type": "application/json"
			});
			res.write(JSON.stringify(result));
			res.end();

		}
	}).start();

});

router.post('/', function(req, res) {

	var lightId = req.body.id;
	var turnOn = (req.body.turnOn == 'true');

	
	Cylon.robot({
		connections: {
			hue: {
				adaptor: 'hue',
				host: host,
				username: username
			}
		},

		devices: {
			bulb: {
				driver: 'hue-light',
				lightId: lightId
			}
		},

		work: function(my) {

			if (!global.redAlert) {
				my.bulb.turnOn();
				my.bulb.rgb(255, 0, 0);
				
				global.redAlert = every((0.8).second(), function() {
					my.bulb.toggle();
				});
			}
			
			console.log('redalert',global.redAlert);

			var result = {
				success: true
			};
			res.writeHead(200, {
				"Content-Type": "application/json"
			});
			res.write(JSON.stringify(result));
			res.end();

		}
	}).start();

});

module.exports = router;