Encompass.NewProblemForm = Ember.Component.extend({
  tagName: 'NewProblemForm',
  classNameBindings: ['Form', 'NewProblem'],

  init () {
    this._super(...arguments)
    this.errors = []
  },

  didUpdateAttrs () {
    this._super(...arguments)
    this.set('errors', [])
  },

  actions: {
    required (event) {
      if (!event.target.value) {
        this.get('errors').pushObject({ message: `${event.target.name} is required`})
      }
    }
  }
})
