#!/usr/bin/env node
/**
 * TestAdvertiserReportLogEventItems.js, Test of TUNE Reporting API.
 *
 * @module tune-reporting
 * @submodule test
 * @main tune-reporting
 *
 * @category  tune-reporting-node
 *
 * @author    Jeff Tanner <jefft@tune.com>
 * @copyright 2015 TUNE, Inc. (http://www.tune.com)
 * @license   http://opensource.org/licenses/MIT The MIT License (MIT)
 * @version   $Date: 2015-04-07 15:04:18 $
 * @link      http://developers.mobileapptracking.com @endlink
 */
"use strict";

require('../lib/helpers/Date');

var
  config = require('../config.js'),
  tuneReporting = require('../lib'),
  AdvertiserReportLogEventItems = tuneReporting.api.AdvertiserReportLogEventItems,
  EndpointBase = tuneReporting.base.endpoints.EndpointBase,
  SessionAuthenticate = tuneReporting.api.SessionAuthenticate,
  expect = require('chai').expect;

describe('test AdvertiserReportLogEventItems', function () {
  this.timeout(10000);
  var
    advertiserReport,
    csvJobId,
    apiKey,
    authKey,
    authType,
    sessionAuthenticate = new SessionAuthenticate(),
    sessionToken,

    startDate = new Date().setYesterday().setStartTime().getIsoDateTime(),
    endDate = new Date().setYesterday().setEndTime().getIsoDateTime(),

    strResponseTimezone = 'America/Los_Angeles',
    arrayFieldsRecommended = null;

  before(function (done) {
    apiKey = process.env.API_KEY;
    expect(apiKey).to.be.not.null;
    expect(apiKey).to.be.a('string');
    expect(apiKey).to.be.not.empty;

    advertiserReport = new AdvertiserReportLogEventItems();

    sessionAuthenticate.getSessionToken(apiKey, function (error, response) {
      if (error) {
        done(error);
      }

      expect(response.getHttpCode()).eql(200);
      sessionToken = response.toJson().responseJson.data;
      
      expect(sessionToken).to.be.not.null;

      config.set('tune.reporting.auth_key', sessionToken);
      config.set('tune.reporting.auth_type', 'session_token');

      done();
    });
  });
  
  it('report created', function (done) {
    expect(advertiserReport).to.be.not.null;
    done();
  });

  it('session_token', function (done) {
    authKey = config.get('tune.reporting.auth_key');
    authType = config.get('tune.reporting.auth_type');
    expect(authKey).to.be.not.null;
    expect(authType).to.be.not.null;
    expect(authType).to.equal('session_token');
    done();
  });

  it('fields all', function (done) {
    advertiserReport.getFields(
      EndpointBase.TUNE_FIELDS_ALL,
      function (error, response) {
        expect(error).to.be.null;
        expect(response).to.be.not.null;
        done();
      }
    );
  });

  it('fields recommended', function (done) {
    advertiserReport.getFields(
      EndpointBase.TUNE_FIELDS_RECOMMENDED,
      function (error, response) {
        expect(error).to.be.null;
        expect(response).to.be.not.null;
        arrayFieldsRecommended = response;
        expect(arrayFieldsRecommended).to.be.not.empty;
        done();
      }
    );
  });

  it('count', function (done) {
    var
      mapParams = {
        'start_date': startDate,
        'end_date': endDate,
        'filter': null,
        'response_timezone': strResponseTimezone
      };

    advertiserReport.count(
      mapParams,
      function (error, response) {
        expect(error).to.be.null;
        expect(response).to.be.not.null;
        expect(response.getHttpCode()).eql(200);
        done();
      }
    );
  });

  it('find', function (done) {
    expect(arrayFieldsRecommended).to.be.not.null;
    expect(arrayFieldsRecommended).to.be.not.empty;

    var
      mapParams = {
        'start_date': startDate,
        'end_date': endDate,
        'fields': arrayFieldsRecommended,
        'filter': null,
        'limit': 5,
        'page': null,
        'sort': { 'created': 'DESC' },
        'response_timezone': strResponseTimezone
      };

    advertiserReport.find(
      mapParams,
      function (error, response) {
        expect(error).to.be.null;
        expect(response).to.be.not.null;
        expect(response.getHttpCode()).eql(200);
        done();
      }
    );
  });

  it('export CSV', function (done) {

    var
      mapParams = {
        'start_date': startDate,
        'end_date': endDate,
        'fields': arrayFieldsRecommended,
        'filter': null,
        'format': 'csv',
        'response_timezone': strResponseTimezone
      };

    advertiserReport.export(
      mapParams,
      function (error, response) {
        expect(error).to.be.null;
        expect(response).to.be.not.null;
        expect(response.getHttpCode()).eql(200);

        csvJobId = response.toJson().responseJson.data;
        expect(csvJobId).to.be.not.null;
        expect(csvJobId).to.be.a('string');
        expect(csvJobId).to.be.not.empty;

        done();
      }
    );
  });

  it('statusCsvReport', function (done) {
    expect(csvJobId).to.be.not.null;
    expect(csvJobId).to.be.a('string');
    expect(csvJobId).to.be.not.empty;

    advertiserReport.status(
      csvJobId,
      function (error, response) {
        expect(error).to.be.null;
        expect(response).to.be.not.null;
        expect(response.getHttpCode()).eql(200);
        done();
      }
    );
  });
});