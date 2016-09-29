import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Router.configure({
  layoutTemplate: 'main'
});

Router.route('/', {
  template: 'about'
});