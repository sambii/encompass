// import Ember from 'ember'

// export default Ember.Component.extend({
//   tagName: 'index home page',
//   classNameBindings: ['isSmallHeader:small', 'isHidden:hide'],
//   elementId: 'al_header',
//   isSmallHeader: false,
//   isHidden: false,

//   actions: {
//     largeHeader: function () {
//       this.set('isSmallHeader', false)
//     },
//     smallHeader: function () {
//       this.set('isSmallHeader', true)
//     }
//   }
// })

Encompass.IndexComponent = Ember.Component.extend({
  tagName: 'index',
  classNameBindings: ['isSmallHeader:small', 'isHidden:hide'],
  elementId: 'al_header',
  isSmallHeader: false,
  isHidden: false,

  actions: {
    largeHeader: function () {
      this.set('isSmallHeader', false)
    },
    smallHeader: function () {
      this.set('isSmallHeader', true)
    }
  }
})
