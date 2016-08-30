import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './main.html';

Template.hello.onRendered(function helloOnCreated() {
  var ChartNatural=new SplineChart('chart_natural', 'X', 'F(x)', '#0f0', -100, 100,0,100, function(xs, ys) {
    return new CubicSpline(xs, ys);
  });
  ChartNatural.point(new Question().answer(0),  0.5);
  ChartNatural.point(new Question().answer(2),  0.25);
  ChartNatural.point(new Question().answer(6),  0.5);
  ChartNatural.point(new Question().answer(9.6),  0.75);
  ChartNatural.point(new Question().answer(24), 0.5);

  ChartNatural.draw(true);
});



Template.hello.helpers({
});

Template.hello.events({
});
