// //import Ember from 'ember';

// // export default Ember.Component.extend({

Encompass.IndexComponent = Ember.Component.extend({
  tagName: 'index',
  classNameBindings: ['homepage', 'index'],
  
  init () {
    this._super(...arguments)
    console.log('init')
  },

  didReceiveAttrs () {
    this._super(...arguments)
    console.log('did receive attrs')
  },

  willRender () {
    this._super(...arguments)
    console.log('will render')
  },

  didInsertElement () {
    this._super(...arguments)
    console.log('did insert element')
  },

  didRender () {
    this._super(...arguments)
    console.log('did render')
  }
})
