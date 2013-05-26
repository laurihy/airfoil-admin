window.App = window.App || {}
App.signups = App.signups || {}

// helpers


App.parseSignups = function(signups){
  return _.map(signups, function(signup){

  })
}

App.signups.model = Backbone.Model.extend({
  idAttribute:'_id',
  defaults: {
    created: moment(this._created).format('MMMM D YYYY')
  }

})

App.signups.collection = Backbone.Collection.extend({
  model: App.signups.model,
  url: '/backlift/data/signups',

  getModelKeys: function(){
    if(this.modelKeys==undefined){
      ret = []
      skip = ['id']
      _.each(this.models,function(model){
        keys = Object.keys(model.attributes);
          _.each(keys, function(key){
            if(ret.indexOf(key)<0 && key.charAt(0)!=='_' && skip.indexOf(key)<0){
              ret.push(key);
            }
          });
      });
      this.modelKeys = ret;
    }
    return this.modelKeys;
  },
})

App.signupCollection = new App.signups.collection(App.preloaded.signups)

App.signups.view = Backbone.View.extend({
  template: Handlebars.templates.signups,
  collection: App.signupCollection,
  el: $('#container'),

  initialize: function(){
    this.listenTo(this.collection, 'change', this.render)
  },

  render: function(){
    this.$el.html(this.template({ 
      signups: _.map(this.collection.models, function(model){ return model.toJSON() }), 
    }));
    
    return this;
  },

  events: {
    'click .del': function(e){
      id = $(e.target).attr('data-id');
      this.collection.get(id).destroy();
      this.collection.trigger('change')
    }
  }

})

App.signupsView = new App.signups.view({})

App.signups.renderView = function(){

  App.signupsView.render()

}