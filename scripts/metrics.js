window.App = window.App || {}
App.metrics = App.metrics || {}

// various helpers

App.metrics.data = App.preloaded.historydata.slice(0, App.preloaded.historydata.length)
App.metrics.data.push(App.preloaded.currentdata)

App.metrics.colors = ['#2980b9','#c0392b','#2ecc71','#d35400','#8e44ad','#2c3e50']

App.metrics.getVariants = function(data){
  var ret = []
  _.each(data, function(point){
    _.each(_.keys(point), function(key){
      if(key.charAt(0)!=='_' && ret.indexOf(key)<0){
        ret.push(key);
      }
    });
  });
  return ret;
}

App.metrics.getSummedData = function(data, variants){
  ret = {}
  _.each(variants, function(variant){
    _.each(data, function(point){
      _.each(_.keys(point[variant]), function(event){
        ret[variant] = ret[variant] || {}
        ret[variant][event] = ret[variant][event] || 0
        ret[variant][event] += point[variant][event] 
      })
    })
  });
  return ret;
}

App.metrics.toggleDatatypeButtons = function(type){
  if(type===undefined){
    type='percentage'
  }

  $('#datatype').find('.active').removeClass('active');
  $('#datatype').find('#'+type).addClass('active');
}

App.metrics.valueformats = {
  'percentage': function(d){
    if(d['visited']===0){
      return 'N/A'
    }
    return ((d['completed']/d['visited'])*100).toFixed(1)+'%'
  },
  'absolute': function(d){
    return d['completed']+'/'+d['visited']
  }
}

App.metrics.renderDonut = function(elem, name, data, color, type){

  var all = data['visited']-data['completed']
  if(data['visited']===0){
    all=1
  }

  return Morris.Donut({
    element: elem,
    colors: ['#f1f1f1', color],
    title: name,
    labelColor: '#555',
    value: App.metrics.valueformats[type](data),
    data: [
      {label: "", value: all},
      {label: "", value: data['completed']}
    ]
  });
}

App.metrics.renderChart = function(elem, datapoints, variants){
  $('#elem').html('')

  new Morris.Area({
    element: elem,
    behaveLikeLine: true,
    data: datapoints,
    xkey: 'created',
    ykeys: variants,
    labels: variants,
    grid: true,
    lineWidth: 5,
    pointSize: 5,
    lineColors: App.metrics.colors,
    pointFillColors: ['#ffffff'],
    pointStrokeColors: App.metrics.colors,
    hideHover: 'auto',
    xLabelFormat: function(d){ return moment(d).format('MMMM D')},
    dateFormat: function(d){ return moment(d).format('MMMM Do YYYY, h:mm:ss a')},
    fillOpacity: 0
  });

  $('circle').attr('stroke-width',4)

}

// views

App.metrics.view = Backbone.View.extend({
  el: $('#container'),
  template: Handlebars.templates.metrics,

  initialize: function(options){
    this.data = options.data;
    this.variants = App.metrics.getVariants(this.data);
    this.donutdata = App.metrics.getSummedData(this.data, this.variants)
  },

  render: function(type){
    this.$el.html(this.template());
    this.renderDonuts(type)
    this.renderChart()
  },

  renderDonuts: function(type){
    $('#donutholder').html('')
    var self = this;
    var i = 0;

    _.each(self.variants, function(variant){
      
        var id = variant+'dnt';
        var holder = $('<div>').addClass('number').attr('id',id)
        $('#donutholder').append(holder);
    })
    
    // For some reason, timeout is needed so that labels are rendered correctly
    setTimeout(function(){
      _.each(self.variants, function(variant){
        var id = variant+'dnt';
        App.metrics.renderDonut(id, variant, self.donutdata[variant], App.metrics.colors[i], type)
        i++;
      })
    },0)
  },

  renderChart: function(){
    var self = this;
    var datapoints = []

    datapoints = _.map(this.data, function(point){
      var ret = {}
      ret['created'] = point['_created']
      _.each(self.variants, function(variant){
        if(point[variant]['visited']===0){
          ret[variant] = 0
        } else {
          ret[variant] = point[variant]['completed']/point[variant]['visited']*100
        }
      });
      return ret
    })

    setTimeout(function(){
      App.metrics.renderChart('chart', datapoints, self.variants);
    },0)

  }

});


// init things

App.metricsView = new App.metrics.view({
  data: App.metrics.data
})

App.metrics.renderView = function(mode){

  if(mode===undefined){
    mode='percentage'
  }

  App.metricsView.render(mode)

  App.metrics.toggleDatatypeButtons(mode)

}