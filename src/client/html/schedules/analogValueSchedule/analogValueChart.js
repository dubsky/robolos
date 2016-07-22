Template.analogValueChart.onRendered(function () {
    let ChartNatural=new SplineChart('chart_natural', 'X', 'F(x)', '#FF0000', -100, 100,0,100, function(xs, ys) {
        return new CubicSpline(xs, ys);
    });

    let analogValueData=Session.get(CURRENT_GRAPH_SESSION_KEY);
    if(analogValueData===undefined) analogValueData=(this.data===undefined || this.data.data===undefined) ? undefined : this.data.data;
    if(analogValueData!==undefined) {
        for(let i=0;i<analogValueData.x.length;i++) {
            ChartNatural.point(new Question().answer(analogValueData.x[i]), analogValueData.y[i]);
        }
    }
    else {
        ChartNatural.point(new Question().answer(0),  0);
        ChartNatural.point(new Question().answer(8),  0.115);
        ChartNatural.point(new Question().answer(9.33),  0.595);
        ChartNatural.point(new Question().answer(12.33),  0.345);
        ChartNatural.point(new Question().answer(18), 0.18);
        ChartNatural.point(new Question().answer(20), 0.0);
        ChartNatural.point(new Question().answer(24), 0);
    }

    ChartNatural.draw(true);
});

Template.analogValueChart.onCreated(function() {
    // deleted in view/add schedule so that context is maintained during action edit
    //if(this.data===undefined || !this.data.keepInSession) Session.set(CURRENT_GRAPH_SESSION_KEY,undefined);
});
