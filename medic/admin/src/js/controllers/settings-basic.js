var phoneNumber = require('@medic/phone-number'),
    countries = require('../modules/countries');

angular.module('controllers').controller('SettingsBasicCtrl',
  function (
    $log,
    $scope,
    $timeout,
    $translate,
    Languages,
    Settings,
    UpdateSettings
  ) {

    'use strict';
    'ngInject';

    var validateGatewayNumber = function() {
      var gatewayNumber = $scope.basicSettingsModel.gateway_number;

      if (gatewayNumber) {
        // must be a valid phone number
        var info = { default_country_code: $('#default-country-code').val() };
        if (!phoneNumber.validate(info, gatewayNumber)) {
          $scope.basicSettingsModel.error.gateway_number = $translate.instant('Phone number not valid');
          return false;
        }

        // normalise value
        $scope.basicSettingsModel.gateway_number = phoneNumber.normalize(info, gatewayNumber);
      }

      return true;
    };

    $scope.submitBasicSettings = function() {
      $scope.basicSettingsModel.error = {};
      if (validateGatewayNumber()) {
        $scope.status = { loading: true };
        var settings = {
          locale: $scope.basicSettingsModel.locale,
          locale_outgoing: $scope.basicSettingsModel.locale_outgoing,
          gateway_number: $scope.basicSettingsModel.gateway_number,
          default_country_code: $('#default-country-code').val()
        };
        UpdateSettings(settings)
          .then(function() {
            $scope.status = { success: true, msg: $translate.instant('Saved') };
            $timeout(function() {
              if ($scope.status) {
                $scope.status.success = false;
              }
            }, 3000);
          })
          .catch(function(err) {
            $log.error('Error updating settings', err);
            $scope.status = { error: true, msg: $translate.instant('Error saving settings') };
          });
      }
    };

    Languages().then(function(languages) {
      $scope.enabledLocales = languages;
    });

    Settings()
      .then(function(res) {
        $scope.basicSettingsModel = {
          locale: res.locale,
          locale_outgoing: res.locale_outgoing,
          gateway_number: res.gateway_number
        };
        $('#default-country-code').select2({ width: '20em', data: countries.list });
        $('#default-country-code').val(res.default_country_code).trigger('change');
      })
      .catch(function(err) {
        $log.error('Error loading settings', err);
      });

  }
);
