(function() {
  var org_id = document.querySelector('script#hey-mayor-script').attributes['data-org-id'].value;
  var body = document.querySelector('body'), frameWrapper = document.createElement('div');
  frameWrapper.id = 'hey-mayor-widget'; frameWrapper.style.zIndex = 2147483647; frameWrapper.style.position = 'absolute';
  var frame = document.createElement('iframe');
  frame.src = 'https://chat.kit.community?organization_id=' + org_id;
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
  frameWrapper.appendChild(frame);
  body.appendChild(frameWrapper);
  frame.onload = function() {
    frame.contentWindow.postMessage('init', '*');
    window.addEventListener('message', function(e) {
      if (e.data === 'show') {
        frame.style.height = '100%';
        frame.style.width = '540px';
        frame.style.top = '0';
        frame.style.bottom = '0';
        frame.style.right = '0';
        frame.style.left = 'auto';
      } else if (e.data === 'hide') {
        frame.style.height = '72px';
        frame.style.width = '72px';
        frame.style.top = 'initial';
        frame.style.bottom = '24px';
        frame.style.right = '24px';
        frame.style.left = 'initial';
      }
    });
  }
})();
