/* taken from http://blog.mackerron.com/2011/01/01/javascript-cubic-splines/ */

CubicInterpolationAnticipationDirection={UP:'up',DOWN:'down',ANY:'any'};

class CubicSplineClass {

    constructor(x, a, d0, dn) {
        var b, c, clamped, d, h, i, k, l, n, s, u, y, z, _ref;
        if (!((x != null) && (a != null))) {
            return;
        }
        clamped = (d0 != null) && (dn != null);
        n = x.length - 1;
        h = [];
        y = [];
        l = [];
        u = [];
        z = [];
        c = [];
        b = [];
        d = [];
        k = [];
        s = [];
        for (i = 0; (0 <= n ? i < n : i > n); (0 <= n ? i += 1 : i -= 1)) {
            h[i] = x[i + 1] - x[i];
            k[i] = a[i + 1] - a[i];
            s[i] = k[i] / h[i];
        }
        if (clamped) {
            y[0] = 3 * (a[1] - a[0]) / h[0] - 3 * d0;
            y[n] = 3 * dn - 3 * (a[n] - a[n - 1]) / h[n - 1];
        }
        for (i = 1; (1 <= n ? i < n : i > n); (1 <= n ? i += 1 : i -= 1)) {
            y[i] = 3 / h[i] * (a[i + 1] - a[i]) - 3 / h[i - 1] * (a[i] - a[i - 1]);
        }
        if (clamped) {
            l[0] = 2 * h[0];
            u[0] = 0.5;
            z[0] = y[0] / l[0];
        } else {
            l[0] = 1;
            u[0] = 0;
            z[0] = 0;
        }
        for (i = 1; (1 <= n ? i < n : i > n); (1 <= n ? i += 1 : i -= 1)) {
            l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * u[i - 1];
            u[i] = h[i] / l[i];
            z[i] = (y[i] - h[i - 1] * z[i - 1]) / l[i];
        }
        if (clamped) {
            l[n] = h[n - 1] * (2 - u[n - 1]);
            z[n] = (y[n] - h[n - 1] * z[n - 1]) / l[n];
            c[n] = z[n];
        } else {
            l[n] = 1;
            z[n] = 0;
            c[n] = 0;
        }
        for (i = _ref = n - 1; (_ref <= 0 ? i <= 0 : i >= 0); (_ref <= 0 ? i += 1 : i -= 1)) {
            c[i] = z[i] - u[i] * c[i + 1];
            b[i] = (a[i + 1] - a[i]) / h[i] - h[i] * (c[i + 1] + 2 * c[i]) / 3;
            d[i] = (c[i + 1] - c[i]) / (3 * h[i]);
        }
        this.x = x.slice(0, n + 1);
        this.a = a.slice(0, n);
        this.b = b;
        this.c = c.slice(0, n);
        this.d = d;
    }

    derivative() {
        var c, d, s, x, _i, _j, _len, _len2, _ref, _ref2, _ref3;
        s = new this.constructor();
        s.x = this.x.slice(0, this.x.length);
        s.a = this.b.slice(0, this.b.length);
        _ref = this.c;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            s.b = 2 * c;
        }
        _ref2 = this.d;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            d = _ref2[_j];
            s.c = 3 * d;
        }
        for (x = 0, _ref3 = this.d.length; (0 <= _ref3 ? x < _ref3 : x > _ref3); (0 <= _ref3 ? x += 1 : x -= 1)) {
            s.d = 0;
        }
        return s;
    }

    interpolate(x) {
        var deltaX, i, y, _ref;
        for (i = _ref = this.x.length - 1; (_ref <= 0 ? i <= 0 : i >= 0); (_ref <= 0 ? i += 1 : i -= 1)) {
            if (this.x[i] <= x) {
                break;
            }
        }
        deltaX = x - this.x[i];
        y = this.a[i] + this.b[i] * deltaX + this.c[i] * Math.pow(deltaX, 2) + this.d[i] * Math.pow(deltaX, 3);
        return y;
    }


    anticipate(x,deltaY,direction,xLimit) {
        var deltaX, i, y, _ref;
        for (i = _ref = this.x.length - 1; (_ref <= 0 ? i <= 0 : i >= 0); (_ref <= 0 ? i += 1 : i -= 1)) {
            if (this.x[i] <= x) {
                break;
            }
        }
        deltaX = x - this.x[i];
        y = this.a[i] + this.b[i] * deltaX + this.c[i] * Math.pow(deltaX, 2) + this.d[i] * Math.pow(deltaX, 3);

        //log.debug('x :',x);
        //log.debug('y :',y);
        //log.debug('i :',i);
        for (let j=0; j<this.x.length; j++) {

            let calculateMin=(k,deltaY) => {
                let a=this.a[k]-(y+deltaY);
                let roots=solveCubic(this.d[k],this.c[k],this.b[k],a);
                //log.debug(roots);
                let min=undefined;
                for(let i=0;i<roots.length;i++) {
                    let r=roots[i]+this.x[k];
                    let highRange=i===this.x.length-1 ? xLimit : this.x[k+1];
                    let lowRange=j===0 ? x : this.x[k];
                    if(r>lowRange && r<highRange) {
                        if(min===undefined) min=r; else min=Math.min(min,r);
                    }
                }
                return min;
            };

            let index=(i+j)%this.x.length;
            //log.debug('at index :',index);

            let m1=undefined,m2=undefined;
            if(direction===CubicInterpolationAnticipationDirection.ANY||direction===CubicInterpolationAnticipationDirection.UP) m1=calculateMin(index,deltaY);
            if(direction===CubicInterpolationAnticipationDirection.ANY||direction===CubicInterpolationAnticipationDirection.DOWN) m2=calculateMin(index,-deltaY);
            //log.debug('m1 :',m1);
            //log.debug('m2 :',m2);
            let m=m1;
            if(m==undefined) m=m2; else if(m2!==undefined && m2<m1) m=m2;
            if(m!==undefined) {
                if(j+i>this.x.length) return m+xLimit-x; else return m;
            }
        }

        return undefined;
    }
}

CubicSpline=CubicSplineClass;