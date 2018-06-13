// import Ember from 'ember';

// export default Ember.Component.extend({

    Encompass.ResponsesReflectionsComponent = Ember.Component.extend({
      tagName: 'problems',
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
