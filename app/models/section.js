Encompass.Section = DS.Model.extend(Encompass.Auditable, {
  sectionId: DS.attr('number'),
  name: DS.attr('string'),
  schoolId: DS.attr('string'),
  teachers: DS.hasMany('users'),
  students: DS.hasMany('users'),
  problems: DS.hasMany('problem'),
});