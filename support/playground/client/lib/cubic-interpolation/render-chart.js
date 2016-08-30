/* taken from http://blog.mackerron.com/2011/01/01/javascript-cubic-splines/  and adjusted */

class QuestionClass  {
    
    constructor() {
        _answer: null;
    }
    
    answer() {
        if (arguments.length > 0) {
            this._answer = arguments[0];
            return this;
        }
        return this._answer;
    }
}

Question=QuestionClass;

class SplineChartClass {
    constructor(div_id, xAxisLabel, yAxisLabel, color, xMin, xMax, yMin,yMax, splineFunc) {
        this.div_id = div_id;
        this.iOS = !! window.navigator.appVersion.match(/\biP(ad|od|hone)\b/);
        this.xAxisLabel = xAxisLabel;
        this.yAxisLabel = yAxisLabel;
        this.color = color;
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.splineFunc = splineFunc;

        this.questions = [];
        this.ys = [];
        this.handles = [];
        this.xLabs = [];
        this.yLabs = [];
    }

    miniMax(a) {
        let min=Number.MAX_VALUE;
        let max=Number.MIN_VALUE;
        for(let i=0;i<a.length;i++) {
            let j=a[i];
            if(j<min) min=j;
            if(j>max) max=j;
        }
        return [min,max];
    }

    toTime(x) {
        let t = 60 * x;

        function doubleDigits(d) {
            if (d < 10) return '0' + d.toFixed(0); else return d.toFixed(0);
        }

        let s = doubleDigits(Math.floor(t / 60)) + ':' + doubleDigits(t % 60);
        if (s == '24:00') s = '00:00';
        return s;
    }

    toYLabel(y) {
        let range=(this.yMax-this.yMin);
        let v=this.yMin+range*y;
        if(range>90) return v.toFixed(0);
        if(range<=10) return v.toPrecision(2);
        return v.toPrecision(1);
    }

