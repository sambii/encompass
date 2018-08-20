Encompass.ProblemsHomeRoute = Encompass.AuthenticatedRoute.extend({
  model: function (params) {
    return Ember.RSVP.hash({
      problems: this.get('store').findAll('problem'),
      organizations: this.get('store').findAll('organization'),
    });
  },
  renderTemplate: function () {
    this.render('problems/home');
  },
  actions: {
  }
});