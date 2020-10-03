/*
    Javascript calculator for PWM LED dimming curves
    Copyright (C) 2020 David Young

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
function calculate() {
	console.log("Entering calculate");

	let input_steps = parseFloat(document.getElementById("input_steps").value);
	let output_min = parseFloat(document.getElementById("output_min").value);
	let output_max = parseFloat(document.getElementById("output_max").value);
	let output_format = document.getElementById("output_format").value;

	let args = {
		output_min: output_min,
		output_max: output_max,
		input_steps: input_steps,
		output_steps: output_max - output_min,
		output_format: output_format
	};

	console.log("Params: ", args);

	switch(document.getElementById("curve_select").value) {
		case "exponential":
			exponential(args);
			break;
		case "quadratic":
			quadratic(args);
			break;
		default:
			write_output("Invalid curve selected");
			break;
	}
}

function write_output(table, args) {
	var out_text = "";
	let fmt = args["output_format"];
	let rounded = table.map(n => Math.round(n));
	// Array header
	switch(fmt) {
		case "C":
			out_text += "const uint16_t curve[] = {";
			break;
		case "Rust":
			out_text += "let curve: [u8] = [";
	}

	out_text += rounded.map(n => " " + n);

	// Array trailer
	switch(fmt) {
		case "C":
			out_text += "};";
			break;
		case "Rust":
			out_text += "];";
	}
	document.getElementById("calculated_curve").innerHTML = out_text;
	make_charts(table, rounded);
}

function make_charts(table, rounded) {
	console.log("Entering make_charts");
	var options = {
          series: [{
            name: "Calculated",
            data: table
        }, {
        	name: "Rounded",
        	data: rounded
        }
        ],
          chart: {
          height: 550,
          type: 'line',
          zoom: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'straight',
          width: 1
        },
        markers: {
        	size: 1
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
          },
        },
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
}

function exponential(args) {
	// https://diarmuid.ie/blog/pwm-exponential-led-fading-on-arduino-or-other-platforms
	let r = (args['input_steps'] - 1) * Math.log(2) / Math.log(args['output_steps']);
	console.log("r is: " + r);

	var steps = []
	for(var x = 0; x < args["input_steps"]; x++) {
		steps.push(Math.pow(2, (x / r)) - 1 + args["output_min"]);
	}
	console.log("steps: " + steps);
	write_output(steps, args);
}

function quadratic(args) {

}


// Shortcut functions to load up the output numbers for different
// PWM widths
function shortcutOut(v) {
	document.getElementById("output_min").value = 0;
	document.getElementById("output_max").value = v;
}
function shortcutIn(v) {
	document.getElementById("input_steps").value = v;
}