    draw(firstTime,rebuild) {
        var me = this;
        var div = $('#'+this.div_id);
        var canvas = div.find("canvas:first");

        var width = parseInt(canvas.attr('width'));  // it's a string in IE6(+?)
        var height = parseInt(canvas.attr('height'));

        var pxJump = 3, xPadProp = 0, yPadProp = 0, handleSize = 14, curveWidth = 2;
        if (this.iOS) handleSize *= 2;

        var xs = this.questions.map(function(a) { return parseFloat(a.answer()); });
        let xminmax=this.miniMax(xs);
        let xmin=xminmax[0];
        let xmax=xminmax[1];
        var xrange = xmax - xmin;
        //xmin -= xrange * xPadProp;
        xmax += xrange * xPadProp;
        xmin=0;
        xmax=24;
        xrange = 24;//xmax - xmin;
        me.xfactor = width / xrange;

        var ys = this.ys;
        let yminmax=this.miniMax(ys);
        let ymin=yminmax[0];
        let ymax=yminmax[1];

        var yrange = 1;//ymax - ymin;
        ymin -= yrange * yPadProp;
        ymax += yrange * yPadProp;
        ymin=0;
        ymax=1;
        yrange = 1;//ymax - ymin;
        var yfactor = height / yrange;
        me.yfactor=yfactor;

        // fix infinite gradients to be just sub-infinite for plotting purposes
        var lastX, tinyAdjustment = 0.00001;
        var adjustedXs = xs.map(function(x) {
            if (x == lastX) x += tinyAdjustment;
            lastX = x;
            return x;
        });
        // var cdf = new MonotonicCubicSpline(adjustedXs, ys);

        var cdf = this.splineFunc(adjustedXs, ys);

        var ctx = canvas.get(0).getContext('2d');
        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = '#ccc';
        ctx.fillStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();

        // axis labels
        if (firstTime) {
            var xAxisLabel = $('<div/>', {'class': 'cubic_spline_xaxis_label'});
            xAxisLabel.css({width :canvas.width + 'px'});
            div.append(xAxisLabel);
            var yAxisLabel = $('<div/>', {'class': 'cubic_spline_yaxis_label'});
            yAxisLabel.css({top:(canvas.height / 2 - 9) + 'px'});
            div.append(yAxisLabel);
            //if (me.ie) yAxisLabel.setStyle({top: (canvas.height / 2 - 100) + 'px', left: '-70px'});
        }

        if (firstTime) {
            canvas.on('dblclick',function(e) {  me.addPoint(e,canvas.offset().left,canvas.offset().top); } );
        }

        // general iterator
        var forEachXY = function(callback) {
            for (var i = 0, len = xs.length; i < len; i ++) {
                var x = xs[i], y = ys[i];
                var pxX = (x - xmin) * me.xfactor;
                var pxY = (y - ymin) * yfactor;
                callback(x, y, pxX, pxY, i);
            }
        }

        if (firstTime || rebuild) {
            $('.cubic_spline_xlabel').remove();
            $('.cubic_spline_ylabel').remove();
            me.xLabs = [];
            me.yLabs = [];
        }

        forEachXY(function(x, y, pxX, pxY, i) {
            // vertical (x) lines
            ctx.moveTo(pxX, 0);
            ctx.lineTo(pxX, height);

            // x labels
            var xLab;
            if (firstTime || rebuild) {
                xLab = $('<div/>', {'class': 'cubic_spline_xlabel'});
                me.xLabs[i] = xLab;
                div.append(xLab);
            } else {
                xLab = me.xLabs[i];
            }

            xLab.html(me.toTime(x));

            xLab.css({
                left: (pxX - 75) + 'px',
                top:(height + 9) + 'px'
            });

            // horizontal (y) lines
            ctx.moveTo(0, height-pxY);
            ctx.lineTo(width, height-pxY);

            // y labels
            var yLab;
            if (firstTime || rebuild) {
                yLab = $('<div/>', {'class': 'cubic_spline_ylabel'});
                me.yLabs[i] = yLab;
                div.append(yLab);
            }
            else {
                yLab=me.yLabs[i];
            }
            yLab.css({ top:((height - pxY) - 10) + 'px'});
            yLab.html(me.toYLabel(y));

        });
        ctx.stroke();
        ctx.closePath();

        // spline
        var started = false;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = curveWidth;
        ctx.beginPath();
        for (var pxX = 0; pxX <= width; pxX += pxJump) {
            var splineX = xmin + pxX / me.xfactor;
            var splineY = cdf.interpolate(splineX);
            if (typeof(splineY) == 'number') {
                pxY = (splineY - ymin) * yfactor;
                if (started) ctx.lineTo(pxX, height - pxY);
                else {
                    ctx.moveTo(pxX, height - pxY);
                    started = true;
                }
            }
        }
        ctx.stroke();
        ctx.closePath();

        // handles
        var handle;
        if (firstTime || rebuild) {
            $('.cubic_spline_handle').remove();
            me.handles = [];
        }
        forEachXY(function(x, y, pxX, pxY, i) {
            if (firstTime || rebuild) {
                handle = $('<div/>', {'class': 'cubic_spline_handle'});
                handle.dblclick(function(e) { me.edit(i, e); });
                handle.mousedown(function(e) { me.slide(i, e); });
                if (me.iOS) handle.touchstart(function(e) {
                    if (me.lastTapTime && new Date().getTime() - me.lastTapTime < 500 && me.lastTapHandle == i)
                        me.edit(i, e);
                    else
                        me.slide(i, e);
                    me.lastTapHandle = i;
                    me.lastTapTime = new Date().getTime();
                });
                var handleSizeStyle = (handleSize - 4) + 'px';
                var handleBRadStyle = (handleSize / 2) + 'px';
                handle.css({
                    width: handleSizeStyle,
                    height: handleSizeStyle,
                    'border-radius': handleBRadStyle
                });
                me.handles[i] = handle;
                div.append(handle);
            } else {
                handle = me.handles[i];
            }
            handle.css({left: (pxX - handleSize / 2 + 1) + 'px', top: ((height - pxY) - handleSize / 2 + 1) + 'px'});
        });
    }
    
