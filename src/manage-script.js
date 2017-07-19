(function() {
  var org_id = document.querySelector('script#hey-mayor-script').attributes['data-org-id'].value;
  var body = document.querySelector('body'), frameWrapper = document.createElement('div');
  frameWrapper.id = 'hey-mayor-widget'; frameWrapper.style.zIndex = 2147483647; frameWrapper.style.position = 'fixed'; frameWrapper.style.bottom = 0; frameWrapper.style.right = 0; frameWrapper.style.height = '100vh'; frameWrapper.style.maxHeight = '100vh'; frameWrapper.style.width = '480px'; frameWrapper.style.maxWidth = '100vw';
  var frame = document.createElement('iframe');
  frame.src = 'https://chat.kit.community?organization_id=' + org_id;
  frame.style.height = '100%'; frame.style.width = '100%'; frame.style.border = 'none';
  frameWrapper.appendChild(frame);
  body.appendChild(frameWrapper);
})();
