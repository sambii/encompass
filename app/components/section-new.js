Encompass.SectionNewComponent = Ember.Component.extend({
  tagName: 'sections',
  className: ['sections'],
  sectionId: '',
  createdSection: null,
  createSectionError: null,
  teacher: null,


  didInsertElement: function () {
    var user = this.get('user');
    console.log('user in didinsert', user);
    if(!user.get('isAdmin')) {
      console.log('in if');
      this.set('teacher', user);
      console.log(this.get('teacher'));
    }
    console.log('teacher', this.get('teacher'));
  },

actions: {
  createSection: function () {
    var newSectionName = this.get('newSectionName');
    var sectionId = this.get('sectionId');
    var schoolName = this.get('schoolName');
    var teacher = this.get('teacher');
    var user = this.get('user');
    console.log('teacher username', teacher);

    this.set('newSectionName', '');
    console.debug('creating new section ' + newSectionName);

    if (!newSectionName) {
      return;
    }

    var sectionData = this.store.createRecord('section', {
      name: newSectionName,
      sectionId: sectionId,
      schoolId: schoolName,
      teachers: [teacher]
    });


//save entry
    sectionData.save()
      .then((res) => {
        this.sendAction('toSectionList');
      });
    },
}
});