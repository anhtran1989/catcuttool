/**
 * Material Animation Demo - Hiển thị cách sử dụng MaterialManager trong ứng dụng
 */
document.addEventListener('DOMContentLoaded', function() {
  // Khởi tạo MaterialManager
  if (typeof MaterialManager !== 'undefined') {
    MaterialManager.init();
    
    // Tạo một container để hiển thị demo
    const demoContainer = document.createElement('div');
    demoContainer.id = 'material-animation-demo';
    demoContainer.className = 'container mt-4';
    
    // Tạo tiêu đề
    const heading = document.createElement('h3');
    heading.textContent = 'Material Animation Demo';
    demoContainer.appendChild(heading);
    
    // Tạo mô tả
    const description = document.createElement('p');
    description.textContent = 'Chọn hiệu ứng animation cho mỗi ảnh/video bằng cách click vào các nút Vào, Kết hợp, Ra';
    demoContainer.appendChild(description);
    
    // Tạo container chứa các ảnh/video
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'row';
    demoContainer.appendChild(mediaContainer);
    
    // Giả lập danh sách ảnh/video
    const mediaItems = [
      { id: 'img1', type: 'image', name: 'Image 1', url: 'path/to/image1.jpg' },
      { id: 'img2', type: 'image', name: 'Image 2', url: 'path/to/image2.jpg' },
      { id: 'vid1', type: 'video', name: 'Video 1', url: 'path/to/video1.mp4' }
    ];
    
    // Xử lý khi áp dụng animation
    function handleApplyAnimation(mediaItem, animation, animationType) {
      console.log(`Applied ${animationType} animation: ${animation.name} to ${mediaItem.name}`);
      
      // Hiển thị thông báo
      const itemElement = document.getElementById(`media-item-${mediaItem.id}`);
      if (itemElement) {
        const animationInfo = itemElement.querySelector('.animation-info') || document.createElement('div');
        animationInfo.className = 'animation-info mt-2 p-2 bg-light';
        
        let infoText = '';
        switch (animationType) {
          case 'in':
            infoText = `Hiệu ứng vào: ${animation.name}`;
            break;
          case 'out':
            infoText = `Hiệu ứng ra: ${animation.name}`;
            break;
          case 'group':
            infoText = `Hiệu ứng kết hợp: ${animation.name}`;
            break;
        }
        
        animationInfo.textContent = infoText;
        
        if (!itemElement.querySelector('.animation-info')) {
          itemElement.appendChild(animationInfo);
        }
      }
      
      // Trong thực tế, bạn sẽ lưu animation này vào cấu trúc dữ liệu của mình
      // và cập nhật giao diện người dùng
    }
    
    // Tạo các item ảnh/video
    mediaItems.forEach(item => {
      // Tạo card để hiển thị item
      const cardCol = document.createElement('div');
      cardCol.className = 'col-md-4 mb-3';
      
      const card = document.createElement('div');
      card.id = `media-item-${item.id}`;
      card.className = 'card';
      
      // Tạo phần body của card
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
      
      // Tạo tiêu đề
      const cardTitle = document.createElement('h5');
      cardTitle.className = 'card-title';
      cardTitle.textContent = item.name;
      cardBody.appendChild(cardTitle);
      
      // Tạo fake image/video preview
      const preview = document.createElement('div');
      preview.className = 'media-preview mb-3';
      preview.style.height = '150px';
      preview.style.backgroundColor = item.type === 'video' ? '#8a2be2' : '#4169e1';
      preview.style.display = 'flex';
      preview.style.alignItems = 'center';
      preview.style.justifyContent = 'center';
      preview.style.color = 'white';
      preview.style.fontWeight = 'bold';
      preview.textContent = item.type === 'video' ? 'VIDEO' : 'IMAGE';
      cardBody.appendChild(preview);
      
      // Thêm card vào container
      card.appendChild(cardBody);
      cardCol.appendChild(card);
      mediaContainer.appendChild(cardCol);
      
      // Thêm các nút hiệu ứng
      MaterialManager.addAnimationButtons(cardBody, item, handleApplyAnimation);
    });
    
    // Thêm container vào trang
    document.body.appendChild(demoContainer);
    
    console.log('Material Animation Demo initialized');
  } else {
    console.error('MaterialManager is not defined. Make sure material-manager.js is loaded before this script.');
  }
}); 