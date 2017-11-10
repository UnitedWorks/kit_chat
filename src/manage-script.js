(function() {
  var org_id = document.querySelector('script#hey-mayor-script').attributes['data-org-id'].value;
  var body = document.querySelector('body'), frameWrapper = document.createElement('div');
  frameWrapper.id = 'hey-mayor-widget'; frameWrapper.style.zIndex = 2147483647; frameWrapper.style.position = 'absolute';
  var frame = document.createElement('iframe');
  frame.src = 'https://chat.kit.community?organization_id=' + org_id + '&dt=' + Date.now();
  frame.id = 'hey-mayor-widget';
  frame.style.display = 'block';
  frame.style.position = 'fixed';
  frame.style.zIndex = 2147483647;
  frame.style.height = '72px';
  frame.style.width = '72px';
  frame.style.bottom = '24px';
  frame.style.right = '24px';
  frame.style.border = 'none';
  frame.style.maxWidth = '100vw';
  frame.style.background = 'none transparent';
  frameWrapper.appendChild(frame);
  body.appendChild(frameWrapper);
  frame.onload = function() {
    frame.contentWindow.postMessage('init', '*');
    window.addEventListener('message', function(e) {
      if (e.data === 'show') {
        frame.style.height = '100%';
        frame.style.maxHeight = '100vh';
        frame.style.width = '540px';
        frame.style.top = '0';
        frame.style.bottom = '0';
        frame.style.right = '0';
        frame.style.left = 'auto';
        frame.style.overflow = 'visible';
        frame.style.boxShadow = 'rgba(0, 0, 0, 0.3) 0px 0px 4px 1px';
      } else if (e.data === 'hide') {
        frame.style.height = '68px';
        frame.style.maxHeight = 'initial';
        frame.style.width = '68px';
        frame.style.top = 'initial';
        frame.style.bottom = '24px';
        frame.style.right = '24px';
        frame.style.left = 'initial';
        frame.style.overflow = 'hidden';
        frame.style.boxShadow = 'none';
      } else if (e.data === 'hint') {
        frame.style.height = '210px';
        frame.style.width = '280px';
      }
    });
  }
})();
