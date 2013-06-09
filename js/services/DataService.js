App.service('DataService', ['$http', '$rootScope', function($http, $rootScope){

    /* Constants */

/*
    var ManageViewSideNavLinks = [
        [{
            "name": I8n.general,
            "parent": "Settings",
            "id": "general",
            "href": "#/manage/settings/general"
        }, {
            "name": I8n.network,
            "parent": "Settings",
            "id": "network",
            "href": "#/manage"
        }, {
            "name": I8n.sslCertificates,
            "parent": "Settings",
            "id": "sslCertificates",
            "href": "#/manage/settings/sslcertificates"
        }, {
            "name": I8n.backupRestore,
            "parent": "Settings",
            "id": "backups",
            "href": "#/manage/settings/backups"
        }, {
            "name": I8n.upgrade,
            "parent": "Settings",
            "id": "upgrade",
            "href": "#/manage/settings/upgrade"
        }],
        [{
        "name": I8n.vcnsServer,
        "parent": "Components",
        "id": "vshield",
        "href": "#/manage/components/vshield"
    }]
    ];
*/
    /* Private properties */
    var globalInfo = {};
    var componentsInfo = {};
    var systemSummary = {};
    var networkDetails = {};
    var timeSettings = {};
    var timezones = [];
    var sysLogSettings = {};
    var protocols = [];
    var vcenterConfigInfo = {};
    var DataService = {};
    var vcDetails = {};
    var lookupServiceDetails = {};
    var sslCertificates = {
        "VAM": [],
        "VCNS": []
    };
    var csrDownloadLinks = {
        "VAM": "",
        "VCNS": ""
    };
    var supportedAlgorithmsAndKeySizes = {};

    /* Public properties */
    DataService.globalInfo = function(){
        return globalInfo;
    };
    DataService.systemSummary = function(){
        return systemSummary;
    };
    DataService.componentsInfo = function(){
        return componentsInfo;
    };
    DataService.networkDetails = function(){
        return networkDetails;
    };
    // DataService.alerts = function(){
        // return alerts;
    // };
    DataService.ManageViewSideNavLinks = function(){
        return ManageViewSideNavLinks;
    };
    DataService.timeSettings = function(){
        return timeSettings;
    };
    DataService.timezones = function(){
        return timezones;
    }
    DataService.sysLogSettings = function(){
        return sysLogSettings;
    };
    DataService.protocols = function(){
        return protocols;
    };
    DataService.vcenterConfigInfo = function(){
        return vcenterConfigInfo;
    };
    DataService.vcDetails = function(){
        return vcDetails;
    };
    DataService.lookupServiceDetails = function(){
        return lookupServiceDetails;
    }
    DataService.sslCertificates = function(){
        return sslCertificates;
    }
    DataService.supportedAlgorithmsAndKeySizes = function(){
        return supportedAlgorithmsAndKeySizes;
    }
    DataService.csrDownloadLinks = function(){
        return csrDownloadLinks;
    }
    /* Public methods */

    DataService.getErrorsArray = function(errorObj){
        var alerts = []; //[{alerttype: "info", title: "Restart required" message: "Server error"}] (alert-types are ex. info (blue), success (green), error(red))
        if(errorObj.data.errors != null && errorObj.data.errors.length > 0){
            var alert = {alerttype: "error", alertArray: errorObj.data.errors};
            alerts.push(alert);
        } else {
            var customAlertArray = [{details: errorObj.data.details, alerttype: "error"}];
            var alert = {alerttype: "error", alertArray: customAlertArray};
            alerts.push(alert);
        }
        return alerts;
    }

    DataService.getInfosArray = function(infoMessage){
        var alerts = [];
        var alert = {alerttype: "info", alertArray: [{details: infoMessage}]};
        alerts.push(alert);
        return alerts;
    }

    DataService.isEmptryArray = function(a) {
        var emptyArr = true;
        if(a !== null) {
           for (var i = 0; i < a.length; ++i) {
             if (a[i] !== ""){
               emptyArr = false;
               break;
             }
           }
        }
        return emptyArr;
    }
/*
 * broastcast naming convention:
 * {methodName}-onresult
 * {methodName}-onsuccess
 * {methodName}-onerror
 * {methodName}-ontrigger
 */

    DataService.getGlobalInfo = function(){
        $http({
            method: 'GET',
            url: 'http://osisoftvcampus.cloudapp.net/vehicledata/cardata.svc/json/CWC/LiveCar',
            data: {
                "method": "getGlobalInfo",
                "id": "getGlobalInfo"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                DataService.addError(error);
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                angular.copy(result, globalInfo);
            }
        });
    };

    DataService.getSystemSummary = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/summary',
            data: {
                "method": "getSystemSummary",
                "id": "getSystemSummary"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getSystemSummary-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                angular.copy(result, systemSummary);
            }
        });
    };

    DataService.getComponentsInfo = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/summary',
            data: {
                "method": "getComponentsSummary",
                "id": "getComponentsSummary"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getComponentsSummary-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                angular.copy(result, componentsInfo);
            }
        });
    };

    DataService.toggleComponentStatus = function(action, componentId){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/components',
            data: {
                "method": "toggleComponentStatus",
                "id": "toggleComponentStatus",
                "params": [componentId, action]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('toggleComponentStatus-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                //Success
            }
            DataService.getComponentsInfo();
        });
    }

    DataService.generateTechSupportLog = function(componentId){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/techSupport',
            data: {
                "method": "generateTechSupportBundle",
                "id": "generateTechSupportBundle",
                "params": [componentId]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('generateTechSupportBundle-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('generateTechSupportBundle-onsuccess', result);
            }
        });
    }

    DataService.getNetworkDetails = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "getNetworkDetails",
                "id": "getNetworkDetails"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getNetworkDetails-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                if(result.dns == null) {
                    result.dns = ({});
                }
                if(result.dns.ipv4Dns == null){
                    result.dns.ipv4Dns = ["", ""];
                }
                if(result.dns.ipv6Dns == null){
                    result.dns.ipv6Dns = ["", ""];
                }
                angular.copy(result, networkDetails);
                $rootScope.$broadcast('getNetworkDetails-onsuccess', result);
            }
        });
    };
    DataService.getTimeSettings = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "getTimeSettings",
                "id": "getTimeSettings"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getTimeSettings-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('getTimeSettings-onsuccess', result);
                angular.copy(result, timeSettings);
            }
        });
    };
    DataService.getTimeZones = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "getTimeZones",
                "id": "getTimeZones"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getTimeZones-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                angular.copy(result, timezones);
            }
        });
    };
    DataService.getSyslogServerSettings = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "getSyslogServerSettings",
                "id": "getSyslogServerSettings"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getSyslogServerSettings-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                angular.copy(result, sysLogSettings);
                $rootScope.$broadcast('getSyslogServerSettings-onsuccess');
            }
        });
    };
    DataService.getProtocols = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "getProtocols",
                "id": "getProtocols"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getProtocols-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                angular.copy(result, protocols);
                $rootScope.$broadcast('getProtocols-onsuccess');
            }
        });
    };
    DataService.configureDnsSettings = function(dns){
        if(DataService.isEmptryArray(dns.ipv4Dns) == true){
            dns.ipv4Dns = null;
        }
        if(DataService.isEmptryArray(dns.ipv6Dns) == true){
            dns.ipv6Dns = null;
        }
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "configureDNS",
                "id": "configureDNS",
                "params": [dns]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('configureDNS-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                //Success
                $rootScope.$broadcast('configureDNS-onsuccess');
            }
            $rootScope.$broadcast('configureDNS-onresult');
        });
    };
    DataService.configureTimeSettings = function(timeSettings){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "configureTimeSettings",
                "id": "configureTimeSettings",
                "params": [timeSettings]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('configureTimeSettings-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                //Success
                $rootScope.$broadcast('configureTimeSettings-onsuccess', DataService.getInfosArray(I8n.ntpSettingsChangedAlert));
            }
            $rootScope.$broadcast('configureTimeSettings-onresult');
        });
    };
    DataService.configureSyslogServer = function(syslogSettings){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "configureSyslogServer",
                "id": "configureSyslogServer",
                "params": [syslogSettings]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('configureSyslogServer-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                //Success
                $rootScope.$broadcast('configureSyslogServer-onsuccess');
            }
            $rootScope.$broadcast('configureSyslogServer-onresult');
        });
    };
    DataService.configureNetwork = function(networkDetails){
        if(DataService.isEmptryArray(networkDetails.dns.ipv4Dns) == true){
            networkDetails.dns.ipv4Dns = null;
        }
        if(DataService.isEmptryArray(networkDetails.dns.ipv6Dns) == true){
            networkDetails.dns.ipv6Dns = null;
        }
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "configureNetwork",
                "id": "configureNetwork",
                "params": [networkDetails]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('configureNetwork-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                $rootScope.$broadcast('configureNetwork-onsuccess', DataService.getInfosArray(I8n.networkSettingsChangedAlert));
            }
            $rootScope.$broadcast('configureNetwork-onresult');
        });
    };

    DataService.rebootAppliance = function(){
        $rootScope.$broadcast('reboot-ontrigger');
        $http({
            method: 'POST',
            url: 'api/jsonrpc/systemConfiguration',
            data: {
                "method": "reboot",
                "id": "reboot"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('reboot-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                //Success will not happen
            }
            $rootScope.$broadcast('getVCDetails-onresult');
        });
    };

    DataService.getVCDetails = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/vsmConfig',
            data: {
                "method": "getVCDetails",
                "id": "getVCDetails"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getVCDetails-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                angular.copy(result, vcDetails);
                $rootScope.$broadcast('getVCDetails-onsuccess', result);
            }
            $rootScope.$broadcast('getVCDetails-onresult');
        });
    };

    DataService.getLookupServiceDetails = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/vsmConfig',
            data: {
                "method": "getLookupServiceDetails",
                "id": "getLookupServiceDetails"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getLookupServiceDetails-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                angular.copy(result, lookupServiceDetails);
                $rootScope.$broadcast('getLookupServiceDetails-onsuccess', result);
            }
            $rootScope.$broadcast('getLookupServiceDetails-onresult');
        });
    };

    DataService.unconfigureLookupService = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/vsmConfig',
            data: {
                "method": "unconfigureLookupService",
                "id": "unconfigureLookupService"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('unconfigureLookupService-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                $rootScope.$broadcast('unconfigureLookupService-onsuccess', DataService.getInfosArray("Lookup service has been unconfigured successfully."));
            }
            $rootScope.$broadcast('unconfigureLookupService-onresult');
            DataService.getLookupServiceDetails();
        });
    };

    DataService.configureLookupService = function(lookupServiceDetails){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/vsmConfig',
            data: {
                "method": "configureLookupService",
                "id": "configureLookupService",
                "params": [lookupServiceDetails]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('configureLookupService-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                $rootScope.$broadcast('configureLookupService-onsuccess', DataService.getInfosArray('Lookup service configured successfully. Please restart for the change to take effect.'));
            }
            $rootScope.$broadcast('configureLookupService-onresult');
        });
    };

    DataService.configureVC = function(vcDetails){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/vsmConfig',
            data: {
                "method": "configureVC",
                "id": "configureVC",
                "params": [vcDetails]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('configureVC-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                $rootScope.$broadcast('configureVC-onsuccess', resp.result);
            }
            $rootScope.$broadcast('configureVC-onresult');
        });
    };

    DataService.getAllCertificates = function(keyStoreName){
        var keyStoreName = keyStoreName;
        $http({
            method: 'POST',
            url: 'api/jsonrpc/certificateManager',
            data: {
                "method": "getAllCertificates",
                "id": "getAllCertificates",
                "params": [keyStoreName]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getAllCertificates-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result.certificates;
                angular.copy(result, sslCertificates[keyStoreName]);
                $rootScope.$broadcast('getAllCertificates-onsuccess', result);
            }
            $rootScope.$broadcast('getAllCertificates-onresult');
        });
    };

    DataService.generateCsr = function(csrDto, keyStoreName){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/certificateManager',
            data: {
                "method": "generateCsr",
                "id": "generateCsr",
                "params": [csrDto, keyStoreName]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('generateCsr-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                csrDownloadLinks[keyStoreName] = result;
                $rootScope.$broadcast('generateCsr-onsuccess', result);
            }
            $rootScope.$broadcast('generateCsr-onresult');
        });
    }

    DataService.getCsrFileName = function(keyStoreName){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/certificateManager',
            data: {
                "method": "getCsrFileName",
                "id": "getCsrFileName",
                "params": [keyStoreName]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getCsrFileName-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                //angular.copy(result, csrDownloadLinks[keyStoreName]);
                csrDownloadLinks[keyStoreName] = result;
                $rootScope.$broadcast('getCsrFileName-onsuccess', result);
            }
            $rootScope.$broadcast('getCsrFileName-onresult');
        });
    }
