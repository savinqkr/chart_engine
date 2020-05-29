
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('chartjs'), global) :
        typeof define === 'function' && define.amd ? define(['exports', 'chartjs'], factory) :
            (global = global || self, factory(global.__ChartEngine_Wrapper_ChartJS__ = {}, global.Chart , global ));
}(this, (function (exports, Chart, global)
{ 'use strict';

    global = global || self ;
    const moment = global != null ? global.moment : null ;

    if ( moment == null ) {
        const FORMATS = {
            datetime: 'MMM D, YYYY, h:mm:ss a',
            millisecond: 'h:mm:ss.SSS a',
            second: 'h:mm:ss a',
            minute: 'h:mm a',
            hour: 'hA',
            day: 'MMM D',
            week: 'MMM D',
            month: 'MMM YYYY',
            quarter: '[Q]Q YYYY',
            year: 'YYYY'
        };

        Chart._adapters._date.override({
            _id: 'chart_engine', // DEBUG ONLY

            formats: function () {
                return FORMATS;
            },

            parse: function (value, format) {
                return exports._DateAdapter__parse(value, format);
            },

            format: function (time, format) {
                return exports._DateAdapter__format(time, format);
            },

            add: function (time, amount, unit) {
                return exports._DateAdapter__add(time, amount, unit);
            },

            diff: function (max, min, unit) {
                return exports._DateAdapter__diff(max, min, unit);
            },

            startOf: function (time, unit, weekday) {
                return exports._DateAdapter__startOf(time, unit, weekday);
            },

            endOf: function (time, unit) {
                return exports._DateAdapter__endOf(time, unit);
            },

            _create: function (time) {
                return exports._DateAdapter__create(time);
            },
        });
    }

    exports.configure = function (type, title, xTitle, yTitle, xLabels, datasets, showLegend, showGridLines, showXAxis, showYAxis, timeSeries) {

        const config = {
            type: type,
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                title: {
                    display: title != null ,
                    text: title
                },
                legend: {
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: xTitle != null,
                            labelString: xTitle
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: yTitle != null,
                            labelString: yTitle
                        }
                    }]
                }
            }
        };

        const configData = config['data'];
        let configOptions = config['options'];
        const configScales = configOptions['scales'];

        if (xLabels != null) {
            configData['labels'] = xLabels ;
        }

        if ( showLegend != null ) {
            configOptions['legend']['display'] = showLegend ;
        }

        if ( showGridLines != null ) {
            configScales['xAxes'].forEach(
                e => e['gridLines'] = { display: showGridLines }
            );

            configScales['yAxes'].forEach(
                e => e['gridLines'] = { display: showGridLines }
            );
        }

        if (showXAxis != null) {
            configScales['xAxes'].forEach( e => e['display'] = showXAxis);
        }

        if (showYAxis != null) {
            configScales['yAxes'].forEach( e => e['display'] = showYAxis);
        }

        if (timeSeries != null) {
            configScales['xAxes'].forEach( (e) => {
                e['type'] = 'time';
                e['time'] = {
                    displayFormats: {
                        'millisecond': 'H:mm:ss.SSS',
                        'second': 'H:mm:ss',
                        'minute': 'H:mm',
                        'hour': 'MMM D H:mm',
                        'day': 'MMM D',
                        'week': 'MMM D',
                        'month': 'MMM YYYY',
                        'quarter': '[Q]Q YYYY',
                        'year': 'YYYY',
                    }
                };
            });
        }

        return config ;
    };


    exports.renderLine = function (canvas, title, xTitle, yTitle, xLabels, series, colors, fillLines, straightLines) {
        const ctx = canvas.getContext('2d');

        const datasets = [] ;
        const lineTension = straightLines ? 0.0 : 0.4 ;

        for ( let [key, val] of  Object.entries(series) ) {
            let color = colors[key] ;

            const entry = {
                label: key,
                data: val,
                fill: fillLines,
                borderColor: color,
                backgroundColor: color,
                lineTension: lineTension
            };

            datasets.push( entry ) ;
        }

        const config = this.configure('line', title, xTitle, yTitle, xLabels, datasets) ;

        const chart = new Chart(ctx, config);

        return chart ;
    };


    exports.renderTimeSeries = function (canvas, title, xTitle, yTitle, series, colors, fillLines, straightLines) {
        const ctx = canvas.getContext('2d');

        const datasets = [] ;
        const lineTension = straightLines ? 0.0 : 0.4 ;

        for ( let [key, val] of  Object.entries(series) ) {
            let color = colors[key] ;

            const entry = {
                label: key,
                data: val,
                fill: fillLines,
                borderColor: color,
                backgroundColor: color,
                lineTension: lineTension
            };

            datasets.push( entry ) ;
        }

        const config = this.configure('line', title, xTitle, yTitle, null, datasets, null,null,null,null, true) ;

        console.log(config);

        const chart = new Chart(ctx, config);

        return chart ;
    };

    exports.renderBar = function (horizontal, canvas, title, xTitle, yTitle, xLabels, series, colors) {
        const ctx = canvas.getContext('2d');

        const datasets = [] ;

        for ( let [key, val] of  Object.entries(series) ) {
            let color = colors[key] ;

            const entry = {
                label: key,
                data: val,
                borderColor: color,
                backgroundColor: color,
            };

            datasets.push( entry ) ;
        }

        const type = horizontal ? 'horizontalBar' : 'bar' ;

        const config = this.configure(type, title, xTitle, yTitle, xLabels, datasets) ;

        console.log('>>>>>>>> '+ type +' ; '+ horizontal) ;
        console.log(config);

        const chart = new Chart(ctx, config);

        return chart ;
    };


    exports.renderGauge = function (canvas, title, xTitle, yTitle, xLabels, series, colors, disabledColors) {
        const ctx = canvas.getContext('2d');

        const datasets = [] ;

        for ( let [key, val] of  Object.entries(series) ) {
            let color = colors[key] ;
            let disabledColor = disabledColors[key] ;

            const entry = {
                label: key,
                data: [val, 100-val],
                borderColor: [color, disabledColor],
                backgroundColor: [color, disabledColor],
            };

            datasets.push( entry ) ;
        }

        const type = 'doughnut' ;

        const config = this.configure(type, title, xTitle, yTitle, xLabels, datasets, false, false, false, false) ;

        const configOptions = config['options'];

        configOptions['circumference'] = 1 * Math.PI ;
        configOptions['rotation'] = 1 * Math.PI ;
        configOptions['cutoutPercentage'] = 70 ;

        configOptions['tooltips'] = {
            callbacks: {
                label: function(tooltipItem, data) {
                    const label = data.datasets[tooltipItem.datasetIndex].label;
                    const val = data.datasets[tooltipItem.datasetIndex]['data'][tooltipItem.index] ;

                    if (tooltipItem.index == 0) {
                        return label+': '+ val +'%' ;
                    }
                    else {
                        return val +'%' ;
                    }
                }
            }
        };

        console.log('>>>>>>>> '+ type) ;
        console.log(config);

        const chart = new Chart(ctx, config);

        return chart ;
    };

})));