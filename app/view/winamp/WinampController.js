Ext.define('Playground.view.winamp.WinampController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.winamp-main',

  audioContext: undefined,
  source: undefined,
  gainNode: undefined,

  control: {
    slider: {
      change: 'onSliderMove'
    }
  },

  onSliderMove: function(cmp, x, y, eOpts) {
    Ext.log({
      dump: cmp
    });
    Ext.log({
      dump: x
    });
    Ext.log({
      dump: y
    });
    Ext.log({
      dump: eOpts
    });
  },


  init: function(view) {
    this.audioContext = new AudioContext(),
      this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.5;

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
      client_id: '40493f5d7f709a9881675e26c824b136',
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
    var scurl = 'https://soundcloud.com/bnzlovesyou/daktari-preview';

    SC.get('/resolve', {
      url: scurl
    }).then(function(sound) {
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
