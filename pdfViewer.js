(function () {
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) { }
        return i > -1;
      };
  }
})();
(function () {
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (css) {
      var node = this;

      while (node) {
        if (node.matches(css)) return node;
        else node = node.parentElement;
      }
      return null;
    };
  }
})();

(function (window) {

  'use strict';

  function extend(defaults, obj) {
    for (var key in obj) {
      if (defaults.hasOwnProperty(key)) {
        defaults[key] = obj[key];
      }
    }
    return defaults;
  }

  function ZPDFViewer(options) {
    this.currentFile = 0;

    this.initEvent = this.init.bind(this);
    this.closeWindow = this.close.bind(this);
    this.navigate = this.navigate.bind(this);
    this.create = this.create.bind(this);
    this.reload = this.reload.bind(this);

    this.option = extend(ZPDFViewer.settings, options);

    document.body.addEventListener('click', this.initEvent);
  }

  ZPDFViewer.settings = {
    arrows: true,
    keyboard: true,
    onChange: function () { }
  }

  ZPDFViewer.prototype.init = function(e) { 
    var target = e.target.closest('[data-pdf-viewer]');
    
    if (!target) return;
    
    e.preventDefault();

    var link = target.href;
    var group = target.dataset.viewerGroup;
    if(group === '' || group === 'single') {
      var allLinks = [target];
    }
    else {
      var allLinks = [].slice.call(document.querySelectorAll('[data-viewer-group="'+ group +'"]'));
    }

    this.album = allLinks.map(function(item) {
      return {
        'href': item.href
      }
    })

    for(var i = 0; i < allLinks.length; i++) {
      if(allLinks[i].href === link) {
        this.currentFile = i;
      }
    }

    this.render();
    this.show();
  }

  ZPDFViewer.prototype.render = function(e) {
    this.mainWindow = document.createElement('div');
    this.mainWindow.className = 'ZPDF-Viewer';

    var template =  '<div class="ZPDF-Viewer__body">' +
                      '<button class="ZPDF-Viewer__icon-close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><path d="M38.61 14.28c-12.25 5.51-24.5 21.74-27.25 36.13-4.59 25.11-8.57 20.51 212.5 242.2l206.99 207.3-207.3 207.6C109.65 821.42 15.03 917.87 13.19 921.55c-4.9 9.8-3.98 30.62 1.53 42.56 9.49 19.9 39.19 30.93 61.24 22.66 4.59-1.84 102.27-96.15 217.09-209.75l208.52-206.38L706.74 776.1c117.89 117.89 209.13 206.99 214.64 209.44 41.64 18.07 83.59-26.64 63.38-67.06C982 912.97 888 816.51 775.63 704.14L571.7 499.3l205.77-203.93C999.15 74.91 993.34 81.64 988.44 54.7c-5.51-29.7-42.56-47.46-70.12-33.68-5.51 2.75-101.05 96.15-212.5 207.3l-203.01 202.7-205.77-205.77C183.74 112.26 86.68 17.65 81.17 14.89c-11.94-5.82-29.7-6.12-42.56-.61z"/></svg></button>' +
                      '<div class="ZPDF-Viewer__preload"><hr/><hr/><hr/><hr/></div>' +
                      (this.option.arrows && this.album.length > 1 ? 
                        '<div class="ZPDF-Viewer__navigation">' +
                          '<button class="ZPDF-Viewer__arrow ZPDF-Viewer__arrow-prev"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><path d="M750.7 922.6c15.3 15.4 15.3 40.3 0 55.8a38.752 38.752 0 0 1-55.2 0L249.3 527.9c-15.3-15.4-15.3-40.4 0-55.8L695.5 21.6c15.3-15.4 39.9-15.4 55.2 0 15.3 15.4 15.3 40.3 0 55.8L343.9 500l406.8 422.6z"/></svg></button>' +
                          '<button class="ZPDF-Viewer__arrow ZPDF-Viewer__arrow-next"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><path d="M750.7 922.6c15.3 15.4 15.3 40.3 0 55.8a38.752 38.752 0 0 1-55.2 0L249.3 527.9c-15.3-15.4-15.3-40.4 0-55.8L695.5 21.6c15.3-15.4 39.9-15.4 55.2 0 15.3 15.4 15.3 40.3 0 55.8L343.9 500l406.8 422.6z"/></svg></button>' +
                        '</div>'
                      : ''
                      ) +
                      '<div class="ZPDF-Viewer__file-wrap"></div>' +
                    '</div>';

    this.mainWindow.innerHTML = template;

    this.fileBody = this.mainWindow.querySelector('.ZPDF-Viewer__body');
    this.close = this.mainWindow.querySelector('.ZPDF-Viewer__icon-close');
    this.preload = this.mainWindow.querySelector('.ZPDF-Viewer__preload');
    this.fileWrap = this.fileBody.querySelector('.ZPDF-Viewer__file-wrap');

    if (this.album.length > 1 && this.option.arrows) {
      this.control = this.mainWindow.querySelector('.ZPDF-Viewer__navigation');
      this.control.addEventListener('click', this.navigate);
    }
  }

  ZPDFViewer.prototype.show = function(index) {
    if(document.body.querySelector('.ZPDF-Viewer__body')) {
      this.reload();
    }
    else {
      this.create();
    }
  }

  ZPDFViewer.prototype.create = function(e) {
    var self = this;
    self.frame = document.createElement('iframe');

    self.frame.className = 'ZPDF-Viewer__frame';
    self.frame.src = self.album[self.currentFile]['href'];
    self.frame.allowfullscreen = true;
    self.frame.width = 400;
    self.frame.height = 100;
    
    self.fileWrap.style.opacity = 0;
    self.fileWrap.appendChild(self.frame);

    self.frame.addEventListener('load', function(e) {
      self.fileWrap.style.opacity = 1;
    })


    document.body.appendChild(this.mainWindow);

    this.close.addEventListener('click', this.closeWindow);
  }

  ZPDFViewer.prototype.reload = function(index) {
    var self = this;

    this.frame.src = this.album[this.currentFile]['href'];
    self.fileWrap.style.opacity = 0;

    this.frame.addEventListener('load', function(e) {
      self.fileWrap.style.opacity = 1;
    })
  }

  ZPDFViewer.prototype.close = function(e) {
    this.close.removeEventListener('click', this.closeWindow);
    if (this.album.length > 1 && this.option.arrows) {
      this.control.removeEventListener('click', this.move);
    }
    if (this.option.keyboard) {
      document.body.removeEventListener('keyup', this.keyEvents);
    }

    //remove vars
    this.mainWindow.parentNode.removeChild(this.mainWindow);
    this.mainWindow = null;
  }

  ZPDFViewer.prototype.navigate = function(e) {
    var target = e.target;
    var arrow = target.closest('.ZPDF-Viewer__arrow');

    if(!arrow) return;

    if(arrow.classList.contains('ZPDF-Viewer__arrow-prev')) {
      this.prev();
    }
    else {
      this.next();
    }
  }

  ZPDFViewer.prototype.prev = function(e) {
    if(this.currentFile <= 0) {
      this.currentFile = 0;
    }
    else {
      this.currentFile--;
    }

    this.show(this.currentFile);
  }

  ZPDFViewer.prototype.next = function(e) {
    this.currentFile = (this.currentFile + 1) % this.album.length

    this.show(this.currentFile);
  }

  window.ZPDFViewer = ZPDFViewer;
})(this);