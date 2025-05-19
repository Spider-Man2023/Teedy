'use strict';

/**
 * File modal edit image controller.
 */
angular.module('docs').controller('FileModalEditImage', function ($uibModalInstance, $scope, file, Restangular, $http, $timeout) {
  $scope.file = file;
  $scope.editedImage = null;
  $scope.rotation = 0;
  $scope.isCropping = false;
  $scope.cropData = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  $scope.dragState = {
    isDragging: false,
    handle: null,
    startX: 0,
    startY: 0,
    startCropData: null
  };

  // 加载原始图片
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    $scope.editedImage = img;
    // 计算图片在容器中的实际显示尺寸
    var container = document.querySelector('.image-preview-container');
    var containerWidth = container.clientWidth;
    var containerHeight = 500; // 最大高度限制
    
    var scale = Math.min(
      containerWidth / img.width,
      containerHeight / img.height
    );
    
    $scope.displaySize = {
      width: img.width * scale,
      height: img.height * scale
    };
    
    // 设置初始裁剪区域
    $scope.cropData = {
      x: 0,
      y: 0,
      width: $scope.displaySize.width,
      height: $scope.displaySize.height
    };
    
    $scope.$apply();
  };
  img.src = '../api/file/' + file.id + '/data';

  /**
   * 开始裁剪
   */
  $scope.startCrop = function() {
    $scope.isCropping = true;
    // 保证裁剪区域不会为0
    $scope.cropData = {
      x: 0,
      y: 0,
      width: Math.max(50, $scope.displaySize.width),
      height: Math.max(50, $scope.displaySize.height)
    };
  };

  /**
   * 取消裁剪
   */
  $scope.cancelCrop = function() {
    $scope.isCropping = false;
    $scope.cropData = {
      x: 0,
      y: 0,
      width: Math.max(50, $scope.displaySize.width),
      height: Math.max(50, $scope.displaySize.height)
    };
  };

  /**
   * 应用裁剪
   */
  $scope.applyCrop = function() {
    $scope.isCropping = false;
  };

  /**
   * 开始拖拽
   */
  $scope.startDrag = function(event, handle) {
    event.preventDefault();
    event.stopPropagation();
    
    $scope.dragState = {
      isDragging: true,
      handle: handle,
      startX: event.clientX,
      startY: event.clientY,
      startCropData: angular.copy($scope.cropData)
    };

    // 添加全局事件监听
    angular.element(document).on('mousemove', $scope.onDrag);
    angular.element(document).on('mouseup', $scope.stopDrag);
  };

  /**
   * 拖拽中
   */
  $scope.onDrag = function(event) {
    if (!$scope.dragState.isDragging) return;

    var deltaX = event.clientX - $scope.dragState.startX;
    var deltaY = event.clientY - $scope.dragState.startY;
    var startData = $scope.dragState.startCropData;
    var newData = angular.copy(startData);

    if ($scope.dragState.handle === 'move') {
      // 移动整个裁剪区域
      newData.x = Math.max(0, Math.min(startData.x + deltaX, $scope.displaySize.width - startData.width));
      newData.y = Math.max(0, Math.min(startData.y + deltaY, $scope.displaySize.height - startData.height));
    } else {
      // 调整裁剪区域大小
      if ($scope.dragState.handle.includes('w')) {
        var newX = Math.max(0, Math.min(startData.x + deltaX, startData.x + startData.width - 50));
        newData.width = startData.width - (newX - startData.x);
        newData.x = newX;
      }
      if ($scope.dragState.handle.includes('e')) {
        newData.width = Math.max(50, Math.min(startData.width + deltaX, $scope.displaySize.width - startData.x));
      }
      if ($scope.dragState.handle.includes('n')) {
        var newY = Math.max(0, Math.min(startData.y + deltaY, startData.y + startData.height - 50));
        newData.height = startData.height - (newY - startData.y);
        newData.y = newY;
      }
      if ($scope.dragState.handle.includes('s')) {
        newData.height = Math.max(50, Math.min(startData.height + deltaY, $scope.displaySize.height - startData.y));
      }
    }

    $scope.cropData = newData;
    $scope.$apply();
  };

  /**
   * 停止拖拽
   */
  $scope.stopDrag = function() {
    $scope.dragState.isDragging = false;
    angular.element(document).off('mousemove', $scope.onDrag);
    angular.element(document).off('mouseup', $scope.stopDrag);
  };

  /**
   * 旋转图片
   */
  $scope.rotate = function(degrees) {
    $scope.rotation = ($scope.rotation + degrees) % 360;
    // 如果正在裁剪，需要调整裁剪区域
    if ($scope.isCropping) {
      var oldWidth = $scope.cropData.width;
      var oldHeight = $scope.cropData.height;
      // 交换宽高，且保证不小于50
      $scope.cropData.width = Math.max(50, oldHeight);
      $scope.cropData.height = Math.max(50, oldWidth);
      // 保证裁剪框不超出图片区域
      $scope.cropData.x = Math.max(0, Math.min(($scope.displaySize.width - $scope.cropData.width) / 2, $scope.displaySize.width - $scope.cropData.width));
      $scope.cropData.y = Math.max(0, Math.min(($scope.displaySize.height - $scope.cropData.height) / 2, $scope.displaySize.height - $scope.cropData.height));
    }
  };

  /**
   * 应用图片编辑
   */
  $scope.applyEdit = function() {
    var scale = $scope.editedImage.width / $scope.displaySize.width;
    var cropX = Math.round($scope.cropData.x * scale);
    var cropY = Math.round($scope.cropData.y * scale);
    var cropWidth = Math.round($scope.cropData.width * scale);
    var cropHeight = Math.round($scope.cropData.height * scale);

    // 旋转角度（正数为顺时针）
    var angle = ($scope.rotation + 360) % 360;
    var radians = angle * Math.PI / 180;

    // 旋转90/270度时，画布宽高对调
    var outWidth = (angle === 90 || angle === 270) ? cropHeight : cropWidth;
    var outHeight = (angle === 90 || angle === 270) ? cropWidth : cropHeight;

    var canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    var ctx = canvas.getContext('2d');

    // 平移到画布中心
    ctx.translate(outWidth / 2, outHeight / 2);
    ctx.rotate(radians);

    // 旋转后绘制图片的偏移量
    var drawX = 0, drawY = 0;
    if (angle === 90) {
      drawX = -cropHeight / 2;
      drawY = -cropWidth / 2;
    } else if (angle === 180) {
      drawX = -cropWidth / 2;
      drawY = -cropHeight / 2;
    } else if (angle === 270) {
      drawX = -cropHeight / 2;
      drawY = -cropWidth / 2;
    } else {
      drawX = -cropWidth / 2;
      drawY = -cropHeight / 2;
    }

    // 绘制裁剪区域
    ctx.drawImage(
      $scope.editedImage,
      cropX, cropY, cropWidth, cropHeight,
      drawX, drawY, cropWidth, cropHeight
    );

    // 转换为blob并上传
    canvas.toBlob(function(blob) {
      var formData = new FormData();
      formData.append('file', blob, file.name);
      formData.append('previousFileId', file.id);  // 添加 previousFileId 参数
      
      // 使用 $http 直接发送请求
      $http({
        method: 'PUT',  // 使用 PUT 方法
        url: '../api/file',  // 使用正确的端点
        data: formData,
        headers: {
          'Content-Type': undefined
        },
        transformRequest: function(data) {
          return data; // 直接返回 FormData 对象
        }
      }).then(function(response) {
        console.log('图片更新成功', response);
        // 更新文件 ID
        if (response.data && response.data.id) {
          file.id = response.data.id;
        }
        $uibModalInstance.close(file);
      }).catch(function(error) {
        console.error('图片更新失败', error);
        $timeout(function() {
          $scope.error = '图片保存失败：' + (error.data?.message || '请重试');
        });
      });
    }, file.mimetype);
  };

  /**
   * 重置所有编辑
   */
  $scope.resetEdit = function() {
    $scope.rotation = 0;
    $scope.isCropping = false;
    $scope.cropData = {
      x: 0,
      y: 0,
      width: Math.max(50, $scope.displaySize ? $scope.displaySize.width : 0),
      height: Math.max(50, $scope.displaySize ? $scope.displaySize.height : 0)
    };
  };

  /**
   * 关闭编辑器
   */
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };
});