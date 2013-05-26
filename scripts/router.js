window.App = window.App || {}

App.toggleNav = function(id){
    $('#nav').find('.active').removeClass('active');
    $('#nav').find(id).addClass('active');
}

App.router = Backbone.Router.extend({
    routes: {
        '': 'metrics',
        'metrics': 'metrics',
        'metrics/:mode': 'metrics',
        'signups': 'signups'
    },

    metrics: function(mode){
        App.toggleNav('#metrics');
        App.metrics.renderView(mode);
    },

    signups: function(){
        App.toggleNav('#signups');
        App.signups.renderView();
    }
})