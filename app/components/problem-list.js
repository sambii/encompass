Encompass.ProblemListComponent = Ember.Component.extend(Encompass.CurrentUserMixin, {
  classNames: ['problem-list', 'left-list'],
  yourProblemList: null,

  // didUpdate: function () {
  //   this._super(...arguments);
  //   console.log('did update ran');
  // },

  didRender: function () {
    this._super(...arguments);
    let problems = this.get('store').findAll('problem');
    // console.log('did render ran');
    // console.log('problem list in did render is', problems);
  },

  // This displays only the problems beloging to the current user
  yourProblems: function () {
    var problems = this.problems.filterBy('isTrashed', false);
    var currentUser = this.get('currentUser');
    var yourProblems = problems.filterBy('createdBy.content', currentUser);
    this.set('yourProblemList', yourProblems);
    return yourProblems;
  }.property('problems.@each.isTrashed'),

  // This sorts all the problems in the database and returns only the ones that are public
  publicProblems: Ember.computed(function () {
    var problems = this.problems.filterBy('isTrashed', false);
    var currentUser = this.get('currentUser');
    console.log('currentUser is', currentUser);
    var publicProblems = problems.filterBy('privacySetting', 'E');
    // var yourPublic = publicProblems.filter((el) => {
    //   let content = el.get('createdBy.content');
    //   return content.id !== currentUser.id;
    // });
    return publicProblems;
  })

});

