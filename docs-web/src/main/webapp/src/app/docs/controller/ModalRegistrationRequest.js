'use strict';

/**
 * Modal registration request controller.
 */
angular.module('docs').controller('ModalRegistrationRequest', function ($scope, $uibModalInstance) {
  $scope.user = {
    username: '',
    email: ''
  };

  $scope.close = function(user) {
    $uibModalInstance.close(user);
  }
}); 