    slide(i, e) {
        e.stopPropagation();
        var precision = 2;
        var me = this, doc = $(document.documentElement);
        var q = me.questions[i];
        me.slideX = parseFloat(q.answer());
        me.slidePxX = e.clientX || e.changedTouches[0].clientX;
        me.slideY=this.ys[i];
        me.slidePyY = e.clientY || e.changedTouches[0].clientY;

        $('#page').css({cursor: 'col-resize'});
        me.setHandleHighlight(i, true);
        var moveFunc = function(e) {
            e.stopPropagation();
            var newX = me.slideX + ((e.clientX || e.changedTouches[0].clientX) - me.slidePxX) / me.xfactor;
            var newY = me.slideY - ((e.clientY || e.changedTouches[0].clientY) - me.slidePyY) / me.yfactor;
            if(newY<0) newY=0;
            if(newY>1) newY=1;
            if(newX<0) newX=0;
            me.ys[i]=newY;
            if(i!=0 && i!=me.ys.length-1) q.answer(me.truncateX(newX, i));
            if(i===0) {
                me.ys[me.ys.length-1]=newY;
            }
            if(i===me.ys.length-1) {
                me.ys[0]=newY;
            }
            me.draw();
        }
        doc.mousemove(moveFunc);
        if (me.iOS) doc.touchmove(moveFunc);
        var upFunc = function(e) {
            doc.unbind('mousemove');
            if (me.iOS) doc.unbind('touchmove');
            $('#page').css({cursor: 'default'});
            me.setHandleHighlight(i, false);
        }
        doc.on('mouseup', upFunc);
        if (me.iOS) {
            doc.touchend(upFunc);
            doc.touchcancel(upFunc);
        }
    }

    addPoint(e,left,top) {
        e.stopPropagation();
        let me=this;

        console.log('client x',e.clientX-left);
        console.log('client y',e.clientY-top);


        var newX = (e.clientX-left) / me.xfactor;
        var newY = 1-(e.clientY-top) / me.yfactor;

        console.log('x',newX);
        console.log('y',newY);
        let j=0;
        while(newX>this.questions[j].answer() && j<this.questions.length-1) j++;

        console.log('j:',j);

        this.ys.splice(j,0,newY);
        this.questions.splice(j,0,new Question().answer(newX));

        console.log(this.questions)

        this.draw(false,true);
    }

    edit(i, e) {
        e.stopPropagation();
        if(i===0 || i===this.ys.length-1) return;
        this.ys.splice(i,1);
        this.questions.splice(i,1);
        this.handles.splice(i,1);
        this.draw(false,true);
    }
    
    truncateX(x, i) {  // fixes and formats x
        var minGap = 0, precision = 2;
        x = x.toFixed(precision);
        if (i > 0) x = Math.max(x, parseFloat(this.questions[i - 1].answer()) + minGap);
        if (i < this.questions.length - 1) x = Math.min(x, parseFloat(this.questions[i + 1].answer()) - minGap);
        x = Math.max(x, this.xMin);
        x = Math.min(x, this.xMax);
        x = x.toFixed(precision);  // sometimes ends .XX99999999999 or .XX000000001 otherwise
        xStr = x + '';
        xStr = xStr.replace(/[.]0+$/, '').replace(/([.][0-9]+)0+$/, '$1');  // eliminate trailing zeroes
        return xStr;
    }
    setHandleHighlight(i, h) {  // h = true if highlighted
        this.handles[i].css({'background-color': h ? '#ff0' : '#fff'});
        this.xLabs[i].css({'font-weight': h ? 'bold' : 'normal'});
        this.yLabs[i].css({'font-weight': h ? 'bold' : 'normal'});
    }
    point(question, y) {
        this.questions.push(question);
        this.ys.push(y);
    }
}

SplineChart=SplineChartClass;