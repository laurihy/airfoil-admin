$(function(){

  if(!App.preloaded.current_user || App.preloaded.current_user._groups.indexOf('administrators')<0){
    // not logged in
    window.location = '/admin/login.html?_next=/admin';
  } else {

    new App.router();

    Backbone.history.start({pushState: false, root: ''}); 

    $('body').removeClass('hidden');

  }
});