/*
    //Using getCsrFileName to check if the csr file exists. Commenting this for now.
    DataService.doesCSRFileExists = function(keyStoreName){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/certificateManager',
            data: {
                "method": "doesCSRFileExists",
                "id": "doesCSRFileExists",
                "params": [keyStoreName]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                DataService.addError(error);
                $rootScope.$broadcast('doesCSRFileExists-onerror');
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('doesCSRFileExists-onsuccess', result);
                return result;
            }
            $rootScope.$broadcast('doesCSRFileExists-onresult');
        });
    }
*/
    DataService.importSignedCertificates = function(certificateChainDto, keyStoreName){
        var keyStoreName = keyStoreName;
        $http({
            method: 'POST',
            url: 'api/jsonrpc/certificateManager',
            data: {
                "method": "importSignedCertificates",
                "id": "importSignedCertificates",
                "params": [certificateChainDto, keyStoreName]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('importSignedCertificates-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('importSignedCertificates-onsuccess', result);
                DataService.getAllCertificates(keyStoreName);
            }
            $rootScope.$broadcast('importSignedCertificates-onresult');
        });
    }

    DataService.getSupportedAlgorithmsAndKeySizes = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/certificateManager',
            data: {
                "method": "getSupportedAlgorithmsAndKeySizes",
                "id": "getSupportedAlgorithmsAndKeySizes"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getSupportedAlgorithmsAndKeySizes-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result.mapAlgorithmsToKeySize;
                angular.copy(result, supportedAlgorithmsAndKeySizes);
                $rootScope.$broadcast('getSupportedAlgorithmsAndKeySizes-onsuccess', result);
            }
            $rootScope.$broadcast('getSupportedAlgorithmsAndKeySizes-onresult');
        });
    }

    DataService.listBackupFiles = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/backupRestore',
            data: {
                "method": "listBackupFiles",
                "id": "listBackupFiles"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('listBackupFiles-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('listBackupFiles-onsuccess', result);
            }
            $rootScope.$broadcast('listBackupFiles-onresult');
        });
    }

    DataService.getBackupSettings = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/backupRestore',
            data: {
                "method": "getBackupSettings",
                "id": "getBackupSettings"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getBackupSettings-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('getBackupSettings-onsuccess', result);
            }
            $rootScope.$broadcast('getBackupSettings-onresult');
        });
    }

    DataService.performBackup = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/backupRestore',
            data: {
                "method": "performBackup",
                "id": "performBackup"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('performBackup-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('performBackup-onsuccess', result);
            }
            $rootScope.$broadcast('performBackup-onresult');
        });
    }

    DataService.getScheduledBackupTaskDetails = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/backupRestore',
            data: {
                "method": "getScheduledBackupTaskDetails",
                "id": "getScheduledBackupTaskDetails"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('getScheduledBackupTaskDetails-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('getScheduledBackupTaskDetails-onsuccess', result);
            }
            $rootScope.$broadcast('getScheduledBackupTaskDetails-onresult');
        });
    }

    DataService.updateBackupFrequency = function(backupFrequency){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/backupRestore',
            data: {
                "method": "updateBackupFrequency",
                "id": "updateBackupFrequency",
                "params": [backupFrequency]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('updateBackupFrequency-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('updateBackupFrequency-onsuccess', result);
            }
            $rootScope.$broadcast('updateBackupFrequency-onresult');
        });
    }

    DataService.deleteBackupFrequency = function(){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/backupRestore',
            data: {
                "method": "deleteBackupFrequency",
                "id": "deleteBackupFrequency"
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('deleteBackupFrequency-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('deleteBackupFrequency-onsuccess', result);
            }
            $rootScope.$broadcast('deleteBackupFrequency-onresult');
        });
    }

    DataService.performRestore = function(selectedbackupFileName){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/backupRestore',
            data: {
                "method": "performRestore",
                "id": "performRestore",
                "params": [selectedbackupFileName]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('performRestore-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('performRestore-onsuccess', result);
            }
            $rootScope.$broadcast('performRestore-onresult');
        });
    }

    DataService.updateFtpSettings = function(ftpSettings){
        $http({
            method: 'POST',
            url: 'api/jsonrpc/backupRestore',
            data: {
                "method": "updateFtpSettings",
                "id": "updateFtpSettings",
                "params": [ftpSettings]
            }
        }).success(function(resp){
            if(_.isUndefined(resp.error) == false) {
                error = resp.error;
                $rootScope.$broadcast('updateFtpSettings-onerror', DataService.getErrorsArray(error));
            } else if(_.isUndefined(resp.result) == false) {
                var result = resp.result;
                $rootScope.$broadcast('updateFtpSettings-onsuccess', result);
            }
            $rootScope.$broadcast('updateFtpSettings-onresult');
        });
    }

    return DataService;
}
])


