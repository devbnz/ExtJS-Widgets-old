Ext.define('Playground.view.winamp.WinampController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.winamp-main',

  audioContext: undefined,
  source: undefined,
  gainNode: undefined,

  control: {
    'bnz-winampslider': {
      change: 'onSliderMove'
    },
  //  'bnz-hslider': {
  //    change: 'setVolume'
  //  },
    '#volumeSilder':{
      change: 'setVolume'
    },grid: {
      itemdblclick: 'onItemClick'
    }
  },

  onItemClick: function(view, record, item, index, e, eOpts) {
    me = this;
    // Ext.log({dump: view});
    Ext.log({dump:record.data});
    //Ext.log({dump: item});
    //Ext.log({dump: index});
    // Ext.log({dump: e});
    // Ext.log({dump: eOpts});
    me.setActualTrack(record.data);
  },

  setActualTrack: function(TrackInfo){
    this.source.stop();
    me.getView().getViewModel().set("actualTrack", TrackInfo);
    me.getView().getViewModel().set("actualhms", Playground.view.winamp.Util.createhmsString(TrackInfo.duration));
    this.getData(TrackInfo.stream_url);
  },

  onSliderMove: function(cmp, x, y, eOpts) {
    Ext.log({dump: cmp});
    Ext.log({dump: x});
    Ext.log({dump: y});
    Ext.log({dump: eOpts});
  },

  setVolume: function(cmp, x, y, eOpts){
    this.gainNode.gain.value = x/100;
  },

  volumeReset: function(){
    this.gainNode.gain.value = 0.5;
  },

  init: function(view) {
    this.audioContext = new AudioContext(),
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.5;
    this.gainNode.connect(this.audioContext.destination);

    me = this;
    Ext.Loader.loadScript({
      url: 'https://connect.soundcloud.com/sdk/sdk-3.0.0.js',
      onLoad: function() {
        console.log('SoundCloud libary successfully loaded.');
        me.initSoundcloud();

      },
      onError: function() {
        console.log('Error while loading the SoundCloud libary');
      }
    });
  },

  initSoundcloud: function() {
    SC.initialize({
      client_id: '40493f5d7f709a9881675e26c824b136'
    })
  },

  stopPlay: function() {
    this.source.stop();
  },

  playSound: function() {
    this.soundcloud();
    //source.start(0);
  },

  soundcloud: function() {
    me = this;
    pl =  Playground.view.winamp.Util.initialPlaylist;
    SC.get(pl, {
      // q: 'buskers', license: 'cc-by-sa'
    }).then(function(tracks) {
      // console.log(tracks);
      var store = Ext.data.StoreManager.lookup('playList');
      store.add(tracks);
    });
    url = Playground.view.winamp.Util.welcomeTrack;
    SC.get('/resolve', {
      url: url
    }).then(function(sound) {
      me.getView().getViewModel().set("actualTrack", sound);
      me.getView().getViewModel().set("actualhms", Playground.view.winamp.Util.createhmsString(sound.duration));
      me.getData(sound.stream_url);
    });
  },

  getData: function(sample) {
    me = this.audioContext;

    source = me.createBufferSource(),
    this.source = source;
    source.connect(this.gainNode);

    var url = new URL(sample + '?client_id=17a992358db64d99e492326797fff3e8');

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      me.decodeAudioData(request.response,
        function(buffer) {
          console.log("sample loaded!");
          sample.loaded = true;
          source.buffer = buffer;
          source.start();
        },
        function() {
          console.log("Decoding error! ");
        });
    }
    sample.loaded = false;
    request.send();
  }
});
