Encompass.UserInfoComponent = Ember.Component.extend(Encompass.CurrentUserMixin, {
  isEditing: false,

  lastSeenDate: function () {
      var last = this.get('lastSeen');
      if (last) {
        return moment(last).fromNow();
      }
      return 'never';
    }.property('lastSeen'),

    tourDate: function () {
      var date = this.get('seenTour');
      if (date) {
        return moment(date).fromNow();
      }
      return 'no';
    }.property('model.seenTour'),

    actions: {
      editUser: function () {
        this.set('isEditing', true);
      },

      saveUser: function () {
        this.set('isEditing', false);
        this.get('model').save();
      },

      clearTour: function () {
        this.set('model.seenTour', null);
      },

      doneTour: function () {
        this.set('model.seenTour', new Date());
      }
    }
});
