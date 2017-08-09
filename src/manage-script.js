(function() {
  var org_id = document.querySelector('script#hey-mayor-script').attributes['data-org-id'].value;
  var body = document.querySelector('body'), frameWrapper = document.createElement('div');
  frameWrapper.id = 'hey-mayor-widget'; frameWrapper.style.zIndex = 2147483647; frameWrapper.style.position = 'absolute';
  var frame = document.createElement('iframe');
  frame.src = 'http://localhost:3000?organization_id=' + org_id;
  frame.id = 'hey-mayor-widget';
  frame.style.position = 'fixed'; frame.style.zIndex = 2147483647; frame.style.height = '72px'; frame.style.width = '72px'; frame.style.bottom = '24px'; frame.style.right = '24px'; frame.style.border = 'none'; frame.style.maxWidth = '100vw'; frame.style.maxHeight = '100vh';
  frameWrapper.appendChild(frame);
  body.appendChild(frameWrapper);
  frame.onload = function() {
    frame.contentWindow.postMessage('init', '*');
    window.addEventListener('message', function(e) {
      if (e.data === 'show') {
        frame.style.height = '100vh'; frame.style.width = '480px'; frame.style.bottom = '0'; frame.style.right = '0';
      } else if (e.data === 'hide') {
        frame.style.height = '72px'; frame.style.width = '72px'; frame.style.bottom = '24px'; frame.style.right = '24px';
      }
    });
  }
})();
