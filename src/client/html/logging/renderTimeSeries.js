Template.renderTimeSeries.helpers({
    since: function() {

        var t=Template.instance();
        if(t.since===undefined) t.since=moment().subtract(14,'days');
        console.log('render since '+t.since.format('MM/DD/YYYY h:mm A'));
        return t.since.format('MM/DD/YYYY h:mm A');
    }
});


function convertData(result) {
    var data=[];
    for(var i in result) {
        var d=new Date();
        d.setTime(i);
        data[data.length]={ x: d,y:result[i]};
    }
    return data;
}

Template.renderTimeSeries.events({

});



/*
 linear - piecewise linear segments, as in a polyline.
 linear-closed - close the linear segments to form a polygon.
 step - alternate between horizontal and vertical segments, as in a step function.
 step-before - alternate between vertical and horizontal segments, as in a step function.
 step-after - alternate between horizontal and vertical segments, as in a step function.
 basis - a B-spline, with control point duplication on the ends.
 basis-open - an open B-spline; may not intersect the start or end.
 basis-closed - a closed B-spline, as in a loop.
 bundle - equivalent to basis, except the tension parameter is used to straighten the spline.
 cardinal - a Cardinal spline, with control point duplication on the ends.
 cardinal-open - an open Cardinal spline; may not intersect the start or end, but will intersect other control points.
 cardinal-closed - a closed Cardinal spline, as in a loop.
 monotone - cubic interpolation that preserves monotonicity in y.
 */
Template.renderTimeSeries.onRendered(function() {
    var self=this;
    $('#timeSeries').get(0).style.height=Math.round(0.5*window.outerHeight)+'px';
    var chart=null;
    var data=null;
    SemanticUI.modal("#timeSeriesModal",function () {
        $('#reportingRangePicker').daterangepicker();

        var picker=$('#reportingRangePicker');
        picker.blur();
        picker.daterangepicker({
                singleDatePicker: true,
                startDate: moment().subtract(14,'days'),
                //showDropdowns: true,
                timePicker: true,
                locale: {
                    format: 'MM/DD/YYYY h:mm A'
                },
                ranges: {
                    'Last Hour': [moment().subtract(1, 'hours'), moment()],
                    'Previous 24h': [moment().subtract(24, 'hours'), moment()],
                    'Previous 7 days': [moment().subtract(7, 'days'), moment()],
                    'Previous 30 days': [moment().subtract(30, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment()],
                    'Previous 365 days': [moment().subtract(365, 'days'), moment()],
                    'This Year': [moment().startOf('year'), moment()]
                }
            },
            function(start, end, label) {
        });
        picker.blur();

        picker.on('apply.daterangepicker', function(ev, picker) {
            console.log('apply.daterangepicker '+picker.startDate.format('MM/DD/YYYY h:mm A'));
            self.since=picker.startDate;
            Meteor.call('DataLoggingUI_getSensorData',self.data.sensor,picker.startDate.valueOf(),function (error, result) {
                data=convertData(result);
                var conf = {
                    "xScale": "time",
                    "yScale": "linear",
                    "type": "line",
                    "main": [
                        {
                            "className": ".general",
                            "data": data
                        }
                    ]
                };
                self.chart.setData(conf);
            });
        });

        var opts = {
            "tickFormatX": function (x) {
                if(self.since.valueOf() > moment().subtract(1,'days')) {
                    return d3.time.format('%H:%M')(x);
                }
                if(self.since.valueOf() > moment().subtract(7,'days')) {
                    return d3.time.format('%A %H:%M')(x);
                }
                else
                {
                    return d3.time.format('%x')(x);
                }
            },
            "tickFormatY": function (x) { return x.toFixed(2); },
            interpolation: 'linear'
       };

       var conf = {
            "xScale": "time",
            "yScale": "linear",
            "type": "line",
            "main": [
                {
                    "className": ".general",
                    "data": data!=null ? data : []
                }
            ]
        };

        chart = new xChart('line', conf, '#timeSeries', opts);
        self.chart=chart;
    });

    var since=this.since.valueOf();
    Meteor.call('DataLoggingUI_getSensorData',this.data.sensor,since,function (error, result) {
        data=convertData(result);
        if(chart!=null) {
            chart.setData(data);
        }
    });

});
