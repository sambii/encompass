/**
  * # Sections Route
  * @description Route for dealing with all section objects
  * @todo This is really the sections_index route and should be named as such by convention
  */
Encompass.SectionsRoute = Encompass.AuthenticatedRoute.extend({
  model: function () {
    var store = this.get('store');
    var sections = store.findAll('section');
    // Filter only problems by current logged in user
    return sections;
  },

  renderTemplate: function(){
    this.render('sections/sections');
  }
});
