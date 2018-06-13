import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('response-reflection-component', 'Integration | Component | response reflection component', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{response-reflection-component}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#response-reflection-component}}
      template block text
    {{/response-reflection-component}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
